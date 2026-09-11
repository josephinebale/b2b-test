import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { workerIdFromPath, workerProfilePath } from '../src/lib/pageContent.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('worker profile routes use the worker id under Workers', () => {
  assert.equal(workerProfilePath('eleni-p'), '/workers/eleni-p');
  assert.equal(workerIdFromPath('/workers/eleni-p'), 'eleni-p');
  assert.equal(workerIdFromPath('/workers'), null);
});

test('the app renders worker profiles at a location, not from grouping oversight', () => {
  const app = source('../src/App.tsx');
  const groupingBranch = app.slice(
    app.indexOf("if (nodeType === 'grouping')"),
    app.indexOf('if (!activeLocation)'),
  );

  assert.match(app, /import \{ WorkerProfile \}/);
  assert.match(app, /path\.startsWith\(`\$\{WORKERS_ROUTE\}\/`\)/);
  assert.match(
    app,
    /<WorkerProfile[\s\S]*data=\{visibleData\}[\s\S]*workerId=\{workerIdFromPath\(path\)\}/,
  );
  assert.match(app, /grouping=\{grouping\}/);
  assert.doesNotMatch(groupingBranch, /WorkerProfile|WORKERS_ROUTE/);
});

test('the worker profile adapts the reference into existing product primitives', () => {
  const profile = source('../src/pages/WorkerProfile.tsx');

  assert.match(profile, /<PageHeading/);
  assert.match(profile, /layout-rail-content/);
  assert.match(profile, /<Avatar name=\{worker\.name\}/);
  assert.match(profile, /About/);
  assert.match(profile, /Availability/);
  assert.match(profile, /Support offered/);
  assert.match(profile, /Verified documents/);
  assert.match(profile, /Qualifications/);
  assert.match(profile, /Work history/);
  assert.match(profile, /Worker not found/);
});

test('worker-name links open profiles where action is supported, not on grouping oversight', () => {
  const workers = source('../src/pages/Workers.tsx');
  const dashboardWorkers = source('../src/pages/dashboard/WorkersPanel.tsx');
  const bookings = source('../src/pages/Bookings.tsx');
  const messages = source('../src/pages/Messages.tsx');

  assert.match(workers, /href=\{href\(workerProfilePath\(worker\.id\)\)\}/);
  assert.doesNotMatch(dashboardWorkers, /workerProfilePath|href=\{href\(/);
  assert.match(bookings, /workerProfilePath\(worker\.id\)/);
  assert.match(messages, /href=\{href\(workerProfilePath\(selected\.id\)\)\}/);
  assert.match(messages, /selectConversation\(conversation\)/);
});
