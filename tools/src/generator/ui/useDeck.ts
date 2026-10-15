import { useCallback, useEffect, useRef, useState } from 'react';
import { cleanImportedCard, newCard, normalizeCard } from '../core/normalize';
import { Card, DEFAULT_OPTIONS, DeckOptions } from '../core/types';
import { loadDeck, saveDeck } from './storage';

export function useDeck() {
  const [cards, setCards] = useState<Card[]>([]);
  const [options, setOptionsState] = useState<DeckOptions>(DEFAULT_OPTIONS);
  const [selected, setSelected] = useState(0);
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // Load once on the client (the page is prerendered, so storage is not available during render).
  useEffect(() => {
    const stored = loadDeck();
    if (stored) {
      setCards(stored.cards);
      setOptionsState(stored.options);
      setSelected(Math.min(Math.max(stored.selected, 0), Math.max(stored.cards.length - 1, 0)));
    }
    setReady(true);
  }, []);

  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!ready) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaveFailed(!saveDeck({ cards, options, selected })), 250);
    return () => window.clearTimeout(timer.current);
  }, [cards, options, selected, ready]);

  const select = useCallback((i: number) => setSelected(i), []);
  const current: Card | undefined = cards[Math.min(selected, cards.length - 1)];
  const currentIndex = cards.length ? Math.min(selected, cards.length - 1) : -1;

  const updateCard = useCallback(
    (patch: Partial<Card>) =>
      setCards((prev) => prev.map((c, i) => (i === Math.min(selected, prev.length - 1) ? { ...c, ...patch } : c))),
    [selected]
  );

  // Latest cards for handlers that must pick a new selection without calling setState inside an updater.
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  const addCard = useCallback((card: Card = newCard()) => {
    setSelected(cardsRef.current.length);
    setCards((prev) => [...prev, card]);
  }, []);

  const addCards = useCallback((incoming: Card[]) => {
    if (!incoming.length) return;
    setSelected(cardsRef.current.length);
    setCards((prev) => [...prev, ...incoming.map(normalizeCard)]);
  }, []);

  const importCard = useCallback((card: Card) => addCard(cleanImportedCard(card)), [addCard]);

  const duplicateCard = useCallback(() => {
    const prev = cardsRef.current;
    if (!prev.length) return addCard();
    const i = Math.min(selected, prev.length - 1);
    const src = prev[i];
    const copy: Card = { ...src, title: `${src.title} (Copy)`, contents: [...src.contents], back_contents: [...src.back_contents], tags: [...src.tags] };
    setCards([...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)]);
    setSelected(i + 1);
  }, [selected, addCard]);

  const deleteCard = useCallback(() => {
    const i = Math.min(selected, cardsRef.current.length - 1);
    setCards((prev) => prev.filter((_, idx) => idx !== i));
    setSelected(Math.max(0, i - 1));
  }, [selected]);

  const moveCard = useCallback((from: number, to: number) => {
    const prev = cardsRef.current;
    if (to < 0 || to >= prev.length || from === to) return;
    const next = [...prev];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setCards(next);
    setSelected(to);
  }, []);

  const replaceCards = useCallback((next: Card[]) => {
    setCards(next);
    setSelected((s) => Math.min(s, Math.max(next.length - 1, 0)));
  }, []);

  const clear = useCallback(() => {
    setCards([]);
    setSelected(0);
  }, []);

  const setOptions = useCallback((patch: Partial<DeckOptions>) => setOptionsState((o) => ({ ...o, ...patch })), []);

  const applyToAll = useCallback((patch: Partial<Card>) => setCards((prev) => prev.map((c) => ({ ...c, ...patch }))), []);

  return {
    cards, options, selected: currentIndex, current, ready, saveFailed,
    select, updateCard, addCard, addCards, importCard, duplicateCard, deleteCard, moveCard,
    replaceCards, clear, setOptions, applyToAll,
  };
}

export type Deck = ReturnType<typeof useDeck>;
