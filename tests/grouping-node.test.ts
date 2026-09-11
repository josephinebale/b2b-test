import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { startOfDay } from '../src/lib/date.ts';
import { pendingWorkParts } from '../src/lib/pageContent.ts';
import {
  GROUPING,
  GROUPINGS,
  LOCATIONS,
  compareRequestUrgency,
  descendantLocationIds,
  findGrouping,
  getLocationData,
  groupingOpenRequests,
  groupingUsageLast7Days,
  partitionGroupingLocations,
  pendingCountsForLocation,
} from '../src/data/locations.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('the Northern Sydney grouping keeps its SIL houses and the day program', () => {
  assert.equal(GROUPING.id, 'northern-sydney');
  assert.equal(GROUPING.name, 'Northern Sydney');
  assert.equal(GROUPING.locationIds.length, 6);
  assert.ok(GROUPING.locationIds.includes('allambie-heights-day-program'));
  assert.ok(GROUPING.locationIds.every((id) => LOCATIONS.some((location) => location.id === id)));
});

test('a grouping dashboard splits houses and centres from clients, and omits an empty client section', () => {
  for (const grouping of GROUPINGS) {
    const { housesAndCentres, clients } = partitionGroupingLocations(grouping);
    const expectedHouses = descendantLocationIds(grouping).filter(
      (id) => LOCATIONS.find((location) => location.id === id)?.serviceType !== 'home-community',
    );
    const expectedClients = descendantLocationIds(grouping).filter(
      (id) => LOCATIONS.find((location) => location.id === id)?.serviceType === 'home-community',
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

  assert.equal(partitionGroupingLocations(findGrouping('northern-sydney')!).clients.length, 0);
  assert.ok(partitionGroupingLocations(findGrouping('careforce-caseload')!).clients.length >= 1);
  assert.equal(
    partitionGroupingLocations(findGrouping('lwb-northern-sydney')!)
      .housesAndCentres.length,
    0,
  );
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

test('Dashboard grouping lists locations, requests, usage, and regularly used workers', () => {
  const dashboard = source('../src/pages/Dashboard.tsx');
  const workers = source('../src/pages/dashboard/WorkersPanel.tsx');

  assert.match(dashboard, /partitionGroupingLocations/);
  assert.match(dashboard, /housesAndCentres\.length > 0/);
  assert.match(dashboard, /clients\.length > 0/);
  assert.match(dashboard, /pendingCountsForLocation/);
  assert.match(dashboard, /groupingOpenRequests/);
  assert.match(dashboard, /groupingUsageLast7Days/);
  assert.match(
    dashboard,
    /onSelectLocation\?\.\(location\.id, '\/bookings'\)/,
  );
  assert.match(dashboard, /bookingsViewPath\('requested'\)/);
  assert.match(dashboard, /Houses and centres/);
  assert.match(dashboard, />Clients</);
  assert.match(dashboard, /clients\.length > 0/);
  assert.match(dashboard, /questionId="grouping-locations"/);
  assert.match(dashboard, /questionId="grouping-requests"/);
  assert.match(dashboard, /questionId="grouping-usage"/);
  assert.match(dashboard, /<WorkersPanel grouping=\{grouping\}/);
  assert.match(workers, /groupingWorkers\(grouping\.id\)/);
  assert.match(workers, /Workers used regularly/);
  assert.match(workers, /questionId="workers-grouping-order"/);
  assert.doesNotMatch(dashboard, /plans to review/);
  assert.doesNotMatch(dashboard, /counts\.plans/);
  assert.doesNotMatch(dashboard, /\brisk\b/i);
  assert.doesNotMatch(dashboard, /understaffed/i);
  assert.doesNotMatch(dashboard, /vacanc/i);
  assert.doesNotMatch(dashboard, /coverage/i);
  assert.doesNotMatch(dashboard, /staffing/i);

  assert.equal(
    [...dashboard.matchAll(/groupingOpenRequests/g)].length,
    2,
    'requests waiting stays one ordered list',
  );

  assert.doesNotMatch(dashboard, /NotificationStrip|BookingsWeek/);
  assert.doesNotMatch(dashboard, /nodeType|LocationData|calendarBookings/);
});

test('Galston is busy but has no shift actions waiting on its manager', () => {
  const galston = getLocationData('galston-1');
  const today = startOfDay(new Date());
  const weekAhead = new Date(today);
  weekAhead.setDate(weekAhead.getDate() + 7);

  assert.equal(galston.requestsToAccept, 0);
  assert.equal(galston.bookingsToApprove, 0);
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

/* A quiet location read as quiet on its own page and as
   "0 requests · 0 approvals · 0 unread messages" in the grouping list. Both
   now drop a zero, so the row keeps its name and type and says nothing else. */
test('a grouping row states only the waiting work a location actually has', () => {
  const dashboard = source('../src/pages/Dashboard.tsx');

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
    dashboard,
    /pendingWorkParts\(pendingCountsForLocation\(location\.id\)\)/,
  );
  assert.match(dashboard, /\{pendingWork\.length > 0 && \(/);
  assert.match(dashboard, /\{pendingWork\.join\(' · '\)\}/);
  assert.match(dashboard, /serviceTypeLabel\(location\.serviceType, location\.sector\)/);
  assert.doesNotMatch(dashboard, /counts\.requests|counts\.approvals|counts\.messages/);
});

test('the breadcrumb keeps grouping context without acting as a menu', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(breadcrumb, /groupingPath\(grouping\)/);
  assert.match(breadcrumb, /onSelectGrouping\(segment\.id\)/);
  assert.match(breadcrumb, /nodeType === 'location'/);
  assert.doesNotMatch(breadcrumb, /orderedGroupingsForMenu|role="menu"/);
});

test('a grouping has only Dashboard and renders no section navigation', () => {
  const header = source('../src/components/AppHeader.tsx');
  const app = source('../src/App.tsx');
  const navigation = source('../src/lib/informationArchitecture.ts');

  assert.match(
    header,
    /NODE_NAV_ITEMS\.filter[\s\S]*?item\.placement === 'main'[\s\S]*?item\.nodeTypes\.some/,
  );
  assert.match(header, /href=\{href\(NOTIFICATIONS_NODE_ITEM\.path\)\}/);
  assert.match(header, /visibleNavItems\.length > 1/);
  assert.match(header, /app-header-nav-row/);
  assert.match(app, /nodeType === 'grouping'/);
  assert.match(app, /<Dashboard\s+grouping=\{grouping\}/);
  const groupingShell = app.slice(
    app.indexOf("if (nodeType === 'grouping')"),
    app.indexOf('if (!activeLocation) return null'),
  );
  assert.doesNotMatch(groupingShell, /<SectionNavigation/);
  assert.match(groupingShell, /path === '\/notifications'[\s\S]*?<Notifications/);
  assert.equal(app.match(/<Dashboard/g)?.length, 1);
  assert.doesNotMatch(app, /<Workers nodeType="grouping"/);
  assert.match(app, /selectGrouping/);
  assert.match(app, /navigate\('\/'\)/);
  assert.match(
    navigation,
    /label: 'Dashboard',[\s\S]*?nodeTypes: \['grouping'\]/,
  );
  assert.doesNotMatch(
    navigation,
    /label: 'Workers',[\s\S]*?nodeTypes: \['grouping', 'location'\]/,
  );
  assert.match(
    navigation,
    /label: 'Bookings',[\s\S]*?nodeTypes: \['location'\]/,
  );
  assert.match(app, /navigate\('\/bookings'\)/);
});

test('the current node is remembered and restart clears it', () => {
  const session = source('../src/lib/session.ts');
  const app = source('../src/App.tsx');

  assert.match(session, /const NODE_TYPE_KEY = 'hm\.lastNodeType'/);
  assert.match(session, /readLastNodeType/);
  assert.match(session, /writeLastNodeType/);
  assert.match(session, /clearLastLocationId[\s\S]*remove\(NODE_TYPE_KEY\)/);
  assert.match(app, /useState\(readLastNodeType\)/);
});
