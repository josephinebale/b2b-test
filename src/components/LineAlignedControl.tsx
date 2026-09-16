import { useLayoutEffect, useRef, type ReactNode } from 'react';

type TextLine = 'sm' | 'md' | 'xl';

type LineBand = { top: number; bottom: number };

/* The vertical band of every rendered line in the text block. Rects on one line
   always overlap vertically — a badge inside a title belongs to the title's line
   — while a supporting line below it never does, so overlap is the test and
   there is no pixel tolerance to tune. This is how the mode is derived: the
   content is counted, never declared. */
function textLines(block: Element): LineBand[] {
  const range = document.createRange();
  range.selectNodeContents(block);
  const bands: LineBand[] = [];
  for (const rect of range.getClientRects()) {
    if (rect.width === 0 || rect.height === 0) continue;
    const band = bands.find(
      (candidate) =>
        rect.top < candidate.bottom - 1 && rect.bottom > candidate.top + 1,
    );
    if (band) {
      band.top = Math.min(band.top, rect.top);
      band.bottom = Math.max(band.bottom, rect.bottom);
    } else {
      bands.push({ top: rect.top, bottom: rect.bottom });
    }
  }
  return bands;
}

function lastBaselineY(block: Element): number | null {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let last: Text | null = null;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.textContent?.trim()) last = node as Text;
  }
  if (!last?.parentNode) return null;
  const probe = document.createElement('span');
  probe.style.cssText =
    'display:inline-block;width:0;height:0;padding:0;margin:0;border:0;';
  last.parentNode.insertBefore(probe, last.nextSibling);
  const y = probe.getBoundingClientRect().top;
  probe.remove();
  return y;
}

/* Two modes, and the text block picks which. More than one line: the block has
   a bottom to align to, so the control's bottom edge sits on the last line's
   baseline and the pair finishes level. One line: the block has no bottom of
   its own, so the control centres on that line — bottom-aligning a 20px text
   link to a 24px title's baseline leaves it 2px high of centre and visibly
   misses. */
function alignToText(wrapper: HTMLElement) {
  const parent = wrapper.parentElement;
  if (!parent) return;
  const textBlock = [...parent.children].find(
    (element) =>
      element !== wrapper && !element.classList.contains('line-aligned'),
  );
  const control = wrapper.firstElementChild as HTMLElement | null;
  if (!textBlock || !control) return;
  wrapper.style.transform = '';
  const lines = textLines(textBlock);
  if (lines.length === 0) return;
  const box = control.getBoundingClientRect();

  if (lines.length === 1) {
    const [line] = lines;
    const lineCentre = (line.top + line.bottom) / 2;
    const controlCentre = (box.top + box.bottom) / 2;
    wrapper.style.transform = `translateY(${lineCentre - controlCentre}px)`;
    return;
  }

  const baseline = lastBaselineY(textBlock);
  if (baseline == null) return;
  wrapper.style.transform = `translateY(${baseline - box.bottom}px)`;
}

/* One wrapper for every control that sits beside text: SectionHeadingRow asides,
   PageHeading actions, and the checkbox and avatar on a worker-selection row.
   No caller says which mode it wants — if it had to, this component would be
   the wrong shape. */
export function LineAlignedControl({
  line,
  className,
  children,
}: {
  line: TextLine;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const classes = `line-aligned line-aligned--${line}${className ? ` ${className}` : ''}`;

  useLayoutEffect(() => {
    const wrapper = ref.current;
    if (!wrapper) return;
    const parent = wrapper.parentElement;
    const apply = () => alignToText(wrapper);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(wrapper);
    if (parent) observer.observe(parent);
    const fonts = document.fonts;
    fonts?.ready.then(apply);
    return () => observer.disconnect();
  }, [children, line, className]);

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
