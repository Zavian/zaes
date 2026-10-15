import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CARD_SIZES, Card, CardSize, DeckOptions, TITLE_SIZES } from '../core/types';
import { fitGrid } from '../core/pages';
import { IconField } from './IconField';
import { Button, Input, Label, Panel, Select, Toggle, cx } from './primitives';

interface Props {
  options: DeckOptions;
  setOptions: (patch: Partial<DeckOptions>) => void;
  applyToAll: (patch: Partial<Card>) => void;
  cardCount: number;
}

export const SettingsPanel: React.FC<Props> = ({ options, setOptions, applyToAll, cardCount }) => {
  // Collapsed on small screens, where this panel would otherwise push the editor far down the page.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.('(min-width: 1024px)').matches) setOpen(true);
  }, []);
  return (
  <Panel
    title="Deck settings"
    actions={
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Collapse deck settings' : 'Expand deck settings'} className="cursor-pointer text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
        <ChevronDown className={cx('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </button>
    }
  >
    {open && <div className="p-4 space-y-5">
        <div>
          <Label htmlFor="card-size">Card size</Label>
          <Select id="card-size" value={options.card_size} onChange={(e) => {
              const next = { ...options, card_size: e.target.value as CardSize };
              const g = fitGrid(next);
              setOptions({ card_size: next.card_size, page_rows: g.rows, page_columns: g.cols });
            }}>
            {CARD_SIZES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
          {options.card_size === 'custom' && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="custom-w">Width (in)</Label>
                <Input id="custom-w" type="number" step="0.1" min="0.5" value={options.custom_width} onChange={(e) => setOptions({ custom_width: Number(e.target.value) || 2.5 })} />
              </div>
              <div>
                <Label htmlFor="custom-h">Height (in)</Label>
                <Input id="custom-h" type="number" step="0.1" min="0.5" value={options.custom_height} onChange={(e) => setOptions({ custom_height: Number(e.target.value) || 3.5 })} />
              </div>
              <p className="col-span-2 text-xs text-amber-700 dark:text-amber-400">Custom sizes are experimental.</p>
            </div>
          )}
        </div>
  
        <div className="flex flex-col gap-3">
          <Toggle checked={options.rounded_corners} onChange={(v) => setOptions({ rounded_corners: v })} label="Rounded card corners" />
          <Toggle checked={options.icon_inline} onChange={(v) => setOptions({ icon_inline: v })} label="Use small front icons" />
        </div>
  
        <div className="rounded border border-gray-200 dark:border-[#2E333D] p-3 space-y-3">
          <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Card defaults</h3>
          <div>
            <Label>Default icon</Label>
            <IconField label="Default icon" value={options.default_icon} onChange={(v) => setOptions({ default_icon: v })} placeholder="ace" color={options.default_color} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <Label htmlFor="default-title-size">Title size</Label>
              <Select id="default-title-size" value={options.default_title_size} onChange={(e) => setOptions({ default_title_size: e.target.value })}>
                {TITLE_SIZES.map((s) => (
                  <option key={s} value={s}>{s}pt</option>
                ))}
              </Select>
            </div>
            <div className="min-w-0">
              <Label htmlFor="default-color">Color</Label>
              <Input id="default-color" value={options.default_color} onChange={(e) => setOptions({ default_color: e.target.value })} className="font-mono" />
            </div>
          </div>
          <div className="grid gap-2">
            <Button className="w-full" disabled={!cardCount} onClick={() => confirm(`Set the color of all ${cardCount} cards to "${options.default_color}"?`) && applyToAll({ color: options.default_color })}>Apply color to all</Button>
            <Button className="w-full" disabled={!cardCount} onClick={() => confirm(`Set the front icon of all ${cardCount} cards to "${options.default_icon}"?`) && applyToAll({ icon: options.default_icon })}>Apply icon to all</Button>
            <Button className="w-full" disabled={!cardCount} onClick={() => confirm(`Set the back icon of all ${cardCount} cards to "${options.default_icon}"?`) && applyToAll({ icon_back: options.default_icon })}>Apply back icon to all</Button>
            <Button className="w-full" disabled={!cardCount} onClick={() => confirm(`Set the title size of all ${cardCount} cards to ${options.default_title_size}pt?`) && applyToAll({ title_size: options.default_title_size })}>Apply title size to all</Button>
          </div>
        </div>
      </div>}
  </Panel>
  );
};
