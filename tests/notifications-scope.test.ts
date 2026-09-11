import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  descendantLocationIds,
  findGrouping,
} from '../src/data/locations.ts';
import { personaById } from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('a persona notification boundary is their configured entry node', () => {
  const houseManager = personaById('house-manager');
  const coordinator = personaById('roster-coordinator');
  const regionManager = personaById('regional-manager');
  assert.equal(houseManager.entry.nodeType, 'location');
  assert.equal(coordinator.entry.nodeType, 'grouping');
  assert.equal(regionManager.entry.nodeType, 'grouping');

  if (
    houseManager.entry.nodeType !== 'location' ||
    coordinator.entry.nodeType !== 'grouping' ||
    regionManager.entry.nodeType !== 'grouping'
  ) {
    return;
  }

  const caseload = findGrouping(coordinator.entry.groupingId);
  const region = findGrouping(regionManager.entry.groupingId);
  assert.ok(caseload && region);
  assert.deepEqual([houseManager.entry.locationId], ['dee-why-1']);
  assert.deepEqual(descendantLocationIds(caseload), [
    'dee-why-1',
    'forestville-home',
    'gladesville-1',
    'lane-cove-1',
    'manly-1',
    'north-ryde-1',
  ]);
  assert.deepEqual(descendantLocationIds(region), [
    'allambie-heights-day-program',
    'dee-why-1',
    'galston-1',
    'hornsby',
    'north-ryde-1',
    'wahroonga',
  ]);
});

test('App derives notifications from the entry node and renders them at groupings', () => {
  const app = source('../src/App.tsx');

  assert.match(
    app,
    /persona\.entry\.nodeType === 'location'[\s\S]*?\[persona\.entry\.locationId\][\s\S]*?descendantLocationIds\(entryGrouping\)/,
  );
  assert.match(app, /const notificationData = notificationLocationIds\.map/);
  assert.match(
    app,
    /if \(nodeType === 'grouping' \|\| nodeType === 'organisation'\)[\s\S]*?path === '\/notifications'[\s\S]*?<Notifications/,
  );
  assert.match(app, /<Notifications[\s\S]*data=\{notificationData\}/);
});

test('the header Notifications control is available at groupings and locations', () => {
  const header = source('../src/components/AppHeader.tsx');
  const architecture = source('../src/lib/informationArchitecture.ts');

  assert.match(
    architecture,
    /NOTIFICATIONS_NODE_ITEM[\s\S]*?nodeTypes: \['grouping', 'location', 'organisation'\]/,
  );
  assert.doesNotMatch(
    header,
    /nodeType === 'location' && \(\s*<IconButton[\s\S]*?NOTIFICATIONS_NODE_ITEM/,
  );
  assert.match(header, /href=\{href\(NOTIFICATIONS_NODE_ITEM\.path\)\}/);
});

test('each notification keeps its event content and names its supportable', () => {
  const page = source('../src/pages/Notifications.tsx');

  assert.match(page, /function buildItems\(data: LocationData\[\]\)/);
  assert.match(page, /data\.flatMap\(\(locationData\)/);
  assert.match(page, /locationName: locationData\.location\.name/);
  assert.match(
    page,
    /text-xs text-text-tertiary">\s*\{locationName\}/,
  );
  assert.match(page, /Workers have not yet responded to these requests\./);
  assert.match(page, /Approve completed bookings so workers can be paid on time\./);
});

test('the header badge receives the immediate-work count across the entry scope', () => {
  const page = source('../src/pages/Notifications.tsx');
  const app = source('../src/App.tsx');

  assert.match(page, /export function notificationCount\(data: LocationData\[\]\)/);
  assert.match(app, /unreadNotifications=\{notificationCount\(notificationData\)\}/);
});
