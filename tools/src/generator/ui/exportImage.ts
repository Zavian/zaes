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
      el.style.setProperty('--icon', `url('${await cache.get(key)}')`);
    } catch {
      /* keep the original icon if it cannot be read */
    }
  });
  await Promise.all(jobs);
}

// Render a card's HTML at natural size, off-screen, so the result is crisp regardless of preview scaling.
export async function renderCardCanvas(html: string, scale = 2.5): Promise<HTMLCanvasElement> {
  // html-to-image lets the browser itself draw the card (as an SVG foreignObject), so text, gradients and the
  // 512px icons come out exactly as in the preview and at full resolution; html2canvas re-implements CSS and
  // draws background images at 1x.
  const [{ toCanvas }] = await Promise.all([import('html-to-image'), preloadIcons(html), document.fonts?.ready]);
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-100000px;top:0;pointer-events:none;';
  host.innerHTML = html;
  document.body.appendChild(host);
  try {
    fitTitles(host);
    await prescaleIcons(host, scale);
    const el = host.firstElementChild as HTMLElement;
    return await toCanvas(el, { pixelRatio: scale });
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
