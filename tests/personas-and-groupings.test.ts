import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildConversationsForLocation } from '../src/data/conversations.ts';
import {
  GROUPINGS,
  LOCATIONS,
  descendantLocationIds,
  findGrouping,
  getLocationData,
  groupingOpenRequests,
  groupingUsageLast7Days,
  groupingsForLocation,
  orderedGroupingsForMenu,
  pendingCountsForLocation,
} from '../src/data/locations.ts';
import {
  PERSONAS,
  personaById,
} from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('regions, lifestyles, caseloads, and areas use one recursive grouping model', () => {
  assert.equal(GROUPINGS.length, 10);
  const region = findGrouping('northern-sydney');
  const caseload = findGrouping('careforce-caseload');
  const secondCaseload = findGrouping('careforce-northern-caseload');
  const area = findGrouping('careforce-area');
  const lifestyles = findGrouping('northern-lifestyles');
  assert.ok(region && caseload && secondCaseload && area && lifestyles);
  assert.equal(region.name, 'Northern Sydney');
  assert.equal(caseload.name, 'Careforce caseload');
  assert.deepEqual(area.groupingIds, [
    'careforce-caseload',
    'careforce-northern-caseload',
  ]);
  assert.deepEqual(
    descendantLocationIds(area),
    [...new Set([...caseload.locationIds, ...secondCaseload.locationIds])],
  );
  assert.ok(
    descendantLocationIds(lifestyles).filter(
      (id) => LOCATIONS.find((location) => location.id === id)?.serviceType === 'centre',
    ).length >= 2,
  );
  assert.ok(
    descendantLocationIds(lifestyles).filter(
      (id) =>
        LOCATIONS.find((location) => location.id === id)?.serviceType === 'home-community',
    ).length >= 2,
  );

  const shared = region.locationIds.filter((id) => caseload.locationIds.includes(id));
  const regionOnly = region.locationIds.filter((id) => !caseload.locationIds.includes(id));
  const caseloadOnly = caseload.locationIds.filter((id) => !region.locationIds.includes(id));

  /* Some overlap is correct — a house really does have both parents — but most
     of each grouping has to be its own, or the two nodes read identically. */
  assert.ok(shared.length >= 2, 'some houses genuinely belong to both');
  assert.ok(regionOnly.length >= 3, 'the region holds houses the caseload does not');
  assert.ok(caseloadOnly.length >= 3, 'the caseload holds houses the region does not');
  assert.ok(
    shared.length * 2 <= region.locationIds.length &&
      shared.length * 2 <= caseload.locationIds.length,
    `shared houses should be the minority of each grouping; got ${shared.length}`,
  );

  for (const locationId of shared) {
    const parentIds = groupingsForLocation(locationId).map((grouping) => grouping.id);
    assert.ok(parentIds.includes('northern-sydney'));
    assert.ok(parentIds.includes('careforce-caseload'));
    assert.ok(parentIds.includes('careforce-area'));
  }
});

test('the node menu leads with the entry branch and keeps nested groupings recursive', () => {
  assert.deepEqual(
    orderedGroupingsForMenu('careforce-caseload').map((grouping) => grouping.id),
    [
      'careforce-area',
      'northern-sydney',
      'northern-lifestyles',
    ],
  );
  assert.deepEqual(
    orderedGroupingsForMenu('northern-sydney').map((grouping) => grouping.id),
    [
      'northern-sydney',
      'northern-lifestyles',
      'careforce-area',
    ],
  );
  assert.deepEqual(
    orderedGroupingsForMenu('northern-lifestyles').map((grouping) => grouping.id),
    [
      'northern-lifestyles',
      'northern-sydney',
      'careforce-area',
    ],
  );
  assert.deepEqual(
    orderedGroupingsForMenu('northcott-individual-services').map(
      (grouping) => grouping.id,
    ),
    [
      'northcott-individual-services',
      'northcott-sil-services',
    ],
  );
  assert.deepEqual(
    orderedGroupingsForMenu('lwb-northern-sydney').map((grouping) => grouping.id),
    ['lwb-greater-sydney'],
  );
});

test('switching grouping changes the scope on screen, including the requests list', () => {
  const region = findGrouping('northern-sydney');
  const caseload = findGrouping('careforce-caseload');
  assert.ok(region && caseload);

  const regionRequests = groupingOpenRequests(region.id);
  const caseloadRequests = groupingOpenRequests(caseload.id);
  assert.ok(regionRequests.length > 0 && caseloadRequests.length > 0);
  assert.notDeepEqual(
    regionRequests.map((request) => request.id),
    caseloadRequests.map((request) => request.id),
  );
  /* One stray unshared house is not enough: each list has to carry several
     requests the other node cannot see, or the two dashboards read the same. */
  const regionOnlyRequests = regionRequests.filter(
    (request) => !caseload.locationIds.includes(request.locationId),
  );
  const caseloadOnlyRequests = caseloadRequests.filter(
    (request) => !region.locationIds.includes(request.locationId),
  );
  assert.ok(
    regionOnlyRequests.length >= 3,
    `the region should list several requests the caseload cannot see; got ${regionOnlyRequests.length}`,
  );
  assert.ok(
    caseloadOnlyRequests.length >= 3,
    `the caseload should list several requests the region cannot see; got ${caseloadOnlyRequests.length}`,
  );

  assert.notDeepEqual(
    groupingUsageLast7Days(region.id).locations.map((item) => item.locationId),
    groupingUsageLast7Days(caseload.id).locations.map((item) => item.locationId),
  );
});

test('every caseload-only location is a complete differentiated location', () => {
  const region = findGrouping('northern-sydney');
  const caseload = findGrouping('careforce-caseload');
  assert.ok(region && caseload);
  const caseloadOnly = caseload.locationIds.filter(
    (id) => !region.locationIds.includes(id),
  );
  assert.ok(caseloadOnly.length >= 3);

  for (const locationId of caseloadOnly) {
    const data = getLocationData(locationId);
    assert.ok(
      data.workers.length >= 10 && data.workers.length <= 18,
      `${locationId} needs its own roster; got ${data.workers.length}`,
    );
    assert.ok(data.bookings.length > 0);
    assert.ok(buildConversationsForLocation(locationId).length > 0);
    if (data.location.serviceType === 'sil') {
      assert.ok(data.bookings.some((booking) => booking.sleepover));
    }
  }

  const counts = caseload.locationIds.map(pendingCountsForLocation);
  assert.ok(new Set(counts.map((item) => item.requests)).size >= 2);
  assert.ok(new Set(counts.map((item) => item.approvals)).size >= 3);
  assert.ok(new Set(counts.map((item) => item.messages)).size >= 3);
});

test('grouping rollups resolve recursively against the selected grouping', () => {
  for (const grouping of GROUPINGS) {
    const requests = groupingOpenRequests(grouping.id);
    const usage = groupingUsageLast7Days(grouping.id);
    assert.deepEqual(
      usage.locations.map((item) => item.locationId),
      descendantLocationIds(grouping),
    );
    assert.ok(
      requests.every((request) =>
        descendantLocationIds(grouping).includes(request.locationId),
      ),
    );
    assert.equal(
      usage.total,
      usage.locations.reduce((total, item) => total + item.bookingCount, 0),
    );
  }
});

test('the existing seven personas remain CPA disability identities at the same entry nodes', () => {
  const cpaPersonas = PERSONAS.filter(
    (persona) => persona.organisation === 'Cerebral Palsy Alliance',
  );
  assert.deepEqual(
    cpaPersonas.map(({ id, role, team, organisation, sector, entry }) => ({
      id,
      role,
      team,
      organisation,
      sector,
      entry,
    })),
    [
      {
        id: 'house-manager',
        role: 'House Manager',
        team: undefined,
        organisation: 'Cerebral Palsy Alliance',
        sector: 'disability',
        entry: {
          nodeType: 'location',
          locationId: 'dee-why-1',
          groupingId: 'northern-sydney',
        },
      },
      {
        id: 'regional-manager',
        role: 'Regional Manager',
        team: undefined,
        organisation: 'Cerebral Palsy Alliance',
        sector: 'disability',
        entry: { nodeType: 'grouping', groupingId: 'northern-sydney' },
      },
      {
        id: 'roster-coordinator',
        role: 'Roster Coordinator',
        team: 'Careforce',
        organisation: 'Cerebral Palsy Alliance',
        sector: 'disability',
        entry: { nodeType: 'grouping', groupingId: 'careforce-caseload' },
      },
      {
        id: 'team-leader',
        role: 'Team Leader',
        team: 'Lifestyles',
        organisation: 'Cerebral Palsy Alliance',
        sector: 'disability',
        entry: {
          nodeType: 'location',
          locationId: 'allambie-heights-day-program',
          groupingId: 'northern-lifestyles',
        },
      },
      {
        id: 'regional-lifestyles-manager',
        role: 'Regional Lifestyles Manager',
        team: 'Lifestyles',
        organisation: 'Cerebral Palsy Alliance',
        sector: 'disability',
        entry: { nodeType: 'grouping', groupingId: 'northern-lifestyles' },
      },
      {
        id: 'service-manager',
        role: 'Service Manager',
        team: 'Home and community',
        organisation: 'Cerebral Palsy Alliance',
        sector: 'disability',
        entry: {
          nodeType: 'location',
          locationId: 'forestville-home',
          groupingId: 'northern-lifestyles',
        },
      },
      {
        id: 'area-manager',
        role: 'Area Manager',
        team: 'Careforce',
        organisation: 'Cerebral Palsy Alliance',
        sector: 'disability',
        entry: { nodeType: 'grouping', groupingId: 'careforce-area' },
      },
    ],
  );
  assert.equal(new Set(PERSONAS.map((persona) => persona.name)).size, 12);
  const avatars = source('../src/data/avatars.ts');
  for (const persona of PERSONAS) {
    assert.match(avatars, new RegExp(`'${persona.name}':`));
  }
  const personaImages = PERSONAS.map((persona) => {
    const match = avatars.match(new RegExp(`'${persona.name}': (\\w+)`));
    return match?.[1];
  });
  assert.equal(new Set(personaImages).size, 12);
  assert.equal(personaById('unknown').id, 'house-manager');
});

test('persona switching is moderator-only, changes entry, and roles do not gate access', () => {
  const app = source('../src/App.tsx');
  const header = source('../src/components/AppHeader.tsx');
  const personaControl = source('../src/components/PageVariantToggle.tsx');
  const dock = source('../src/components/SessionQuestions.tsx');
  const session = source('../src/lib/session.ts');

  assert.match(app, /switchPersona/);
  assert.match(app, /persona\.entry\.nodeType/);
  assert.match(app, /persona\.entry\.groupingId/);
  assert.match(app, /<SessionQuestions[\s\S]*onSwitchPersona=\{switchPersona\}/);
  assert.doesNotMatch(header, /persona\.id ===|persona\.role ===/);

  assert.match(header, /persona\.name/);
  assert.match(header, /persona\.role/);
  assert.match(header, /<Avatar name=\{persona\.name\}/);

  assert.match(personaControl, /onSwitchPersona/);
  assert.match(personaControl, /useKeyboardMenu/);
  assert.match(personaControl, /role="menu"/);
  assert.match(personaControl, /role="menuitem"/);
  assert.match(personaControl, /ORGANISATIONS\.map/);
  assert.match(personaControl, /personasForOrganisation\(organisation\)/);
  assert.match(personaControl, /persona\.name/);
  assert.match(personaControl, /persona\.role/);
  assert.match(personaControl, /<IconButton/);
  /* The persona menu sits in the one moderator dock rather than positioning
     itself in a second corner. */
  assert.match(dock, /session-questions-controls/);
  assert.match(dock, /<PageVariantToggle/);
  assert.doesNotMatch(personaControl, /session-questions-dock|page-variant-control/);
  assert.doesNotMatch(personaControl, /<select/);
  assert.doesNotMatch(personaControl, /Switch to/);
  const closedTrigger = personaControl.slice(
    personaControl.indexOf('<IconButton'),
    personaControl.indexOf('{menu.open'),
  );
  assert.doesNotMatch(
    closedTrigger,
    /Helen|Marcus|Sofia|Dawson|Lee|Patel|House Manager|Regional Manager|Roster Coordinator/,
  );
  assert.doesNotMatch(closedTrigger, /data-tooltip/);
  assert.doesNotMatch(closedTrigger, /ui-tooltip/);

  assert.match(session, /hm\.personaId/);
  assert.match(session, /hm\.lastGroupingId/);
  assert.match(session, /clearSession[\s\S]*PERSONA_KEY/);
  assert.match(session, /clearLastLocationId[\s\S]*GROUPING_KEY/);
  assert.match(session, /clearSession[\s\S]*clearLastLocationId\(\)/);
});

test('the node switcher leads with the persona’s entry grouping and nests locations under each parent', () => {
  const switcher = source('../src/components/LocationSwitcher.tsx');
  const header = source('../src/components/AppHeader.tsx');
  const dashboard = source('../src/pages/Dashboard.tsx');
  const app = source('../src/App.tsx');

  assert.match(header, /<LocationSwitcher[\s\S]*persona=\{persona\}/);
  assert.match(switcher, /orderedGroupingsForMenu\(persona\.entry\.groupingId\)/);
  assert.match(switcher, /onSelectGrouping\(grouping\.id\)/);
  assert.match(switcher, /grouping\.locationIds\.map/);
  assert.match(switcher, /onSelect\(option\.id, grouping\.id\)/);
  assert.doesNotMatch(switcher, /GROUPINGS\.map/);
  assert.doesNotMatch(switcher, /LOCATIONS\.map/);
  assert.match(dashboard, /partitionGroupingLocations\(grouping\)/);
  assert.match(dashboard, /groupingOpenRequests\(grouping\.id\)/);
  assert.match(dashboard, /groupingUsageLast7Days\(grouping\.id\)/);
  assert.match(app, /preferredGroupingId/);
});

test('Your account follows the signed-in persona without changing its structure', () => {
  const app = source('../src/App.tsx');
  const settings = source('../src/pages/Settings.tsx');

  assert.match(app, /<YourAccountSettings path=\{path\} persona=\{persona\} \/>/);
  assert.match(settings, /function Account\(\{ persona \}/);
  assert.match(settings, /<Avatar name=\{persona\.name\}/);
  assert.match(settings, /persona\.name[\s\S]*toLowerCase/);
  assert.match(
    settings,
    /export function YourAccountSettings\(\{\s*path,\s*persona,\s*\}/,
  );
});
