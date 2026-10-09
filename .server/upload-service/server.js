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

// Only allow plain filenames (no path traversal via ../ etc.)
function isSafeFilename(name) {
  return typeof name === 'string' && /^[a-zA-Z0-9_-]+\.webp$/.test(name);
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

  try {
    const contentHash = hashBuffer(req.file.buffer);
    const existingFilename = hashStore[contentHash];

    // If we've seen these exact bytes before AND the file is still on disk,
    // just hand back the existing URL instead of storing a duplicate.
    if (existingFilename) {
      const existingPath = path.join(UPLOAD_DIR, existingFilename);
      if (fs.existsSync(existingPath)) {
        return res.json({
          success: true,
          duplicate: true,
          url: `${PUBLIC_BASE_URL}/i/${existingFilename}`,
          filename: existingFilename,
          size: fs.statSync(existingPath).size,
        });
      }
      // Stale entry (file was deleted via the gallery) — fall through and re-create it.
      delete hashStore[contentHash];
    }

    const filename = `${crypto.randomBytes(8).toString('hex')}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    await sharp(req.file.buffer)
      .webp({ quality: 85 })
      .toFile(outputPath);

    hashStore[contentHash] = filename;
    saveHashStore();

    const url = `${PUBLIC_BASE_URL}/i/${filename}`;

    res.json({
      success: true,
      duplicate: false,
      url,
      filename,
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
    const files = fs.readdirSync(UPLOAD_DIR)
      .filter((f) => f.toLowerCase().endsWith('.webp'))
      .map((filename) => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, filename));
        return {
          filename,
          url: `${PUBLIC_BASE_URL}/i/${filename}`,
          size: stat.size,
          uploadedAt: stat.mtime,
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({ success: true, count: files.length, images: files });
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

// Delete a single image by filename
app.delete('/api/images/:filename', requireApiKey, (req, res) => {
  const { filename } = req.params;

  if (!isSafeFilename(filename)) {
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
    for (const [hash, storedFilename] of Object.entries(hashStore)) {
      if (storedFilename === filename) {
        delete hashStore[hash];
        break;
      }
    }
    saveHashStore();

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
