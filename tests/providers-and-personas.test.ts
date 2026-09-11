import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildConversationsForLocation } from '../src/data/conversations.ts';
import {
  LOCATIONS,
  descendantLocationIds,
  findGrouping,
  getLocationData,
} from '../src/data/locations.ts';
import {
  ALL_ORGANISATIONS_VISIBLE,
  ORGANISATIONS,
  PERSONAS,
  VISIBLE_ORGANISATIONS,
  personasForOrganisation,
} from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('all twelve personas carry organisation and sector with the agreed entry node', () => {
  assert.deepEqual(ORGANISATIONS, [
    'Cerebral Palsy Alliance',
    'Northcott',
    'Life Without Barriers',
  ]);
  assert.equal(PERSONAS.length, 12);
  assert.ok(
    personasForOrganisation('Cerebral Palsy Alliance').every(
      (persona) => persona.sector === 'disability',
    ),
  );
  assert.equal(personasForOrganisation('Cerebral Palsy Alliance').length, 7);

  const northcott = personasForOrganisation('Northcott');
  assert.deepEqual(
    northcott.map(({ role, sector, entry }) => ({ role, sector, entry })),
    [
      {
        role: 'Service Coordinator',
        sector: 'disability',
        entry: {
          nodeType: 'grouping',
          groupingId: 'northcott-sil-services',
        },
      },
      {
        role: 'Coordinator, Individual Service',
        sector: 'disability',
        entry: {
          nodeType: 'grouping',
          groupingId: 'northcott-individual-services',
        },
      },
    ],
  );

  const lwb = personasForOrganisation('Life Without Barriers');
  assert.deepEqual(
    lwb.map(({ role, team, sector, entry }) => ({ role, team, sector, entry })),
    [
      {
        role: 'Rostering Officer',
        team: 'Reactive',
        sector: 'aged care',
        entry: {
          nodeType: 'grouping',
          groupingId: 'lwb-northern-sydney',
        },
      },
      {
        role: 'Rostering Officer',
        team: 'Forward planning',
        sector: 'aged care',
        entry: {
          nodeType: 'grouping',
          groupingId: 'lwb-northern-sydney',
        },
      },
      {
        role: 'Rostering Lead',
        team: undefined,
        sector: 'aged care',
        entry: {
          nodeType: 'grouping',
          groupingId: 'lwb-greater-sydney',
        },
      },
    ],
  );
  assert.deepEqual(lwb[0].entry, lwb[1].entry);
});

test('Northcott and Life Without Barriers sit behind one off flag', () => {
  const model = source('../src/lib/informationArchitecture.ts');
  const picker = source('../src/components/PageVariantToggle.tsx');
  const landing = source('../src/pages/SessionLanding.tsx');
  const ia = source('../src/pages/InformationArchitecture.tsx');
  const session = source('../src/lib/session.ts');
  const project = source('../PROJECT.md');

  assert.match(
    model,
    /export const ALL_ORGANISATIONS_VISIBLE = false/,
  );
  assert.equal(PERSONAS.length, 12);
  assert.equal(ORGANISATIONS.length, 3);
  assert.match(picker, /VISIBLE_ORGANISATIONS\.map/);
  assert.match(picker, /\{organisation\}/);
  assert.match(landing, /VISIBLE_ORGANISATIONS\.map/);
  assert.match(landing, /\{organisation\}/);
  assert.match(ia, /VISIBLE_ORGANISATIONS/);
  assert.match(session, /ALL_ORGANISATIONS_VISIBLE/);
  assert.match(session, /PERSONAS\.find/);
  assert.match(project, /ALL_ORGANISATIONS_VISIBLE/);

  if (!ALL_ORGANISATIONS_VISIBLE) {
    assert.deepEqual([...VISIBLE_ORGANISATIONS], ['Cerebral Palsy Alliance']);
    assert.equal(
      VISIBLE_ORGANISATIONS.flatMap(personasForOrganisation).length,
      7,
    );
  } else {
    assert.equal(VISIBLE_ORGANISATIONS.length, 3);
    assert.equal(
      VISIBLE_ORGANISATIONS.flatMap(personasForOrganisation).length,
      12,
    );
  }
});

test('the persona picker groups people by organisation rather than one flat list', () => {
  const picker = source('../src/components/PageVariantToggle.tsx');
  assert.match(picker, /VISIBLE_ORGANISATIONS\.map/);
  assert.match(picker, /personasForOrganisation\(organisation\)/);
  assert.match(picker, /\{organisation\}/);
  assert.doesNotMatch(picker, /\{PERSONAS\.map/);
});

test('Northcott has two SIL homes and a separate caseload of clients', () => {
  const sil = findGrouping('northcott-sil-services');
  const individual = findGrouping('northcott-individual-services');
  assert.ok(sil && individual);
  assert.equal(sil.locationIds.length, 2);
  assert.ok(
    sil.locationIds.every((id) => {
      const location = LOCATIONS.find((item) => item.id === id);
      return location?.organisation === 'Northcott' && location.serviceType === 'sil';
    }),
  );
  assert.ok(individual.locationIds.length >= 3);
  assert.ok(
    individual.locationIds.every((id) => {
      const location = LOCATIONS.find((item) => item.id === id);
      return (
        location?.organisation === 'Northcott' &&
        location.serviceType === 'home-community' &&
        location.providerSite === true &&
        location.participants.length === 1
      );
    }),
  );
});

test('Life Without Barriers is aged care with clients only and a lead above regions', () => {
  const lwbLocations = LOCATIONS.filter(
    (location) => location.organisation === 'Life Without Barriers',
  );
  assert.ok(lwbLocations.length >= 6);
  assert.ok(
    lwbLocations.every(
      (location) =>
        location.sector === 'aged care' &&
        location.serviceType === 'home-community' &&
        location.participants.length === 1 &&
        location.providerSite === false,
    ),
  );

  const region = findGrouping('lwb-northern-sydney');
  const lead = findGrouping('lwb-greater-sydney');
  assert.ok(region && lead);
  assert.ok(region.locationIds.length >= 3);
  assert.ok((lead.groupingIds?.length ?? 0) >= 2);
  assert.deepEqual(
    descendantLocationIds(lead).sort(),
    lwbLocations.map((location) => location.id).sort(),
  );
});

test('every new provider location has differentiated workers, bookings, and messages', () => {
  const locations = LOCATIONS.filter(
    (location) => location.organisation !== 'Cerebral Palsy Alliance',
  );
  const signatures = new Set<string>();
  for (const location of locations) {
    const data = getLocationData(location.id);
    assert.ok(data.workers.length >= 10 && data.workers.length <= 18);
    assert.ok(data.bookings.length > 0);
    assert.ok(buildConversationsForLocation(location.id).length > 0);
    signatures.add(
      [
        data.workers.length,
        data.requestsToAccept,
        data.bookingsToApprove,
        data.unreadMessages,
      ].join(':'),
    );
  }
  assert.ok(signatures.size >= 5, 'new provider rows should not all carry the same data');
});
