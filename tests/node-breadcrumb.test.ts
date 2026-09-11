import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  breadcrumbTrail,
  childGroupings,
  findGrouping,
  findLocation,
  groupingPath,
  parentGroupingForLocation,
  rootGroupingsForOrganisation,
} from '../src/data/locations.ts';
import { PERSONAS } from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

function trailNames(
  groupingId: string,
  locationId: string | null,
  entryGroupingId: string,
): string[] {
  const grouping = findGrouping(groupingId);
  assert.ok(grouping, `${groupingId} should exist`);
  return breadcrumbTrail({
    grouping,
    location: locationId ? findLocation(locationId) : null,
    entryGroupingId,
  }).map(({ name }) => name);
}

test('grouping paths run from the root grouping to the current grouping', () => {
  const nested = findGrouping('careforce-caseload');
  const root = findGrouping('northern-sydney');
  assert.ok(nested && root);

  assert.deepEqual(
    groupingPath(nested).map(({ id }) => id),
    ['cpa-careforce', 'careforce-area', 'careforce-caseload'],
  );
  assert.deepEqual(
    groupingPath(root).map(({ id }) => id),
    ['cpa-sil', 'northern-sydney'],
  );
});

test('the breadcrumb renders every node between the active grouping and the location', () => {
  assert.deepEqual(trailNames('cpa-sil', 'dee-why-1', 'northern-sydney'), [
    'SIL',
    'Northern Sydney',
  ]);
  assert.deepEqual(trailNames('careforce-area', 'dee-why-1', 'careforce-caseload'), [
    'Careforce',
    'Careforce area',
    'Careforce caseload',
  ]);
  assert.deepEqual(trailNames('cpa-careforce', 'dee-why-1', 'careforce-caseload'), [
    'Careforce',
    'Careforce area',
    'Careforce caseload',
  ]);
});

test('a location with two parents renders the path matching the active node', () => {
  const parents = ['northern-sydney', 'careforce-caseload'];
  parents.forEach((parent) => {
    const location = findLocation('dee-why-1');
    assert.ok(location);
    assert.ok(findGrouping(parent)?.locationIds.includes(location.id));
  });

  assert.deepEqual(trailNames('northern-sydney', 'dee-why-1', 'northern-sydney'), [
    'SIL',
    'Northern Sydney',
  ]);
  assert.deepEqual(trailNames('careforce-caseload', 'dee-why-1', 'careforce-caseload'), [
    'Careforce',
    'Careforce area',
    'Careforce caseload',
  ]);
});

test('an ambiguous descent follows the branch the persona entered at', () => {
  assert.deepEqual(trailNames('careforce-area', 'north-ryde-1', 'careforce-northern-caseload'), [
    'Careforce',
    'Careforce area',
    'Careforce Northern caseload',
  ]);
  assert.deepEqual(trailNames('careforce-area', 'north-ryde-1', 'careforce-caseload'), [
    'Careforce',
    'Careforce area',
    'Careforce caseload',
  ]);
});

test('an active grouping that does not hold the location falls back to the entry path', () => {
  assert.deepEqual(trailNames('northern-lifestyles', 'dee-why-1', 'northern-sydney'), [
    'SIL',
    'Northern Sydney',
  ]);
});

test('every persona at a location sees the path down from their entry node', () => {
  PERSONAS.filter((persona) => persona.entry.nodeType === 'location').forEach((persona) => {
    const trail = trailNames(
      persona.entry.groupingId,
      persona.entry.locationId ?? null,
      persona.entry.groupingId,
    );
    const entry = findGrouping(persona.entry.groupingId);
    assert.ok(entry, `${persona.name} should have an entry grouping`);
    assert.equal(trail[trail.length - 1], entry.name, `${persona.name} ends at their entry node`);
    assert.deepEqual(
      trail.slice(0, groupingPath(entry).length),
      groupingPath(entry).map(({ name }) => name),
      `${persona.name} keeps every ancestor of their entry node`,
    );
  });
});

test('the grouping a location opens under prefers the active node, then the entry node', () => {
  assert.equal(
    parentGroupingForLocation('dee-why-1', {
      currentGroupingId: 'careforce-caseload',
      entryGroupingId: 'northern-sydney',
      organisation: 'Cerebral Palsy Alliance',
    }),
    'careforce-caseload',
  );
  assert.equal(
    parentGroupingForLocation('dee-why-1', {
      currentGroupingId: 'northern-lifestyles',
      entryGroupingId: 'careforce-caseload',
      organisation: 'Cerebral Palsy Alliance',
    }),
    'careforce-caseload',
  );
  assert.equal(
    parentGroupingForLocation('dee-why-1', {
      currentGroupingId: null,
      entryGroupingId: null,
      organisation: 'Cerebral Palsy Alliance',
    }),
    'northern-sydney',
  );
  assert.equal(
    parentGroupingForLocation('galston-1', {
      currentGroupingId: 'careforce-caseload',
      entryGroupingId: 'careforce-caseload',
      organisation: 'Cerebral Palsy Alliance',
    }),
    'careforce-northern-caseload',
    'a location outside the entry node still opens inside the entry arm',
  );
  assert.equal(
    parentGroupingForLocation('dee-why-1', {
      currentGroupingId: 'lwb-greater-sydney',
      entryGroupingId: 'lwb-greater-sydney',
      organisation: 'Life Without Barriers',
    }),
    null,
  );
});

test('the breadcrumb carries organisation, arm, grouping, and location', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(breadcrumb, /aria-label="Breadcrumb"/);
  assert.match(breadcrumb, /breadcrumbTrail\(\{/);
  assert.match(breadcrumb, /entryGroupingId/);
  assert.doesNotMatch(breadcrumb, /groupingPath\(grouping\)/);
  assert.match(breadcrumb, /onSelectGrouping/);
  assert.match(breadcrumb, /onSelectLocation/);
  assert.match(breadcrumb, /aria-current="page"/);
  assert.match(breadcrumb, /grouping\.organisation/);
  assert.match(breadcrumb, /segment\.name/);
  assert.match(breadcrumb, /location\.name/);
  assert.match(breadcrumb, /useKeyboardMenu/);
  assert.match(breadcrumb, /aria-haspopup="menu"/);
  assert.match(breadcrumb, /ChevronDown/);
});

test('breadcrumb menus keep both models behind a named constant', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(
    breadcrumb,
    /export const BREADCRUMB_MENU_MODE: 'siblings' \| 'children' = 'siblings'/,
  );
  assert.match(breadcrumb, /function siblingItems/);
  assert.match(breadcrumb, /function childItems/);
  assert.match(
    breadcrumb,
    /BREADCRUMB_MENU_MODE === 'children'[\s\S]*\? childItems[\s\S]*: siblingItems/,
  );
  assert.match(breadcrumb, /items\.length > 1/);
});

test('a crumb menu contains siblings from its parent and no descendants', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const area = findGrouping('careforce-area');
  assert.ok(area);

  assert.deepEqual(
    childGroupings(area).map(({ id }) => id),
    [
      'careforce-caseload',
      'careforce-northern-caseload',
      'careforce-western-caseload',
      'careforce-hunter-caseload',
      'careforce-illawarra-caseload',
    ],
    'Rachel sees the other caseloads, not locations below any caseload',
  );
  assert.ok(
    childGroupings(area).every((sibling) => sibling.locationIds.length > 0),
    'the caseload siblings have descendants that must not become menu rows',
  );

  const siblingPath = breadcrumb.slice(
    breadcrumb.indexOf('function siblingItems'),
    breadcrumb.indexOf('function childItems'),
  );
  assert.match(siblingPath, /childGroupings\(parent\)/);
  assert.match(siblingPath, /parent\.locationIds/);
  assert.match(siblingPath, /grouping: item/);
  assert.match(siblingPath, /location: item/);
  assert.doesNotMatch(siblingPath, /descendantLocationIds/);
});

test('Sofia at Dee Why sees only direct supportables in her caseload menu', () => {
  const caseload = findGrouping('careforce-caseload');
  assert.ok(caseload);

  const siblingNames = caseload.locationIds
    .map((id) => findLocation(id))
    .filter((item) => item !== null)
    .map(({ name }) => name)
    .sort((a, b) => a.localeCompare(b));

  assert.ok(siblingNames.includes('Dee Why 1'));
  assert.ok(siblingNames.includes('Lane Cove 1'));
  assert.ok(siblingNames.includes('Maya Nguyen'));
  assert.equal(siblingNames.length, caseload.locationIds.length);
});

test('a children menu lists the crumb\'s nested nodes and never descendants below them', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const arm = findGrouping('cpa-careforce');
  const caseload = findGrouping('careforce-caseload');
  assert.ok(arm && caseload);

  assert.deepEqual(childGroupings(arm).map(({ id }) => id), ['careforce-area']);
  assert.equal(arm.locationIds.length, 0);
  assert.equal(caseload.groupingIds?.length ?? 0, 0);
  assert.ok(caseload.locationIds.includes('dee-why-1'));
  assert.ok(caseload.locationIds.includes('lane-cove-1'));

  const childPath = breadcrumb.slice(breadcrumb.indexOf('function childItems'));
  assert.match(childPath, /childGroupings\(grouping\)/);
  assert.match(childPath, /grouping\.locationIds/);
  assert.doesNotMatch(childPath, /descendantLocationIds/);
});

test('a location crumb never opens, because it has no children', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const childPath = breadcrumb.slice(
    breadcrumb.indexOf('function childItems'),
    breadcrumb.indexOf('function menuItemsFor'),
  );

  assert.match(childPath, /if \(location\?\.id === crumb\.id\) return \[\]/);
  assert.match(breadcrumb, /items\.length > 0/);
});

test('children menu rows name the node and what it is', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(breadcrumb, /groupingContentsSummary\(item\.grouping\)/);
  assert.match(breadcrumb, /serviceTypeLabel\(/);
  assert.match(breadcrumb, /item\.location\.serviceType/);
  assert.match(breadcrumb, /item\.location\.sector/);
  assert.match(breadcrumb, /\{item\.location\.suburb\}/);
  assert.match(breadcrumb, /mt-1 block text-xs text-text-secondary/);
  assert.doesNotMatch(breadcrumb, /LocationMarker/);
});

test('the organisation crumb opens its arms under the children model', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const arms = rootGroupingsForOrganisation('Cerebral Palsy Alliance');

  assert.deepEqual(
    arms.map(({ id }) => id).sort(),
    ['cpa-careforce', 'cpa-lifestyles', 'cpa-sil'],
  );

  const childPath = breadcrumb.slice(
    breadcrumb.indexOf('function childItems'),
    breadcrumb.indexOf('function menuItemsFor'),
  );
  assert.match(childPath, /rootGroupingsForOrganisation\(organisation\)/);
  assert.doesNotMatch(
    childPath,
    /if \(crumb\.role === 'organisation'\) return \[\]/,
  );
});

test('the organisation crumb has no sibling menu because organisation is a boundary', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const siblingPath = breadcrumb.slice(
    breadcrumb.indexOf('function siblingItems'),
    breadcrumb.indexOf('function childItems'),
  );

  assert.match(siblingPath, /if \(crumb.role === 'organisation' \|\| crumb.id === 'organisation'\) return \[\]/);
});

test('breadcrumb menus reuse the account menu behaviour and cap their rows', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(breadcrumb, /const BREADCRUMB_MENU_LIMIT = 20/);
  assert.match(breadcrumb, /useKeyboardMenu\(\)/);
  assert.match(breadcrumb, /menu\.onTriggerKeyDown/);
  assert.match(breadcrumb, /menu\.onMenuKeyDown/);
  assert.match(breadcrumb, /menu\.open \? 'rotate-180'/);
  assert.match(breadcrumb, /role="menu"/);
  assert.match(breadcrumb, /role="menuitem"/);
  assert.match(breadcrumb, /moreCount/);
  assert.match(breadcrumb, /more/);
  assert.doesNotMatch(breadcrumb, /type="search"|HeaderSearch/);
});

test('the truncation ellipsis opens the ancestors it replaced', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(breadcrumb, /function EllipsisMenu/);
  assert.match(breadcrumb, /hiddenCrumbs/);
  assert.match(breadcrumb, /aria-label="Show hidden breadcrumb ancestors"/);
  assert.match(breadcrumb, /onSelectGrouping/);
});

test('the breadcrumb uses the location name without a redundant marker', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const marker = source('../src/components/LocationMarker.tsx');

  assert.match(breadcrumb, /location\.name/);
  assert.doesNotMatch(breadcrumb, /LocationMarker/);
  assert.match(marker, /sm: 'h-7 w-7 rounded-lg'/);
  assert.match(marker, /\{initials\(location\.name\)\}/);
  assert.doesNotMatch(marker, /size === 'inline'|slice\(0, 1\)/);
});

test('the header restores the breadcrumb and logo divider', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /NodeBreadcrumb/);
  assert.match(header, /entryGroupingId=\{persona\.entry\.groupingId\}/);
  assert.match(header, /onSelectLocation=\{onSelectSearchLocation\}/);
  assert.match(header, /h-6 w-px[^"]*bg-border-subtle/);
  assert.doesNotMatch(header, /LocationSwitcher/);
});
