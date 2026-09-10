import { useState, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { PageHeading, RequestBookingButton } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import { IconButton } from '../components/ui/IconButton';
import {
  GROUPING,
  groupingWorkers,
  locationWorkerTiers,
  nearbyWorkers,
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
  detail: ReactNode;
  assessments: WorkerAssessments;
  profile: boolean;
};

function supportPlanLabel(confirmed: boolean): string {
  return confirmed ? 'Support plan confirmed' : 'Support plan needs review';
}

function assessmentSummary(assessments: WorkerAssessments): string {
  return [
    `Medication assessment ${assessments.medication ? 'current' : 'not current'}`,
    `Driving assessment ${assessments.driving ? 'current' : 'not current'}`,
  ].join(' · ');
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
        <p className="mt-1 text-sm text-text-secondary">{worker.detail}</p>
        <p className="mt-1 text-xs text-text-secondary">
          {assessmentSummary(worker.assessments)}
        </p>
      </div>
      {worker.profile && (
        <IconButton
          type="button"
          aria-label={`More options for ${worker.name}`}
          data-tooltip={`More options for ${worker.name}`}
          className="ui-target-row__action ui-tooltip"
        >
          <MoreHorizontal className="h-5 w-5" />
        </IconButton>
      )}
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
  nodeType = 'location',
  grouping = GROUPING,
}: {
  data?: LocationData;
  nodeType?: 'grouping' | 'location';
  grouping?: Grouping;
}) {
  const [query, setQuery] = useState('');

  if (nodeType === 'grouping') {
    const providerRows: WorkerRow[] = groupingWorkers(grouping.id).map((worker) => {
      const locations = worker.locations
        .map((location) => location.locationName)
        .join(', ');
      const detail = `${worker.totalHours} hours at this provider · ${worker.shiftCount} shifts across ${worker.locations.length} locations: ${locations}. ${supportPlanLabel(worker.planConfirmed)}.`;
      return {
        id: worker.id,
        name: worker.name,
        detail,
        assessments: worker.assessments,
        profile: true,
      };
    });
    const nearbyRows: WorkerRow[] = nearbyWorkers().map((worker) => ({
      id: worker.id,
      name: worker.name,
      detail: `${worker.suburb} · ${worker.distanceKm} km away · No history with this provider · Support plan not shared.`,
      assessments: worker.assessments,
      profile: false,
    }));
    const allRows = query.trim() === '' ? providerRows : [...providerRows, ...nearbyRows];
    const rows = allRows.filter((worker) =>
      matchesQuery(worker.name, String(worker.detail), query),
    );

    return (
      <div className="width-main-column">
        <PageHeading
          title="Workers"
          description={`Everyone with booking history at ${grouping.organisation} across ${grouping.name}. Ranked by shifts, then locations worked.`}
          actions={<PinnedQuestion questionId="workers-grouping-order" />}
        />
        <SearchWorkers query={query} onQueryChange={setQuery} />
        {rows.length > 0 ? (
          <Card as="ul" divided>
            {rows.map(renderWorkerRow)}
          </Card>
        ) : (
          <EmptyWorkers search={query.trim() !== ''} />
        )}
      </div>
    );
  }

  if (!data) return null;

  const client = data.location.serviceType === 'home-community';
  const tiers = locationWorkerTiers(data.location.id, grouping.id);
  const knownRows: WorkerRow[] = tiers.knownHere
    .map((worker) => ({
      id: worker.id,
      name: worker.name,
      detail: `${providerHoursForWorker(worker.id, data.location.organisation)} hours at this provider · ${supportPlanLabel(worker.planConfirmed)}.`,
      assessments: worker.assessments,
      profile: true,
    }))
    .filter((worker) => matchesQuery(worker.name, String(worker.detail), query));
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
        detail: `${worker.totalHours} hours at this provider · ${supportPlanLabel(worker.planConfirmed)}. ${locations}.`,
        assessments: worker.assessments,
        profile: true,
      };
    })
    .filter((worker) => matchesQuery(worker.name, String(worker.detail), query));
  const nearbyRows: WorkerRow[] = tiers.nearby
    .map((worker) => ({
      id: worker.id,
      name: worker.name,
      detail: `${worker.suburb} · ${worker.distanceKm} km away · No history with this provider · Support plan not shared.`,
      assessments: worker.assessments,
      profile: false,
    }))
    .filter((worker) => matchesQuery(worker.name, String(worker.detail), query));
  const noResults =
    knownRows.length === 0 && elsewhereRows.length === 0 && nearbyRows.length === 0;

  return (
    <div className="width-main-column">
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
    </div>
  );
}
