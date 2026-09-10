import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  LOCATIONS,
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

test('Workers replaces Team in navigation and public routes', () => {
  const app = source('../src/App.tsx');
  const header = source('../src/components/AppHeader.tsx');
  const router = source('../src/lib/router.ts');

  assert.equal(WORKERS_ROUTE, '/workers');
  assert.equal(workerProfilePath('eleni-p'), '/workers/eleni-p');
  assert.equal(workerIdFromPath('/workers/eleni-p'), 'eleni-p');
  assert.equal(workerIdFromPath('/workers'), null);
  assert.ok(
    NODE_NAV_ITEMS.some(
      (item) =>
        item.label === 'Workers' &&
        item.path === WORKERS_ROUTE &&
        item.nodeTypes.some((nodeType) => nodeType === 'grouping'),
    ),
  );
  assert.match(
    header,
    /NODE_NAV_ITEMS\.filter[\s\S]*?item\.nodeTypes\.some/,
  );
  assert.match(app, /<Workers/);
  assert.match(app, /nodeType="grouping"/);
  assert.match(router, /\/team/);
  assert.match(router, /\/workers/);
  assert.doesNotMatch(header, /label: 'Team'/);
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

test('grouping Workers ranks one provider population by shifts then locations', () => {
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
  assert.match(workers, /worker\.shiftCount/);
  assert.doesNotMatch(workers, /Paying at|pay level/i);
});

test('grouping Workers has one history population and search can reach nearby workers', () => {
  const workers = source('../src/pages/Workers.tsx');

  assert.match(workers, /nodeType === 'grouping'/);
  assert.match(workers, /groupingWorkers\(grouping\.id\)/);
  assert.match(workers, /nearbyWorkers\(\)/);
  assert.match(workers, /Everyone with booking history at/);
  assert.match(workers, /query/);
  assert.match(workers, /questionId="workers-grouping-order"/);
  assert.match(workers, /questionId="workers-location-tiers"/);
  assert.match(workers, /questionId="workers-search"/);
});
