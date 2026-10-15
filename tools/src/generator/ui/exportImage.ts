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
