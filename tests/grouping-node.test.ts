import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  addDays,
  isSameDay,
  startOfDay,
  startOfWeek,
} from '../src/lib/date.ts';
import { pendingWorkParts } from '../src/lib/pageContent.ts';
import {
  GROUPING,
  GROUPINGS,
  LOCATIONS,
  childGroupingSectionTitle,
  groupingContentsSummary,
  groupingDashboardDescription,
  groupingClientsCountLine,
  groupingDirectChildrenCountLine,
  groupingHousesAndCentresCountLine,
  compareRequestUrgency,
  descendantLocationIds,
  findGrouping,
  getLocationData,
  groupingDashboardChildren,
  comparePressingBookings,
  groupingOpenRequests,
  groupingUsageLast7Days,
  locationHasWaitingWork,
  partitionGroupingLocations,
  pendingCountsForGrouping,
  pendingCountsForLocation,
  compareWaitingLocationRows,
  groupingAttentionBookings,
  groupingDashboardWorkers,
  mostPressingWaitingBooking,
  waitingDashboardChildren,
  waitingShiftsForLocation,
} from '../src/data/locations.ts';
import {
  attentionCardSendLine,
  shiftSendDetail,
  shiftDateTime,
} from '../src/lib/pageContent.ts';
import { groupingChildListTabLabel } from '../src/data/locations.ts';
import { nodeLandingPath } from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('the Northern Sydney grouping keeps its SIL houses and the day program', () => {
  assert.equal(GROUPING.id, 'northern-sydney');
  assert.equal(GROUPING.name, 'Northern Sydney');
  assert.equal(GROUPING.locationIds.length, 8);
  assert.equal(
    GROUPING.locationIds.filter(
      (id) => LOCATIONS.find((location) => location.id === id)?.serviceType === 'sil',
    ).length,
    7,
  );
  assert.ok(GROUPING.locationIds.includes('allambie-heights-day-program'));
  assert.ok(GROUPING.locationIds.every((id) => LOCATIONS.some((location) => location.id === id)));
});

test('a grouping dashboard lists direct children, with groupings before split locations', () => {
  for (const grouping of GROUPINGS) {
    const { groupings, housesAndCentres, clients } =
      groupingDashboardChildren(grouping);
    const expectedHouses = grouping.locationIds.filter(
      (id) => LOCATIONS.find((location) => location.id === id)?.serviceType !== 'home-community',
    );
    const expectedClients = grouping.locationIds.filter(
      (id) => LOCATIONS.find((location) => location.id === id)?.serviceType === 'home-community',
    );

    assert.deepEqual(
      groupings.map((child) => child.id),
      grouping.groupingIds ?? [],
    );
    assert.deepEqual(
      housesAndCentres.map((location) => location.id),
      expectedHouses,
    );
    assert.deepEqual(
      clients.map((location) => location.id),
      expectedClients,
    );
    assert.ok(housesAndCentres.every((location) => location.serviceType !== 'home-community'));
    assert.ok(clients.every((location) => location.serviceType === 'home-community'));
  }

  const careforceArea = groupingDashboardChildren(
    findGrouping('careforce-area')!,
  );
  assert.equal(careforceArea.groupings.length, 9);
  assert.equal(careforceArea.housesAndCentres.length, 0);
  assert.equal(careforceArea.clients.length, 0);

  const greaterSydney = groupingDashboardChildren(
    findGrouping('lwb-greater-sydney')!,
  );
  assert.equal(greaterSydney.groupings.length, 2);
  assert.equal(greaterSydney.housesAndCentres.length, 0);
  assert.equal(greaterSydney.clients.length, 0);

  assert.equal(partitionGroupingLocations(findGrouping('northern-sydney')!).clients.length, 0);
  assert.ok(partitionGroupingLocations(findGrouping('careforce-caseload')!).clients.length >= 1);
  assert.equal(
    partitionGroupingLocations(findGrouping('lwb-northern-sydney')!)
      .housesAndCentres.length,
    0,
  );
});

test('child grouping rows roll up counts but retain their own kind', () => {
  const careforceArea = findGrouping('careforce-area')!;
  const careforceChildren = groupingDashboardChildren(careforceArea).groupings;
  assert.equal(careforceChildren.length, 9);
  assert.ok(careforceChildren.every((child) => child.name.startsWith('Careforce')));
  assert.equal(childGroupingSectionTitle(careforceChildren), 'Caseloads');

  const greaterSydney = findGrouping('lwb-greater-sydney')!;
  const regionChildren = groupingDashboardChildren(greaterSydney).groupings;
  assert.deepEqual(
    regionChildren.map((child) => child.name),
    ['Northern Sydney', 'Western Sydney'],
  );
  assert.equal(childGroupingSectionTitle(regionChildren), 'Regions');

  for (const child of [...careforceChildren, ...regionChildren]) {
    const expected = descendantLocationIds(child)
      .map(pendingCountsForLocation)
      .reduce(
        (total, counts) => ({
          requests: total.requests + counts.requests,
          approvals: total.approvals + counts.approvals,
          messages: total.messages + counts.messages,
        }),
        { requests: 0, approvals: 0, messages: 0 },
      );
    assert.deepEqual(pendingCountsForGrouping(child), expected);
  }

  assert.equal(
    groupingDashboardDescription(careforceArea),
    'The caseloads in Careforce area',
  );
  assert.equal(
    groupingDashboardDescription(greaterSydney),
    'The regions in Greater Sydney',
  );
  assert.equal(
    groupingDashboardDescription(findGrouping('northern-sydney')!),
    'The houses and centres in Northern Sydney',
  );
  assert.equal(
    groupingDashboardDescription(findGrouping('lwb-northern-sydney')!),
    'The clients in Northern Sydney',
  );
  assert.equal(
    groupingDashboardDescription(findGrouping('northern-lifestyles')!),
    'The centres and clients in Northern Lifestyles',
  );
  assert.equal(
    groupingDirectChildrenCountLine(findGrouping('hunter')!),
    '5 houses in Hunter',
  );
  assert.equal(
    groupingDirectChildrenCountLine(findGrouping('northern-sydney')!),
    '7 houses and 1 centre in Northern Sydney',
  );
  assert.equal(
    groupingHousesAndCentresCountLine(findGrouping('northern-sydney')!),
    '7 houses and 1 centre in Northern Sydney',
  );
  assert.equal(groupingClientsCountLine(findGrouping('northern-sydney')!), '');
  assert.equal(
    groupingHousesAndCentresCountLine(
      findGrouping('careforce-northern-caseload')!,
    ),
    '7 houses in Careforce Northern caseload',
  );
  assert.equal(
    groupingClientsCountLine(findGrouping('careforce-northern-caseload')!),
    '1 client in Careforce Northern caseload',
  );
  assert.equal(
    groupingHousesAndCentresCountLine(findGrouping('northern-lifestyles')!),
    '7 centres in Northern Lifestyles',
  );
  assert.equal(
    groupingClientsCountLine(findGrouping('northern-lifestyles')!),
    '2 clients in Northern Lifestyles',
  );
  assert.equal(
    groupingContentsSummary(findGrouping('cpa-sil')!),
    '91 houses and 1 centre',
  );
  assert.equal(
    groupingContentsSummary(findGrouping('cpa-lifestyles')!),
    '12 centres and 3 clients',
  );
  assert.match(groupingContentsSummary(findGrouping('cpa-careforce')!), /^\d+ houses and 2 clients$/);
  assert.equal(
    groupingContentsSummary(findGrouping('northern-sydney')!),
    '7 houses and 1 centre',
  );
  assert.equal(
    groupingContentsSummary(findGrouping('careforce-caseload')!),
    '7 houses and 1 client',
  );
  assert.equal(
    groupingContentsSummary(findGrouping('lwb-northern-sydney')!),
    '4 clients',
  );
  assert.equal(
    groupingContentsSummary(findGrouping('northcott-sil-services')!),
    '2 houses',
  );
  assert.equal(
    groupingContentsSummary(findGrouping('northern-lifestyles')!),
    '7 centres and 2 clients',
  );

  const locations = source('../src/data/locations.ts');
  const summary = locations.slice(
    locations.indexOf('export function groupingContentsSummary'),
    locations.indexOf('function housesAndCentresChildCount'),
  );
  assert.match(summary, /childCountLine\(\{/);
  assert.doesNotMatch(summary, /join\(' · '\)|houses and centres/);
});

test('grouping location rows expose waiting counts without aggregating records', () => {
  const counts = LOCATIONS.map((location) => pendingCountsForLocation(location.id));

  for (const location of LOCATIONS) {
    const data = getLocationData(location.id);
    assert.deepEqual(pendingCountsForLocation(location.id), {
      requests: data.requestsToAccept,
      approvals: data.bookingsToApprove,
      messages: data.unreadMessages,
    });
  }

  assert.ok(
    Math.max(...counts.map((item) => item.requests)) -
      Math.min(...counts.map((item) => item.requests)) >=
      2,
    'request counts should differ enough to compare locations',
  );
  assert.ok(
    Math.max(...counts.map((item) => item.messages)) -
      Math.min(...counts.map((item) => item.messages)) >=
      3,
    'unread counts should differ enough to compare locations',
  );
  assert.ok(
    new Set(counts.map((item) => item.approvals)).size >= 3,
    'approval counts should not look the same at every location',
  );
});

test('open requests are ordered by how soon the shift starts, then how long unanswered', () => {
  const requests = groupingOpenRequests();
  assert.ok(requests.length >= 4);
  assert.ok(new Set(requests.map((item) => item.locationId)).size >= 2);

  for (let i = 1; i < requests.length; i += 1) {
    assert.ok(
      compareRequestUrgency(requests[i - 1], requests[i]) <= 0,
      'grouping requests must stay in urgency order',
    );
  }

  for (const request of requests) {
    assert.equal('workerName' in request, false);
    assert.equal('description' in request, false);
    assert.ok(request.locationName);
    assert.ok(request.start >= startOfDay(new Date()));
  }
});

test('usage is recent booking volume, counted per location', () => {
  const usage = groupingUsageLast7Days();
  assert.equal(usage.locations.length, descendantLocationIds(GROUPING).length);
  assert.equal(
    usage.total,
    usage.locations.reduce((sum, item) => sum + item.bookingCount, 0),
  );
  assert.ok(usage.total > 0);
  assert.ok(usage.locations.every((item) => item.bookingCount > 0));
  assert.ok(
    new Set(usage.locations.map((item) => item.bookingCount)).size >= 2,
    'volume should not look identical at every location',
  );
});

test('grouping content is split between Dashboard, Supportables, and Workers', () => {
  const dashboard = source('../src/pages/Dashboard.tsx');
  const supportables = source('../src/pages/Supportables.tsx');
  const groupingWorkersBranch = source('../src/pages/Workers.tsx').slice(
    source('../src/pages/Workers.tsx').indexOf('if (!data)'),
    source('../src/pages/Workers.tsx').indexOf('const client ='),
  );
  const workers = source('../src/pages/dashboard/WorkersPanel.tsx');
  const groupingRow = supportables.slice(
    supportables.indexOf('function ChildGroupingRow'),
    supportables.indexOf('export function Supportables'),
  );

  assert.match(supportables, /groupingDashboardChildren\(grouping\)/);
  assert.match(supportables, /groupings\.length > 0/);
  assert.match(supportables, /hasDirectLocations/);
  assert.match(supportables, /directLocations\.map/);
  assert.match(supportables, /pendingCountsForLocation/);
  assert.match(supportables, /pendingCountsForGrouping\(grouping\)/);
  assert.match(supportables, /groupingContentsSummary\(grouping\)/);
  assert.doesNotMatch(supportables, /groupingDashboardDescription/);
  assert.doesNotMatch(supportables, /organisationSupportablesDescription/);
  assert.match(supportables, /groupingChildListTabLabel\(grouping\)/);
  assert.doesNotMatch(supportables, /<PageHeading\s+title="Supportables"/);
  assert.doesNotMatch(supportables, /childGroupingSectionTitle\(groupings\)/);
  assert.match(supportables, /groupingChildListPageHeading\(grouping\.name, tabLabel\)/);
  assert.match(supportables, /showSectionTitles/);
  assert.ok(
    supportables.indexOf('{groupings.length > 0') <
      supportables.indexOf('{hasDirectLocations'),
    'child groupings render before direct locations',
  );
  assert.doesNotMatch(groupingRow, /LocationMarker/);
  assert.doesNotMatch(groupingRow, /serviceTypeLabel/);
  assert.doesNotMatch(groupingRow, /\.suburb/);
  assert.match(
    source('../src/pages/dashboard/HousesAndCentresPanel.tsx'),
    /groupingDashboardChildren\(grouping\)/,
  );
  assert.match(dashboard, /WorkersPanel|BookingsNeedingAttention|HousesAndCentresPanel/);
  assert.match(
    supportables,
    /onSelectLocation\?\.\(location\.id, '\/bookings'\)/,
  );
  assert.match(supportables, /onSelectGrouping\?\.\(grouping\.id\)/);
  assert.match(supportables, /\{grouping\.name\}/);
  assert.doesNotMatch(supportables, /Children of|supportable/);
  assert.match(
    supportables,
    /groupingDirectLocationListLabel\(housesAndCentres, clients\)/,
  );
  assert.match(supportables, /DirectChildLocationListIcon location=\{location\}/);
  assert.match(
    supportables,
    /mt-1 block text-xs text-text-tertiary">\s*\{directChildLocationTypeLine\(location\)\}/,
  );
  assert.match(
    supportables,
    /className="ui-inset-card flex w-full items-center gap-3 text-left hover:bg-surface-subtle"/,
  );
  assert.match(supportables, /<button[\s\S]*onSelectLocation\?\.\(location\.id, '\/bookings'\)/);
  assert.match(supportables, /EntityLink as="span"/);
  assert.match(supportables, /ChevronRight/);
  assert.doesNotMatch(supportables, /LocationMarker/);
  assert.doesNotMatch(supportables, /title="Clients"/);
  assert.doesNotMatch(supportables, /groupingPlaceBasedLabel\(housesAndCentres\)/);
  assert.match(supportables, /questionId="grouping-locations"/);
  assert.match(source('../src/pages/dashboard/BookingsNeedingAttention.tsx'), /questionId="grouping-requests"/);
  assert.match(dashboard, /questionId="grouping-usage"/);
  assert.match(
    source('../src/pages/Workers.tsx'),
    /GROUPING_WORKERS_CONTENT_ENABLED \?[\s\S]*?\)\s*:\s*\(\s*<LandingPlaceholder/,
  );
  assert.doesNotMatch(
    source('../src/pages/Workers.tsx'),
    /LANDING_CONTENT_ENABLED \|\| GROUPING_WORKERS_CONTENT_ENABLED/,
  );
  assert.match(
    source('../src/pages/GroupingWorkers.tsx'),
    /GROUPING_WORKERS_CONTENT_ENABLED \?[\s\S]*?\)\s*:\s*\(\s*<LandingPlaceholder/,
  );
  assert.match(
    source('../src/pages/Workers.tsx'),
    /<GroupingWorkersTable grouping=\{grouping\}/,
  );
  assert.match(
    source('../src/pages/GroupingWorkersTable.tsx'),
    /groupingWorkers\(grouping\.id\)/,
  );
  assert.match(
    source('../src/pages/dashboard/WorkersPanel.tsx'),
    /Recently booked workers/,
  );
  assert.match(
    source('../src/pages/GroupingWorkersTable.tsx'),
    /questionId="workers-grouping-order"/,
  );
  assert.doesNotMatch(supportables, /groupingOpenRequests|groupingUsageLast7Days|WorkersPanel/);
  assert.doesNotMatch(groupingWorkersBranch, /Search workers|nearbyWorkers|MessageSquare/);
  assert.doesNotMatch(dashboard, /plans to review/);
  assert.doesNotMatch(dashboard, /counts\.plans/);
  assert.doesNotMatch(dashboard, /\brisk\b/i);
  assert.doesNotMatch(dashboard, /understaffed/i);
  assert.doesNotMatch(dashboard, /vacanc/i);
  assert.doesNotMatch(dashboard, /coverage/i);
  assert.doesNotMatch(dashboard, /staffing/i);
  assert.doesNotMatch(dashboard, /at risk|stalled|urgent|critical/i);

  assert.match(dashboard, /BookingsNeedingAttention/);
  assert.doesNotMatch(dashboard, /NotificationStrip|<BookingsWeek/);
  assert.doesNotMatch(dashboard, /nodeType|LocationData|calendarBookings/);
});

test('Galston is busy but has no shift actions waiting on its manager', () => {
  const galston = getLocationData('galston-1');
  const today = startOfDay(new Date());
  const weekAhead = new Date(today);
  weekAhead.setDate(weekAhead.getDate() + 7);

  assert.equal(galston.requestsToAccept, 0);
  assert.equal(galston.bookingsToApprove, 0);
  assert.equal(locationHasWaitingWork('galston-1'), false);
  assert.ok(
    galston.bookings.some(
      (booking) =>
        booking.status === 'confirmed' &&
        booking.start >= today &&
        booking.start < weekAhead,
    ),
  );
  assert.ok(galston.workers.length > 0);
});

test('a house with nothing waiting is absent from the grouping Dashboard waiting block', () => {
  const northern = findGrouping('northern-sydney');
  assert.ok(northern);

  const waiting = waitingDashboardChildren(northern);
  assert.ok(
    !waiting.housesAndCentres.some((location) => location.id === 'galston-1'),
    'Galston 1 has nothing waiting and must not render a row',
  );
  assert.ok(waiting.housesAndCentres.some((location) => location.id === 'hornsby'));
  assert.ok(waiting.housesAndCentres.some((location) => location.id === 'dee-why-1'));
  assert.ok(waiting.housesAndCentres.some((location) => location.id === 'north-ryde-1'));
});

test('the activity line states what happened to a request with no acceptances', () => {
  const hornsby = getLocationData('hornsby');
  const unanswered = hornsby.bookings.find(
    (booking) =>
      booking.status === 'requested' &&
      (booking.requestedWorkerNames?.length ?? 0) > 0 &&
      (booking.declinedWorkerNames?.length ?? 0) === 0,
  );
  assert.ok(unanswered, 'Hornsby should seed a sent request with no acceptances');

  const send = shiftSendDetail(unanswered);
  assert.match(send ?? '', /sent to \d+ workers, none accepted/);
  assert.match(shiftDateTime(unanswered), /\d+(am|pm) to \d+(am|pm)/);

  const attention = source('../src/pages/dashboard/BookingsNeedingAttention.tsx');
  assert.match(attention, /attentionCardSendLine/);
  assert.equal(attentionCardSendLine(unanswered), 'Not yet accepted');
  assert.doesNotMatch(attention, /Waiting items|<details/);
  assert.doesNotMatch(attention, /And \d+ others waiting/);
  assert.doesNotMatch(attention, /at risk|stalled|urgent|critical/i);
});

test('the attention calendar count matches the visible week and changes when paging', () => {
  const northern = findGrouping('northern-sydney');
  assert.ok(northern);

  const attention = groupingAttentionBookings(northern.id);
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const inWeek = attention.filter(
    (booking) =>
      booking.start >= weekStart && booking.start < addDays(weekEnd, 1),
  );
  const renderedCount = inWeek.reduce((total, booking) => total + 1, 0);
  assert.equal(renderedCount, inWeek.length);
  assert.ok(inWeek.length > 0);

  const nextWeekStart = addDays(weekStart, 7);
  const nextWeekEnd = addDays(nextWeekStart, 6);
  const nextWeek = attention.filter(
    (booking) =>
      booking.start >= nextWeekStart &&
      booking.start < addDays(nextWeekEnd, 1),
  );
  assert.notEqual(inWeek.length, nextWeek.length);

  const attentionSource = source('../src/pages/dashboard/BookingsNeedingAttention.tsx');
  assert.match(attentionSource, /<Tag tone="neutral">\{inWeek\.length\}<\/Tag>/);
});

test('the attention calendar collects requested and cancelled shifts across the region', () => {
  const northern = findGrouping('northern-sydney');
  assert.ok(northern);

  const attention = groupingAttentionBookings(northern.id);
  assert.ok(attention.length > 0);
  assert.ok(
    attention.every(
      (booking) => booking.status === 'requested' || booking.status === 'cancelled',
    ),
  );
  assert.ok(attention.every((booking) => booking.locationName.length > 0));
  assert.ok(
    attention.every(
      (booking) =>
        booking.status !== 'requested' ||
        (booking.requestedWorkerNames?.length ?? 0) > 0,
    ),
    'every requested shift must list workers contacted',
  );
  assert.ok(
    attention.some(
      (booking) =>
        booking.locationId === 'north-ryde-1' &&
        booking.status === 'requested' &&
        attentionCardSendLine(booking) === '2 of 5 declined',
    ),
  );

  const hornsby = waitingShiftsForLocation('hornsby');
  assert.ok(hornsby.length > 3, 'Hornsby must seed more than three waiting shifts');
  for (let index = 1; index < hornsby.length; index += 1) {
    assert.ok(
      hornsby[index].start.getTime() >= hornsby[index - 1].start.getTime(),
      'shifts inside a house are soonest start first',
    );
  }

  const deeWhy = waitingShiftsForLocation('dee-why-1');
  assert.ok(
    deeWhy.some((shift) => shift.status === 'cancelled'),
    'a cancelled shift must remain reachable in the attention calendar',
  );

  const calendar = source('../src/pages/dashboard/BookingsNeedingAttention.tsx');
  assert.match(calendar, /COLLAPSED_BOOKINGS_PER_DAY/);
  assert.match(calendar, /groupingAttentionBookings/);

  const housesPanel = source('../src/pages/dashboard/HousesAndCentresPanel.tsx');
  assert.match(housesPanel, /waitingRequestsForLocation/);
  assert.match(housesPanel, /futureCancelledBookings/);
  assert.match(housesPanel, /dashboardHouseRowPendingLinks/);
  assert.doesNotMatch(housesPanel, /dashboardAsidePendingLinks/);
  assert.match(
    housesPanel,
    /title=\{groupingDirectLocationListLabel\(housesAndCentres, clients\)\}/,
  );
  assert.match(housesPanel, /groupingDirectChildrenCountLine\(grouping\)/);
  assert.match(housesPanel, /directLocations\.length >= 2/);
  assert.match(housesPanel, /visibleLocations\.length > 0/);
  assert.doesNotMatch(housesPanel, /visibleHousesAndCentres/);
  assert.doesNotMatch(housesPanel, /visibleClients/);

  for (const locationId of descendantLocationIds(northern)) {
    const cancelledCount = waitingShiftsForLocation(locationId).filter(
      (booking) => booking.status === 'cancelled',
    ).length;
    const awaitingCount = waitingShiftsForLocation(locationId).filter(
      (booking) => booking.status === 'requested',
    ).length;
    const calendarCancelled = attention.filter(
      (booking) =>
        booking.locationId === locationId && booking.status === 'cancelled',
    ).length;
    const calendarAwaiting = attention.filter(
      (booking) =>
        booking.locationId === locationId && booking.status === 'requested',
    ).length;
    assert.equal(
      cancelledCount,
      calendarCancelled,
      `${locationId} cancelled count must match the attention calendar`,
    );
    assert.equal(
      awaitingCount,
      calendarAwaiting,
      `${locationId} awaiting count must match the attention calendar`,
    );
  }
});

test('the same request orders a waiting row and fills its activity line', () => {
  const featured = mostPressingWaitingBooking('hornsby');
  assert.ok(featured);
  assert.equal(featured.status, 'requested');

  const others = getLocationData('hornsby').bookings.filter(
    (booking) =>
      booking.status === 'requested' && booking.id !== featured.id,
  );
  for (const other of others) {
    assert.ok(
      comparePressingBookings(featured, other) <= 0,
      'the activity-line request must also be the most pressing at that house',
    );
  }

  const line = shiftSendDetail(featured);
  assert.match(line ?? '', /none accepted|declined/);
});

/* A quiet location read as quiet on its own page and as
   "0 requests · 0 approvals · 0 unread messages" in the grouping list. Both
   now drop a zero, so the row keeps its name and type and says nothing else. */
test('a grouping row states only the waiting work a location actually has', () => {
  const supportables = source('../src/pages/Supportables.tsx');

  assert.deepEqual(
    pendingWorkParts({ requests: 0, approvals: 0, messages: 0 }),
    [],
  );
  assert.deepEqual(pendingWorkParts({ requests: 1, approvals: 0, messages: 0 }), [
    '1 request',
  ]);
  assert.deepEqual(pendingWorkParts({ requests: 3, approvals: 1, messages: 2 }), [
    '3 requests',
    '1 approval',
    '2 unread messages',
  ]);
  assert.deepEqual(pendingWorkParts({ requests: 0, approvals: 0, messages: 1 }), [
    '1 unread message',
  ]);

  assert.match(
    supportables,
    /pendingWorkParts\(pendingCountsForLocation\(location\.id\)\)/,
  );
  assert.match(supportables, /\{pendingWork\.length > 0 && \(/);
  assert.match(supportables, /\{pendingWork\.join\(' · '\)\}/);
  assert.match(supportables, /DirectChildLocationListIcon location=\{location\}/);
  assert.match(
    supportables,
    /mt-1 block text-xs text-text-tertiary">\s*\{directChildLocationTypeLine\(location\)\}/,
  );
  assert.doesNotMatch(supportables, /LocationMarker/);
  assert.doesNotMatch(supportables, /counts\.requests|counts\.approvals|counts\.messages/);
});

test('the breadcrumb keeps grouping context while menus stay one level deep', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(breadcrumb, /breadcrumbTrail\(\{/);
  assert.match(breadcrumb, /onSelectGrouping/);
  assert.match(breadcrumb, /nodeType === 'location'/);
  assert.match(breadcrumb, /function siblingItems/);
  assert.match(breadcrumb, /childGroupings\(parent\)/);
  assert.match(breadcrumb, /function childItems/);
  assert.match(breadcrumb, /role="menu"/);
  assert.doesNotMatch(breadcrumb, /orderedGroupingsForMenu|descendantLocationIds/);
});

test('a grouping second tier shows the child list, Overview, and Workers', () => {
  const header = source('../src/components/AppHeader.tsx');
  const app = source('../src/App.tsx');
  const navigation = source('../src/lib/informationArchitecture.ts');

  assert.match(header, /visibleMainNavItems\(nodeType, grouping\)/);
  assert.match(header, /href=\{href\(NOTIFICATIONS_NODE_ITEM\.path\)\}/);
  assert.match(header, /\{visibleNavItems\.length > 0 && \(/);
  assert.match(header, /app-header-nav-row/);
  assert.match(header, /groupingChildListTabLabel\(grouping\)/);
  assert.match(app, /nodeType === 'grouping'/);
  assert.match(app, /<Dashboard\s+grouping=\{grouping\}/);
  assert.match(app, /path === '\/supportables'[\s\S]*?<Supportables/);
  assert.match(app, /path === '\/workers'[\s\S]*?<Workers grouping=\{grouping\}/);
  assert.match(
    navigation,
    /label: 'Supportables',[\s\S]*?nodeTypes: \['organisation'\]/,
  );
  assert.match(
    navigation,
    /path: '\/supportables',[\s\S]*?nodeTypes: \['grouping'\]/,
  );
  const groupingShell = app.slice(
    app.indexOf("if (nodeType === 'grouping' || nodeType === 'organisation')"),
    app.indexOf('if (!activeLocation) return null'),
  );
  assert.doesNotMatch(groupingShell, /<SectionNavigation/);
  assert.match(groupingShell, /path === '\/notifications'[\s\S]*?<Notifications/);
  assert.equal(app.match(/<Dashboard/g)?.length, 1);
  assert.doesNotMatch(app, /<Workers nodeType="grouping"/);
  assert.match(app, /selectGrouping/);
  assert.match(app, /navigate\(nodeLandingPath\('grouping', nextGrouping\)\)/);
  assert.match(
    navigation,
    /label: 'Overview',[\s\S]*?nodeTypes: \['grouping', 'organisation'\]/,
  );
  assert.match(
    navigation,
    /label: 'Workers',[\s\S]*?nodeTypes: \['grouping', 'location'\]/,
  );
  assert.match(
    navigation,
    /label: 'Bookings',[\s\S]*?nodeTypes: \['location'\]/,
  );
  assert.match(app, /navigate\('\/bookings'\)/);
});

test('Careforce arm navigation walks down the tree and lands on the child list until locations appear', () => {
  const careforce = findGrouping('cpa-careforce');
  const careforceArea = findGrouping('careforce-area');
  const careforceCaseload = findGrouping('careforce-caseload');
  assert.ok(careforce && careforceArea && careforceCaseload);

  assert.equal(nodeLandingPath('grouping', careforce), '/supportables');
  assert.equal(nodeLandingPath('grouping', careforceArea), '/supportables');
  assert.equal(nodeLandingPath('grouping', careforceCaseload), '/');
  assert.equal(groupingChildListTabLabel(careforce), 'Groupings');
  assert.equal(groupingChildListTabLabel(careforceArea), 'Groupings');

  const { groupings } = groupingDashboardChildren(careforce);
  assert.equal(groupings[0]?.id, 'careforce-area');
  const areaChildren = groupingDashboardChildren(careforceArea).groupings;
  assert.ok(areaChildren.some((child) => child.id === 'careforce-caseload'));
  const caseloadLocations = groupingDashboardChildren(careforceCaseload);
  assert.ok(caseloadLocations.housesAndCentres.length > 0);
});

test('regions that were previously gated still seed Overview content', () => {
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);

  for (const id of ['hunter', 'illawarra', 'cpa-western-sydney']) {
    const attention = groupingAttentionBookings(id);
    const inWeek = attention.filter(
      (booking) =>
        booking.start >= weekStart &&
        booking.start < addDays(weekEnd, 1),
    );
    assert.ok(inWeek.length > 0, `${id} needs shifts in the current week`);
    assert.ok(
      groupingDashboardWorkers(id).length >= 6,
      `${id} needs enough workers for the aside preview`,
    );
  }
});

test('the Overview direct-child location list uses one sort control when it has two or more rows', () => {
  const housesPanel = source('../src/pages/dashboard/HousesAndCentresPanel.tsx');

  assert.match(housesPanel, /groupingDirectLocationListLabel/);
  assert.match(housesPanel, /groupingDirectChildrenCountLine\(grouping\)/);
  assert.match(housesPanel, /showSort=\{directLocations\.length >= 2\}/);
  assert.match(housesPanel, /useState<DashboardAsideSort>\('soonest-shift'\)/);
  assert.doesNotMatch(housesPanel, /housesSortOption/);
  assert.doesNotMatch(housesPanel, /clientsSortOption/);
  assert.doesNotMatch(housesPanel, /title="Clients"/);

  const northernSydney = findGrouping('northern-sydney')!;
  const westernLifestyles = findGrouping('western-lifestyles')!;
  const careforceNorthern = findGrouping('careforce-northern-caseload')!;

  const sydney = groupingDashboardChildren(northernSydney);
  const western = groupingDashboardChildren(westernLifestyles);
  const northern = groupingDashboardChildren(careforceNorthern);

  assert.equal(
    sydney.housesAndCentres.length + sydney.clients.length >= 2,
    true,
  );
  assert.equal(
    western.housesAndCentres.length + western.clients.length >= 2,
    true,
  );
  assert.equal(
    northern.housesAndCentres.length + northern.clients.length >= 2,
    true,
  );
});

test('landing follows direct children; a location still lands on Bookings', () => {
  const app = source('../src/App.tsx');
  const header = source('../src/components/AppHeader.tsx');
  const arm = findGrouping('cpa-sil');
  const northernSydney = findGrouping('northern-sydney');

  assert.ok(arm && northernSydney);
  assert.equal(arm.kind, 'arm');
  assert.equal(nodeLandingPath('organisation'), '/supportables');
  assert.equal(nodeLandingPath('grouping', northernSydney), '/');
  assert.equal(nodeLandingPath('grouping', arm), '/supportables');
  assert.equal(nodeLandingPath('location'), '/bookings');

  /* Child-list rows, breadcrumb crumbs and breadcrumb dropdowns all enter a
     node through these two callbacks, so the landing rule lives with them. */
  assert.match(
    app,
    /const selectOrganisation = useCallback\(\(\) => \{[\s\S]*?navigate\(nodeLandingPath\('organisation'\)\)/,
  );
  assert.match(
    app,
    /const selectGrouping = useCallback\([\s\S]*?navigate\(nodeLandingPath\('grouping', nextGrouping\)\)/,
  );
  assert.match(app, /navigate\(\s*nodeLandingPath\(/);
  assert.match(app, /nodeType === 'grouping' \? grouping : undefined/);
  assert.match(header, /href=\{href\(nodeLandingPath\(nodeType, grouping\)\)\}/);
  assert.doesNotMatch(
    header,
    /href\(nodeType === 'location' \? '\/bookings' : '\/'\)/,
  );
});

test('the current node is remembered and restart clears it', () => {
  const app = source('../src/App.tsx');
  const session = source('../src/lib/session.ts');

  assert.match(session, /const NODE_TYPE_KEY = 'hm\.lastNodeType'/);
  assert.match(session, /readLastNodeType/);
  assert.match(session, /writeLastNodeType/);
  assert.match(session, /clearLastLocationId[\s\S]*remove\(NODE_TYPE_KEY\)/);
  assert.match(app, /useState\(readLastNodeType\)/);
});
