import React, { useCallback, useEffect, useRef, useState } from 'react';
import './cards.css';
import { DeckParseError, cleanImportedCard, parseDeck, serializeDeck } from './core/normalize';
import sample from './sample.json';
import { CardEditor } from './ui/CardEditor';
import { DeckPanel } from './ui/DeckPanel';
import { ExportPanel } from './ui/ExportPanel';
import { Preview } from './ui/Preview';
import { DeckActions } from './ui/DeckActions';
import { SettingsPanel } from './ui/SettingsPanel';
import { CodeDialog, HelpDialog, ImportCardDialog } from './ui/dialogs';
import { Button, Panel } from './ui/primitives';
import { useDeck } from './ui/useDeck';

const CARD_FONTS = 'https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Noto+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap';

const typingInField = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
};

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
  const [dialog, setDialog] = useState<null | 'import' | 'help' | 'sort' | 'filter'>(null);
  const [uploadSignal, setUploadSignal] = useState(0);
  const wide = useWideScreen();
  const [toast, setToast] = useState('');
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

  const dialogRef = useRef(dialog);
  dialogRef.current = dialog;

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === 's') { e.preventDefault(); save(); }
      else if (mod && key === 'e') { e.preventDefault(); setUploadSignal((n) => n + 1); }
      else if (e.altKey && key === 'n') { e.preventDefault(); deck.addCard(); }
      else if (e.altKey && key === 'd') { e.preventDefault(); deck.duplicateCard(); }
      else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !mod && !e.shiftKey && !typingInField(e.target) && !dialogRef.current) {
        // Plain up/down steps through the cards unless you are typing or picking in a field.
        e.preventDefault();
        deck.select(e.key === 'ArrowUp' ? Math.max(0, deck.selected - 1) : Math.min(deck.cards.length - 1, deck.selected + 1));
      }
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
    <div className="max-w-[2200px] mx-auto px-4 sm:px-6 py-3 no-print lg:h-[calc(100dvh-3.5rem)] lg:flex lg:flex-col">
      <div className="mb-3 shrink-0">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
          <h1 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">RPG Card Generator</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Based on{' '}
            <a className="underline hover:text-emerald-600 dark:hover:text-emerald-400" href="https://github.com/crobi/rpg-cards" target="_blank" rel="noopener noreferrer">crobi's rpg-cards</a>
            . Icons by{' '}
            <a className="underline hover:text-emerald-600 dark:hover:text-emerald-400" href="https://game-icons.net" target="_blank" rel="noopener noreferrer">game-icons.net</a> (CC BY 3.0).
          </p>
        </div>
      </div>

      {deck.saveFailed && (
        <p role="alert" className="mb-4 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-base text-amber-800 dark:text-amber-300">
          This browser is not keeping your deck (storage is full or blocked). Use Save to keep a copy.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1.15fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:flex-1 lg:min-h-0">
        <aside className="lg:h-full lg:overflow-y-auto space-y-5 pr-1">
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
          <DeckActions
            cardCount={cards.length}
            onLoad={() => fileInput.current?.click()}
            onSave={save}
            onSample={addSample}
            onSort={() => setDialog('sort')}
            onFilter={() => setDialog('filter')}
            onHelp={() => setDialog('help')}
            onClear={() => cards.length && confirm(`Delete all ${cards.length} cards? This cannot be undone.`) && deck.clear()}
          />
          <DeckPanel deck={deck} />
          <SettingsPanel options={options} setOptions={deck.setOptions} applyToAll={deck.applyToAll} cardCount={cards.length} />
        </aside>

        <div className="space-y-5 min-w-0 lg:h-full lg:overflow-y-auto pr-1">
          {current ? (
            <CardEditor key={deck.selected} card={current} options={options} onChange={deck.updateCard}
              onNew={() => deck.addCard()}
              onCopy={deck.duplicateCard}
              onDelete={() => confirm(`Delete “${current.title || 'Untitled'}”?`) && deck.deleteCard()}
              onImportJson={() => setDialog('import')}
            />
          ) : (
            <Panel>
              <div className="p-10 text-center space-y-3">
                <p className="text-gray-600 dark:text-gray-300">Your deck is empty.</p>
                <div className="flex justify-center gap-2">
                  <Button variant="primary" onClick={() => deck.addCard()}>New card</Button>
                  <Button onClick={() => fileInput.current?.click()}>Load a file</Button>
                  <Button onClick={addSample}>Add sample deck</Button>
                </div>
              </div>
            </Panel>
          )}
          {!wide && (
            <>
              <Preview card={current} options={options} />
              <ExportPanel card={current} options={options} uploadSignal={uploadSignal} notify={notify} />
            </>
          )}
        </div>

        {wide && (
          <aside className="h-full overflow-y-auto pr-1 space-y-5">
            <Preview card={current} options={options} />
            <ExportPanel card={current} options={options} uploadSignal={uploadSignal} notify={notify} />
          </aside>
        )}
      </div>

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] rounded border border-gray-200 dark:border-[#2E333D] bg-white dark:bg-[#181A20] px-4 py-2 text-base shadow-lg text-gray-700 dark:text-gray-200">
          {toast}
        </div>
      )}

      <ImportCardDialog open={dialog === 'import'} onClose={() => setDialog(null)} onImport={(c) => { deck.addCards(c.map(cleanImportedCard)); notify(`Imported ${c.length} card${c.length === 1 ? '' : 's'}.`); }} />
      <CodeDialog open={dialog === 'sort' || dialog === 'filter'} mode={dialog === 'filter' ? 'filter' : 'sort'} onClose={() => setDialog(null)} cards={cards} onResult={deck.replaceCards} />
      <HelpDialog open={dialog === 'help'} onClose={() => setDialog(null)} />
    </div>
  );
}
