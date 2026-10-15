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

// API_KEY is the admin key (full access, as before). Other people get their own key via an
// invite: it is confined to its own folder u-<id>/ and capped by a quota.
const USERS_PATH = path.join(__dirname, 'keys.json');
const USER_QUOTA_BYTES = Number(process.env.USER_QUOTA_MB || 100) * 1024 * 1024;
const USER_MAX_FILE_BYTES = Number(process.env.USER_MAX_FILE_MB || 5) * 1024 * 1024;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://tools.zaes.dev,http://localhost:3000')
  .split(',').map((s) => s.trim()).filter(Boolean);

app.set('trust proxy', true); // behind Cloudflare: req.ip is the visitor

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

// Besides images (converted), a few document types are stored as they are.
const DOC_EXTS = ['pdf', 'txt', 'md', 'json', 'csv'];
const NOT_ALLOWED = 'Only images, PDF and text files (txt, md, json, csv) are allowed';
const extOf = (file) => path.extname(file.originalname || '').slice(1).toLowerCase();
const isDoc = (file) => !file.mimetype.startsWith('image/') && DOC_EXTS.includes(extOf(file));
const fileFilter = (req, file, cb) => (file.mimetype.startsWith('image/') || DOC_EXTS.includes(extOf(file)) ? cb(null, true) : cb(new Error(NOT_ALLOWED)));
const STORED_EXT_RE = /\.(webp|png|pdf|txt|md|json|csv)$/i;

// Returns a problem description, or '' when the bytes really are what the extension says.
function docProblem(buffer, ext) {
  if (ext === 'pdf') return buffer.subarray(0, 5).toString('latin1') === '%PDF-' ? '' : 'That is not a PDF file';
  if (buffer.includes(0)) return 'That is not a text file';
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return 'Text files must be UTF-8';
  }
  return '';
}

// Accept uploads in memory, cap at 25MB (admin)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter,
});

function safeCompareKey(token) {
  if (!token) return false;
  const a = Buffer.from(token.padEnd(64));
  const b = Buffer.from(API_KEY.padEnd(64));
  return a.length === b.length && crypto.timingSafeEqual(a, b) && token === API_KEY;
}

// --- Users and invites (keys.json) ----------------------------------------
// Only hashes are stored: a leaked file reveals no usable key or invite code.
//   users:   { <id>: { label, keyHash, createdAt } }
//   invites: { <inviteId>: { label, codeHash, createdAt } }
let store = { users: {}, invites: {} };

function loadStore() {
  try {
    if (fs.existsSync(USERS_PATH)) store = { users: {}, invites: {}, ...JSON.parse(fs.readFileSync(USERS_PATH, 'utf8')) };
  } catch (err) {
    console.error('FATAL: keys.json is unreadable:', err.message);
    process.exit(1); // starting empty would silently revoke every key
  }
}

function saveStore() {
  const tmp = `${USERS_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, USERS_PATH);
}

loadStore();

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const newSecret = (prefix) => `${prefix}_${crypto.randomBytes(24).toString('hex')}`;

function findUserByKey(token) {
  const hash = sha256(token);
  return Object.entries(store.users).find(([, u]) => u.keyHash === hash)?.[0] ?? null;
}

// Auth: Authorization: Bearer <key>. Sets req.principal = { admin: true } or { id, label }.
function authenticate(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  if (safeCompareKey(token)) return { admin: true };
  const id = findUserByKey(token);
  return id ? { admin: false, id, label: store.users[id].label } : null;
}

// Remember when a key was last used (the admin view shows it). Written at most every 5 minutes per user.
const TOUCH_EVERY_MS = 5 * 60 * 1000;
function touchUser(id) {
  const user = store.users[id];
  if (!user || Date.now() - new Date(user.lastUsedAt || 0).getTime() < TOUCH_EVERY_MS) return;
  user.lastUsedAt = new Date().toISOString();
  try {
    saveStore();
  } catch (err) {
    console.error('Failed to record key use:', err.message);
  }
}

function requireApiKey(req, res, next) {
  req.principal = authenticate(req);
  if (!req.principal) return res.status(401).json({ error: 'Unauthorized' });
  if (!req.principal.admin) touchUser(req.principal.id);
  next();
}

function requireAdmin(req, res, next) {
  requireApiKey(req, res, () => {
    if (!req.principal.admin) return res.status(403).json({ error: 'Admin key required' });
    next();
  });
}

// CORS: the generator at tools.zaes.dev uploads from the browser. Keys travel in a header, not cookies.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// A user's own folder, and what they may see or touch.
const userRoot = (id) => `u-${id}`;
const ownsPath = (principal, rel) => principal.admin || rel === userRoot(principal.id) || rel.startsWith(`${userRoot(principal.id)}/`);

function folderBytes(dir) {
  if (!fs.existsSync(path.join(UPLOAD_DIR, dir))) return { bytes: 0, files: 0 };
  const imgs = listImages(dir);
  return { bytes: imgs.reduce((n, f) => n + f.size, 0), files: imgs.length };
}

// Registration is public (an invite is the gate), so cap attempts per visitor.
const attempts = new Map();
function tooManyAttempts(ip, limit = 10, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > limit;
}

// --- Folders and named files ---------------------------------------------
// A folder is up to MAX_FOLDER_DEPTH segments of [a-zA-Z0-9_-], joined by "/".
// Validated, never sanitised: anything outside the alphabet is refused, so there
// is no traversal to get past. A "name" gives a file a stable path
// (<folder>/<name>.webp) that uploads overwrite in place -- same URL, new bytes.
const MAX_FOLDER_DEPTH = 3;
const SEGMENT = /^[a-zA-Z0-9_-]{1,64}$/;

// Returns '' (root), a clean "a/b" string, or null when invalid.
function parseFolder(raw, maxDepth = MAX_FOLDER_DEPTH) {
  if (raw === undefined || raw === null || raw === '') return '';
  if (typeof raw !== 'string') return null;
  const parts = raw.split('/');
  if (parts.length > maxDepth || !parts.every((p) => SEGMENT.test(p))) return null;
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
    && /^[a-zA-Z0-9_-]+\.(webp|png|pdf|txt|md|json|csv)$/.test(file);
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
    else if (STORED_EXT_RE.test(entry.name)) {
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
// Documents are never rendered as pages: text types are served as text, with nosniff and (not for PDFs, which Chrome then refuses to show) a sandbox CSP.
app.use('/i', express.static(UPLOAD_DIR, {
  maxAge: '30d',
  immutable: true,
  setHeaders: (res, file) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (/\.(txt|md|csv)$/i.test(file)) res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    else if (/\.json$/i.test(file)) res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (/\.(txt|md|csv|json)$/i.test(file)) res.setHeader('Content-Security-Policy', "sandbox; default-src 'none'");
  },
}));

// Serve the gallery admin page (static, auth happens client-side against the API)
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const userUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: USER_MAX_FILE_BYTES },
  fileFilter,
});
const chooseUpload = (req, res, next) => (req.principal.admin ? upload : userUpload).single('file')(req, res, next);

app.post('/upload', requireApiKey, chooseUpload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded (expected field name "file")' });
  }

  // folder / name / format come from the form fields or, for simple clients, the query.
  const rawFolder = req.body?.folder ?? req.query.folder;
  const name = parseName(req.body?.name ?? req.query.name);
  const doc = isDoc(req.file);
  // `format` is what an image is converted to; a document keeps its own extension.
  const format = doc ? extOf(req.file) : req.body?.format ?? req.query.format ?? 'webp';
  const { principal } = req;

  // A user's files live under u-<id>/, with at most two folder levels of their own beneath it.
  const maxDepth = principal.admin ? MAX_FOLDER_DEPTH : MAX_FOLDER_DEPTH - 1;
  const sub = parseFolder(rawFolder, maxDepth);
  if (sub === null) {
    return res.status(400).json({ error: `Invalid folder (up to ${maxDepth} segments of letters, digits, _ or -, joined by /)` });
  }
  if (name === null) {
    return res.status(400).json({ error: 'Invalid name (letters, digits, _ or - only; no extension)' });
  }
  if (!doc && format !== 'webp' && format !== 'png') {
    return res.status(400).json({ error: 'Invalid format (webp or png)' });
  }
  const problem = doc ? docProblem(req.file.buffer, format) : '';
  if (problem) return res.status(400).json({ error: problem });
  const folder = principal.admin ? sub : [userRoot(principal.id), sub].filter(Boolean).join('/');

  try {
    const contentHash = hashBuffer(req.file.buffer);
    const prefix = folder ? `${folder}/` : '';
    // Dedupe is per folder and format, so the same bytes in two folders are two files.
    const hashKey = `${folder ? `${folder}:` : ''}${contentHash}${format === 'webp' ? '' : `:${format}`}`;

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

    const filename = `${prefix}${name || crypto.randomBytes(8).toString('hex')}.${format}`;
    const outputPath = path.join(UPLOAD_DIR, filename);
    const existed = fs.existsSync(outputPath);

    const output = doc
      ? req.file.buffer
      : await (format === 'png' ? sharp(req.file.buffer).png() : sharp(req.file.buffer).webp({ quality: 85 })).toBuffer();

    if (!principal.admin) {
      const replaced = existed ? fs.statSync(outputPath).size : 0;
      const { bytes } = folderBytes(userRoot(principal.id));
      if (bytes - replaced + output.length > USER_QUOTA_BYTES) {
        return res.status(413).json({ error: `Storage quota exceeded (${Math.round(USER_QUOTA_BYTES / 1024 / 1024)} MB). Delete some files first.` });
      }
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    // Write beside, then rename: a reader never sees a half-written file.
    const tmpPath = `${outputPath}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    fs.writeFileSync(tmpPath, output);
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
      size: output.length,
    });
  } catch (err) {
    console.error('Conversion error:', err);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Who am I, and how much room is left (the generator shows this after connecting).
app.get('/api/me', requireApiKey, (req, res) => {
  const { principal } = req;
  if (principal.admin) return res.json({ success: true, admin: true });
  const { bytes, files } = folderBytes(userRoot(principal.id));
  res.json({ success: true, admin: false, id: principal.id, label: principal.label, usedBytes: bytes, quotaBytes: USER_QUOTA_BYTES, files, maxFileBytes: USER_MAX_FILE_BYTES });
});

// --- Invites and registration ----------------------------------------------
// Admin creates an invite code (shown once); the invitee redeems it for their own key (shown once).
app.post('/api/invites', requireAdmin, (req, res) => {
  const label = String(req.body?.label ?? '').trim().slice(0, 60);
  const code = newSecret('inv');
  const id = crypto.randomBytes(4).toString('hex');
  store.invites[id] = { label, codeHash: sha256(code), createdAt: new Date().toISOString() };
  saveStore();
  res.json({ success: true, id, code, label });
});

app.get('/api/invites', requireAdmin, (req, res) => {
  res.json({ success: true, invites: Object.entries(store.invites).map(([id, i]) => ({ id, label: i.label, createdAt: i.createdAt })) });
});

app.delete('/api/invites/:id', requireAdmin, (req, res) => {
  if (!store.invites[req.params.id]) return res.status(404).json({ error: 'Invite not found' });
  delete store.invites[req.params.id];
  saveStore();
  res.json({ success: true });
});

app.post('/api/register', (req, res) => {
  if (tooManyAttempts(req.ip)) return res.status(429).json({ error: 'Too many attempts, try again later' });
  const code = typeof req.body?.invite === 'string' ? req.body.invite.trim() : '';
  const codeHash = sha256(code);
  const found = code && Object.entries(store.invites).find(([, i]) => i.codeHash === codeHash);
  if (!found) return res.status(400).json({ error: 'Invalid or already used invite code' });

  const [inviteId, invite] = found;
  const label = String(req.body?.label ?? '').trim().slice(0, 60) || invite.label || 'user';
  const id = crypto.randomBytes(5).toString('hex');
  const key = newSecret('zup');
  store.users[id] = { label, keyHash: sha256(key), createdAt: new Date().toISOString() };
  delete store.invites[inviteId]; // one use
  saveStore();
  res.json({ success: true, id, label, key });
});

app.get('/api/users', requireAdmin, (req, res) => {
  const users = Object.entries(store.users).map(([id, u]) => ({ id, label: u.label, createdAt: u.createdAt, lastUsedAt: u.lastUsedAt || null, ...folderBytes(userRoot(id)) }));
  res.json({ success: true, quotaBytes: USER_QUOTA_BYTES, users });
});

// Revokes the key. Their files stay until deleted via /api/folders/u-<id>.
app.delete('/api/users/:id', requireAdmin, (req, res) => {
  if (!store.users[req.params.id]) return res.status(404).json({ error: 'User not found' });
  delete store.users[req.params.id];
  saveStore();
  res.json({ success: true });
});

// List all stored images — newest first
app.get('/api/images', requireApiKey, (req, res) => {
  try {
    const { principal } = req;
    const files = (principal.admin ? listImages() : fs.existsSync(path.join(UPLOAD_DIR, userRoot(principal.id))) ? listImages(userRoot(principal.id)) : [])
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
  if (!ownsPath(req.principal, filename)) {
    return res.status(403).json({ error: 'Not your file' });
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

// Delete a folder and everything in it (subfolders included).
// Returns what was removed so the gallery can say so.
app.delete('/api/folders/*', requireApiKey, (req, res) => {
  const folder = parseFolder(req.params[0]);
  if (!folder) {
    return res.status(400).json({ error: 'Invalid folder' });
  }
  if (!ownsPath(req.principal, folder) || (!req.principal.admin && folder === userRoot(req.principal.id))) {
    return res.status(403).json({ error: 'Not your folder' });
  }

  const dirPath = path.join(UPLOAD_DIR, folder);
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  try {
    const removed = listImages(folder).length;
    fs.rmSync(dirPath, { recursive: true, force: true });

    for (const [hash, stored] of Object.entries(hashStore)) {
      if (stored.startsWith(`${folder}/`)) delete hashStore[hash];
    }
    saveHashStore();

    // Tidy up parents this left empty (never the root).
    for (let dir = path.dirname(dirPath); dir !== UPLOAD_DIR; dir = path.dirname(dir)) {
      if (fs.readdirSync(dir).length) break;
      fs.rmdirSync(dir);
    }

    res.json({ success: true, folder, removed });
  } catch (err) {
    console.error('Folder delete error:', err);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// Multer error handler (file too big, wrong type, etc.)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === NOT_ALLOWED) {
    return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Upload service running on port ${PORT}`);
});
