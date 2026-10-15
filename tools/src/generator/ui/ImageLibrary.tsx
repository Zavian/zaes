import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Label } from './primitives';

interface Props {
  images: Record<string, string>;
  text: string; // all content lines, to tell which pictures are in use
  onInsert: (name: string) => void;
  onRemove: (name: string) => void;
}

const kb = (dataUrl: string) => Math.max(1, Math.round((dataUrl.length * 0.75) / 1024));

// The pictures stored on this card: what `@name` in an `image` line refers to.
export const ImageLibrary: React.FC<Props> = ({ images, text, onInsert, onRemove }) => {
  const names = Object.keys(images);
  if (names.length === 0) return null;
  return (
    <div>
      <Label hint="stored in this card; use them as @name in an image line">Card images</Label>
      <ul className="divide-y divide-gray-200 dark:divide-[#2E333D] rounded border border-gray-200 dark:border-[#2E333D]">
        {names.map((name) => {
          const used = new RegExp(`@${name}(?![\w-])`).test(text);
          return (
            <li key={name} className="flex items-center gap-3 px-2 py-1.5">
              <img src={images[name]} alt="" className="h-9 w-9 rounded object-contain bg-white border border-gray-200 dark:border-[#2E333D]" />
              <div className="min-w-0 flex-1">
                <code className="font-mono text-xs text-emerald-700 dark:text-emerald-400">@{name}</code>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {kb(images[name])} KB · {used ? 'used' : 'not used (removed on save)'}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onInsert(name)} title="Add an image line using this picture">
                <Plus className="w-3.5 h-3.5" /> Insert
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onRemove(name)} aria-label={`Remove @${name}`} title="Remove this picture from the card">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
