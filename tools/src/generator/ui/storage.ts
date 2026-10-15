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
