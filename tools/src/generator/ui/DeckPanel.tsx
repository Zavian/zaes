import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { toHex } from '../core/color';
import { Deck } from './useDeck';
import { Button, Input, Panel, cx } from './primitives';

interface Props {
  deck: Deck;
}

export const DeckPanel: React.FC<Props> = ({ deck }) => {
  const { cards, selected, options } = deck;
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = useMemo(
    () =>
      cards
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => !q || card.title.toLowerCase().includes(q) || card.tags.some((t) => t.includes(q))),
    [cards, q]
  );

  return (
    <Panel
      title={`Deck · ${cards.length}`}
      className="flex flex-col"
    >
      {cards.length > 6 && (
        <div className="relative p-3 border-b border-gray-200 dark:border-[#2E333D]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or tag" aria-label="Search cards" className="pl-8" />
        </div>
      )}

      {cards.length === 0 ? (
        <p className="p-6 text-center text-base text-gray-500 dark:text-gray-400">No cards yet. Add one, load a file, or try the sample deck.</p>
      ) : (
        <ul className="overflow-y-auto py-1 max-h-72" aria-label="Cards">
          {rows.map(({ card, index }) => {
            const active = index === selected;
            return (
              <li key={index} className="group relative">
                <button
                  type="button"
                  ref={active ? (el) => el?.scrollIntoView?.({ block: 'nearest' }) : undefined}
                  onClick={() => deck.select(index)}
                  aria-current={active}
                  className={cx(
                    'flex w-full items-center gap-2.5 pl-3 pr-14 py-1.5 text-left text-base cursor-pointer transition-colors border-l-2',
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-600 dark:border-emerald-400 text-[#1A1A1A] dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1F222A]'
                  )}
                >
                  <span className="h-3 w-3 shrink-0 rounded-sm border border-black/10 dark:border-white/10" style={{ backgroundColor: toHex(card.color || options.default_color) ?? '#000' }} />
                  <span className="truncate">{card.title || <em className="text-gray-400">Untitled</em>}</span>
                </button>
                {active && !q && (
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 flex">
                    <Button size="icon" variant="ghost" disabled={index === 0} onClick={() => deck.moveCard(index, index - 1)} aria-label="Move up" className="!p-1">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" disabled={index === cards.length - 1} onClick={() => deck.moveCard(index, index + 1)} aria-label="Move down" className="!p-1">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </span>
                )}
              </li>
            );
          })}
          {rows.length === 0 && <li className="px-4 py-3 text-base text-gray-500">No matches.</li>}
        </ul>
      )}
    </Panel>
  );
};
