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
