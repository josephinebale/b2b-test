import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { addDays, startOfDay, startOfWeek } from '../src/lib/date.ts';
import {
  GROUPINGS,
  LOCATIONS,
  descendantLocationIds,
  findGrouping,
  getLocationData,
  groupingAttentionBookings,
  groupingDashboardWorkers,
} from '../src/data/locations.ts';

const cpa = 'Cerebral Palsy Alliance';
const expectedSilCounts = [7, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7];

function cpaArm(id: string) {
  const arm = findGrouping(id);
  assert.ok(arm);
  return arm;
}

test('CPA has the approved SIL, Lifestyles, and Careforce scale', () => {
  const silRegions = (cpaArm('cpa-sil').groupingIds ?? []).map((id) => findGrouping(id)!);
  const counts = silRegions.map(
    (region) =>
      descendantLocationIds(region).filter(
        (id) => LOCATIONS.find((location) => location.id === id)?.serviceType === 'sil',
      ).length,
  );
  assert.equal(silRegions.length, 13);
  assert.deepEqual(counts, expectedSilCounts);
  assert.equal(counts.reduce((sum, count) => sum + count, 0), 90);
  assert.ok(counts.includes(6) && counts.includes(7));

  const lifestylesLocations = (cpaArm('cpa-lifestyles').groupingIds ?? [])
    .flatMap((id) => descendantLocationIds(findGrouping(id)!))
    .map((id) => LOCATIONS.find((location) => location.id === id)!)
    .filter((location) => location.serviceType === 'centre');
  assert.equal(new Set(lifestylesLocations.map(({ id }) => id)).size, 12);

  const caseloads = (findGrouping('careforce-area')?.groupingIds ?? [])
    .map((id) => findGrouping(id)!);
  assert.equal(caseloads.length, 5);
  assert.ok(caseloads.every(({ locationIds }) => locationIds.length >= 8 && locationIds.length <= 12));
});

test('existing CPA identities and named memberships survive the scale-up', () => {
  assert.deepEqual(
    ['northern-sydney', 'north-west-sydney', 'newcastle', 'illawarra'].map((id) => {
      const grouping = findGrouping(id)!;
      return [grouping.id, grouping.name];
    }),
    [
      ['northern-sydney', 'Northern Sydney'],
      ['north-west-sydney', 'North West Sydney'],
      ['newcastle', 'Newcastle'],
      ['illawarra', 'Illawarra'],
    ],
  );
  assert.ok(findGrouping('northern-sydney')?.locationIds.includes('galston-1'));
  assert.ok(findGrouping('north-west-sydney')?.locationIds.includes('harris-park-1'));
  assert.ok(findGrouping('newcastle')?.locationIds.includes('newcastle-1'));
  assert.ok(findGrouping('illawarra')?.locationIds.includes('wollongong-1'));
  assert.ok(findGrouping('northern-lifestyles')?.locationIds.includes('allambie-heights-day-program'));
  assert.ok(findGrouping('western-lifestyles')?.locationIds.includes('pennant-hills-day-program'));
  assert.ok(findGrouping('careforce-caseload')?.locationIds.includes('dee-why-1'));
  assert.ok(findGrouping('careforce-northern-caseload')?.locationIds.includes('galston-1'));

  const source = readFileSync(new URL('../src/data/locations.ts', import.meta.url), 'utf8');
  assert.match(source, /12 Lifestyles centres is an assumed operating scale/);
  assert.match(source, /Five Careforce caseloads sourced to one per Roster Coordinator in the research/);
  assert.match(source, /Sourced constraint: exactly three houses use a two-site manager model/);
  assert.match(
    source,
    /40% cross-house overlap sourced to "often work across houses, within a region"/,
  );
});

test('CPA location rosters and current-week bookings fit the approved ranges', () => {
  const weekStart = startOfWeek(startOfDay(new Date()));
  const weekEnd = addDays(weekStart, 7);
  const cpaLocations = LOCATIONS.filter((location) => location.organisation === cpa);

  for (const location of cpaLocations) {
    const data = getLocationData(location.id);
    assert.ok(data.workers.length >= 10 && data.workers.length <= 18, `${location.id} worker count`);
    const currentWeek = data.bookings.filter(
      (booking) => booking.start >= weekStart && booking.start < weekEnd,
    );
    assert.ok(
      currentWeek.length >= 16 && currentWeek.length <= 24,
      `${location.id} has ${currentWeek.length} current-week bookings`,
    );
    const workerDays = new Set<string>();
    for (const booking of currentWeek) {
      const key = `${booking.workerId}:${booking.start.toDateString()}`;
      assert.equal(workerDays.has(key), false, `${location.id} double-books ${key}`);
      workerDays.add(key);
    }
  }
});

test('SIL regional workforces scale and overlap without becoming one shared roster', () => {
  const regions = (cpaArm('cpa-sil').groupingIds ?? []).map((id) => findGrouping(id)!);
  for (const region of regions) {
    const houses = region.locationIds.filter(
      (id) => LOCATIONS.find((location) => location.id === id)?.serviceType === 'sil',
    );
    const memberships = new Map<string, number>();
    for (const house of houses) {
      for (const worker of getLocationData(house).workers) {
        memberships.set(worker.id, (memberships.get(worker.id) ?? 0) + 1);
      }
    }
    const distinct = memberships.size;
    const totalMemberships = houses.length * 13;
    const expected =
      totalMemberships - Math.round((totalMemberships * 2) / 7);
    assert.ok(Math.abs(distinct - expected) <= 2, `${region.id} has ${distinct} distinct workers`);
    const twoHouse = [...memberships.values()].filter((count) => count === 2).length;
    assert.ok(twoHouse / distinct >= 0.35 && twoHouse / distinct <= 0.45, `${region.id} overlap`);
    if (region.id === 'northern-sydney') {
      assert.ok([...memberships.values()].some((count) => count >= 5));
    } else {
      assert.ok([...memberships.values()].every((count) => count <= 2));
    }

    const recent = groupingDashboardWorkers(region.id);
    assert.ok(recent.length >= distinct * 0.9, `${region.id} recent worker coverage`);
    const recencies = recent.map((worker) => worker.lastWorkedAt!.getTime());
    assert.ok(Math.max(...recencies) - Math.min(...recencies) >= 42 * 864e5, `${region.id} recency spread`);
  }
});

test('waiting work is lumpy, Galston stays blank, and one regional day is heavy', () => {
  const regions = (cpaArm('cpa-sil').groupingIds ?? []).map((id) => findGrouping(id)!);
  const requestCounts = regions.flatMap((region) =>
    region.locationIds.map((id) => getLocationData(id).requestsToAccept),
  );
  assert.ok(requestCounts.filter((count) => count === 0).length > requestCounts.length / 2);
  assert.ok(requestCounts.some((count) => count >= 3));

  const galston = getLocationData('galston-1');
  assert.deepEqual(
    [galston.requestsToAccept, galston.bookingsToApprove, galston.unreadMessages],
    [0, 0, 0],
  );

  const heavyDay = regions.some((region) => {
    const byDay = new Map<string, number>();
    for (const booking of groupingAttentionBookings(region.id)) {
      const day = startOfDay(booking.start).toISOString();
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    return [...byDay.values()].some((count) => count > 4);
  });
  assert.ok(heavyDay, 'at least one region needs a day with more than four attention bookings');
});
