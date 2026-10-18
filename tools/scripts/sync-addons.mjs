// Scans the WoW AddOns folder for git repos and writes src/wow/addons.json.
// Also zips each addon's HEAD into public/addons/ (gitignored; the site serves them, repos stay private).
// Addons listed in scripts/addons-hidden.txt (one folder name per line) are skipped.
// Usage: node scripts/sync-addons.mjs [addonsDir]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = process.argv[2] ?? 'E:/Giochi/World of Warcraft/_classic_beta_/Interface/AddOns';
const git = (repo, ...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
const toc = (repo, key) => {
  const file = readdirSync(repo).find((f) => f.endsWith('.toc'));
  const m = file && readFileSync(join(repo, file), 'utf8').match(new RegExp(`^## ${key}:\s*(.*)$`, 'mi'));
  return m ? m[1].trim().replace(/\|c[0-9a-f]{8}|\|r/gi, '') : '';
};

const hidden = new Set(readFileSync(new URL('./addons-hidden.txt', import.meta.url), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')));
const zipDir = new URL('../public/addons/', import.meta.url);
rmSync(zipDir, { recursive: true, force: true });
mkdirSync(zipDir, { recursive: true });

const addons = [];
for (const name of readdirSync(dir)) {
  const repo = join(dir, name);
  if (hidden.has(name) || !existsSync(join(repo, '.git'))) continue;
  const remote = git(repo, 'remote', 'get-url', 'origin');
  const m = remote.match(/github\.com[/:]([^/]+\/[^/.]+)/);
  if (!m) continue;
  git(repo, 'archive', '--format=zip', `--prefix=${name}/`, '-o', fileURLToPath(new URL(`${name}.zip`, zipDir)), 'HEAD');
  addons.push({
    name,
    title: toc(repo, 'Title') || name,
    notes: toc(repo, 'Notes'),
    version: toc(repo, 'Version'),
    repo: m[1],
    branch: git(repo, 'branch', '--show-current') || 'main',
    updated: git(repo, 'log', '-1', '--format=%cI'),
  });
}
addons.sort((a, b) => b.updated.localeCompare(a.updated));
writeFileSync(new URL('../src/wow/addons.json', import.meta.url), JSON.stringify({ generated: new Date().toISOString(), addons }, null, 2) + '\n');
console.log(`wrote ${addons.length} addons`);
