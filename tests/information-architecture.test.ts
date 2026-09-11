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
  menuIndexAfterKey,
  sectionFromPath,
} from '../src/lib/informationArchitecture.ts';

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
  assert.deepEqual(ACCOUNT_SECTIONS.map(({ label }) => label), [
    'Account',
  ]);
});

test('the account menu exposes person and organisation settings together', () => {
  assert.deepEqual(PERSONAL_MENU_ITEMS, [
    { label: 'Your account', path: '/your-account' },
    { label: 'Organisation settings', path: '/organisation-settings' },
  ]);
});

test('location navigation follows work frequency and grouping has only Dashboard', () => {
  const mainLabelsFor = (nodeType: 'grouping' | 'location') =>
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
  assert.deepEqual(mainLabelsFor('grouping'), ['Dashboard']);
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
