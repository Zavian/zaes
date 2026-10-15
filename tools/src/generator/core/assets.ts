// Icons (game-icons.net, CC BY 3.0) are not bundled: the full set is 20-45MB. They are loaded on demand from an
// icon host that serves, in one flat folder:
//
//   <ICON_BASE>/index.json        manifest listing every icon (the app fetches this; the list is not hardcoded)
//   <ICON_BASE>/<name>.<ICON_EXT> the images (must send CORS headers: image export needs them)
//
// The zaes-icons repo (icon host + list API + scripts/update-icons.mjs) builds and serves exactly that folder at
// https://icons.zaes.dev. Override at build time with VITE_ICON_BASE / VITE_ICON_EXT (for example to test a local host).
const env = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}) as Record<string, string | undefined>;

export const ICON_BASE = (env.VITE_ICON_BASE || 'https://icons.zaes.dev/icons').replace(/\/$/, '');
export const ICON_EXT = (env.VITE_ICON_EXT || 'webp').replace(/^\./, '');

export const iconUrl = (name: string) => `${ICON_BASE}/${name}.${ICON_EXT}`;
export const ICON_MANIFEST_URL = `${ICON_BASE}/index.json`;
export const ICON_FALLBACK_LIST_URL = '/generator-assets/icons.json';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const ICON_URL_RE = new RegExp(`${escapeRe(ICON_BASE)}/[A-Za-z0-9_-]+\\.${escapeRe(ICON_EXT)}`, 'g');
