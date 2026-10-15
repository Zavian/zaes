import { useEffect, useState } from 'react';

export { iconUrl } from '../core/assets';

let cache: Promise<string[]> | null = null;
export function loadIconNames(): Promise<string[]> {
  cache ??= fetch('/generator-assets/icons.json')
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => {
      cache = null;
      return [];
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
