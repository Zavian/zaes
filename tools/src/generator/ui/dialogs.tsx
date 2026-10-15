import React, { useEffect, useState } from 'react';
import { BBCODES } from '../core/bbcode';
import { DeckParseError, parseDeck } from '../core/normalize';
import { FS_NOTE, TAG_DOCS } from '../core/tags';
import { Card } from '../core/types';
import { Button, Input, Kbd, Label, Modal, Select, Textarea, Toggle, cx } from './primitives';

// ---------------------------------------------------------------------------
// Import a single card (or several) from pasted JSON
// ---------------------------------------------------------------------------
const IMPORT_EXAMPLE = `{
  "count": 1,
  "color": "#696969",
  "title": "Abacus",
  "icon": "abacus",
  "contents": [
    "subtitle | Adventuring Gear",
    "rule",
    "text | 2 gp, 2 lb."
  ],
  "tags": ["item"]
}`;

export const ImportCardDialog: React.FC<{ open: boolean; onClose: () => void; onImport: (cards: Card[]) => void }> = ({ open, onClose, onImport }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (open) {
      setText('');
      setError('');
    }
  }, [open]);
  const run = () => {
    try {
      const cards = parseDeck(text);
      onImport(cards);
      onClose();
    } catch (e) {
      setError(e instanceof DeckParseError ? e.message : String(e));
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Import card from JSON" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={run} disabled={!text.trim()}>Import</Button></>}>
      <p className="mb-2">Paste the JSON of a card (or an array of cards). They are added at the end of the deck.</p>
      <Textarea rows={12} value={text} onChange={(e) => { setText(e.target.value); setError(''); }} placeholder={IMPORT_EXAMPLE} wrap="off" aria-label="Card JSON" />
      {error && <p role="alert" className="mt-2 text-base text-red-600 dark:text-red-400">{error}</p>}
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Sort / filter with user code (same contract as the original generator)
// ---------------------------------------------------------------------------
const SORT_DEFAULT = `if (card_a.title < card_b.title) {
  return -1;
} else if (card_a.title > card_b.title) {
  return 1;
}
return 0;`;

const FILTER_DEFAULT = `// Color all spell cards yellow
if (card_has_tag(card, "spell")) {
  card.color = "yellow";
}

// Remove all creature cards
if (card_has_tag(card, "creature")) {
  return false;
}`;

const hasTag = (card: Card, tag: string) => card.tags.includes(tag.trim().toLowerCase());

export const CodeDialog: React.FC<{
  open: boolean;
  mode: 'sort' | 'filter';
  onClose: () => void;
  cards: Card[];
  onResult: (cards: Card[]) => void;
}> = ({ open, mode, onClose, cards, onResult }) => {
  const [code, setCode] = useState(mode === 'sort' ? SORT_DEFAULT : FILTER_DEFAULT);
  const [error, setError] = useState('');
  useEffect(() => {
    setCode(mode === 'sort' ? SORT_DEFAULT : FILTER_DEFAULT);
    setError('');
  }, [mode, open]);

  const run = () => {
    try {
      if (mode === 'sort') {
        // eslint-disable-next-line no-new-func
        const fn = new Function('card_a', 'card_b', code) as (a: Card, b: Card) => number;
        onResult([...cards].sort((a, b) => Number(fn(a, b)) || 0));
      } else {
        // eslint-disable-next-line no-new-func
        const fn = new Function('card', 'card_has_tag', code) as (c: Card, h: typeof hasTag) => unknown;
        const copy = cards.map((c) => ({ ...c, tags: [...c.tags] }));
        onResult(copy.filter((c) => fn(c, hasTag) !== false));
      }
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'sort' ? 'Sort cards' : 'Filter / map cards'}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={run}>{mode === 'sort' ? 'Sort' : 'Run'}</Button></>}
    >
      <p className="mb-2">
        {mode === 'sort'
          ? 'A JavaScript comparison function body. Return -1 if card_a goes before card_b, 1 if after, 0 if equal.'
          : 'JavaScript run once per card. Change the card to map it, or return false to remove it. card_has_tag(card, "tag") is available.'}
      </p>
      <Textarea rows={12} value={code} onChange={(e) => { setCode(e.target.value); setError(''); }} wrap="off" aria-label="Code" />
      {error && <p role="alert" className="mt-2 text-base text-red-600 dark:text-red-400">{error}</p>}
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">This runs in your browser on your own deck. Only run code you wrote or trust.</p>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Help
// ---------------------------------------------------------------------------
export const SHORTCUTS: { keys: string[]; desc: string }[] = [
  { keys: ['Ctrl', 'S'], desc: 'Save the deck to a JSON file' },
  { keys: ['Ctrl', 'E'], desc: 'Upload the selected card to imgbb' },
  { keys: ['Alt', 'N'], desc: 'New card' },
  { keys: ['Alt', 'D'], desc: 'Duplicate the selected card' },
  { keys: ['Alt', '↑'], desc: 'Previous card' },
  { keys: ['Alt', '↓'], desc: 'Next card' },
  { keys: ['Ctrl', 'B'], desc: 'Bold the selection (in a contents field)' },
  { keys: ['Ctrl', 'I'], desc: 'Italic the selection' },
  { keys: ['Ctrl', 'U'], desc: 'Underline the selection' },
  { keys: ['F1'], desc: 'Open this help' },
];

export const HelpDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [tab, setTab] = useState<'guide' | 'tags' | 'bbcode' | 'keys'>('guide');
  const tabs = [
    ['guide', 'Guide'],
    ['tags', 'Tags'],
    ['bbcode', 'BBCode'],
    ['keys', 'Shortcuts'],
  ] as const;
  return (
    <Modal open={open} onClose={onClose} title="RPG card generator help" wide>
      <div className="flex gap-1 mb-4" role="tablist">
        {tabs.map(([id, label]) => (
          <Button key={id} role="tab" aria-selected={tab === id} size="sm" variant={tab === id ? 'primary' : 'ghost'} onClick={() => setTab(id)}>
            {label}
          </Button>
        ))}
      </div>

      {tab === 'guide' && (
        <div className="space-y-3 leading-relaxed">
          <p>
            Pick a card on the left, edit it in the middle, and watch the preview on the right. Each line of a card's contents is one element:
            <code className="mx-1 px-1 rounded bg-gray-100 dark:bg-[#111318]">tag | parameter | parameter</code>.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Use <strong>Load</strong> to open a save file from the original generator (or this one), and <strong>Save</strong> to download your deck as JSON. Files are interchangeable.</li>
            <li>Your deck is also kept in this browser automatically.</li>
            <li>Turn on <strong>custom back side</strong> to write the back of a card with the same tags as the front.</li>
            <li>Text accepts BBCode and basic HTML.</li>
            <li>Export a card as images or upload it for virtual tabletops.</li>
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Based on <a className="underline" href="https://crobi.github.io/rpg-cards/generator/generate.html" target="_blank" rel="noopener noreferrer">crobi's rpg-cards</a>. Icons by game-icons.net (CC BY 3.0).
          </p>
        </div>
      )}

      {tab === 'tags' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">{FS_NOTE.replace(/`/g, '')}</p>
          <dl className="divide-y divide-gray-200 dark:divide-[#2E333D] border border-gray-200 dark:border-[#2E333D] rounded">
            {TAG_DOCS.map((t) => (
              <div key={t.name} className="px-3 py-2">
                <dt className="font-mono text-[15px] text-emerald-700 dark:text-emerald-400">{t.syntax}{t.fs && <span className="text-gray-400"> [| fs-1…6]</span>}</dt>
                <dd className="text-gray-600 dark:text-gray-400">{t.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {tab === 'bbcode' && (
        <dl className="divide-y divide-gray-200 dark:divide-[#2E333D] border border-gray-200 dark:border-[#2E333D] rounded">
          {BBCODES.map((b) => (
            <div key={b.code} className="px-3 py-2">
              <dt className="font-mono text-[15px] text-emerald-700 dark:text-emerald-400">{b.example}</dt>
              <dd className="text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: b.explanation }} />
            </div>
          ))}
        </dl>
      )}

      {tab === 'keys' && (
        <ul className="divide-y divide-gray-200 dark:divide-[#2E333D] border border-gray-200 dark:border-[#2E333D] rounded">
          {SHORTCUTS.map((s) => (
            <li key={s.desc} className={cx('flex items-center justify-between gap-4 px-3 py-2')}>
              <span>{s.desc}</span>
              <span className="flex gap-1">{s.keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};
