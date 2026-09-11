import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  GROUPINGS,
  LOCATIONS,
  rootGroupingsForOrganisation,
} from '../src/data/locations.ts';
import {
  ORGANISATIONS,
  PERSONAS,
} from '../src/lib/informationArchitecture.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('the IA screen derives every node instead of hardcoding the tree', () => {
  const page = source('../src/pages/InformationArchitecture.tsx');

  assert.match(page, /PERSONAS/);
  assert.match(page, /GROUPINGS/);
  assert.match(page, /LOCATIONS/);
  assert.match(page, /NODE_NAV_ITEMS/);
  assert.match(page, /ORGANISATIONS\.filter/);
  assert.match(page, /rootGroupingsForOrganisation/);
  assert.match(page, /grouping\.groupingIds/);
  assert.match(page, /grouping\.locationIds/);
  assert.match(page, /serviceTypeLabel/);

  for (const name of [
    ...PERSONAS.map((persona) => persona.name),
    ...GROUPINGS.map((grouping) => grouping.name),
    ...LOCATIONS.map((location) => location.name),
  ]) {
    assert.doesNotMatch(
      page,
      new RegExp(`['"\`]${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`),
      `${name} must come from data`,
    );
  }
});

test('the generated tree starts every organisation at its arm level', () => {
  const page = source('../src/pages/InformationArchitecture.tsx');

  for (const organisation of ORGANISATIONS) {
    const roots = rootGroupingsForOrganisation(organisation);
    assert.ok(roots.length > 0);
    assert.ok(roots.every((root) => root.kind === 'arm'));
  }
  assert.doesNotMatch(page, /function rootGroupings/);
  assert.match(page, /open=\{isEntryBranch/);
  assert.match(page, /containsGrouping\(grouping, selectedPersona\.entry\.groupingId\)/);
});

test('node pages come from one definition shared with signed-in navigation', () => {
  const model = source('../src/lib/informationArchitecture.ts');
  const header = source('../src/components/AppHeader.tsx');
  const page = source('../src/pages/InformationArchitecture.tsx');

  assert.match(model, /export const NODE_NAV_ITEMS/);
  assert.match(
    model,
    /label: 'Workers',[\s\S]*?nodeTypes: \['grouping', 'location'\]/,
  );
  assert.match(
    model,
    /label: 'Supportables',[\s\S]*?path: '\/supportables',[\s\S]*?nodeTypes: \['grouping'\]/,
  );
  assert.match(model, /label: 'Notifications'/);
  assert.match(model, /label: 'Location settings'/);
  assert.match(header, /NODE_NAV_ITEMS/);
  assert.doesNotMatch(header, /const NAV_ITEMS/);
  assert.match(header, /location\?\.serviceType === 'home-community'/);
  assert.match(page, /NODE_NAV_ITEMS\.filter/);
});

test('persona filtering is an organisation boundary, not role permissions', () => {
  const page = source('../src/pages/InformationArchitecture.tsx');

  assert.match(page, /personaFilter/);
  assert.match(page, /All organisations and personas/);
  assert.match(
    page,
    /organisation === selectedPersona\.organisation/,
  );
  assert.match(page, /Starting point/);
  assert.match(page, /Role does not hide anything/);
  assert.match(
    page,
    /everyone at a provider can access and edit anything in their provider.s tree/,
  );
  assert.match(
    page,
    /MVP assumption based on current understanding, not an established finding/,
  );
  assert.match(
    page,
    /A provider configures which node each role lands on/,
  );
  assert.doesNotMatch(page, /disabled|opacity-/);
  assert.doesNotMatch(page, /configured landing point|Available here/);
});

test('the IA screen matches other pre-session screens and uses product chevrons', () => {
  const page = source('../src/pages/InformationArchitecture.tsx');

  assert.match(page, /<header className="app-header">/);
  assert.match(page, /<Logo \/>/);
  assert.match(page, /title="Information architecture"/);
  assert.doesNotMatch(page, /<AppFooter/);
  assert.doesNotMatch(page, /description=/);
  assert.doesNotMatch(page, /Organisations are open by default/);
  /* One page title carries the page. Section titles take the card-title step,
     so nothing competes with it. */
  assert.match(page, /<h2 className="text-sm font-bold text-text">\s*Assumptions\s*<\/h2>/);
  assert.match(page, /<ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">/);
  assert.doesNotMatch(page, /text-lg font-bold/);
  assert.match(page, /text-md font-bold text-text/);
  /* Filter cards are titled on the other list screens, and every inset comes
     from the shared scale rather than one-off padding. */
  assert.match(page, /<h2 className="text-sm font-bold text-text">Filter tree<\/h2>/);
  assert.match(page, /ui-inset-card/);
  assert.match(page, /ui-inset-row/);
  assert.doesNotMatch(page, /px-6 py-/);
  assert.doesNotMatch(page, /tone="subtle"/);
  assert.match(page, /\[&::-webkit-details-marker\]:hidden/);
  assert.match(page, /open:\[&>summary>:last-child\]:rotate-180/);
  assert.doesNotMatch(page, /group-open:rotate-180/);
  assert.match(page, /<details open/);
  assert.match(page, /open=\{isEntryBranch/);
  assert.match(page, /key=\{`\$\{personaFilter\}-\$\{organisation\}`\}/);
});
