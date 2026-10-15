import React, { useEffect, useState } from 'react';
import { BBCODES } from '../core/bbcode';
import { DeckParseError, parseDeck } from '../core/normalize';
import { FS_NOTE, TAG_DOCS } from '../core/tags';
import { Arrangement, Card, DeckOptions, PAGE_SIZES, PageSize } from '../core/types';
import { Button, Input, Kbd, Label, Modal, Select, Textarea, Toggle, cx } from './primitives';
import { deckCardCount, fitGrid, gridOverflows } from '../core/pages';

// ---------------------------------------------------------------------------
// Print
// ---------------------------------------------------------------------------
interface PrintProps {
  open: boolean;
  onClose: () => void;
  onPrint: () => void;
  options: DeckOptions;
  setOptions: (patch: Partial<DeckOptions>) => void;
  cards: Card[];
}

export const PrintDialog: React.FC<PrintProps> = ({ open, onClose, onPrint, options, setOptions, cards }) => {
  const total = deckCardCount(cards, options);
  const perPage = options.page_rows * options.page_columns;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Print cards"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={cards.length === 0} onClick={onPrint}>Print…</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="page-size">Page size</Label>
            <Select id="page-size" value={options.page_size} onChange={(e) => setOptions({ page_size: e.target.value as PageSize })}>
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s === '25x35' ? '2.5" × 3.5" (single card)' : s}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="arrangement">Arrangement</Label>
            <Select id="arrangement" value={options.card_arrangement} onChange={(e) => setOptions({ card_arrangement: e.target.value as Arrangement })}>
              <option value="doublesided">Double sided (flip on long edge)</option>
              <option value="front_only">Fronts only</option>
              <option value="side_by_side">Front and back side by side</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="rows">Rows per page</Label>
            <Input id="rows" type="number" min={1} max={12} value={options.page_rows} onChange={(e) => setOptions({ page_rows: Math.max(1, Number(e.target.value) || 1) })} />
          </div>
          <div>
            <Label htmlFor="cols">Columns per page</Label>
            <Input id="cols" type="number" min={1} max={12} value={options.page_columns} onChange={(e) => setOptions({ page_columns: Math.max(1, Number(e.target.value) || 1) })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="override" hint="empty = use each card's own count">Copies of every card</Label>
            <Input id="override" type="number" min={1} value={options.card_count ?? ''} placeholder="Per card" onChange={(e) => setOptions({ card_count: e.target.value ? Math.max(1, Number(e.target.value)) : null })} />
          </div>
        </div>
        {gridOverflows(options) && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
            <span>{options.page_columns} × {options.page_rows} cards do not fit on this page and will be cut off.</span>
            <Button size="sm" onClick={() => { const g = fitGrid(options); setOptions({ page_rows: g.rows, page_columns: g.cols }); }}>
              Fit to page ({fitGrid(options).cols} × {fitGrid(options).rows})
            </Button>
          </div>
        )}
        <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
          {total} card{total === 1 ? '' : 's'} · {perPage} per page · card size {options.card_size === 'custom' ? `${options.custom_width}″ × ${options.custom_height}″` : options.card_size}
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
          <li>Enable <strong>background graphics</strong> in the print dialog, or colors and icons will be missing.</li>
          <li>Use the same paper size as chosen here and print at <strong>100%</strong> (no “fit to page”).</li>
          <li>For double sided printing, flip on the <strong>long edge</strong>.</li>
          <li>Printers that drift slightly can misalign fronts and backs. Try a different printer or print single sided if so.</li>
        </ul>
      </div>
    </Modal>
  );
};

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
      {error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
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
      {error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">This runs in your browser on your own deck. Only run code you wrote or trust.</p>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Help
// ---------------------------------------------------------------------------
export const SHORTCUTS: { keys: string[]; desc: string }[] = [
  { keys: ['Ctrl', 'S'], desc: 'Save the deck to a JSON file' },
  { keys: ['Ctrl', 'P'], desc: 'Open the print dialog' },
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
            <li>Print sheets with <strong>Print</strong>; export a single card as images or upload it for virtual tabletops.</li>
          </ul>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Based on <a className="underline" href="https://crobi.github.io/rpg-cards/generator/generate.html" target="_blank" rel="noopener noreferrer">crobi's rpg-cards</a>. Icons by game-icons.net (CC BY 3.0).
          </p>
        </div>
      )}

      {tab === 'tags' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">{FS_NOTE.replace(/`/g, '')}</p>
          <dl className="divide-y divide-gray-200 dark:divide-[#2E333D] border border-gray-200 dark:border-[#2E333D] rounded">
            {TAG_DOCS.map((t) => (
              <div key={t.name} className="px-3 py-2">
                <dt className="font-mono text-[13px] text-emerald-700 dark:text-emerald-400">{t.syntax}{t.fs && <span className="text-gray-400"> [| fs-1…6]</span>}</dt>
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
              <dt className="font-mono text-[13px] text-emerald-700 dark:text-emerald-400">{b.example}</dt>
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
