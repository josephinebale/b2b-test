import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('Bookings separates navigation and filters with space instead of a redundant line', () => {
  const bookings = source('../src/pages/Bookings.tsx');
  const filterStart = bookings.indexOf('<Card as="section"');
  const beforeFilter = bookings.slice(Math.max(0, filterStart - 160), filterStart);

  assert.doesNotMatch(beforeFilter, /border-t/);
  assert.doesNotMatch(beforeFilter, /pt-4/);
});

test('each Bookings column heads itself, so both headings start level', () => {
  const bookings = source('../src/pages/Bookings.tsx');
  const gridAt = bookings.indexOf('layout-rail-content');
  const titleAt = bookings.indexOf('>Bookings</h1>');
  const viewAt = bookings.indexOf('{activeLabel}</h2>');

  /* Each column opens with its own heading and sets its own gap, so the taller
     right-hand heading cannot push the rail away from the page title. */
  assert.ok(gridAt > -1 && gridAt < titleAt, 'title sits inside the rail grid');
  assert.ok(titleAt < viewAt, 'title column comes first');
  assert.match(
    bookings,
    /<h1 className="text-xl font-bold text-text">Bookings<\/h1>\s*<aside className="mt-6 ui-rail-stack">/,
  );
  assert.match(bookings, /<h2 className="text-lg font-bold text-text">\{activeLabel\}<\/h2>/);
  assert.match(bookings, /Showing \{filteredBookings\.length > 0 \? 1 : 0\}/);
  assert.match(bookings, /<section className="mt-6">/);
});

test('booking prices use a neutral tag because price is information, not status', () => {
  const bookings = source('../src/pages/Bookings.tsx');
  const price = bookings.slice(bookings.indexOf('<Tag tone='), bookings.indexOf('<Tag tone=') + 140);

  assert.match(price, /<Tag tone="neutral"/);
});

test('the Messages search field matches the button height it sits beside', () => {
  const messages = source('../src/pages/Messages.tsx');
  const row = messages.slice(messages.indexOf('<form'), messages.indexOf('</form>'));

  assert.match(row, /className="flex items-center gap-2/);
  assert.match(row, /placeholder="Search messages"[\s\S]*?className="h-9 /);
  assert.doesNotMatch(row, /h-10/);
});

test('the conversation list scrolls inside a shell of definite height', () => {
  const css = source('../src/index.css');
  const messages = source('../src/pages/Messages.tsx');

  assert.match(
    css,
    /\.messages-shell \{\s*height: var\(--messages-shell-height\);\s*grid-template-rows: minmax\(0, 1fr\);/,
  );
  assert.doesNotMatch(css, /--messages-shell-min-height/);
  assert.match(messages, /<ul className="min-h-0 flex-1 overflow-auto">/);
  assert.equal(messages.match(/className="flex min-h-0 min-w-0/g)?.length, 2);
});

test('conversation rows are separated by one line, with none after the last', () => {
  const messages = source('../src/pages/Messages.tsx');
  const row = messages.slice(
    messages.indexOf('visible.map((conversation)'),
    messages.indexOf('</ul>'),
  );

  assert.match(row, /<li key=\{conversation\.id\} className="border-b border-border-subtle last:border-b-0">/);
  assert.doesNotMatch(row, /ui-target-row[^`]*border-b/);
});

test('settings and bookings share one definite active rail treatment', () => {
  const settings = source('../src/pages/Settings.tsx');
  const bookings = source('../src/pages/Bookings.tsx');
  const treatment =
    /flex w-full items-center gap-2 border-l-4 px-3 py-2 text-left text-sm font-bold/;

  for (const [name, rail] of [['settings', settings], ['bookings', bookings]] as const) {
    /* Labels carry weight at rest, and the active row takes a 4px marker over a
       quiet blue fill, so the selected view is legible at a glance. */
    assert.match(rail, treatment, `${name} rail item`);
    assert.match(rail, /border-text bg-info-surface text-text/, `${name} active row`);
    assert.match(rail, /border-transparent text-text-strong hover:bg-surface-selected/, `${name} idle hover`);
    assert.match(rail, /ui-rail-stack/, `${name} 16px gap below the nav`);
    assert.doesNotMatch(rail, /border-l-2 px-3 py-2/, `${name} keeps no thin marker`);
    assert.doesNotMatch(rail, /hover:bg-surface-subtle/, `${name} idle hover matches Bookings`);
  }
});

test('the five rail-content surfaces share column width, alignment, and the 16px stack', () => {
  const css = source('../src/index.css');
  const bookings = source('../src/pages/Bookings.tsx');
  const settings = source('../src/pages/Settings.tsx');
  const profile = source('../src/pages/WorkerProfile.tsx');
  const preview = source('../src/pages/LocationProfilePreview.tsx');
  const messages = source('../src/pages/Messages.tsx');

  assert.match(
    css,
    /\.layout-rail-content \{\s*display: grid;\s*align-items: start;\s*gap: var\(--space-5\);\s*grid-template-columns: var\(--narrow-column-width\) minmax\(0, 1fr\);/,
  );
  assert.match(
    css,
    /\.ui-rail-stack \{\s*display: flex;\s*flex-direction: column;\s*gap: var\(--space-4\);/,
  );

  for (const [name, page] of [
    ['bookings', bookings],
    ['settings', settings],
    ['worker profile', profile],
    ['location-profile preview', preview],
  ] as const) {
    assert.match(page, /layout-rail-content/, `${name} uses the rail layout`);
    assert.match(page, /ui-rail-stack/, `${name} uses the 16px stack`);
  }

  assert.match(messages, /layout-master-detail/);
  assert.doesNotMatch(messages, /layout-rail-content/);
  assert.doesNotMatch(messages, /border-l-4 px-3 py-2/);
  assert.doesNotMatch(messages, /ui-rail-stack/);
});

test('booking detail sections use one 24px gap without a redundant divider', () => {
  const request = source('../src/pages/BookingRequest.tsx');
  const supportDetails = request.slice(
    request.indexOf('>Support details</h2>') - 100,
    request.indexOf('>Support details</h2>'),
  );

  assert.match(supportDetails, /className="mt-6"/);
  assert.doesNotMatch(supportDetails, /border-t|pt-5/);
});
