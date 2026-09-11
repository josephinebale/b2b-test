import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { startOfDay } from '../src/lib/date.ts';
import { pendingWorkParts } from '../src/lib/pageContent.ts';
import {
  GROUPING,
  GROUPINGS,
  LOCATIONS,
  childGroupingSectionTitle,
  groupingContentsSummary,
  groupingDashboardDescription,
  compareRequestUrgency,
  descendantLocationIds,
  findGrouping,
  getLocationData,
  groupingDashboardChildren,
  groupingOpenRequests,
  groupingUsageLast7Days,
  partitionGroupingLocations,
  pendingCountsForGrouping,
  pendingCountsForLocation,
} from '../src/data/locations.ts';
import { nodeLandingPath } from '../src/lib/informationArchitecture.ts';

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
  assert.equal(careforceArea.groupings.length, 5);
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
  assert.deepEqual(
    careforceChildren.map((child) => child.name),
    [
      'Careforce caseload',
      'Careforce Northern caseload',
      'Careforce Western caseload',
      'Careforce Hunter caseload',
      'Careforce Illawarra caseload',
    ],
  );
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
    groupingContentsSummary(findGrouping('cpa-sil')!),
    '11 houses and 1 centre',
  );
  assert.equal(
    groupingContentsSummary(findGrouping('cpa-lifestyles')!),
    '3 centres and 3 clients',
  );
  assert.equal(
    groupingContentsSummary(findGrouping('cpa-careforce')!),
    '14 houses and 2 clients',
  );
  assert.equal(
    groupingContentsSummary(findGrouping('northern-sydney')!),
    '5 houses and 1 centre',
  );
  assert.equal(
    groupingContentsSummary(findGrouping('careforce-caseload')!),
    '5 houses and 1 client',
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
    '2 centres and 2 clients',
  );

  const locations = source('../src/data/locations.ts');
  const summary = locations.slice(
    locations.indexOf('export function groupingContentsSummary'),
    locations.indexOf('export function groupingDashboardDescription'),
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
  const groupingWorkersPage = source('../src/pages/GroupingWorkers.tsx');
  const workers = source('../src/pages/dashboard/WorkersPanel.tsx');
  const groupingRow = supportables.slice(
    supportables.indexOf('function ChildGroupingRow'),
    supportables.indexOf('export function Supportables'),
  );

  assert.match(supportables, /groupingDashboardChildren\(grouping\)/);
  assert.match(supportables, /groupings\.length > 0/);
  assert.match(supportables, /housesAndCentres\.length > 0/);
  assert.match(supportables, /clients\.length > 0/);
  assert.match(supportables, /pendingCountsForLocation/);
  assert.match(supportables, /pendingCountsForGrouping\(grouping\)/);
  assert.match(supportables, /groupingContentsSummary\(grouping\)/);
  assert.doesNotMatch(supportables, /groupingDashboardDescription/);
  assert.doesNotMatch(supportables, /organisationSupportablesDescription/);
  assert.match(supportables, /title=\{treeSectionLabel\(grouping, nodeType\)\}/);
  assert.doesNotMatch(supportables, /<PageHeading\s+title="Supportables"/);
  assert.match(supportables, /childGroupingSectionTitle\(groupings\)/);
  assert.ok(
    supportables.indexOf('{groupings.length > 0') <
      supportables.indexOf('{housesAndCentres.length > 0'),
    'child groupings render before direct locations',
  );
  assert.doesNotMatch(groupingRow, /LocationMarker/);
  assert.doesNotMatch(groupingRow, /serviceTypeLabel/);
  assert.doesNotMatch(groupingRow, /\.suburb/);
  assert.match(dashboard, /groupingOpenRequests\(grouping\.id\)/);
  assert.match(dashboard, /groupingUsageLast7Days\(grouping\.id\)/);
  assert.match(
    supportables,
    /onSelectLocation\?\.\(location\.id, '\/bookings'\)/,
  );
  assert.match(supportables, /onSelectGrouping\?\.\(grouping\.id\)/);
  assert.match(supportables, /\{grouping\.name\}/);
  assert.doesNotMatch(supportables, /Children of|supportable/);
  assert.match(dashboard, /bookingsViewPath\('requested'\)/);
  assert.match(supportables, /Houses and centres/);
  assert.match(supportables, />Clients</);
  assert.match(supportables, /clients\.length > 0/);
  assert.match(supportables, /questionId="grouping-locations"/);
  assert.match(dashboard, /questionId="grouping-requests"/);
  assert.match(dashboard, /questionId="grouping-usage"/);
  assert.match(groupingWorkersPage, /<WorkersPanel grouping=\{grouping\}/);
  assert.match(workers, /groupingWorkers\(grouping\.id\)/);
  assert.match(workers, /Workers used regularly/);
  assert.match(workers, /questionId="workers-grouping-order"/);
  assert.doesNotMatch(dashboard, /groupingDashboardChildren|GroupingLocationRow|ChildGroupingRow/);
  assert.doesNotMatch(dashboard, /WorkersPanel|groupingWorkers/);
  assert.doesNotMatch(supportables, /groupingOpenRequests|groupingUsageLast7Days|WorkersPanel/);
  assert.doesNotMatch(groupingWorkersPage, /Search workers|nearbyWorkers|MessageSquare|Calendar/);
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
  assert.match(supportables, /serviceTypeLabel\(location\.serviceType, location\.sector\)/);
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

test('a grouping renders Dashboard, Supportables, and Workers in the second tier', () => {
  const header = source('../src/components/AppHeader.tsx');
  const app = source('../src/App.tsx');
  const navigation = source('../src/lib/informationArchitecture.ts');

  assert.match(
    header,
    /NODE_NAV_ITEMS\.filter[\s\S]*?item\.placement === 'main'[\s\S]*?item\.nodeTypes\.some/,
  );
  assert.match(header, /href=\{href\(NOTIFICATIONS_NODE_ITEM\.path\)\}/);
  assert.match(header, /\{visibleNavItems\.length > 0 && \(/);
  assert.match(header, /app-header-nav-row/);
  assert.match(header, /treeSectionLabel\(grouping, nodeType\)/);
  assert.match(app, /nodeType === 'grouping'/);
  assert.match(app, /<Dashboard\s+grouping=\{grouping\}/);
  assert.match(app, /path === '\/supportables'[\s\S]*?<Supportables/);
  assert.match(app, /path === '\/workers'[\s\S]*?<GroupingWorkers/);
  const groupingShell = app.slice(
    app.indexOf("if (nodeType === 'grouping' || nodeType === 'organisation')"),
    app.indexOf('if (!activeLocation) return null'),
  );
  assert.doesNotMatch(groupingShell, /<SectionNavigation/);
  assert.match(groupingShell, /path === '\/notifications'[\s\S]*?<Notifications/);
  assert.equal(app.match(/<Dashboard/g)?.length, 1);
  assert.doesNotMatch(app, /<Workers nodeType="grouping"/);
  assert.match(app, /selectGrouping/);
  assert.match(app, /navigate\(nodeLandingPath\('grouping'\)\)/);
  assert.match(
    navigation,
    /label: 'Dashboard',[\s\S]*?nodeTypes: \['grouping', 'organisation'\]/,
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

test('every node above a location lands on its child list, not the placeholder Dashboard', () => {
  const app = source('../src/App.tsx');
  const header = source('../src/components/AppHeader.tsx');

  assert.equal(nodeLandingPath('organisation'), '/supportables');
  assert.equal(nodeLandingPath('grouping'), '/supportables');
  assert.equal(nodeLandingPath('location'), '/bookings');

  /* Child-list rows, breadcrumb crumbs and breadcrumb dropdowns all enter a
     node through these two callbacks, so the landing rule lives with them. */
  assert.match(
    app,
    /const selectOrganisation = useCallback\(\(\) => \{[\s\S]*?navigate\(nodeLandingPath\('organisation'\)\)/,
  );
  assert.match(
    app,
    /const selectGrouping = useCallback\([\s\S]*?navigate\(nodeLandingPath\('grouping'\)\)/,
  );
  assert.match(app, /navigate\(nodeLandingPath\(persona\.entry\.nodeType\)\)/);
  assert.match(app, /navigate\(nodeLandingPath\(nodeType\)\)/);
  assert.match(header, /href=\{href\(nodeLandingPath\(nodeType\)\)\}/);
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
