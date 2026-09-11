import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  nearbyWorkers,
  searchOrganisation,
} from '../src/data/locations.ts';
import { ORGANISATIONS } from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('an empty query returns no global-search results', () => {
  assert.deepEqual(searchOrganisation('   ', 'Cerebral Palsy Alliance'), {
    supportables: [],
    clients: [],
    workers: [],
    groupings: [],
  });
});

test('global search uses plain substrings and groups results by kind', () => {
  const supportables = searchOrganisation(
    'dee why',
    'Cerebral Palsy Alliance',
  );
  assert.ok(
    supportables.supportables.some((location) => location.id === 'dee-why-1'),
  );

  const clients = searchOrganisation('maya', 'Cerebral Palsy Alliance');
  assert.deepEqual(
    clients.clients.map((location) => location.id),
    ['forestville-home'],
  );
  assert.equal(
    searchOrganisation('forestville', 'Cerebral Palsy Alliance').clients.length,
    0,
    'clients match by name, not suburb',
  );

  const groupings = searchOrganisation('careforce', 'Cerebral Palsy Alliance');
  assert.ok(groupings.groupings.some((grouping) => grouping.id === 'cpa-careforce'));
  assert.ok(
    groupings.groupings.some(
      (grouping) => grouping.id === 'careforce-caseload',
    ),
  );

  const workers = searchOrganisation('eleni', 'Cerebral Palsy Alliance');
  assert.ok(workers.workers.length > 0);
  assert.ok(workers.workers.every((worker) => worker.totalHours >= 0));
  assert.ok(workers.workers.every((worker) => worker.locationId));
});

test('global search never crosses the signed-in organisation boundary', () => {
  for (const organisation of ORGANISATIONS) {
    const results = searchOrganisation('a', organisation);
    assert.ok(
      [...results.supportables, ...results.clients].every(
        (location) => location.organisation === organisation,
      ),
    );
    assert.ok(
      results.groupings.every(
        (grouping) => grouping.organisation === organisation,
      ),
    );
    assert.ok(
      results.workers.every(
        (worker) => worker.organisation === organisation,
      ),
    );
  }

  assert.equal(
    searchOrganisation('Greater Sydney', 'Cerebral Palsy Alliance').groupings
      .length,
    0,
  );
});

test('marketplace-only workers never appear in global search', () => {
  for (const marketplaceWorker of nearbyWorkers()) {
    for (const organisation of ORGANISATIONS) {
      assert.equal(
        searchOrganisation(marketplaceWorker.name, organisation).workers.some(
          (worker) => worker.id === marketplaceWorker.id,
        ),
        false,
      );
    }
  }
});

test('header search sits between the breadcrumb and Notifications at every node', () => {
  const header = source('../src/components/AppHeader.tsx');
  const search = source('../src/components/HeaderSearch.tsx');
  const app = source('../src/App.tsx');

  assert.match(search, /export const HEADER_SEARCH_VISIBLE = false/);
  assert.match(header, /HEADER_SEARCH_VISIBLE &&/);
  assert.match(header, /<HeaderSearch/);
  assert.ok(
    header.indexOf('<NodeBreadcrumb') < header.indexOf('<HeaderSearch') &&
      header.indexOf('<HeaderSearch') <
        header.indexOf('href={href(NOTIFICATIONS_NODE_ITEM.path)}'),
  );
  assert.match(search, /searchOrganisation\(query, organisation\)/);
  assert.match(search, /h-9/);
  assert.match(search, /rounded border border-border/);
  assert.match(search, /title="Supportables"/);
  assert.match(search, /title="Clients"/);
  assert.match(search, /title="Workers"/);
  assert.match(search, /title="Groupings"/);
  assert.match(search, /serviceTypeLabel\(result\.serviceType, result\.sector\)/);
  assert.match(search, /\{result\.suburb\}/);
  assert.match(search, /\{result\.totalHours\} hours at this provider/);
  assert.match(search, /groupingContentsSummary\(result\)/);
  assert.match(search, /query\.trim\(\) !== ''/);
  assert.match(search, /No results for/);
  assert.match(app, /workerProfilePath\(workerId\)/);
  assert.match(app, /onSelectSearchLocation/);
  assert.match(app, /onSelectSearchWorker/);
  assert.doesNotMatch(search, /recent|fuzzy|global shortcut/i);
});
