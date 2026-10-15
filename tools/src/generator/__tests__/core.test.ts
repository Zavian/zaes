// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import fixture from './fixture-rpg-cards.json';
import sample from '../sample.json';
import { bbcodeToHtml } from '../core/bbcode';
import { toHex } from '../core/color';
import { parseDeck, serializeDeck, DeckParseError } from '../core/normalize';
import { layoutPages } from '../core/pages';
import { renderBack, renderFront } from '../core/render';
import { sanitizeHtml } from '../core/sanitize';
import { DEFAULT_OPTIONS } from '../core/types';

const raw = readFileSync(resolve('src/generator/__tests__/fixture-rpg-cards.json'), 'utf8');
const icons: string[] = JSON.parse(readFileSync(resolve('public/generator-assets/icons.json'), 'utf8'));

describe('importing an original generator save file', () => {
  const cards = parseDeck(raw);

  it('loads every card', () => {
    expect(cards).toHaveLength(12);
    expect(cards.map((c) => c.title)).toContain('Ioun Stone, Greater Absorption');
  });

  it('keeps all original fields on round-trip (no data loss)', () => {
    const again = JSON.parse(serializeDeck(cards));
    for (let i = 0; i < fixture.length; i++) {
      for (const [key, value] of Object.entries(fixture[i])) expect(again[i][key]).toEqual(value);
    }
  });

  it('fills in missing arrays and count', () => {
    const empty = cards.find((c) => c.title === 'safasfsa')!;
    expect(empty.contents).toEqual([]);
    expect(empty.tags).toEqual([]);
    expect(empty.count).toBe(1);
  });

  it('only references icons that exist', () => {
    for (const c of cards) for (const k of ['icon', 'icon_back']) if (c[k]) expect(icons).toContain(c[k]);
  });

  it('renders every card front and back without unknown elements', () => {
    for (const c of cards) {
      expect(renderFront(c, DEFAULT_OPTIONS)).not.toContain('Unknown element');
      expect(renderBack(c, DEFAULT_OPTIONS)).toContain('card');
    }
  });

  it('renders the double sided card back from back_contents', () => {
    const c = cards.find((x) => x.title === 'Test new card')!;
    expect(renderBack(c, DEFAULT_OPTIONS)).toContain('second side');
  });

  it('supports both BBCode and raw HTML in text', () => {
    const goblinish = cards.find((c) => c.title === 'Ioun Stone, Greater Absorption')!;
    expect(renderFront(goblinish, DEFAULT_OPTIONS)).toContain('<em>Ioun</em>');
    const burning = cards.find((c) => c.title === 'Burning Hands')!;
    expect(renderFront(burning, DEFAULT_OPTIONS)).toContain('<b>3d6 fire damage</b>');
  });

  it('lays out a double sided print run', () => {
    const pages = layoutPages(cards, { ...DEFAULT_OPTIONS, card_size: '25x35', page_rows: 3, page_columns: 3 });
    expect(pages.length % 2).toBe(0); // front/back pairs
    expect(pages[0]).toHaveLength(9);
  });
});

describe('parseDeck', () => {
  it('accepts a single card and { cards } wrappers', () => {
    expect(parseDeck('{"title":"x"}')).toHaveLength(1);
    expect(parseDeck({ cards: [{ title: 'a' }, { title: 'b' }] })).toHaveLength(2);
  });
  it('rejects junk with a readable error', () => {
    expect(() => parseDeck('nope')).toThrow(DeckParseError);
    expect(() => parseDeck('[1]')).toThrow(/Card 1/);
  });
  it('loads the bundled sample deck', () => {
    expect(parseDeck(sample).length).toBeGreaterThan(0);
  });
});

describe('helpers', () => {
  it('resolves colors', () => {
    expect(toHex('Indigo')).toBe('#4b0082');
    expect(toHex('#abc')).toBe('#aabbcc');
    expect(toHex('nonsense')).toBeNull();
  });
  it('converts nested BBCode', () => {
    expect(bbcodeToHtml('[b][i]x[/i][/b] [color=red]y[/color]')).toBe('<strong><em>x</em></strong> <span style="color: red">y</span>');
  });
  it('strips scripts and event handlers', () => {
    const out = sanitizeHtml('<b onclick="x()">a</b><script>alert(1)</script><a href="javascript:alert(1)">l</a>');
    expect(out).not.toMatch(/script|onclick|javascript/i);
    expect(out).toContain('<b>a</b>');
  });
});

describe('print grid', () => {
  it('fits 7.5x5 cards on A4 as 1 x 2 and flags overflow', async () => {
    const { fitGrid, gridOverflows } = await import('../core/pages');
    const big = { ...DEFAULT_OPTIONS, card_size: '75x50' as const, page_rows: 2, page_columns: 1 };
    expect(fitGrid(big)).toEqual({ cols: 1, rows: 2 });
    expect(gridOverflows(big)).toBe(false);
    expect(gridOverflows(DEFAULT_OPTIONS)).toBe(false);
    expect(fitGrid(DEFAULT_OPTIONS)).toEqual({ cols: 2, rows: 2 });
    expect(gridOverflows({ ...DEFAULT_OPTIONS, card_size: '75x50', page_rows: 3, page_columns: 3 })).toBe(true);
    expect(fitGrid({ ...DEFAULT_OPTIONS, card_size: '25x35' })).toEqual({ cols: 3, rows: 3 });
  });
});
