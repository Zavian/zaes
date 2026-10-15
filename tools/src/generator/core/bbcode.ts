// BBCode -> HTML, same tag set as the original bbcode2html configuration.
export interface BbCode {
  code: string;
  example: string;
  html: string; // replacement; $1 = first capture, $2 = second
  pattern: RegExp;
  explanation: string;
}

const TEXT = '(.*?)';
const COLOR = '([a-z]+|#[0-9a-f]+)';

const def = (code: string, open: string, replacement: string, explanation: string, example: string): BbCode => ({
  code,
  example,
  html: replacement,
  pattern: new RegExp(`\\[${code}${open}\\]${TEXT}\\[/${code}\\]`, 'gis'),
  explanation,
});

export const BBCODES: BbCode[] = [
  def('b', '', '<strong>$1</strong>', 'Makes the text <strong>bold</strong>.', '[b]text[/b]'),
  def('i', '', '<em>$1</em>', 'Makes the text <em>italic</em>.', '[i]text[/i]'),
  def('u', '', '<span style="text-decoration:underline;">$1</span>', '<u>Underlines</u> the text.', '[u]text[/u]'),
  def('s', '', '<span style="text-decoration:line-through;">$1</span>', '<s>Strikes</s> through the text.', '[s]text[/s]'),
  def('color', `=${COLOR}`, '<span style="color: $1">$2</span>', 'Colors the text. Accepts color names and #hex values.', '[color=red]text[/color]'),
  def('highlight', `=${COLOR}`, '<span style="background-color:$1">$2</span>', 'Highlights the text. Accepts color names and #hex values.', '[highlight=yellow]text[/highlight]'),
  def('center', '', '<p style="text-align: center;">$1</p>', 'Centers the text.', '[center]text[/center]'),
  def('justify', '', '<p style="text-align: justify;">$1</p>', 'Justifies the text.', '[justify]text[/justify]'),
  def('right', '', '<p style="text-align: right;">$1</p>', 'Aligns the text to the right.', '[right]text[/right]'),
];

// [img] is resolved in image.ts (it needs the card's pictures); listed here so the help shows it.
export const IMG_BBCODE_HELP: Pick<BbCode, 'code' | 'example' | 'explanation'> = {
  code: 'img',
  example: '[img=24]@name[/img]  or  [img=24]https://…/pic.png[/img]',
  explanation:
    'A small picture inside a line of text. The number is its height in px. Use <code>@name</code> for a picture added with the Image button (see the card’s pictures list), or paste an https:// link.',
};

export function bbcodeToHtml(input: string): string {
  let out = input;
  // A few passes so nested codes ([b][i]..[/i][/b]) resolve regardless of order.
  for (let pass = 0; pass < 4; pass++) {
    const before = out;
    for (const bb of BBCODES) {
      bb.pattern.lastIndex = 0;
      out = out.replace(bb.pattern, bb.html);
    }
    if (out === before) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Editor toggling ([b]/[i]/[u]).
//
// The lines around the selection are read as (character, stack of open tags) runs and written back with the
// fewest tags, so toggling is exact: bold + italic + bold again leaves just italic instead of piling up tags.
// Tags that are unbalanced within those lines are left alone as plain text.
// ---------------------------------------------------------------------------
const TAG_RE = /\[(\/)?(b|i|u|s|color|highlight|center|justify|right)(=[^\]\n]*)?\]/gi;

interface Run {
  ch: string;
  stack: string[]; // open-tag strings, outermost first
}

function parseRuns(text: string): { runs: Run[]; charIndexAt: (offset: number) => number } {
  const tags: { start: number; end: number; name: string; open: string | null }[] = [];
  for (const m of text.matchAll(TAG_RE)) {
    tags.push({ start: m.index!, end: m.index! + m[0].length, name: m[2].toLowerCase(), open: m[1] ? null : m[0] });
  }
  // Pair each close with its nearest open of the same name; anything unpaired stays literal text.
  const matched = new Set<number>();
  const open: number[] = [];
  tags.forEach((t, i) => {
    if (t.open) return void open.push(i);
    for (let k = open.length - 1; k >= 0; k--) {
      if (tags[open[k]].name === t.name) {
        matched.add(open[k]);
        matched.add(i);
        open.length = k;
        return;
      }
    }
  });

  const runs: Run[] = [];
  const stack: string[] = [];
  const names: string[] = [];
  const startOfChar: number[] = [];
  let pos = 0;
  const flushText = (to: number) => {
    for (; pos < to; pos++) {
      runs.push({ ch: text[pos], stack: [...stack] });
      startOfChar.push(pos);
    }
  };
  tags.forEach((t, i) => {
    if (!matched.has(i)) return;
    flushText(t.start);
    pos = t.end;
    if (t.open) {
      stack.push(t.open);
      names.push(t.name);
    } else {
      // A close also ends anything opened inside it and left dangling.
      const at = Math.max(names.lastIndexOf(t.name), 0);
      stack.length = names.length = at;
    }
  });
  flushText(text.length);
  // Offset -> number of characters before it.
  const charIndexAt = (offset: number) => startOfChar.filter((p) => p < offset).length;
  return { runs, charIndexAt };
}

const tagName = (open: string) => open.slice(1).split(/[=\]]/)[0].toLowerCase();

export function toggleBbcode(value: string, start: number, end: number, code: 'b' | 'i' | 'u'): { value: string; start: number; end: number } {
  const open = `[${code}]`;
  const close = `[/${code}]`;

  if (start === end) {
    // Caret only: step out of an empty pair, otherwise open a new one.
    if (value.slice(start - open.length, start) === open && value.slice(end, end + close.length) === close) {
      return { value: value.slice(0, start - open.length) + value.slice(end + close.length), start: start - open.length, end: start - open.length };
    }
    return { value: value.slice(0, start) + open + close + value.slice(end), start: start + open.length, end: start + open.length };
  }

  const regionStart = value.lastIndexOf('\n', start - 1) + 1;
  const nl = value.indexOf('\n', end);
  const regionEnd = nl === -1 ? value.length : nl;
  const region = value.slice(regionStart, regionEnd);
  const { runs, charIndexAt } = parseRuns(region);
  const from = charIndexAt(start - regionStart);
  const to = charIndexAt(end - regionStart);
  const targets = runs.slice(from, to);
  if (!targets.length) return { value, start, end };

  const has = (r: Run) => r.stack.some((t) => tagName(t) === code);
  const remove = targets.every(has);
  for (let i = from; i < to; i++) {
    const r = runs[i];
    r.stack = remove ? r.stack.filter((t) => tagName(t) !== code) : has(r) ? r.stack : [...r.stack, open];
  }

  let out = '';
  let cur: string[] = [];
  const goto = (want: string[]) => {
    let p = 0;
    while (p < cur.length && p < want.length && cur[p] === want[p]) p++;
    for (let k = cur.length - 1; k >= p; k--) out += `[/${tagName(cur[k])}]`;
    for (let k = p; k < want.length; k++) out += want[k];
    cur = want;
  };
  let selStart = 0;
  let selEnd = 0;
  runs.forEach((r, i) => {
    goto(r.stack);
    if (i === from) selStart = out.length;
    out += r.ch;
    if (i === to - 1) selEnd = out.length;
  });
  goto([]);

  return {
    value: value.slice(0, regionStart) + out + value.slice(regionEnd),
    start: regionStart + selStart,
    end: regionStart + selEnd,
  };
}
