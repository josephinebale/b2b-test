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

test('page shell is 1440px with 56px identity and 48px navigation rows', () => {
  assert.match(css, /--container-page:\s*90rem/);
  assert.match(css, /--header-identity-height:\s*3\.5rem/);
  assert.match(css, /--header-nav-height:\s*3rem/);
});

test('Bookings owns Request booking while the grouping Dashboard stays analytical', () => {
  assert.doesNotMatch(dashboard, /RequestBookingButton/);
  assert.doesNotMatch(dashboard, /Report incident/);
  assert.doesNotMatch(dashboard, /report-incident/);
  assert.match(bookings, /<RequestBookingButton \/>/);
  assert.match(bookings, /Report incident/);
});

test('pages declare their distinct layout archetype', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(app, /<ScopeRail|<SectionNavigation/);
  assert.match(bookings, /layout-rail-content/);
  assert.match(settings, /layout-rail-content/);
  assert.match(messages, /layout-master-detail/);
  assert.match(dashboard, /width-main-column/);
  assert.doesNotMatch(dashboard, /layout-content-aside/);
});

test('Workers keeps a narrow measure without centring its left edge', () => {
  assert.match(workers, /className="width-main-column"/);
  assert.doesNotMatch(workers, /className="mx-auto max-w-content"/);
});

test('pre-session screens use the product page shell and left-align inside it', () => {
  const landing = readFileSync(
    new URL('../src/pages/SessionLanding.tsx', import.meta.url),
    'utf8',
  );
  const jobs = readFileSync(
    new URL('../src/pages/JobsToBeDone.tsx', import.meta.url),
    'utf8',
  );
  const architecture = readFileSync(
    new URL('../src/pages/InformationArchitecture.tsx', import.meta.url),
    'utf8',
  );

  for (const page of [landing, jobs, architecture]) {
    assert.match(page, /<main className="mx-auto w-full max-w-page flex-1 px-8 py-8">/);
    assert.match(page, /<header className="app-header">/);
    assert.doesNotMatch(page, /className="mx-auto max-w-content"/);
    assert.doesNotMatch(page, /AppFooter/);
  }

  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /<AppFooter \/>/);
});
