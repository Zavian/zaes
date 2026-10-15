import React, { useEffect, useMemo, useState } from 'react';
import { DEFAULT_SHADOW_OPACITY, ICON_REF, ImageSpec, formatImageLine, imageElement, parseImageLine } from '../core/image';
import { Card, DeckOptions } from '../core/types';
import { ColorField } from './ColorField';
import { Button, Input, Label, Modal, Select, Toggle, cx } from './primitives';

interface Props {
  open: boolean;
  line: string; // the `image | ...` line being edited
  card: Card;
  options: DeckOptions;
  cardColor: string; // css color of the card
  iconUrl: string; // the card's own icon, for @icon
  onApply: (line: string) => void;
  onClose: () => void;
}

const SIZE_RE = /^(\d+(?:\.\d+)?)(px|%)?(?:x(\d+(?:\.\d+)?)(?:px)?)?$/i;
const splitSize = (size: string) => {
  const m = SIZE_RE.exec(size.trim());
  return { w: m?.[1] ?? '120', unit: m?.[2] === '%' ? '%' : 'px', h: m?.[3] ?? '' };
};
const joinSize = (w: string, unit: string, h: string) => `${w || '120'}${unit === '%' ? '%' : ''}${h ? `x${h}` : ''}`;

const FILL_NONE = '';

// '' = off, otherwise 'card', 'black' or a picked color.
const effectMode = (v: string) => (v === '' ? '' : v === 'card' || v === 'black' ? v : 'color');

const EffectColor: React.FC<{ id: string; label: string; value: string; onChange: (v: string) => void; children?: React.ReactNode }> = ({ id, label, value, onChange, children }) => {
  const mode = effectMode(value);
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} value={mode} onChange={(e) => onChange(e.target.value === 'color' ? '#c0392b' : e.target.value)}>
        <option value="">None</option>
        <option value="card">Card color</option>
        <option value="black">Black</option>
        <option value="color">Picked color…</option>
      </Select>
      {mode === 'color' && (
        <div className="mt-2">
          <ColorField value={value} onChange={(v) => onChange(v || '#000000')} />
        </div>
      )}
      {mode !== '' && children}
    </div>
  );
};
const ALIGNS: ImageSpec['align'][] = ['left', 'center', 'right'];

export const ImageDialog: React.FC<Props> = ({ open, line, card, options, cardColor, iconUrl, onApply, onClose }) => {
  const [spec, setSpec] = useState<ImageSpec>(() => parseImageLine(line));
  useEffect(() => {
    if (open) setSpec(parseImageLine(line));
  }, [open, line]);

  const set = (patch: Partial<ImageSpec>) => setSpec((s) => ({ ...s, ...patch }));
  const size = splitSize(spec.size);
  const setSize = (patch: Partial<typeof size>) => {
    const n = { ...size, ...patch };
    set({ size: joinSize(n.w, n.unit, n.unit === '%' ? '' : n.h) });
  };
  const fillMode = spec.fill === '' || spec.fill === 'none' ? FILL_NONE : spec.fill.toLowerCase() === 'card' ? 'card' : 'color';
  const matchCard = spec.radius === '';
  const cardRadius = options.rounded_corners ? 4 : 0;

  const preview = useMemo(
    () => imageElement(formatImageLine(spec), card, cardColor, cardRadius, iconUrl),
    [spec, card, cardColor, cardRadius, iconUrl]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit image"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onApply(formatImageLine(spec))}>
            Apply
          </Button>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_5rem_1fr] gap-2 items-end">
            <div>
              <Label htmlFor="img-w">Width</Label>
              <Input id="img-w" type="number" min={1} max={size.unit === '%' ? 100 : 1200} value={size.w} onChange={(e) => setSize({ w: e.target.value })} />
            </div>
            <Select aria-label="Width unit" value={size.unit} onChange={(e) => setSize({ unit: e.target.value })}>
              <option value="px">px</option>
              <option value="%">%</option>
            </Select>
            <div>
              <Label htmlFor="img-h" hint="optional">Height</Label>
              <Input id="img-h" type="number" min={1} max={1200} value={size.h} disabled={size.unit === '%'} placeholder="auto" onChange={(e) => setSize({ h: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Alignment</Label>
            <div className="flex gap-1">
              {ALIGNS.map((a) => (
                <Button key={a} size="sm" variant={spec.align === a ? 'primary' : 'ghost'} onClick={() => set({ align: a })}>
                  {a}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="img-opacity" hint={`${spec.opacity === '' ? 100 : spec.opacity}%`}>Opacity</Label>
            <input
              id="img-opacity"
              type="range"
              min={0}
              max={100}
              value={spec.opacity === '' ? 100 : spec.opacity}
              onChange={(e) => set({ opacity: e.target.value === '100' ? '' : e.target.value })}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <Label htmlFor="img-fill" hint="paints the picture's shape in one color">Fill</Label>
            <Select
              id="img-fill"
              value={fillMode}
              onChange={(e) => set({ fill: e.target.value === 'card' ? 'card' : e.target.value === 'color' ? '#c0392b' : spec.src === ICON_REF ? 'none' : '' })}
            >
              <option value="">None (original colors)</option>
              <option value="card">Card color</option>
              <option value="color">Picked color…</option>
            </Select>
            {fillMode === 'color' && (
              <div className="mt-2">
                <ColorField value={spec.fill} onChange={(v) => set({ fill: v || '#000000' })} />
              </div>
            )}
          </div>

          <EffectColor id="img-shadow" label="Shadow" value={spec.shadow} onChange={(v) => set({ shadow: v })}>
            <div className="mt-2">
              <Label htmlFor="img-shadow-opacity" hint={`${spec.shadowOpacity === '' ? DEFAULT_SHADOW_OPACITY : spec.shadowOpacity}%`}>Shadow opacity</Label>
              <input
                id="img-shadow-opacity"
                type="range"
                min={0}
                max={100}
                value={spec.shadowOpacity === '' ? DEFAULT_SHADOW_OPACITY : spec.shadowOpacity}
                onChange={(e) => set({ shadowOpacity: Number(e.target.value) === DEFAULT_SHADOW_OPACITY ? '' : e.target.value })}
                className="w-full accent-emerald-600"
              />
            </div>
          </EffectColor>

          <EffectColor id="img-glow" label="Glow" value={spec.glow} onChange={(v) => set({ glow: v })} />

          <div>
            <Toggle id="img-radius-card" checked={matchCard} onChange={(v) => set({ radius: v ? '' : String(cardRadius || 4) })} label="Same corner radius as the card" />
            {!matchCard && (
              <div className="mt-2 w-32">
                <Label htmlFor="img-radius" hint="px">Radius</Label>
                <Input id="img-radius" type="number" min={0} max={200} value={spec.radius} onChange={(e) => set({ radius: e.target.value })} />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label>Preview</Label>
          <div
            className={cx('flex flex-col rounded border border-gray-200 dark:border-[#2E333D] bg-white p-2 min-h-32 overflow-hidden')}
            dangerouslySetInnerHTML={{ __html: preview || '<p style="color:#999;font-size:12px">Picture not found.</p>' }}
          />
        </div>
      </div>
    </Modal>
  );
};
