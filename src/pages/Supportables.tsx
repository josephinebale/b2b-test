import { ChevronRight } from 'lucide-react';
import { LocationMarker } from '../components/LocationMarker';
import { LANDING_CONTENT_ENABLED } from '../components/LandingPlaceholder';
import { PageHeading } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import {
  childGroupingSectionTitle,
  groupingContentsSummary,
  groupingDashboardChildren,
  pendingCountsForGrouping,
  pendingCountsForLocation,
  rootGroupingsForOrganisation,
  serviceTypeLabel,
  type Grouping,
  type Location,
} from '../data/locations';
import { pendingWorkParts } from '../lib/pageContent';
import { treeSectionLabel } from '../lib/informationArchitecture';

function GroupingLocationRow({
  location,
  onSelectLocation,
}: {
  location: Location;
  onSelectLocation?: (locationId: string, path?: string) => void;
}) {
  const pendingWork = pendingWorkParts(pendingCountsForLocation(location.id));
  return (
    <button
      type="button"
      onClick={() => onSelectLocation?.(location.id, '/bookings')}
      className="ui-inset-row flex w-full items-center gap-3 text-left hover:bg-surface-subtle"
    >
      <LocationMarker location={location} />
      <span className="min-w-0 flex-1">
        <EntityLink as="span" className="block">
          {location.name}
        </EntityLink>
        <span className="mt-1 block text-sm text-text-secondary">
          {serviceTypeLabel(location.serviceType, location.sector)} ·{' '}
          {location.suburb}
        </span>
        {pendingWork.length > 0 && (
          LANDING_CONTENT_ENABLED ? (
          <span className="mt-1 block text-sm text-text-secondary">
            {pendingWork.join(' · ')}
          </span>
          ) : null
        )}
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-text-tertiary" />
    </button>
  );
}

function ChildGroupingRow({
  grouping,
  onSelectGrouping,
}: {
  grouping: Grouping;
  onSelectGrouping?: (groupingId: string) => void;
}) {
  const pendingWork = pendingWorkParts(pendingCountsForGrouping(grouping));

  return (
    <button
      type="button"
      onClick={() => onSelectGrouping?.(grouping.id)}
      className="ui-inset-row flex w-full items-center gap-3 text-left hover:bg-surface-subtle"
    >
      <span className="min-w-0 flex-1">
        <EntityLink as="span" className="block">
          {grouping.name}
        </EntityLink>
        <span className="mt-1 block text-sm text-text-secondary">
          {groupingContentsSummary(grouping)}
        </span>
        {pendingWork.length > 0 && (
          LANDING_CONTENT_ENABLED ? (
          <span className="mt-1 block text-sm text-text-secondary">
            {pendingWork.join(' · ')}
          </span>
          ) : null
        )}
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-text-tertiary" />
    </button>
  );
}

export function Supportables({
  grouping,
  nodeType = 'grouping',
  onSelectLocation,
  onSelectGrouping,
}: {
  grouping: Grouping;
  nodeType?: 'grouping' | 'organisation';
  onSelectLocation?: (locationId: string, path?: string) => void;
  onSelectGrouping?: (groupingId: string) => void;
}) {
  const atOrganisation = nodeType === 'organisation';
  const { groupings, housesAndCentres, clients } = atOrganisation
    ? {
        groupings: rootGroupingsForOrganisation(grouping.organisation),
        housesAndCentres: [],
        clients: [],
      }
    : groupingDashboardChildren(grouping);

  return (
    <div className="width-main-column space-y-8">
      <PageHeading title={treeSectionLabel(grouping, nodeType)} />

      {groupings.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-md font-bold text-text">
              {childGroupingSectionTitle(groupings)}
            </h2>
            <PinnedQuestion questionId="grouping-locations" />
          </div>
          <Card divided>
            {groupings.map((child) => (
              <ChildGroupingRow
                key={child.id}
                grouping={child}
                onSelectGrouping={onSelectGrouping}
              />
            ))}
          </Card>
        </section>
      )}

      {housesAndCentres.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-md font-bold text-text">
              Houses and centres
            </h2>
            {groupings.length === 0 && (
              <PinnedQuestion questionId="grouping-locations" />
            )}
          </div>
          <Card divided>
            {housesAndCentres.map((location) => (
              <GroupingLocationRow
                key={location.id}
                location={location}
                onSelectLocation={onSelectLocation}
              />
            ))}
          </Card>
        </section>
      )}

      {clients.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-md font-bold text-text">Clients</h2>
            {groupings.length === 0 && housesAndCentres.length === 0 && (
              <PinnedQuestion questionId="grouping-locations" />
            )}
          </div>
          <Card divided>
            {clients.map((location) => (
              <GroupingLocationRow
                key={location.id}
                location={location}
                onSelectLocation={onSelectLocation}
              />
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}
