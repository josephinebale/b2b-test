import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  BOOKINGS_ROUTE,
  BOOKING_VIEW_IDS,
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

test('the app renders Bookings for a status path and passes the view down', () => {
  const app = source('../src/App.tsx');

  assert.match(app, /bookingViewFromPath/);
  assert.match(app, /<Bookings[\s\S]*data=\{visibleData\}[\s\S]*view=\{/);
});

test('the rail writes the status into the address so it can be linked to', () => {
  const bookings = source('../src/pages/Bookings.tsx');

  assert.match(bookings, /navigate\(bookingsViewPath\(item\.id\)\)/);
  assert.doesNotMatch(bookings, /useState<BookingView>/);
});

test('requests and approvals notifications open their own status', () => {
  const strip = source('../src/pages/dashboard/NotificationStrip.tsx');
  const page = source('../src/pages/Notifications.tsx');

  assert.match(strip, /bookingsViewPath\('requested'\)/);
  assert.match(strip, /bookingsViewPath\('approve'\)/);
  assert.match(page, /bookingsViewPath\('requested'\)/);
  assert.match(page, /bookingsViewPath\('approve'\)/);
  assert.doesNotMatch(strip, /path: requestsToAccept > 0 \? '\/bookings'/);
});
