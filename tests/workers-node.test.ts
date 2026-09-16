import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  LOCATIONS,
  descendantLocationIds,
  getLocationData,
  groupingDashboardWorkers,
  groupingWorkers,
  locationWorkerTiers,
  nearbyWorkers,
  GROUPING,
} from '../src/data/locations.ts';
import {
  WORKERS_ROUTE,
  dashboardWorkerExceptionLines,
  dashboardWorkerLastWorkedLabel,
  namedLocationList,
  workerIdFromPath,
  workerProfilePath,
} from '../src/lib/pageContent.ts';
import { NODE_NAV_ITEMS } from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('Workers is a destination at both node types with node-specific content', () => {
  const app = source('../src/App.tsx');
  const header = source('../src/components/AppHeader.tsx');
  const router = source('../src/lib/router.ts');

  assert.equal(WORKERS_ROUTE, '/workers');
  assert.equal(workerProfilePath('eleni-p'), '/workers/eleni-p');
  assert.equal(workerIdFromPath('/workers/eleni-p'), 'eleni-p');
  assert.equal(workerIdFromPath('/workers'), null);
  const item = NODE_NAV_ITEMS.find(({ label }) => label === 'Workers');
  assert.ok(item);
  assert.equal(item.path, WORKERS_ROUTE);
  assert.deepEqual(item.nodeTypes, ['grouping', 'location']);
  assert.match(header, /visibleMainNavItems\(nodeType, grouping\)/);
  assert.match(app, /<Workers/);
  assert.match(app, /<Workers grouping=\{grouping\}/);
  assert.doesNotMatch(app, /<Workers nodeType="grouping"/);
  assert.match(router, /\/team/);
  assert.match(router, /\/workers/);
  assert.doesNotMatch(header, /label: 'Team'/);
});

test('tier one is ranked by completed shifts at this location, then name', () => {
  for (const location of LOCATIONS) {
    const rows = locationWorkerTiers(location.id).knownHere;
    const completedShifts = (workerId: string) =>
      getLocationData(location.id).bookings.filter(
        (booking) =>
          booking.workerId === workerId && booking.status === 'ended',
      ).length;

    for (let index = 1; index < rows.length; index += 1) {
      const previous = rows[index - 1];
      const current = rows[index];
      const previousCount = completedShifts(previous.id);
      const currentCount = completedShifts(current.id);
      assert.ok(
        previousCount > currentCount ||
          (previousCount === currentCount &&
            previous.name.localeCompare(current.name) <= 0),
        `${previous.name} should rank ahead of ${current.name} at ${location.name}`,
      );
    }
  }
});

test('location Workers has three ordered, disjoint populations', () => {
  const nearbyIds = new Set(nearbyWorkers().map((worker) => worker.id));
  assert.ok(nearbyIds.size > 0);

  for (const location of LOCATIONS) {
    const tiers = locationWorkerTiers(location.id);
    const knownIds = new Set(tiers.knownHere.map((worker) => worker.id));
    const elsewhereIds = new Set(tiers.workedElsewhere.map((worker) => worker.id));

    assert.ok(tiers.knownHere.length > 0, `${location.name} needs a first tier`);
    assert.ok(tiers.workedElsewhere.length > 0, `${location.name} needs a middle tier`);
    assert.ok(tiers.nearby.length > 0, `${location.name} needs a nearby tier`);
    assert.ok(tiers.workedElsewhere.every((worker) => worker.locations.length > 0));
    assert.ok(tiers.workedElsewhere.every((worker) => worker.shiftCount > 0));
    assert.ok([...knownIds].every((id) => !elsewhereIds.has(id)));
    assert.ok([...knownIds].every((id) => !nearbyIds.has(id)));
    assert.ok([...elsewhereIds].every((id) => !nearbyIds.has(id)));
  }
});

test('grouping dashboard workers spread last-worked dates across the eight-week window', () => {
  const now = new Date('2026-09-15T12:00:00');
  const northern = groupingDashboardWorkers('northern-sydney', now);
  const labels = northern.map(
    (worker) => dashboardWorkerLastWorkedLabel(worker.lastWorkedAt!, now),
  );

  assert.ok(labels.includes('Last worked today'));
  assert.ok(labels.includes('Last worked yesterday'));
  assert.ok(labels.some((label) => /Last worked \d+ days ago/.test(label)));
  assert.ok(labels.some((label) => /Last worked \d+ weeks ago/.test(label)));
  const farah = northern.find((worker) => worker.id === 'farah-t');
  assert.ok(farah);
  assert.equal(dashboardWorkerLastWorkedLabel(farah.lastWorkedAt!, now), 'Last worked today');
  assert.ok(!northern.some((worker) => worker.id === 'maxine-r'));

  const byShiftCount = [...northern].sort(
    (first, second) => second.shiftCount - first.shiftCount,
  );
  assert.notDeepEqual(
    northern.slice(0, 6).map((worker) => worker.id),
    byShiftCount.slice(0, 6).map((worker) => worker.id),
  );
});

test('the grouping dashboard population ranks most recent shift then shifts in the window', () => {
  const workers = groupingDashboardWorkers();

  assert.ok(workers.length > 0);
  assert.ok(workers.every((worker) => worker.locations.length > 0));
  assert.ok(workers.every((worker) => worker.shiftCount > 0));
  assert.ok(workers.every((worker) => worker.lastWorkedAt instanceof Date));

  for (let index = 1; index < workers.length; index += 1) {
    const previous = workers[index - 1];
    const current = workers[index];
    const previousWorked = previous.lastWorkedAt?.getTime() ?? 0;
    const currentWorked = current.lastWorkedAt?.getTime() ?? 0;
    assert.ok(
      previousWorked > currentWorked ||
        (previousWorked === currentWorked &&
          (previous.shiftCount > current.shiftCount ||
            (previous.shiftCount === current.shiftCount &&
              previous.name.localeCompare(current.name) <= 0))),
      `${previous.name} should rank ahead of ${current.name}`,
    );
  }

  assert.ok(
    workers.some((worker) => worker.locations.length > 1),
    'the grouping population should include workers with history across locations',
  );
});

test('grouping dashboard worker exceptions stay sparse in the aside preview', () => {
  const preview = (groupingId: string) =>
    groupingDashboardWorkers(groupingId)
      .slice(0, 6)
      .map((worker) => dashboardWorkerExceptionLines(worker));

  const northernSydney = preview('northern-sydney');
  const illawarra = preview('illawarra');
  const hunter = preview('hunter');

  for (const [name, rows] of [
    ['Northern Sydney', northernSydney],
    ['Illawarra', illawarra],
    ['Hunter', hunter],
  ] as const) {
    assert.ok(
      rows.filter((lines) => lines.length > 0).length <= 2,
      `${name} should keep exceptions sparse in the first six workers`,
    );
    assert.ok(rows.every((lines) => lines.length <= 2));
  }
});

test('Workers page keeps the location team first and the other tiers below it', () => {
  const workers = source('../src/pages/Workers.tsx');
  const first = workers.indexOf('Your location team');
  const second = workers.indexOf('Worked elsewhere in');
  const third = workers.indexOf('Available nearby');

  assert.ok(first >= 0 && second > first && third > second);
  assert.match(workers, /Search workers/);
  assert.match(workers, /Support plan confirmed/);
  assert.match(workers, /Support plan needs review/);
  assert.match(workers, /Support plan not shared/);
  assert.match(workers, /worker\.locations/);
  assert.match(workers, /location\.bookingCount/);
  assert.doesNotMatch(workers, /Paying at|pay level/i);
});

test('grouping Workers page stays hidden behind GROUPING_WORKERS_CONTENT_ENABLED', () => {
  const workers = source('../src/pages/Workers.tsx');
  const panel = source('../src/pages/dashboard/WorkersPanel.tsx');
  const dashboard = source('../src/pages/Dashboard.tsx');
  const groupingWorkersBranch = workers.slice(
    workers.indexOf('if (!data)'),
    workers.indexOf('const client ='),
  );

  assert.match(groupingWorkersBranch, /GROUPING_WORKERS_CONTENT_ENABLED/);
  assert.doesNotMatch(
    groupingWorkersBranch,
    /LANDING_CONTENT_ENABLED \|\| GROUPING_WORKERS_CONTENT_ENABLED/,
  );
  assert.match(groupingWorkersBranch, /<GroupingWorkersTable grouping=\{grouping\}/);
  assert.match(
    source('../src/pages/GroupingWorkers.tsx'),
    /groupingWorkersHeading\(grouping\.name\)/,
  );
  assert.match(
    groupingWorkersBranch,
    /GROUPING_WORKERS_CONTENT_ENABLED \?[\s\S]*?\)\s*:\s*\(\s*<LandingPlaceholder/,
  );
  assert.doesNotMatch(groupingWorkersBranch, /Search workers|nearbyWorkers|MessageSquare/);
  assert.doesNotMatch(groupingWorkersBranch, /workerProfilePath/);

  assert.match(panel, /groupingDashboardWorkers\(grouping\.id\)/);
  assert.doesNotMatch(panel, /groupingWorkers\(grouping\.id\)/);
  assert.doesNotMatch(
    panel,
    /Everyone who&apos;s had a shift in the region in the last eight weeks\./,
  );
  assert.match(panel, /Recently booked workers/);
  assert.match(
    panel,
    /export const GROUPING_OVERVIEW_WORKER_EXCEPTION_TAGS_VISIBLE = false/,
  );
  assert.match(panel, /dashboardWorkerEvidenceLine/);
  assert.match(panel, /dashboardWorkerPrimaryLocation/);
  assert.doesNotMatch(panel, /MessageSquare|Calendar/);
  assert.match(panel, /<Tag[\s\S]*tone="pending"/);
  assert.match(panel, /onSelectLocation\?\.\(primaryLocationId, '\/messages'\)/);
  assert.match(panel, /onSelectLocation\?\.\(\s*primaryLocationId,\s*'\/request-booking',/);
  assert.match(panel, /dashboardWorkerExceptionLines/);
  assert.match(panel, /workerProfilePath\(worker\.id\)/);
  assert.doesNotMatch(panel, /variant === 'tab'|<Clock /);
  assert.match(panel, /workers\.slice\(0, WORKERS_PREVIEW\)/);
  assert.doesNotMatch(panel, /See all workers/);
  assert.match(panel, /<SectionHeadingRow/);
  assert.match(panel, /View all/);
  assert.match(panel, /href=\{href\('\/workers'\)\}/);
  assert.doesNotMatch(panel, /LANDING_CONTENT_ENABLED|GROUPING_WORKERS_CONTENT_ENABLED/);
  assert.match(dashboard, /<aside>[\s\S]*<WorkersPanel[\s\S]*grouping=\{grouping\}/);
  assert.match(dashboard, /<HousesAndCentresPanel/);
  assert.match(workers, /questionId="workers-location-tiers"/);
  assert.match(workers, /questionId="workers-search"/);
});

test('GroupingWorkersTable is a sortable comparison table without search or marketplace rows', () => {
  const table = source('../src/pages/GroupingWorkersTable.tsx');

  assert.match(table, /<table/);
  assert.match(table, /label="Worker"/);
  assert.match(table, /label="Houses"/);
  assert.match(table, /label="Shifts"/);
  assert.match(table, /label="Hours"/);
  assert.match(table, />\s*Status\s*</);
  assert.match(
    table,
    /Everyone who has worked in this region, and how much they have worked at[\s\S]*each house\./,
  );
  assert.match(table, /groupingWorkers\(grouping\.id\)/);
  assert.match(table, /descendantLocationIds\(grouping\)/);
  assert.match(table, /\{worker\.locations\.length\} of \{locationTotal\}/);
  assert.match(table, /namedLocationList\(houseNames, 3\)/);
  assert.match(table, /EntityLink as="span"/);
  assert.doesNotMatch(table, /workerProfilePath/);
  assert.match(table, /tone="pending"/);
  assert.match(table, /tabular-nums/);
  assert.match(table, /border-border-subtle/);
  assert.match(table, /ui-inset-row/);
  assert.match(table, /aria-sort/);
  assert.match(table, /ChevronUp/);
  assert.match(table, /ChevronDown/);
  assert.match(table, /useState<SortColumn>\('shifts'\)/);
  assert.match(table, /useState<SortDirection>\('desc'\)/);
  assert.match(table, /setSortDirection\(\(current\) => \(current === 'asc' \? 'desc' : 'asc'\)\)/);
  assert.match(table, /questionId="workers-grouping-order"/);
  assert.doesNotMatch(table, /useSearchParams|localStorage|sessionStorage/);
});

test('grouping Workers default sort preserves the groupingWorkers rank', () => {
  const workers = groupingWorkers();
  const locationTotal = descendantLocationIds(GROUPING).length;

  assert.ok(workers.length > 0);
  assert.ok(locationTotal > 0);
  assert.ok(workers.every((worker) => worker.locations.length <= locationTotal));

  for (let index = 1; index < workers.length; index += 1) {
    const previous = workers[index - 1];
    const current = workers[index];
    assert.ok(
      previous.shiftCount > current.shiftCount ||
        (previous.shiftCount === current.shiftCount &&
          (previous.locations.length > current.locations.length ||
            (previous.locations.length === current.locations.length &&
              previous.name.localeCompare(current.name) <= 0))),
      `${previous.name} should rank ahead of ${current.name}`,
    );
  }
});

test('grouping Workers house names show the top three then and N more', () => {
  const worker = groupingWorkers().find((entry) => entry.locations.length > 3);
  assert.ok(worker, 'expected a real worker with history at more than three houses');
  const names = [...worker.locations]
    .sort(
      (first, second) =>
        second.bookingCount - first.bookingCount ||
        first.locationName.localeCompare(second.locationName),
    )
    .map((location) => location.locationName);

  assert.equal(
    namedLocationList(names, 3),
    `${names.slice(0, 3).join(', ')} and ${names.length - 3} more`,
  );
});

test('location Workers keeps search across all three location-relative tiers', () => {
  const workers = source('../src/pages/Workers.tsx');

  assert.match(workers, /locationWorkerTiers/);
  assert.match(workers, /Search workers/);
  assert.match(workers, /tiers\.nearby/);
  assert.match(workers, /matchesQuery/);
});
