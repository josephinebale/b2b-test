import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  LOCATIONS,
  serviceTypeLabel,
} from '../src/data/locations.ts';
import {
  supportPlaceLabel,
  supportRequiredLabel,
} from '../src/lib/locationProfiles.ts';
import { questionById } from '../src/data/discussionQuestions.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('client type labels follow sector without changing the service type', () => {
  assert.equal(
    serviceTypeLabel('home-community', 'disability'),
    'Home and community',
  );
  assert.equal(
    serviceTypeLabel('home-community', 'aged care'),
    'Support at Home',
  );
  assert.equal(serviceTypeLabel('sil', 'aged care'), 'SIL house');
  assert.equal(serviceTypeLabel('centre', 'aged care'), 'Centre / day program');

  for (const location of LOCATIONS) {
    assert.equal(location.serviceType === 'home-community', location.participants.length === 1);
  }
});

test('client profile choices say home while keeping the stored location values', () => {
  const client = LOCATIONS.find(
    (location) => location.serviceType === 'home-community',
  );
  const house = LOCATIONS.find((location) => location.serviceType === 'sil');
  assert.ok(client && house);

  assert.equal(supportPlaceLabel('At the location', client), 'At home');
  assert.equal(supportPlaceLabel('At the location', house), 'At the location');
  assert.equal(
    supportRequiredLabel('Help around the location', client),
    'Help at home',
  );
  assert.equal(
    supportRequiredLabel('Help around the location', house),
    'Help around the location',
  );
});

test('client settings use the person’s name and person-specific navigation', () => {
  const settings = source('../src/pages/Settings.tsx');
  const profile = source('../src/components/LocationProfileSettings.tsx');
  const preview = source('../src/pages/LocationProfilePreview.tsx');

  assert.match(settings, /`\$\{data\.location\.name\} settings`/);
  assert.match(settings, /`\$\{data\.location\.name\} profile`/);
  assert.match(settings, /Personal details/);
  assert.match(settings, /People with access/);
  assert.match(settings, /booked to support \$\{locationName\}/);
  assert.match(settings, /Support type/);

  assert.match(profile, /`About \$\{data\.location\.name\}`/);
  assert.match(profile, /how workers support them/);
  assert.match(profile, /Support needs/);
  assert.match(profile, /supportPlaceLabel/);
  assert.match(profile, /supportRequiredLabel/);

  assert.match(preview, /`\$\{data\.location\.name\} profile preview`/);
  assert.match(preview, /accepting work with \$\{data\.location\.name\}/);
  assert.match(preview, /`About \$\{data\.location\.name\}`/);
});

test('mixed selectors enumerate clients and locations instead of inventing an umbrella noun', () => {
  const chooser = source('../src/pages/ChooseLocation.tsx');
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(chooser, /Choose where you work/);
  assert.match(chooser, /house, centre, day program or client/);
  assert.match(breadcrumb, /aria-label="Breadcrumb"/);
  assert.doesNotMatch(breadcrumb, />Supportables?</);
});

test('every rendered type label receives sector context', () => {
  for (const path of [
    '../src/pages/Dashboard.tsx',
    '../src/pages/ChooseLocation.tsx',
    '../src/pages/BookingRequest.tsx',
    '../src/pages/Settings.tsx',
  ]) {
    const file = source(path);
    assert.doesNotMatch(file, /serviceTypeLabel\([^,\n)]+\)/);
  }
});

test('shared discussion prompts do not call a client a location', () => {
  for (const id of [
    'question-4',
    'request-general',
    'messages-general',
    'settings-general',
    'settings-sections',
    'workers-profile-context',
    'booking-card-participants',
    'messages-conversations',
    'messages-nav',
  ]) {
    const question = questionById(id);
    assert.ok(question, `missing ${id}`);
    assert.doesNotMatch(question.text, /this location|location’s|for a location/i);
  }
});
