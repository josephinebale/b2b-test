import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('landing bodies sit behind one off flag so the real screens cannot rot', () => {
  const placeholder = source('../src/components/LandingPlaceholder.tsx');
  const dashboard = source('../src/pages/Dashboard.tsx');
  const groupingWorkersPage = source('../src/pages/GroupingWorkers.tsx');
  const workers = source('../src/pages/Workers.tsx');
  const bookings = source('../src/pages/Bookings.tsx');
  const messages = source('../src/pages/Messages.tsx');
  const settings = source('../src/pages/Settings.tsx');
  const supportables = source('../src/pages/Supportables.tsx');
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const header = source('../src/components/AppHeader.tsx');
  const project = source('../PROJECT.md');

  assert.match(
    placeholder,
    /export const LANDING_CONTENT_ENABLED = true/,
  );
  assert.match(
    placeholder,
    /export const GROUPING_WORKERS_CONTENT_ENABLED = false/,
  );
  assert.match(placeholder, /GroupingWorkersTable\.tsx/);
  assert.match(placeholder, /This screen is in progress\./);
  assert.doesNotMatch(placeholder, /not been designed|navigation and structure/);
  assert.doesNotMatch(placeholder, /nothing here|No .*yet|empty/i);
  assert.doesNotMatch(placeholder, /lucide-react|illustration/);
  assert.match(placeholder, /<Card className="p-6">/);
  assert.match(
    project,
    /in-progress card keeps \*\*24px\*\* \(`.p-6` \/ `--space-5`\)/,
  );
  assert.equal((placeholder.match(/<p /g) ?? []).length, 1);

  for (const [name, page] of [
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
      `${name} keeps the landing gate in source`,
    );
  }

  const groupingWorkersBranch = workers.slice(
    workers.indexOf('if (!data)'),
    workers.indexOf('const client ='),
  );

  assert.match(groupingWorkersBranch, /GROUPING_WORKERS_CONTENT_ENABLED/);
  assert.doesNotMatch(
    groupingWorkersBranch,
    /LANDING_CONTENT_ENABLED \|\| GROUPING_WORKERS_CONTENT_ENABLED/,
  );
  assert.match(groupingWorkersBranch, /<LandingPlaceholder/);
  assert.match(groupingWorkersBranch, /<GroupingWorkersTable grouping=\{grouping\}/);
  assert.match(
    groupingWorkersBranch,
    /GROUPING_WORKERS_CONTENT_ENABLED \?[\s\S]*?<PageHeading[\s\S]*?\)\s*:\s*\(\s*<LandingPlaceholder/,
    'grouping Workers shows only the placeholder while GROUPING_WORKERS_CONTENT_ENABLED is off',
  );

  assert.match(groupingWorkersPage, /GROUPING_WORKERS_CONTENT_ENABLED/);
  assert.doesNotMatch(
    groupingWorkersPage,
    /LANDING_CONTENT_ENABLED \|\| GROUPING_WORKERS_CONTENT_ENABLED/,
  );
  assert.match(
    groupingWorkersPage,
    /GROUPING_WORKERS_CONTENT_ENABLED \?[\s\S]*?<PageHeading[\s\S]*?\)\s*:\s*\(\s*<LandingPlaceholder/,
    'unrouted GroupingWorkers page matches the same gate',
  );

  assert.doesNotMatch(dashboard, /groupingOverviewContentEnabled/);
  assert.match(dashboard, /groupingHasDefinedOverview\(grouping\)/);
  assert.match(dashboard, /<LandingPlaceholder/);
  assert.match(dashboard, /<PageHeading/);
  assert.match(dashboard, /<BookingsNeedingAttention/);
  assert.match(dashboard, /<HousesAndCentresPanel/);
  assert.match(source('../src/pages/dashboard/BookingsNeedingAttention.tsx'), />Unfilled shifts:</);
  assert.match(
    source('../src/pages/dashboard/HousesAndCentresPanel.tsx'),
    /dashboardHouseRowPendingLinks/,
  );
  assert.match(
    source('../src/pages/dashboard/HousesAndCentresPanel.tsx'),
    /waitingRequestsForLocation/,
  );
  assert.match(
    source('../src/pages/dashboard/HousesAndCentresPanel.tsx'),
    /futureCancelledBookings/,
  );
  assert.match(
    source('../src/pages/dashboard/HousesAndCentresPanel.tsx'),
    /directChildLocationTypeLine\(location\)/,
  );
  assert.doesNotMatch(dashboard, /Waiting work/);
  assert.doesNotMatch(dashboard, /Platform use/);
  assert.match(bookings, /<BookingsWeek/);
  assert.match(workers, /Your location team/);
  assert.match(messages, /Search messages/);
  assert.match(settings, /function LocationSection/);
  assert.match(settings, /function OrganisationSection/);
  assert.match(settings, /function AccountSection/);
  assert.match(settings, /layout-rail-content/);
  assert.match(settings, /<LandingPlaceholder/);

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
  assert.match(supportables, /DirectChildLocationListIcon location=\{location\}/);
  assert.doesNotMatch(supportables, /LocationMarker/);
  assert.match(
    supportables,
    /mt-1 block text-xs text-text-tertiary">\s*\{directChildLocationTypeLine\(location\)\}/,
  );
  assert.match(
    supportables,
    /className="ui-inset-card flex w-full items-center gap-3 text-left hover:bg-surface-subtle"/,
  );

  assert.match(
    breadcrumb,
    /pendingWork\.length > 0 && \(\s*LANDING_CONTENT_ENABLED \?/,
  );
  assert.match(breadcrumb, /groupingContentsSummary\(item\.grouping\)/);
  assert.match(breadcrumb, /locationTypeSuburbLine\(item\.location\)/);

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
  assert.match(project, /GROUPING_WORKERS_CONTENT_ENABLED/);
  assert.match(project, /GroupingWorkers\.tsx/);
  assert.doesNotMatch(project, /GROUPING_OVERVIEW_CONTENT_GROUPING_IDS/);
});

test('grouping Overview renders only when direct children include locations', () => {
  const dashboard = source('../src/pages/Dashboard.tsx');
  const navigation = source('../src/lib/informationArchitecture.ts');

  assert.doesNotMatch(dashboard, /groupingOverviewContentEnabled/);
  assert.match(dashboard, /groupingHasDefinedOverview\(grouping\)/);
  assert.match(dashboard, /<LandingPlaceholder/);
  assert.match(dashboard, /groupingOverviewHeading\(grouping\.name\)/);
  assert.match(navigation, /export function groupingHasDefinedOverview/);
  assert.doesNotMatch(navigation, /GROUPING_OVERVIEW_CONTENT_GROUPING_IDS/);
  assert.doesNotMatch(navigation, /groupingOverviewContentEnabled/);
});
