import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  LOCATIONS,
  getLocationData,
  providerHoursForWorker,
} from '../src/data/locations.ts';
import { questionById } from '../src/data/discussionQuestions.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('provider hours total completed work for the active provider only', () => {
  const location = LOCATIONS[0];
  const worker = getLocationData(location.id).workers[0];
  const expected = LOCATIONS
    .filter((item) => item.organisation === location.organisation)
    .flatMap((item) => getLocationData(item.id).bookings)
    .filter((booking) => booking.workerId === worker.id && booking.status === 'ended')
    .reduce(
      (hours, booking) =>
        hours + (booking.end.getTime() - booking.start.getTime()) / 36e5,
      0,
    );

  assert.equal(
    providerHoursForWorker(worker.id, location.organisation),
    expected,
  );
});

test('platform-held medication and driving assessments are seeded for provider workers', () => {
  const workers = LOCATIONS.flatMap(
    (location) => getLocationData(location.id).workers,
  );
  assert.ok(workers.length > 0);
  assert.ok(
    workers.every(
      (worker) =>
        typeof worker.assessments.medication === 'boolean' &&
        typeof worker.assessments.driving === 'boolean',
    ),
  );
  assert.ok(workers.some((worker) => worker.assessments.medication));
  assert.ok(workers.some((worker) => !worker.assessments.medication));
  assert.ok(workers.some((worker) => worker.assessments.driving));
  assert.ok(workers.some((worker) => !worker.assessments.driving));
});

test('worker rows lead with varied evidence and demote repeated statuses', () => {
  const workers = source('../src/pages/Workers.tsx');
  const row = workers.slice(
    workers.indexOf('function renderWorkerRow'),
    workers.indexOf('function SearchWorkers'),
  );

  assert.match(workers, /hours at this provider/);
  assert.match(workers, /Medication assessment/);
  assert.match(workers, /Driving assessment/);
  assert.match(workers, /supportPlanStatus: supportPlanLabel\(worker\.planConfirmed\)/);
  assert.match(workers, /location\.bookingCount/);
  assert.match(row, /\{worker\.evidence\}[\s\S]*?\{worker\.supportPlanStatus\}[\s\S]*?assessmentSummary/);
  assert.match(workers, /needsAttentionClass\(worker\.supportPlanNeedsAttention\)/);
  assert.match(workers, /needsAttentionClass\(!assessments\.medication\)/);
  assert.match(workers, /needsAttentionClass\(!assessments\.driving\)/);
  assert.doesNotMatch(workers, /detail: `Known at \$\{data\.location\.name\}/);
});

test('every location worker row carries message and book actions', () => {
  const workers = source('../src/pages/Workers.tsx');
  const row = workers.slice(
    workers.indexOf('function renderWorkerRow'),
    workers.indexOf('function SearchWorkers'),
  );

  assert.match(row, /href=\{href\('\/messages'\)\}/);
  assert.match(row, /aria-label=\{`Message \$\{worker\.name\}`\}/);
  assert.match(row, /href=\{href\('\/request-booking'\)\}/);
  assert.match(row, /aria-label=\{`Book \$\{worker\.name\}`\}/);
  assert.equal(row.match(/size="small"/g)?.length, 2);
});

test('worker selection uses the same provider hours and assessment evidence', () => {
  const request = source('../src/pages/BookingRequest.tsx');

  assert.match(request, /providerHoursForWorker/);
  assert.match(request, /hours at this provider/);
  assert.match(request, /Medication assessment/);
  assert.match(request, /Driving assessment/);
  assert.match(request, /supportPlanLabel\(worker\.planConfirmed\)/);
  assert.doesNotMatch(request, /workerRow\(worker, `Known at \$\{data\.location\.name\}`/);
});

test('booking cards and details retain duration without vehicle allowance', () => {
  const cards = source('../src/pages/Bookings.tsx');
  const detail = source('../src/pages/BookingRequest.tsx');

  assert.match(cards, /durationHours\(booking\)/);
  assert.match(cards, /\{hours\} \{hours === 1 \? 'hour' : 'hours'\}/);
  assert.match(detail, /end\.getTime\(\) - start\.getTime\(\)/);
  assert.doesNotMatch(`${cards}\n${detail}`, /vehicle allowance/i);
});

test('discussion questions cover the new worker-row evidence', () => {
  assert.match(
    questionById('workers-location-tiers')?.text ?? '',
    /hours.*support plan.*assessments/i,
  );
  assert.match(
    questionById('request-workers')?.text ?? '',
    /hours.*support plan.*assessments/i,
  );
});
