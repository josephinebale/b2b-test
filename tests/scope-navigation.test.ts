import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('the signed-in shell does not reserve a persistent scope rail', () => {
  const app = source('../src/App.tsx');
  const css = source('../src/index.css');

  assert.match(css, /--narrow-column-width:\s*20rem;/);
  assert.match(
    css,
    /\.width-main-column \{[\s\S]*?max-width: min\([\s\S]*?calc\(100% - var\(--narrow-column-width\) - var\(--main-column-gap\)\)/,
  );
  assert.doesNotMatch(app, /<ScopeRail|import \{ ScopeRail \}/);
});

test('the tried scope rail is removed', () => {
  const railPath = new URL('../src/components/ScopeRail.tsx', import.meta.url);
  assert.equal(existsSync(railPath), false);
});

test('location sections return to the header and grouping has no second tier', () => {
  const navPath = new URL(
    '../src/components/SectionNavigation.tsx',
    import.meta.url,
  );
  assert.equal(existsSync(navPath), false);
  const app = source('../src/App.tsx');
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /NODE_NAV_ITEMS\.filter/);
  assert.match(header, /visibleNavItems\.length > 1/);
  assert.match(header, /app-header-nav-row/);
  assert.doesNotMatch(app, /<SectionNavigation|import \{ SectionNavigation \}/);
  const groupingShell = app.slice(
    app.indexOf("if (nodeType === 'grouping')"),
    app.indexOf('if (!activeLocation) return null'),
  );
  assert.doesNotMatch(groupingShell, /<SectionNavigation/);
});

test('the header has identity and location-section tiers', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /<Logo \/>/);
  assert.match(header, /<Bell /);
  assert.match(header, /<Avatar name=\{persona\.name\} size="sm" \/>/);
  assert.match(header, /<NodeBreadcrumb/);
  assert.match(header, /app-header-identity/);
  assert.match(header, /app-header-nav-row/);
  assert.match(header, /main-nav-link/);
});

test('the breadcrumb returns without duplicating the location marker', () => {
  const header = source('../src/components/AppHeader.tsx');
  const breadcrumbPath = new URL(
    '../src/components/NodeBreadcrumb.tsx',
    import.meta.url,
  );
  assert.ok(existsSync(breadcrumbPath), 'NodeBreadcrumb.tsx should exist');
  const breadcrumb = readFileSync(breadcrumbPath, 'utf8');
  const marker = source('../src/components/LocationMarker.tsx');

  assert.match(header, /<NodeBreadcrumb/);
  assert.match(breadcrumb, /\{location\.name\}/);
  assert.doesNotMatch(breadcrumb, /LocationMarker/);
  assert.doesNotMatch(marker, /inline:/);
});
