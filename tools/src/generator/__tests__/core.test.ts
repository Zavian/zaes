// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import fixture from './fixture-rpg-cards.json';
import sample from '../sample.json';
import { bbcodeToHtml, toggleBbcode } from '../core/bbcode';
import { toHex } from '../core/color';
import { formatImageLine, parseImageLine } from '../core/image';
import { newCard, parseDeck, serializeDeck, DeckParseError } from '../core/normalize';
import { renderBack, renderFront } from '../core/render';
import { sanitizeHtml } from '../core/sanitize';
import { Card, DEFAULT_OPTIONS } from '../core/types';

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

describe('image element', () => {
  const PX = 'data:image/png;base64,iVBORw0KGgo=';
  const card = (line: string, images: Record<string, string> = { pic: PX }) =>
    ({ ...newCard(), contents: [line], images }) as Card;
  const html = (line: string, images?: Record<string, string>) => renderFront(card(line, images), DEFAULT_OPTIONS);

  it('renders a local picture at the given width', () => {
    const out = html('image | 80 | @pic');
    expect(out).toContain('card-image-block');
    expect(out).toContain('width:80px');
    expect(out).toContain(PX);
  });

  it('applies opacity and alignment', () => {
    const out = html('image | 80 | @pic | right | opacity=40');
    expect(out).toContain('opacity:0.4');
    expect(out).toContain('align-right');
  });

  it('fills with the card color or a picked color', () => {
    expect(html('image | 80 | @pic | fill=card')).toContain('mask-image');
    expect(html('image | 80 | @pic | fill=#ff0000')).toMatch(/background-color:\s*#ff0000/i);
  });

  it('ignores unknown names and unsafe sources', () => {
    expect(html('image | 80 | @nope')).not.toContain('card-image');
    expect(html('image | 80 | javascript:alert(1)')).not.toContain('card-image');
    expect(html('image | 80 | @pic', { pic: 'data:text/html;base64,AAAA' })).not.toContain('card-image');
  });

  it('renders inline pictures in text', () => {
    expect(html('text | hi [img=20]@pic[/img]')).toContain('card-image-inline');
  });

  it('drops unused pictures when the deck is serialized', () => {
    const used = card('image | 80 | @pic', { pic: PX, old: PX });
    const out = JSON.parse(serializeDeck([used]))[0];
    expect(Object.keys(out.images)).toEqual(['pic']);
    expect(JSON.parse(serializeDeck([card('text | x')]))[0].images).toBeUndefined();
  });
});

describe('image radius and line editing', () => {
  const PX = 'data:image/png;base64,iVBORw0KGgo=';
  const c = (line: string) => ({ ...newCard(), contents: [line], images: { pic: PX } }) as Card;

  it('uses the card corner radius by default, none when corners are square', () => {
    expect(renderFront(c('image | 80 | @pic'), DEFAULT_OPTIONS)).toContain('border-radius:4px');
    expect(renderFront(c('image | 80 | @pic'), { ...DEFAULT_OPTIONS, rounded_corners: false })).toContain('border-radius:0px');
  });

  it('lets radius= override it', () => {
    expect(renderFront(c('image | 80 | @pic | radius=12'), DEFAULT_OPTIONS)).toContain('border-radius:12px');
  });

  it('round-trips a line through parse/format', () => {
    const line = 'image | 80x40 | @pic | right | opacity=40 | fill=card | radius=8';
    expect(formatImageLine(parseImageLine(line))).toBe(line);
    expect(formatImageLine(parseImageLine('image | 120 | @pic'))).toBe('image | 120 | @pic');
  });
});

describe('image shadow and glow', () => {
  const PX = 'data:image/png;base64,iVBORw0KGgo=';
  const html = (line: string, color = '#336699') =>
    renderFront({ ...newCard(), color, contents: [line], images: { pic: PX } } as Card, DEFAULT_OPTIONS);

  it('adds nothing unless asked', () => {
    expect(html('image | 80 | @pic')).not.toContain('drop-shadow');
  });

  it('shadow: black, card color or a picked color, 50% opaque by default', () => {
    expect(html('image | 80 | @pic | shadow=black')).toContain('drop-shadow(3px 4px 4px rgba(0,0,0,0.5))');
    expect(html('image | 80 | @pic | shadow=card')).toContain('rgba(51,102,153,0.5)');
    expect(html('image | 80 | @pic | shadow=#ff0000')).toContain('rgba(255,0,0,0.5)');
  });

  it('shadow-opacity sets the shadow alpha, clamped to 0-100', () => {
    expect(html('image | 80 | @pic | shadow=black | shadow-opacity=20')).toContain('rgba(0,0,0,0.2)');
    expect(html('image | 80 | @pic | shadow=black | shadow-opacity=0')).toContain('rgba(0,0,0,0)');
    expect(html('image | 80 | @pic | shadow=black | shadow-opacity=900')).toContain('rgba(0,0,0,1)');
  });

  it('glow is a solid halo around the picture and can combine with a shadow', () => {
    const out = html('image | 80 | @pic | glow=#ffff00 | shadow=black');
    expect(out).toContain('drop-shadow(0px 0px 4px rgba(255,255,0,1))');
    expect(out).toContain('drop-shadow(3px 4px 4px rgba(0,0,0,0.5))');
  });

  it('ignores an unknown color', () => {
    expect(html('image | 80 | @pic | glow=nonsense')).not.toContain('drop-shadow');
  });

  it('round-trips through parse/format', () => {
    const line = 'image | 80 | @pic | shadow=black | shadow-opacity=30 | glow=card';
    expect(formatImageLine(parseImageLine(line))).toBe(line);
    expect(formatImageLine(parseImageLine('image | 80 | @pic | shadow-opacity=30'))).toBe('image | 80 | @pic');
  });
});

describe('@icon image', () => {
  it('uses the card icon, painted in the card color by default', () => {
    const c = { ...newCard(), icon: 'sword', color: 'red', contents: ['image | 40 | @icon'] } as Card;
    const out = renderFront(c, DEFAULT_OPTIONS);
    expect(out).toContain('sword');
    expect(out).toContain('mask-image');
    expect(renderFront({ ...c, contents: ['image | 40 | @icon | fill=none'] } as Card, DEFAULT_OPTIONS)).not.toContain('card-image-fill');
  });
});

describe('per-card size', () => {
  it('uses the deck size unless the card has its own', () => {
    expect(renderFront(newCard(), DEFAULT_OPTIONS)).toContain('card-size-285x480');
    expect(renderFront({ ...newCard(), card_size: '25x35' } as Card, DEFAULT_OPTIONS)).toContain('card-size-25x35');
  });
  it('supports a custom size on the card and ignores unknown values', () => {
    const out = renderFront({ ...newCard(), card_size: 'custom', custom_width: 4, custom_height: 6 } as Card, DEFAULT_OPTIONS);
    expect(out).toContain('--custom-width:4in');
    expect(renderFront({ ...newCard(), card_size: 'nope' } as unknown as Card, DEFAULT_OPTIONS)).toContain('card-size-285x480');
  });
  it('round-trips through the save file', () => {
    const back = parseDeck(serializeDeck([{ ...newCard(), card_size: '30x50' } as Card]))[0];
    expect(back.card_size).toBe('30x50');
  });
});
