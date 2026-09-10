import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

const css = read('../src/index.css');
const source = [
  read('../src/components/PageHeading.tsx'),
  read('../src/pages/Bookings.tsx'),
  read('../src/pages/Messages.tsx'),
  read('../src/pages/Notifications.tsx'),
  read('../src/pages/Workers.tsx'),
  read('../src/pages/dashboard/BookingsWeek.tsx'),
  read('../src/pages/dashboard/NotificationStrip.tsx'),
  read('../src/pages/dashboard/WorkersPanel.tsx'),
].join('\n');

test('type tokens expose only the five requested steps', () => {
  assert.match(css, /--text-xs:\s*0\.75rem/);
  assert.match(css, /--text-sm:\s*0\.875rem/);
  assert.match(css, /--text-md:\s*1rem/);
  assert.match(css, /--text-lg:\s*1\.25rem/);
  assert.match(css, /--text-xl:\s*1\.5rem/);
  assert.doesNotMatch(css, /--text-(?:body|subtitle|title):/);
  assert.doesNotMatch(source, /text-(?:body|subtitle|title)/);
});

test('whole-target rows use one stretched-link treatment', () => {
  assert.match(css, /\.ui-target-row/);
  assert.match(css, /\.ui-target-row__link::after/);
  assert.match(source, /ui-target-row/);
  assert.match(source, /ui-target-row__link/);
});

test('linked cards and target rows share a quiet interactive-surface treatment', () => {
  const week = read('../src/pages/dashboard/BookingsWeek.tsx');
  // The active class is also named inside the hover guard's :not(), so anchor
  // the end of the slice on its own rule rather than the first mention.
  const interaction = css.slice(
    css.indexOf('.ui-target-row,'),
    css.indexOf('\n.ui-target-row--active,'),
  );

  assert.match(week, /className="ui-linked-surface"/);
  assert.match(
    interaction,
    /\.ui-target-row,\s*\.ui-linked-surface > \.ui-card \{[\s\S]*?transition: background-color 150ms ease, border-color 150ms ease;/,
  );
  // The row's hover and active states carry a guard so a nested link can hold
  // them off; the shared surface-subtle / surface-selected pair is the point.
  assert.match(
    interaction,
    /\.ui-target-row[^,]*:hover[^,]*,\s*\.ui-linked-surface:hover > \.ui-card \{[\s\S]*?background: var\(--color-surface-subtle\);/,
  );
  assert.match(
    css,
    /\.ui-target-row[^,]*:active[^,]*,\s*\.ui-linked-surface:active > \.ui-card \{[\s\S]*?background: var\(--color-surface-selected\);/,
  );
  assert.match(
    css,
    /\.ui-linked-surface:hover > \.ui-card--pending \{[\s\S]*?color-mix\([\s\S]*?var\(--color-pending-surface\)[\s\S]*?var\(--color-pending\)/,
  );
  assert.doesNotMatch(interaction, /box-shadow|transform|text-decoration/);
});

/*
 * An entity name that navigates says so at rest. Keying this to the element
 * rather than an opt-in class means a name that opens a profile cannot ship
 * looking like dead text, which is how the Team list read while the dashboard
 * list beside it was blue.
 */
test('an entity name that navigates looks like a link; a label does not', () => {
  // Rendered as a span — Settings people, Choose location — it is a label.
  const entityRule = css.match(/\.ui-entity-link\s*\{([^}]+)\}/)?.[1] ?? '';
  assert.match(entityRule, /color:\s*var\(--color-text-strong\)/);
  assert.match(entityRule, /text-decoration:\s*none/);

  assert.match(
    css,
    /a\.ui-entity-link \{[\s\S]*?color: var\(--color-brand\);[\s\S]*?text-decoration: underline;/,
  );
  assert.match(
    css,
    /a\.ui-entity-link:hover \{[\s\S]*?color: var\(--color-brand-hover\);/,
  );

  // The conversation list opts out: its name selects a conversation in the pane
  // beside it rather than navigating, and the row carries the selected state.
  // The opt-out must match the base rule's specificity and come after it.
  assert.match(
    css,
    /a\.ui-entity-link--plain \{[\s\S]*?color: var\(--color-text-strong\);[\s\S]*?text-decoration: none;/,
  );
  assert.ok(
    css.indexOf('a.ui-entity-link--plain {') > css.indexOf('a.ui-entity-link {'),
  );
  assert.match(read('../src/pages/Messages.tsx'), /ui-entity-link--plain/);
});

/*
 * A week-grid card is a link with no text inside it that could carry the cue —
 * the worker name in it opens the booking, not a profile, so styling it as a
 * link would promise the wrong destination. The tile itself has to read as
 * pressable instead.
 */
test('a linked grid card reads as a pressable tile at rest', () => {
  assert.match(
    css,
    /\.ui-linked-surface > \.ui-card--default \{\s*border-color: var\(--color-border\);\s*\}/,
  );

  // Hover moves the fill, the way a pending card in the same grid already does,
  // so the resting border stays put rather than needing a darker step.
  assert.doesNotMatch(css, /\.ui-linked-surface:hover > \.ui-card \{\s*border-color:/);
});

/*
 * A row lights up as a single target. A link inside it that leads somewhere else
 * cannot light up at the same time, or two destinations are highlighted at once
 * and neither is clearly the one a click would follow. Links that ARE their
 * row's own link (Team, Notifications, the dashboard worker list) are excluded —
 * there the row and the link share a destination and should highlight together.
 */
test('a link nested in an interactive surface answers on its own', () => {
  const bookings = read('../src/pages/Bookings.tsx');

  assert.match(
    bookings,
    /ui-target-row__action ui-target-row__link--text ui-nested-link/,
  );

  assert.match(
    css,
    /\.ui-target-row:not\(\.ui-target-row--active\):hover:not\(:has\(\.ui-nested-link:hover\)\)/,
  );
  assert.match(
    css,
    /\.ui-target-row:not\(\.ui-target-row--active\):active:not\(:has\(\.ui-nested-link:hover\)\)/,
  );

  // Dropping the rest-state underline is a change only the link can make, so it
  // cannot be misread as the surface behind it highlighting.
  assert.match(css, /\.ui-nested-link:hover \{\s*text-decoration: none;/);

  // The row's own links keep tinting the row with it.
  assert.doesNotMatch(
    read('../src/pages/Workers.tsx'),
    /ui-nested-link/,
  );
  assert.doesNotMatch(
    read('../src/pages/dashboard/WorkersPanel.tsx'),
    /ui-nested-link/,
  );
});

/*
 * One hover for every text link: lose the rest-state underline and deepen to
 * brand-hover. The nested-link case then differs only in that it also holds the
 * surface behind it at rest, which is the part that disambiguates it.
 */
test('every text link shares one hover treatment', () => {
  for (const rule of [
    /\.ui-link:hover \{[\s\S]*?color: var\(--color-brand-hover\);[\s\S]*?text-decoration: none;/,
    /a\.ui-entity-link:hover \{[\s\S]*?color: var\(--color-brand-hover\);[\s\S]*?text-decoration: none;/,
    /\.ui-target-row__link--text:hover \{[\s\S]*?color: var\(--color-brand-hover\);[\s\S]*?text-decoration: none;/,
  ]) {
    assert.match(css, rule);
  }

  // Hand-rolled link styling is gone, so a new link cannot miss the hover.
  for (const file of [
    '../src/pages/dashboard/WorkersPanel.tsx',
    '../src/pages/dashboard/NotificationStrip.tsx',
    '../src/pages/dashboard/BookingsWeek.tsx',
    '../src/pages/WorkerProfile.tsx',
    '../src/pages/BookingRequest.tsx',
    '../src/pages/Settings.tsx',
  ]) {
    assert.doesNotMatch(read(file), /text-brand underline/);
    assert.doesNotMatch(read(file), /hover:text-brand-hover/);
  }
});

/*
 * The footer used to do the exact inverse — no underline until hover — so
 * hovering meant two opposite things depending on where you were on the page.
 * It stays quiet by colour instead: secondary grey rather than brand blue.
 */
test('footer links stay quiet by colour, not by breaking the hover rule', () => {
  const footer = read('../src/components/AppFooter.tsx');

  assert.doesNotMatch(footer, /hover:underline/);
  assert.equal(footer.match(/className="ui-link ui-link--muted"/g)?.length, 5);

  // Colour only — the underline behaviour is inherited from `.ui-link`, so the
  // variant must sit after it to win on equal specificity.
  assert.match(css, /\.ui-link--muted \{\s*color: var\(--color-text-secondary\);\s*\}/);
  assert.match(css, /\.ui-link--muted:hover \{\s*color: var\(--color-text\);\s*\}/);
  assert.doesNotMatch(css, /\.ui-link--muted[^{]*\{[^}]*text-decoration/);
  assert.ok(css.indexOf('.ui-link--muted') > css.indexOf('.ui-link:hover'));
});
