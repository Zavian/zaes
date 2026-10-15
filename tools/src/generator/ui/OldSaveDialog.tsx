import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../core/types';
import { DeckParseError, parseDeck } from '../core/normalize';
import { Button, Modal } from './primitives';

// The old generator lives on another origin, so its saved deck cannot be read from here. A small page on that site
// (generator/transfer.html) hands it over with postMessage when we open it in a popup and ask.
const OLD_ORIGIN = 'https://zavian.github.io';
const OLD_PAGE = `${OLD_ORIGIN}/generator/transfer.html`;

type Step = { kind: 'ask' } | { kind: 'checking' } | { kind: 'found'; cards: Card[] } | { kind: 'none'; why: string };

interface Props {
  open: boolean;
  onClose: () => void;
  onLoad: (cards: Card[]) => void;
}

export const OldSaveDialog: React.FC<Props> = ({ open, onClose, onLoad }) => {
  const [step, setStep] = useState<Step>({ kind: 'ask' });
  const cleanup = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (open) setStep({ kind: 'ask' });
    return () => cleanup.current();
  }, [open]);

  const check = () => {
    // Must run straight from the click, or the browser blocks the popup.
    const popup = window.open(OLD_PAGE, 'zaes-old-generator', 'popup,width=420,height=240');
    if (!popup) return setStep({ kind: 'none', why: 'Your browser blocked the window. Allow pop-ups for this site and try again.' });
    setStep({ kind: 'checking' });

    const stop = () => {
      window.removeEventListener('message', onMessage);
      window.clearInterval(ask);
      window.clearTimeout(giveUp);
    };
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== OLD_ORIGIN || e.data?.type !== 'zaes-transfer-response') return;
      stop();
      try {
        const cards = Array.isArray(e.data.cards) && e.data.cards.length ? parseDeck(e.data.cards) : [];
        setStep(cards.length ? { kind: 'found', cards } : { kind: 'none', why: 'No saved deck was found in this browser for the old generator.' });
      } catch (err) {
        setStep({ kind: 'none', why: err instanceof DeckParseError ? err.message : 'The saved deck could not be read.' });
      }
    };
    window.addEventListener('message', onMessage);
    // The popup needs a moment to load: keep asking until it answers.
    const ask = window.setInterval(() => popup.postMessage({ type: 'zaes-transfer-request' }, OLD_ORIGIN), 400);
    const giveUp = window.setTimeout(() => {
      stop();
      setStep({ kind: 'none', why: 'The old generator did not answer. It may not have the transfer page yet.' });
    }, 12000);
    cleanup.current = () => {
      stop();
      if (!popup.closed) popup.close();
    };
  };

  const body =
    step.kind === 'ask' ? (
      <>
        <p>Coming from the old generator? We can copy the deck saved in this browser over.</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This opens the old site in a small window, asks it for your deck, and closes it again. Nothing is uploaded anywhere.
        </p>
      </>
    ) : step.kind === 'checking' ? (
      <p>Looking for your old deck…</p>
    ) : step.kind === 'found' ? (
      <p>
        We found an old save with <strong>{step.cards.length} card{step.cards.length === 1 ? '' : 's'}</strong>. Load {step.cards.length === 1 ? 'it' : 'them'} into the deck?
      </p>
    ) : (
      <p role="alert">{step.why}</p>
    );

  const footer =
    step.kind === 'ask' ? (
      <>
        <Button onClick={onClose}>No thanks</Button>
        <Button variant="primary" onClick={check}>Look for my old deck</Button>
      </>
    ) : step.kind === 'found' ? (
      <>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => { onLoad(step.cards); onClose(); }}>Load {step.cards.length} cards</Button>
      </>
    ) : step.kind === 'none' ? (
      <>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={() => setStep({ kind: 'ask' })}>Try again</Button>
      </>
    ) : (
      <Button onClick={onClose}>Cancel</Button>
    );

  return (
    <Modal open={open} onClose={onClose} title="Load a deck from the old generator" footer={footer}>
      {body}
    </Modal>
  );
};
