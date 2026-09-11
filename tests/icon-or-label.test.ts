import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

/* A control earns an icon or a label, not both. Two things are exempt because
   they are not decoration: an avatar is identity, and a chevron says that a
   menu opens. */

test('header utility controls are icon and badge, with no text label', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.doesNotMatch(header, /MessageSquare|href=\{\s*href\('\/messages'\)/);
  assert.match(header, /<Bell className="h-5 w-5"/);
  assert.doesNotMatch(header, /<span>Messages<\/span>|<span>Notifications<\/span>/);
  assert.match(header, /<Badge count=\{unreadNotifications\}/);
});

test('Messages sits in location section navigation with an inline badge like Bookings', () => {
  const header = source('../src/components/AppHeader.tsx');
  const navigation = source('../src/lib/informationArchitecture.ts');

  assert.match(
    navigation,
    /label: 'Messages',[\s\S]*?path: '\/messages',[\s\S]*?nodeTypes: \['location'\],[\s\S]*?placement: 'main'/,
  );
  assert.match(header, /NODE_NAV_ITEMS\.filter/);
  assert.match(header, /<span>\{visibleLabel\}<\/span>/);
  assert.match(header, /item\.label === 'Bookings'\s*\? bookingsBadge/);
  assert.match(header, /item\.label === 'Messages'\s*\? unreadMessages/);
  assert.match(header, /item\.label === 'Messages'\s*\? messagesAccessibleName\(unreadMessages\)/);
  assert.doesNotMatch(header, /MessageSquare/);
});

test('the account trigger keeps its avatar and one rotating menu chevron', () => {
  const header = source('../src/components/AppHeader.tsx');
  const trigger = header.slice(
    header.indexOf('<Button'),
    header.indexOf('{accountMenu.open &&'),
  );

  assert.match(trigger, /<Avatar name=\{persona\.name\} size="sm" \/>/);
  assert.match(trigger, /<ChevronDown[\s\S]*?className=\{`h-5 w-5/);
  assert.match(header, /accountMenu\.open \? 'rotate-180'/);
  assert.doesNotMatch(header, /ChevronUp/);
  assert.doesNotMatch(trigger, /\{persona\.role\}/);
  assert.doesNotMatch(trigger, /truncate text-sm font-bold/);
});

test('one-row header controls share one height so their hover states align', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.doesNotMatch(header, /size="small"/);
});

test('the request booking action is a label without a plus icon', () => {
  const heading = source('../src/components/PageHeading.tsx');

  assert.doesNotMatch(heading, /<Plus/);
  assert.doesNotMatch(heading, /lucide-react/);
  assert.match(heading, /Request booking/);
});

test('location worker row actions are icons with accessible labels, not both', () => {
  const panel = source('../src/pages/Workers.tsx');

  assert.match(panel, /<MessageSquare className="h-4 w-4"/);
  assert.match(panel, /<Calendar className="h-4 w-4"/);
  assert.doesNotMatch(panel, />\s*Message\s*</);
  assert.doesNotMatch(panel, />\s*Book\s*</);
  assert.match(panel, /aria-label=\{`Message \$\{worker\.name\}`\}/);
  assert.match(panel, /aria-label=\{`Book \$\{worker\.name\}`\}/);
  assert.match(panel, /data-tooltip=\{`Message \$\{worker\.name\}`\}/);
  assert.match(panel, /data-tooltip=\{`Book \$\{worker\.name\}`\}/);
});

/*
 * One resting state for every icon-only button. A grey fill reads as a tag or a
 * location marker rather than a control, and no chrome at all reads as
 * decoration, so the outline is the single tell. It is the base rule rather than
 * an opt-in prop, so a new icon button cannot ship bare by omitting something.
 */
test('every icon-only button carries an outline at rest', () => {
  const css = source('../src/index.css');
  const iconButton = source('../src/components/ui/IconButton.tsx');
  const panel = source('../src/pages/Workers.tsx');

  assert.match(
    css,
    /\.ui-icon-button \{[\s\S]*?border: 1px solid var\(--color-border\);[\s\S]*?background: var\(--color-surface\);/,
  );
  assert.doesNotMatch(css, /ui-icon-button--bordered|ui-icon-button--subtle/);
  assert.doesNotMatch(iconButton, /bordered/);

  // Chrome now implies pressable, so a disabled control has to say otherwise.
  assert.match(css, /\.ui-icon-button:disabled \{[\s\S]*?opacity: 0\.5;/);

  const actions = panel.slice(panel.indexOf('ui-target-row__action'));
  assert.doesNotMatch(actions, /ui-icon-button--/);
  assert.match(panel, /ui-target-row__action ml-auto flex shrink-0 items-center gap-2/);
});

/*
 * `.ui-icon-button` is unlayered CSS, so its background beats a Tailwind
 * utility. The header's selected state needs a plain class or it silently loses.
 */
test('the header keeps a selected state the base button cannot override', () => {
  const css = source('../src/index.css');
  const header = source('../src/components/AppHeader.tsx');

  assert.match(
    css,
    /\.header-utility--active \{\s*background: var\(--color-surface-selected\);\s*\}/,
  );
  assert.match(header, /header-utility--active/);
  assert.doesNotMatch(header, /bg-surface-selected/);
});

/*
 * One tooltip placement everywhere: under the trigger, centred. A divided card
 * used to clip that off, so the in-card tooltip was flipped to the side. Round
 * the end rows instead and the card no longer has to clip.
 */
test('tooltips sit under their trigger, centred, inside cards too', () => {
  const css = source('../src/index.css');

  assert.match(
    css,
    /\.ui-tooltip::after \{[\s\S]*?top: calc\(100% \+ var\(--space-2\)\);[\s\S]*?left: 50%;[\s\S]*?transform: translateX\(-50%\);/,
  );
  assert.doesNotMatch(css, /\.ui-card \.ui-tooltip::after/);

  assert.match(css, /\.ui-card--divided \{\s*overflow: visible;\s*\}/);
  assert.match(
    css,
    /\.ui-card--divided > :first-child \{[\s\S]*?border-start-start-radius:/,
  );
  assert.match(
    css,
    /\.ui-card--divided > :last-child \{[\s\S]*?border-end-start-radius:/,
  );
});

/*
 * Glyph size is paired to button size so the inset is the same either way: a
 * 20px glyph in the 36px control and a 16px glyph in the 32px one both leave 8px
 * on each side. Every glyph used to be 20px regardless, which left the small
 * button with 6px and made it look tighter than the one beside it.
 */
test('icon size is paired to button size so the inset stays even', () => {
  const week = source('../src/pages/dashboard/BookingsWeek.tsx');
  const workers = source('../src/pages/Workers.tsx');
  const messages = source('../src/pages/Messages.tsx');

  assert.match(week, /<ChevronLeft className="h-4 w-4" \/>/);
  assert.match(week, /<ChevronRight className="h-4 w-4" \/>/);
  assert.match(messages, /<MoreHorizontal className="h-4 w-4" \/>/);

  // The repeated worker-row actions take the same 32px control as the week arrows.
  const actions = workers.slice(workers.indexOf('ui-target-row__action'));
  assert.equal(actions.match(/size="small"/g)?.length, 2);
  assert.match(workers, /<MessageSquare className="h-4 w-4" \/>/);
  assert.match(workers, /<Calendar className="h-4 w-4" \/>/);

  // The 36px controls keep the 20px glyph.
  assert.match(source('../src/components/AppHeader.tsx'), /<Bell className="h-5 w-5" \/>/);
});

/*
 * Row actions need `z-index` to clear the stretched link, but that also makes
 * each row's actions a stacking context, which traps the tooltip inside its own
 * row. A later row then paints over an earlier row's tooltip no matter how high
 * the tooltip's own z-index is, so the hovered row has to be lifted instead.
 */
test('a row tooltip paints above the actions in the rows below it', () => {
  const css = source('../src/index.css');

  assert.match(css, /\.ui-target-row__action \{[\s\S]*?z-index: 2;/);
  assert.match(
    css,
    /\.ui-target-row__action:hover,\s*\.ui-target-row__action:focus-within \{\s*z-index: 3;\s*\}/,
  );
});

test('location worker rows keep actions on the avatar line, aligned right', () => {
  const panel = source('../src/pages/Workers.tsx');
  const row = panel.slice(panel.indexOf('<li'), panel.indexOf('</li>'));

  assert.match(row, /ui-inset-row ui-target-row flex[^"]*items-center gap-3/);
  assert.match(row, /ui-target-row__action ml-auto flex shrink-0 items-center gap-2/);
  assert.doesNotMatch(row, /mt-3/);
  // Repeated actions in a dense list take the 32px control, like the week arrows.
  assert.equal(row.match(/size="small"/g)?.length, 2);
});

test('grouping dashboard worker rows remain oversight without row actions', () => {
  const panel = source('../src/pages/dashboard/WorkersPanel.tsx');

  assert.doesNotMatch(panel, /IconButton|MessageSquare|Calendar|ui-target-row__action/);
});
