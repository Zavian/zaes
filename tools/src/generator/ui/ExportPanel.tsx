import React, { useEffect, useState } from 'react';
import { Check, Clipboard, Download, Upload } from 'lucide-react';
import { toHex } from '../core/color';
import { renderBack, renderFront } from '../core/render';
import { Card, DeckOptions } from '../core/types';
import { canvasToDownload, renderCardCanvas, uploadCanvas } from './exportImage';
import { Button, Input, Label, Panel, Textarea } from './primitives';
import { loadHistory, saveHistory } from './storage';

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

  useEffect(() => setHistory(loadHistory()), []);
  // New card selected: previous links no longer apply.
  const cardKey = card ? `${card.title}` : '';
  useEffect(() => {
    setFront('');
    setBack('');
  }, [cardKey]);

  const sides = (): [string, string] => [renderFront(card!, options), renderBack(card!, options)];

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
    setBusy('Rendering…');
    try {
      const [f, b] = sides();
      const [fc, bc] = await Promise.all([renderCardCanvas(f), renderCardCanvas(b)]);
      setBusy('Uploading…');
      const [fu, bu] = await Promise.all([uploadCanvas(fc), uploadCanvas(bc)]);
      setFront(fu);
      setBack(bu);
      notify('Uploaded. Links are ready to copy.');
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
          <Button variant="primary" onClick={upload} disabled={!card || !!busy} title="Upload front and back to imgbb (Ctrl+E)">
            <Upload className="w-3.5 h-3.5" /> Upload to imgbb
          </Button>
          {busy && <span className="self-center text-xs font-mono text-gray-500 dark:text-gray-400">{busy}</span>}
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
