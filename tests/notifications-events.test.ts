import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  descendantLocationIds,
  findGrouping,
  getLocationData,
  type LocationData,
} from '../src/data/locations.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

type NotificationLocationData = LocationData & {
  bookings: Array<
    LocationData['bookings'][number] & {
      cancelledBy?: string;
      cancelledAt?: Date;
    }
  >;
  workers: Array<
    LocationData['workers'][number] & {
      supportPlanReviewDueAt?: Date | null;
      assessments: LocationData['workers'][number]['assessments'] & {
        medicationExpiresAt?: Date;
        drivingExpiresAt?: Date;
      };
    }
  >;
  invoices?: Array<{
    id: string;
    locationId: string;
    submittedAt: Date;
    approvalState: string;
  }>;
};

function coordinatorData(): NotificationLocationData[] {
  const grouping = findGrouping('careforce-caseload');
  assert.ok(grouping);
  return descendantLocationIds(grouping).map(
    (locationId) => getLocationData(locationId) as NotificationLocationData,
  );
}

test('notification data models cancellations, assessment expiry, plan review and invoices', () => {
  const locations = source('../src/data/locations.ts');

  assert.match(
    locations,
    /export type BookingStatus = 'confirmed' \| 'requested' \| 'ended' \| 'cancelled'/,
  );
  assert.match(locations, /cancelledBy\?: string;/);
  assert.match(locations, /cancelledAt\?: Date;/);
  assert.match(locations, /medicationExpiresAt: Date;/);
  assert.match(locations, /drivingExpiresAt: Date;/);
  assert.match(locations, /supportPlanReviewDueAt: Date \| null;/);
  assert.match(locations, /export type InvoiceApprovalState = 'ready-for-approval' \| 'approved';/);
  assert.match(locations, /invoices: Invoice\[\];/);
});

test('every new notification type is seeded inside the coordinator caseload', () => {
  const data = coordinatorData();
  const today = new Date();

  const cancellations = data.flatMap(({ bookings }) =>
    bookings.filter((booking) => booking.status === ('cancelled' as typeof booking.status)),
  );
  assert.ok(cancellations.some((booking) => booking.cancelledBy));
  assert.ok(cancellations.some((booking) => booking.cancelledAt instanceof Date));

  const workers = data.flatMap(({ workers }) => workers);
  assert.ok(
    workers.some(
      ({ assessments }) =>
        assessments.medicationExpiresAt instanceof Date &&
        assessments.medicationExpiresAt < today,
    ),
  );
  assert.ok(
    workers.some(
      ({ assessments }) =>
        assessments.drivingExpiresAt instanceof Date &&
        assessments.drivingExpiresAt < today,
    ),
  );
  assert.ok(
    workers.some(
      ({ supportPlanReviewDueAt }) =>
        supportPlanReviewDueAt instanceof Date &&
        supportPlanReviewDueAt < today,
    ),
  );
  assert.ok(
    data
      .flatMap(({ invoices = [] }) => invoices)
      .some(({ approvalState }) => approvalState === 'ready-for-approval'),
  );
});

test('Notifications renders the four new event types without financial amounts or training records', () => {
  const notifications = source('../src/pages/Notifications.tsx');

  assert.match(notifications, /cancelled a booking/);
  assert.match(notifications, /assessment has lapsed/);
  assert.match(notifications, /support plan needs review/);
  assert.match(notifications, /Invoice ready to approve/);
  assert.match(notifications, /bookingDetailPath\(booking\.id\)/);
  assert.match(notifications, /workerProfilePath\(worker\.id\)/);
  assert.match(notifications, /path: '\/invoices'/);
  assert.doesNotMatch(notifications, /\$\d|funding balance|provider-side training/i);
});

test('Notifications groups immediate work before checks, approvals and messages', () => {
  const notifications = source('../src/pages/Notifications.tsx');

  const urgent = notifications.indexOf("title: 'Needs attention now'");
  const review = notifications.indexOf("title: 'Checks and approvals'");
  const messages = notifications.indexOf("title: 'Messages'");
  assert.ok(urgent >= 0 && review > urgent && messages > review);
  assert.match(notifications, /priority: 0[\s\S]*?cancelled a booking/);
  assert.match(notifications, /showLocation && \(\s*<p[^>]*text-xs text-text-tertiary/);
});

test('the notification badge counts immediate work and retains the existing cap', () => {
  const notifications = source('../src/pages/Notifications.tsx');

  assert.match(
    notifications,
    /locationData\.requestsToAccept \+\s*cancelledBookings\.length/,
  );
  assert.doesNotMatch(
    notifications,
    /locationData\.unreadMessages \+\s*locationData\.requestsToAccept/,
  );
  assert.match(source('../src/components/header-utils.ts'), /count > 99 \? '99\+' : String\(count\)/);
});
