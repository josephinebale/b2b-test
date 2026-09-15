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
  const pageContent = source('../src/lib/pageContent.ts');
  const tones = pageContent.slice(
    pageContent.indexOf('export function bookingWeekCardTone'),
    pageContent.indexOf('export function attentionCardStatusTone'),
  );

  assert.match(week, /bookingWeekCardTone\(booking\)/);
  assert.match(tones, /requested.*pending/s);
  assert.match(tones, /cancelled.*attention/s);
  assert.match(tones, /return 'default'/);
});

test('a solid pill means a decision is waiting, a tinted pill only informs', () => {
  const pill = source('../src/components/StatusPill.tsx');

  assert.match(pill, /confirmed: 'bg-success-surface text-success'/);
  assert.match(pill, /requested: 'bg-pending text-surface'/);
  assert.match(pill, /ended: 'bg-neutral-surface text-neutral'/);
  assert.match(pill, /cancelled: 'bg-pending text-surface'/);
});

test('a cancelled week card uses the attention tone and names who cancelled', () => {
  const week = source('../src/pages/dashboard/BookingsWeek.tsx');
  const card = week.slice(
    week.indexOf('function BookingCard'),
    week.indexOf('export function BookingsWeek'),
  );

  assert.match(card, /tone=\{bookingWeekCardTone\(booking\)\}/);
  assert.match(card, /attentionCardSendLine\(booking\)/);
  assert.match(card, /text-badge/);
  assert.match(
    card,
    /booking\.status === 'cancelled'[\s\S]*attentionCardSendLine\(booking\)/,
  );
});

test('a declined request still tints pending on the Dashboard attention calendar', () => {
  const attention = source('../src/pages/dashboard/BookingsNeedingAttention.tsx');
  const css = source('../src/index.css');

  assert.match(attention, /tone=\{bookingWeekCardTone\(booking\)\}/);
  assert.match(attention, /attention-grid-status-pill--pending/);
  assert.match(attention, /attention-grid-status-pill--attention/);
  assert.match(attention, /<Tag tone="neutral">\{inWeek\.length\}<\/Tag>/);
  assert.doesNotMatch(attention, /<Tag tone="pending"/);
  assert.doesNotMatch(attention, /attentionCardTone/);
  assert.match(
    css,
    /\.attention-grid-status-pill--pending \{[\s\S]*?background: var\(--color-pending\);[\s\S]*?color: var\(--color-surface\);/,
  );
  assert.match(
    css,
    /\.attention-grid-status-pill--attention \{[\s\S]*?background: var\(--color-badge\);[\s\S]*?color: var\(--color-surface\);/,
  );
  assert.match(
    attention,
    /flex w-full items-center justify-center rounded px-1\.5 py-1/,
  );
  assert.match(attention, /<div className="mt-3">/);
  assert.doesNotMatch(css, /\.attention-grid-status-pill \{/);
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
