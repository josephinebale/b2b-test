import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACCOUNT_SECTIONS,
  CAN_EDIT_ORGANISATION_DETAILS,
  LOCATION_SECTIONS,
  MANAGER_NAME,
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

test('the account menu exposes one account destination', () => {
  assert.deepEqual(PERSONAL_MENU_ITEMS, [
    { label: 'Your account', path: '/your-account' },
  ]);
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

test('the node menu scrolls rather than running off a short window', () => {
  const switcher = readFileSync(
    new URL('../src/components/LocationSwitcher.tsx', import.meta.url),
    'utf8',
  );

  /* Five grouping rows, nested caseloads, twelve locations, and settings rows are taller than a
     laptop window, and a clipped menu hides the rows at the bottom. */
  assert.match(switcher, /role="menu"[\s\S]*?max-h-\[70vh\] overflow-y-auto/);
});

test('arrow keys wrap through menu items', () => {
  assert.equal(menuIndexAfterKey(0, 'ArrowDown', 3), 1);
  assert.equal(menuIndexAfterKey(2, 'ArrowDown', 3), 0);
  assert.equal(menuIndexAfterKey(0, 'ArrowUp', 3), 2);
  assert.equal(menuIndexAfterKey(1, 'Home', 3), 0);
  assert.equal(menuIndexAfterKey(1, 'End', 3), 2);
  assert.equal(menuIndexAfterKey(1, 'Escape', 3), null);
});
