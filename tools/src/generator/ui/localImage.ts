const MAX_SIDE = 800; // card pictures never need more; keeps the save file small
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function load(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file is not an image the browser can read.'));
    };
    img.src = url;
  });
}

// Read a picture from disk, shrink it and return it as a WebP data URL (alpha is kept).
export async function readLocalImage(file: File, taken: string[]): Promise<{ name: string; dataUrl: string }> {
  if (file.size > MAX_FILE_BYTES) throw new Error('Image is larger than 20 MB.');
  const img = await load(file);
  const natW = img.naturalWidth || 512;
  const natH = img.naturalHeight || 512;
  const k = Math.min(1, MAX_SIDE / Math.max(natW, natH));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(natW * k));
  canvas.height = Math.max(1, Math.round(natH * k));
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const base = file.name.replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'image';
  let name = base;
  for (let i = 2; taken.includes(name) || name === 'icon'; i++) name = `${base}-${i}`;
  return { name, dataUrl: canvas.toDataURL('image/webp', 0.9) };
}
