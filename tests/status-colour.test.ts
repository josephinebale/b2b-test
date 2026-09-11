import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

/* Confirmed is the expected state of almost every booking, so colouring it
    signals nothing while filling the week grid. Colour is reserved for the
    exception that wants a decision. */

test('only a booking awaiting a decision tints its card', () => {
  const week = source('../src/pages/dashboard/BookingsWeek.tsx');
  const tones = week.slice(week.indexOf('CARD_TONES'), week.indexOf('COLLAPSED_BOOKINGS_PER_DAY'));

  assert.match(tones, /confirmed: 'default'/);
  assert.match(tones, /requested: 'pending'/);
  assert.match(tones, /ended: 'default'/);
  assert.match(tones, /cancelled: 'pending'/);
});

test('a solid pill means a decision is waiting, a tinted pill only informs', () => {
  const pill = source('../src/components/StatusPill.tsx');

  assert.match(pill, /confirmed: 'bg-success-surface text-success'/);
  assert.match(pill, /requested: 'bg-pending text-surface'/);
  assert.match(pill, /ended: 'bg-neutral-surface text-neutral'/);
  assert.match(pill, /cancelled: 'bg-pending text-surface'/);
});

test('booking prices stay a neutral tag; provenance colour is jobs-only', () => {
  const bookings = source('../src/pages/Bookings.tsx');
  const jobs = source('../src/pages/JobsToBeDone.tsx');
  const price = bookings.slice(
    bookings.indexOf('<Tag tone='),
    bookings.indexOf('<Tag tone=') + 140,
  );

  assert.match(price, /<Tag tone="neutral"/);
  assert.match(jobs, /tone="validated"/);
  assert.match(jobs, /tone="pending"/);
  assert.doesNotMatch(jobs, /tone="success"/);
});
