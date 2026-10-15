// Card text is raw HTML by design (the original allowed `<b>`, `<i>`, inline styles...), and save files can
// come from anyone. Strip anything that can execute script before it is ever put into the page.
const FORBIDDEN = 'script,iframe,object,embed,link,meta,base,form,style,noscript,template,frame,frameset';

export function sanitizeHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  doc.body.querySelectorAll(FORBIDDEN).forEach((el) => el.remove());
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase().replace(/[\u0000- ]/g, '');
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      else if (['href', 'src', 'xlink:href', 'action', 'formaction'].includes(name) && /^(javascript|vbscript|data:text\/html)/.test(value)) {
        el.removeAttribute(attr.name);
      } else if (name === 'style' && /expression\(|javascript:|@import/.test(value)) el.removeAttribute(attr.name);
    }
  });
  return doc.body.innerHTML;
}
