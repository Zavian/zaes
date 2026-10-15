import React, { useEffect, useRef, useState } from 'react';
import { Bold, ChevronDown, ImagePlus, Italic, Swords, Underline } from 'lucide-react';
import { iconUrl as iconUrlOf } from '../core/assets';
import { toggleBbcode } from '../core/bbcode';
import { Card, DeckOptions } from '../core/types';
import { COLOR_PALETTE, toHex } from '../core/color';
import { FS_NOTE, TAG_DOCS } from '../core/tags';
import { ImageDialog } from './ImageDialog';
import { readLocalImage } from './localImage';
import { Button, Label, Textarea } from './primitives';

interface Props {
  id: string;
  label: string;
  lines: string[];
  onChange: (lines: string[]) => void;
  color?: string;
  icon?: string; // name of the card's icon, for @icon
  images?: Record<string, string>;
  options?: DeckOptions;
  onAddImage?: (name: string, dataUrl: string) => void;
}

const RARITY: Record<string, string> = {
  '#008000': 'Uncommon',
  '#000080': 'Rare',
  '#8a2be2': 'Very Rare',
  '#c46709': 'Legendary',
};
const rarityName = (color?: string) => {
  const hex = toHex(color);
  if (!hex) return 'Color';
  if (RARITY[hex]) return RARITY[hex];
  return Object.entries(COLOR_PALETTE).find(([, v]) => v === hex)?.[0] ?? 'Color';
};

export const ContentEditor: React.FC<Props> = ({ id, label, lines, onChange, color, icon = '', images = {}, options, onAddImage }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [menu, setMenu] = useState(false);
  const menuWrap = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState('');
  const [imageDialog, setImageDialog] = useState(false);
  const text = lines.join('\n');
  const iconUrl = icon ? iconUrlOf(icon.replace(/[^a-zA-Z0-9_-]/g, '')) : '';

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => menuWrap.current && !menuWrap.current.contains(e.target as Node) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menu]);

  const commit = (value: string, selStart?: number, selEnd?: number) => {
    onChange(value.split('\n'));
    if (selStart != null) {
      requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(selStart, selEnd ?? selStart);
      });
    }
  };

  const track = () => {
    const el = ref.current;
    if (el) setLineIndex(el.value.slice(0, el.selectionStart).split('\n').length - 1);
  };

  // Toggle [b]/[i]/[u] on the selection (exact, see toggleBbcode).
  const wrap = (code: 'b' | 'i' | 'u') => {
    const el = ref.current;
    if (!el) return;
    const r = toggleBbcode(el.value, el.selectionStart, el.selectionEnd, code);
    commit(r.value, r.start, r.end);
  };

  const insertTag = (insert: string) => {
    setMenu(false);
    const el = ref.current;
    const value = el?.value ?? text;
    const pos = el ? el.selectionStart : value.length;
    const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
    const lineEndIdx = value.indexOf('\n', pos);
    const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
    const currentLine = value.slice(lineStart, lineEnd);
    if (currentLine.trim() === '') {
      const next = value.slice(0, lineStart) + insert + value.slice(lineEnd);
      commit(next, lineStart + insert.length);
    } else {
      const next = value.slice(0, lineEnd) + '\n' + insert + value.slice(lineEnd);
      commit(next, lineEnd + 1 + insert.length);
    }
  };

  const pickImage = async (file?: File) => {
    if (!file || !onAddImage) return;
    try {
      const { name, dataUrl } = await readLocalImage(file, Object.keys(images));
      onAddImage(name, dataUrl);
      insertTag(`image | 120 | @${name}`);
      setImageError('');
    } catch (e) {
      setImageError((e as Error).message);
    }
  };

  const makeWeapon = () => {
    const tpl = `subtitle | ${rarityName(color)} Weapon Type (Attunement)\nrule\nproperty | Damage | damage\nproperty | Modifier | mod\nproperty | Properties | props\nrule\n`;
    commit(text.length > 0 ? `${text}\n${tpl}` : tpl);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const code = ({ b: 'b', i: 'i', u: 'u' } as const)[e.key.toLowerCase() as 'b'];
    if (code) {
      e.preventDefault();
      wrap(code);
    }
  };

  const currentTag = lines[lineIndex]?.split('|')[0].trim();
  const doc = TAG_DOCS.find((t) => t.name === currentTag);

  const applyImageLine = (line: string) => {
    setImageDialog(false);
    const next = lines.slice();
    next[lineIndex] = line;
    onChange(next);
  };

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-center gap-1 mb-1.5">
        <Button size="icon" variant="ghost" title="Bold (Ctrl+B)" aria-label="Bold" onClick={() => wrap('b')}>
          <Bold className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon" variant="ghost" title="Italic (Ctrl+I)" aria-label="Italic" onClick={() => wrap('i')}>
          <Italic className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon" variant="ghost" title="Underline (Ctrl+U)" aria-label="Underline" onClick={() => wrap('u')}>
          <Underline className="w-3.5 h-3.5" />
        </Button>
        <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-[#2E333D]" />
        <div ref={menuWrap} className="relative">
          <Button size="sm" variant="ghost" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu">
            Insert tag <ChevronDown className="w-3 h-3" />
          </Button>
          {menu && (
            <ul role="menu" className="absolute z-20 left-0 mt-1 w-56 max-h-72 overflow-auto rounded border border-gray-200 dark:border-[#2E333D] bg-white dark:bg-[#181A20] shadow-lg py-1">
              {TAG_DOCS.map((t) => (
                <li key={t.name} role="none">
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => insertTag(t.insert)}
                    className="w-full px-3 py-1 text-left text-sm font-mono hover:bg-emerald-50 dark:hover:bg-[#20242D] cursor-pointer"
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {onAddImage && (
          <>
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => { void pickImage(e.target.files?.[0]); e.target.value = ''; }} />
            <Button size="sm" variant="ghost" onClick={() => fileInput.current?.click()} title="Add a picture from your computer">
              <ImagePlus className="w-3.5 h-3.5" /> Image
            </Button>
          </>
        )}
        <Button size="sm" variant="ghost" onClick={makeWeapon} title="Append a weapon template">
          <Swords className="w-3.5 h-3.5" /> Weapon
        </Button>
      </div>
      <Textarea
        id={id}
        ref={ref}
        rows={10}
        value={text}
        spellCheck={false}
        onChange={(e) => {
          onChange(e.target.value.split('\n'));
          track();
        }}
        onKeyDown={onKeyDown}
        onKeyUp={track}
        onClick={track}
        onSelect={track}
      />
      <p className="mt-1 min-h-5 text-xs font-mono text-gray-500 dark:text-gray-400">
        {imageError ? (
          <span className="text-red-600 dark:text-red-400">{imageError}</span>
        ) : doc ? (
          <>
            <span className="text-emerald-700 dark:text-emerald-400">{doc.syntax}</span>
            {currentTag === 'image' && options && (
              <button type="button" onClick={() => setImageDialog(true)} className="ml-3 underline text-emerald-700 dark:text-emerald-400 cursor-pointer">
                Edit image…
              </button>
            )}
            {doc.fs && <span className="ml-2 text-gray-400 dark:text-gray-500">[| fs-1…6]</span>}
          </>
        ) : currentTag ? (
          <span className="text-amber-700 dark:text-amber-400">“{currentTag}” is not a known tag.</span>
        ) : (
          <span title={FS_NOTE}>One element per line: tag | parameter | parameter</span>
        )}
      </p>
      {options && (
        <ImageDialog
          open={imageDialog}
          line={lines[lineIndex] ?? ''}
          card={{ images } as unknown as Card}
          options={options}
          cardColor={toHex(color) ?? '#000000'}
          iconUrl={iconUrl}
          onApply={applyImageLine}
          onClose={() => setImageDialog(false)}
        />
      )}
    </div>
  );
};
