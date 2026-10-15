import { hexToRgb, toHex } from './color';
import { Card } from './types';

// `image | size | src | options...`
//   size: 120, 120px, 120x80 or 50%        (width, or width x height)
//   src:  @icon (the card's icon), @name (a file added from disk, stored on the card) or an https:// URL
//   options, any order: left|center|right, opacity=50, fill=card|<color>, radius=8,
//   shadow=card|black|<color>, shadow-opacity=50, glow=card|black|<color>
// Local pictures live in `card.images` (name -> data URL) so the save file stays self-contained.

export const ICON_REF = '@icon'; // in an image line: the card's own icon
const DATA_URL_RE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const LOCAL_REF_RE = /@([A-Za-z0-9_-]+)/g;

export const localImages = (card: Card): Record<string, string> =>
  card.images && typeof card.images === 'object' ? (card.images as Record<string, string>) : {};

export function resolveImageSrc(src: string, card: Card): string {
  const s = src.trim();
  if (s.startsWith('@')) {
    const data = localImages(card)[s.slice(1)];
    return data && DATA_URL_RE.test(data) ? data : '';
  }
  return /^https?:\/\//i.test(s) ? s.replace(/["'()\\\s<>]/g, encodeURIComponent) : '';
}

export interface ImageSpec {
  size: string; // 120, 120px, 120x80, 50%
  src: string; // @name or URL
  align: 'left' | 'center' | 'right';
  opacity: string; // 0-100, '' = 100
  fill: string; // '', 'card' or a color
  radius: string; // px, '' = same as the card
  shadow: string; // '', 'card', 'black' or a color
  shadowOpacity: string; // 0-100, '' = default
  glow: string; // '', 'card', 'black' or a color
}

export const DEFAULT_SHADOW_OPACITY = 50;

export const parseImageLine = (line: string): ImageSpec => {
  const [, size = '', src = '', ...opts] = line.split('|').map((s) => s.trim());
  const spec: ImageSpec = { size: size || '120', src, align: 'center', opacity: '', fill: '', radius: '', shadow: '', shadowOpacity: '', glow: '' };
  for (const opt of opts) {
    const eq = opt.indexOf('=');
    const key = (eq < 0 ? opt : opt.slice(0, eq)).trim().toLowerCase();
    const value = eq < 0 ? '' : opt.slice(eq + 1).trim();
    if (key === 'left' || key === 'center' || key === 'right') spec.align = key;
    else if (key === 'opacity' || key === 'radius' || key === 'fill' || key === 'shadow' || key === 'glow') spec[key] = value;
    else if (key === 'shadow-opacity') spec.shadowOpacity = value;
  }
  return spec;
};

export const formatImageLine = (s: ImageSpec): string =>
  ['image', s.size, s.src, s.align !== 'center' && s.align, s.opacity !== '' && `opacity=${s.opacity}`,
    s.fill && `fill=${s.fill}`, s.radius !== '' && `radius=${s.radius}`, s.shadow && `shadow=${s.shadow}`,
    s.shadow && s.shadowOpacity !== '' && `shadow-opacity=${s.shadowOpacity}`, s.glow && `glow=${s.glow}`]
    .filter(Boolean)
    .join(' | ');

const parseSize = (raw = ''): { w: string; h: string } => {
  const m = /^(\d+(?:\.\d+)?)(px|%)?(?:x(\d+(?:\.\d+)?)(?:px)?)?$/i.exec(raw.trim());
  if (!m) return { w: '120px', h: '' };
  const w = Math.min(Number(m[1]), m[2] === '%' ? 100 : 1200);
  return { w: `${w}${m[2] === '%' ? '%' : 'px'}`, h: m[3] ? `${Math.min(Number(m[3]), 1200)}px` : '' };
};

// 'card' | 'black' | a color -> #rrggbb ('' when unknown).
const effectColor = (value: string, cardColor: string) =>
  value.toLowerCase() === 'card' ? toHex(cardColor) ?? '' : value.toLowerCase() === 'black' ? '#000000' : toHex(value) ?? '';

// CSS drop-shadow() chain for the shadow and glow options. They follow the picture's own shape, transparency included.
// Always written as `drop-shadow(Xpx Ypx Bpx rgba(...))`: the exporter reads this back to bake the effect into the image.
function effectFilter(spec: ImageSpec, cardColor: string): string {
  const layer = (x: number, y: number, blur: number, hex: string, alpha: number) => {
    const { r, g, b } = hexToRgb(hex);
    return `drop-shadow(${x}px ${y}px ${blur}px rgba(${r},${g},${b},${alpha}))`;
  };
  const layers: string[] = [];
  const glow = effectColor(spec.glow, cardColor);
  if (glow) layers.push(layer(0, 0, 4, glow, 1), layer(0, 0, 10, glow, 1));
  const shadow = effectColor(spec.shadow, cardColor);
  if (shadow) {
    const o = parseFloat(spec.shadowOpacity);
    const alpha = Number.isNaN(o) ? DEFAULT_SHADOW_OPACITY / 100 : Math.min(Math.max(o, 0), 100) / 100;
    layers.push(layer(3, 4, 4, shadow, alpha));
  }
  return layers.join(' ');
}

// `cardRadius` is the card's own corner radius (px); pictures use it unless `radius=` says otherwise.
export function imageElement(line: string, card: Card, cardColor: string, cardRadius: number, icon = ''): string {
  const spec = parseImageLine(line);
  const isIcon = spec.src === ICON_REF;
  const url = isIcon ? icon : resolveImageSrc(spec.src, card);
  if (!url) return '';
  const { w, h } = parseSize(spec.size);
  const o = parseFloat(spec.opacity);
  const opacity = Number.isNaN(o) ? '' : String(Math.min(Math.max(o > 1 ? o / 100 : o, 0), 1));
  // The card's own icon is a silhouette: paint it in the card color unless told otherwise (fill=none).
  const wanted = spec.fill || (isIcon ? 'card' : '');
  const fill = wanted.toLowerCase() === 'card' ? cardColor : wanted.toLowerCase() === 'none' ? '' : toHex(wanted) ?? '';
  const r = parseFloat(spec.radius);
  const radius = Number.isNaN(r) ? cardRadius : Math.min(Math.max(r, 0), 200);
  const box = `width:${w};${h ? `height:${h};` : ''}`;
  const filter = effectFilter(spec, cardColor);
  const fx = (opacity ? `opacity:${opacity};` : '') + `border-radius:${radius}px;overflow:hidden;` + (filter ? `filter:${filter};` : '');
  const sizing = h ? 'height:100%;' : 'height:auto;';
  // With a fill the picture is only a mask: the invisible <img> keeps the aspect ratio, the colour shows through it.
  const inner = fill
    ? `<div class="card-image-fill" style="background-color:${fill};-webkit-mask-image:url('${url}');mask-image:url('${url}')"><img class="card-image" style="${sizing}visibility:hidden" src="${url}" alt=""></div>`
    : `<img class="card-image" style="${sizing}" src="${url}" alt="">`;
  return `<div class="card-element card-image-block align-${spec.align}" style="${box}${fx}">${inner}</div>`;
}

// `[img=24]@name[/img]`: a small picture inside a line of text.
export function inlineImages(text: string, card: Card): string {
  return text.replace(/\[img=(\d{1,3})\]([^[\]]*)\[\/img\]/gi, (_, size, src) => {
    const url = resolveImageSrc(src, card);
    return url ? `<img class="card-image-inline" style="height:${size}px" src="${url}" alt="">` : '';
  });
}

// Drop pictures no line refers to any more (called when a deck is saved).
export function pruneImages(card: Card): Card {
  const images = localImages(card);
  if (Object.keys(images).length === 0) return card;
  const text = [...card.contents, ...card.back_contents].join('\n');
  const used = new Set(Array.from(text.matchAll(LOCAL_REF_RE), (m) => m[1]));
  const kept = Object.fromEntries(Object.entries(images).filter(([name]) => used.has(name)));
  const { images: _drop, ...rest } = card;
  return Object.keys(kept).length > 0 ? { ...rest, images: kept } : (rest as Card);
}
