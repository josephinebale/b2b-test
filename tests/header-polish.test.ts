import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  visibleBreadcrumbItems,
  type BreadcrumbCrumb,
} from '../src/lib/breadcrumb.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('location markers use the medium square token without a border or ring', () => {
  const marker = source('../src/components/LocationMarker.tsx');

  assert.match(marker, /\bh-9 w-9\b/);
  assert.match(marker, /\brounded-lg\b/);
  assert.doesNotMatch(marker, /\b(?:border|ring)(?:-\S+)?\b/);
});

test('the account trigger is avatar and chevron; name, role and team live in the open menu', () => {
  const header = source('../src/components/AppHeader.tsx');
  const avatars = source('../src/data/avatars.ts');
  const trigger = header.slice(
    header.indexOf('<Button'),
    header.indexOf('{accountMenu.open &&'),
  );
  const menu = header.slice(header.indexOf('{accountMenu.open &&'));

  assert.match(trigger, /<Avatar name=\{persona\.name\} size="sm" \/>/);
  assert.match(trigger, /<ChevronDown/);
  assert.doesNotMatch(trigger, /\{persona\.role\}/);
  assert.doesNotMatch(trigger, /persona\.team/);
  assert.doesNotMatch(trigger, /truncate text-sm font-bold/);

  assert.match(menu, /\{persona\.name\}/);
  assert.match(menu, /\{persona\.role\}/);
  assert.match(menu, /persona\.team \? ` · \$\{persona\.team\}`/);
  assert.match(avatars, /import helenDawson from '\.\.\/assets\/avatars\/helen-dawson\.jpg';/);
  assert.match(avatars, /'Helen Dawson': helenDawson/);
});

test('the account trigger is 36px tall with no extra vertical padding', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');
  const avatar = source('../src/components/Avatar.tsx');

  assert.match(header, /<Avatar name=\{persona\.name\} size="sm" \/>/);
  assert.match(header, /size="default"/);
  assert.match(css, /\.ui-button--default \{\s*height: 2\.25rem;\s*padding: 0 var\(--space-4\);/);
  assert.match(avatar, /\bblock shrink-0\b/);
});

test('the account remains a centred trigger in the identity row', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');
  const avatar = source('../src/components/Avatar.tsx');

  assert.match(
    css,
    /\.header-menu-trigger \{[\s\S]*?height: 2\.25rem;[\s\S]*?align-items: center;[\s\S]*?gap: var\(--space-3\);/,
  );
  assert.match(header, /className="header-menu-trigger"/);
  assert.match(header, /NodeBreadcrumb|app-header-nav-row/);
  assert.doesNotMatch(header, /items-baseline/);
  assert.doesNotMatch(avatar, /\balign-(?:middle|baseline|top|bottom|text-\S+)\b/);
});

test('the account stays at 28px while the breadcrumb uses text only', () => {
  const header = source('../src/components/AppHeader.tsx');
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const marker = source('../src/components/LocationMarker.tsx');
  const css = source('../src/index.css');

  assert.match(
    css,
    /\.header-menu-trigger \{[\s\S]*?border: 1px solid var\(--color-border\);[\s\S]*?background: var\(--color-surface\);/,
  );
  assert.match(css, /--avatar-sm: 1\.75rem;/);
  assert.match(header, /<Avatar name=\{persona\.name\} size="sm" \/>/);
  assert.doesNotMatch(breadcrumb, /LocationMarker/);
  assert.match(marker, /sm: 'h-7 w-7/);
  assert.match(marker, /md: 'h-9 w-9/);
  assert.match(marker, /size = 'md'/);
  assert.match(marker, /\{initials\(location\.name\)\}/);
});

test('the header has a 56px identity row and 48px location navigation row', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');
  const row = header.match(/className="app-header-row[^"]*"/)?.[0] ?? '';

  assert.match(css, /--header-identity-height:\s*3\.5rem;/);
  assert.match(css, /--header-nav-height:\s*3rem;/);
  assert.match(css, /\.app-header-row\s*\{\s*height: var\(--header-identity-height\);/);
  assert.match(header, /height: 'var\(--header-identity-height\)'/);
  assert.match(row, /app-header-row/);
  assert.doesNotMatch(row, /\bpy-\d/);
  assert.match(header, /app-header-identity|app-header-nav-row/);
});

test('the header scrolls with the page rather than staying pinned', () => {
  const header = source('../src/components/AppHeader.tsx');
  const request = source('../src/pages/BookingRequest.tsx');

  assert.match(header, /<header className="app-header z-20">/);
  assert.doesNotMatch(header, /sticky top-0/);
  /* Summary used to sit 128px down to clear a pinned header. */
  assert.match(request, /<Card as="aside" className="sticky top-8 p-5">/);
  assert.doesNotMatch(request, /sticky top-32/);
});

test('header and footer logos keep their distinct compact sizes', () => {
  const logo = source('../src/components/Logo.tsx');

  assert.match(logo, /const height = compact \? 18 : 24;/);
});

test('the one header row centres the block logo between shared edges', () => {
  const header = source('../src/components/AppHeader.tsx');
  const logo = source('../src/components/Logo.tsx');

  assert.match(
    header,
    /app-header-row[^"]*\bflex\b[^"]*\bitems-center\b[^"]*\bjustify-between\b/,
  );
  assert.match(
    logo,
    /className=\{compact \? 'block w-auto' : 'block h-6 w-auto'\}/,
  );
});

test('section labels carry weight, and the active one is bold with a 3px underline', () => {
  const navigation = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(navigation, /main-nav-link--active font-bold text-text/);
  assert.match(navigation, /font-medium text-text-strong/);
  assert.match(css, /\.main-nav-link--active\s*\{\s*border-bottom-color: var\(--color-text\);/);
  assert.match(css, /\.main-nav-link \{[\s\S]*?border-bottom: 3px solid transparent;/);
  /* The hover fill keeps the 150ms ease the product uses for row and card
     colour changes (there is no motion token to point at), but the underline
     is left out of it: it arrives with the label's step to 700, and font
     weight cannot be timed to match. */
  assert.match(
    css,
    /\.main-nav-link \{[^}]*transition: background-color 150ms ease;/,
  );
  assert.doesNotMatch(css, /\.main-nav-link \{[^}]*border-color 150ms/);
});

/* The nav used to paint one frame with nothing selected while entering a
   location: the node changed in a click handler, and the hash the same handler
   wrote only reached the router when the browser fired `hashchange` in a later
   task. Two things close that: `navigate` tells the route subscribers itself,
   and the nav resolves a location's `/` to the page App redirects it to. */
test('the section nav knows its active item on the first render of a location', () => {
  const navigation = source('../src/components/AppHeader.tsx');
  const router = source('../src/lib/router.ts');

  assert.match(
    navigation,
    /const navPath = nodeType === 'location' && path === '\/' \? '\/bookings' : path;/,
  );
  assert.match(navigation, /navPath\.startsWith\(item\.path\)/);
  assert.match(router, /const routeListeners = new Set<\(\) => void>\(\);/);
  assert.match(router, /routeListeners\.add\(onChange\)/);
  assert.match(router, /routeListeners\.delete\(onChange\)/);
  assert.match(
    router,
    /export function navigate\([\s\S]*?for \(const listener of \[\.\.\.routeListeners\]\) \{\s*listener\(\);/,
  );
});

/* A label that steps from 500 to 700 changes width, so every item after it
   moved along the row on each nav change. */
test('each section label reserves its bold width so the row cannot shift', () => {
  const navigation = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(
    navigation,
    /<span className="main-nav-label" data-label=\{visibleLabel\}>/,
  );
  assert.match(css, /\.main-nav-label \{[^}]*display: grid;/);
  assert.match(
    css,
    /\.main-nav-label::after \{\s*content: attr\(data-label\);\s*font-weight: var\(--font-weight-bold\);\s*visibility: hidden;/,
  );
});

/* The bottom edge used to be a box-shadow on the header, drawn to sit under the
   active underline. With no nav row at a grouping it was the only thing at that
   edge and read as a shadow; at a location the 3px underline swallowed it. */
test('one hairline closes the header at both node types', () => {
  const css = source('../src/index.css');

  assert.match(
    css,
    /\.app-header \{[^}]*border-bottom: 1px solid var\(--color-border-subtle\);/,
  );
  assert.doesNotMatch(css, /\.app-header \{[^}]*box-shadow/);
  assert.match(
    css,
    /\.app-header-identity:not\(:last-child\) \{\s*border-bottom: 1px solid var\(--color-border-subtle\);/,
  );
});

test('badges are 18px square so two digits keep air around them', () => {
  const css = source('../src/index.css');

  assert.match(css, /\.ui-badge[\s\S]*?min-width: 1\.125rem;/);
  assert.match(css, /\.ui-badge[\s\S]*?height: 1\.125rem;/);
  assert.match(css, /\.ui-badge[\s\S]*?padding-inline: calc\(var\(--space-1\) \* 1\.5\);/);
  assert.match(css, /\.ui-badge[\s\S]*?font-variant-numeric: tabular-nums;/);
  assert.match(css, /\.header-utility \.ui-badge[\s\S]*?position: absolute;/);
});

/* An inline-flex control inside a block wrapper sits on a text baseline, which
   adds descender space below it and pushes the whole control off centre. */
test('the account control is a flex child so no baseline gap offsets it', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /<div className="relative flex items-center">/);
});

test('the header carries hierarchy in the breadcrumb', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /<Logo \/>/);
  assert.match(header, /NodeBreadcrumb|h-6 w-px[^"]*bg-border-subtle/);
});

test('badge digits sit on a zero line-height flex centre', () => {
  const badge = source('../src/components/ui/Badge.tsx');

  assert.match(
    badge,
    /className="ui-badge ui-badge--attention inline-flex items-center justify-center leading-none"/,
  );
});

test('the breadcrumb stays inline while each eligible crumb owns a menu', () => {
  const header = source('../src/components/AppHeader.tsx');
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(header, /NodeBreadcrumb/);
  assert.match(breadcrumb, /aria-label="Breadcrumb"/);
  assert.match(breadcrumb, /useKeyboardMenu/);
  assert.match(breadcrumb, /role="menu"/);
  assert.match(breadcrumb, /aria-haspopup="menu"/);
  assert.doesNotMatch(breadcrumb, /role="tree"|LocationSwitcher/);
});

function charWidthMeasure(item: {
  type: 'ellipsis' | 'crumb';
  crumb?: BreadcrumbCrumb;
}): number {
  if (item.type === 'ellipsis') return 12;
  const label = item.crumb?.label ?? '';
  return item.crumb?.role === 'current' ? label.length * 8 : label.length * 7;
}

const helenCrumbs: BreadcrumbCrumb[] = [
  { id: 'org', label: 'Cerebral Palsy Alliance', role: 'organisation' },
  { id: 'cpa-sil', label: 'SIL', role: 'ancestor' },
  { id: 'northern-sydney', label: 'Northern Sydney', role: 'ancestor' },
  { id: 'dee-why-1', label: 'Dee Why 1', role: 'current' },
];

const rachelCrumbs: BreadcrumbCrumb[] = [
  { id: 'org', label: 'Cerebral Palsy Alliance', role: 'organisation' },
  { id: 'cpa-careforce', label: 'Careforce', role: 'ancestor' },
  { id: 'careforce-area', label: 'Careforce area', role: 'current' },
];

const careforceArmCrumbs: BreadcrumbCrumb[] = [
  { id: 'org', label: 'Cerebral Palsy Alliance', role: 'organisation' },
  { id: 'cpa-careforce', label: 'Careforce', role: 'current' },
];

const longestSeededCrumbs: BreadcrumbCrumb[] = [
  { id: 'org', label: 'Cerebral Palsy Alliance', role: 'organisation' },
  { id: 'cpa-careforce', label: 'Careforce', role: 'ancestor' },
  { id: 'careforce-area', label: 'Careforce area', role: 'ancestor' },
  {
    id: 'careforce-northern-caseload',
    label: 'Careforce Northern caseload',
    role: 'ancestor',
  },
  { id: 'chatswood-home', label: 'Noah Williams', role: 'current' },
];

/* The identity row as it is rendered: page inset, the logo block before the
   breadcrumb, the row gap, and the utilities that keep their own width. */
const PAGE_INSET = 32;
const LOGO_BLOCK = 79 + 24 + 1 + 24;
const ROW_GAP = 16;
const UTILITIES = 36 + 12 + 84;

function breadcrumbSpace(windowWidth: number): number {
  const row = Math.min(windowWidth, 1440) - PAGE_INSET * 2;
  return row - LOGO_BLOCK - ROW_GAP - UTILITIES;
}

test('the breadcrumb is measured against the space beside it, not its own box', () => {
  const header = source('../src/components/AppHeader.tsx');
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(header, /<div className="flex min-w-0 flex-1 items-center gap-6">/);
  assert.match(header, /<div className="flex shrink-0 items-center justify-end gap-3">/);
  assert.doesNotMatch(
    header,
    /className="flex flex-1 items-center justify-end gap-3"/,
  );
  assert.match(breadcrumb, /ref=\{spaceRef\}/);
  assert.match(breadcrumb, /flex min-w-0 flex-1 items-center gap-1 text-sm/);
  assert.doesNotMatch(breadcrumb, /<nav ref=/);
});

test('the full path renders until a measurement proves it does not fit', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');

  assert.match(breadcrumb, /availableWidth !== null && availableWidth > 0/);
  assert.match(breadcrumb, /!measured \|\| !mediumFont/);
});

test('no seeded path truncates at a 1376px window', () => {
  const space = breadcrumbSpace(1376);

  [careforceArmCrumbs, rachelCrumbs, helenCrumbs, longestSeededCrumbs].forEach(
    (crumbs) => {
      const items = visibleBreadcrumbItems(crumbs, space, charWidthMeasure);
      assert.ok(
        items.every((item) => item.type === 'crumb'),
        `${crumbs.map((crumb) => crumb.label).join(' > ')} should render whole at 1376px`,
      );
      assert.equal(items.length, crumbs.length);
    },
  );
});

test('the longest seeded path only drops an ancestor on a much narrower window', () => {
  let firstTruncating = 0;
  for (let width = 1440; width >= 320; width -= 1) {
    const items = visibleBreadcrumbItems(
      longestSeededCrumbs,
      breadcrumbSpace(width),
      charWidthMeasure,
    );
    if (items.some((item) => item.type === 'ellipsis')) {
      firstTruncating = width;
      break;
    }
  }

  assert.ok(
    firstTruncating < 1200,
    `the longest path should survive well below 1376px, first dropped at ${firstTruncating}px`,
  );
  assert.ok(
    firstTruncating > 900,
    `expected the longest path to need a narrow window, first dropped at ${firstTruncating}px`,
  );
});

test('breadcrumb truncation keeps the current node and drops ancestors from the left', () => {
  const wide = visibleBreadcrumbItems(helenCrumbs, 1000, charWidthMeasure);
  assert.deepEqual(
    wide.map((item) => (item.type === 'ellipsis' ? '…' : item.crumb.label)),
    ['Cerebral Palsy Alliance', 'SIL', 'Northern Sydney', 'Dee Why 1'],
  );

  const tight = visibleBreadcrumbItems(helenCrumbs, 280, charWidthMeasure);
  assert.equal(tight[0]?.type, 'ellipsis');
  assert.equal(tight.at(-1)?.type, 'crumb');
  if (tight.at(-1)?.type === 'crumb') {
    assert.equal(tight.at(-1).crumb.role, 'current');
    assert.equal(tight.at(-1).crumb.label, 'Dee Why 1');
  }
  assert.ok(
    !tight.some(
      (item) => item.type === 'crumb' && item.crumb.role === 'organisation',
    ),
  );
  assert.equal(
    tight.filter((item) => item.type === 'ellipsis').length,
    1,
  );
});

test('breadcrumb truncation is decided by width, not crumb count', () => {
  const shortFour = visibleBreadcrumbItems(
    [
      { id: 'a', label: 'A', role: 'organisation' },
      { id: 'b', label: 'B', role: 'ancestor' },
      { id: 'c', label: 'C', role: 'ancestor' },
      { id: 'd', label: 'D', role: 'current' },
    ],
    200,
    charWidthMeasure,
  );
  assert.ok(shortFour.every((item) => item.type === 'crumb'));

  const twoLong = visibleBreadcrumbItems(
    [
      { id: 'org', label: 'Cerebral Palsy Alliance', role: 'organisation' },
      {
        id: 'here',
        label: 'Northern Lifestyles',
        role: 'current',
      },
    ],
    200,
    charWidthMeasure,
  );
  assert.equal(twoLong[0]?.type, 'ellipsis');
  assert.equal(twoLong.length, 2);
});

test('Rachel and Helen keep their current labels when the trail is squeezed', () => {
  const rachelTight = visibleBreadcrumbItems(rachelCrumbs, 250, charWidthMeasure);
  assert.equal(rachelTight.at(-1)?.type, 'crumb');
  if (rachelTight.at(-1)?.type === 'crumb') {
    assert.equal(rachelTight.at(-1).crumb.label, 'Careforce area');
  }

  const helenNarrow = visibleBreadcrumbItems(helenCrumbs, 250, charWidthMeasure);
  if (helenNarrow.at(-1)?.type === 'crumb') {
    assert.equal(helenNarrow.at(-1).crumb.label, 'Dee Why 1');
  }
});

test('the breadcrumb never clips a crumb label and the ellipsis restores hidden navigation', () => {
  const breadcrumb = source('../src/components/NodeBreadcrumb.tsx');
  const current = breadcrumb.slice(
    breadcrumb.indexOf('aria-current="page"'),
  );

  assert.match(breadcrumb, /visibleBreadcrumbItems/);
  assert.match(breadcrumb, /ResizeObserver/);
  assert.doesNotMatch(breadcrumb, /\btruncate\b/);
  const ellipsis = breadcrumb.slice(
    breadcrumb.indexOf('function EllipsisMenu'),
    breadcrumb.indexOf('function trailCrumbs'),
  );
  assert.match(ellipsis, /…/);
  assert.match(ellipsis, /<button/);
  assert.match(ellipsis, /hiddenCrumbs/);
  const organisation = breadcrumb.slice(
    breadcrumb.indexOf('function OrganisationCrumb'),
    breadcrumb.indexOf('function siblingItems'),
  );
  assert.match(organisation, /onSelectOrganisation/);
  assert.match(organisation, /<button/);
  assert.doesNotMatch(current, /\btruncate\b/);
});

test('the logo and account align without pull-backs', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(
    css,
    /\.header-menu-trigger \{[\s\S]*?padding: 0 var\(--space-2\);/,
  );
  assert.doesNotMatch(header, /-mr-4/);
  assert.doesNotMatch(css, /margin-inline-start: calc\(-1 \* var\(--space-2\)\)/);

  assert.match(header, /items-center justify-between gap-4 px-8/);
  assert.doesNotMatch(header, /-ml-/);
  assert.match(header, /NodeBreadcrumb/);
});

test('every section link fills its row so one underline serves it', () => {
  const navigation = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(navigation, /app-header-nav-row[^"]*items-stretch/);
  assert.match(navigation, /main-nav-link h-full shrink-0 text-sm/);
  assert.match(
    css,
    /\.main-nav-link \{[\s\S]*?align-items: center;[\s\S]*?border-bottom: 3px solid transparent;/,
  );
});

test('hovering a section link fills the whole block in an existing quiet surface', () => {
  const css = source('../src/index.css');

  assert.match(css, /\.main-nav-link \{[\s\S]*?padding-inline: var\(--space-3\);/);
  assert.match(css, /\.main-nav-link:hover \{\s*background: var\(--color-info-surface\);\s*\}/);
  assert.doesNotMatch(css, /\.main-nav-link:hover \{[^}]*border-bottom-color/);
});

test('the section block starts on the content line without a pull-back', () => {
  const navigation = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  // No pull-left on the section nav, and no per-item padding exception, so every hover
  // fill and underline is the same shape and the first one starts on the line.
  assert.doesNotMatch(navigation, /<nav[^>]*-ml-3/);
  assert.doesNotMatch(css, /\.main-nav-link:first-child/);
});

test('the footer centres its compact logo against the link line boxes', () => {
  const footer = source('../src/components/AppFooter.tsx');
  const logo = source('../src/components/Logo.tsx');

  assert.match(footer, /flex max-w-page flex-wrap items-center/);
  assert.match(logo, /className=\{compact \? 'block w-auto' : 'block h-6 w-auto'\}/);
  assert.match(logo, /const height = compact \? 18 : 24;/);
});
