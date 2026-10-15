import { fitTitles } from '../core/fit';

import { ICON_URL_RE } from '../core/assets';

// Wait until every icon referenced by `html` is in the HTTP cache (background images are not awaited by html2canvas/print).
export async function preloadIcons(html: string, timeoutMs = 4000) {
  const urls = Array.from(new Set(html.match(ICON_URL_RE) ?? []));
  const jobs = urls.map(
    (u) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = u;
      })
  );
  await Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(r, timeoutMs))]);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Halve repeatedly until near the target: one big downscale (512px -> ~65px) is where browsers alias badly.
function downscale(img: HTMLImageElement, size: number): string {
  let src: CanvasImageSource = img;
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  const target = Math.max(1, Math.round(size));
  const ratio = h / w;
  while (w / 2 > target) {
    w = Math.round(w / 2);
    h = Math.round(h / 2);
    const step = document.createElement('canvas');
    step.width = w;
    step.height = h;
    const ctx = step.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, 0, 0, w, h);
    src = step;
  }
  const out = document.createElement('canvas');
  out.width = target;
  out.height = Math.max(1, Math.round(target * ratio));
  const ctx = out.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}

// Swap each icon for a copy already scaled to the size it will be drawn at in the export.
async function prescaleIcons(host: HTMLElement, scale: number) {
  const cache = new Map<string, Promise<string>>();
  const jobs = Array.from(host.querySelectorAll<HTMLElement>('[style*="--icon"]')).map(async (el) => {
    const url = /--icon:\s*url\(['"]?([^'")]+)['"]?\)/.exec(el.getAttribute('style') ?? '')?.[1];
    if (!url) return;
    const box = el.classList.contains('card-inline-icon') ? el.clientHeight * 0.8 : Math.min(el.clientWidth, el.clientHeight);
    const size = Math.round(box * scale);
    if (!size) return;
    const key = `${url}@${size}`;
    if (!cache.has(key)) cache.set(key, loadImage(url).then((img) => downscale(img, size)));
    try {
      // html2canvas does not resolve var() in background-image, so set it directly as well.
      const icon = `url('${await cache.get(key)}')`;
      el.style.setProperty('--icon', icon);
      el.style.backgroundImage = icon;
    } catch {
      /* keep the original icon if it cannot be read */
    }
  });
  await Promise.all(jobs);
}

const BACK_GRADIENT_RE = /radial-gradient\([^,]*,\s*white 20%,\s*(.+?)\s+120%\)/i;

// html2canvas cannot parse `radial-gradient(ellipse at center, ...)`; paint the same gradient to a canvas instead.
function rasterizeBackGradient(host: HTMLElement, scale: number) {
  host.querySelectorAll<HTMLElement>('.card-back').forEach((el) => {
    const edge = BACK_GRADIENT_RE.exec(el.getAttribute('style') ?? '')?.[1];
    const box = el.getBoundingClientRect();
    if (!edge || !box.width || !box.height) return;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(box.width * scale);
    canvas.height = Math.round(box.height * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = edge;
    const end = ctx.fillStyle; // normalised to #rrggbb
    const mix = (i: number) => Math.round(255 + (parseInt(end.slice(1 + 2 * i, 3 + 2 * i), 16) - 255) * 0.8);
    // CSS default size is farthest-corner: an ellipse through the corners with the box's aspect ratio.
    const rx = (canvas.width / 2) * Math.SQRT2;
    const ry = (canvas.height / 2) * Math.SQRT2;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    gradient.addColorStop(0.2, '#fff');
    gradient.addColorStop(1, `rgb(${mix(0)},${mix(1)},${mix(2)})`);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(rx, ry);
    ctx.fillStyle = gradient;
    ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
    el.style.background = `url('${canvas.toDataURL('image/png')}') center / 100% 100% no-repeat`;
  });
}

const SHADOW_LAYER_RE = /drop-shadow\((-?[\d.]+)px (-?[\d.]+)px ([\d.]+)px (rgba\([^)]*\))\)/g;

// Draw `img` inside the box (x, y, w, h) the way `object-fit: contain` does.
function drawContained(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const k = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * k;
  const dh = img.naturalHeight * k;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function roundedClip(ctx: CanvasRenderingContext2D, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, Math.min(r, w / 2, h / 2));
  ctx.clip();
}

// html2canvas ignores `filter` (shadow/glow) and `mask-image` (fill=), so those picture blocks are painted to a
// canvas here, shadows included, and swapped in as one image.
async function bakeImageEffects(host: HTMLElement, scale: number) {
  const blocks = Array.from(host.querySelectorAll<HTMLElement>('.card-image-block')).filter(
    (el) => el.querySelector('.card-image-fill') || el.style.filter
  );
  await Promise.all(
    blocks.map(async (block) => {
      const picture = block.querySelector<HTMLImageElement>('img.card-image');
      if (!picture) return;
      const layers = Array.from((block.getAttribute('style') ?? '').matchAll(SHADOW_LAYER_RE), (m) => ({
        x: Number(m[1]) * scale,
        y: Number(m[2]) * scale,
        blur: Number(m[3]) * scale,
        color: m[4],
      }));
      const box = block.getBoundingClientRect();
      const inner = picture.getBoundingClientRect();
      const fill = block.querySelector<HTMLElement>('.card-image-fill');
      try {
        const source = await loadImage(picture.src);
        const w = Math.round(box.width * scale);
        const h = Math.round(box.height * scale);
        const pad = Math.ceil(Math.max(0, ...layers.map((l) => Math.abs(l.x) + Math.abs(l.y) + l.blur * 1.5)));

        const content = document.createElement('canvas');
        content.width = w;
        content.height = h;
        const cctx = content.getContext('2d')!;
        cctx.save();
        roundedClip(cctx, w, h, parseFloat(getComputedStyle(block).borderTopLeftRadius || '0') * scale);
        drawContained(cctx, source, (inner.left - box.left) * scale, (inner.top - box.top) * scale, inner.width * scale, inner.height * scale);
        if (fill) {
          cctx.globalCompositeOperation = 'source-in';
          cctx.fillStyle = getComputedStyle(fill).backgroundColor;
          cctx.fillRect(0, 0, w, h);
        }
        cctx.restore();

        // Each drop-shadow acts on the result of the one before, like the CSS filter chain.
        let current = document.createElement('canvas');
        current.width = w + pad * 2;
        current.height = h + pad * 2;
        current.getContext('2d')!.drawImage(content, pad, pad);
        for (const l of layers) {
          const next = document.createElement('canvas');
          next.width = current.width;
          next.height = current.height;
          const nctx = next.getContext('2d')!;
          nctx.shadowColor = l.color;
          nctx.shadowBlur = l.blur;
          nctx.shadowOffsetX = l.x;
          nctx.shadowOffsetY = l.y;
          nctx.drawImage(current, 0, 0);
          current = next;
        }

        const baked = document.createElement('img');
        baked.src = current.toDataURL('image/png');
        const px = (v: number) => `${v / scale}px`;
        baked.style.cssText = `position:absolute;display:block;max-width:none;left:${px(-pad)};top:${px(-pad)};width:${px(current.width)};height:${px(current.height)}`;
        block.style.cssText += `;position:relative;overflow:visible;filter:none;width:${box.width}px;height:${box.height}px`;
        block.replaceChildren(baked);
      } catch {
        /* leave the block as it is if the picture cannot be read */
      }
    })
  );
}

// Render a card's HTML at natural size, off-screen, so the result is crisp regardless of preview scaling.
export async function renderCardCanvas(html: string, scale = 2.5): Promise<HTMLCanvasElement> {
  // html2canvas paints the card from the live layout, so line wrapping and spacing match the preview (and the
  // original generator); icons are pre-scaled below because it draws background images at their given size.
  const [{ default: html2canvas }] = await Promise.all([import('html2canvas'), preloadIcons(html), document.fonts?.ready]);
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-100000px;top:0;pointer-events:none;';
  host.innerHTML = html;
  document.body.appendChild(host);
  try {
    fitTitles(host);
    await prescaleIcons(host, scale);
    rasterizeBackGradient(host, scale);
    await bakeImageEffects(host, scale);
    // html2canvas drops the tapered rule SVGs; an <img> of the same SVG is drawn reliably.
    host.querySelectorAll<SVGElement>('svg.card-ruler').forEach((svg) => {
      const box = svg.getBoundingClientRect();
      svg.setAttribute('width', String(box.width));
      svg.setAttribute('height', String(box.height));
      const img = document.createElement('img');
      img.className = svg.getAttribute('class') ?? '';
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
      img.style.cssText = `width:${box.width}px;height:${box.height}px`;
      svg.replaceWith(img);
    });
    const el = host.firstElementChild as HTMLElement;
    return await html2canvas(el, { scale, backgroundColor: null, useCORS: true, logging: false });
  } finally {
    host.remove();
  }
}

export function canvasToDownload(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}
