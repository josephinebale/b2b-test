import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  BOOKINGS_ROUTE,
  BOOKING_VIEW_IDS,
  bookingActionItems,
  bookingDetailPath,
  bookingIdFromDetailPath,
  bookingViewFromPath,
  bookingsViewPath,
} from '../src/lib/pageContent.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('each booking status has its own address under the bookings route', () => {
  assert.equal(bookingsViewPath('requested'), '/bookings/requested');
  assert.equal(bookingsViewPath('approve'), '/bookings/approve');

  for (const view of BOOKING_VIEW_IDS) {
    assert.equal(bookingViewFromPath(bookingsViewPath(view)), view);
  }
});

test('a view path never collides with a requested-booking detail path', () => {
  assert.equal(bookingViewFromPath(`${BOOKINGS_ROUTE}/request/b-12`), null);
  assert.equal(bookingViewFromPath(bookingDetailPath('b-12')), null);
  assert.equal(bookingViewFromPath(BOOKINGS_ROUTE), null);
  assert.equal(bookingViewFromPath('/bookings/nonsense'), null);
});

test('every booking has a neutral detail address', () => {
  assert.equal(bookingDetailPath('b-12'), '/bookings/detail/b-12');
  assert.equal(bookingIdFromDetailPath('/bookings/detail/b-12'), 'b-12');
  assert.equal(bookingIdFromDetailPath('/bookings/request/b-12'), null);
  assert.equal(bookingIdFromDetailPath('/bookings/detail/'), null);
});

test('the app renders Bookings at a location and passes an optional status view down', () => {
  const app = source('../src/App.tsx');

  assert.match(app, /bookingViewFromPath/);
  assert.match(app, /<Bookings[\s\S]*data=\{visibleData\}[\s\S]*view=\{/);
  assert.doesNotMatch(app, /bookingViewFromPath\(path\) \?\? 'confirmed'/);
  assert.match(app, /path === '\/' \|\| path === '\/bookings'/);
});

test('the week schedule is the default Bookings view and the rail belongs to status views', () => {
  const bookings = source('../src/pages/Bookings.tsx');

  assert.match(bookings, /if \(!view\)/);
  assert.match(bookings, /<PageHeading[\s\S]*title="Bookings"/);
  assert.match(
    bookings,
    /<BookingsWeek\s+data=\{data\}\s+calendarBookings=\{calendarBookings\}/,
  );
  assert.match(
    bookings,
    /<Button\s+href=\{href\(bookingsViewPath\('confirmed'\)\)\}\s+variant="secondary"[\s\S]*?View by status/,
  );
  assert.ok(
    bookings.indexOf('if (!view)') < bookings.indexOf('layout-rail-content'),
  );
  assert.match(bookings, /navigate\(bookingsViewPath\(item\.id\)\)/);
  assert.doesNotMatch(bookings, /useState<BookingView>/);
});

test('the schedule action line contains only non-zero shift actions', () => {
  assert.deepEqual(bookingActionItems(0, 0), []);
  assert.deepEqual(bookingActionItems(1, 0), [
    {
      label: '1 request waiting to be accepted',
      path: '/bookings/requested',
    },
  ]);
  assert.deepEqual(bookingActionItems(0, 2), [
    {
      label: '2 bookings to approve',
      path: '/bookings/approve',
    },
  ]);

  const bookings = source('../src/pages/Bookings.tsx');
  assert.match(bookings, /bookingActionItems\(/);
  assert.match(bookings, /shiftActions\.length > 0/);
  /* Waiting work is the heading's secondary line — the middot-separated line a
     grouping row uses under a location name — not a block of its own. A card
     read as a destination and a bare block, hairline or not, belonged to
     nothing on either side of it. */
  const actionLine = bookings.slice(
    bookings.indexOf('<PageHeading'),
    bookings.indexOf('<BookingsWeek'),
  );
  assert.match(actionLine, /description=\{[\s\S]*?shiftActions\.map/);
  assert.match(actionLine, /\{index > 0 && <span aria-hidden="true">·<\/span>\}/);
  assert.match(actionLine, /className="ui-link rounded"/);
  assert.match(actionLine, /questionId="bookings-actions"/);
  assert.doesNotMatch(
    actionLine,
    /<Card|ui-card|ui-inset-card|border-b|<h2|font-bold/,
  );
  assert.doesNotMatch(bookings, /unreadMessages/);
  assert.doesNotMatch(bookings, /NotificationStrip|WorkersPanel/);
});

test('a zero approval count cannot expose completed bookings in the approval view', () => {
  const bookings = source('../src/pages/Bookings.tsx');

  assert.match(
    bookings,
    /if \(data\.bookingsToApprove === 0\) return \[\];[\s\S]*?slice\(-data\.bookingsToApprove\)/,
  );
});

test('requests and approvals notifications still open their own status', () => {
  const page = source('../src/pages/Notifications.tsx');

  assert.match(page, /bookingsViewPath\('requested'\)/);
  assert.match(page, /bookingsViewPath\('approve'\)/);
});
