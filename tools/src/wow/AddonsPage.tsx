import React, { useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import data from './addons.json';
import external from './external.json';
import { buildCmd, type Addon } from './cmd';

const addons = data.addons as Addon[];

const ago = (iso: string): string => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const STORE = 'wow-addons-skipped';

const loadSkipped = (): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE) ?? '[]'));
  } catch {
    return new Set();
  }
};

function download(selected: Addon[]) {
  const url = URL.createObjectURL(new Blob([buildCmd(selected)], { type: 'application/octet-stream' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'update-wow-addons.cmd' });
  a.click();
  URL.revokeObjectURL(url);
}

export default function AddonsPage() {
  const [skipped, setSkipped] = useState(loadSkipped);
  const selected = addons.filter((a) => !skipped.has(a.name));

  const update = (next: Set<string>) => {
    setSkipped(next);
    try {
      localStorage.setItem(STORE, JSON.stringify([...next]));
    } catch {
      /* selection just won't persist */
    }
  };
  const toggle = (name: string) => {
    const next = new Set(skipped);
    if (!next.delete(name)) next.add(name);
    update(next);
  };

  const linkBtn = 'text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      <p className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">World of Warcraft</p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">WoW Addons</h1>
      <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mb-2">Every addon I wrote, newest update first.</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mb-6">
        Tick the ones you want, download the script, save it in <code className="font-mono">Interface\AddOns</code> and run it. It downloads the latest
        version of each ticked addon and replaces the old files. No git or account needed.
      </p>

      <div className="sticky top-16 z-30 -mx-2 px-4 py-3 mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded border border-gray-200 dark:border-[#2E333D] bg-white/95 dark:bg-[#181A20]/95 backdrop-blur">
        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
          <strong>{selected.length}</strong> of {addons.length} selected
        </span>
        <button onClick={() => update(new Set())} className={linkBtn}>
          Select all
        </button>
        <button onClick={() => update(new Set(addons.map((a) => a.name)))} className={linkBtn}>
          Select none
        </button>
        <button
          onClick={() => download(selected)}
          disabled={selected.length === 0}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" /> Download .cmd
        </button>
      </div>

      <ul className="grid gap-3">
        {addons.map((a) => (
          <li key={a.name}>
            <label className="flex items-start gap-4 p-4 cursor-pointer rounded border border-gray-200 dark:border-[#2E333D] bg-white dark:bg-[#181A20] opacity-60 hover:opacity-100 transition has-[:checked]:opacity-100 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-950/30">
              <input
                type="checkbox"
                checked={!skipped.has(a.name)}
                onChange={() => toggle(a.name)}
                className="mt-1 w-5 h-5 accent-emerald-700 shrink-0 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-lg">
                    {a.title}
                    {a.version && <span className="ml-2 text-xs font-mono font-normal text-gray-500 dark:text-gray-400">v{a.version}</span>}
                  </h2>
                  <a
                    href={`https://github.com/${a.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${a.name} on GitHub`}
                    className="mt-1.5 text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {a.name} · updated {ago(a.updated)}
                </p>
                {a.notes && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{a.notes}</p>}
              </div>
            </label>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 mb-3 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Also on CurseForge</h2>
      <ul className="grid gap-3">
        {external.map((e) => (
          <li key={e.url}>
            <a
              href={e.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-3 p-4 rounded border border-gray-200 dark:border-[#2E333D] bg-white dark:bg-[#181A20] hover:border-emerald-600 dark:hover:border-emerald-400 transition-colors"
            >
              <div>
                <h3 className="font-bold text-lg">{e.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{e.notes}</p>
              </div>
              <ExternalLink className="w-4 h-4 mt-1.5 shrink-0 text-gray-400" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs font-mono text-gray-500 dark:text-gray-400">List refreshed {ago(data.generated)}.</p>
    </div>
  );
}
