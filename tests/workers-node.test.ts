import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  LOCATIONS,
  getLocationData,
  groupingWorkers,
  locationWorkerTiers,
  nearbyWorkers,
} from '../src/data/locations.ts';
import {
  WORKERS_ROUTE,
  workerIdFromPath,
  workerProfilePath,
} from '../src/lib/pageContent.ts';
import { NODE_NAV_ITEMS } from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('Workers is a location destination, not a grouping destination', () => {
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
  assert.deepEqual(item.nodeTypes, ['location']);
  assert.match(
    header,
    /NODE_NAV_ITEMS\.filter[\s\S]*?item\.nodeTypes\.some/,
  );
  assert.match(app, /<Workers/);
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

test('the grouping dashboard population ranks by shifts then locations', () => {
  const workers = groupingWorkers();

  assert.ok(workers.length > 0);
  assert.ok(workers.every((worker) => worker.locations.length > 0));
  assert.ok(workers.every((worker) => worker.shiftCount > 0));

  for (let index = 1; index < workers.length; index += 1) {
    const previous = workers[index - 1];
    const current = workers[index];
    assert.ok(
      previous.shiftCount > current.shiftCount ||
        (previous.shiftCount === current.shiftCount &&
          previous.locations.length >= current.locations.length),
      `${previous.name} should rank ahead of ${current.name}`,
    );
  }

  assert.ok(
    workers.some((worker) => worker.locations.length > 1),
    'the grouping population should include workers with history across locations',
  );
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

test('grouping workers move to the Dashboard without search or marketplace rows', () => {
  const workers = source('../src/pages/Workers.tsx');
  const panel = source('../src/pages/dashboard/WorkersPanel.tsx');
  const dashboard = source('../src/pages/Dashboard.tsx');

  assert.doesNotMatch(workers, /nodeType === 'grouping'|groupingWorkers\(/);
  assert.match(panel, /groupingWorkers\(grouping\.id\)/);
  assert.match(panel, /Ranked by completed shifts, then locations worked/);
  assert.match(
    panel,
    /\{worker\.totalHours\} hours[\s\S]*?\{supportPlanLabel\(worker\.planConfirmed\)\}[\s\S]*?\{assessmentSummary\(worker\.assessments\)\}/,
  );
  assert.match(panel, /needsAttentionClass\(!worker\.planConfirmed\)/);
  assert.doesNotMatch(panel, /nearbyWorkers|Search workers|MessageSquare|Calendar/);
  assert.match(panel, /questionId="workers-grouping-order"/);
  assert.match(dashboard, /<WorkersPanel grouping=\{grouping\}/);
  assert.match(workers, /questionId="workers-location-tiers"/);
  assert.match(workers, /questionId="workers-search"/);
});

test('location Workers keeps search across all three location-relative tiers', () => {
  const workers = source('../src/pages/Workers.tsx');

  assert.match(workers, /locationWorkerTiers/);
  assert.match(workers, /Search workers/);
  assert.match(workers, /tiers\.nearby/);
  assert.match(workers, /matchesQuery/);
});
