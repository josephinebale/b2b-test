import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const SRC = new URL('../src/', import.meta.url);
const DEFAULT_ICON = 'h-5 w-5';
const SMALL_ICON = 'h-4 w-4';

function sourceFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) return sourceFiles(child);
    return entry.name.endsWith('.tsx') ? [child] : [];
  });
}

/** Local names of every lucide icon a file renders, including `as` aliases and the
 *  `Icon` field the notification and menu lists map over. */
function iconNames(source: string): string[] {
  const imports = source.match(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/g) ?? [];
  const names = imports.flatMap((block) =>
    block
      .replace(/import\s*\{|\}\s*from\s*'lucide-react'/g, '')
      .split(',')
      .map((part) => part.trim().split(/\s+as\s+/).pop() ?? '')
      .filter((name) => /^[A-Z]/.test(name)),
  );
  if (/\bIcon\b\s*[,:}]/.test(source)) names.push('Icon');
  return [...new Set(names)];
}

/*
 * One size everywhere, with two sanctioned pairings rather than a second free
 * size: a glyph inside the 32px IconButton drops to 16px so it keeps the same
 * 8px inset that a 20px glyph gets in the 36px one; a chevron immediately
 * following an inline text label is 16px because it is a companion to the text
 * rather than a glyph inside a control. Each exception is checked against its
 * neighbour rather than allowed outright, so 16px cannot leak out to loose icons.
 */
test('every icon renders at the size its control calls for', () => {
  const offenders: string[] = [];

  for (const file of sourceFiles(SRC)) {
    const source = readFileSync(file, 'utf8');
    const names = iconNames(source);
    if (names.length === 0) continue;

    for (const name of names) {
      const usages = source.matchAll(
        new RegExp(`<${name}\\s+className="([^"]*)"`, 'g'),
      );
      for (const usage of usages) {
        const [, className] = usage;
        const where = `${file.pathname.split('/src/')[1]} <${name} class="${className}">`;

        if (className.includes(DEFAULT_ICON)) continue;

        if (className.includes(SMALL_ICON)) {
          const before = source.slice(0, usage.index);
          const opening = before.lastIndexOf('<IconButton');
          if (opening !== -1 && /size="small"/.test(before.slice(opening))) {
            continue;
          }
          const chunk = before.slice(-600);
          const besideLabel =
            />([^<]*[A-Za-z][^<]*)<\/span>\s*$/.test(chunk) ||
            />\s*[A-Za-z][^<]*\s*$/.test(chunk);
          const inInlineFlex = /className="[^"]*\binline-flex\b[^"]*"/.test(
            chunk,
          );
          if (besideLabel && inInlineFlex) continue;
          offenders.push(
            `${where} — ${SMALL_ICON} outside a small IconButton or an inline text-label companion`,
          );
          continue;
        }

        offenders.push(where);
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `icons must be ${DEFAULT_ICON}, or ${SMALL_ICON} inside a small IconButton or beside an inline text label`,
  );
});
