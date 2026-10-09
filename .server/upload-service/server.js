const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const HASH_STORE_PATH = path.join(__dirname, 'hashes.json');
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;

if (!API_KEY) {
  console.error('FATAL: API_KEY is not set in .env');
  process.exit(1);
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// --- Hash store: maps sha256(original upload bytes) -> stored .webp filename ---
// Lets us detect "you already uploaded this exact file" and hand back the
// existing URL instead of creating a duplicate.

let hashStore = {};

function loadHashStore() {
  try {
    if (fs.existsSync(HASH_STORE_PATH)) {
      hashStore = JSON.parse(fs.readFileSync(HASH_STORE_PATH, 'utf8'));
    }
  } catch (err) {
    console.error('Failed to load hash store, starting fresh:', err.message);
    hashStore = {};
  }
}

function saveHashStore() {
  try {
    fs.writeFileSync(HASH_STORE_PATH, JSON.stringify(hashStore, null, 2));
  } catch (err) {
    console.error('Failed to persist hash store:', err.message);
  }
}

loadHashStore();

// Accept uploads in memory, cap at 25MB, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

function safeCompareKey(token) {
  if (!token) return false;
  const a = Buffer.from(token.padEnd(64));
  const b = Buffer.from(API_KEY.padEnd(64));
  return a.length === b.length && crypto.timingSafeEqual(a, b) && token === API_KEY;
}

// Simple API key auth — checks header: Authorization: Bearer <key>
function requireApiKey(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!safeCompareKey(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// --- Folders and named files ---------------------------------------------
// A folder is up to MAX_FOLDER_DEPTH segments of [a-zA-Z0-9_-], joined by "/".
// Validated, never sanitised: anything outside the alphabet is refused, so there
// is no traversal to get past. A "name" gives a file a stable path
// (<folder>/<name>.webp) that uploads overwrite in place -- same URL, new bytes.
const MAX_FOLDER_DEPTH = 3;
const SEGMENT = /^[a-zA-Z0-9_-]{1,64}$/;

// Returns '' (root), a clean "a/b" string, or null when invalid.
function parseFolder(raw) {
  if (raw === undefined || raw === null || raw === '') return '';
  if (typeof raw !== 'string') return null;
  const parts = raw.split('/');
  if (parts.length > MAX_FOLDER_DEPTH || !parts.every((p) => SEGMENT.test(p))) return null;
  return parts.join('/');
}

// Returns a validated name (no extension) or null when invalid; undefined -> ''.
function parseName(raw) {
  if (raw === undefined || raw === null || raw === '') return '';
  return typeof raw === 'string' && SEGMENT.test(raw) ? raw : null;
}

// A stored file's path relative to UPLOAD_DIR: "file.webp" or "a/b/file.webp".
function isSafeRelPath(rel) {
  if (typeof rel !== 'string') return false;
  const parts = rel.split('/');
  const file = parts.pop();
  return parts.length <= MAX_FOLDER_DEPTH
    && parts.every((p) => SEGMENT.test(p))
    && /^[a-zA-Z0-9_-]+\.webp$/.test(file);
}

function dropHashesFor(rel) {
  for (const [hash, stored] of Object.entries(hashStore)) {
    if (stored === rel) delete hashStore[hash];
  }
}

function listImages(dir = '') {
  const out = [];
  for (const entry of fs.readdirSync(path.join(UPLOAD_DIR, dir), { withFileTypes: true })) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...listImages(rel));
    else if (entry.name.toLowerCase().endsWith('.webp')) {
      const stat = fs.statSync(path.join(UPLOAD_DIR, rel));
      out.push({ filename: rel, folder: dir, url: `${PUBLIC_BASE_URL}/i/${rel}`, size: stat.size, uploadedAt: stat.mtime });
    }
  }
  return out;
}

function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Serve uploaded images statically
app.use('/i', express.static(UPLOAD_DIR, {
  maxAge: '30d',
  immutable: true,
}));

// Serve the gallery admin page (static, auth happens client-side against the API)
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/upload', requireApiKey, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded (expected field name "file")' });
  }

  // folder / name come from the form fields or, for simple clients, the query.
  const folder = parseFolder(req.body?.folder ?? req.query.folder);
  const name = parseName(req.body?.name ?? req.query.name);
  if (folder === null) {
    return res.status(400).json({ error: `Invalid folder (up to ${MAX_FOLDER_DEPTH} segments of letters, digits, _ or -, joined by /)` });
  }
  if (name === null) {
    return res.status(400).json({ error: 'Invalid name (letters, digits, _ or - only; no extension)' });
  }

  try {
    const contentHash = hashBuffer(req.file.buffer);
    const prefix = folder ? `${folder}/` : '';
    // Dedupe is per folder, so the same bytes in two folders are two files.
    const hashKey = folder ? `${folder}:${contentHash}` : contentHash;

    // Unnamed upload: if these exact bytes are already stored here, hand back the
    // existing URL. A named upload never dedupes -- it targets one specific path.
    if (!name) {
      const existing = hashStore[hashKey];
      if (existing) {
        const existingPath = path.join(UPLOAD_DIR, existing);
        if (fs.existsSync(existingPath)) {
          return res.json({
            success: true,
            duplicate: true,
            updated: false,
            url: `${PUBLIC_BASE_URL}/i/${existing}`,
            filename: existing,
            folder,
            size: fs.statSync(existingPath).size,
          });
        }
        // Stale entry (file was deleted via the gallery) -- re-create it.
        delete hashStore[hashKey];
      }
    }

    const filename = `${prefix}${name || crypto.randomBytes(8).toString('hex')}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);
    const existed = fs.existsSync(outputPath);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    // Write beside, then rename: a reader never sees a half-written file.
    const tmpPath = `${outputPath}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    await sharp(req.file.buffer).webp({ quality: 85 }).toFile(tmpPath);
    fs.renameSync(tmpPath, outputPath);

    dropHashesFor(filename);
    hashStore[hashKey] = filename;
    saveHashStore();

    // Static files are served immutable for 30 days, so an overwritten file needs a
    // new URL to be seen: the content hash rides along as ?v=.
    const url = `${PUBLIC_BASE_URL}/i/${filename}${name ? `?v=${contentHash.slice(0, 10)}` : ''}`;

    res.json({
      success: true,
      duplicate: false,
      updated: Boolean(name) && existed,
      url,
      filename,
      folder,
      size: fs.statSync(outputPath).size,
    });
  } catch (err) {
    console.error('Conversion error:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// List all stored images — newest first
app.get('/api/images', requireApiKey, (req, res) => {
  try {
    const files = listImages()
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    const folders = [...new Set(files.map((f) => f.folder).filter(Boolean))].sort();

    res.json({ success: true, count: files.length, folders, images: files });
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

// Delete a single image by filename
app.delete('/api/images/*', requireApiKey, (req, res) => {
  const filename = req.params[0];

  if (!isSafeRelPath(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const filePath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    fs.unlinkSync(filePath);

    // Free up the hash entry so re-uploading the same bytes later
    // creates a fresh file instead of silently "succeeding" with nothing there.
    dropHashesFor(filename);
    saveHashStore();

    // Tidy up a folder this left empty (never the root).
    for (let dir = path.dirname(filePath); dir !== UPLOAD_DIR; dir = path.dirname(dir)) {
      if (fs.readdirSync(dir).length) break;
      fs.rmdirSync(dir);
    }

    res.json({ success: true, filename });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Multer error handler (file too big, wrong type, etc.)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Upload service running on port ${PORT}`);
});
