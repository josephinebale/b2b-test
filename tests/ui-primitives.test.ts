import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
