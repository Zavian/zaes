import { pruneImages } from './image';
import { Card } from './types';

export class DeckParseError extends Error {}

const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((v) => (v == null ? '' : String(v)));
  if (typeof value === 'string') return value.split('\n');
  return [];
};

// Mirrors the original `card_init` (fill in missing arrays/title) and adds light type coercion,
// so older saves, hand-written JSON and the "Import by JSON" payloads all load the same way.
export function normalizeCard(raw: unknown): Card {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new DeckParseError('A card must be a JSON object.');
  }
  const src = raw as Record<string, unknown>;
  const card: Card = {
    ...src,
    count: Math.max(0, Math.floor(Number(src.count))) || (src.count === 0 ? 0 : 1),
    title: src.title == null ? '' : String(src.title),
    contents: asStringArray(src.contents),
    back_contents: asStringArray(src.back_contents),
    tags: asStringArray(src.tags).map((t) => t.trim()).filter(Boolean),
  };
  if (src.title_size != null && src.title_size !== '') card.title_size = String(src.title_size);
  else delete card.title_size;
  if ('background_text_toggle' in src) card.background_text_toggle = Boolean(src.background_text_toggle);
  return card;
}

// Accepts what the original generator wrote (an array of cards) plus a single card or `{ cards: [...] }`.
export function parseDeck(json: string | unknown): Card[] {
  let data: unknown = json;
  if (typeof json === 'string') {
    try {
      data = JSON.parse(json.replace(/^﻿/, ''));
    } catch (e) {
      throw new DeckParseError(`That is not valid JSON (${(e as Error).message}).`);
    }
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.cards)) data = obj.cards;
    else data = [obj];
  }
  if (!Array.isArray(data)) throw new DeckParseError('Expected an array of cards.');
  return data.map((c, i) => {
    try {
      return normalizeCard(c);
    } catch (e) {
      throw new DeckParseError(`Card ${i + 1}: ${(e as Error).message}`);
    }
  });
}

// The "Import by JSON" box strips pasted-in anchors/spans (copied from wikis) before importing.
export function cleanImportedCard(card: Card): Card {
  const clean = (line: string) =>
    line.replace(/<a href=.{1,}?>(.{1,}?)<\/a>/g, '$1').replace(/<span class=.{1,}?>(.{1,}?)<\/span>/g, '$1');
  return { ...card, contents: card.contents.map(clean), back_contents: card.back_contents.map(clean) };
}

export const serializeDeck = (cards: Card[]): string => JSON.stringify(cards.map(pruneImages), null, 2);

export const newCard = (): Card => ({
  count: 1,
  title: 'New card',
  contents: [],
  tags: [],
  background_text_toggle: false,
  back_contents: [],
});
