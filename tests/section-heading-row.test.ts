import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('SectionHeadingRow is the single Overview section heading structure', () => {
  const row = source('../src/pages/dashboard/SectionHeadingRow.tsx');
  const attention = source('../src/pages/dashboard/BookingsNeedingAttention.tsx');
  const houses = source('../src/pages/dashboard/HousesAndCentresPanel.tsx');
  const workers = source('../src/pages/dashboard/WorkersPanel.tsx');

  assert.match(row, /mb-3 flex items-start justify-between gap-4/);
  assert.match(row, /<div className="min-w-0">/);
  assert.match(row, /<h2 className="text-md font-bold text-text">/);
  assert.match(row, /mt-1 max-w-content text-sm text-text-secondary/);
  assert.match(row, /<LineAlignedControl line="md" className="shrink-0">/);

  assert.match(attention, /import \{ SectionHeadingRow \} from '\.\/SectionHeadingRow'/);
  assert.match(attention, /<SectionHeadingRow/);
  assert.doesNotMatch(attention, /dashboard-section-header__intro/);
  assert.doesNotMatch(attention, /mb-3 flex items-start justify-between gap-4/);

  assert.match(houses, /import \{[\s\S]*SectionHeadingRow[\s\S]*\} from '\.\/SectionHeadingRow'/);
  assert.match(houses, /<SectionHeadingRow/);
  assert.doesNotMatch(houses, /dashboard-section-header__intro/);
  assert.doesNotMatch(houses, /flex items-baseline justify-between/);
  assert.doesNotMatch(houses, /mt-1 flex items-start justify-between/);

  assert.match(workers, /import \{ SectionHeadingRow \} from '\.\/SectionHeadingRow'/);
  assert.match(workers, /<SectionHeadingRow/);
  assert.doesNotMatch(workers, /mb-3 flex items-center justify-between/);
});

test('a control beside text centres on that text line through one shared wrapper', () => {
  const wrapper = source('../src/components/LineAlignedControl.tsx');
  const css = source('../src/index.css');
  const row = source('../src/pages/dashboard/SectionHeadingRow.tsx');
  const heading = source('../src/components/PageHeading.tsx');
  const request = source('../src/pages/BookingRequest.tsx');

  assert.match(wrapper, /line-aligned line-aligned--\$\{line\}/);
  assert.match(
    css,
    /\.line-aligned \{\s*display: flex;\s*align-items: center;\s*height: var\(--line-aligned-height\);/,
  );
  assert.match(css, /\.line-aligned--sm \{\s*--line-aligned-height: var\(--text-sm--line-height\);/);
  assert.match(css, /\.line-aligned--md \{\s*--line-aligned-height: var\(--text-md--line-height\);/);
  assert.match(css, /\.line-aligned--xl \{\s*--line-aligned-height: var\(--text-xl--line-height\);/);

  // One wrapper, three callers: the section aside, the page action, and the
  // checkbox and avatar on a top-aligned worker-selection row.
  for (const caller of [row, heading, request]) {
    assert.match(caller, /import \{ LineAlignedControl \}/);
  }
  assert.match(heading, /className="mb-6 flex items-start justify-between gap-6"/);
  assert.doesNotMatch(heading, /mb-5/);
  assert.match(heading, /<LineAlignedControl line="xl" className="shrink-0 gap-2">/);
  assert.doesNotMatch(heading, /flex shrink-0 items-center gap-2/);
  assert.equal(
    request.match(/<LineAlignedControl line="sm" className="shrink-0">/g)?.length,
    2,
  );
  assert.doesNotMatch(request, /className="mt-2 h-4 w-4 shrink-0"/);
});

test('GroupingLocationSortControl keeps label and select on one inline line', () => {
  const row = source('../src/pages/dashboard/SectionHeadingRow.tsx');

  assert.match(row, /inline-flex shrink-0 items-center gap-2/);
  assert.match(row, /shrink-0 text-xs font-medium text-text">Sort by</);
  assert.match(row, /ui-select ui-select--small w-full/);
  assert.doesNotMatch(row, /<label[\s\S]*Sort by/);
});
