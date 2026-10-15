import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Grid3x3 } from 'lucide-react';
import { toHex } from '../core/color';
import { iconUrl, useIconNames } from './icons';
import { Button, Input, Modal, cx } from './primitives';

interface FieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  color?: string;
  label: string;
}

export const IconField: React.FC<FieldProps> = ({ value, onChange, placeholder, color, label }) => {
  const names = useIconNames();
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const [picker, setPicker] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 2) return [];
    const starts = names.filter((n) => n.startsWith(q));
    const contains = names.filter((n) => !n.startsWith(q) && n.includes(q));
    return [...starts, ...contains].slice(0, 8);
  }, [value, names]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => wrap.current && !wrap.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const known = !value || names.length === 0 || names.includes(value);
  const bg = toHex(color) ?? '#444';

  return (
    <div ref={wrap} className="relative">
      <div className="flex items-center gap-2">
        <span
          className="h-9 w-9 shrink-0 rounded border border-gray-200 dark:border-[#2E333D] grid place-items-center"
          style={{ backgroundColor: bg }}
          aria-hidden
        >
          {value && known && <img src={iconUrl(value)} alt="" className="h-6 w-6" />}
        </span>
        <Input
          aria-label={label}
          value={value}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          onFocus={() => {
            setFocus(true);
            setOpen(true);
          }}
          onBlur={() => setFocus(false)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          className={cx('font-mono', !known && 'border-amber-400 dark:border-amber-600')}
        />
        <Button onClick={() => setPicker(true)} aria-label={`Browse icons for ${label}`} title="Browse icons">
          <Grid3x3 className="w-3.5 h-3.5" /> <span className="hidden 2xl:inline">Browse</span>
        </Button>
      </div>
      {!known && <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">No icon with that name.</p>}
      {open && focus && suggestions.length > 0 && (
        <ul className="absolute z-20 left-11 right-24 mt-1 max-h-64 overflow-auto rounded border border-gray-200 dark:border-[#2E333D] bg-white dark:bg-[#181A20] shadow-lg">
          {suggestions.map((n) => (
            <li key={n}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(n);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-2 py-1 text-left text-base font-mono hover:bg-emerald-50 dark:hover:bg-[#20242D] cursor-pointer"
              >
                <span className="h-6 w-6 rounded grid place-items-center" style={{ backgroundColor: bg }}>
                  <img src={iconUrl(n)} alt="" className="h-4 w-4" loading="lazy" />
                </span>
                {n}
              </button>
            </li>
          ))}
        </ul>
      )}
      <IconPicker
        open={picker}
        onClose={() => setPicker(false)}
        color={bg}
        onPick={(n) => {
          onChange(n);
          setPicker(false);
        }}
      />
    </div>
  );
};

const MAX_RESULTS = 360;

export const IconPicker: React.FC<{ open: boolean; onClose: () => void; onPick: (name: string) => void; color: string }> = ({
  open,
  onClose,
  onPick,
  color,
}) => {
  const names = useIconNames();
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const results = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (q.length < 2) return names.slice(0, 120);
    return names.filter((n) => n.includes(q)).slice(0, MAX_RESULTS);
  }, [deferred, names]);
  const total = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    return q.length < 2 ? names.length : names.filter((n) => n.includes(q)).length;
  }, [deferred, names]);

  return (
    <Modal open={open} onClose={onClose} title="Icon browser" wide>
      <Input autoFocus placeholder="Search icons, e.g. sword, potion, skull…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search icons" />
      <p className="mt-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
        {names.length === 0
          ? 'Loading icons…'
          : query.trim().length < 2
            ? `${names.length.toLocaleString()} icons from game-icons.net. Type at least two letters to search.`
            : `${total.toLocaleString()} match${total === 1 ? '' : 'es'}${total > MAX_RESULTS ? `, showing the first ${MAX_RESULTS}` : ''}.`}
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {results.map((n) => (
          <button
            key={n}
            type="button"
            title={n}
            onClick={() => onPick(n)}
            className="group flex flex-col items-center gap-1 rounded border border-gray-200 dark:border-[#2E333D] p-1.5 hover:border-emerald-600 dark:hover:border-emerald-400 cursor-pointer"
          >
            <span className="h-12 w-12 rounded grid place-items-center" style={{ backgroundColor: color }}>
              <img src={iconUrl(n)} alt="" className="h-9 w-9" loading="lazy" decoding="async" />
            </span>
            <span className="w-full truncate text-[12px] font-mono text-gray-500 dark:text-gray-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{n}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
};
