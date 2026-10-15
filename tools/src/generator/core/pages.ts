import { renderBack, renderEmpty, renderFront } from './render';
import { Card, DeckOptions, PageSize } from './types';

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const repeat = (html: string, n: number) => Array.from({ length: n }, () => html);

// Mirror each row so a back page lines up with its front page when printed double-sided (flip on long edge).
const flipLeftRight = (cards: string[], rows: number, cols: number): string[] => {
  const out: string[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push(cards[r * cols + (cols - 1 - c)]);
  return out;
};

const pad = (cards: string[], options: DeckOptions): string[] => {
  const perPage = options.page_rows * options.page_columns;
  const rest = cards.length % perPage;
  return rest === 0 ? cards : cards.concat(repeat(renderEmpty(options), perPage - rest));
};

// One entry per physical page; each page is the list of card HTML strings, in reading order.
export function layoutPages(cards: Card[], options: DeckOptions): string[][] {
  const rows = Math.max(1, options.page_rows || 3);
  const cols = Math.max(1, options.page_columns || 3);
  const opts = { ...options, page_rows: rows, page_columns: cols };

  let fronts: string[] = [];
  let backs: string[] = [];
  for (const card of cards) {
    const count = opts.card_count || card.count || 1;
    fronts = fronts.concat(repeat(renderFront(card, opts), count));
    backs = backs.concat(repeat(renderBack(card, opts), count));
  }
  if (fronts.length === 0) return [];

  if (opts.card_arrangement === 'doublesided') {
    const frontPages = chunk(pad(fronts, opts), rows * cols);
    const backPages = chunk(pad(backs, opts), rows * cols).map((p) => flipLeftRight(p, rows, cols));
    return frontPages.flatMap((page, i) => [page, backPages[i]]);
  }
  if (opts.card_arrangement === 'front_only') return chunk(pad(fronts, opts), rows * cols);

  // side_by_side: front, back, then empty fillers up to the row width.
  const empty = renderEmpty(opts);
  const mixed: string[] = [];
  fronts.forEach((front, i) => {
    mixed.push(front, backs[i]);
    if (cols > 2) mixed.push(...repeat(empty, cols - 2));
  });
  return chunk(pad(mixed, opts), rows * cols);
}

// Physical page dimensions in mm (Chrome handles metric @page sizes poorly, so A4 is trimmed by 1mm as before).
export const PAGE_MM: Record<PageSize, [number, number]> = {
  A3: [297, 420],
  A4: [210, 296],
  A5: [148, 210],
  Letter: [215.9, 279.4],
  '25x35': [63.5, 88.9],
};

export const pageCss = (size: PageSize): string => {
  switch (size) {
    case 'A3': return 'A3 portrait';
    case 'A4': return '210mm 297mm';
    case 'A5': return 'A5 portrait';
    case 'Letter': return 'letter portrait';
    case '25x35': return '2.5in 3.5in';
    default: return 'auto';
  }
};

// Total sheets/cards for the "deck size" line in the UI.
export const deckCardCount = (cards: Card[], options: DeckOptions) =>
  cards.reduce((sum, c) => sum + (options.card_count || c.count || 1), 0);

// Card dimensions in inches for the built-in sizes.
const CARD_IN: Record<string, [number, number]> = {
  '225x35': [2.25, 3.5],
  '25x35': [2.5, 3.5],
  '30x50': [3, 5],
  '35x50': [3.5, 5],
  '75x50': [7.5, 5],
  '29x29': [2.9, 2.9],
};
export const cardInches = (o: DeckOptions): [number, number] =>
  o.card_size === 'custom' ? [o.custom_width, o.custom_height] : CARD_IN[o.card_size];

// How many cards fit on one page without overflowing (always at least 1 x 1).
export function fitGrid(o: DeckOptions): { rows: number; cols: number } {
  const [w, h] = cardInches(o);
  const [pw, ph] = PAGE_MM[o.page_size];
  return {
    cols: Math.max(1, Math.floor(pw / (w * 25.4))),
    rows: Math.max(1, Math.floor(ph / (h * 25.4))),
  };
}

export const gridOverflows = (o: DeckOptions): boolean => {
  const [w, h] = cardInches(o);
  const [pw, ph] = PAGE_MM[o.page_size];
  return o.page_columns * w * 25.4 > pw + 0.5 || o.page_rows * h * 25.4 > ph + 0.5;
};
