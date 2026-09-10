import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  fatigueSignalForBooking,
  fatigueSignalForWorker,
  fatigueSignalLabel,
  getLocationData,
  type Booking,
} from '../src/data/locations.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

function calendarBooking(
  id: string,
  workerId: string,
  start: Date,
  end: Date,
): Booking {
  return {
    id,
    locationId: 'external',
    workerId,
    workerName: 'Test Worker',
    start,
    end,
    status: 'confirmed',
    sleepover: false,
    createdByMe: false,
    participantIds: [],
  };
}

test('fatigue distinguishes no break from less than eight hours rest', () => {
  const target = new Date('2026-09-10T12:00:00');
  const workerId = 'test-worker-with-no-seeded-bookings';

  assert.equal(
    fatigueSignalForWorker(workerId, target, {
      additionalBookings: [
        calendarBooking(
          'back-to-back',
          workerId,
          new Date('2026-09-10T08:00:00'),
          new Date('2026-09-10T12:00:00'),
        ),
      ],
    }),
    'no-break',
  );
  assert.equal(
    fatigueSignalForWorker(workerId, target, {
      additionalBookings: [
        calendarBooking(
          'short-rest',
          workerId,
          new Date('2026-09-10T01:00:00'),
          new Date('2026-09-10T04:00:01'),
        ),
      ],
    }),
    'short-rest',
  );
  assert.equal(
    fatigueSignalForWorker(workerId, target, {
      additionalBookings: [
        calendarBooking(
          'adequate-rest',
          workerId,
          new Date('2026-09-09T22:00:00'),
          new Date('2026-09-10T04:00:00'),
        ),
      ],
    }),
    null,
  );
});

test('the booking being rendered is excluded and the signal is derived, not stored', () => {
  const target = calendarBooking(
    'target',
    'test-worker-with-no-seeded-bookings',
    new Date('2026-09-10T12:00:00'),
    new Date('2026-09-10T16:00:00'),
  );
  const prior = calendarBooking(
    'prior',
    target.workerId,
    new Date('2026-09-10T08:00:00'),
    new Date('2026-09-10T11:00:00'),
  );
  const beforeShift = { now: new Date('2026-09-10T06:00:00') };

  assert.equal(
    fatigueSignalForBooking(target, {
      ...beforeShift,
      additionalBookings: [prior, target],
    }),
    'short-rest',
  );
  assert.equal(
    fatigueSignalForBooking(target, { ...beforeShift, additionalBookings: [target] }),
    null,
  );

  const data = source('../src/data/locations.ts');
  const request = source('../src/pages/BookingRequest.tsx');
  const bookingType = data.slice(data.indexOf('export type Booking ='), data.indexOf('export type GroupingRequestSummary'));
  const newBooking = request.slice(request.indexOf('const newBooking: Booking'), request.indexOf('onCreateBooking(newBooking)'));
  assert.doesNotMatch(bookingType, /fatigue|restSignal/);
  assert.doesNotMatch(newBooking, /fatigue|restSignal/);
});

test('seeded data demonstrates fatigue without exposing the other booking', () => {
  const target = getLocationData('galston-1').bookings.find(
    (booking) => booking.id === 'galston-1-1-0',
  );
  assert.ok(target);
  assert.notEqual(fatigueSignalForBooking(target), null);

  assert.equal(fatigueSignalLabel('no-break'), 'No break before shift');
  assert.equal(fatigueSignalLabel('short-rest'), 'Less than 8 hours rest');
  assert.deepEqual(Object.keys({ signal: fatigueSignalForBooking(target) }), ['signal']);
});

test('rest only reads on shifts a manager can still act on', () => {
  const workerId = 'test-worker-with-no-seeded-bookings';
  const now = new Date('2026-09-10T06:00:00');
  const shift = (
    id: string,
    status: Booking['status'],
    start: Date,
  ): Booking => ({
    ...calendarBooking(id, workerId, start, new Date(start.getTime() + 4 * 36e5)),
    status,
  });
  /* Every case shares one prior booking three hours before the shift starts, so
     the only thing deciding the signal is whether the shift is still ahead. */
  const priorTo = (start: Date) =>
    calendarBooking(
      `prior-${start.toISOString()}`,
      workerId,
      new Date(start.getTime() - 7 * 36e5),
      new Date(start.getTime() - 3 * 36e5),
    );

  const upcoming = new Date('2026-09-10T12:00:00');
  for (const status of ['requested', 'confirmed'] as const) {
    const booking = shift(`upcoming-${status}`, status, upcoming);
    assert.equal(
      fatigueSignalForBooking(booking, {
        now,
        additionalBookings: [booking, priorTo(upcoming)],
      }),
      'short-rest',
      `${status} shifts still ahead keep the signal`,
    );
  }

  const ended = shift('ended-shift', 'ended', new Date('2026-09-08T12:00:00'));
  assert.equal(
    fatigueSignalForBooking(ended, {
      now,
      additionalBookings: [ended, priorTo(ended.start)],
    }),
    null,
    'an ended shift has nothing left to decide',
  );

  const started = shift('already-started', 'confirmed', new Date('2026-09-10T05:00:00'));
  assert.equal(
    fatigueSignalForBooking(started, {
      now,
      additionalBookings: [started, priorTo(started.start)],
    }),
    null,
    'a shift that has already begun is past the decision',
  );
});

test('the calendar card label wraps in full rather than clipping at the card edge', () => {
  const week = source('../src/pages/dashboard/BookingsWeek.tsx');
  const css = source('../src/index.css');
  const card = week.slice(week.indexOf('{fatigueSignal && ('), week.indexOf('<StatusPill'));

  /* A grid cell is a seventh of the column, so the label has to be free to take
     a second line. A Tag cannot: it holds one line and the card clips it. */
  assert.doesNotMatch(card, /<Tag/);
  assert.match(card, /text-xs/);
  assert.doesNotMatch(card, /truncate|text-ellipsis|whitespace-nowrap/);
  /* The card clips overflow, so even a word too wide for a narrow window has to
     break rather than lose its tail. */
  assert.match(card, /break-words/);
  /* Nothing may depend on hovering to read the label. */
  assert.doesNotMatch(card, /title=|data-tooltip|ui-tooltip/);

  /* The shared Tag keeps its single line for the short labels it was built for. */
  assert.match(css, /\.ui-tag \{[^}]*white-space: nowrap;/);
});

test('fatigue appears at selection, on booking cards, and on booking detail', () => {
  const request = source('../src/pages/BookingRequest.tsx');
  const bookings = source('../src/pages/Bookings.tsx');
  const week = source('../src/pages/dashboard/BookingsWeek.tsx');

  assert.match(request, /fatigueSignalForWorker/);
  assert.match(request, /fatigueSignalForBooking/);
  assert.match(bookings, /fatigueSignalForBooking/);
  assert.match(week, /fatigueSignalForBooking/);
  assert.match(request, /questionId="request-worker-fatigue"/);
  assert.match(request, /questionId="booking-detail-fatigue"/);
  assert.match(bookings, /questionId="booking-card-fatigue"/);

  assert.match(bookings, /\{hours\} \{hours === 1 \? 'hour' : 'hours'\}/);
  assert.match(request, /\{hours\} \{hours === 1 \? 'hour' : 'hours'\}/);
});

test('fatigue copy never reveals another booking’s details', () => {
  for (const path of [
    '../src/pages/BookingRequest.tsx',
    '../src/pages/Bookings.tsx',
    '../src/pages/dashboard/BookingsWeek.tsx',
  ]) {
    const contents = source(path);
    assert.doesNotMatch(contents, /other booking (?:at|from)|previous booking (?:at|from)/i);
    assert.doesNotMatch(
      contents,
      /(?:fatigue|rest)[^<\n]*(?:location|client|provider|shift count)/i,
    );
  }
});
