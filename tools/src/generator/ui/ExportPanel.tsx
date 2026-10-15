import React, { useEffect, useState } from 'react';
import { Check, Clipboard, Download, Link2Off, Upload } from 'lucide-react';
import { toHex } from '../core/color';
import { renderBack, renderFront } from '../core/render';
import { Card, DeckOptions } from '../core/types';
import { canvasToDownload, renderCardCanvas } from './exportImage';
import { HOSTS, HostId, UploadAccount, fetchAccount, formatMB, loadHost, loadHostKey, saveHost, saveHostKey, uploadCard } from './uploadService';
import { Button, Input, Label, Panel, Select, Textarea } from './primitives';
import { contentId, loadHistory, loadLinks, saveHistory, saveLink } from './storage';

interface Props {
  card: Card | undefined;
  options: DeckOptions;
  uploadSignal: number; // bump to trigger an upload (Ctrl+E)
  notify: (msg: string) => void;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'card';

export const ExportPanel: React.FC<Props> = ({ card, options, uploadSignal, notify }) => {
  const [busy, setBusy] = useState<string | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [host, setHost] = useState<HostId>('zaes');
  const [keys, setKeys] = useState<Record<HostId, string>>({ zaes: '', imgur: '', imgbb: '' });
  const [account, setAccount] = useState<UploadAccount | null>(null);
  const [draft, setDraft] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');
  const key = keys[host];
  const meta = HOSTS[host];

  // Restore the chosen host and the keys saved in this browser (and re-check the upload.zaes.dev one).
  useEffect(() => {
    setHost(loadHost());
    setKeys({ zaes: loadHostKey('zaes'), imgur: loadHostKey('imgur'), imgbb: loadHostKey('imgbb') });
    const saved = loadHostKey('zaes');
    if (saved) fetchAccount(saved).then(setAccount, () => undefined); // offline or revoked: the key stays until disconnected
  }, []);

  const chooseHost = (h: HostId) => {
    setHost(h);
    saveHost(h);
    setDraft('');
    setConnectError('');
  };

  const connect = async () => {
    const candidate = draft.trim();
    if (!candidate) return;
    setConnecting(true);
    setConnectError('');
    try {
      if (host === 'zaes') setAccount(await fetchAccount(candidate)); // only our own host can check a key without uploading
      saveHostKey(host, candidate);
      setKeys((k) => ({ ...k, [host]: candidate }));
      setDraft('');
    } catch (e) {
      setConnectError((e as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    saveHostKey(host, '');
    setKeys((k) => ({ ...k, [host]: '' }));
    if (host === 'zaes') setAccount(null);
  };

  useEffect(() => setHistory(loadHistory()), []);
  const sides = (): [string, string] => [renderFront(card!, options), renderBack(card!, options)];

  // Show the links saved for this exact card content; an edited (or different) card has none.
  const cardId = React.useMemo(() => (card ? contentId(...sides()) : ''), [card, options]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const saved = cardId ? loadLinks()[cardId] : undefined;
    setFront(saved?.front ?? '');
    setBack(saved?.back ?? '');
  }, [cardId]);

  const download = async () => {
    if (!card) return;
    setBusy('Rendering…');
    try {
      const [f, b] = sides();
      const [fc, bc] = await Promise.all([renderCardCanvas(f), renderCardCanvas(b)]);
      canvasToDownload(fc, `${slug(card.title)}-front.png`);
      canvasToDownload(bc, `${slug(card.title)}-back.png`);
    } catch (e) {
      notify(`Export failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const upload = async () => {
    if (!card) return;
    if (!key) return notify(`Add your ${meta.label} ${meta.keyLabel} first (Export panel).`);
    setBusy('Rendering…');
    try {
      const [f, b] = sides();
      const [fc, bc] = await Promise.all([renderCardCanvas(f), renderCardCanvas(b)]);
      setBusy('Uploading…');
      const [fu, bu] = await Promise.all([uploadCard(host, fc, key), uploadCard(host, bc, key)]);
      setFront(fu);
      setBack(bu);
      saveLink(cardId, { front: fu, back: bu });
      notify('Uploaded. Links are ready to copy.');
      if (host === 'zaes') fetchAccount(key).then(setAccount, () => undefined);
    } catch (e) {
      notify(`Upload failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  // Ctrl+E bumps `uploadSignal`; compare against the last seen value so StrictMode's double effect run is harmless.
  const lastSignal = React.useRef(uploadSignal);
  useEffect(() => {
    if (uploadSignal === lastSignal.current) return;
    lastSignal.current = uploadSignal;
    void upload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadSignal]);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      notify('Could not access the clipboard.');
    }
  };

  // Tabletop Simulator line: "<#color or -w> <front url> <back url>", newest first.
  const copyLine = () => {
    const color = toHex(card?.color) ?? '-w';
    const line = `${color} ${front} ${back}`;
    const next = [line, ...history];
    setHistory(next);
    saveHistory(next);
    void copy(line, 'line');
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const CopyBtn = ({ value, k }: { value: string; k: string }) => (
    <Button size="icon" disabled={!value} onClick={() => copy(value, k)} aria-label={`Copy ${k} link`}>
      {copied === k ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
    </Button>
  );

  return (
    <Panel title="Export">
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={download} disabled={!card || !!busy}>
            <Download className="w-3.5 h-3.5" /> Download PNGs
          </Button>
          <Button variant="primary" onClick={upload} disabled={!card || !!busy || !key} title={key ? `Upload front and back to ${meta.label} (Ctrl+E)` : `Add your ${meta.label} ${meta.keyLabel} first`}>
            <Upload className="w-3.5 h-3.5" /> Upload
          </Button>
          {busy && <span className="self-center text-xs font-mono text-gray-500 dark:text-gray-400">{busy}</span>}
        </div>

        <div className="rounded border border-gray-200 dark:border-[#2E333D] p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="upload-host" className="!mb-0 shrink-0">Host</Label>
            <Select id="upload-host" value={host} onChange={(e) => chooseHost(e.target.value as HostId)}>
              {(Object.keys(HOSTS) as HostId[]).map((h) => (
                <option key={h} value={h}>{HOSTS[h].label}</option>
              ))}
            </Select>
          </div>

          {host === 'imgur' && (
            <p role="note" className="rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              Imgur does not work in the United Kingdom (blocked because of UK legislation): images hosted there will not load for people in the UK, and uploads from the UK fail. Pick another host if that matters to you.
            </p>
          )}

          {key ? (
            <div className="flex items-center justify-between gap-3 text-xs font-mono">
              <span className="text-gray-600 dark:text-gray-300">
                {host === 'zaes' && account ? (
                  <>
                    Connected to upload.zaes.dev as <strong>{account.label}</strong>
                    {account.quotaBytes > 0 && <span className="text-gray-400 dark:text-gray-500"> · {formatMB(account.usedBytes)} / {formatMB(account.quotaBytes)}</span>}
                  </>
                ) : (
                  <>Using your {meta.label} {meta.keyLabel}</>
                )}
              </span>
              <Button size="sm" variant="ghost" onClick={disconnect} title="Forget the key in this browser">
                <Link2Off className="w-3.5 h-3.5" /> Remove
              </Button>
            </div>
          ) : (
            <>
              <Label htmlFor="upload-key" hint={`your own ${meta.label} ${meta.keyLabel}`}>{meta.keyLabel}</Label>
              <div className="flex gap-2">
                <Input
                  id="upload-key"
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void connect()}
                  placeholder={meta.placeholder}
                  className="font-mono"
                />
                <Button variant="primary" onClick={connect} disabled={!draft.trim() || connecting}>{connecting ? 'Checking…' : host === 'zaes' ? 'Connect' : 'Save'}</Button>
              </div>
              {connectError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{connectError}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {meta.helpText}{' '}
                <a className="underline hover:text-emerald-600 dark:hover:text-emerald-400" href={meta.helpUrl} target="_blank" rel="noopener noreferrer">{meta.helpLink}</a>
                . The key stays in this browser. Downloading PNGs needs no key.
              </p>
            </>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <Label htmlFor="export-front">Front link</Label>
            <div className="flex gap-2">
              <Input id="export-front" readOnly value={front} placeholder="Upload to get a link" className="font-mono" />
              <CopyBtn value={front} k="front" />
            </div>
          </div>
          <div>
            <Label htmlFor="export-back">Back link</Label>
            <div className="flex gap-2">
              <Input id="export-back" readOnly value={back} placeholder="Upload to get a link" className="font-mono" />
              <CopyBtn value={back} k="back" />
            </div>
          </div>
          <Button onClick={copyLine} disabled={!front || !back} className="w-full">
            {copied === 'line' ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />} Copy Tabletop Simulator line
          </Button>
        </div>

        {history.length > 0 && (
          <div>
            <Label hint="newest first">Copied lines</Label>
            <Textarea readOnly rows={Math.min(Math.max(history.length, 3), 8)} value={history.join('\n')} className="text-[11px] whitespace-pre" wrap="off" />
            <Button variant="danger" size="sm" className="mt-2" onClick={clearHistory}>
              Clear lines
            </Button>
          </div>
        )}
      </div>
    </Panel>
  );
};
