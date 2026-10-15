import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fitTitles } from '../core/fit';
import { layoutPages, pageCss } from '../core/pages';
import { Card, DeckOptions } from '../core/types';
import { preloadIcons } from './exportImage';

interface Props {
  active: boolean;
  cards: Card[];
  options: DeckOptions;
  onDone: () => void;
}

// Renders the sheets into a portal outside the app root and calls window.print().
// Printing CSS (see cards.css) hides the app and shows only this portal.
export const PrintSheets: React.FC<Props> = ({ active, cards, options, onDone }) => {
  const root = useRef<HTMLDivElement>(null);
  const pages = useMemo(() => (active ? layoutPages(cards, options) : []), [active, cards, options]);

  useEffect(() => {
    if (!active || pages.length === 0) {
      if (active) onDone();
      return;
    }
    let cancelled = false;
    const style = document.createElement('style');
    style.textContent = `@page { margin: 0; size: ${pageCss(options.page_size)}; -webkit-print-color-adjust: exact; }`;
    const cleanup = () => {
      document.documentElement.classList.remove('rpg-printing');
      style.remove();
      window.removeEventListener('afterprint', onAfter);
    };
    const onAfter = () => {
      cleanup();
      if (!cancelled) onDone();
    };
    (async () => {
      await Promise.all([preloadIcons(pages.flat().join('')), document.fonts?.ready]);
      if (cancelled || !root.current) return;
      fitTitles(root.current);
      document.head.appendChild(style);
      document.documentElement.classList.add('rpg-printing');
      window.addEventListener('afterprint', onAfter);
      await new Promise((r) => setTimeout(r, 50));
      window.print();
      // Some browsers never fire afterprint; make sure the app comes back.
      setTimeout(() => !cancelled && document.documentElement.classList.contains('rpg-printing') && onAfter(), 1500);
    })();
    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, pages]);

  if (!active || typeof document === 'undefined') return null;
  return createPortal(
    <div id="rpg-print-root" ref={root} aria-hidden>
      {pages.map((page, i) => (
        <div key={i} className={`rpg-sheet rpg-sheet-${options.page_size}`}>
          {page.map((html, j) => (
            <div key={j} className="contents" dangerouslySetInnerHTML={{ __html: html }} />
          ))}
        </div>
      ))}
    </div>,
    document.body
  );
};
