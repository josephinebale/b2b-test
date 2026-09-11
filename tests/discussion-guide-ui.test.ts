import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('PinnedQuestion uses existing primitives and a calm prominent marker', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');
  const css = source('../src/index.css');

  assert.match(pinned, /<IconButton/);
  assert.match(pinned, /<Card\s+as="section"/);
  assert.match(pinned, /rounded-full bg-text-secondary/);
  assert.doesNotMatch(pinned, /ui-badge|bg-badge|text-badge/);
  assert.doesNotMatch(pinned, /shadow-/);
  assert.match(css, /\.pinned-question-trigger[\s\S]*?height: 1\.75rem;/);
  assert.match(css, /\.pinned-question-trigger[\s\S]*?width: 1\.75rem;/);
  assert.match(css, /\.pinned-question-trigger[\s\S]*?background: var\(--color-neutral-surface\);/);
});

test('PinnedQuestion shows only the canonical question text', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');

  assert.match(pinned, /questionById\(questionId\)/);
  assert.match(pinned, /\{question\.text\}/);
  assert.doesNotMatch(pinned, /<textarea|Answer|Jot down|setSessionQuestionNote/);
});

test('PinnedQuestion follows the persisted annotations visibility state', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');

  assert.match(pinned, /annotationsVisible/);
  assert.match(pinned, /SESSION_QUESTIONS_CHANGE_EVENT/);
  assert.match(pinned, /if \(!question \|\| !annotationsVisible\) return null/);
});

test('PinnedQuestion popovers close with Escape and outside clicks', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');

  assert.match(pinned, /event\.key === 'Escape'/);
  assert.match(pinned, /rootRef\.current\?\.contains/);
  assert.match(pinned, /pointerdown/);
});

test('PinnedQuestion renders its popover outside clipping cards and panes', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');

  assert.match(pinned, /createPortal/);
  assert.match(pinned, /position: 'fixed'/);
  assert.match(pinned, /popoverRef\.current\?\.contains/);
  assert.doesNotMatch(pinned, /className=\{`relative inline-flex/);
});

test('element questions are pinned to every requested page and context', () => {
  const placements: Record<string, string[]> = {
    '../src/pages/dashboard/BookingsWeek.tsx': ['bookings-week'],
    '../src/pages/Workers.tsx': [
      'workers-location-tiers',
      'workers-search',
    ],
    '../src/pages/dashboard/WorkersPanel.tsx': ['workers-grouping-order'],
    '../src/pages/WorkerProfile.tsx': ['workers-profile-context'],
    '../src/pages/Dashboard.tsx': [
      'grouping-locations',
      'grouping-requests',
      'grouping-usage',
    ],
    '../src/pages/Bookings.tsx': [
      'bookings-actions',
      'bookings-status',
      'bookings-filters',
      'booking-card-fatigue',
      'booking-card-participants',
    ],
    '../src/pages/BookingRequest.tsx': [
      'request-location',
      'request-frequency',
      'request-workers',
      'request-worker-fallback',
      'request-worker-fatigue',
      'booking-detail-fatigue',
      'request-participants',
      'request-finance',
    ],
    '../src/pages/Notifications.tsx': ['notifications-list'],
    '../src/pages/Messages.tsx': ['messages-conversations'],
    '../src/components/AppHeader.tsx': ['messages-nav'],
    '../src/pages/Settings.tsx': ['settings-sections'],
    '../src/components/NodeBreadcrumb.tsx': ['access-context'],
  };

  for (const [path, questionIds] of Object.entries(placements)) {
    const contents = source(path);
    for (const questionId of questionIds) {
      assert.match(contents, new RegExp(`questionId="${questionId}"`), `${path} lacks ${questionId}`);
    }
  }
});

test('every moderator control shares one dock', () => {
  const dock = source('../src/components/SessionQuestions.tsx');
  const personaControl = source('../src/components/PageVariantToggle.tsx');
  const app = source('../src/App.tsx');

  assert.doesNotMatch(dock, /annotationsVisible/);
  assert.doesNotMatch(dock, /Show annotations|Hide annotations/);
  assert.doesNotMatch(dock, /<Eye|EyeOff|writeSessionQuestions/);
  assert.match(personaControl, /onSwitchPersona/);
  assert.match(personaControl, /UserRoundCog/);

  /* One dock, one row: the persona menu and restart are both behind-the-scenes
     controls, so they share the corner the dock has always used. */
  assert.equal(dock.match(/session-questions-controls/g)?.length, 1);
  assert.match(dock, /<PageVariantToggle/);
  assert.match(dock, /Restart session/);
  assert.doesNotMatch(personaControl, /session-questions-dock|page-variant-control/);
  assert.doesNotMatch(app, /<PageVariantToggle/);
  assert.match(
    app,
    /<SessionQuestions[\s\S]*currentPersonaId=\{persona\.id\}[\s\S]*onSwitchPersona=\{switchPersona\}[\s\S]*onRestart=\{restart\}/,
  );
  assert.equal(
    existsSync(new URL('../src/components/SessionQuestionsPanel.tsx', import.meta.url)),
    false,
  );
});

test('the annotations control is gone while the discussion question data remains', () => {
  const dock = source('../src/components/SessionQuestions.tsx');
  const questions = source('../src/data/discussionQuestions.ts');
  const session = source('../src/lib/sessionQuestions.ts');
  const pinned = source('../src/components/PinnedQuestion.tsx');

  assert.doesNotMatch(dock, /EyeOff|<Eye /);
  assert.match(questions, /export const DISCUSSION_QUESTIONS/);
  assert.match(questions, /settings-co-design/);
  assert.match(session, /annotationsVisible/);
  assert.match(pinned, /if \(!question \|\| !annotationsVisible\) return null/);
});

test('restart is the last control in the dock, named Restart session', () => {
  const dock = source('../src/components/SessionQuestions.tsx');

  const personaAt = dock.indexOf('<PageVariantToggle');
  const restartAt = dock.indexOf('aria-label="Restart session"');

  assert.ok(personaAt > -1 && restartAt > personaAt, 'restart should follow the persona menu');
  assert.match(dock, /<RotateCcw className="h-5 w-5" \/>/);
  assert.match(dock, /data-tooltip="Restart session"/);
  assert.doesNotMatch(dock, /Restart prototype|Discard this session/);
  assert.doesNotMatch(dock, /aria-label="Start a session"/);
  assert.equal(dock.match(/<IconButton/g)?.length, 1);
});

/* The confirmation has been dropped once already. These assertions are the
   guard: the control must ask, and must only restart on a yes. */
test('the dock control asks before it throws the run away', () => {
  const dock = source('../src/components/SessionQuestions.tsx');

  assert.match(dock, /onClick=\{confirmRestart\}/);
  assert.match(dock, /const confirmRestart = \(\) => \{/);
  assert.match(dock, /window\.confirm\(/);
  assert.match(dock, /if \(confirmed\) onRestart\(\);/);

  /* onRestart may only be reached through the confirming wrapper. */
  assert.equal(dock.match(/onRestart\(\)/g)?.length, 1);
  assert.doesNotMatch(dock, /onClick=\{onRestart\}/);

  /* The dialog carries the consequence. */
  const dialog = dock.match(/window\.confirm\(\s*'([^']+)'/)?.[1] ?? '';
  assert.equal(
    dialog,
    'Restart session? The persona you are signed in as, where you were up to, and any bookings created in this session will be discarded.',
  );
});

test('the docked persona menu opens a list and adds a page variant where available', () => {
  const toggle = source('../src/components/PageVariantToggle.tsx');
  const variants = source('../src/lib/pageVariants.ts');
  const css = source('../src/index.css');

  assert.match(variants, /'\/request-booking': /);
  assert.match(variants, /export function variantLabel/);
  assert.match(toggle, /onSwitchPersona/);
  assert.match(toggle, /role="menu"/);
  assert.match(toggle, /\{label && \(/);
  assert.match(toggle, /aria-pressed=\{active\}/);
  /* One dock in one corner, so there is no second position to keep clear. */
  assert.match(css, /\.session-questions-controls \{[\s\S]*?right: var\(--space-4\);/);
  assert.doesNotMatch(css, /\.page-variant-control/);
});

test('docked tooltips are edge-anchored, so they cannot widen the page', () => {
  const css = source('../src/index.css');
  const docked = css.slice(css.indexOf('.session-questions-controls .ui-tooltip::after'));

  /* Centred on a corner button, a hidden tooltip still overhangs the viewport
     and gives the document a horizontal scrollbar. */
  assert.match(docked, /transform: none;/);
  assert.match(docked, /\.session-questions-controls \.ui-tooltip::after \{[\s\S]*?right: 0;/);
});

test('restart returns the prototype to a location that has never been chosen', () => {
  const app = source('../src/App.tsx');
  const session = source('../src/lib/session.ts');
  const profiles = source('../src/lib/locationProfiles.ts');

  assert.match(session, /export function clearSession\(\)/);
  assert.match(session, /remove\(SIGNED_IN_KEY\)/);
  assert.match(profiles, /export function clearLocationProfiles\(\)/);

  const restart = app.slice(app.indexOf('const restart ='), app.indexOf('const signOut ='));
  assert.match(restart, /clearSession\(\)/);
  assert.match(restart, /clearLocationProfiles\(\)/);
  assert.match(restart, /setLocationId\(null\)/);
  assert.match(restart, /setCreatedBookings\(\[\]\)/);
  assert.match(restart, /setUnreadOverride\(null\)/);
  assert.match(restart, /navigate\('\/'\)/);
});
