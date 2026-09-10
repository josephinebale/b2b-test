import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('the workbook snapshot is seeded as typed jobs data', async () => {
  const dataSource = source('../src/data/jobsToBeDone.ts');
  const { JOBS_TO_BE_DONE } = await import('../src/data/jobsToBeDone.ts');

  assert.match(dataSource, /organisation: Organisation/);
  assert.match(dataSource, /sector: Sector/);
  assert.match(dataSource, /theme: string/);
  assert.match(dataSource, /job: string/);
  assert.match(dataSource, /saidBy: string/);
  assert.match(dataSource, /iaRelevant: boolean/);
  assert.doesNotMatch(dataSource, /kind:|whatWasSaid:|resolvesAt:|state:/);

  assert.equal(JOBS_TO_BE_DONE.length, 119);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => job.iaRelevant).length, 70);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => !job.iaRelevant).length, 49);
  assert.equal(new Set(JOBS_TO_BE_DONE.map((job) => job.id)).size, 119);
  assert.ok(
    JOBS_TO_BE_DONE.every(
      (job) =>
        job.organisation &&
        job.sector &&
        job.theme &&
        job.job &&
        job.saidBy &&
        typeof job.iaRelevant === 'boolean',
    ),
  );
});

test('the jobs screen restores the product header and uses one jobs list', () => {
  const page = source('../src/pages/JobsToBeDone.tsx');
  const app = source('../src/App.tsx');

  assert.match(app, /<JobsToBeDone \/>/);
  assert.match(page, /JOBS_TO_BE_DONE/);
  assert.match(page, /title="Jobs to be done"/);
  assert.match(page, /<header className="app-header">/);
  assert.match(page, /<Logo \/>/);
  assert.match(page, /<JobSection jobs=\{filteredJobs\} \/>/);
  assert.doesNotMatch(page, /description=/);
  assert.doesNotMatch(page, /IA jobs|Parked jobs|kind="ia"|kind="parked"/);
});

test('jobs can be filtered cumulatively by organisation, sector, theme, and IA relevance', () => {
  const page = source('../src/pages/JobsToBeDone.tsx');

  assert.match(page, /organisationFilter/);
  assert.match(page, /sectorFilter/);
  assert.match(page, /themeFilter/);
  assert.match(page, /iaFilter/);
  assert.match(page, /ORGANISATIONS/);
  assert.match(page, /SECTORS/);
  assert.match(page, /JOB_THEMES/);
  assert.match(page, /job\.organisation === organisationFilter/);
  assert.match(page, /job\.sector === sectorFilter/);
  assert.match(page, /job\.theme === themeFilter/);
  assert.match(page, /job\.iaRelevant === \(iaFilter === 'yes'\)/);
  assert.match(page, /All organisations/);
  assert.match(page, /All sectors/);
  assert.match(page, /All themes/);
  assert.match(page, /All IA relevance/);
  assert.match(page, /No jobs match these filters/);
});

test('rows show every public workbook field without the removed detail expand', () => {
  const page = source('../src/pages/JobsToBeDone.tsx');

  assert.match(page, /\{job\.job\}/);
  assert.match(page, /\{job\.saidBy\}/);
  assert.match(page, /\{job\.organisation\}/);
  assert.match(page, /\{sectorLabel\(job\.sector\)\}/);
  assert.match(page, /\{job\.theme\}/);
  assert.match(page, /job\.iaRelevant \? 'IA relevant' : 'Not IA relevant'/);
  assert.doesNotMatch(
    page,
    /<details|What they said|Where it resolves|\{job\.state\}/,
  );
  assert.doesNotMatch(page, /Validated|validated|Notes/);
});
