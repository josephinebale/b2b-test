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
  assert.match(row, /<div className="shrink-0">\{aside\}<\/div>/);

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

test('GroupingLocationSortControl keeps label and select on one inline line', () => {
  const row = source('../src/pages/dashboard/SectionHeadingRow.tsx');

  assert.match(row, /inline-flex shrink-0 items-center gap-2/);
  assert.match(row, /shrink-0 text-xs font-medium text-text">Sort by</);
  assert.match(row, /h-9 w-full appearance-none/);
  assert.doesNotMatch(row, /<label[\s\S]*Sort by/);
});
