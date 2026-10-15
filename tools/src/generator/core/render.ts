import { iconUrl } from './assets';
import { bbcodeToHtml } from './bbcode';
import { cardColorTriplet, toHex } from './color';
import { sanitizeHtml } from './sanitize';
import { Card, DeckOptions } from './types';

// ---------------------------------------------------------------------------
// Card data helpers
// ---------------------------------------------------------------------------
export const colorFront = (c: Card, o: DeckOptions) => c.color_front || c.color || o.default_color || 'black';
export const colorBack = (c: Card, o: DeckOptions) => c.color_back || c.color || o.default_color || 'black';
export const iconFront = (c: Card, o: DeckOptions) => c.icon_front || c.icon || o.default_icon || 'ace';
export const iconBack = (c: Card, o: DeckOptions) => c.icon_back || c.icon || o.default_icon || 'ace';

const splitParams = (line: string) => line.split('|').map((s) => s.trim());

const esc = (s: string) => s.replace(/"/g, '&quot;').replace(/</g, '&lt;');
// Icon names end up in a class attribute and a CSS custom property: keep them to a safe charset.
const safeIcon = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, '');
const cssColor = (c: string) => toHex(c) ?? (/^[a-zA-Z]+$/.test(c) ? c : '#000000');

// `fs-1`..`fs-6` as the last parameter changes the text size.
const parseFs = (params: string[]) => {
  if (params.length === 0) return '';
  const last = params[params.length - 1];
  return last.includes('fs') ? ' ' + last.replace(/[^a-z0-9-]/gi, '') : '';
};

// ---------------------------------------------------------------------------
// Element generators ("tag | param | param")
// ---------------------------------------------------------------------------
type ElementCtx = { card: Card; options: DeckOptions };
type ElementGenerator = (params: string[], ctx: ElementCtx) => string;

const textLine = (style = ''): ElementGenerator => (params) =>
  `<div class="card-element card-description-line"${style}><p class="card-p card-description-text${parseFs(params)}">${params[0] ?? ''}</p></div>`;

export const ELEMENTS: Record<string, ElementGenerator> = {
  subtitle: (p) => `<div class="card-element card-subtitle">${p[0] ?? ''}</div>`,

  property: (p) => {
    let html = `<div class="card-element card-property-line"><h4 class="card-property-name">${p[0] ?? ''}</h4> <p class="card-p card-property-text">${p[1] ?? ''}</p>`;
    if (p[2]) {
      html += `<div style="float:right"><h4 class="card-property-name">${p[2]}</h4> <p class="card-p card-property-text">${p[3] ?? ''}</p></div>`;
    }
    return html + '</div>';
  },

  rule: (_p, { card, options }) => {
    const color = cssColor(colorFront(card, options));
    return `<svg class="card-ruler" height="1" width="100" viewBox="0 0 100 1" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><polyline points="0,0 100,0.5 0,1" fill="${color}"></polyline></svg>`;
  },

  boxes: (p, { card, options }) => {
    const color = cssColor(colorFront(card, options));
    const count = Math.min(Number(p[0]) || 1, 100);
    const size = Number(p[1]) || 3;
    const box = `<svg class="card-box" height="100" width="100" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="width:${size}em;height:${size}em"><rect x="5" y="5" width="90" height="90" fill="none" stroke="${color}" style="stroke-width:10"></rect></svg>`;
    return `<div class="card-element card-description-line">${box.repeat(count)}</div>`;
  },

  description: (p) =>
    `<div class="card-element card-description-line"><h4 class="card-description-name">${p[0] ?? ''}</h4> <p class="card-p card-description-text">${p[1] ?? ''}</p></div>`,

  dndstats: (p) => statsTable(p, true),
  stats: (p) => statsTable(p, false),

  text: textLine(),
  center: textLine(' style="text-align: center"'),
  justify: textLine(' style="text-align: justify; hyphens: auto"'),

  action: (p) => {
    const fs = parseFs(p) || ' fs-2';
    return `<div class="card-element card-action"><p class="card-p card-description-text${fs}">${p[0] ?? ''}</p></div>`;
  },

  bullet: (p) => `<ul class="card-element card-bullet-line"><li class="card-bullet">${p[0] ?? ''}</li></ul>`,

  section: (p, { card, options }) =>
    `<h3 class="card-section" style="color:${cssColor(colorFront(card, options))}">${p[0] ?? ''}</h3>`,

  fill: (p) => `<span class="card-fill" style="flex:${Number(p[0]) || 1}"></span>`,

  disabled: () => '',

  // Disabled in the original generator too ("until further notice").
  picture: () => '',

  icon: (p, { card, options }) => {
    const icon = safeIcon(p[0] || '');
    const size = Math.min(Math.max(Number(p[1]) || 40, 4), 600);
    const align = ['left', 'right', 'center'].includes(p[2]) ? p[2] : 'center';
    return `<div class="card-element card-inline-icon align-${align}" style="--icon:url('${iconUrl(icon)}');height:${size}px;min-height:${size}px;width:${size}px;background-color:${cssColor(colorFront(card, options))}"></div>`;
  },

  lore: (p) => `<div class="card-element card-lore">${p[0] ?? ''}</div>`,
  centerlore: (p) => `<div class="card-element card-lore card-center">${p[0] ?? ''}</div>`,
};

function statsTable(p: string[], withMods: boolean): string {
  const names = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  const cells = names.map((_, i) => {
    const value = parseInt(p[i], 10) || 0;
    if (!withMods) return `${value}`;
    const mod = Math.floor((value - 10) / 2);
    return `${value}&nbsp;(${mod >= 0 ? '+' : ''}${mod})`;
  });
  return (
    '<table class="card-stats"><tbody>' +
    `<tr>${names.map((n) => `<th class="card-stats-header">${n}</th>`).join('')}</tr>` +
    `<tr>${cells.map((c) => `<td class="card-stats-cell">${c}</td>`).join('')}</tr>` +
    '</tbody></table>'
  );
}

export const TAG_NAMES = Object.keys(ELEMENTS);

// ---------------------------------------------------------------------------
// Card generation
// ---------------------------------------------------------------------------
function contents(lines: string[], card: Card, options: DeckOptions): string {
  const body = lines
    .map((line) => {
      const [name, ...params] = splitParams(line);
      const gen = ELEMENTS[name];
      if (gen) return gen(params, { card, options });
      if (name.length > 0) return `<div>Unknown element: ${params.join('<br />')}</div>`;
      return '';
    })
    .join('\n');
  return `<div class="card-content-container">${body}</div>`;
}

function titleHtml(card: Card, options: DeckOptions): string {
  const size = card.title_size || options.default_title_size || '13';
  return `<div class="card-name card-title card-title-${size.replace(/[^0-9a-z]/gi, '')}">${card.title || ''}</div>`;
}

function iconHtml(card: Card, options: DeckOptions): string {
  const icon = safeIcon(iconFront(card, options));
  const cls = options.icon_inline ? 'inlineicon' : 'icon';
  return `<div class="card-title-${cls}-container"><div class="card-title-${cls}" style="--icon:url('${iconUrl(icon)}')"></div></div>`;
}

function wrapperStart(card: Card, options: DeckOptions, color: string): string {
  const size = options.card_size;
  const custom =
    size === 'custom' ? `;--custom-width:${options.custom_width}in;--custom-height:${options.custom_height}in` : '';
  return `<div class="card card-size-${size}${options.rounded_corners ? ' rounded-corners' : ''}" style="--card-color:${cardColorTriplet(color)}${custom}">`;
}

const finish = (html: string) => sanitizeHtml(bbcodeToHtml(html));

export function renderFront(card: Card, options: DeckOptions): string {
  const html =
    wrapperStart(card, options, colorFront(card, options)) +
    iconHtml(card, options) +
    titleHtml(card, options) +
    contents(card.contents, card, options) +
    '</div>';
  return finish(html);
}

function renderBackText(card: Card, options: DeckOptions): string {
  const html =
    wrapperStart(card, options, colorFront(card, options)) +
    iconHtml(card, options) +
    titleHtml(card, options) +
    contents(card.back_contents, card, options) +
    '</div>';
  return finish(html);
}

export function renderBack(card: Card, options: DeckOptions): string {
  if (card.background_text_toggle) return renderBackText(card, options);

  const color = colorBack(card, options);
  const hex = cssColor(color);
  const url = card.background_image ? String(card.background_image).replace(/["')\\\n]/g, encodeURIComponent) : '';
  const style = url
    ? `style="background-image: url(&quot;${esc(url)}&quot;); background-size: contain; background-position: center; background-repeat: no-repeat;"`
    : `style="background: radial-gradient(ellipse at center, white 20%, ${hex} 120%)"`;
  const icon = safeIcon(iconBack(card, options));

  let html = wrapperStart(card, options, color);
  html += `<div class="card-back" ${style}>`;
  if (!url) {
    html += `<div class="card-back-inner"><div class="card-back-icon" style="--icon:url('${iconUrl(icon)}');color:${hex};border-color:${hex};background-color:${hex}"></div></div>`;
  }
  html += '</div></div>';
  return sanitizeHtml(html);
}
