import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('Bookings separates navigation and filters with space instead of a redundant line', () => {
  const bookings = source('../src/pages/Bookings.tsx');
  const filterStart = bookings.indexOf('<Card as="section"');
  const beforeFilter = bookings.slice(Math.max(0, filterStart - 160), filterStart);

  assert.doesNotMatch(beforeFilter, /border-t/);
  assert.doesNotMatch(beforeFilter, /pt-4/);
});

test('each Bookings column heads itself, so both headings start level', () => {
  const bookings = source('../src/pages/Bookings.tsx');
  const gridAt = bookings.indexOf('layout-rail-content');
  const titleAt = bookings.indexOf('>Bookings</h1>');
  const viewAt = bookings.indexOf('{activeLabel}</h2>');

  /* Each column opens with its own heading and sets its own gap, so the taller
     right-hand heading cannot push the rail away from the page title. */
  assert.ok(gridAt > -1 && gridAt < titleAt, 'title sits inside the rail grid');
  assert.ok(titleAt < viewAt, 'title column comes first');
  assert.match(
    bookings,
    /<h1 className="text-xl font-bold text-text">Bookings<\/h1>\s*<aside className="mt-6 ui-rail-stack">/,
  );
  assert.match(bookings, /<h2 className="text-lg font-bold text-text">\{activeLabel\}<\/h2>/);
  assert.match(bookings, /Showing \{filteredBookings\.length > 0 \? 1 : 0\}/);
  assert.match(bookings, /<section className="mt-6">/);
});

test('booking prices use a neutral tag because price is information, not status', () => {
  const bookings = source('../src/pages/Bookings.tsx');
  const price = bookings.slice(bookings.indexOf('<Tag tone='), bookings.indexOf('<Tag tone=') + 140);

  assert.match(price, /<Tag tone="neutral"/);
});

test('the Messages search field matches the button height it sits beside', () => {
  const messages = source('../src/pages/Messages.tsx');
  const row = messages.slice(messages.indexOf('<form'), messages.indexOf('</form>'));

  assert.match(row, /className="flex items-center gap-2/);
  assert.match(row, /placeholder="Search messages"[\s\S]*?className="h-9 /);
  assert.doesNotMatch(row, /h-10/);
});

test('the conversation list scrolls inside a shell of definite height', () => {
  const css = source('../src/index.css');
  const messages = source('../src/pages/Messages.tsx');

  assert.match(
    css,
    /\.messages-shell \{\s*height: var\(--messages-shell-height\);\s*grid-template-rows: minmax\(0, 1fr\);/,
  );
  assert.doesNotMatch(css, /--messages-shell-min-height/);
  assert.match(messages, /<ul className="min-h-0 flex-1 overflow-auto">/);
  assert.equal(messages.match(/className="flex min-h-0 min-w-0/g)?.length, 2);
});

test('conversation rows are separated by one line, with none after the last', () => {
  const messages = source('../src/pages/Messages.tsx');
  const row = messages.slice(
    messages.indexOf('visible.map((conversation)'),
    messages.indexOf('</ul>'),
  );

  assert.match(row, /<li key=\{conversation\.id\} className="border-b border-border-subtle last:border-b-0">/);
  assert.doesNotMatch(row, /ui-target-row[^`]*border-b/);
});

test('settings and bookings share one definite active rail treatment', () => {
  const settings = source('../src/pages/Settings.tsx');
  const bookings = source('../src/pages/Bookings.tsx');
  const treatment =
    /flex w-full items-center gap-2 border-l-4 px-3 py-2 text-left text-sm font-bold/;

  for (const [name, rail] of [['settings', settings], ['bookings', bookings]] as const) {
    /* Labels carry weight at rest, and the active row takes a 4px marker over a
       quiet blue fill, so the selected view is legible at a glance. */
    assert.match(rail, treatment, `${name} rail item`);
    assert.match(rail, /border-text bg-info-surface text-text/, `${name} active row`);
    assert.match(rail, /border-transparent text-text-strong hover:bg-surface-selected/, `${name} idle hover`);
    assert.match(rail, /ui-rail-stack/, `${name} 16px gap below the nav`);
    assert.doesNotMatch(rail, /border-l-2 px-3 py-2/, `${name} keeps no thin marker`);
    assert.doesNotMatch(rail, /hover:bg-surface-subtle/, `${name} idle hover matches Bookings`);
  }
});

test('the five rail-content surfaces share column width, alignment, and the 16px stack', () => {
  const css = source('../src/index.css');
  const bookings = source('../src/pages/Bookings.tsx');
  const settings = source('../src/pages/Settings.tsx');
  const profile = source('../src/pages/WorkerProfile.tsx');
  const preview = source('../src/pages/LocationProfilePreview.tsx');
  const messages = source('../src/pages/Messages.tsx');

  assert.match(
    css,
    /\.layout-rail-content \{\s*display: grid;\s*align-items: start;\s*gap: var\(--space-5\);\s*grid-template-columns: var\(--narrow-column-width\) minmax\(0, 1fr\);/,
  );
  assert.match(
    css,
    /\.ui-rail-stack \{\s*display: flex;\s*flex-direction: column;\s*gap: var\(--space-4\);/,
  );

  for (const [name, page] of [
    ['bookings', bookings],
    ['settings', settings],
    ['worker profile', profile],
    ['location-profile preview', preview],
  ] as const) {
    assert.match(page, /layout-rail-content/, `${name} uses the rail layout`);
    assert.match(page, /ui-rail-stack/, `${name} uses the 16px stack`);
  }

  assert.match(messages, /layout-master-detail/);
  assert.doesNotMatch(messages, /layout-rail-content/);
  assert.doesNotMatch(messages, /border-l-4 px-3 py-2/);
  assert.doesNotMatch(messages, /ui-rail-stack/);
});

test('the grouping Overview leads with a full-width unfilled shifts calendar', () => {
  const dashboard = source('../src/pages/Dashboard.tsx');
  const attention = source('../src/pages/dashboard/BookingsNeedingAttention.tsx');
  const workers = source('../src/pages/dashboard/WorkersPanel.tsx');
  const houses = source('../src/pages/dashboard/HousesAndCentresPanel.tsx');
  const layout = dashboard.slice(
    dashboard.indexOf('<div className="layout-content-aside">'),
    dashboard.indexOf('</div>\n        </>'),
  );

  assert.match(dashboard, /groupingOverviewHeading\(grouping\.name\)/);
  assert.match(dashboard, /layout-content-aside/);
  assert.match(dashboard, /flex min-w-0 flex-col gap-8/);
  assert.match(houses, /flex flex-col gap-8/);
  assert.doesNotMatch(
    dashboard.slice(
      dashboard.indexOf('<div className="layout-content-aside">'),
      dashboard.indexOf('</div>\n        </>'),
    ),
    /width-main-column/,
  );
  assert.match(dashboard, /<BookingsNeedingAttention/);
  assert.match(attention, />Unfilled shifts:</);
  assert.match(attention, /<SectionHeadingRow/);
  assert.match(attention, /flex items-center gap-2/);
  assert.match(attention, /WeekScheduleGrid/);
  assert.match(attention, /attentionCardSendLine/);
  assert.match(attention, /formatTime\(booking\.start\)/);
  assert.match(attention, /booking\.locationName/);
  assert.match(
    attention,
    /supportingLine="Times are displayed in the local time of the booking\."/,
  );
  assert.match(
    attention,
    /Times are displayed in the local time of the booking\./,
  );
  assert.doesNotMatch(attention, /<Clock /);
  assert.match(attention, /<Tag tone="neutral">\{inWeek\.length\}<\/Tag>/);
  assert.match(attention, /Nothing waiting/);
  assert.match(attention, /emptyDayClassName="text-center"/);
  assert.doesNotMatch(attention, /bookingParticipantSummary/);
  assert.match(attention, /tone=\{bookingWeekCardTone\(booking\)\}/);
  assert.doesNotMatch(attention, /attentionCardTone/);
  assert.match(attention, /attention-grid-status-pill--pending/);
  assert.match(attention, /attention-grid-status-pill--attention/);
  assert.match(
    attention,
    /flex w-full items-center justify-center rounded px-1\.5 py-1/,
  );
  assert.doesNotMatch(attention, /<Tag tone="pending"/);
  assert.doesNotMatch(attention, /<StatusPill/);
  assert.match(source('../src/lib/pageContent.ts'), /cancelledBy/);
  assert.doesNotMatch(attention, /Confirmed shifts are not shown here/);
  assert.doesNotMatch(attention, /stretchColumns=\{false\}/);
  assert.match(attention, /GROUPING_ATTENTION_GRID_LOCATION_THRESHOLD/);

  const week = source('../src/pages/dashboard/BookingsWeek.tsx');
  assert.match(week, /bookingWeekCardTone\(booking\)/);
  assert.match(week, /attentionCardSendLine\(booking\)/);

  const bookings = source('../src/pages/Bookings.tsx');
  assert.match(bookings, /tone=\{bookingWeekCardTone\(booking\)\}/);
  assert.match(workers, /Recently booked workers/);
  assert.match(workers, /<SectionHeadingRow/);
  assert.match(workers, /View all/);
  assert.doesNotMatch(workers, /View more workers/);
  assert.doesNotMatch(workers, /View workers/);
  assert.doesNotMatch(workers, /See all workers/);
  assert.doesNotMatch(
    workers,
    /Everyone who&apos;s had a shift in the region in the last eight weeks\./,
  );
  assert.match(
    workers,
    /export const GROUPING_OVERVIEW_WORKER_EXCEPTION_TAGS_VISIBLE = false/,
  );
  assert.match(workers, /dashboardWorkerEvidenceLine/);
  assert.match(workers, /dashboardWorkerPrimaryLocation/);
  assert.match(workers, /flex items-center gap-3/);
  assert.match(workers, /min-w-0 flex-1/);
  assert.match(workers, /mt-1 text-xs text-text-tertiary/);
  assert.match(workers, /mt-2 flex flex-wrap gap-2/);
  assert.match(workers, /<Tag[\s\S]*tone="pending"/);
  assert.doesNotMatch(workers, /lines\.join/);
  assert.match(workers, /mt-3 flex flex-wrap items-center gap-2/);
  assert.match(workers, /variant="secondary"/);
  assert.match(workers, /MessageSquare/);
  assert.match(workers, /Calendar/);
  assert.match(workers, />\s*Message\s*</);
  assert.match(workers, />\s*Book\s*</);
  assert.doesNotMatch(workers, /IconButton/);
  assert.match(
    workers,
    /GROUPING_OVERVIEW_WORKER_EXCEPTION_TAGS_VISIBLE \? \([\s\S]*<WorkerExceptionTags/,
  );
  assert.match(workers, /WorkerExceptionTags/);
  assert.match(workers, /onSelectLocation\?\.\(primaryLocationId, '\/messages'\)/);
  assert.match(workers, /onSelectLocation\?\.\(\s*primaryLocationId,\s*'\/request-booking',/);
  assert.match(workers, /className="ui-inset-card"/);
  assert.match(workers, /groupingDashboardWorkers/);
  assert.match(workers, /workers\.slice\(0, WORKERS_PREVIEW\)/);
  assert.match(dashboard, /HousesAndCentresPanel/);
  assert.match(dashboard, /<aside>[\s\S]*<WorkersPanel/);
  assert.match(
    layout,
    /<BookingsNeedingAttention[\s\S]*<HousesAndCentresPanel/,
  );
  assert.doesNotMatch(
    layout.slice(0, layout.indexOf('<aside>')),
    /WorkersPanel/,
  );
  assert.doesNotMatch(dashboard, />Tasks</);
  assert.doesNotMatch(dashboard, /<Badge/);
  assert.match(houses, /waitingRequestsForLocation/);
  assert.match(houses, /futureCancelledBookings/);
  assert.match(houses, /dashboardHouseRowPendingLinks/);
  assert.doesNotMatch(houses, /dashboardAsidePendingLinks/);
  assert.match(houses, /mt-2 flex flex-wrap gap-x-3 gap-y-1/);
  assert.doesNotMatch(houses, /font-medium text-text-strong/);
  assert.match(houses, /\{item\.count\} \{item\.label\}/);
  assert.match(houses, /groupingDirectLocationListLabel/);
  assert.match(houses, /DirectChildLocationListIcon location=\{location\}/);
  assert.match(houses, /Building2/);
  assert.match(houses, /User/);
  assert.match(houses, /DIRECT_CHILD_LOCATION_LIST_ICON_CLASS/);
  assert.match(houses, /directChildLocationTypeLine\(location\)/);
  assert.doesNotMatch(houses, /locationTypeSuburbLine\(location\)/);
  assert.match(
    houses,
    /title=\{groupingDirectLocationListLabel\(housesAndCentres, clients\)\}/,
  );
  assert.doesNotMatch(houses, /title="Clients"/);
  assert.match(houses, /<SectionHeadingRow/);
  assert.match(houses, /GroupingLocationSortControl/);
  assert.match(houses, /groupingDirectChildrenCountLine\(grouping\)/);
  assert.doesNotMatch(houses, /groupingHousesAndCentresCountLine/);
  assert.match(
    source('../src/pages/dashboard/SectionHeadingRow.tsx'),
    /Sort by/,
  );
  const sectionHeadingRow = source('../src/pages/dashboard/SectionHeadingRow.tsx');
  assert.match(sectionHeadingRow, /relative block w-full max-w-xs min-w-0/);
  assert.match(sectionHeadingRow, />Soonest shift</);
  assert.match(sectionHeadingRow, />Most outstanding tasks</);
  assert.match(sectionHeadingRow, />Name A to Z</);
  assert.match(sectionHeadingRow, /ariaLabel = 'Sort locations'/);
  assert.match(sectionHeadingRow, /aria-label=\{ariaLabel\}/);
  assert.match(
    sectionHeadingRow,
    /ui-select ui-select--small w-full/,
  );
  assert.match(sectionHeadingRow, /ChevronDown/);
  assert.match(sectionHeadingRow, /h-4 w-4/);
  assert.doesNotMatch(houses, /Sort by: Soonest shift/);
  assert.doesNotMatch(houses, /SortSelect/);
  assert.match(houses, /sortDashboardAsideLocations/);
  assert.match(houses, /useState<DashboardAsideSort>\('soonest-shift'\)/);
  assert.match(houses, /showSort=\{directLocations\.length >= 2\}/);
  assert.doesNotMatch(houses, /housesSortOption/);
  assert.doesNotMatch(houses, /clientsSortOption/);
  assert.doesNotMatch(houses, /showLocationSort/);
  assert.doesNotMatch(houses, /flex justify-end/);
  assert.match(houses, /groupingDashboardChildren/);
  assert.match(houses, /See all/);
  assert.doesNotMatch(houses, /pendingWorkParts\(/);
});

test('booking detail sections use one 24px gap without a redundant divider', () => {
  const request = source('../src/pages/BookingRequest.tsx');
  const supportDetails = request.slice(
    request.indexOf('>Support details</h2>') - 100,
    request.indexOf('>Support details</h2>'),
  );

  assert.match(supportDetails, /className="mt-6"/);
  assert.doesNotMatch(supportDetails, /border-t|pt-5/);
});
