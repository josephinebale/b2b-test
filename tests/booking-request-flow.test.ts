import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { addDays, startOfDay } from '../src/lib/date.ts';
import {
  LOCATIONS,
  requestWorkerTiers,
} from '../src/data/locations.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('the request booking route renders the three-step flow', () => {
  const app = source('../src/App.tsx');
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(app, /path === '\/request-booking'/);
  assert.match(flow, /Location, date and time/);
  assert.match(flow, /Details/);
  assert.match(flow, /Select workers/);
  assert.match(flow, /step === 1/);
  assert.match(flow, /step === 2/);
  assert.match(flow, /step === 3/);
});

test('the flow requires its essential fields before moving forward', () => {
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(flow, /<select[\s\S]*value=\{data\.location\.id\}/);
  assert.match(flow, /locations\.map/);
  assert.doesNotMatch(flow, /LOCATIONS\.map/);
  assert.doesNotMatch(flow, /Booking location/);
  assert.doesNotMatch(flow, /This comes from the location selected in the header/);
  assert.doesNotMatch(flow, /placeholder="For example, 120 Pacific Highway/);
  assert.match(flow, /draft\.date !== '' && durationHours\(draft\) > 0/);
  assert.match(flow, /draft\.description\.trim\(\) !== '' && draft\.supportPlansConfirmed/);
  assert.match(flow, /draft\.selectedWorkerIds\.length > 0/);
  assert.match(flow, /draft\.selectedWorkerIds\.length >= 10/);
});

test('worker selection applies the requested time to location and grouping workers', () => {
  const app = source('../src/App.tsx');
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(app, /<BookingRequest[\s\S]*onSelectLocation=\{selectLocation\}/);
  assert.match(flow, /requestWorkerTiers\(/);
  assert.match(flow, /parseDateTime\(draft\.date, draft\.startTime\)/);
  assert.match(flow, /parseDateTime\(draft\.date, draft\.endTime\)/);
  assert.match(flow, /Your location team/);
  assert.match(flow, /Worked elsewhere in \{grouping\.name\}/);
  assert.match(flow, /requestWorkerTiers\(data\.location\.id, start, end, grouping\.id\)/);
});

test('a daytime request offers available workers from tiers one and two', () => {
  const day = addDays(startOfDay(new Date()), 30);
  day.setHours(12, 0, 0, 0);
  const end = new Date(day);
  end.setHours(13);

  for (const location of LOCATIONS) {
    const tiers = requestWorkerTiers(location.id, day, end);
    assert.ok(tiers.knownHere.length > 0, `${location.name} has no available tier 1 workers`);
    assert.ok(
      tiers.workedElsewhere.length > 0,
      `${location.name} has no available tier 2 workers`,
    );
  }
});

test('the demonstrator overnight window reaches nearby workers only', () => {
  const start = addDays(startOfDay(new Date()), 1);
  start.setHours(2, 0, 0, 0);
  const end = new Date(start);
  end.setHours(3);

  for (const location of LOCATIONS) {
    const tiers = requestWorkerTiers(location.id, start, end);
    assert.equal(tiers.knownHere.length, 0);
    assert.equal(tiers.workedElsewhere.length, 0);
    assert.ok(tiers.nearby.length > 0);
  }
});

test('nearby workers are a selectable and contactable fallback with honest context', () => {
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(flow, /knownHere\.length === 0 && workedElsewhere\.length === 0/);
  assert.match(
    flow,
    /Nobody known to this location or this grouping is available for that time\./,
  );
  assert.match(flow, /No history with this provider/);
  assert.match(flow, /Support plan not shared/);
  assert.match(flow, /Message \$\{worker\.name\}/);
  assert.match(flow, /toggleWorker\(worker\.id\)/);
  assert.doesNotMatch(flow, /induct|buddy shift/i);
});

test('submitting opens a requested booking detail screen', () => {
  const app = source('../src/App.tsx');
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(app, /path\.startsWith\('\/bookings\/request\/'\)/);
  assert.match(app, /createdBookings/);
  assert.match(app, /bookings: \[\.\.\.createdForLocation, \.\.\.data\.bookings\]/);
  assert.match(flow, /Requested booking/);
  assert.match(flow, /Booking was requested/);
  assert.match(flow, /Waiting for a worker to accept this booking request/);
  assert.match(flow, /onCreateBooking\(newBooking\)/);
  assert.match(flow, /navigate\(`\/bookings\/request\/\$\{newBooking\.id\}`\)/);
});

test('requested booking detail keeps workers selected from any tier', () => {
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(flow, /groupingWorkers\(grouping\.id\)/);
  assert.match(flow, /nearbyWorkers\(\)/);
  assert.match(flow, /requestedWorkerNames\.map/);
  assert.match(flow, /worker\.hasProfile/);
  assert.doesNotMatch(flow, /Sent to \$\{selectedWorkers\.length \|\| 1\}[\s\S]*known at this location/);
});

test('requested booking cards link to their detail screens', () => {
  const bookings = source('../src/pages/Bookings.tsx');

  assert.match(
    bookings,
    /booking\.status === 'requested'\s*\? href\(`\/bookings\/request\/\$\{booking\.id\}`\)/,
  );
});

test('every dashboard shift opens its matching booking detail', () => {
  const app = source('../src/App.tsx');
  const week = source('../src/pages/dashboard/BookingsWeek.tsx');
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(week, /href=\{href\(bookingDetailPath\(booking\.id\)\)\}/);
  assert.match(week, /aria-label=\{`Open booking for \$\{booking\.workerName\}`\}/);
  assert.match(app, /path\.startsWith\(BOOKING_DETAIL_ROUTE\)/);
  assert.match(flow, /bookingIdFromDetailPath\(path\)/);
  assert.match(flow, /booking\.status === 'requested'/);
  assert.match(flow, /booking\?\.status === 'confirmed'/);
  assert.match(flow, /'Confirmed booking'/);
  assert.match(flow, /'Completed booking'/);
});

test('Bookings remains active throughout request creation and detail routes', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /item\.path === '\/bookings'/);
  assert.match(header, /navPath === '\/request-booking'/);
  assert.match(header, /navPath\.startsWith\('\/bookings\/request\/'\)/);
  assert.match(header, /navPath\.startsWith\(BOOKING_DETAIL_ROUTE\)/);
});

test('the booking request layout includes errors, tier fallback, and summary states', () => {
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(flow, /role="alert"/);
  assert.match(flow, /Nobody known to this location or this grouping is available/);
  assert.match(flow, /BookingRequestSummary/);
  assert.match(flow, /Pricing estimate/);
  assert.match(flow, /Next step: \{step === 1 \? 'Details' : 'Select workers'\}/);
  assert.doesNotMatch(flow, /Ready to send/);
});

test('the richer worker list is driven from outside the page, not a hidden hotspot', () => {
  const flow = source('../src/pages/BookingRequest.tsx');
  const app = source('../src/App.tsx');

  assert.match(flow, /workerDetail: boolean/);
  assert.match(app, /const \[pageVariant, setPageVariant\] = useState\(false\)/);
  assert.match(app, /workerDetail=\{pageVariant\}/);
  /* The step label is plain text again. */
  assert.doesNotMatch(flow, /onClick=\{onToggleWorkerDetail\}/);
  assert.doesNotMatch(flow, /useState\(false\);\s*\/\* Held here/);
});

test('the revealed worker list adds comparison evidence, place, and training', () => {
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(flow, /Based in \{richerDetail\.suburb\}, over 10km away/);
  assert.match(flow, /hours at this provider/);
  assert.match(flow, /Medication assessment/);
  assert.match(flow, /Driving assessment/);
  assert.doesNotMatch(flow, /`Known at \$\{data\.location\.name\}`/);
  assert.match(flow, /Trained in \{richerDetail\.training\.join\(', '\)\}/);
  assert.doesNotMatch(flow, /Show more|Show less|expandedWorkerIds|toggleExpanded/);
  assert.match(flow, /worker\$\{selectedNames\.length === 1 \? '' : 's'\} selected: /);
  assert.match(flow, /Select up to 10 workers who are available for this booking\./);
});

test('unavailable workers are omitted rather than shown as disabled rows', () => {
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.doesNotMatch(flow, /const unavailable = index === 5/);
  assert.doesNotMatch(flow, /Booked at this time/);
  assert.doesNotMatch(flow, /cursor-not-allowed/);
});
