import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const dashboard = readFileSync(
  new URL('../src/pages/Dashboard.tsx', import.meta.url),
  'utf8',
);
const bookings = readFileSync(
  new URL('../src/pages/Bookings.tsx', import.meta.url),
  'utf8',
);
const messages = readFileSync(
  new URL('../src/pages/Messages.tsx', import.meta.url),
  'utf8',
);
const settings = readFileSync(
  new URL('../src/pages/Settings.tsx', import.meta.url),
  'utf8',
);
const workers = readFileSync(
  new URL('../src/pages/Workers.tsx', import.meta.url),
  'utf8',
);

test('all split layouts share one 320px narrow-column token', () => {
  assert.match(css, /--narrow-column-width:\s*20rem/);
  assert.doesNotMatch(css, /--sidebar-(?:bookings|team|settings)-width/);
  assert.doesNotMatch(css, /--messages-list-width/);
});

test('page shell is 1440px with a two-tier header', () => {
  assert.match(css, /--container-page:\s*90rem/);
  assert.match(css, /--header-identity-height:\s*3\.5rem/);
  assert.match(css, /--header-nav-height:\s*3rem/);
});

test('the Dashboard heading keeps Request booking and drops Report incident', () => {
  assert.match(dashboard, /<RequestBookingButton \/>/);
  assert.doesNotMatch(dashboard, /Report incident/);
  assert.doesNotMatch(dashboard, /report-incident/);
  assert.match(bookings, /Report incident/);
});

test('pages declare their distinct layout archetype', () => {
  assert.match(bookings, /layout-rail-content/);
  assert.match(settings, /layout-rail-content/);
  assert.match(messages, /layout-master-detail/);
  assert.match(dashboard, /layout-content-aside/);
});

test('Workers keeps a narrow measure without centring its left edge', () => {
  assert.match(workers, /className="width-main-column"/);
  assert.doesNotMatch(workers, /className="mx-auto max-w-content"/);
});
