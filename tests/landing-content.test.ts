import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('landing bodies sit behind one off flag so the real screens cannot rot', () => {
  const placeholder = source('../src/components/LandingPlaceholder.tsx');
  const dashboard = source('../src/pages/Dashboard.tsx');
  const groupingWorkers = source('../src/pages/GroupingWorkers.tsx');
  const bookings = source('../src/pages/Bookings.tsx');
  const workers = source('../src/pages/Workers.tsx');
  const messages = source('../src/pages/Messages.tsx');
  const settings = source('../src/pages/Settings.tsx');
  const supportables = source('../src/pages/Supportables.tsx');
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const header = source('../src/components/AppHeader.tsx');
  const project = source('../PROJECT.md');

  assert.match(
    placeholder,
    /export const LANDING_CONTENT_ENABLED = false/,
  );
  assert.match(placeholder, /This screen is in progress\./);
  assert.doesNotMatch(placeholder, /not been designed|navigation and structure/);
  assert.doesNotMatch(placeholder, /nothing here|No .*yet|empty/i);
  assert.doesNotMatch(placeholder, /lucide-react|illustration/);
  assert.match(placeholder, /<Card className="p-6">/);
  assert.equal((placeholder.match(/<p /g) ?? []).length, 1);

  for (const [name, page] of [
    ['dashboard', dashboard],
    ['grouping workers', groupingWorkers],
    ['bookings', bookings],
    ['workers', workers],
    ['messages', messages],
    ['settings', settings],
  ] as const) {
    assert.match(page, /LANDING_CONTENT_ENABLED/, `${name} uses the flag`);
    assert.match(page, /<LandingPlaceholder/, `${name} uses the shared placeholder`);
    assert.match(page, /<PageHeading/, `${name} still has its heading in source`);
    assert.match(
      page,
      /LANDING_CONTENT_ENABLED \?[\s\S]*?<PageHeading[\s\S]*?: \(\s*<LandingPlaceholder/,
      `${name} shows only the placeholder while the flag is off`,
    );
  }

  assert.match(dashboard, /Requests waiting/);
  assert.match(dashboard, /Platform use/);
  assert.match(groupingWorkers, /<WorkersPanel grouping=\{grouping\}/);
  assert.match(bookings, /<BookingsWeek/);
  assert.match(workers, /Your location team/);
  assert.match(messages, /Search messages/);
  assert.match(settings, /function LocationSection/);
  assert.match(settings, /function OrganisationSection/);
  assert.match(settings, /function AccountSection/);
  assert.match(settings, /layout-rail-content/);

  assert.match(
    supportables,
    /pendingWork\.length > 0 && \(\s*LANDING_CONTENT_ENABLED \?/,
  );
  assert.match(
    supportables,
    /pendingWorkParts\(pendingCountsForLocation\(location\.id\)\)/,
  );
  assert.match(supportables, /onSelectLocation\?\.\(location\.id, '\/bookings'\)/);
  assert.match(supportables, /\{location\.name\}/);
  assert.match(supportables, /\{location\.suburb\}/);

  assert.match(
    breadcrumb,
    /pendingWork\.length > 0 && \(\s*LANDING_CONTENT_ENABLED \?/,
  );
  assert.match(breadcrumb, /groupingContentsSummary\(item\.grouping\)/);
  assert.match(breadcrumb, /\{item\.location\.suburb\}/);

  assert.match(
    header,
    /LANDING_CONTENT_ENABLED &&[\s\S]*<Badge count=\{unreadNotifications\}/,
  );
  assert.match(
    header,
    /LANDING_CONTENT_ENABLED[\s\S]*<Badge count=\{count\}/,
  );
  assert.match(header, /href=\{href\(NOTIFICATIONS_NODE_ITEM\.path\)\}/);
  assert.match(header, /item\.label === 'Bookings'/);
  assert.match(header, /item\.label === 'Messages'/);

  assert.match(project, /LANDING_CONTENT_ENABLED/);
  assert.match(project, /temporary/);
  assert.match(project, /navigation and information architecture/);
});
