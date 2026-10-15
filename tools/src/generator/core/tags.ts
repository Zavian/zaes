export interface TagDoc {
  name: string;
  syntax: string; // shown in help, inserted by "Insert tag"
  insert: string; // text dropped into the editor
  description: string;
  fs?: boolean; // supports a trailing `| fs-N` size parameter
}

export const TAG_DOCS: TagDoc[] = [
  { name: 'subtitle', syntax: 'subtitle | (text)', insert: 'subtitle | ', description: 'Italic line under the title, in the card color.' },
  { name: 'property', syntax: 'property | (bold text) | (normal text)', insert: 'property |  | ', description: 'A bold label followed by a value. A 3rd and 4th parameter add a second pair on the right.' },
  { name: 'rule', syntax: 'rule', insert: 'rule', description: 'A horizontal line in the card color.' },
  { name: 'boxes', syntax: 'boxes | (number of boxes) [| (size of each box)]', insert: 'boxes | 3 | 2.5', description: 'A row of empty boxes (charges, hit dice...). Size is in em, default 3.' },
  { name: 'description', syntax: 'description | (italic title) | (normal text)', insert: 'description |  | ', description: 'An italic bold name followed by a period and text.' },
  { name: 'dndstats', syntax: 'dndstats | (str) | (dex) | (con) | (int) | (wis) | (cha)', insert: 'dndstats | 10 | 10 | 10 | 10 | 10 | 10', description: 'Ability score table with modifiers. Useful for stat blocks.' },
  { name: 'stats', syntax: 'stats | (str) | (dex) | (con) | (int) | (wis) | (cha)', insert: 'stats | 10 | 10 | 10 | 10 | 10 | 10', description: 'Like dndstats, without the modifiers.' },
  { name: 'text', syntax: 'text | (text)', insert: 'text | ', description: 'Plain paragraph. BBCode and HTML work inside it.', fs: true },
  { name: 'center', syntax: 'center | (text)', insert: 'center | ', description: 'Centered paragraph.', fs: true },
  { name: 'justify', syntax: 'justify | (text)', insert: 'justify | ', description: 'Justified paragraph.', fs: true },
  { name: 'bullet', syntax: 'bullet | (text)', insert: 'bullet | ', description: 'A bullet point.' },
  { name: 'fill', syntax: 'fill | (numeric value)', insert: 'fill | 1', description: 'Flexible empty space. Use it to push content to the bottom (footers) or to space blocks. The number is the relative weight.' },
  { name: 'section', syntax: 'section | (text)', insert: 'section | ', description: 'Small-caps heading with a line under it, in the card color.' },
  { name: 'disabled', syntax: 'disabled | (text)', insert: 'disabled | ', description: 'Renders nothing. Handy for notes that must not appear on the card.' },
  { name: 'icon', syntax: 'icon | (icon name) [| (size in px) | (left|center|right)]', insert: 'icon | ace | 40 | center', description: 'A smaller inline icon coloured like the card.' },
  { name: 'image', syntax: 'image | (width, 120 / 50% / 120x80) | (@icon, @name or https URL) [| left|center|right | opacity=50 | fill=card]', insert: 'image | 120 | @', description: 'A picture on its own line. Use the Image button to add one from your computer. opacity is 0-100, fill=card (or a color) paints the picture in that color, using its shape as a stencil. @icon is the card’s own icon, painted in the card color (fill=none to keep it as is). Inline in text: [img=24]@name[/img].' },
  { name: 'lore', syntax: 'lore | (text)', insert: 'lore | ', description: 'Italic orange-ish flavour text.' },
  { name: 'centerlore', syntax: 'centerlore | (text)', insert: 'centerlore | ', description: 'Like lore, centered.' },
  { name: 'action', syntax: 'action | (text)', insert: 'action | ', description: 'Large centered text in the card color. Defaults to fs-2.', fs: true },
];

export const FS_NOTE = 'Add `| fs-1` to `| fs-6` as the last parameter to change the text size (fs-6 smallest, fs-1 largest).';
