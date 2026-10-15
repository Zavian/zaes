import { useEffect, useState } from 'react';
import { ICON_FALLBACK_LIST_URL, ICON_MANIFEST_URL } from '../core/assets';

export { iconUrl } from '../core/assets';

// Accepts a plain array of names, or the manifest written by scripts/update-icons.mjs
// ({ icons: ["name", ...] | [["name", "author"], ...] }).
export function parseIconList(data: unknown): string[] {
  const list = Array.isArray(data) ? data : (data as { icons?: unknown } | null)?.icons;
  if (!Array.isArray(list)) return [];
  return list
    .map((e) => (Array.isArray(e) ? e[0] : e))
    .filter((n): n is string => typeof n === 'string' && /^[A-Za-z0-9_-]+$/.test(n));
}

async function fetchList(url: string): Promise<string[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const names = parseIconList(await res.json());
  if (names.length === 0) throw new Error(`${url}: empty list`);
  return names;
}

let cache: Promise<string[]> | null = null;
export function loadIconNames(): Promise<string[]> {
  // Ask the icon host first; fall back to the bundled list so the picker still works if the host has no manifest yet.
  cache ??= fetchList(ICON_MANIFEST_URL)
    .catch(() => fetchList(ICON_FALLBACK_LIST_URL))
    .catch(() => {
      cache = null;
      return [] as string[];
    });
  return cache;
}

export function useIconNames(): string[] {
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => {
    let live = true;
    loadIconNames().then((n) => live && setNames(n));
    return () => {
      live = false;
    };
  }, []);
  return names;
}
