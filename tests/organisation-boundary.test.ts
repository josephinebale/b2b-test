import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  GROUPINGS,
  LOCATIONS,
  findLocationForOrganisation,
  getLocationData,
  locationHistoryForWorker,
  locationWorkerTiers,
} from '../src/data/locations.ts';
import {
  ORGANISATIONS,
  personasForOrganisation,
  personaById,
} from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('the moderator persona picker covers every organisation after the node menu is removed', () => {
  const picker = source('../src/components/PageVariantToggle.tsx');

  assert.match(picker, /ORGANISATIONS\.map/);
  assert.match(picker, /personasForOrganisation\(organisation\)\.map/);
  for (const organisation of ORGANISATIONS) {
    assert.ok(personasForOrganisation(organisation).length > 0);
    assert.ok(
      GROUPINGS.filter(
        (grouping) => grouping.organisation === organisation,
      ).length > 0,
    );
  }
});

test('a CPA persona cannot select or list a Northcott location', () => {
  const persona = personaById('house-manager');
  const app = source('../src/App.tsx');
  const request = source('../src/pages/BookingRequest.tsx');
  const choose = source('../src/pages/ChooseLocation.tsx');

  assert.equal(
    findLocationForOrganisation('north-parramatta-1', persona.organisation),
    null,
  );
  assert.match(app, /findLocationForOrganisation/);
  assert.match(app, /persona\.organisation/);
  assert.match(app, /locations=\{organisationLocations\}/);
  assert.match(request, /locations\.map/);
  assert.doesNotMatch(request, /LOCATIONS\.map/);
  assert.match(choose, /locations\.map/);
  assert.doesNotMatch(choose, /LOCATIONS\.map/);
});

test('provider worker history belongs to one organisation only', () => {
  const workerOrganisations = new Map<string, Set<string>>();

  for (const location of LOCATIONS) {
    for (const worker of getLocationData(location.id).workers) {
      const organisations =
        workerOrganisations.get(worker.id) ?? new Set<string>();
      organisations.add(location.organisation);
      workerOrganisations.set(worker.id, organisations);
    }
  }

  assert.ok(workerOrganisations.size > 0);
  for (const [workerId, organisations] of workerOrganisations) {
    assert.equal(
      organisations.size,
      1,
      `${workerId} has provider history across ${[...organisations].join(', ')}`,
    );
    const [organisation] = organisations;
    assert.ok(
      locationHistoryForWorker(workerId).every((item) => {
        const location = LOCATIONS.find(
          (candidate) => candidate.id === item.locationId,
        );
        return location?.organisation === organisation;
      }),
    );
  }
});

test('the tier 3 marketplace stays shared across organisations', () => {
  const locations = ORGANISATIONS.map((organisation) =>
    LOCATIONS.find((location) => location.organisation === organisation),
  );
  assert.ok(locations.every(Boolean));

  const marketplaceIds = locations.map((location) =>
    locationWorkerTiers(location!.id).nearby.map((worker) => worker.id),
  );
  for (const ids of marketplaceIds.slice(1)) {
    assert.deepEqual(ids, marketplaceIds[0]);
  }
});
