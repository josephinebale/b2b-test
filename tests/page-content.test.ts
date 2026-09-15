import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  bookingParticipantSummary,
  findGrouping,
  getLocationData,
  groupingDashboardChildren,
} from '../src/data/locations.ts';
import {
  EMPTY_STATES,
  NOTIFICATION_EMPTY_DESCRIPTIONS,
  WORKERS_ROUTE,
  attentionCardSendLine,
  attentionCardStatusTone,
  attentionCardTimeRange,
  bookingWeekCardTone,
  dashboardWorkerEvidenceLine,
  dashboardWorkerExceptionLines,
  dashboardWorkerLastWorkedLabel,
  dashboardWorkerPrimaryLocation,
  dashboardWorkerShiftSplitLine,
  childCountLine,
  namedLocationList,
  moreShiftsWaitingLabel,
  dashboardAsidePendingLinks,
  dashboardHouseRowPendingLinks,
  dashboardAsideWaitingCount,
  groupingChildListPageHeading,
  groupingPlaceBasedLabel,
  groupingOverviewHeading,
  groupingWorkersHeading,
  sortDashboardAsideLocations,
  type DashboardAsideLocationSortMetrics,
  shiftDateTime,
  shiftSendDetail,
  shiftStateTag,
  shiftWaitingLine,
} from '../src/lib/pageContent.ts';

function avatarSize(path: string): string {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const match = source.match(/<Avatar\b[^>]*\bsize="(sm|md|lg)"/);
  assert.ok(match, `${path} must render an Avatar with an explicit size`);
  return match[1];
}

test('grouping page headings carry the node name in sentence case', () => {
  const illawarra = findGrouping('illawarra');
  const northernSydney = findGrouping('northern-sydney');
  const careforceArea = findGrouping('careforce-area');
  const hunter = findGrouping('hunter');
  assert.ok(illawarra && northernSydney && careforceArea && hunter);

  assert.equal(groupingOverviewHeading(illawarra.name), 'Illawarra overview');
  assert.equal(
    groupingOverviewHeading(northernSydney.name),
    'Northern Sydney overview',
  );
  assert.equal(
    groupingOverviewHeading(careforceArea.name),
    'Careforce area overview',
  );
  assert.equal(groupingOverviewHeading(hunter.name), 'Hunter overview');

  assert.equal(groupingWorkersHeading(illawarra.name), 'Illawarra workers');
  assert.equal(
    groupingWorkersHeading(northernSydney.name),
    'Northern Sydney workers',
  );
  assert.equal(
    groupingWorkersHeading(careforceArea.name),
    'Careforce area workers',
  );
  assert.equal(groupingWorkersHeading(hunter.name), 'Hunter workers');

  assert.equal(
    groupingChildListPageHeading('Northern Lifestyles', 'Centres'),
    'Northern Lifestyles centres',
  );
  assert.equal(
    groupingChildListPageHeading('Careforce Northern caseload', 'Houses'),
    'Careforce Northern caseload houses',
  );
});

test('the place-based label follows direct location service types', () => {
  const northernSydney = findGrouping('northern-sydney');
  const northernLifestyles = findGrouping('northern-lifestyles');
  const careforceNorthern = findGrouping('careforce-northern-caseload');
  assert.ok(northernSydney && northernLifestyles && careforceNorthern);

  const { housesAndCentres: sydneyPlaces } =
    groupingDashboardChildren(northernSydney);
  const { housesAndCentres: lifestylesPlaces } =
    groupingDashboardChildren(northernLifestyles);
  const { housesAndCentres: caseloadPlaces } =
    groupingDashboardChildren(careforceNorthern);

  assert.equal(groupingPlaceBasedLabel(sydneyPlaces), 'Houses and centres');
  assert.equal(groupingPlaceBasedLabel(lifestylesPlaces), 'Centres');
  assert.equal(groupingPlaceBasedLabel(caseloadPlaces), 'Houses');
});

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

  assert.match(emptyDay, /emptyDayLabel/);
  assert.match(source, /emptyDayLabel="No bookings"/);
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
  assert.deepEqual(EMPTY_STATES.dashboardAttentionBookings, {
    title: 'No unfilled shifts this week.',
    description: 'Shifts still waiting for a worker, or where a worker cancelled, will appear here.',
  });
  assert.deepEqual(EMPTY_STATES.dashboardWorkers, {
    title: 'No workers have shifts in the last eight weeks.',
    description: 'Workers with completed shifts in the last eight weeks will appear here.',
  });
  assert.deepEqual(EMPTY_STATES.dashboardChildren, {
    title: 'This grouping has no houses or groupings.',
    description: 'This grouping has no houses or groupings.',
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

test('the shift link is the date and time, and waiting copy is plain by default', () => {
  const now = new Date('2026-09-15T10:00:00');

  assert.equal(
    shiftDateTime({
      start: new Date('2026-09-15T07:00:00'),
      end: new Date('2026-09-15T16:00:00'),
    }),
    'Tuesday 7am to 4pm',
  );
  assert.equal(
    shiftSendDetail({
      status: 'requested',
      requestedWorkerNames: ['A', 'B', 'C', 'D', 'E'],
      declinedWorkerNames: [],
    }),
    'sent to 5 workers, none accepted',
  );
  assert.equal(
    shiftSendDetail({
      status: 'requested',
      requestedWorkerNames: ['A', 'B', 'C', 'D', 'E'],
      declinedWorkerNames: ['A', 'B'],
    }),
    'sent to 5 workers, 2 declined',
  );
  assert.equal(
    shiftSendDetail({
      status: 'cancelled',
      cancelledBy: 'Beth C',
    }),
    null,
  );
  assert.equal(
    shiftWaitingLine(
      {
        status: 'requested',
        start: new Date('2026-09-18T09:00:00'),
        requestedWorkerNames: ['A', 'B', 'C', 'D', 'E'],
        declinedWorkerNames: [],
      },
      now,
    ),
    'starts in 3 days, sent to 5 workers, none accepted',
  );
  assert.equal(moreShiftsWaitingLabel(2), '2 more shifts waiting');
  assert.equal(moreShiftsWaitingLabel(1), '1 more shift waiting');
});

test('the shift Tag appears only inside 24 hours or on a cancellation', () => {
  const now = new Date('2026-09-15T10:00:00');

  assert.equal(
    shiftStateTag(
      { status: 'requested', start: new Date('2026-09-18T09:00:00') },
      now,
    ),
    null,
  );
  assert.deepEqual(
    shiftStateTag(
      { status: 'requested', start: new Date('2026-09-15T11:00:00') },
      now,
    ),
    { tone: 'pending', label: 'Starts in 1 hour' },
  );
  assert.deepEqual(
    shiftStateTag(
      { status: 'requested', start: new Date('2026-09-15T08:00:00') },
      now,
    ),
    { tone: 'pending', label: 'Started 2 hours ago' },
  );
  assert.deepEqual(
    shiftStateTag(
      { status: 'cancelled', start: new Date('2026-09-19T07:00:00') },
      now,
    ),
    { tone: 'attention', label: 'Worker cancelled' },
  );
});

test('the attention calendar omits participant lines that the location week still uses', () => {
  const attention = readFileSync(
    new URL('../src/pages/dashboard/BookingsNeedingAttention.tsx', import.meta.url),
    'utf8',
  );
  const deeWhy = getLocationData('dee-why-1');
  const allambie = getLocationData('allambie-heights-day-program');
  const silBooking = deeWhy.bookings.find((item) => item.status === 'requested');
  const centreBooking = allambie.bookings.find((item) => item.status === 'requested');

  assert.ok(silBooking);
  assert.ok(centreBooking);
  assert.equal(bookingParticipantSummary(silBooking!, deeWhy.location), null);
  assert.ok(bookingParticipantSummary(centreBooking!, allambie.location));
  assert.doesNotMatch(attention, /bookingParticipantSummary/);
});

test('attention card copy names send state and maps status to tag tones', () => {
  assert.equal(
    attentionCardSendLine({
      status: 'requested',
      requestedWorkerNames: ['A', 'B'],
      declinedWorkerNames: [],
    }),
    'Not yet accepted',
  );
  assert.equal(
    attentionCardSendLine({
      status: 'requested',
      requestedWorkerNames: ['A', 'B', 'C', 'D', 'E'],
      declinedWorkerNames: ['A', 'B'],
    }),
    '2 of 5 declined',
  );
  assert.equal(
    attentionCardSendLine({ status: 'cancelled', cancelledBy: 'Beth C' }),
    'Beth C cancelled',
  );
  assert.equal(bookingWeekCardTone({ status: 'requested' }), 'pending');
  assert.equal(bookingWeekCardTone({ status: 'cancelled' }), 'attention');
  assert.equal(
    attentionCardStatusTone({ status: 'requested' }),
    'attention-grid-pending',
  );
  assert.equal(
    attentionCardStatusTone({ status: 'cancelled' }),
    'attention-grid-attention',
  );
  assert.equal(
    dashboardWorkerPrimaryLocation(
      {
        locations: [
          { locationId: 'dee-why-1', bookingCount: 5 },
          { locationId: 'hornsby', bookingCount: 8 },
        ],
      },
      ['dee-why-1', 'hornsby'],
    ),
    'hornsby',
  );
  assert.equal(
    dashboardWorkerPrimaryLocation(
      {
        locations: [
          { locationId: 'dee-why-1', bookingCount: 5 },
          { locationId: 'hornsby', bookingCount: 5 },
        ],
      },
      ['dee-why-1', 'hornsby'],
    ),
    'dee-why-1',
  );
  assert.equal(
    dashboardWorkerEvidenceLine(
      {
        lastWorkedAt: new Date('2026-09-14T07:00:00'),
        lastWorkedLocationId: 'dee-why-1',
      },
      new Date('2026-09-15T12:00:00'),
    ),
    'Last worked yesterday at Dee Why 1',
  );
  assert.equal(
    dashboardWorkerEvidenceLine(
      {
        lastWorkedAt: new Date('2026-09-15T07:00:00'),
        lastWorkedLocationId: 'forestville-home',
      },
      new Date('2026-09-15T12:00:00'),
    ),
    'Last worked today for Maya Nguyen',
  );
  assert.deepEqual(
    dashboardWorkerExceptionLines({
      assessments: { medication: true, driving: false },
    }),
    ['Driving assessment not current'],
  );
  assert.deepEqual(
    dashboardWorkerExceptionLines({
      assessments: { medication: true, driving: true },
    }),
    [],
  );
  const dashboardNow = new Date('2026-09-15T12:00:00');
  assert.equal(
    dashboardWorkerLastWorkedLabel(
      new Date('2026-09-15T07:00:00'),
      dashboardNow,
    ),
    'Last worked today',
  );
  assert.equal(
    dashboardWorkerLastWorkedLabel(
      new Date('2026-09-14T07:00:00'),
      dashboardNow,
    ),
    'Last worked yesterday',
  );
  assert.equal(
    dashboardWorkerLastWorkedLabel(
      new Date('2026-09-12T07:00:00'),
      dashboardNow,
    ),
    'Last worked 3 days ago',
  );
  assert.equal(
    dashboardWorkerLastWorkedLabel(
      new Date('2026-09-01T07:00:00'),
      dashboardNow,
    ),
    'Last worked 2 weeks ago',
  );
  assert.equal(
    dashboardWorkerLastWorkedLabel(
      new Date('2026-07-28T07:00:00'),
      dashboardNow,
    ),
    'Last worked 7 weeks ago',
  );
  assert.match(
    attentionCardTimeRange({
      start: new Date('2026-09-15T07:00:00'),
      end: new Date('2026-09-15T15:00:00'),
    }),
    /7am to 3pm/,
  );
});

test('the Dashboard aside waiting count sums every outstanding item', () => {
  assert.equal(
    dashboardAsideWaitingCount({
      cancelled: 1,
      awaiting: 3,
      approvals: 2,
      messages: 1,
    }),
    7,
  );
});

test('the Dashboard aside sort puts blank houses last and orders the rest', () => {
  const locations = [
    { id: 'galston-1', name: 'Galston 1' },
    { id: 'dee-why-1', name: 'Dee Why 1' },
    { id: 'hornsby', name: 'Hornsby' },
  ];
  const metrics = new Map<string, DashboardAsideLocationSortMetrics>([
    ['galston-1', { waitingCount: 0, soonestAwaitingStart: null }],
    ['dee-why-1', { waitingCount: 11, soonestAwaitingStart: new Date('2026-09-16T07:00:00') }],
    ['hornsby', { waitingCount: 8, soonestAwaitingStart: new Date('2026-09-15T07:00:00') }],
  ]);

  assert.deepEqual(
    sortDashboardAsideLocations(locations, 'most-waiting', metrics).map(
      (location) => location.id,
    ),
    ['dee-why-1', 'hornsby', 'galston-1'],
  );
  assert.deepEqual(
    sortDashboardAsideLocations(locations, 'soonest-shift', metrics).map(
      (location) => location.id,
    ),
    ['hornsby', 'dee-why-1', 'galston-1'],
  );
  assert.deepEqual(
    sortDashboardAsideLocations(locations, 'house-name', metrics).map(
      (location) => location.id,
    ),
    ['dee-why-1', 'galston-1', 'hornsby'],
  );
});

test('Overview house rows carry approvals and messages only', () => {
  assert.deepEqual(
    dashboardHouseRowPendingLinks({
      approvals: 2,
      messages: 1,
    }),
    [
      { count: 2, label: 'bookings to approve', path: '/bookings/approve' },
      { count: 1, label: 'unread message', path: '/messages' },
    ],
  );
  assert.deepEqual(
    dashboardHouseRowPendingLinks({
      approvals: 0,
      messages: 0,
    }),
    [],
  );
});

test('the Dashboard aside stacks cancelled, awaiting, approvals and messages in order', () => {
  assert.deepEqual(
    dashboardAsidePendingLinks({
      cancelled: 1,
      awaiting: 3,
      approvals: 2,
      messages: 1,
    }),
    [
      { count: 1, label: 'cancelled shift', path: '/bookings/requested' },
      { count: 3, label: 'shifts awaiting workers', path: '/bookings/requested' },
      { count: 2, label: 'bookings to approve', path: '/bookings/approve' },
      { count: 1, label: 'unread message', path: '/messages' },
    ],
  );
  assert.deepEqual(
    dashboardAsidePendingLinks({
      cancelled: 0,
      awaiting: 0,
      approvals: 0,
      messages: 0,
    }),
    [],
  );
  assert.deepEqual(
    dashboardAsidePendingLinks({
      cancelled: 0,
      awaiting: 1,
      approvals: 0,
      messages: 0,
    }),
    [{ count: 1, label: 'shift awaiting a worker', path: '/bookings/requested' }],
  );
  assert.deepEqual(
    dashboardAsidePendingLinks({
      cancelled: 2,
      awaiting: 0,
      approvals: 0,
      messages: 0,
    }),
    [{ count: 2, label: 'cancelled shifts', path: '/bookings/requested' }],
  );
});

test('named location lists show up to four houses, then how many more', () => {
  assert.equal(namedLocationList(['Hornsby', 'Wahroonga']), 'Hornsby, Wahroonga');
  assert.equal(
    namedLocationList(['A', 'B', 'C', 'D', 'E', 'F']),
    'A, B, C, D and 2 more',
  );
});
