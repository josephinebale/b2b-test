import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

test('container insets are one scale of three steps, not one flat value', () => {
  const css = read('../src/index.css');

  assert.match(css, /\.ui-inset-compact\s*\{\s*padding: var\(--space-2\);\s*\}/);
  assert.match(
    css,
    /\.ui-inset-row\s*\{\s*padding: var\(--space-3\) var\(--space-4\);\s*\}/,
  );
  assert.match(css, /\.ui-inset-card\s*\{\s*padding: var\(--space-4\);\s*\}/);
});

test('dense week cells stay tight while cards and rows step up', () => {
  const calendar = read('../src/pages/dashboard/BookingsWeek.tsx');
  const strip = read('../src/pages/dashboard/NotificationStrip.tsx');
  const bookings = read('../src/pages/Bookings.tsx');

  // Seven columns in one row: a full card inset would cost more than the
  // content itself, so the grid keeps the compact step.
  assert.match(calendar, /ui-inset-compact/);
  assert.doesNotMatch(calendar, /ui-inset-card|ui-inset-row/);

  assert.match(strip, /ui-inset-card/);
  assert.match(bookings, /<Card as="article" className="ui-inset-card/);
});

test('every list row uses the row step, so their content shares one left edge', () => {
  const rows = {
    locations: read('../src/pages/ChooseLocation.tsx'),
    messages: read('../src/pages/Messages.tsx'),
    notifications: read('../src/pages/Notifications.tsx'),
    settings: read('../src/pages/Settings.tsx'),
    workers: read('../src/pages/Workers.tsx'),
    workersPanel: read('../src/pages/dashboard/WorkersPanel.tsx'),
  };

  for (const [name, source] of Object.entries(rows)) {
    assert.match(source, /ui-inset-row/, `${name} should use the row inset`);
  }
});
