import { fitTitles } from '../core/fit';

// The original generator's shared imgbb key. It is public by nature (it ships in the page), which is
// how the live tool has always worked; replace it here if the key is ever rotated.
const IMGBB_KEY = 'a10818892eab6dcc372baa73e41ec14f';

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
  const [{ default: html2canvas }] = await Promise.all([import('html2canvas'), preloadIcons(html), document.fonts?.ready]);
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-100000px;top:0;pointer-events:none;';
  host.innerHTML = html;
  document.body.appendChild(host);
  try {
    fitTitles(host);
    const el = host.firstElementChild as HTMLElement;
    return await html2canvas(el, { scale, useCORS: true, logging: false });
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

export async function uploadCanvas(canvas: HTMLCanvasElement): Promise<string> {
  let data: string;
  try {
    data = canvas.toDataURL('image/jpeg').split(',')[1];
  } catch {
    data = canvas.toDataURL().split(',')[1];
  }
  const body = new FormData();
  body.append('key', IMGBB_KEY);
  body.append('image', data);
  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.error?.message || `Upload failed (${res.status})`);
  return json.data.url as string;
}
