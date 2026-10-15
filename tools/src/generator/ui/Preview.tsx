import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { fitTitles } from '../core/fit';
import { layoutPages } from '../core/pages';
import { renderBack, renderFront } from '../core/render';
import { Card, DeckOptions } from '../core/types';
import { Button, cx } from './primitives';

// Scales its (fixed pixel size) content down/up to the width of the column.
export const FitScale: React.FC<{ children: React.ReactNode; max?: number; onScale?: (scale: number) => void }> = ({ children, max = 1.4, onScale }) => {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ scale: 1, height: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      if (!box.current || !inner.current) return;
      const w = inner.current.offsetWidth || 1;
      const scale = Math.min(max, box.current.clientWidth / w);
      setM((prev) => (prev.scale === scale && prev.height === inner.current!.offsetHeight ? prev : { scale, height: inner.current!.offsetHeight }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, [max]);

  useEffect(() => onScale?.(m.scale), [m.scale, onScale]);

  return (
    <div ref={box} className="w-full" style={{ height: m.height * m.scale || undefined }}>
      <div ref={inner} style={{ width: 'max-content', transform: `scale(${m.scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
};

const CardHtml: React.FC<{ html: string; className?: string }> = ({ html, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) fitTitles(ref.current);
  }, [html]);
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};

interface Props {
  card: Card | undefined;
  cards: Card[];
  options: DeckOptions;
}

export const Preview: React.FC<Props> = ({ card, cards, options }) => {
  const [tab, setTab] = useState<'card' | 'sheet'>('card');
  const [sheet, setSheet] = useState(0);
  const [real, setReal] = useState(false);
  const [scale, setScale] = useState(1);

  const front = useMemo(() => (card ? renderFront(card, options) : ''), [card, options]);
  const back = useMemo(() => (card ? renderBack(card, options) : ''), [card, options]);
  const pages = useMemo(() => (tab === 'sheet' ? layoutPages(cards, options) : []), [tab, cards, options]);

  const shadow = 'shadow-[0_2px_14px_rgba(0,0,0,0.35)]';
  const sides = card && (
    <div className="flex items-start gap-5 w-max">
      <div className={cx('w-fit', shadow)} data-side="front">
        <CardHtml html={front} />
      </div>
      <div className={cx('w-fit', shadow)} data-side="back">
        <CardHtml html={back} />
      </div>
    </div>
  );
  const pageIndex = Math.min(sheet, Math.max(pages.length - 1, 0));
  return (
    <div>
      <div className="flex items-center gap-1 mb-3" role="tablist" aria-label="Preview mode">
        {(['card', 'sheet'] as const).map((t) => (
          <Button key={t} role="tab" aria-selected={tab === t} size="sm" variant={tab === t ? 'primary' : 'ghost'} onClick={() => setTab(t)}>
            {t === 'card' ? 'Card' : 'Print sheets'}
          </Button>
        ))}
        {tab === 'sheet' && pages.length > 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs font-mono text-gray-500 dark:text-gray-400">
            <Button size="sm" variant="ghost" disabled={pageIndex === 0} onClick={() => setSheet(pageIndex - 1)} aria-label="Previous page">‹</Button>
            page {pageIndex + 1} / {pages.length}
            <Button size="sm" variant="ghost" disabled={pageIndex >= pages.length - 1} onClick={() => setSheet(pageIndex + 1)} aria-label="Next page">›</Button>
          </span>
        )}
      </div>

      {tab === 'card' &&
        (card ? (
          <div className="space-y-3">
            {(real || (scale > 0 && scale < 0.995)) && (
              <div role="status" className="flex items-center justify-between gap-3 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-300">
                <span>{real ? 'Real size preview' : `Scaled down preview (${Math.round(scale * 100)}%)`}</span>
                <Button size="sm" onClick={() => setReal((r) => !r)}>{real ? 'Fit to panel' : 'Show real size'}</Button>
              </div>
            )}
            {real ? (
              <div className="overflow-x-auto pb-2">{sides}</div>
            ) : (
              <FitScale max={1} onScale={setScale}>{sides}</FitScale>
            )}
          </div>
        ) : (
          <Empty text="Add a card to see its preview." />
        ))}

      {tab === 'sheet' &&
        (pages.length === 0 ? (
          <Empty text="Nothing to print yet." />
        ) : (
          <FitScale max={1}>
            <div className={cx(`rpg-sheet rpg-sheet-${options.page_size} border border-gray-300`, shadow)} style={{ breakAfter: 'auto' }}>
              {pages[pageIndex].map((html, i) => (
                <CardHtml key={i} html={html} className="contents" />
              ))}
            </div>
          </FitScale>
        ))}
    </div>
  );
};

const Empty = ({ text }: { text: string }) => (
  <div className="rounded border border-dashed border-gray-300 dark:border-[#2E333D] p-10 text-center text-sm text-gray-500 dark:text-gray-400">{text}</div>
);
