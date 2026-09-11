import assert from 'node:assert/strict';
import test from 'node:test';
import {
  badgeDisplay,
  bookingsAccessibleName,
  messagesAccessibleName,
  notificationsAccessibleName,
  accountAccessibleName,
} from '../src/components/header-utils.ts';

test('badge display is hidden at zero and capped at 99+', () => {
  assert.equal(badgeDisplay(0), null);
  assert.equal(badgeDisplay(1), '1');
  assert.equal(badgeDisplay(12), '12');
  assert.equal(badgeDisplay(100), '99+');
});

test('Bookings accessible name includes attention count', () => {
  assert.equal(bookingsAccessibleName(0), 'Bookings');
  assert.equal(bookingsAccessibleName(2), 'Bookings, 2 need attention');
});

test('Messages accessible name includes unread count', () => {
  assert.equal(messagesAccessibleName(0), 'Messages');
  assert.equal(messagesAccessibleName(1), 'Messages, 1 unread');
});

test('Notifications accessible name describes attention count and its cap', () => {
  assert.equal(notificationsAccessibleName(0), 'Notifications');
  assert.equal(
    notificationsAccessibleName(2),
    'Notifications, 2 need attention',
  );
  assert.equal(
    notificationsAccessibleName(100),
    'Notifications, 99 or more need attention',
  );
});

test('Account accessible name starts with the visible signed-in name', () => {
  assert.equal(accountAccessibleName('Helen Dawson'), 'Helen Dawson, account menu');
});
