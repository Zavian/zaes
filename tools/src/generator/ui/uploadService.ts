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

export interface UploadedFile {
  url: string;
  size: number; // bytes stored (images are converted, so this can be smaller than the original)
  duplicate: boolean;
}

// Uploads any accepted file as it is; the server converts images and stores PDF/text untouched.
export async function uploadFile(file: File, key: string, folder = ''): Promise<UploadedFile> {
  const body = new FormData();
  body.append('file', file, file.name);
  if (folder) body.append('folder', folder);
  const json = await request('/upload', key, { method: 'POST', body });
  return { url: json.url as string, size: json.size as number, duplicate: Boolean(json.duplicate) };
}

export const formatMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;

// ---------------------------------------------------------------------------
// Other image hosts, used with the person's own key
// ---------------------------------------------------------------------------
export type HostId = 'zaes' | 'imgur' | 'imgbb';

export const HOSTS: Record<HostId, { label: string; keyLabel: string; placeholder: string; helpText: string; helpUrl: string; helpLink: string }> = {
  zaes: { label: 'upload.zaes.dev', keyLabel: 'API key', placeholder: 'zup_…', helpText: 'Invite only. Got an invite code?', helpLink: 'Create your key', helpUrl: JOIN_URL },
  imgur: {
    label: 'Imgur',
    keyLabel: 'Client ID',
    placeholder: 'Imgur Client ID',
    helpText: 'Register an application (anonymous usage) to get your own Client ID.',
    helpLink: 'Register at Imgur',
    helpUrl: 'https://api.imgur.com/oauth2/addclient',
  },
  imgbb: { label: 'imgbb', keyLabel: 'API key', placeholder: 'imgbb API key', helpText: 'Free account, one key.', helpLink: 'Get an imgbb key', helpUrl: 'https://api.imgbb.com/' },
};

const HOST_KEY = 'zaes_upload_host';
const hostKeyName = (h: HostId) => (h === 'zaes' ? KEY_STORAGE : `zaes_upload_key_${h}`);

export const loadHost = (): HostId => {
  try {
    const h = localStorage.getItem(HOST_KEY);
    return h === 'imgur' || h === 'imgbb' ? h : 'zaes';
  } catch {
    return 'zaes';
  }
};
export const saveHost = (h: HostId) => {
  try {
    localStorage.setItem(HOST_KEY, h);
  } catch {
    /* ignore */
  }
};
export const loadHostKey = (h: HostId): string => {
  try {
    return localStorage.getItem(hostKeyName(h)) ?? '';
  } catch {
    return '';
  }
};
export const saveHostKey = (h: HostId, key: string) => {
  try {
    if (key) localStorage.setItem(hostKeyName(h), key);
    else localStorage.removeItem(hostKeyName(h));
  } catch {
    /* ignore */
  }
};

async function thirdParty(url: string, init: RequestInit, pick: (json: any) => string | undefined, errorOf: (json: any) => string | undefined) {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error('Could not reach the image host (blocked, offline, or not available in your country).');
  }
  const json = await res.json().catch(() => null);
  const link = res.ok ? pick(json) : undefined;
  if (!link) throw new Error(errorOf(json) || `The image host refused the upload (${res.status}).`);
  return link;
}

// Uploads a card image to the chosen host and returns its URL. Third-party hosts get PNG (no transcoding surprises).
export async function uploadCard(host: HostId, canvas: HTMLCanvasElement, key: string): Promise<string> {
  if (host === 'zaes') return uploadCanvas(canvas, key);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not render the image');
  const body = new FormData();
  body.append('image', blob, 'card.png');
  if (host === 'imgur') {
    return thirdParty(
      'https://api.imgur.com/3/image',
      { method: 'POST', headers: { Authorization: `Client-ID ${key}` }, body },
      (j) => j?.data?.link,
      (j) => (typeof j?.data?.error === 'string' ? j.data.error : j?.data?.error?.message)
    );
  }
  return thirdParty(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`,
    { method: 'POST', body },
    (j) => j?.data?.url,
    (j) => j?.error?.message
  );
}
