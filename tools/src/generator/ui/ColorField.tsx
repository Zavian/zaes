import React, { useEffect, useRef, useState } from 'react';
import { COLOR_PALETTE, toHex } from '../core/color';
import { Input, cx } from './primitives';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

type HSV = [number, number, number]; // h 0-360, s 0-1, v 0-1

const hexToHsv = (hex: string): HSV => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, max ? d / max : 0, max];
};

const hsvToHex = ([h, s, v]: HSV): string => {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
  };
  return '#' + [f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, '0')).join('');
};

// Pointer-draggable area; reports 0-1 coordinates inside it.
const Drag: React.FC<{ onMove: (x: number, y: number) => void; className?: string; style?: React.CSSProperties; label: string; children: React.ReactNode }> = ({
  onMove,
  className,
  style,
  label,
  children,
}) => {
  const update = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    onMove(clamp((e.clientX - r.left) / r.width), clamp((e.clientY - r.top) / r.height));
  };
  return (
    <div
      role="presentation"
      aria-label={label}
      className={cx('relative touch-none cursor-crosshair', className)}
      style={style}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={(e) => e.buttons && update(e)}
    >
      {children}
    </div>
  );
};

const Picker: React.FC<{ hex: string; onChange: (hex: string) => void }> = ({ hex, onChange }) => {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(hex));
  // Follow outside edits (typed text, presets) without losing the hue of greys.
  useEffect(() => {
    if (hsvToHex(hsv) !== hex) setHsv(hexToHsv(hex));
  }, [hex]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (next: HSV) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };
  const [h, s, v] = hsv;
  return (
    <div className="space-y-3">
      <Drag
        label="Saturation and brightness"
        className="h-36 w-full rounded"
        style={{ backgroundColor: `hsl(${h} 100% 50%)`, backgroundImage: 'linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,transparent)' }}
        onMove={(x, y) => set([h, x, 1 - y])}
      >
        <span
          className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ring-1 ring-black/40 pointer-events-none"
          style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%` }}
        />
      </Drag>
      <Drag
        label="Hue"
        className="h-3 w-full rounded-full"
        style={{ backgroundImage: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
        onMove={(x) => set([x * 360, s, v])}
      >
        <span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ring-1 ring-black/40 pointer-events-none"
          style={{ left: `${(h / 360) * 100}%` }}
        />
      </Drag>
    </div>
  );
};

export const ColorField: React.FC<Props> = ({ value, onChange }) => {
  const hex = toHex(value);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => root.current && !root.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div className="space-y-2">
      <div className="relative flex items-center gap-2" ref={root}>
        <button
          type="button"
          aria-label="Card color picker"
          aria-expanded={open}
          title="Pick a color"
          onClick={() => setOpen((o) => !o)}
          className="h-9 w-11 shrink-0 rounded border border-gray-200 dark:border-[#2E333D] cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
          style={{ backgroundColor: hex ?? 'transparent' }}
        />
        <Input
          aria-label="Card color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000 or a CSS color name"
          spellCheck={false}
          className={cx('font-mono', value && !hex && 'border-red-400 dark:border-red-700')}
        />
        {open && (
          <div role="dialog" aria-label="Color picker" className="absolute left-0 top-full z-30 mt-1 w-60 rounded border border-gray-200 dark:border-[#2E333D] bg-white dark:bg-[#181A20] p-3 shadow-lg">
            <Picker hex={hex ?? '#000000'} onChange={onChange} />
          </div>
        )}
      </div>
      {value && !hex && <p className="text-xs text-red-600 dark:text-red-400">Unknown color, black is used instead.</p>}
      <div className="flex flex-wrap gap-1" role="group" aria-label="Color presets">
        {Object.entries(COLOR_PALETTE).map(([name, color]) => (
          <button
            key={name}
            type="button"
            title={name}
            aria-label={name}
            onClick={() => onChange(color)}
            style={{ backgroundColor: color }}
            className={cx(
              'h-5 w-5 rounded-sm border cursor-pointer transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-emerald-600',
              hex === color ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-black/10 dark:border-white/10'
            )}
          />
        ))}
      </div>
    </div>
  );
};
