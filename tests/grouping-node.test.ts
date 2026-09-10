import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { startOfDay } from '../src/lib/date.ts';
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

test('Dashboard grouping lists locations, urgency-ordered requests, and usage — not plans or roster risk', () => {
  const dashboard = source('../src/pages/Dashboard.tsx');

  assert.match(dashboard, /nodeType === 'grouping'/);
  assert.match(dashboard, /partitionGroupingLocations/);
  assert.match(dashboard, /housesAndCentres\.length > 0/);
  assert.match(dashboard, /clients\.length > 0/);
  assert.match(dashboard, /pendingCountsForLocation/);
  assert.match(dashboard, /groupingOpenRequests/);
  assert.match(dashboard, /groupingUsageLast7Days/);
  assert.match(dashboard, /onSelectLocation\?\.\(location\.id\)/);
  assert.match(dashboard, /bookingsViewPath\('requested'\)/);
  assert.match(dashboard, /Houses and centres/);
  assert.match(dashboard, />Clients</);
  assert.match(dashboard, /clients\.length > 0/);
  assert.match(dashboard, /questionId="grouping-locations"/);
  assert.match(dashboard, /questionId="grouping-requests"/);
  assert.match(dashboard, /questionId="grouping-usage"/);
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

  assert.match(dashboard, /<NotificationStrip data=\{data\} \/>/);
  assert.match(
    dashboard,
    /<BookingsWeek data=\{data\} calendarBookings=\{calendarBookings\} \/>/,
  );
  assert.match(dashboard, /<WorkersPanel data=\{data\} \/>/);
});

test('the switcher moves between grouping and location in the existing menu', () => {
  const switcher = source('../src/components/LocationSwitcher.tsx');

  assert.match(switcher, /onSelectGrouping/);
  assert.match(switcher, /orderedGroupingsForMenu/);
  assert.match(switcher, /onSelectGrouping\(grouping\.id\)/);
  assert.match(switcher, /childGroupings\(grouping\)/);
  assert.match(switcher, /renderGrouping\(child, depth \+ 1\)/);
  assert.match(switcher, /onSelect\(option\.id, grouping\.id\)/);
});

test('grouping navigation contains only node-relative pages', () => {
  const header = source('../src/components/AppHeader.tsx');
  const app = source('../src/App.tsx');

  assert.match(
    header,
    /NODE_NAV_ITEMS\.filter[\s\S]*?item\.placement === 'main'[\s\S]*?item\.nodeTypes\.some/,
  );
  assert.match(header, /nodeType === 'location' && \(\s*<IconButton/);
  assert.match(app, /nodeType === 'grouping'/);
  assert.match(app, /<Dashboard\s+nodeType="grouping"/);
  assert.match(app, /selectGrouping/);
  assert.match(app, /navigate\('\/'\)/);
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
