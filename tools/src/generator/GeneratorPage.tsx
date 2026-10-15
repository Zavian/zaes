import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CircleHelp, Download, Filter, FolderOpen, Printer, Sparkles, ArrowDownAZ, Trash2 } from 'lucide-react';
import './cards.css';
import { DeckParseError, cleanImportedCard, parseDeck, serializeDeck } from './core/normalize';
import sample from './sample.json';
import { CardEditor } from './ui/CardEditor';
import { DeckPanel } from './ui/DeckPanel';
import { ExportPanel } from './ui/ExportPanel';
import { Preview } from './ui/Preview';
import { PrintSheets } from './ui/PrintSheets';
import { SettingsPanel } from './ui/SettingsPanel';
import { CodeDialog, HelpDialog, ImportCardDialog, PrintDialog } from './ui/dialogs';
import { Button, Panel } from './ui/primitives';
import { useDeck } from './ui/useDeck';

const CARD_FONTS = 'https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Noto+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap';

// Matches the `xl` breakpoint, where the preview gets its own column. Only one copy of the preview/export is mounted.
function useWideScreen() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 1280px)');
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return wide;
}

export default function GeneratorPage() {
  const deck = useDeck();
  const { cards, options, current } = deck;
  const [dialog, setDialog] = useState<null | 'print' | 'import' | 'help' | 'sort' | 'filter'>(null);
  const [printing, setPrinting] = useState(false);
  const [uploadSignal, setUploadSignal] = useState(0);
  const wide = useWideScreen();
  const [toast, setToast] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const toastTimer = useRef<number | undefined>(undefined);
  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 4500);
  }, []);

  // The card fonts (Noto Sans body, Lora titles) are only needed on this page.
  useEffect(() => {
    if (document.querySelector('link[data-rpg-fonts]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CARD_FONTS;
    link.dataset.rpgFonts = '';
    document.head.appendChild(link);
  }, []);

  const loadFiles = useCallback(
    async (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        try {
          const cardsIn = parseDeck(await file.text());
          deck.addCards(cardsIn);
          notify(`Loaded ${cardsIn.length} card${cardsIn.length === 1 ? '' : 's'} from ${file.name}.`);
        } catch (e) {
          notify(`${file.name}: ${e instanceof DeckParseError ? e.message : (e as Error).message}`);
        }
      }
    },
    [deck.addCards, notify] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const save = useCallback(() => {
    const blob = new Blob([serializeDeck(deck.cards)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rpg_cards.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [deck.cards]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === 's') { e.preventDefault(); save(); }
      else if (mod && key === 'p') { e.preventDefault(); setDialog('print'); }
      else if (mod && key === 'e') { e.preventDefault(); setUploadSignal((n) => n + 1); }
      else if (e.altKey && key === 'n') { e.preventDefault(); deck.addCard(); }
      else if (e.altKey && key === 'd') { e.preventDefault(); deck.duplicateCard(); }
      else if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); deck.select(Math.max(0, deck.selected - 1)); }
      else if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); deck.select(Math.min(deck.cards.length - 1, deck.selected + 1)); }
      else if (e.key === 'F1') { e.preventDefault(); setDialog('help'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save, deck]);

  const addSample = () => {
    deck.addCards(sample as never[]);
    notify('Added the sample deck.');
  };

  return (
    <div
      className="max-w-[1700px] mx-auto px-4 sm:px-6 py-6 no-print lg:h-[calc(100dvh-4rem)] lg:flex lg:flex-col"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) void loadFiles(e.dataTransfer.files);
      }}
    >

      <div className="mb-5 shrink-0 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">RPG Card Generator</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Design, preview, print and export tabletop cards. Works with save files from the original generator.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Deck actions">
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) void loadFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <Button onClick={() => fileInput.current?.click()}><FolderOpen className="w-3.5 h-3.5" /> Load</Button>
          <Button onClick={save} disabled={!cards.length} title="Save deck as JSON (Ctrl+S)"><Download className="w-3.5 h-3.5" /> Save</Button>
          <Button onClick={addSample}><Sparkles className="w-3.5 h-3.5" /> Sample</Button>
          <span className="h-5 w-px bg-gray-200 dark:bg-[#2E333D]" />
          <Button onClick={() => setDialog('sort')} disabled={cards.length < 2}><ArrowDownAZ className="w-3.5 h-3.5" /> Sort</Button>
          <Button onClick={() => setDialog('filter')} disabled={!cards.length}><Filter className="w-3.5 h-3.5" /> Filter</Button>
          <Button onClick={() => setDialog('help')} aria-label="Help (F1)" title="Help (F1)"><CircleHelp className="w-3.5 h-3.5" /></Button>
          <Button variant="primary" onClick={() => setDialog('print')} disabled={!cards.length} title="Print (Ctrl+P)"><Printer className="w-3.5 h-3.5" /> Print</Button>
          <Button
            variant="danger"
            onClick={() => cards.length && confirm(`Delete all ${cards.length} cards? This cannot be undone.`) && deck.clear()}
            disabled={!cards.length}
            aria-label="Delete all cards"
            title="Delete all cards"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {deck.saveFailed && (
        <p role="alert" className="mb-4 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
          This browser is not keeping your deck (storage is full or blocked). Use Save to keep a copy.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)_minmax(0,1.05fr)] lg:grid-rows-[minmax(0,1fr)] lg:flex-1 lg:min-h-0">
        <aside className="lg:h-full lg:overflow-y-auto space-y-5 pr-1">
          <DeckPanel deck={deck} onImportJson={() => setDialog('import')} />
          <SettingsPanel options={options} setOptions={deck.setOptions} applyToAll={deck.applyToAll} cardCount={cards.length} />
        </aside>

        <div className="space-y-5 min-w-0 lg:h-full lg:overflow-y-auto pr-1">
          {current ? (
            <CardEditor key={deck.selected} card={current} options={options} onChange={deck.updateCard} />
          ) : (
            <Panel>
              <div className="p-10 text-center space-y-3">
                <p className="text-gray-600 dark:text-gray-300">Your deck is empty.</p>
                <div className="flex justify-center gap-2">
                  <Button variant="primary" onClick={() => deck.addCard()}>New card</Button>
                  <Button onClick={() => fileInput.current?.click()}>Load a file</Button>
                  <Button onClick={addSample}>Add sample deck</Button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">You can also drop a .json save file anywhere on this page.</p>
              </div>
            </Panel>
          )}
          {!wide && (
            <>
              <Preview card={current} cards={cards} options={options} />
              <ExportPanel card={current} options={options} uploadSignal={uploadSignal} notify={notify} />
            </>
          )}
        </div>

        {wide && (
          <aside className="h-full overflow-y-auto pr-1 space-y-5">
            <Preview card={current} cards={cards} options={options} />
            <ExportPanel card={current} options={options} uploadSignal={uploadSignal} notify={notify} />
          </aside>
        )}
      </div>

      {dragging && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-emerald-700/20 backdrop-blur-xs pointer-events-none">
          <div className="rounded border-2 border-dashed border-emerald-600 bg-white dark:bg-[#181A20] px-8 py-6 font-mono text-sm text-emerald-700 dark:text-emerald-400">Drop a save file to load it</div>
        </div>
      )}

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] rounded border border-gray-200 dark:border-[#2E333D] bg-white dark:bg-[#181A20] px-4 py-2 text-sm shadow-lg text-gray-700 dark:text-gray-200">
          {toast}
        </div>
      )}

      <PrintDialog
        open={dialog === 'print'}
        onClose={() => setDialog(null)}
        options={options}
        setOptions={deck.setOptions}
        cards={cards}
        onPrint={() => {
          setDialog(null);
          setPrinting(true);
        }}
      />
      <ImportCardDialog open={dialog === 'import'} onClose={() => setDialog(null)} onImport={(c) => { deck.addCards(c.map(cleanImportedCard)); notify(`Imported ${c.length} card${c.length === 1 ? '' : 's'}.`); }} />
      <CodeDialog open={dialog === 'sort' || dialog === 'filter'} mode={dialog === 'filter' ? 'filter' : 'sort'} onClose={() => setDialog(null)} cards={cards} onResult={deck.replaceCards} />
      <HelpDialog open={dialog === 'help'} onClose={() => setDialog(null)} />
      <PrintSheets active={printing} cards={cards} options={options} onDone={() => setPrinting(false)} />
    </div>
  );
}
