import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  avatarToken,
  buttonClasses,
  cardClasses,
  iconButtonClasses,
  tagClasses,
} from '../src/components/ui/classes.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

function sourceFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) return sourceFiles(child);
    return entry.name.endsWith('.tsx') ? [child] : [];
  });
}

/** The class list on each `<select>` opening tag, before its first option. */
function selectClassLists(text: string): string[] {
  return [...text.matchAll(/<select\b/g)].map((match) => {
    const head = text.slice(match.index ?? 0, (match.index ?? 0) + 900).split('<option')[0];
    return head.match(/className="([^"]*)"/)?.[1] ?? '';
  });
}

test('Button classes expose every supported variant and size', () => {
  assert.match(buttonClasses('primary', 'default'), /ui-button--primary/);
  assert.match(buttonClasses('secondary', 'small'), /ui-button--secondary/);
  assert.match(buttonClasses('ghost', 'default'), /ui-button--ghost/);
  assert.match(buttonClasses('primary', 'default'), /ui-button--default/);
  assert.match(buttonClasses('primary', 'small'), /ui-button--small/);
});

test('IconButton exposes default and small sizes', () => {
  assert.equal(iconButtonClasses('default'), 'ui-icon-button ui-icon-button--default');
  assert.equal(iconButtonClasses('small'), 'ui-icon-button ui-icon-button--small');
});

test('Card exposes a quiet nested-surface tone without changing its shape', () => {
  assert.equal(cardClasses('subtle', false), 'ui-card ui-card--subtle');
  assert.equal(
    cardClasses('default', true),
    'ui-card ui-card--default ui-card--divided',
  );
});

test('Tag exposes the tones the product labels use', () => {
  assert.equal(tagClasses('neutral'), 'ui-tag ui-tag--neutral');
  assert.equal(tagClasses('success'), 'ui-tag ui-tag--success');
  assert.equal(tagClasses('validated'), 'ui-tag ui-tag--validated');
  assert.equal(tagClasses('pending'), 'ui-tag ui-tag--pending');
  assert.equal(tagClasses('attention'), 'ui-tag ui-tag--attention');
  const css = source('../src/index.css');
  assert.match(css, /\.ui-tag--attention \{/);
  assert.match(css, /color: var\(--color-badge\)/);
  assert.match(css, /color-mix\([^)]*var\(--color-badge\)/);
  assert.match(css, /\.attention-grid-status-pill--pending \{/);
  assert.match(css, /\.attention-grid-status-pill--attention \{/);
});

/* Three heights, each named for the role it serves: a 40px field for entering
   and reading data, a 36px standalone button, a 32px control in a dense list.
   A dropdown is a field, so it takes the field height rather than the height of
   whatever control happens to sit near it. */
test('control heights come from three role tokens', () => {
  const css = source('../src/index.css');

  assert.match(css, /--control-height-field: 2\.5rem;/);
  assert.match(css, /--control-height-default: 2\.25rem;/);
  assert.match(css, /--control-height-small: 2rem;/);
  assert.match(
    css,
    /\.ui-button--default \{\s*height: var\(--control-height-default\);/,
  );
  assert.match(
    css,
    /\.ui-icon-button--default \{\s*width: var\(--control-height-default\);\s*height: var\(--control-height-default\);/,
  );
  assert.match(css, /\.ui-button--small \{\s*height: var\(--control-height-small\);/);
});

test('every dropdown is the shared 40px field, so none can drift', () => {
  const css = source('../src/index.css');

  assert.match(css, /\.ui-select \{[\s\S]*?height: var\(--control-height-field\);/);
  assert.match(css, /\.ui-select:focus-visible,/);
  // A clear button needs room beside the chevron; nothing else may re-pad it.
  assert.match(css, /\.ui-select--clearable \{\s*padding-right: 4rem;/);
  assert.doesNotMatch(css, /\.ui-select--small/);

  const offenders: string[] = [];
  for (const file of sourceFiles(new URL('../src/', import.meta.url))) {
    for (const classList of selectClassLists(readFileSync(file, 'utf8'))) {
      if (!/\bui-select\b/.test(classList)) {
        offenders.push(`${file.pathname.split('/src/')[1]} <select class="${classList}">`);
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'every <select> must carry ui-select instead of its own height and padding',
  );
});

/* One label treatment for every field, dense panel or not: 14px medium primary
   text with 4px to the field. A 12px tier existed for filter panels and made
   the same control read as two different things depending on the screen. */
test('every field label is the one 14px medium tier', () => {
  const offenders: string[] = [];

  for (const file of sourceFiles(new URL('../src/', import.meta.url))) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(/<label className="([^"]*)"([\s\S]{0,700}?)<\/label>/g)) {
      const [, classList, body] = match;
      if (!/\bblock\b/.test(classList)) continue;
      if (!/<(input|select|textarea)\b/.test(body)) continue;
      if (
        !/\btext-sm\b/.test(classList) ||
        !/\bfont-medium\b/.test(classList) ||
        !/\btext-text\b/.test(classList)
      ) {
        offenders.push(`${file.pathname.split('/src/')[1]} <label class="${classList}">`);
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'a field label must be text-sm, font-medium, text-text',
  );
});

test('Avatar names map to exactly three token values', () => {
  assert.equal(avatarToken('sm'), 'var(--avatar-sm)');
  assert.equal(avatarToken('md'), 'var(--avatar-md)');
  assert.equal(avatarToken('lg'), 'var(--avatar-lg)');
});

/* 1px hairline, 2px focus/ring, 3px section underline, 4px rail marker.
   Widths stay the same; they just stop being literals. */
test('border widths come from four tokens and every chrome uses them', () => {
  const css = source('../src/index.css');

  assert.match(css, /--border-width: 1px;/);
  assert.match(css, /--border-width-focus: 2px;/);
  assert.match(css, /--border-width-nav: 3px;/);
  assert.match(css, /--border-width-rail: 4px;/);

  assert.match(css, /\.ui-button \{[\s\S]*?border: var\(--border-width\) solid transparent;/);
  assert.match(css, /\.ui-icon-button \{[\s\S]*?border: var\(--border-width\) solid var\(--color-border\);/);
  assert.match(css, /\.ui-select \{[\s\S]*?border: var\(--border-width\) solid var\(--color-border\);/);
  assert.match(css, /\.ui-card \{[\s\S]*?border: var\(--border-width\) solid var\(--color-border-subtle\);/);
  assert.match(css, /\.ui-card--divided > \* \+ \* \{[\s\S]*?border-top: var\(--border-width\) solid/);
  assert.match(
    css,
    /border-start-start-radius: calc\(var\(--radius-lg\) - var\(--border-width\)\);/,
  );
  assert.match(css, /\.app-header \{[\s\S]*?border-bottom: var\(--border-width\) solid/);
  assert.match(css, /\.header-menu-trigger \{[\s\S]*?border: var\(--border-width\) solid var\(--color-border\);/);

  assert.match(
    css,
    /\.ui-button:focus-visible,[\s\S]*?outline: var\(--border-width-focus\) solid var\(--color-brand\);/,
  );
  assert.match(css, /\.ui-linked-surface:focus-visible \{[\s\S]*?outline: var\(--border-width-focus\) solid/);
  assert.match(
    css,
    /\.ui-target-row:has\(\.ui-target-row__link:focus-visible\) \{[\s\S]*?outline: var\(--border-width-focus\) solid/,
  );
  assert.match(
    css,
    /\.header-utility \.ui-badge \{[\s\S]*?box-shadow: 0 0 0 var\(--border-width-focus\) var\(--color-surface\);/,
  );

  assert.match(
    css,
    /\.main-nav-link \{[\s\S]*?border-bottom: var\(--border-width-nav\) solid transparent;/,
  );
  assert.match(css, /\.main-nav-link \{[\s\S]*?padding-top: var\(--border-width-nav\);/);
  assert.match(css, /\.ui-rail-item \{[\s\S]*?border-left-width: var\(--border-width-rail\);/);

  assert.doesNotMatch(css, /border: 1px solid/);
  assert.doesNotMatch(css, /outline: 2px solid/);
  assert.doesNotMatch(css, /border-bottom: 3px solid/);
  assert.doesNotMatch(css, /box-shadow: 0 0 0 2px /);
});

test('a full circle is one radius token, not 9999px in one place and rounded-full in another', () => {
  const css = source('../src/index.css');
  const request = source('../src/pages/BookingRequest.tsx');
  const messages = source('../src/pages/Messages.tsx');
  const pinned = source('../src/components/PinnedQuestion.tsx');

  assert.match(css, /--radius-full: 9999px;/);
  assert.match(css, /\.ui-badge \{[\s\S]*?border-radius: var\(--radius-full\);/);
  assert.match(css, /\.avatar \{[\s\S]*?border-radius: var\(--radius-full\);/);
  assert.match(css, /\.pinned-question-trigger \{[\s\S]*?border-radius: var\(--radius-full\);/);
  assert.doesNotMatch(css, /border-radius: 9999px/);

  assert.match(css, /@theme \{[\s\S]*?--radius-full: 9999px;/);
  assert.match(request, /rounded-full/);
  assert.match(messages, /rounded-full/);
  assert.match(pinned, /rounded-full/);
});
