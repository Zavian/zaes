import { CSS_COLORS } from './cssColors';

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

// Resolve '#abc', '#aabbcc', 'indigo' (any case) or 'rgb(1,2,3)' to '#rrggbb'. Returns null when unknown.
export function toHex(color: string | undefined | null): string | null {
  if (!color) return null;
  const value = color.trim().toLowerCase();
  if (CSS_COLORS[value]) return CSS_COLORS[value];
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(value);
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
  if (/^#[0-9a-f]{6}$/.test(value)) return value;
  const rgb = /^rgb\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})\s*\)$/.exec(value);
  if (rgb) {
    const h = (n: string) => Math.min(255, Number(n)).toString(16).padStart(2, '0');
    return `#${h(rgb[1])}${h(rgb[2])}${h(rgb[3])}`;
  }
  return null;
}

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Value for the `--card-color` custom property ("r g b", used as rgb(var(--card-color))).
export function cardColorTriplet(color: string | undefined | null): string {
  const { r, g, b } = hexToRgb(toHex(color) ?? '#000000');
  return `${r} ${g} ${b}`;
}

// Preset colors from the original generator (rarities and classes).
export const COLOR_PALETTE: Record<string, string> = {
  Uncommon: '#008000',
  Rare: '#000080',
  'Very Rare': '#8a2be2',
  Legendary: '#c46709',
  Scroll: '#4a6898',
  Recipe: '#a48965',
  Barbarian: '#e9623e',
  Paladin: '#b7a156',
  Bard: '#ab6cac',
  Ranger: '#4f7f63',
  Cleric: '#90a1b3',
  Rogue: '#555752',
  Druid: '#79853c',
  Sorcerer: '#992d2f',
  Fighter: '#7f513d',
  Warlock: '#7c469b',
  Monk: '#4ea5c5',
  Wizard: '#274fa2',
  Artificer: '#aa6dab',
};
