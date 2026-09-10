import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

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

test('the account and location triggers share one centred treatment', () => {
  const header = source('../src/components/AppHeader.tsx');
  const switcher = source('../src/components/LocationSwitcher.tsx');
  const css = source('../src/index.css');
  const avatar = source('../src/components/Avatar.tsx');

  assert.match(
    css,
    /\.header-menu-trigger \{[\s\S]*?height: 2\.25rem;[\s\S]*?align-items: center;[\s\S]*?gap: var\(--space-3\);/,
  );
  assert.match(header, /className="header-menu-trigger"/);
  assert.match(switcher, /className="header-menu-trigger location-switcher-trigger/);
  assert.doesNotMatch(header, /items-baseline/);
  assert.doesNotMatch(avatar, /\balign-(?:middle|baseline|top|bottom|text-\S+)\b/);
});

/*
 * Both selectors are contained like the icon buttons beside them. At 36px the
 * avatar and location marker filled the 36px trigger edge to edge, so the border
 * would cut through them — both step down to 28px to leave a content box.
 */
test('the selectors are contained, so their contents step down to 28px', () => {
  const header = source('../src/components/AppHeader.tsx');
  const switcher = source('../src/components/LocationSwitcher.tsx');
  const marker = source('../src/components/LocationMarker.tsx');
  const css = source('../src/index.css');

  assert.match(
    css,
    /\.header-menu-trigger \{[\s\S]*?border: 1px solid var\(--color-border\);[\s\S]*?background: var\(--color-surface\);/,
  );
  assert.match(css, /--avatar-sm: 1\.75rem;/);
  assert.match(header, /<Avatar name=\{persona\.name\} size="sm" \/>/);
  assert.match(switcher, /<LocationMarker location=\{location\} size="sm" \/>/);

  // Only the header trigger shrinks; list rows keep 36px next to a 36px avatar.
  assert.match(marker, /sm: 'h-7 w-7'/);
  assert.match(marker, /md: 'h-9 w-9'/);
  assert.match(marker, /size = 'md'/);
});

test('the identity tier is 56px and the nav tier is 48px', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');
  const row = header.match(/className="app-header-row[^"]*"/)?.[0] ?? '';

  assert.match(css, /--header-identity-height:\s*3\.5rem;/);
  assert.match(css, /--header-nav-height:\s*3rem;/);
  assert.match(css, /\.app-header-row\s*\{\s*height: var\(--header-identity-height\);/);
  assert.match(header, /height: 'var\(--header-identity-height\)'/);
  assert.match(row, /app-header-row/);
  assert.doesNotMatch(row, /\bpy-\d/);
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

test('tier one explicitly centres the block logo between shared edges', () => {
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

test('nav labels carry weight, and the active one is bold with a 3px underline', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(header, /main-nav-link--active font-bold text-text/);
  assert.match(header, /font-medium text-text-strong/);
  assert.match(css, /\.main-nav-link--active\s*\{\s*border-bottom-color: var\(--color-text\);/);
  assert.match(css, /\.main-nav-link \{[\s\S]*?border-bottom: 3px solid transparent;/);
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

/*
 * The hairline between the logo and the location switcher is gone. It existed to
 * separate the logo from a borderless trigger; now the trigger is a bordered box,
 * so the line and the border were two separators doing one job.
 */
test('tier one separates the logo from the switcher with the trigger border alone', () => {
  const header = source('../src/components/AppHeader.tsx');
  const [identityTier] = header.split('app-header-nav-row');

  assert.doesNotMatch(identityTier, /h-6 w-px/);
  assert.match(identityTier, /<Logo \/>[\s\S]*?<LocationSwitcher/);
});

test('badge digits sit on a zero line-height flex centre', () => {
  const badge = source('../src/components/ui/Badge.tsx');

  assert.match(
    badge,
    /className="ui-badge ui-badge--attention inline-flex items-center justify-center leading-none"/,
  );
});

test('the location switcher sits in tier one without a negative margin', () => {
  const header = source('../src/components/AppHeader.tsx');
  const switcher = source('../src/components/LocationSwitcher.tsx');
  const [identityTier, navTier] = header.split('app-header-nav-row');

  assert.match(identityTier, /<LocationSwitcher/);
  assert.doesNotMatch(navTier, /<LocationSwitcher|h-6 w-px/);
  assert.doesNotMatch(switcher, /-ml-2/);
});

/*
 * Both pull-backs are gone. They existed because each trigger's inset was
 * invisible, so the marker and avatar had to be dragged out to the page edge and
 * the lockup gap to line up with the logo. Now the bordered box is the visible
 * edge and aligns on those itself; keeping the pulls would overhang the page
 * padding and crowd the divider.
 */
test('the contained selectors align on their own edges, with no pull-back', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(
    css,
    /\.header-menu-trigger \{[\s\S]*?padding: 0 var\(--space-2\);/,
  );
  assert.doesNotMatch(header, /-mr-4/);
  assert.doesNotMatch(css, /margin-inline-start: calc\(-1 \* var\(--space-2\)\)/);

  // One 24px gap token governs both sides of the divider. The outer row stays
  // at 16px — that gap is between the lockup cluster and the utilities.
  assert.match(header, /items-center justify-between gap-4 px-8/);
  assert.match(header, /<div className="flex min-w-0 items-center gap-6">/);
});

test('every nav link fills the row so one underline serves them all', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(header, /<nav className="flex h-full w-max items-stretch"/);
  assert.match(header, /main-nav-link h-full shrink-0 text-sm/);
  assert.match(
    css,
    /\.main-nav-link \{[\s\S]*?align-items: center;[\s\S]*?border-bottom: 3px solid transparent;/,
  );
});

test('hovering a nav link fills the whole block in an existing quiet surface', () => {
  const css = source('../src/index.css');

  assert.match(css, /\.main-nav-link \{[\s\S]*?padding-inline: var\(--space-3\);/);
  assert.match(css, /\.main-nav-link:hover \{\s*background: var\(--color-info-surface\);\s*\}/);
  assert.doesNotMatch(css, /\.main-nav-link:hover \{[^}]*border-bottom-color/);
});

test('the nav block starts on the same line as the lockup and page heading', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  // No pull-left on the nav, and no per-item padding exception, so every hover
  // fill and underline is the same shape and the first one starts on the line.
  assert.doesNotMatch(header, /<nav className="-ml-3/);
  assert.doesNotMatch(css, /\.main-nav-link:first-child/);
});

test('the footer centres its compact logo against the link line boxes', () => {
  const footer = source('../src/components/AppFooter.tsx');
  const logo = source('../src/components/Logo.tsx');

  assert.match(footer, /flex max-w-page flex-wrap items-center/);
  assert.match(logo, /className=\{compact \? 'block w-auto' : 'block h-6 w-auto'\}/);
  assert.match(logo, /const height = compact \? 18 : 24;/);
});
