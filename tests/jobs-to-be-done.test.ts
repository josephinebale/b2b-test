import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('the workbook snapshot is seeded as typed jobs data', async () => {
  const dataSource = source('../src/data/jobsToBeDone.ts');
  const { JOBS_TO_BE_DONE } = await import('../src/data/jobsToBeDone.ts');

  assert.match(dataSource, /organisation: Organisation \| ''/);
  assert.match(dataSource, /sector: Sector \| ''/);
  assert.match(dataSource, /theme: string/);
  assert.match(dataSource, /job: string/);
  assert.match(dataSource, /saidBy: string/);
  assert.match(dataSource, /iaRelevant: boolean/);
  assert.match(dataSource, /resolvesAt: string/);
  assert.match(dataSource, /origin: 'research' \| 'inferred'/);
  assert.match(dataSource, /notAddressedReason\?: string/);
  assert.match(dataSource, /quote\?: string/);
  assert.match(dataSource, /quoteSource\?: string/);
  assert.doesNotMatch(dataSource, /kind:|whatWasSaid:|state:/);
  assert.doesNotMatch(dataSource, /validated\??:/i);
  assert.doesNotMatch(dataSource, /quote: ''/);
  assert.doesNotMatch(dataSource, /quoteSource: ''/);

  assert.equal(JOBS_TO_BE_DONE.length, 126);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => job.origin === 'research').length, 117);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => job.origin === 'inferred').length, 9);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => job.iaRelevant).length, 75);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => !job.iaRelevant).length, 51);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => job.resolvesAt).length, 55);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => !job.resolvesAt).length, 71);
  assert.equal(new Set(JOBS_TO_BE_DONE.map((job) => job.id)).size, 126);
  assert.ok(
    JOBS_TO_BE_DONE.filter((job) => job.origin === 'research').every(
      (job) =>
        job.organisation &&
        job.sector &&
        job.theme &&
        job.job &&
        job.saidBy &&
        typeof job.iaRelevant === 'boolean' &&
        typeof job.resolvesAt === 'string',
    ),
  );
  assert.ok(
    JOBS_TO_BE_DONE.filter(
      (job) => job.origin === 'inferred' && job.saidBy === '',
    ).every(
      (job) =>
        job.organisation === '' &&
        job.sector === '' &&
        Boolean(job.notAddressedReason),
    ),
  );
  assert.ok(
    JOBS_TO_BE_DONE.every(
      (job) =>
        (job.quote && job.quoteSource) || (!job.quote && !job.quoteSource),
    ),
  );
  assert.ok(JOBS_TO_BE_DONE.every((job) => job.quote !== '' && job.quoteSource !== ''));
  assert.equal(
    JOBS_TO_BE_DONE[0].resolvesAt,
    'Location > Bookings > Request',
  );
});

test('inferred jobs and recorded gaps carry the TARGET-IA reasons', async () => {
  const { JOBS_TO_BE_DONE } = await import('../src/data/jobsToBeDone.ts');
  const byId = Object.fromEntries(
    JOBS_TO_BE_DONE.map((job) => [job.id, job]),
  );

  assert.equal(
    byId['job-120']?.job,
    'Fill shifts at more than one house in one pass instead of repeating the same request',
  );
  assert.equal(
    byId['job-121']?.job,
    'See my own structure rather than every house underneath it, when I stand above several groupings',
  );
  assert.equal(
    byId['job-122']?.job,
    'Tell one service arm from another inside the same organisation',
  );
  assert.equal(
    byId['job-123']?.job,
    'Find a supportable, client or worker by name from anywhere in the organisation',
  );
  assert.equal(
    byId['job-124']?.job,
    'Turn down the region-wide traffic I do not need to see',
  );
  assert.equal(
    byId['job-125']?.job,
    'Record what I think of a worker so the next manager has it',
  );
  assert.equal(
    byId['job-126']?.job,
    'Know whether an unfilled shift leaves the house short, not just that the request is old',
  );
  assert.equal(byId['job-120']?.iaRelevant, true);
  assert.equal(byId['job-124']?.iaRelevant, true);
  assert.equal(byId['job-125']?.iaRelevant, false);
  assert.equal(byId['job-126']?.iaRelevant, false);

  for (const id of ['job-043', 'job-044', 'job-111']) {
    assert.equal(byId[id]?.resolvesAt, '');
    assert.match(
      byId[id]?.notAddressedReason ?? '',
      /location switcher was removed/i,
    );
    assert.match(
      byId[id]?.notAddressedReason ?? '',
      /grouping and back down/i,
    );
  }

  assert.match(
    byId['job-078']?.notAddressedReason ?? '',
    /participants, not a funding line that splits the worker pool/i,
  );
  assert.match(
    byId['job-079']?.notAddressedReason ?? '',
    /participants, not a funding line that splits the worker pool/i,
  );
  assert.match(
    byId['job-023']?.notAddressedReason ?? '',
    /provider's own rostering system/i,
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
  assert.doesNotMatch(page, /<AppFooter/);
  assert.doesNotMatch(page, /description=/);
  assert.doesNotMatch(page, /Quotes are unedited session transcript/);
  assert.doesNotMatch(page, /IA jobs|Parked jobs|kind="ia"|kind="parked"/);
});

test('jobs can be filtered cumulatively by organisation, sector, theme, origin and status', () => {
  const page = source('../src/pages/JobsToBeDone.tsx');

  assert.match(page, /organisationFilter/);
  assert.match(page, /sectorFilter/);
  assert.match(page, /themeFilter/);
  assert.match(page, /originFilter/);
  assert.match(page, /statusFilter/);
  assert.doesNotMatch(page, /iaFilter/);
  assert.doesNotMatch(page, /All IA relevance/);
  assert.match(page, /ORGANISATIONS/);
  assert.match(page, /SECTORS/);
  assert.match(page, /JOB_THEMES/);
  assert.match(page, /!organisationFilter \|\| job\.organisation === organisationFilter/);
  assert.match(page, /!sectorFilter \|\| job\.sector === sectorFilter/);
  assert.match(page, /job\.theme === themeFilter/);
  assert.match(page, /job\.origin === originFilter/);
  assert.match(page, /statusFilter === 'addressed' \? Boolean\(job\.resolvesAt\) : !job\.resolvesAt/);
  assert.match(page, /All organisations/);
  assert.match(page, /All sectors/);
  assert.match(page, /All themes/);
  assert.match(page, /All origins/);
  assert.match(page, /<option value="research">Validated<\/option>/);
  assert.match(page, /<option value="inferred">Inferred<\/option>/);
  assert.match(page, /All statuses/);
  assert.match(page, /Addressed/);
  assert.match(page, /Not addressed yet/);
  assert.match(page, /No jobs match these filters/);
});

test('rows show every public workbook field without the removed detail expand', () => {
  const page = source('../src/pages/JobsToBeDone.tsx');

  assert.match(page, /\{job\.job\}/);
  assert.match(page, /\{job\.saidBy\}/);
  assert.match(page, /\{job\.organisation\}/);
  assert.match(page, /\{sectorLabel\(job\.sector\)\}/);
  assert.match(page, /\{job\.theme\}/);
  assert.doesNotMatch(page, /IA relevant/);
  assert.match(
    page,
    /<span className="font-bold text-text">Addressed, where it resolves:<\/span> \{job\.resolvesAt\}/,
  );
  assert.doesNotMatch(page, /<Tag>Not addressed yet<\/Tag>/);
  assert.match(
    page,
    /<span className="font-bold text-text">Not addressed yet:<\/span> \{job\.notAddressedReason\}/,
  );
  assert.match(
    page,
    /<span className="font-bold text-text">Not addressed yet<\/span>/,
  );
  assert.match(page, /job\.notAddressedReason/);
  assert.match(page, /tone="validated">Validated/);
  assert.match(page, /tone="pending">Inferred/);
  assert.doesNotMatch(page, /What they said|\{job\.state\}/);
  assert.doesNotMatch(page, /validated\?:|Notes/);
});

test('a source expander renders only when a job has a quote', () => {
  const page = source('../src/pages/JobsToBeDone.tsx');
  const expanderStart = page.indexOf('{job.quote ? (');
  const expander = page.slice(
    expanderStart,
    page.indexOf('</details>', expanderStart) + '</details>'.length,
  );

  assert.match(page, /job\.quote \?/);
  assert.match(expander, /<details/);
  assert.match(expander, /open:\[&>summary>:last-child\]:rotate-180/);
  assert.match(
    expander,
    /<summary className="ui-link inline-flex cursor-pointer list-none items-center gap-1/,
  );
  assert.match(expander, /\[&::-webkit-details-marker\]:hidden/);
  assert.match(expander, /<span>Source<\/span>/);
  assert.match(expander, /<ChevronDown className="h-4 w-4 shrink-0 transition-transform"/);
  assert.doesNotMatch(expander, /flex-1|w-full|font-bold|text-sm font-bold|text-text-tertiary|gap-2|gap-3|h-5 w-5/);
  assert.match(expander, /\{job\.quote\}/);
  assert.match(expander, /\{job\.quoteSource\}/);
  assert.doesNotMatch(expander, /max-w-content/);
  assert.match(expander, /text-text-secondary/);
  assert.match(expander, /ui-inset-(compact|row|card)/);
  assert.doesNotMatch(expander, /<blockquote|italic|font-italic|"\{job\.quote\}"/);

  const css = source('../src/index.css');
  assert.match(css, /summary\.ui-link \{[\s\S]*text-decoration: none;/);
  assert.match(css, /summary\.ui-link > span \{[\s\S]*text-decoration: underline;/);
  assert.match(css, /summary\.ui-link:hover > span \{[\s\S]*text-decoration: none;/);
});

test("Dorothy's jobs carry session quotes except the two inferred records", async () => {
  const { JOBS_TO_BE_DONE } = await import('../src/data/jobsToBeDone.ts');
  const byId = Object.fromEntries(
    JOBS_TO_BE_DONE.map((job) => [job.id, job]),
  );
  const dorothy = JOBS_TO_BE_DONE.filter((job) => job.saidBy === 'Dorothy');

  assert.equal(dorothy.length, 45);
  assert.equal(dorothy.filter((job) => job.quote).length, 43);
  assert.ok(
    dorothy
      .filter((job) => job.quote)
      .every(
        (job) =>
          job.origin === 'research' &&
          job.quoteSource?.startsWith('Dorothy · ') &&
          (job.quoteSource.includes('prototype session') ||
            job.quoteSource.includes('structure session')),
      ),
  );

  assert.equal(byId['job-011']?.origin, 'inferred');
  assert.equal(byId['job-011']?.saidBy, 'Dorothy');
  assert.equal(byId['job-011']?.quote, undefined);
  assert.equal(byId['job-011']?.quoteSource, undefined);

  assert.equal(byId['job-042']?.origin, 'inferred');
  assert.equal(byId['job-042']?.saidBy, 'Dorothy');
  assert.equal(byId['job-042']?.quote, undefined);
  assert.equal(byId['job-042']?.quoteSource, undefined);

  assert.match(byId['job-039']?.job ?? '', /Rhea/);
  assert.doesNotMatch(byId['job-039']?.job ?? '', /Ria/);

  assert.equal(
    byId['job-001']?.quote,
    "if we were managing Hireup, as you know, we've exhausted all internal options and now Hireup is our remaining option to choose from",
  );
  assert.equal(
    byId['job-001']?.quoteSource,
    'Dorothy · prototype session · 47:17',
  );
  assert.equal(
    byId['job-014']?.quoteSource,
    'Dorothy · structure session · 55:30',
  );
  assert.equal(
    byId['job-020']?.quote,
    'I would still be going back to the staff in that particular group home to go, okay, if I was to book someone from higher up, who would be my best bets to book? Like, who is your— who are the staff that you know that are familiar, that know the— know the site, know the operations?',
  );
});

test("Elise, Carlos, Sufi and Suman's jobs carry session quotes", async () => {
  const { JOBS_TO_BE_DONE } = await import('../src/data/jobsToBeDone.ts');
  const byId = Object.fromEntries(
    JOBS_TO_BE_DONE.map((job) => [job.id, job]),
  );

  const elise = JOBS_TO_BE_DONE.filter((job) => job.saidBy === 'Elise');
  const carlos = JOBS_TO_BE_DONE.filter((job) => job.saidBy === 'Carlos');
  const sufi = JOBS_TO_BE_DONE.filter((job) => job.saidBy === 'Sufi');
  const suman = JOBS_TO_BE_DONE.filter((job) => job.saidBy === 'Suman');

  assert.equal(elise.length, 18);
  assert.equal(elise.filter((job) => job.quote).length, 18);
  assert.ok(
    elise.every(
      (job) =>
        job.origin === 'research' &&
        job.quoteSource?.startsWith('Elise · structure session · '),
    ),
  );

  assert.equal(carlos.length, 6);
  assert.equal(carlos.filter((job) => job.quote).length, 6);
  assert.ok(
    carlos.every(
      (job) =>
        job.origin === 'research' &&
        job.quoteSource?.startsWith('Carlos · Northcott session · '),
    ),
  );

  assert.equal(sufi.length, 21);
  assert.equal(sufi.filter((job) => job.quote).length, 21);
  assert.ok(
    sufi.every(
      (job) =>
        job.origin === 'research' &&
        job.quoteSource?.startsWith('Sufi · Northcott session · '),
    ),
  );

  assert.equal(suman.length, 29);
  assert.equal(suman.filter((job) => job.quote).length, 29);
  assert.ok(
    suman.every(
      (job) =>
        job.origin === 'research' &&
        job.quoteSource?.startsWith(
          'Suman · Life Without Barriers session · ',
        ),
    ),
  );

  assert.equal(JOBS_TO_BE_DONE.filter((job) => job.quote).length, 117);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => !job.quote).length, 9);

  assert.equal(
    byId['job-002']?.quote,
    "once they've exhausted their own workforce, it comes to Careforce and then they hand it over to us, get back to their day job, and then we do our best to fill the job, the shift",
  );
  assert.equal(
    byId['job-002']?.quoteSource,
    'Elise · structure session · 44:14',
  );
  assert.equal(
    byId['job-064']?.quoteSource,
    'Carlos · Northcott session · 01:20',
  );

  assert.equal(
    byId['job-077']?.job,
    "Save a worker and know where they've been saved to",
  );
  assert.equal(
    byId['job-077']?.quote,
    'If I go to save, is that going to say— what is it going to save under?',
  );
  assert.equal(byId['job-077']?.origin, 'research');

  assert.equal(
    byId['job-089']?.job,
    "Post a job, believing that's what the booking request already does",
  );
  assert.equal(
    byId['job-089']?.quote,
    'Posting a job? Yeah. So request booking, right?',
  );
  assert.equal(byId['job-089']?.origin, 'research');

  assert.equal(
    byId['job-088']?.quote,
    'Oh, it was, uh, it was, uh, Sharni. Sharni. Yeah. So it was a one-to-one.',
  );
  assert.equal(
    byId['job-088']?.quoteSource,
    'Sufi · Northcott session · 41:01 · she dates it at 40:45: it was probably almost more than a year, I believe',
  );

  assert.equal(
    byId['job-091']?.quoteSource,
    'Suman · Life Without Barriers session · 02:36',
  );
  assert.equal(
    byId['job-102']?.job,
    "Assume a worker with lapsed credentials won't be shown at all",
  );
  assert.equal(
    byId['job-102']?.quote,
    "I believe if, you know, support workers wouldn't be active if their mandatory credentials failed, or, you know, they needed— it needed to be renewed, or vice versa. Am I right?",
  );
  assert.equal(byId['job-102']?.origin, 'research');
});

test('the resolves path reads as row metadata below the tags', () => {
  const page = source('../src/pages/JobsToBeDone.tsx');

  assert.match(page, /<p className="mt-3 text-xs text-text-secondary">/);
  assert.ok(
    page.indexOf('{job.theme}') < page.indexOf('Addressed, where it resolves'),
  );
});

test('job titles use a longer measure than body copy without dropping the cap', () => {
  const page = source('../src/pages/JobsToBeDone.tsx');
  const css = source('../src/index.css');
  const title = page.slice(
    page.indexOf('<h3'),
    page.indexOf('</h3>') + 5,
  );

  assert.match(title, /max-w-job-title/);
  assert.doesNotMatch(title, /max-w-content/);
  assert.match(css, /--container-job-title:/);
  assert.match(css, /--container-content: 43\.75rem/);
});

test('every job row has a metadata line for addressed and unaddressed states', () => {
  const page = source('../src/pages/JobsToBeDone.tsx');

  assert.doesNotMatch(page, /<Tag>Not addressed yet<\/Tag>/);
  assert.match(
    page,
    /<span className="font-bold text-text">Addressed, where it resolves:<\/span> \{job\.resolvesAt\}/,
  );
  assert.match(
    page,
    /job\.notAddressedReason \? \([\s\S]*Not addressed yet:<\/span> \{job\.notAddressedReason\}/,
  );
  assert.match(
    page,
    /<span className="font-bold text-text">Not addressed yet<\/span>/,
  );
  assert.doesNotMatch(
    page,
    /Not addressed yet:<\/span>\s*<\/p>/,
  );
});
