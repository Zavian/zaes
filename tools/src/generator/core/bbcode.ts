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
