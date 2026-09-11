import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  EMPTY_STATES,
  NOTIFICATION_EMPTY_DESCRIPTIONS,
  WORKERS_ROUTE,
  childCountLine,
} from '../src/lib/pageContent.ts';

function avatarSize(path: string): string {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const match = source.match(/<Avatar\b[^>]*\bsize="(sm|md|lg)"/);
  assert.ok(match, `${path} must render an Avatar with an explicit size`);
  return match[1];
}

test('the child-count line names each kind that is present, never a category', () => {
  assert.equal(
    childCountLine({ houses: 5, centres: 2, clients: 1 }),
    '5 houses, 2 centres and 1 client',
  );
  assert.equal(
    childCountLine({ houses: 11, centres: 1, clients: 0 }),
    '11 houses and 1 centre',
  );
  assert.equal(
    childCountLine({ houses: 0, centres: 3, clients: 3 }),
    '3 centres and 3 clients',
  );
  assert.equal(
    childCountLine({ houses: 5, centres: 0, clients: 1 }),
    '5 houses and 1 client',
  );
  assert.equal(childCountLine({ houses: 1, centres: 0, clients: 0 }), '1 house');
  assert.equal(childCountLine({ houses: 0, centres: 0, clients: 4 }), '4 clients');
  assert.doesNotMatch(
    childCountLine({ houses: 6, centres: 1, clients: 0 }),
    /houses and centres| · /,
  );
});

test('Workers uses one public route', () => {
  assert.equal(WORKERS_ROUTE, '/workers');
});

test('grouping dashboard worker avatars match the location Workers list size', () => {
  assert.equal(
    avatarSize('../src/pages/dashboard/WorkersPanel.tsx'),
    avatarSize('../src/pages/Workers.tsx'),
  );
  assert.equal(avatarSize('../src/pages/Workers.tsx'), 'md');
});

test('dashboard bookings collapse busy days and can reveal the rest', () => {
  const source = readFileSync(
    new URL('../src/pages/dashboard/BookingsWeek.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /const COLLAPSED_BOOKINGS_PER_DAY = 4;/);
  assert.match(source, /dayBookings\.slice\(0, COLLAPSED_BOOKINGS_PER_DAY\)/);
  assert.match(source, /aria-expanded=\{expanded\}/);
  assert.match(source, /Show less/);
  assert.match(source, /more \$\{plural\(hiddenBookingCount, 'booking', 'bookings'\)\}/);
});

/* An empty day reads as detached when its label floats below its neighbours.
   It carries the card's own box — 1px border plus the compact inset — so the
   label lands on the same line as a card's first line of text, not above it. */
test('an empty day in the week grid lines up with a card’s first line of text', () => {
  const source = readFileSync(
    new URL('../src/pages/dashboard/BookingsWeek.tsx', import.meta.url),
    'utf8',
  );
  const emptyDay = source.slice(
    source.indexOf('dayBookings.length === 0'),
    source.indexOf('visibleDayBookings.map'),
  );

  assert.match(emptyDay, /No bookings/);
  assert.match(emptyDay, /ui-inset-compact/);
  assert.match(emptyDay, /border border-transparent/);
  assert.match(emptyDay, /text-xs/);
  assert.doesNotMatch(emptyDay, /py-4|items-center|justify-center|self-center/);
});

test('notification empty copy uses one contraction and one notification verb', () => {
  assert.deepEqual(NOTIFICATION_EMPTY_DESCRIPTIONS, {
    requests: "We'll let you know when a booking request needs your attention.",
    approvals: "We'll let you know when a booking needs your approval.",
    messages: "We'll let you know when you have a new message.",
  });
});

test('every empty state explains what is absent and what makes it appear', () => {
  assert.deepEqual(EMPTY_STATES.bookingsWeek, {
    title: 'No bookings this week',
    description: 'Bookings scheduled for this week will appear here.',
  });
  assert.deepEqual(EMPTY_STATES.workers, {
    title: 'No workers to show',
    description: 'Workers will appear after they have booking history with this provider.',
  });
  assert.deepEqual(EMPTY_STATES.notifications, {
    title: 'No notifications',
    description: 'New notifications will appear here.',
  });
  assert.deepEqual(EMPTY_STATES.conversations, {
    title: 'No conversations found',
    description: 'Try a different name or message.',
  });
  assert.deepEqual(EMPTY_STATES.bookingsFiltered, {
    title: 'No bookings to show',
    description: 'Bookings will appear when they match this status and your filters.',
  });
  assert.deepEqual(EMPTY_STATES.dashboardWorkers, {
    title: 'No workers yet',
    description: 'Workers will appear after they’re booked for this location.',
  });
  assert.deepEqual(EMPTY_STATES.archivedConversations, {
    title: 'No archived conversations',
    description: 'Archived conversations will appear here.',
  });
  assert.deepEqual(EMPTY_STATES.conversationSelection, {
    title: 'No conversation selected',
    description: 'Select a conversation to display it here.',
  });
});
