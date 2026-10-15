// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import fixture from './fixture-rpg-cards.json';
import sample from '../sample.json';
import { bbcodeToHtml, toggleBbcode } from '../core/bbcode';
import { toHex } from '../core/color';
import { parseDeck, serializeDeck, DeckParseError } from '../core/normalize';
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

describe('toggleBbcode', () => {
  // `word` is located in the raw text, or give the [start, end] offsets directly.
  const press = (v: string, word: string | [number, number], codes: ('b' | 'i' | 'u')[]) => {
    let value = v;
    let [s, e] = typeof word === 'string' ? [v.indexOf(word), v.indexOf(word) + word.length] : word;
    for (const c of codes) ({ value, start: s, end: e } = toggleBbcode(value, s, e, c));
    return value;
  };

  it('adds and removes a tag', () => {
    expect(press('a that b', 'that', ['b'])).toBe('a [b]that[/b] b');
    expect(press('a that b', 'that', ['b', 'b'])).toBe('a that b');
  });

  it('bold, italic, bold again leaves italic only', () => {
    expect(press('that', 'that', ['b', 'i', 'b'])).toBe('[i]that[/i]');
    expect(press('that', 'that', ['b', 'i', 'b', 'i'])).toBe('that');
  });

  it('unbolds part of a bold span', () => {
    expect(press('[b]abc[/b]', [4, 5], ['b'])).toBe('[b]a[/b]b[b]c[/b]');
  });

  it('bolds across an existing bold run without nesting', () => {
    expect(press('[b]a[/b]bc', [3, 10], ['b'])).toBe('[b]abc[/b]');
  });

  it('keeps the selection on the same text', () => {
    const r = toggleBbcode('x that y', 2, 6, 'b');
    expect(r.value.slice(r.start, r.end)).toBe('that');
    const r2 = toggleBbcode(r.value, r.start, r.end, 'i');
    expect(r2.value.slice(r2.start, r2.end)).toBe('that');
  });

  it('leaves other tags and lines alone', () => {
    expect(press('one\n[color=red]hot[/color] x\ntwo', 'hot', ['b'])).toBe('one\n[color=red][b]hot[/b][/color] x\ntwo');
  });

  it('caret only opens an empty pair, and steps out again', () => {
    const a = toggleBbcode('ab', 1, 1, 'b');
    expect(a.value).toBe('a[b][/b]b');
    expect(toggleBbcode(a.value, a.start, a.end, 'b').value).toBe('ab');
  });
});

describe('contentId', () => {
  it('is stable for identical content and changes with any edit', async () => {
    const { contentId } = await import('../ui/storage');
    expect(contentId('<a>', '<b>')).toBe(contentId('<a>', '<b>'));
    expect(contentId('<a>', '<b>')).not.toBe(contentId('<a>x', '<b>'));
    expect(contentId('ab', 'c')).not.toBe(contentId('a', 'bc'));
  });
});
