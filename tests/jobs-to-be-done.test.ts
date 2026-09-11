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
  assert.match(dataSource, /previousResolvesAt: string/);
  assert.match(dataSource, /origin: 'research' \| 'inferred'/);
  assert.match(dataSource, /notAddressedReason\?: string/);
  assert.match(dataSource, /quote\?: string/);
  assert.match(dataSource, /quoteSource\?: string/);
  assert.match(dataSource, /export const SESSION_RECORDINGS/);
  assert.match(dataSource, /export function sessionUrlFromQuoteSource/);
  assert.doesNotMatch(dataSource, /kind:|whatWasSaid:|state:/);
  assert.doesNotMatch(dataSource, /validated\??:/i);
  assert.doesNotMatch(dataSource, /quote: ''/);
  assert.doesNotMatch(dataSource, /quoteSource: ''/);

  assert.equal(JOBS_TO_BE_DONE.length, 126);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => job.origin === 'research').length, 119);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => job.origin === 'inferred').length, 7);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => job.iaRelevant).length, 75);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => !job.iaRelevant).length, 51);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => job.resolvesAt).length, 4);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => !job.resolvesAt).length, 122);
  assert.equal(new Set(JOBS_TO_BE_DONE.map((job) => job.id)).size, 126);
  assert.ok(
    JOBS_TO_BE_DONE.filter((job) => job.origin === 'research').every(
      (job) =>
        job.organisation &&
        job.sector &&
        job.theme &&
        job.job &&
        job.saidBy &&
        job.quote &&
        job.quoteSource &&
        typeof job.iaRelevant === 'boolean' &&
        typeof job.resolvesAt === 'string' &&
        typeof job.previousResolvesAt === 'string',
    ),
  );
  assert.ok(
    JOBS_TO_BE_DONE.filter((job) => job.origin === 'inferred').every(
      (job) =>
        job.saidBy === '' &&
        job.organisation === '' &&
        job.sector === '' &&
        !job.quote &&
        !job.quoteSource &&
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
    JOBS_TO_BE_DONE[0].previousResolvesAt,
    'Location > Bookings > Request',
  );
  assert.equal(JOBS_TO_BE_DONE[0].resolvesAt, '');
  assert.match(
    JOBS_TO_BE_DONE[0].notAddressedReason ?? '',
    /hidden while navigation and information architecture are the research focus/,
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
    assert.equal(byId[id]?.previousResolvesAt, '');
    assert.equal(byId[id]?.resolvesAt, 'Breadcrumb dropdown');
    assert.equal(byId[id]?.notAddressedReason, undefined);
  }

  assert.equal(byId['job-037']?.resolvesAt, 'Location > Notifications');
  assert.equal(
    byId['job-037']?.previousResolvesAt,
    'Location > Notifications',
  );

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

test('addressed jobs match what the current flags leave reachable', async () => {
  const { JOBS_TO_BE_DONE } = await import('../src/data/jobsToBeDone.ts');
  const placeholder = source('../src/components/LandingPlaceholder.tsx');
  const search = source('../src/components/HeaderSearch.tsx');
  const project = source('../PROJECT.md');

  assert.match(placeholder, /export const LANDING_CONTENT_ENABLED = false/);
  assert.match(search, /export const HEADER_SEARCH_VISIBLE = false/);
  assert.ok(
    JOBS_TO_BE_DONE.every((job) => typeof job.previousResolvesAt === 'string'),
  );

  const breadcrumbIds = ['job-043', 'job-044', 'job-111'];
  for (const job of JOBS_TO_BE_DONE) {
    if (breadcrumbIds.includes(job.id)) continue;
    if (!job.previousResolvesAt) continue;
    if (job.previousResolvesAt.includes('Notifications')) {
      assert.equal(job.resolvesAt, job.previousResolvesAt);
      continue;
    }
    assert.equal(job.resolvesAt, '');
    assert.match(
      job.notAddressedReason ?? '',
      /hidden while navigation and information architecture are the research focus/,
    );
  }

  assert.match(project, /previousResolvesAt/);
  assert.match(project, /tied to the current flag state/);
});

test('the jobs screen restores the product header and uses one jobs list', () => {
  const page = source('../src/pages/JobsToBeDone.tsx');
  const app = source('../src/App.tsx');

  assert.match(app, /<JobsToBeDone \/>/);
  assert.match(page, /JOBS_TO_BE_DONE/);
  assert.match(page, /title="Jobs to be done"/);
  assert.match(
    page,
    /Addressed status reflects what is currently reachable; several surfaces are hidden for this round/,
  );
  assert.match(page, /<header className="app-header">/);
  assert.match(page, /<Logo \/>/);
  assert.match(page, /<JobSection jobs=\{filteredJobs\} \/>/);
  assert.doesNotMatch(page, /<AppFooter/);
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
  assert.match(
    page,
    /statusFilter === 'addressed' && Boolean\(job\.resolvesAt\)/,
  );
  assert.match(
    page,
    /statusFilter === 'hidden' && !job\.resolvesAt && Boolean\(job\.previousResolvesAt\)/,
  );
  assert.match(
    page,
    /statusFilter === 'unaddressed' && !job\.resolvesAt && !job\.previousResolvesAt/,
  );
  assert.match(page, /All organisations/);
  assert.match(page, /All sectors/);
  assert.match(page, /All themes/);
  assert.match(page, /All origins/);
  assert.match(page, /<option value="research">Validated<\/option>/);
  assert.match(page, /<option value="inferred">Inferred<\/option>/);
  assert.match(page, /All statuses/);
  assert.match(page, /<option value="addressed">Addressed<\/option>/);
  assert.match(
    page,
    /<option value="hidden">Hidden for this round<\/option>/,
  );
  assert.match(page, /<option value="unaddressed">Not addressed<\/option>/);
  assert.doesNotMatch(page, /Not addressed yet/);
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
  assert.doesNotMatch(page, /<Tag>Not addressed yet<\/Tag>|<Tag>Hidden for this round<\/Tag>|<Tag>Not addressed<\/Tag>/);
  assert.match(
    page,
    /<span className="font-bold text-text">Hidden for this round, where it returns:<\/span> \{job\.previousResolvesAt\}/,
  );
  assert.match(
    page,
    /<span className="font-bold text-text">Not addressed:<\/span> \{job\.notAddressedReason\}/,
  );
  assert.match(
    page,
    /<span className="font-bold text-text">Not addressed<\/span>/,
  );
  assert.match(page, /job\.notAddressedReason/);
  assert.match(page, /tone="validated">Validated/);
  assert.match(page, /tone="pending">Inferred/);
  assert.match(
    page,
    /Origin is provenance \(who raised it\)\. The Source expander is evidence \(the quote\)\./,
  );
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
  assert.match(expander, /“\{job\.quote\}”/);
  assert.match(
    expander,
    /<a href=\{sessionUrlFromQuoteSource\(job\.quoteSource\)\} className="ui-link" target="_blank" rel="noreferrer">/,
  );
  assert.match(expander, /\{job\.saidBy\}/);
  assert.match(
    expander,
    /<\/a>\s*\{' · '\}\s*\{quoteTimestampFromQuoteSource\(job\.quoteSource\)\}/,
  );
  assert.doesNotMatch(expander, />\{job\.quoteSource\}</);
  assert.doesNotMatch(expander, /structure session|prototype session|Northcott session|Life Without Barriers session/);
  assert.doesNotMatch(expander, /max-w-content/);
  assert.match(expander, /text-text-secondary/);
  assert.doesNotMatch(expander, /ui-inset-(compact|row|card)|pl-|px-|ml-/);
  assert.doesNotMatch(expander, /<blockquote|italic|font-italic/);

  const css = source('../src/index.css');
  assert.match(css, /summary\.ui-link \{[\s\S]*text-decoration: none;/);
  assert.match(css, /summary\.ui-link > span \{[\s\S]*text-decoration: underline;/);
  assert.match(css, /summary\.ui-link:hover > span \{[\s\S]*text-decoration: none;/);
});

test("Dorothy's jobs carry session quotes", async () => {
  const { JOBS_TO_BE_DONE, sessionUrlFromQuoteSource, SESSION_RECORDINGS } =
    await import('../src/data/jobsToBeDone.ts');
  const byId = Object.fromEntries(
    JOBS_TO_BE_DONE.map((job) => [job.id, job]),
  );
  const dorothy = JOBS_TO_BE_DONE.filter((job) => job.saidBy === 'Dorothy');

  assert.equal(dorothy.length, 45);
  assert.equal(dorothy.filter((job) => job.quote).length, 45);
  assert.ok(
    dorothy.every(
      (job) =>
        job.origin === 'research' &&
        job.quoteSource?.startsWith('Dorothy · ') &&
        (job.quoteSource.includes('prototype session') ||
          job.quoteSource.includes('structure session')),
    ),
  );

  assert.equal(byId['job-011']?.origin, 'research');
  assert.equal(byId['job-011']?.saidBy, 'Dorothy');
  assert.equal(
    byId['job-011']?.quote,
    'Yeah, because I think from that you can tell whether or not a worker is suitable for Yeah, the site.',
  );
  assert.equal(
    byId['job-011']?.quoteSource,
    'Dorothy · prototype session · 12:36',
  );
  assert.equal(
    sessionUrlFromQuoteSource(byId['job-011']?.quoteSource),
    SESSION_RECORDINGS['prototype session'],
  );

  assert.equal(byId['job-042']?.origin, 'research');
  assert.equal(byId['job-042']?.saidBy, 'Dorothy');
  assert.equal(
    byId['job-042']?.job,
    'Approve the bookings waiting for approval, so workers can be paid',
  );
  assert.equal(
    byId['job-042']?.quote,
    "I've sent shifts out and workers are waiting for them to be accepted, approval for paying them",
  );
  assert.equal(
    byId['job-042']?.quoteSource,
    'Dorothy · prototype session · 04:10',
  );
  assert.equal(
    sessionUrlFromQuoteSource(byId['job-042']?.quoteSource),
    SESSION_RECORDINGS['prototype session'],
  );

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

  assert.equal(JOBS_TO_BE_DONE.filter((job) => job.quote).length, 119);
  assert.equal(JOBS_TO_BE_DONE.filter((job) => !job.quote).length, 7);

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

test('session URLs are resolved from the session identifier, not the participant name', async () => {
  const {
    JOBS_TO_BE_DONE,
    SESSION_RECORDINGS,
    sessionUrlFromQuoteSource,
  } = await import('../src/data/jobsToBeDone.ts');
  const byId = Object.fromEntries(
    JOBS_TO_BE_DONE.map((job) => [job.id, job]),
  );

  assert.equal(
    SESSION_RECORDINGS['prototype session'],
    'https://hireup.dovetail.com/data/2q7ZSyHz0HmWHRCltsOs1D',
  );
  assert.equal(
    SESSION_RECORDINGS['structure session'],
    'https://hireup.dovetail.com/data/2oIxzowd988P2TYwdBvK8',
  );
  assert.equal(
    SESSION_RECORDINGS['Northcott session'],
    'https://hireup.dovetail.com/data/M8p85NqXQjolLMRHO5I7K',
  );
  assert.equal(
    SESSION_RECORDINGS['Life Without Barriers session'],
    'https://hireup.dovetail.com/data/3HTFSh3fbeEhcU5Ke3pObA',
  );

  assert.equal(
    sessionUrlFromQuoteSource(byId['job-001']?.quoteSource ?? ''),
    SESSION_RECORDINGS['prototype session'],
  );
  assert.equal(
    sessionUrlFromQuoteSource(byId['job-014']?.quoteSource ?? ''),
    SESSION_RECORDINGS['structure session'],
  );
  assert.notEqual(
    sessionUrlFromQuoteSource(byId['job-001']?.quoteSource ?? ''),
    sessionUrlFromQuoteSource(byId['job-014']?.quoteSource ?? ''),
  );

  for (const job of JOBS_TO_BE_DONE) {
    if (!job.quoteSource) {
      continue;
    }

    assert.match(job.quoteSource, /\d+:\d{2}/);
    assert.ok(sessionUrlFromQuoteSource(job.quoteSource));
    assert.notEqual(job.quote?.[0], '“');
    assert.notEqual(job.quote?.at(-1), '”');
  }
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
  assert.match(css, /--container-job-title:\s*84rem/);
  assert.match(css, /--container-content: 43\.75rem/);
  assert.match(css, /--container-page:\s*90rem/);
});

test('every job row has a metadata line for addressed, hidden, and unaddressed states', () => {
  const page = source('../src/pages/JobsToBeDone.tsx');

  assert.doesNotMatch(
    page,
    /<Tag>Not addressed yet<\/Tag>|<Tag>Hidden for this round<\/Tag>|<Tag>Not addressed<\/Tag>/,
  );
  assert.match(
    page,
    /<span className="font-bold text-text">Addressed, where it resolves:<\/span> \{job\.resolvesAt\}/,
  );
  assert.match(
    page,
    /job\.previousResolvesAt \? \([\s\S]*Hidden for this round, where it returns:<\/span> \{job\.previousResolvesAt\}/,
  );
  assert.match(
    page,
    /job\.notAddressedReason \? \([\s\S]*Not addressed:<\/span> \{job\.notAddressedReason\}/,
  );
  assert.match(
    page,
    /<span className="font-bold text-text">Not addressed<\/span>/,
  );
  assert.doesNotMatch(page, /Not addressed:<\/span>\s*<\/p>/);
  assert.doesNotMatch(page, /Not addressed yet/);
});
