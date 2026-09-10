import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  LOCATIONS,
  getLocationData,
  type ServiceType,
} from '../src/data/locations.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

function locationsOf(serviceType: ServiceType) {
  return LOCATIONS.filter((location) => location.serviceType === serviceType);
}

test('every location has a service type and participants, and remains the bookable entity', () => {
  const types = new Set(LOCATIONS.map((location) => location.serviceType));
  assert.deepEqual([...types].sort(), ['centre', 'home-community', 'sil']);

  for (const location of LOCATIONS) {
    assert.ok(location.participants.length > 0, `${location.name} has no participants`);
    assert.ok(
      location.participants.every((person) => person.id && person.name),
      `${location.name} has an unnamed participant`,
    );
  }

  const home = locationsOf('home-community');
  assert.ok(home.length > 1);
  assert.ok(
    home.some((location) => location.providerSite === false),
    'at least one community home is not a provider site',
  );
  assert.ok(home.every((location) => location.participants.length === 1));
  assert.equal(home[0].name, 'Maya Nguyen');
  assert.equal(home[0].suburb, 'Forestville');
  assert.ok(locationsOf('centre').length >= 2);

  const sil = locationsOf('sil')[0];
  const booking = getLocationData(sil.id).bookings[0];
  assert.ok(booking.locationId);
  assert.equal('participantId' in booking, false);
  assert.ok(Array.isArray(booking.participantIds));
});

test('SIL bookings cover every resident and do not vary by shift', () => {
  for (const location of locationsOf('sil')) {
    const residentIds = location.participants.map((person) => person.id).sort();
    assert.ok(residentIds.length >= 3);
    const covered = getLocationData(location.id).bookings.map((booking) =>
      [...booking.participantIds].sort().join(','),
    );
    assert.ok(covered.length > 0);
    assert.ok(covered.every((ids) => ids === residentIds.join(',')));
  }
});

test('centre bookings name who is attending, and that set varies by session', () => {
  const centre = locationsOf('centre')[0];
  assert.ok(centre);
  const attendeeSets = new Set(
    getLocationData(centre.id).bookings.map((booking) =>
      [...booking.participantIds].sort().join(','),
    ),
  );
  assert.ok(attendeeSets.size >= 3, 'sessions should not all cover the same people');
  for (const booking of getLocationData(centre.id).bookings) {
    assert.ok(booking.participantIds.length >= 1);
    assert.ok(booking.participantIds.length < centre.participants.length);
    assert.ok(
      booking.participantIds.every((id) =>
        centre.participants.some((person) => person.id === id),
      ),
    );
  }
});

test('a home-and-community booking is for the one named person', () => {
  for (const location of locationsOf('home-community')) {
    const [person] = location.participants;
    for (const booking of getLocationData(location.id).bookings) {
      assert.deepEqual(booking.participantIds, [person.id]);
    }
  }
});

test('participants carry no funding or balance', () => {
  for (const location of LOCATIONS) {
    for (const person of location.participants) {
      assert.deepEqual(Object.keys(person).sort(), ['id', 'name']);
    }
  }
});

test('the request flow only nominates attendees at a centre, and finance reference is for that type', () => {
  const flow = source('../src/pages/BookingRequest.tsx');
  const bookings = source('../src/pages/Bookings.tsx');
  const week = source('../src/pages/dashboard/BookingsWeek.tsx');
  const detail = flow;

  assert.match(flow, /serviceType === 'centre'/);
  assert.match(flow, /Who is attending/);
  assert.match(flow, /selectedParticipantIds/);
  assert.match(flow, /participantIds:/);
  assert.doesNotMatch(flow, /balance|funding|NDIS plan amount/i);

  assert.match(bookings, /bookingParticipantSummary/);
  assert.match(week, /bookingParticipantSummary/);
  assert.match(detail, /bookingParticipantSummary/);
});
