import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PERSONAS } from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('the organisation face is Dashboard only and no persona starts there', () => {
  const navigation = source('../src/lib/informationArchitecture.ts');
  const app = source('../src/App.tsx');
  const page = source('../src/pages/OrganisationDashboard.tsx');
  const target = source('../TARGET-IA.md');

  assert.ok(PERSONAS.every((persona) => persona.entry.nodeType !== 'organisation'));
  assert.match(
    navigation,
    /label: 'Dashboard',[\s\S]*?nodeTypes: \['grouping', 'organisation'\]/,
  );
  assert.doesNotMatch(
    navigation,
    /label: 'Supportables'[\s\S]*?nodeTypes: \[[^\]]*organisation/,
  );
  assert.doesNotMatch(
    navigation,
    /label: 'Workers'[\s\S]*?nodeTypes: \[[^\]]*organisation/,
  );
  assert.match(app, /selectOrganisation/);
  assert.match(app, /writeLastNodeType\('organisation'\)/);
  assert.match(app, /nodeType === 'organisation'/);
  assert.match(app, /<OrganisationDashboard/);
  assert.doesNotMatch(page, /groupingOpenRequests|groupingUsageLast7Days/);
  assert.match(page, /<LandingPlaceholder/);
  assert.doesNotMatch(page, /<PageHeading/);
  assert.match(target, /deliberately undefined/);
  assert.match(target, /regional manager/);
  assert.match(target, /tree has no hole/);
});

test('the organisation crumb name walks up to the organisation Dashboard', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /onSelectOrganisation/);
  assert.match(breadcrumb, /onSelectOrganisation/);
  assert.match(breadcrumb, /crumb\.id === 'organisation'/);
  assert.match(
    breadcrumb,
    /nodeType === 'organisation'[\s\S]*?role: 'current'/,
  );
});
