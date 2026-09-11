import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Logo } from '../components/Logo';
import { PageHeading } from '../components/PageHeading';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import {
  JOB_THEMES,
  JOBS_TO_BE_DONE,
  type JobToBeDone as Job,
} from '../data/jobsToBeDone';
import {
  ORGANISATIONS,
  type Organisation,
  type Sector,
} from '../lib/informationArchitecture';
import { href } from '../lib/router';

const SECTORS: Sector[] = ['disability', 'aged care'];

function sectorLabel(sector: Sector): string {
  return sector === 'aged care' ? 'Aged care' : 'Disability';
}

function JobRow({ job }: { job: Job }) {
  return (
    <li className="ui-inset-card">
      <h3 className="max-w-job-title text-md font-bold text-text">{job.job}</h3>
      {job.saidBy ? (
        <p className="mt-1 text-sm text-text-secondary">Raised by {job.saidBy}</p>
      ) : (
        <></>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {job.origin === 'inferred' ? (
          <Tag tone="pending">Inferred</Tag>
        ) : (
          <Tag tone="validated">Validated</Tag>
        )}
        <Tag>{job.theme}</Tag>
        {job.organisation ? <Tag>{job.organisation}</Tag> : <></>}
        {job.sector ? <Tag>{sectorLabel(job.sector)}</Tag> : <></>}
      </div>

      {job.resolvesAt ? (
        <p className="mt-3 text-xs text-text-secondary">
          <span className="font-bold text-text">Addressed, where it resolves:</span> {job.resolvesAt}
        </p>
      ) : job.notAddressedReason ? (
        <p className="mt-3 text-xs text-text-secondary">
          <span className="font-bold text-text">Not addressed yet:</span> {job.notAddressedReason}
        </p>
      ) : (
        <p className="mt-3 text-xs text-text-secondary">
          <span className="font-bold text-text">Not addressed yet</span>
        </p>
      )}

      {job.quote ? (
        <details className="mt-3 open:[&>summary>:last-child]:rotate-180">
          <summary className="ui-link inline-flex cursor-pointer list-none items-center gap-1 [&::-webkit-details-marker]:hidden">
            <span>Source</span>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
          </summary>
          <div className="ui-inset-compact">
            <p className="text-sm text-text-secondary">{job.quote}</p>
            <p className="mt-1 text-xs text-text-secondary">{job.quoteSource}</p>
          </div>
        </details>
      ) : (
        <></>
      )}
    </li>
  );
}

function JobSection({ jobs }: { jobs: Job[] }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-lg font-bold text-text">Jobs</h2>
        <span className="text-sm text-text-secondary">{jobs.length}</span>
      </div>

      {jobs.length > 0 ? (
        <Card as="ul" divided>
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </Card>
      ) : (
        <Card className="p-6">
          <p className="text-sm text-text-strong">
            No jobs match these filters.
          </p>
        </Card>
      )}
    </section>
  );
}

export function JobsToBeDone() {
  const [organisationFilter, setOrganisationFilter] = useState<
    Organisation | ''
  >('');
  const [sectorFilter, setSectorFilter] = useState<Sector | ''>('');
  const [themeFilter, setThemeFilter] = useState('');
  const [originFilter, setOriginFilter] = useState<'' | 'research' | 'inferred'>(
    '',
  );
  const [statusFilter, setStatusFilter] = useState<'' | 'addressed' | 'unaddressed'>(
    '',
  );
  const filteredJobs = JOBS_TO_BE_DONE.filter(
    (job) =>
      (!organisationFilter || job.organisation === organisationFilter) &&
      (!sectorFilter || job.sector === sectorFilter) &&
      (!themeFilter || job.theme === themeFilter) &&
      (!originFilter || job.origin === originFilter) &&
      (!statusFilter ||
        (statusFilter === 'addressed' ? Boolean(job.resolvesAt) : !job.resolvesAt)),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="app-header">
        <div className="app-header-row mx-auto flex max-w-page items-center px-8">
          <a
            href={href('/')}
            aria-label="Start a session"
            className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Logo />
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-page flex-1 px-8 py-8">
        <PageHeading
          title="Jobs to be done"
          actions={<Button href={href('/')}>Back</Button>}
        />

        <Card as="section" className="p-4">
            <h2 className="text-sm font-bold text-text">Filter jobs</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block text-xs font-medium text-text">
                Organisation
                <span className="relative mt-1 block">
                  <select
                    value={organisationFilter}
                    onChange={(event) =>
                      setOrganisationFilter(
                        event.target.value as Organisation | '',
                      )
                    }
                    className="h-10 w-full appearance-none rounded border border-border bg-surface px-3 pr-10 text-sm font-normal text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <option value="">All organisations</option>
                    {ORGANISATIONS.map((organisation) => (
                      <option key={organisation} value={organisation}>
                        {organisation}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                </span>
              </label>

              <label className="block text-xs font-medium text-text">
                Sector
                <span className="relative mt-1 block">
                  <select
                    value={sectorFilter}
                    onChange={(event) =>
                      setSectorFilter(event.target.value as Sector | '')
                    }
                    className="h-10 w-full appearance-none rounded border border-border bg-surface px-3 pr-10 text-sm font-normal text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <option value="">All sectors</option>
                    {SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sectorLabel(sector)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                </span>
              </label>

              <label className="block text-xs font-medium text-text">
                Theme
                <span className="relative mt-1 block">
                  <select
                    value={themeFilter}
                    onChange={(event) => setThemeFilter(event.target.value)}
                    className="h-10 w-full appearance-none rounded border border-border bg-surface px-3 pr-10 text-sm font-normal text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <option value="">All themes</option>
                    {JOB_THEMES.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                </span>
              </label>

              <label className="block text-xs font-medium text-text">
                Origin
                <span className="relative mt-1 block">
                  <select
                    value={originFilter}
                    onChange={(event) =>
                      setOriginFilter(
                        event.target.value as '' | 'research' | 'inferred',
                      )
                    }
                    className="h-10 w-full appearance-none rounded border border-border bg-surface px-3 pr-10 text-sm font-normal text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <option value="">All origins</option>
                    <option value="research">Validated</option>
                    <option value="inferred">Inferred</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                </span>
              </label>

              <label className="block text-xs font-medium text-text">
                Status
                <span className="relative mt-1 block">
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as '' | 'addressed' | 'unaddressed',
                      )
                    }
                    className="h-10 w-full appearance-none rounded border border-border bg-surface px-3 pr-10 text-sm font-normal text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <option value="">All statuses</option>
                    <option value="addressed">Addressed</option>
                    <option value="unaddressed">Not addressed yet</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                </span>
              </label>
            </div>
        </Card>

        <div className="mt-8">
          <JobSection jobs={filteredJobs} />
        </div>
      </main>
    </div>
  );
}
