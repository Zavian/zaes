import React from 'react';
import { localImages } from '../core/image';
import { Card, DeckOptions, TITLE_SIZES } from '../core/types';
import { ColorField } from './ColorField';
import { ContentEditor } from './ContentEditor';
import { ImageLibrary } from './ImageLibrary';
import { IconField } from './IconField';
import { Input, Label, Panel, Select, Toggle } from './primitives';

interface Props {
  card: Card;
  options: DeckOptions;
  onChange: (patch: Partial<Card>) => void;
}

export const CardEditor: React.FC<Props> = ({ card, options, onChange }) => {
  const color = card.color ?? '';
  const effectiveColor = card.color || options.default_color;
  const addImage = (name: string, dataUrl: string) => onChange({ images: { ...localImages(card), [name]: dataUrl } });
  return (
    <Panel title="Card">
      <div className="p-4 space-y-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <div>
            <Label htmlFor="card-title">Name</Label>
            <Input id="card-title" value={card.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Title" />
          </div>
          <div>
            <Label htmlFor="card-title-size">Title size</Label>
            <Select
              id="card-title-size"
              value={card.title_size ?? ''}
              onChange={(e) => onChange({ title_size: e.target.value || undefined })}
            >
              <option value="">Default ({options.default_title_size}pt)</option>
              {TITLE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}pt
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label>Icon</Label>
            <IconField
              label="Front icon"
              value={card.icon ?? ''}
              onChange={(v) => onChange({ icon: v || undefined })}
              placeholder={`Default (${options.default_icon})`}
              color={effectiveColor}
            />
          </div>
          <div>
            <Label>Back icon</Label>
            <IconField
              label="Back icon"
              value={card.icon_back ?? ''}
              onChange={(v) => onChange({ icon_back: v || undefined })}
              placeholder="Same as front"
              color={effectiveColor}
            />
          </div>
        </div>

        <div>
          <Label>Color</Label>
          <ColorField value={color} onChange={(v) => onChange({ color: v || undefined })} />
        </div>

        <ContentEditor
          id="card-contents"
          label="Front contents"
          lines={card.contents}
          onChange={(lines) => onChange({ contents: lines })}
          images={localImages(card)}
          options={options}
          onAddImage={addImage}
          color={effectiveColor}
          icon={card.icon || options.default_icon}
        />

        <div className="pt-1 border-t border-gray-200 dark:border-[#2E333D]">
          <div className="pt-4">
            <Toggle
              id="back-text"
              checked={Boolean(card.background_text_toggle)}
              onChange={(v) => onChange({ background_text_toggle: v })}
              label="Custom back side (use text instead of the icon back)"
            />
          </div>
        </div>

        {card.background_text_toggle && (
          <ContentEditor
            id="back-contents"
            label="Back contents"
            lines={card.back_contents}
            onChange={(lines) => onChange({ back_contents: lines })}
            images={localImages(card)}
            options={options}
            onAddImage={addImage}
            color={effectiveColor}
            icon={card.icon_back || card.icon || options.default_icon}
          />
        )}

        <ImageLibrary
          images={localImages(card)}
          text={[...card.contents, ...card.back_contents].join('\n')}
          onInsert={(name) => onChange({ contents: [...card.contents.filter((l, i, a) => i < a.length - 1 || l.trim()), `image | 120 | @${name}`] })}
          onRemove={(name) => {
            const { [name]: _gone, ...rest } = localImages(card);
            onChange({ images: Object.keys(rest).length ? rest : undefined });
          }}
        />

        <div>
          <Label htmlFor="card-tags" hint="comma separated, used by sort & filter">
            Tags
          </Label>
          <Input
            id="card-tags"
            defaultValue={card.tags.join(', ')}
            onBlur={(e) =>
              onChange({
                tags: e.target.value
                  .split(',')
                  .map((t) => t.trim().toLowerCase())
                  .filter(Boolean),
              })
            }
            placeholder="spell, mage"
          />
        </div>
      </div>
    </Panel>
  );
};
