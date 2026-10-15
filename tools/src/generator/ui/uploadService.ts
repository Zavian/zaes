// Client for upload.zaes.dev: each person connects with their own API key (obtained with an invite
// at /join.html). The key stays in this browser's storage and is only ever sent to that host.
export const UPLOAD_BASE = (import.meta.env?.VITE_UPLOAD_BASE as string | undefined) ?? 'https://upload.zaes.dev';
export const JOIN_URL = `${UPLOAD_BASE}/join.html`;

const KEY_STORAGE = 'zaes_upload_api_key';

export interface UploadAccount {
  label: string;
  usedBytes: number;
  quotaBytes: number;
}

export const loadUploadKey = (): string => {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
};

export const saveUploadKey = (key: string) => {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* storage blocked: the key lasts until the page closes */
  }
};

async function request(path: string, key: string, init: RequestInit = {}) {
  let res: Response;
  try {
    res = await fetch(`${UPLOAD_BASE}${path}`, { ...init, headers: { ...init.headers, Authorization: `Bearer ${key}` } });
  } catch {
    throw new Error('Could not reach upload.zaes.dev');
  }
  const json = await res.json().catch(() => null);
  if (res.status === 401) throw new Error('That API key is not valid (it may have been revoked).');
  if (!res.ok || !json?.success) throw new Error(json?.error || `Upload service error (${res.status})`);
  return json;
}

// Validates the key and reports how much storage is left.
export async function fetchAccount(key: string): Promise<UploadAccount> {
  const me = await request('/api/me', key);
  return me.admin
    ? { label: 'admin', usedBytes: 0, quotaBytes: 0 }
    : { label: me.label, usedBytes: me.usedBytes, quotaBytes: me.quotaBytes };
}

// Uploads a card image; the server converts it to WebP (Tabletop Simulator reads it) and returns its public URL.
export async function uploadCanvas(canvas: HTMLCanvasElement, key: string): Promise<string> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not render the image');
  const body = new FormData();
  body.append('file', blob, 'card.png');
  body.append('folder', 'cards');
  const json = await request('/upload', key, { method: 'POST', body });
  return json.url as string;
}

export const formatMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
