// Shrinks card titles that do not fit on one line (the original used the `fitty` library for this).
export function fitTitles(root: ParentNode, minPt = 4) {
  root.querySelectorAll<HTMLElement>('.card-name').forEach((el) => {
    el.style.fontSize = '';
    if (el.clientWidth === 0) return; // not laid out (hidden), nothing to measure
    let size = parseFloat(getComputedStyle(el).fontSize) * 0.75; // px -> pt
    let guard = 40;
    while (el.scrollWidth > el.clientWidth && size > minPt && guard-- > 0) {
      size -= 0.5;
      el.style.fontSize = `${size}pt`;
    }
  });
}
