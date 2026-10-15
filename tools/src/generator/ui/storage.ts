import { Card, DEFAULT_OPTIONS, DeckOptions } from '../core/types';
import { normalizeCard } from '../core/normalize';

const KEY = 'zaes_rpg_cards_v1';

export interface StoredDeck {
  cards: Card[];
  options: DeckOptions;
  selected: number;
}

// Local storage can be missing, full or blocked; the generator must work without it.
export function loadDeck(): StoredDeck | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      cards: Array.isArray(data.cards) ? data.cards.map(normalizeCard) : [],
      options: { ...DEFAULT_OPTIONS, ...(data.options ?? {}) },
      selected: Number.isInteger(data.selected) ? data.selected : 0,
    };
  } catch {
    return null;
  }
}

export function saveDeck(deck: StoredDeck): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(deck));
    return true;
  } catch {
    return false;
  }
}

const UPLOAD_KEY = 'zaes_rpg_export_history';
export const loadHistory = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(UPLOAD_KEY) || '[]');
    return Array.isArray(v) ? v.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
};
export const saveHistory = (lines: string[]) => {
  try {
    localStorage.setItem(UPLOAD_KEY, JSON.stringify(lines.slice(0, 200)));
  } catch {
    /* ignore */
  }
};

// Upload links remembered per card *content*: the id is a hash of the rendered front and back, so links come back
// when you return to an unchanged card (even after a reload) and disappear as soon as the card is edited.
export interface CardLinks {
  front: string;
  back: string;
}
const LINKS_KEY = 'zaes_rpg_card_links';

export function contentId(front: string, back: string): string {
  let h = 0x811c9dc5; // FNV-1a
  for (const ch of `${front}\u0000${back}`) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

export const loadLinks = (): Record<string, CardLinks> => {
  try {
    const v = JSON.parse(localStorage.getItem(LINKS_KEY) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
};

export const saveLink = (id: string, links: CardLinks) => {
  try {
    const all = { ...loadLinks(), [id]: links };
    const ids = Object.keys(all);
    for (const old of ids.slice(0, Math.max(ids.length - 300, 0))) delete all[old]; // keep the newest 300
    localStorage.setItem(LINKS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
};

const FORMAT_KEY = 'zaes_upload_format';
export const loadFormat = (): 'webp' | 'png' => {
  try {
    return localStorage.getItem(FORMAT_KEY) === 'png' ? 'png' : 'webp';
  } catch {
    return 'webp';
  }
};
export const saveFormat = (f: 'webp' | 'png') => {
  try {
    localStorage.setItem(FORMAT_KEY, f);
  } catch {
    /* ignore */
  }
};
