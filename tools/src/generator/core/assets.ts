// Icons (game-icons.net, CC BY 3.0) are not bundled: they are ~45MB. They are loaded on demand from the
// original generator's GitHub Pages site, which already hosts them (with CORS enabled, which image export needs).
// Keep that site (or change this base URL) for as long as the new generator should show icons.
export const ICON_BASE = 'https://zavian.github.io/generator/icons';

export const iconUrl = (name: string) => `${ICON_BASE}/${name}.png`;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const ICON_URL_RE = new RegExp(`${escapeRe(ICON_BASE)}/[A-Za-z0-9_-]+\\.png`, 'g');
