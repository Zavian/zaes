// Builds src/wow/addons.json from GitHub (GITHUB_TOKEN env, else `gh auth token`): every non-archived repo of the owner
// whose root has a .toc file is an addon. Also zips each addon's default branch into public/addons/
// (gitignored; the site serves them, repos stay private). Nothing depends on what is installed locally.
// Skip repos by listing their names in scripts/addons-hidden.txt (one per line).
// Usage: node scripts/sync-addons.mjs [owner]
import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const owner = process.argv[2] ?? 'Zavian';
const out = async (cmd, ...args) => (await run(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })).stdout.trim();
const token = process.env.GITHUB_TOKEN || (await out('gh', 'auth', 'token'));
const api = async (path, raw = false) => {
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return raw ? res.text() : res.json();
};
// Token goes to git through env, so it never shows up in argv or error messages.
const gitEnv = {
  ...process.env,
  GIT_CONFIG_COUNT: '1',
  GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader',
  GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${token}`).toString('base64')}`,
};

const hidden = new Set(
  readFileSync(new URL('./addons-hidden.txt', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#')),
);
const zipDir = new URL('../public/addons/', import.meta.url);
const tmp = mkdtempSync(join(tmpdir(), 'addons-'));
rmSync(zipDir, { recursive: true, force: true });
mkdirSync(zipDir, { recursive: true });

const tocField = (toc, key) => {
  const m = toc.match(new RegExp(`^## ${key}:\\s*(.*)$`, 'mi'));
  return m ? m[1].trim().replace(/\|c[0-9a-f]{8}|\|r/gi, '') : '';
};

async function listRepos() {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await api(`user/repos?affiliation=owner&per_page=100&page=${page}`);
    repos.push(...batch.filter((r) => r.owner.login === owner));
    if (batch.length < 100) return repos;
  }
}

async function readAddon({ name, default_branch: branch }) {
  const files = (await api(`repos/${owner}/${name}/contents?ref=${branch}`)).map((f) => f.name);
  const tocFile = files.find((f) => f.toLowerCase().endsWith('.toc'));
  if (!tocFile) return null;

  const [toc, updated] = await Promise.all([
    api(`repos/${owner}/${name}/contents/${encodeURIComponent(tocFile)}?ref=${branch}`, true),
    api(`repos/${owner}/${name}/commits/${branch}`).then((c) => c.commit.committer.date),
  ]);

  const clone = join(tmp, name);
  await run('git', ['clone', '--depth', '1', '--quiet', '--branch', branch, `https://github.com/${owner}/${name}.git`, clone], { env: gitEnv });
  await out('git', '-C', clone, 'archive', '--format=zip', `--prefix=${name}/`, '-o', fileURLToPath(new URL(`${name}.zip`, zipDir)), 'HEAD');

  return {
    name,
    title: tocField(toc, 'Title') || name,
    notes: tocField(toc, 'Notes'),
    version: tocField(toc, 'Version'),
    repo: `${owner}/${name}`,
    branch,
    updated,
  };
}

try {
  const candidates = (await listRepos()).filter((r) => !r.archived && !hidden.has(r.name));
  const addons = (await Promise.all(candidates.map(readAddon))).filter(Boolean);
  addons.sort((a, b) => b.updated.localeCompare(a.updated));
  writeFileSync(new URL('../src/wow/addons.json', import.meta.url), JSON.stringify({ generated: new Date().toISOString(), addons }, null, 2) + '\n');
  console.log(`checked ${candidates.length} repos, wrote ${addons.length} addons:\n  ${addons.map((a) => a.name).join('\n  ')}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
