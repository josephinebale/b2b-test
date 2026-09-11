import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { findGrouping, groupingPath } from '../src/data/locations.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('grouping paths run from the root grouping to the current grouping', () => {
  const nested = findGrouping('careforce-caseload');
  const root = findGrouping('northern-sydney');
  assert.ok(nested && root);

  assert.deepEqual(
    groupingPath(nested).map(({ id }) => id),
    ['careforce-area', 'careforce-caseload'],
  );
  assert.deepEqual(
    groupingPath(root).map(({ id }) => id),
    ['northern-sydney'],
  );
});

test('the breadcrumb links ancestor groupings and marks the current node', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(breadcrumb, /aria-label="Breadcrumb"/);
  assert.match(breadcrumb, /groupingPath\(grouping\)/);
  assert.match(breadcrumb, /onSelectGrouping\(segment\.id\)/);
  assert.match(breadcrumb, /aria-current="page"/);
  assert.match(breadcrumb, /\{segment\.name\}/);
  assert.match(breadcrumb, /\{location\.name\}/);
  assert.doesNotMatch(breadcrumb, /useKeyboardMenu|aria-haspopup|ChevronDown/);
});

test('the breadcrumb uses the location name without a redundant marker', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const marker = source('../src/components/LocationMarker.tsx');

  assert.match(breadcrumb, /\{location\.name\}/);
  assert.doesNotMatch(breadcrumb, /LocationMarker/);
  assert.match(marker, /sm: 'h-7 w-7 rounded-lg'/);
  assert.match(marker, /\{initials\(location\.name\)\}/);
  assert.doesNotMatch(marker, /size === 'inline'|slice\(0, 1\)/);
});

test('the header restores the breadcrumb and logo divider', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /NodeBreadcrumb/);
  assert.match(header, /h-6 w-px[^"]*bg-border-subtle/);
  assert.doesNotMatch(header, /LocationSwitcher/);
});
