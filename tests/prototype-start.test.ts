import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('a session landing appears before login on a fresh or restarted run', () => {
  const app = source('../src/App.tsx');
  const landing = source('../src/pages/SessionLanding.tsx');
  const start = source('../src/pages/PrototypeStart.tsx');

  assert.match(app, /const \[started, setStarted\] = useState\(readPrototypeStarted\)/);
  assert.match(app, /if \(!started\)/);
  assert.match(app, /<SessionLanding/);
  assert.match(app, /<PrototypeStart\s+onStart=/);
  assert.ok(
    app.indexOf('if (!started)') <
      app.indexOf("if (nodeType === 'location' && !activeLocation)"),
  );
  const unstarted = app.slice(
    app.indexOf('if (!started)'),
    app.indexOf('if (!signedIn)'),
  );
  assert.match(unstarted, /<SessionLanding/);
  assert.match(unstarted, /<PrototypeStart/);

  assert.match(landing, /Play the prototype/);
  assert.match(landing, /Jobs to be done/);
  assert.match(landing, /Information architecture/);
  assert.match(landing, /ui-linked-surface/);
  assert.match(landing, /href\(JOBS_TO_BE_DONE_ROUTE\)/);
  assert.match(landing, /href\(INFORMATION_ARCHITECTURE_ROUTE\)/);
  /* Titles carry the meaning; the heading and cards have no supporting copy. */
  assert.doesNotMatch(landing, /This screen is for you/);
  assert.doesNotMatch(landing, /Enter as a signed-in manager/);
  assert.doesNotMatch(landing, /Review the jobs this product/);
  assert.doesNotMatch(landing, /Review the proposed structure/);
  /* An icon that identifies the card leads it, the way every other list and
     row in the product places one. The right stays free for actions. */
  for (const [icon, title] of [
    ['AppWindow', 'Play the prototype'],
    ['ListChecks', 'Jobs to be done'],
    ['Network', 'Information architecture'],
  ]) {
    const card = landing.slice(
      landing.indexOf(`<${icon} className=`),
      landing.indexOf(title),
    );
    assert.match(card, /^<\w+ className="h-5 w-5 shrink-0 text-text-strong" \/>/);
    assert.ok(card.length > 0, `${icon} must lead ${title}`);
  }

  /* Login is still the existing card, after a persona is chosen. */
  assert.match(start, /<Logo/);
  assert.match(start, /<Card className="w-full max-w-md /);
  assert.match(start, />\s*Log in to Hireup\s*</);
  assert.match(start, />\s*Login\s*</);
  assert.doesNotMatch(start, /<input|type="email"|type="password"/);
  assert.doesNotMatch(start, /Start prototype/);
  assert.doesNotMatch(start, /Play the prototype/);
});

test('play opens a pre-session persona picker grouped like the moderator menu', () => {
  const landing = source('../src/pages/SessionLanding.tsx');
  const dock = source('../src/components/PageVariantToggle.tsx');
  const app = source('../src/App.tsx');

  assert.match(landing, /personasForOrganisation/);
  assert.match(landing, /VISIBLE_ORGANISATIONS\.map/);
  assert.match(
    landing,
    /persona\.sector === 'aged care' \? 'Aged care' : 'Disability'/,
  );
  assert.match(landing, /persona\.team \? ` · \$\{persona\.team\}` : ''/);
  assert.match(dock, /persona\.role/);
  assert.match(app, /pendingPersonaId/);
  assert.match(app, /setPendingPersonaId/);
  /* Participants never see this picker once the prototype has started. */
  assert.doesNotMatch(
    app.slice(app.indexOf('if (!signedIn)')),
    /<SessionLanding/,
  );

  assert.match(landing, /title="Choose a persona"/);
  assert.doesNotMatch(landing, /<AppFooter/);
  assert.doesNotMatch(landing, /Pick who you will enter as/);
  /* Same grouping heading as the moderator menu: more space above than
     below, so it attaches to the rows it governs rather than reading as one. */
  const groupingHeading =
    /px-3 pb-1 pt-2 text-xs font-bold text-text-secondary/;
  assert.match(dock, /px-3 pb-1 text-xs font-bold text-text-secondary/);
  assert.match(landing, groupingHeading);
  assert.doesNotMatch(landing, /<Card divided>/);
  assert.doesNotMatch(landing, /SessionQuestions/);
});

test('the pre-session research routes are built', () => {
  const app = source('../src/App.tsx');
  const router = source('../src/lib/router.ts');

  assert.match(router, /JOBS_TO_BE_DONE_ROUTE = '\/jobs-to-be-done'/);
  assert.match(
    router,
    /INFORMATION_ARCHITECTURE_ROUTE = '\/information-architecture'/,
  );
  assert.match(app, /JOBS_TO_BE_DONE_ROUTE/);
  assert.match(app, /INFORMATION_ARCHITECTURE_ROUTE/);
  assert.match(app, /<JobsToBeDone \/>/);
  assert.match(app, /<InformationArchitecture \/>/);
});

test('starting is remembered, while restart clears it back to the landing', () => {
  const app = source('../src/App.tsx');
  const session = source('../src/lib/session.ts');

  assert.match(session, /const PROTOTYPE_STARTED_KEY = 'hm\.prototypeStarted'/);
  assert.match(session, /export function readPrototypeStarted/);
  assert.match(session, /export function writePrototypeStarted/);
  assert.match(session, /clearSession[\s\S]*remove\(PROTOTYPE_STARTED_KEY\)/);

  assert.match(app, /writePrototypeStarted\(true\)/);
  assert.match(app, /setStarted\(true\)/);
  const restart = app.slice(app.indexOf('const restart ='), app.indexOf('const signOut ='));
  assert.match(restart, /setStarted\(false\)/);
  assert.match(restart, /setPendingPersonaId\(null\)/);
  assert.doesNotMatch(restart, /PrototypeStart/);
});

test('log in as a new user returns to the landing instead of Helen', () => {
  const app = source('../src/App.tsx');
  const signedOut = app.slice(
    app.indexOf('onSignInAsNewUser'),
    app.indexOf('if (nodeType === \'location\' && !activeLocation)'),
  );

  assert.match(signedOut, /writePrototypeStarted\(false\)/);
  assert.match(signedOut, /setStarted\(false\)/);
  assert.match(signedOut, /setPendingPersonaId\(null\)/);
  assert.doesNotMatch(signedOut, /switchPersona\(PERSONAS\[0\]\.id\)/);
});
