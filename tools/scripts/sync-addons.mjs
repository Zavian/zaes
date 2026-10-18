// Builds src/wow/addons.json from GitHub (needs `gh` logged in): every non-archived repo of the owner
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
const gh = (...args) => out('gh', ...args);

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

async function readAddon({ name, defaultBranchRef }) {
  const branch = defaultBranchRef?.name ?? 'main';
  const files = JSON.parse(await gh('api', `repos/${owner}/${name}/contents?ref=${branch}`)).map((f) => f.name);
  const tocFile = files.find((f) => f.toLowerCase().endsWith('.toc'));
  if (!tocFile) return null;

  const [toc, updated] = await Promise.all([
    gh('api', `repos/${owner}/${name}/contents/${encodeURIComponent(tocFile)}?ref=${branch}`, '-H', 'Accept: application/vnd.github.raw'),
    gh('api', `repos/${owner}/${name}/commits/${branch}`, '--jq', '.commit.committer.date'),
  ]);

  const clone = join(tmp, name);
  await out('git', 'clone', '--depth', '1', '--quiet', '--branch', branch, `https://github.com/${owner}/${name}.git`, clone);
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
  const repos = JSON.parse(await gh('repo', 'list', owner, '--limit', '300', '--json', 'name,isArchived,defaultBranchRef'));
  const candidates = repos.filter((r) => !r.isArchived && !hidden.has(r.name));
  const addons = (await Promise.all(candidates.map(readAddon))).filter(Boolean);
  addons.sort((a, b) => b.updated.localeCompare(a.updated));
  writeFileSync(new URL('../src/wow/addons.json', import.meta.url), JSON.stringify({ generated: new Date().toISOString(), addons }, null, 2) + '\n');
  console.log(`checked ${candidates.length} repos, wrote ${addons.length} addons:\n  ${addons.map((a) => a.name).join('\n  ')}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
