import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACCOUNT_SECTIONS,
  CAN_EDIT_ORGANISATION_DETAILS,
  LOCATION_SECTIONS,
  MANAGER_NAME,
  NODE_NAV_ITEMS,
  ORGANISATION_NAME,
  ORGANISATION_SECTIONS,
  PERSONAL_MENU_ITEMS,
  ROUTES,
  groupingHasDefinedOverview,
  menuIndexAfterKey,
  nodeLandingPath,
  sectionFromPath,
  treeSectionLabel,
  visibleMainNavItems,
} from '../src/lib/informationArchitecture.ts';
import {
  findGrouping,
  groupingChildListTabLabel,
} from '../src/data/locations.ts';

test('settings sections are split by scope without changing existing labels', () => {
  assert.deepEqual(LOCATION_SECTIONS.map(({ label }) => label), [
    'Location profile',
    'Support worker preferences',
    'Support plan',
    'Location name',
    'People',
  ]);
  assert.deepEqual(ORGANISATION_SECTIONS.map(({ label }) => label), [
    'Organisation details',
    'Financial details',
    'Documents',
    'People',
  ]);
  assert.deepEqual(ACCOUNT_SECTIONS.map(({ label }) => label), ['Account']);
});

test('the account menu exposes person and organisation settings together', () => {
  assert.deepEqual(PERSONAL_MENU_ITEMS, [
    { label: 'Your account', path: '/your-account' },
    { label: 'Organisation settings', path: '/organisation-settings' },
  ]);
});

test('both node types have a complete second-tier navigation', () => {
  const mainLabelsFor = (nodeType: 'grouping' | 'location' | 'organisation') =>
    NODE_NAV_ITEMS.filter(
      (item) =>
        item.placement === 'main' &&
        item.nodeTypes.some((itemNodeType) => itemNodeType === nodeType),
    ).map(({ label }) => label);

  assert.deepEqual(mainLabelsFor('location'), [
    'Bookings',
    'Workers',
    'Messages',
    'Location settings',
  ]);
  assert.deepEqual(mainLabelsFor('grouping'), [
    'Child list',
    'Overview',
    'Workers',
  ]);
  assert.deepEqual(mainLabelsFor('organisation'), ['Supportables', 'Overview']);
  assert.ok(
    NODE_NAV_ITEMS.some(
      (item) =>
        item.label === 'Supportables' &&
        item.path === '/supportables' &&
        item.nodeTypes.includes('organisation'),
    ),
  );
  assert.ok(
    NODE_NAV_ITEMS.some(
      (item) =>
        item.path === '/supportables' && item.nodeTypes.includes('grouping'),
    ),
  );
  assert.ok(
    !NODE_NAV_ITEMS.some(
      (item) =>
        item.label === 'Supportables' && item.nodeTypes.includes('grouping'),
    ),
  );
  assert.ok(!NODE_NAV_ITEMS.some((item) => item.label === 'Jobs'));
  assert.ok(
    !NODE_NAV_ITEMS.some((item) => item.label === 'Notification preferences'),
  );
});

test('the tree section is named by whether the node holds groupings or locations', () => {
  const sil = findGrouping('cpa-sil');
  const northernSydney = findGrouping('northern-sydney');
  const careforceArea = findGrouping('careforce-area');
  assert.ok(sil && northernSydney && careforceArea);

  assert.equal(treeSectionLabel(sil, 'grouping'), 'Groupings');
  assert.equal(treeSectionLabel(northernSydney, 'grouping'), 'Supportables');
  assert.equal(treeSectionLabel(careforceArea, 'grouping'), 'Groupings');
  assert.equal(treeSectionLabel(sil, 'organisation'), 'Groupings');

  const model = readFileSync(
    new URL('../src/lib/informationArchitecture.ts', import.meta.url),
    'utf8',
  );
  assert.match(model, /path: '\/supportables'/);
  assert.match(
    model,
    /label: 'Supportables',[\s\S]*?path: '\/supportables'/,
  );
});

test('landing follows whether direct children include locations', () => {
  const arm = findGrouping('cpa-sil');
  const northernSydney = findGrouping('northern-sydney');
  const careforceArea = findGrouping('careforce-area');
  const careforceCaseload = findGrouping('careforce-caseload');
  assert.ok(arm && northernSydney && careforceArea && careforceCaseload);
  assert.equal(arm.kind, 'arm');

  assert.equal(nodeLandingPath('organisation'), '/supportables');
  assert.equal(nodeLandingPath('location'), '/bookings');
  assert.equal(nodeLandingPath('grouping', northernSydney), '/');
  assert.equal(nodeLandingPath('grouping', careforceCaseload), '/');
  assert.equal(nodeLandingPath('grouping', arm), '/supportables');
  assert.equal(nodeLandingPath('grouping', careforceArea), '/supportables');

  assert.equal(groupingHasDefinedOverview(northernSydney), true);
  assert.equal(groupingHasDefinedOverview(arm), false);
  assert.equal(groupingHasDefinedOverview(careforceArea), false);
});

test('grouping child-list tab labels follow direct children, never Supportables', () => {
  const sil = findGrouping('cpa-sil');
  const careforce = findGrouping('cpa-careforce');
  const careforceArea = findGrouping('careforce-area');
  const newcastle = findGrouping('newcastle');
  const northernLifestyles = findGrouping('northern-lifestyles');
  const northernSydney = findGrouping('northern-sydney');
  assert.ok(
    sil && careforce && careforceArea && newcastle && northernLifestyles && northernSydney,
  );

  assert.equal(groupingChildListTabLabel(sil), 'Groupings');
  assert.equal(groupingChildListTabLabel(careforce), 'Groupings');
  assert.equal(groupingChildListTabLabel(careforceArea), 'Groupings');
  assert.equal(groupingChildListTabLabel(newcastle), 'Houses');
  assert.equal(groupingChildListTabLabel(northernLifestyles), 'Centres and clients');
  assert.equal(groupingChildListTabLabel(northernSydney), 'Houses and centres');
  assert.equal(
    groupingChildListTabLabel(findGrouping('careforce-northern-caseload')!),
    'Houses and clients',
  );
  assert.equal(
    groupingChildListTabLabel(findGrouping('western-lifestyles')!),
    'Centres and clients',
  );

  assert.deepEqual(
    visibleMainNavItems('grouping', northernSydney).map((item) => item.path),
    ['/', '/workers'],
  );
  assert.deepEqual(
    visibleMainNavItems('grouping', sil).map((item) => item.path),
    ['/supportables', '/', '/workers'],
  );
  assert.deepEqual(
    visibleMainNavItems('organisation', sil).map((item) => item.path),
    ['/supportables', '/'],
  );
});

test('an arm reuses the grouping face instead of adding a node type', () => {
  const session = readFileSync(
    new URL('../src/lib/session.ts', import.meta.url),
    'utf8',
  );

  assert.match(
    session,
    /export type NodeType = 'grouping' \| 'location' \| 'organisation'/,
  );
  assert.doesNotMatch(session, /NodeType[\s\S]*?'arm'/);
  assert.ok(
    NODE_NAV_ITEMS.every((item) =>
      item.nodeTypes.every(
        (nodeType) =>
          nodeType === 'grouping' ||
          nodeType === 'location' ||
          nodeType === 'organisation',
      ),
    ),
  );
  assert.ok(
    NODE_NAV_ITEMS.every((item) =>
      item.nodeTypes.every((nodeType) => nodeType !== 'arm'),
    ),
  );
});

test('client settings are named for the person in the location navigation', () => {
  const header = readFileSync(
    new URL('../src/components/AppHeader.tsx', import.meta.url),
    'utf8',
  );

  assert.match(
    header,
    /location\?\.serviceType === 'home-community'[\s\S]*?`\$\{location\.name\} settings`/,
  );
});

test('the account menu is persona identity, account destination, divider, then log out', () => {
  const header = readFileSync(
    new URL('../src/components/AppHeader.tsx', import.meta.url),
    'utf8',
  );

  const menu = header.slice(header.indexOf('{accountMenu.open &&'));
  assert.match(menu, /\{persona\.name\}/);
  assert.match(menu, /\{persona\.role\}/);
  assert.match(menu, /persona\.team/);
  assert.match(header, /PERSONAL_MENU_ITEMS\.map/);
  assert.match(header, /role="separator"/);
  assert.doesNotMatch(header, /ACCOUNT_ICONS|<LogOut/);
});

test('each settings scope has one route and a stable default section', () => {
  assert.deepEqual(ROUTES, {
    manageLocation: '/manage-location',
    organisationSettings: '/organisation-settings',
    yourAccount: '/your-account',
  });
  assert.equal(sectionFromPath('/manage-location', LOCATION_SECTIONS), 'profile');
  assert.equal(sectionFromPath('/manage-location/people', LOCATION_SECTIONS), 'people');
  assert.equal(sectionFromPath('/manage-location/location-name', LOCATION_SECTIONS), 'location-name');
  assert.equal(sectionFromPath('/manage-house/house-name', LOCATION_SECTIONS), 'location-name');
  assert.equal(sectionFromPath('/your-account/privacy', ACCOUNT_SECTIONS), 'account');
});

test('organisation editing is controlled by one flag', () => {
  assert.equal(CAN_EDIT_ORGANISATION_DETAILS, false);
  assert.equal(ORGANISATION_NAME, 'Cerebral Palsy Alliance');
  assert.equal(MANAGER_NAME, 'Helen Dawson');
});

test('organisation settings follow the selected node’s organisation name', () => {
  const settingsSource = readFileSync(
    new URL('../src/pages/Settings.tsx', import.meta.url),
    'utf8',
  );
  assert.match(settingsSource, /useState\(organisationName\)/);
  assert.match(settingsSource, /organisationName=\{data\.location\.organisation\}/);
  assert.doesNotMatch(settingsSource, /Hireup Demonstration Co/);
});

test('the account page folds photo and password fields into one section', () => {
  const settingsSource = readFileSync(
    new URL('../src/pages/Settings.tsx', import.meta.url),
    'utf8',
  );
  const account = settingsSource.slice(
    settingsSource.indexOf('function Account('),
    settingsSource.indexOf('function SupportPlan'),
  );

  assert.match(account, /Email address/);
  assert.match(account, /Profile photo/);
  assert.match(account, /<Avatar name=\{persona\.name\}/);
  assert.match(account, /Choose file/);
  assert.match(account, /label="Password"/);
  assert.doesNotMatch(settingsSource, /function AboutYou|function ProfilePicture|function PrivacySettings|function Password/);
});

test('location settings exclude consumer matching, COVID, and picture sections', () => {
  const settingsSource = readFileSync(
    new URL('../src/pages/Settings.tsx', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(
    settingsSource,
    /function CovidRequirements|function LocationPicture|case 'support-areas'|case 'specialised'|case 'covid'|case 'location-picture'/,
  );
});

test('the account menu keeps organisation settings beside Your account', () => {
  const header = readFileSync(
    new URL('../src/components/AppHeader.tsx', import.meta.url),
    'utf8',
  );

  const menu = header.slice(header.indexOf('{accountMenu.open &&'));
  assert.match(menu, /PERSONAL_MENU_ITEMS\.map/);
  assert.doesNotMatch(menu, /ROUTES\.organisationSettings|Building2/);
});

test('arrow keys wrap through menu items', () => {
  assert.equal(menuIndexAfterKey(0, 'ArrowDown', 3), 1);
  assert.equal(menuIndexAfterKey(2, 'ArrowDown', 3), 0);
  assert.equal(menuIndexAfterKey(0, 'ArrowUp', 3), 2);
  assert.equal(menuIndexAfterKey(1, 'Home', 3), 0);
  assert.equal(menuIndexAfterKey(1, 'End', 3), 2);
  assert.equal(menuIndexAfterKey(1, 'Escape', 3), null);
});
