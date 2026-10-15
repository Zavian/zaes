import React from 'react';
import { COLOR_PALETTE, toHex } from '../core/color';
import { Input, cx } from './primitives';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const ColorField: React.FC<Props> = ({ value, onChange }) => {
  const hex = toHex(value);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label
          className="relative h-9 w-11 shrink-0 rounded border border-gray-200 dark:border-[#2E333D] overflow-hidden cursor-pointer"
          style={{ backgroundColor: hex ?? 'transparent' }}
          title="Pick a color"
        >
          <input
            type="color"
            aria-label="Card color picker"
            value={hex ?? '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
          />
        </label>
        <Input
          aria-label="Card color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000 or a CSS color name"
          spellCheck={false}
          className={cx('font-mono', value && !hex && 'border-red-400 dark:border-red-700')}
        />
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
