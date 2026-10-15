import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, FileText, Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { Button, Input, Label, Panel } from '../generator/ui/primitives';
import {
  JOIN_URL,
  UPLOAD_BASE,
  UploadAccount,
  fetchAccount,
  formatMB,
  loadUploadKey,
  saveUploadKey,
  uploadFile,
} from '../generator/ui/uploadService';

const ACCEPT = 'image/*,.pdf,.txt,.md,.json,.csv';

interface Item {
  id: number;
  name: string;
  size: number;
  isImage: boolean;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  storedSize?: number;
  duplicate?: boolean;
  error?: string;
}

const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : formatMB(bytes));

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
    >
      {done ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {done ? 'Copied' : 'Copy link'}
    </Button>
  );
};

export default function UploadPage() {
  const [key, setKey] = useState(loadUploadKey);
  const [draft, setDraft] = useState('');
  const [account, setAccount] = useState<UploadAccount | null>(null);
  const [connectError, setConnectError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [folder, setFolder] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(1);
  const input = useRef<HTMLInputElement>(null);

  const refreshAccount = (k: string) => fetchAccount(k).then(setAccount, () => undefined);
  useEffect(() => {
    if (key) void refreshAccount(key);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = async () => {
    const k = draft.trim();
    if (!k) return;
    setConnecting(true);
    setConnectError('');
    try {
      setAccount(await fetchAccount(k));
      saveUploadKey(k);
      setKey(k);
      setDraft('');
    } catch (e) {
      setConnectError((e as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    saveUploadKey('');
    setKey('');
    setAccount(null);
  };

  const patch = (id: number, change: Partial<Item>) => setItems((all) => all.map((i) => (i.id === id ? { ...i, ...change } : i)));

  const send = async (files: File[]) => {
    const added: Item[] = files.map((f) => ({
      id: nextId.current++,
      name: f.name,
      size: f.size,
      isImage: f.type.startsWith('image/'),
      status: 'uploading',
    }));
    setItems((all) => [...added, ...all]);
    for (const [n, file] of files.entries()) {
      try {
        const r = await uploadFile(file, key, folder.trim());
        patch(added[n].id, { status: 'done', url: r.url, storedSize: r.size, duplicate: r.duplicate });
      } catch (e) {
        patch(added[n].id, { status: 'error', error: (e as Error).message });
      }
    }
    void refreshAccount(key);
  };

  const folderOk = folder === '' || /^[a-zA-Z0-9_-]{1,64}(\/[a-zA-Z0-9_-]{1,64}){0,1}$/.test(folder.trim());
  const used = account && account.quotaBytes > 0 ? Math.min(100, (account.usedBytes / account.quotaBytes) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F3F4F6]">File upload</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
          Images are converted to compact WebP. PDF, txt, md, json and csv files are stored as they are. Each upload gives you a link.
        </p>
      </div>

      <Panel title="Your key">
        <div className="p-4 space-y-3">
          {key ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1 text-sm">
                <p className="text-[#1A1A1A] dark:text-[#F3F4F6]">
                  Connected{account ? <> as <strong>{account.label}</strong></> : null}
                </p>
                {account && account.quotaBytes > 0 && (
                  <div className="mt-2 max-w-xs">
                    <div className="h-1.5 rounded bg-gray-200 dark:bg-[#2E333D] overflow-hidden" role="progressbar" aria-valuenow={Math.round(used)} aria-valuemin={0} aria-valuemax={100} aria-label="Storage used">
                      <div className="h-full bg-emerald-600" style={{ width: `${used}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatMB(account.usedBytes)} of {formatMB(account.quotaBytes)} used
                    </p>
                  </div>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={disconnect} title="Forget the key in this browser">
                <X className="w-3.5 h-3.5" /> Disconnect
              </Button>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="upload-key" hint="your own upload.zaes.dev key">API key</Label>
                <div className="flex gap-2">
                  <Input
                    id="upload-key"
                    type="password"
                    autoComplete="off"
                    placeholder="zup_…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void connect()}
                    className="font-mono"
                  />
                  <Button variant="primary" onClick={connect} disabled={!draft.trim() || connecting}>
                    {connecting ? 'Checking…' : 'Connect'}
                  </Button>
                </div>
              </div>
              {connectError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{connectError}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Invite only. Got an invite code?{' '}
                <a className="underline" href={JOIN_URL} target="_blank" rel="noopener noreferrer">Create your key</a>. The key stays in this browser and is only sent to upload.zaes.dev.
              </p>
            </>
          )}
        </div>
      </Panel>

      <Panel title="Upload">
        <div className="p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
            <div>
              <Label htmlFor="upload-folder" hint="optional, up to two levels like notes/session1">Folder</Label>
              <Input id="upload-folder" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="no folder" className="font-mono" aria-invalid={!folderOk} />
              {!folderOk && <p className="mt-1 text-xs text-red-600 dark:text-red-400">Use letters, digits, _ or -, separated by /.</p>}
            </div>
            <div>
              <input
                ref={input}
                type="file"
                multiple
                accept={ACCEPT}
                hidden
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = '';
                  if (files.length) void send(files);
                }}
              />
              <Button variant="primary" disabled={!key || !folderOk} onClick={() => input.current?.click()}>
                <Upload className="w-3.5 h-3.5" /> Choose files
              </Button>
            </div>
          </div>
          {!key && <p className="text-xs text-gray-500 dark:text-gray-400">Connect your key first.</p>}

          {items.length > 0 && (
            <ul className="divide-y divide-gray-200 dark:divide-[#2E333D] rounded border border-gray-200 dark:border-[#2E333D]">
              {items.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                  {i.isImage ? <ImageIcon className="w-4 h-4 shrink-0 text-gray-400" /> : <FileText className="w-4 h-4 shrink-0 text-gray-400" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#1A1A1A] dark:text-[#F3F4F6]" title={i.name}>{i.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {i.status === 'uploading' && 'Uploading…'}
                      {i.status === 'error' && <span className="text-red-600 dark:text-red-400">{i.error}</span>}
                      {i.status === 'done' &&
                        (i.isImage && i.storedSize != null && i.storedSize < i.size
                          ? `${formatSize(i.size)} → ${formatSize(i.storedSize)}`
                          : formatSize(i.storedSize ?? i.size)) +
                          (i.duplicate ? ' · already uploaded, same link' : '')}
                    </p>
                  </div>
                  {i.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" aria-label="Uploading" />}
                  {i.status === 'done' && i.url && (
                    <div className="flex items-center gap-2">
                      <CopyButton text={i.url} />
                      <a className="inline-flex" href={i.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${i.name}`} title="Open">
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500 hover:text-emerald-700" />
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Manage or delete your files in the{' '}
        <a className="underline" href={UPLOAD_BASE} target="_blank" rel="noopener noreferrer">gallery</a>.
      </p>
    </div>
  );
}
