import { ChevronRight } from 'lucide-react';
import { LocationMarker } from '../components/LocationMarker';
import { LANDING_CONTENT_ENABLED } from '../components/LandingPlaceholder';
import { PageHeading } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import {
  groupingChildListTabLabel,
  groupingContentsSummary,
  groupingDashboardChildren,
  pendingCountsForGrouping,
  pendingCountsForLocation,
  rootGroupingsForOrganisation,
  locationTypeSuburbLine,
  type Grouping,
  type Location,
} from '../data/locations';
import { treeSectionLabel } from '../lib/informationArchitecture';
import {
  groupingChildListPageHeading,
  groupingPlaceBasedLabel,
  pendingWorkParts,
} from '../lib/pageContent';

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
          {locationTypeSuburbLine(location)}
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

function SectionHeading({
  title,
  showTitle,
  showPin,
}: {
  title: string;
  showTitle: boolean;
  showPin: boolean;
}) {
  if (!showTitle && !showPin) return null;

  return (
    <div className="mb-3 flex items-center gap-2">
      {showTitle && <h2 className="text-md font-bold text-text">{title}</h2>}
      {showPin && <PinnedQuestion questionId="grouping-locations" />}
    </div>
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

  const sectionCount =
    (groupings.length > 0 ? 1 : 0) +
    (housesAndCentres.length > 0 ? 1 : 0) +
    (clients.length > 0 ? 1 : 0);
  const tabLabel = atOrganisation
    ? treeSectionLabel(grouping, nodeType)
    : groupingChildListTabLabel(grouping);
  const pageTitle =
    !atOrganisation && sectionCount > 1
      ? groupingChildListPageHeading(grouping.name, tabLabel)
      : tabLabel;
  const showSectionTitles = sectionCount > 1;
  const pinOnPageHeading = sectionCount === 1;

  return (
    <div className="width-main-column space-y-8">
      <PageHeading
        title={pageTitle}
        actions={
          pinOnPageHeading ? (
            <PinnedQuestion questionId="grouping-locations" />
          ) : undefined
        }
      />

      {groupings.length > 0 && (
        <section>
          <SectionHeading
            title="Groupings"
            showTitle={showSectionTitles}
            showPin={!pinOnPageHeading && groupings.length > 0}
          />
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
          <SectionHeading
            title={groupingPlaceBasedLabel(housesAndCentres)}
            showTitle={showSectionTitles}
            showPin={
              !pinOnPageHeading &&
              groupings.length === 0 &&
              housesAndCentres.length > 0
            }
          />
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
          <SectionHeading
            title="Clients"
            showTitle={showSectionTitles}
            showPin={
              !pinOnPageHeading &&
              groupings.length === 0 &&
              housesAndCentres.length === 0 &&
              clients.length > 0
            }
          />
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
