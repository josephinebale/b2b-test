import { useState, type ReactNode } from 'react';
import { Calendar, MessageSquare } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import {
  LANDING_CONTENT_ENABLED,
  LandingPlaceholder,
} from '../components/LandingPlaceholder';
import { PageHeading, RequestBookingButton } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import { IconButton } from '../components/ui/IconButton';
import {
  GROUPING,
  locationWorkerTiers,
  providerHoursForWorker,
  type Grouping,
  type LocationData,
  type WorkerAssessments,
} from '../data/locations';
import { EMPTY_STATES, workerProfilePath } from '../lib/pageContent';
import { href } from '../lib/router';

type WorkerRow = {
  id: string;
  name: string;
  evidence: ReactNode;
  searchText: string;
  supportPlanStatus: string;
  supportPlanNeedsAttention: boolean;
  assessments: WorkerAssessments;
  profile: boolean;
};

function supportPlanLabel(confirmed: boolean): string {
  return confirmed ? 'Support plan confirmed' : 'Support plan needs review';
}

function needsAttentionClass(needsAttention: boolean): string {
  return needsAttention ? 'font-medium text-text' : 'text-text-tertiary';
}

function assessmentSearchText(assessments: WorkerAssessments): string {
  return `Medication assessment ${assessments.medication ? 'current' : 'not current'} Driving assessment ${assessments.driving ? 'current' : 'not current'}`;
}

function assessmentSummary(assessments: WorkerAssessments) {
  return (
    <>
      <span className={needsAttentionClass(!assessments.medication)}>
        Medication assessment {assessments.medication ? 'current' : 'not current'}
      </span>
      <span aria-hidden="true" className="text-text-tertiary">·</span>
      <span className={needsAttentionClass(!assessments.driving)}>
        Driving assessment {assessments.driving ? 'current' : 'not current'}
      </span>
    </>
  );
}

function matchesQuery(name: string, detail: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  return needle === '' || `${name} ${detail}`.toLowerCase().includes(needle);
}

function renderWorkerRow(worker: WorkerRow) {
  return (
    <li
      key={worker.id}
      className="ui-inset-row ui-target-row flex entity-row items-center gap-3"
    >
      <Avatar name={worker.name} size="md" />
      <div className="min-w-0 flex-1">
        {worker.profile ? (
          <EntityLink
            href={href(workerProfilePath(worker.id))}
            className="ui-target-row__link"
          >
            {worker.name}
          </EntityLink>
        ) : (
          <EntityLink as="span">{worker.name}</EntityLink>
        )}
        <p className="mt-1 text-sm text-text-secondary">{worker.evidence}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs">
          <span
            className={needsAttentionClass(worker.supportPlanNeedsAttention)}
          >
            {worker.supportPlanStatus}
          </span>
          <span aria-hidden="true" className="text-text-tertiary">·</span>
          {assessmentSummary(worker.assessments)}
        </p>
      </div>
      <div className="ui-target-row__action ml-auto flex shrink-0 items-center gap-2">
        <IconButton
          href={href('/messages')}
          size="small"
          aria-label={`Message ${worker.name}`}
          data-tooltip={`Message ${worker.name}`}
          className="ui-tooltip"
        >
          <MessageSquare className="h-4 w-4" />
        </IconButton>
        <IconButton
          href={href('/request-booking')}
          size="small"
          aria-label={`Book ${worker.name}`}
          data-tooltip={`Book ${worker.name}`}
          className="ui-tooltip"
        >
          <Calendar className="h-4 w-4" />
        </IconButton>
      </div>
    </li>
  );
}

function SearchWorkers({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        type="search"
        placeholder="Search workers"
        aria-label="Search workers"
        className="h-9 min-w-0 flex-1 rounded border border-border px-3 text-sm"
      />
      <PinnedQuestion questionId="workers-search" />
    </div>
  );
}

function EmptyWorkers({ search }: { search: boolean }) {
  return (
    <Card className="px-6 py-12 text-center">
      <p className="text-lg font-bold text-text">
        {search ? 'No workers found' : EMPTY_STATES.workers.title}
      </p>
      <p className="mt-1 mx-auto max-w-content text-sm text-text-secondary">
        {search
          ? 'Try a different name or location.'
          : EMPTY_STATES.workers.description}
      </p>
    </Card>
  );
}

export function Workers({
  data,
  grouping = GROUPING,
}: {
  data?: LocationData;
  grouping?: Grouping;
}) {
  const [query, setQuery] = useState('');

  if (!data) return null;

  const client = data.location.serviceType === 'home-community';
  const tiers = locationWorkerTiers(data.location.id, grouping.id);
  const knownRows: WorkerRow[] = tiers.knownHere
    .map((worker) => {
      const hours = providerHoursForWorker(
        worker.id,
        data.location.organisation,
      );
      const supportPlanStatus = supportPlanLabel(worker.planConfirmed);
      return {
        id: worker.id,
        name: worker.name,
        evidence: `${hours} hours at this provider`,
        searchText: `${hours} hours at this provider ${supportPlanStatus} ${assessmentSearchText(worker.assessments)}`,
        supportPlanStatus,
        supportPlanNeedsAttention: !worker.planConfirmed,
        assessments: worker.assessments,
        profile: true,
      };
    })
    .filter((worker) => matchesQuery(worker.name, worker.searchText, query));
  const elsewhereRows: WorkerRow[] = tiers.workedElsewhere
    .map((worker) => {
      const locations = worker.locations
        .map(
          (location) =>
            `${location.locationName} (${location.bookingCount} ${location.bookingCount === 1 ? 'shift' : 'shifts'})`,
        )
        .join(', ');
      return {
        id: worker.id,
        name: worker.name,
        evidence: `${worker.totalHours} hours at this provider · ${locations}`,
        searchText: `${worker.totalHours} hours at this provider ${locations} ${supportPlanLabel(worker.planConfirmed)} ${assessmentSearchText(worker.assessments)}`,
        supportPlanStatus: supportPlanLabel(worker.planConfirmed),
        supportPlanNeedsAttention: !worker.planConfirmed,
        assessments: worker.assessments,
        profile: true,
      };
    })
    .filter((worker) => matchesQuery(worker.name, worker.searchText, query));
  const nearbyRows: WorkerRow[] = tiers.nearby
    .map((worker) => ({
      id: worker.id,
      name: worker.name,
      evidence: `${worker.suburb} · ${worker.distanceKm} km away · No history with this provider`,
      searchText: `${worker.suburb} ${worker.distanceKm} km away No history with this provider Support plan not shared ${assessmentSearchText(worker.assessments)}`,
      supportPlanStatus: 'Support plan not shared',
      supportPlanNeedsAttention: false,
      assessments: worker.assessments,
      profile: false,
    }))
    .filter((worker) => matchesQuery(worker.name, worker.searchText, query));
  const noResults =
    knownRows.length === 0 && elsewhereRows.length === 0 && nearbyRows.length === 0;

  return (
    <div className="width-main-column">
      {LANDING_CONTENT_ENABLED ? (
        <>
      <PageHeading
        title="Workers"
        description={
          client
            ? `Find people to support ${data.location.name}, starting with workers who already know them.`
            : 'Find people to work at this location, starting with the people who already know it.'
        }
        actions={<RequestBookingButton />}
      />
      <SearchWorkers query={query} onQueryChange={setQuery} />

      {noResults ? (
        <EmptyWorkers search />
      ) : (
        <div className="space-y-8">
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-md font-bold text-text">
                {client ? `Workers who know ${data.location.name}` : 'Your location team'}
              </h2>
              <PinnedQuestion questionId="workers-location-tiers" />
            </div>
            <p className="mb-3 text-sm text-text-secondary">
              {client
                ? `People who have supported ${data.location.name}.`
                : `People known at ${data.location.name}.`}
            </p>
            {knownRows.length > 0 ? (
              <Card as="ul" divided>
                {knownRows.map(renderWorkerRow)}
              </Card>
            ) : (
              <EmptyWorkers search={query.trim() !== ''} />
            )}
          </section>

          {elsewhereRows.length > 0 && (
            <section>
              <h2 className="mb-1 text-md font-bold text-text">
                Worked elsewhere in {grouping.name}
              </h2>
              <p className="mb-3 text-sm text-text-secondary">
                {client
                  ? `People who know other houses, centres or clients at this provider, but have not supported ${data.location.name}.`
                  : 'People who know other locations at this provider, but have not worked here.'}
              </p>
              <Card as="ul" divided>
                {elsewhereRows.map(renderWorkerRow)}
              </Card>
            </section>
          )}

          {nearbyRows.length > 0 && (
            <section>
              <h2 className="mb-1 text-md font-bold text-text">Available nearby</h2>
              <p className="mb-3 text-sm text-text-secondary">
                People nearby with no history at this provider.
              </p>
              <Card as="ul" divided>
                {nearbyRows.map(renderWorkerRow)}
              </Card>
            </section>
          )}
        </div>
      )}
        </>
      ) : (
        <LandingPlaceholder />
      )}
    </div>
  );
}
