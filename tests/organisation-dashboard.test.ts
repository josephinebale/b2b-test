import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { rootGroupingsForOrganisation } from '../src/data/locations.ts';
import { PERSONAS } from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('the organisation face is Dashboard and Supportables, and no persona starts there', () => {
  const navigation = source('../src/lib/informationArchitecture.ts');
  const app = source('../src/App.tsx');
  const page = source('../src/pages/OrganisationDashboard.tsx');
  const target = source('../TARGET-IA.md');

  assert.ok(PERSONAS.every((persona) => persona.entry.nodeType !== 'organisation'));
  assert.match(
    navigation,
    /label: 'Dashboard',[\s\S]*?nodeTypes: \['grouping', 'organisation'\]/,
  );
  assert.match(
    navigation,
    /label: 'Supportables',[\s\S]*?nodeTypes: \['grouping', 'organisation'\]/,
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

test('organisation Supportables lists the arms, so the tree is reachable from the top', () => {
  const app = source('../src/App.tsx');
  const page = source('../src/pages/Supportables.tsx');

  assert.deepEqual(
    rootGroupingsForOrganisation('Cerebral Palsy Alliance').map(({ name }) => name),
    ['SIL', 'Lifestyles', 'Careforce'],
  );
  assert.match(page, /rootGroupingsForOrganisation\(/);
  assert.doesNotMatch(page, /organisationSupportablesDescription/);
  assert.match(page, /title=\{treeSectionLabel\(grouping, nodeType\)\}/);
  assert.doesNotMatch(page, /<PageHeading\s+title="Supportables"/);
  assert.match(page, /<ChildGroupingRow/);
  assert.match(page, /groupingContentsSummary\(grouping\)/);
  assert.match(page, /LANDING_CONTENT_ENABLED/);

  assert.match(app, /<Supportables[\s\S]*?nodeType=\{nodeType\}/);
});

test('the organisation keeps its placeholder Dashboard and gains no Workers page', () => {
  const app = source('../src/App.tsx');
  const shell = app.slice(
    app.indexOf("if (nodeType === 'grouping' || nodeType === 'organisation')"),
    app.indexOf('if (!activeLocation) return null'),
  );

  const supportables = shell.indexOf("path === '/supportables'");
  const organisation = shell.indexOf("nodeType === 'organisation' ? (");
  const workers = shell.indexOf("path === '/workers'");

  assert.ok(supportables >= 0 && organisation >= 0 && workers >= 0);
  assert.ok(
    supportables < organisation,
    'Supportables resolves before the organisation falls back to its Dashboard',
  );
  assert.ok(
    organisation < workers,
    'Workers stays a grouping page, so the organisation falls back to Dashboard',
  );
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
