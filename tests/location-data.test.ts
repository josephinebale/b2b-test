import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { addDays, isSameDay, startOfDay, startOfWeek } from '../src/lib/date.ts';
import {
  bookingsForWorker,
  getLocationData,
  locationHistoryForWorker,
  locationsForOrganisation,
  LOCATIONS,
} from '../src/data/locations.ts';

function knownWorkerIds(): string[] {
  const ids = new Set<string>();
  for (const location of LOCATIONS) {
    for (const worker of getLocationData(location.id).workers) {
      ids.add(worker.id);
    }
  }
  return [...ids];
}

function workerIdsWithLocationCount(count: number): string[] {
  return knownWorkerIds().filter((id) => locationHistoryForWorker(id).length === count);
}

function providerWideWorkerIds(): string[] {
  return knownWorkerIds().filter((id) => {
    const history = locationHistoryForWorker(id);
    const firstLocation = LOCATIONS.find(
      (location) => location.id === history[0]?.locationId,
    );
    return Boolean(
      firstLocation &&
        history.length ===
          locationsForOrganisation(firstLocation.organisation).length,
    );
  });
}

function totalBookingsForWorker(id: string): number {
  return bookingsForWorker(id).length;
}

test('CPA locations use public listing names in alphabetical order', () => {
  const source = readFileSync(
    new URL('../src/data/locations.ts', import.meta.url),
    'utf8',
  );
  const expectedLocations = [
    "id: 'allambie-heights-day-program'",
    "id: 'brookvale-day-program'",
    "id: 'dee-why-1'",
    "id: 'galston-1'",
    "id: 'gladesville-1'",
    "id: 'hornsby'",
    "id: 'lane-cove-1'",
    "id: 'manly-1'",
    "id: 'forestville-home'",
    "id: 'chatswood-home'",
    "id: 'north-ryde-1'",
    "id: 'wahroonga'",
  ];

  let previousIndex = -1;
  for (const location of expectedLocations) {
    const index = source.indexOf(location);
    assert.ok(index > previousIndex, `${location} must appear in alphabetical order`);
    previousIndex = index;
  }
});

test('each location has a plausible number of known workers', () => {
  for (const location of LOCATIONS) {
    const size = getLocationData(location.id).workers.length;
    assert.ok(
      size >= 10 && size <= 18,
      `${location.name} has ${size} workers; a location roster is typically 10–18 regulars`,
    );
  }
});

/* The week keeps its 24/7 SIL shape — day staff plus an overnight — but at a
   volume a participant can read in a session rather than a full roster. */
test('every SIL day this week has day staff and a sleepover', () => {
  const weekStart = startOfWeek(startOfDay(new Date()));

  for (const location of LOCATIONS.filter((item) => item.serviceType === 'sil')) {
    const data = getLocationData(location.id);
    for (let i = 0; i < 7; i += 1) {
      const day = addDays(weekStart, i);
      const dayBookings = data.bookings.filter((booking) => isSameDay(booking.start, day));
      assert.ok(
        dayBookings.length >= 2,
        `${location.name} ${day.toDateString()} has ${dayBookings.length} bookings; a SIL day needs day staff plus overnight`,
      );
      assert.ok(
        dayBookings.some((booking) => booking.sleepover),
        `${location.name} ${day.toDateString()} should include a sleepover`,
      );
      assert.ok(
        dayBookings.some((booking) => !booking.sleepover),
        `${location.name} ${day.toDateString()} should include a daytime shift`,
      );
    }
  }
});

/* Identical columns read as a wall rather than a roster, so staffing varies. */
test('days carry different numbers of bookings across the week', () => {
  const weekStart = startOfWeek(startOfDay(new Date()));

  for (const location of LOCATIONS) {
    const data = getLocationData(location.id);
    const counts = new Set(
      Array.from({ length: 7 }, (_, i) =>
        data.bookings.filter((booking) => isSameDay(booking.start, addDays(weekStart, i))).length),
    );
    assert.ok(
      counts.size >= 2,
      `${location.name} has ${[...counts]} bookings every day this week; the grid reads as a wall`,
    );
  }
});

test('each location has at most three requested bookings in any week', () => {
  for (const location of LOCATIONS) {
    const data = getLocationData(location.id);
    const byWeek = new Map<string, typeof data.bookings>();

    for (const booking of data.bookings) {
      const key = startOfWeek(booking.start).toISOString();
      const week = byWeek.get(key) ?? [];
      week.push(booking);
      byWeek.set(key, week);
    }

    for (const [week, list] of byWeek) {
      const requested = list.filter((booking) => booking.status === 'requested');
      assert.ok(
        requested.length <= 3,
        `${location.name} week of ${week} has ${requested.length} requested bookings; the cap is 3`,
      );
    }
  }
});

test('this week’s requested bookings differ by location, and some houses are quiet', () => {
  const weekStart = startOfWeek(startOfDay(new Date()));
  const weekEnd = addDays(weekStart, 7);
  const thisWeekCounts = LOCATIONS.map((location) =>
    getLocationData(location.id).bookings.filter(
      (booking) =>
        booking.status === 'requested' &&
        booking.start >= weekStart &&
        booking.start < weekEnd,
    ).length,
  );

  assert.ok(
    Math.max(...thisWeekCounts) >= 3,
    `at least one location should have three requests this week; got ${thisWeekCounts}`,
  );
  assert.ok(
    Math.min(...thisWeekCounts) === 0,
    `at least one location should have none waiting this week; got ${thisWeekCounts}`,
  );
  assert.ok(
    new Set(thisWeekCounts).size >= 3,
    `this week’s requested counts should differ; got ${thisWeekCounts}`,
  );
});

test('open requests carry when they were asked, so unanswered age is knowable', () => {
  const today = startOfDay(new Date());
  const requested = LOCATIONS.flatMap((location) =>
    getLocationData(location.id).bookings.filter(
      (booking) => booking.status === 'requested' && booking.start >= today,
    ),
  );

  assert.ok(requested.length > 0);
  for (const booking of requested) {
    assert.ok(booking.requestedAt, `${booking.id} is requested without requestedAt`);
    assert.ok(booking.requestedAt.getTime() <= Date.now());
  }

  const ages = requested.map((booking) => Date.now() - booking.requestedAt!.getTime());
  assert.ok(
    Math.max(...ages) - Math.min(...ages) >= 24 * 3600 * 1000,
    'unanswered ages should differ by at least a day so urgency is comparable',
  );
});

test('a week fits the dashboard grid, so no day hides cards behind the expander', () => {
  const week = readFileSync(
    new URL('../src/pages/dashboard/BookingsWeek.tsx', import.meta.url),
    'utf8',
  );
  const cap = Number(/const COLLAPSED_BOOKINGS_PER_DAY = (\d+);/.exec(week)![1]);
  const weekStart = startOfWeek(startOfDay(new Date()));

  for (const location of LOCATIONS) {
    const data = getLocationData(location.id);
    for (let i = 0; i < 7; i += 1) {
      const day = addDays(weekStart, i);
      const dayBookings = data.bookings.filter((booking) => isSameDay(booking.start, day));
      assert.ok(
        dayBookings.length <= cap,
        `${location.name} ${day.toDateString()} has ${dayBookings.length} bookings, over the ${cap} the grid shows; the sleepover would be hidden`,
      );
    }
  }
});

test('a worker is not booked twice on the same day', () => {
  const data = getLocationData('dee-why-1');
  const keys = new Set<string>();

  for (const booking of data.bookings) {
    const key = `${booking.workerId}-${booking.start.toDateString()}`;
    assert.equal(keys.has(key), false, `${booking.workerName} appears twice on ${booking.start.toDateString()}`);
    keys.add(key);
  }
});

test('a worker is one identity, not a new person at each location', () => {
  const byId = new Map<string, string>();

  for (const location of LOCATIONS) {
    for (const worker of getLocationData(location.id).workers) {
      const seen = byId.get(worker.id);
      if (seen) {
        assert.equal(seen, worker.name, `${worker.id} has two names`);
      } else {
        byId.set(worker.id, worker.name);
      }
    }
  }

  const locationCounts = [...byId.keys()].map(
    (id) => locationHistoryForWorker(id).length,
  );
  assert.ok(locationCounts.some((count) => count === 1), 'need workers with history at one location only');
  assert.ok(locationCounts.some((count) => count === 2), 'need workers with history at two locations');
  assert.ok(
    providerWideWorkerIds().length > 0,
    'need workers with history at every location in their provider',
  );
});

test('shift volume varies independently of how many locations a worker covers', () => {
  const twoSite = [...workerIdsWithLocationCount(2)];
  const manySite = providerWideWorkerIds();
  assert.ok(twoSite.length > 0 && manySite.length > 0);

  const twoSiteShifts = Math.max(...twoSite.map((id) => totalBookingsForWorker(id)));
  const manySiteShiftsPerLocation = Math.min(
    ...manySite.map(
      (id) =>
        totalBookingsForWorker(id) / locationHistoryForWorker(id).length,
    ),
  );
  assert.ok(
    twoSiteShifts / 2 > manySiteShiftsPerLocation,
    `a two-site regular should average more shifts per location than a provider-wide worker (${twoSiteShifts / 2} vs ${manySiteShiftsPerLocation})`,
  );
});

test('a worker’s bookings can be read across locations for a time window', () => {
  const workerId = providerWideWorkerIds()[0];
  const history = locationHistoryForWorker(workerId);
  const firstLocation = LOCATIONS.find(
    (location) => location.id === history[0].locationId,
  );
  assert.ok(firstLocation);
  assert.equal(
    history.length,
    locationsForOrganisation(firstLocation.organisation).length,
  );
  assert.ok(history.every((item) => item.bookingCount >= 0));
  assert.ok(history.some((item) => item.bookingCount > 0));

  const all = bookingsForWorker(workerId);
  assert.ok(all.every((booking) => booking.workerId === workerId));
  assert.ok(new Set(all.map((booking) => booking.locationId)).size > 1);

  const weekStart = startOfWeek(startOfDay(new Date()));
  const weekEnd = addDays(weekStart, 7);
  const inWeek = bookingsForWorker(workerId, { start: weekStart, end: weekEnd });
  assert.ok(inWeek.every((booking) => booking.start >= weekStart && booking.start < weekEnd));
  assert.equal(
    inWeek.length,
    all.filter((booking) => booking.start >= weekStart && booking.start < weekEnd).length,
  );
});

test('a location’s known workers stay ranked by bookings here', () => {
  for (const location of LOCATIONS) {
    const data = getLocationData(location.id);
    for (const worker of data.workers) {
      const here = data.bookings.filter((booking) => booking.workerId === worker.id).length;
      assert.equal(worker.bookingCount, here);
    }
    const ranked = [...data.workers].sort(
      (a, b) => b.bookingCount - a.bookingCount || a.name.localeCompare(b.name),
    );
    assert.deepEqual(
      data.workers.map((worker) => worker.id),
      ranked.map((worker) => worker.id),
    );
  }
});
