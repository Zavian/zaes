import { useEffect, useRef } from 'react';
import { registerPageAgent } from '../agent';
import { normalizeCard } from './core/normalize';
import { TAG_DOCS } from './core/tags';
import { Card } from './core/types';
import type { Deck } from './ui/useDeck';

// Deck functions for window.agent (see ../agent.ts for the gating and the site-level functions).

const DOCS = {
  card: {
    title: 'string',
    count: 'number of copies (default 1)',
    color: 'CSS color or name, e.g. "crimson" (default: deck default)',
    icon: 'game-icons.net name, e.g. "fire-bowl" (default: deck default)',
    tags: 'string[]',
    contents: 'string[] — each line is "tag | param | ..." (see tags)',
    back_contents: 'string[] — same format, for the card back',
    card_size: "optional: '225x35' | '25x35' | '30x50' | '35x50' | '75x50' | '29x29' | 'custom'",
  },
  example: {
    title: 'Fireball',
    color: 'crimson',
    icon: 'fire-bowl',
    contents: ['subtitle | 3rd-level evocation', 'rule', 'property | Casting time | 1 action', 'text | A bright streak flashes...'],
  },
  tags: TAG_DOCS.map((t) => ({ syntax: t.syntax, description: t.description })),
  functions: {
    listCards: '() -> [{index,title,count,color,icon,tags,contents,back_contents}]',
    getCard: '(index) -> card',
    addCard: '(card) -> index',
    addCards: '(cards[]) -> [indexes]',
    updateCard: '(index, patch) -> card (patch keys overwrite)',
    deleteCard: '(index) -> number of cards left',
    moveCard: '(from, to) -> new order of titles',
    exportDeck: '() -> card[] (same as the save file)',
    importDeck: '(cards[], replace=false) -> number of cards',
  },
};

// Large embedded images are not useful to an agent; flag them instead of returning megabytes.
const view = (c: Card, index: number) => ({
  ...c,
  index,
  ...(typeof c.background_image === 'string' && c.background_image.startsWith('data:') ? { background_image: '[embedded image]' } : {}),
});

export function useAgentApi(deck: Deck) {
  // Mutations apply to this local copy at once so back-to-back calls compose; renders re-sync it.
  const latest = useRef<Card[]>(deck.cards);
  latest.current = deck.cards;
  const api = useRef(deck);
  api.current = deck;

  useEffect(() => {
    if (!window.__webwrap?.debug || !deck.ready) return;
    const set = (next: Card[]) => {
      latest.current = next;
      api.current.replaceCards(next);
    };
    const at = (i: number) => {
      if (!Number.isInteger(i) || i < 0 || i >= latest.current.length) throw new Error(`No card at index ${i} (deck has ${latest.current.length})`);
      return i;
    };
    const unregister = registerPageAgent(DOCS, {
      listCards: () => latest.current.map(view),
      getCard: (i: number) => view(latest.current[at(i)], i),
      addCard: (card: unknown) => {
        const idx = latest.current.length;
        set([...latest.current, normalizeCard(card)]);
        api.current.select(idx);
        return idx;
      },
      addCards: (cards: unknown[]) => {
        const start = latest.current.length;
        set([...latest.current, ...cards.map(normalizeCard)]);
        return cards.map((_, k) => start + k);
      },
      updateCard: (i: number, patch: Partial<Card>) => {
        at(i);
        const merged = normalizeCard({ ...latest.current[i], ...patch });
        set(latest.current.map((c, k) => (k === i ? merged : c)));
        return view(merged, i);
      },
      deleteCard: (i: number) => {
        at(i);
        set(latest.current.filter((_, k) => k !== i));
        return latest.current.length;
      },
      moveCard: (from: number, to: number) => {
        at(from);
        at(to);
        const next = [...latest.current];
        next.splice(to, 0, next.splice(from, 1)[0]);
        set(next);
        return next.map((c) => c.title);
      },
      exportDeck: () => latest.current,
      importDeck: (cards: unknown[], replace = false) => {
        const incoming = cards.map(normalizeCard);
        set(replace ? incoming : [...latest.current, ...incoming]);
        return latest.current.length;
      },
    });
    return unregister;
  }, [deck.ready]);
}
