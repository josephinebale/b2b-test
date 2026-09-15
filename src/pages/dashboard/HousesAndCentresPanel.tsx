import { useMemo, useState } from 'react';
import {
  childGroupingSectionTitle,
  groupingClientsCountLine,
  groupingContentsSummary,
  groupingDashboardChildren,
  groupingHousesAndCentresCountLine,
  futureCancelledBookings,
  pendingCountsForLocation,
  locationTypeSuburbLine,
  waitingRequestsForLocation,
  type Booking,
  type Grouping,
  type Location,
} from '../../data/locations';
import { Card } from '../../components/ui/Card';
import { EntityLink } from '../../components/ui/EntityLink';
import {
  dashboardHouseRowPendingLinks,
  dashboardAsideWaitingCount,
  type DashboardAsideSort,
  EMPTY_STATES,
  groupingPlaceBasedLabel,
  sortDashboardAsideLocations,
} from '../../lib/pageContent';
import { href } from '../../lib/router';
import {
  GroupingLocationSortControl,
  SectionHeadingRow,
} from './SectionHeadingRow';

const CHILDREN_PREVIEW = 12;

function LocationRow({
  location,
  extraBookings,
  onSelectLocation,
}: {
  location: Location;
  extraBookings: Booking[];
  onSelectLocation?: (locationId: string, path?: string) => void;
}) {
  const counts = pendingCountsForLocation(location.id, extraBookings);
  const pendingLinks = dashboardHouseRowPendingLinks({
    approvals: counts.approvals,
    messages: counts.messages,
  });

  return (
    <div className="ui-inset-card">
      <EntityLink
        href={href('/bookings')}
        onClick={(event) => {
          event.preventDefault();
          onSelectLocation?.(location.id, '/bookings');
        }}
      >
        {location.name}
      </EntityLink>
      <p className="mt-1 text-xs text-text-tertiary">
        {locationTypeSuburbLine(location)}
      </p>
      {pendingLinks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {pendingLinks.map((item) => (
            <a
              key={`${item.path}-${item.label}`}
              href={href(item.path)}
              className="ui-link text-xs"
              onClick={(event) => {
                event.preventDefault();
                onSelectLocation?.(location.id, item.path);
              }}
            >
              {item.count} {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function locationSortMetrics(locationId: string, extraBookings: Booking[]) {
  const counts = pendingCountsForLocation(locationId, extraBookings);
  const awaiting = waitingRequestsForLocation(locationId, extraBookings);
  const soonestAwaitingStart =
    awaiting.length === 0
      ? null
      : awaiting.reduce(
          (earliest, booking) =>
            booking.start < earliest ? booking.start : earliest,
          awaiting[0].start,
        );

  return {
    waitingCount: dashboardAsideWaitingCount({
      cancelled: futureCancelledBookings(locationId, extraBookings).length,
      awaiting: awaiting.length,
      approvals: counts.approvals,
      messages: counts.messages,
    }),
    soonestAwaitingStart,
  };
}

function LocationSection({
  title,
  countLine,
  locations,
  extraBookings,
  onSelectLocation,
  showSort = false,
  sortOption,
  onSortChange,
  sortAriaLabel = 'Sort houses and centres',
}: {
  title: string;
  countLine: string;
  locations: Location[];
  extraBookings: Booking[];
  onSelectLocation?: (locationId: string, path?: string) => void;
  showSort?: boolean;
  sortOption?: DashboardAsideSort;
  onSortChange?: (value: DashboardAsideSort) => void;
  sortAriaLabel?: string;
}) {
  const hasSort =
    showSort && sortOption !== undefined && onSortChange !== undefined;

  return (
    <section>
      <SectionHeadingRow
        title={title}
        supportingLine={countLine}
        aside={
          hasSort ? (
            <GroupingLocationSortControl
              sortOption={sortOption}
              onSortChange={onSortChange}
              ariaLabel={sortAriaLabel}
            />
          ) : undefined
        }
      />
      <Card divided>
        {locations.map((location) => (
          <LocationRow
            key={location.id}
            location={location}
            extraBookings={extraBookings}
            onSelectLocation={onSelectLocation}
          />
        ))}
      </Card>
    </section>
  );
}

export function HousesAndCentresPanel({
  grouping,
  extraBookings,
  onSelectLocation,
  onSelectGrouping,
}: {
  grouping: Grouping;
  extraBookings: Booking[];
  onSelectLocation?: (locationId: string, path?: string) => void;
  onSelectGrouping?: (groupingId: string) => void;
}) {
  const [housesSortOption, setHousesSortOption] =
    useState<DashboardAsideSort>('soonest-shift');
  const [clientsSortOption, setClientsSortOption] =
    useState<DashboardAsideSort>('soonest-shift');
  const { groupings, housesAndCentres, clients } =
    groupingDashboardChildren(grouping);
  const sortMetrics = useMemo(
    () =>
      new Map(
        [...housesAndCentres, ...clients].map((location) => [
          location.id,
          locationSortMetrics(location.id, extraBookings),
        ]),
      ),
    [clients, extraBookings, housesAndCentres],
  );
  const sortedHousesAndCentres = useMemo(
    () =>
      sortDashboardAsideLocations(
        housesAndCentres,
        housesSortOption,
        sortMetrics,
      ),
    [housesAndCentres, sortMetrics, housesSortOption],
  );
  const sortedClients = useMemo(
    () =>
      sortDashboardAsideLocations(clients, clientsSortOption, sortMetrics),
    [clients, sortMetrics, clientsSortOption],
  );

  const totalRowCount =
    groupings.length + housesAndCentres.length + clients.length;
  const visibleGroupingCount = Math.min(groupings.length, CHILDREN_PREVIEW);
  let remainingPreview = CHILDREN_PREVIEW - visibleGroupingCount;
  const visibleHouseCount = Math.min(housesAndCentres.length, remainingPreview);
  remainingPreview -= visibleHouseCount;
  const visibleClientCount = Math.min(clients.length, remainingPreview);

  const visibleGroupings = groupings.slice(0, visibleGroupingCount);
  const visibleHousesAndCentres = sortedHousesAndCentres.slice(
    0,
    visibleHouseCount,
  );
  const visibleClients = sortedClients.slice(0, visibleClientCount);
  if (totalRowCount === 0) {
    return (
      <section>
        <Card>
          <p className="ui-inset-row text-sm font-bold text-text">
            {EMPTY_STATES.dashboardChildren.title}
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      {visibleGroupings.length > 0 && (
        <section>
          <SectionHeadingRow
            title={childGroupingSectionTitle(visibleGroupings)}
          />
          <Card divided>
            {visibleGroupings.map((child) => (
              <div key={child.id} className="ui-inset-row">
                <EntityLink
                  href={href('/')}
                  onClick={(event) => {
                    event.preventDefault();
                    onSelectGrouping?.(child.id);
                  }}
                >
                  {child.name}
                </EntityLink>
                <p className="mt-1 text-xs text-text-tertiary">
                  {groupingContentsSummary(child)}
                </p>
              </div>
            ))}
          </Card>
        </section>
      )}

      {visibleHousesAndCentres.length > 0 && (
        <LocationSection
          title={groupingPlaceBasedLabel(housesAndCentres)}
          countLine={groupingHousesAndCentresCountLine(grouping)}
          locations={visibleHousesAndCentres}
          extraBookings={extraBookings}
          onSelectLocation={onSelectLocation}
          showSort={housesAndCentres.length >= 2}
          sortOption={housesSortOption}
          onSortChange={setHousesSortOption}
        />
      )}

      {visibleClients.length > 0 && (
        <LocationSection
          title="Clients"
          countLine={groupingClientsCountLine(grouping)}
          locations={visibleClients}
          extraBookings={extraBookings}
          onSelectLocation={onSelectLocation}
          showSort={clients.length >= 2}
          sortOption={clientsSortOption}
          onSortChange={setClientsSortOption}
          sortAriaLabel="Sort clients"
        />
      )}

      {totalRowCount > CHILDREN_PREVIEW && (
        <p>
          <a href={href('/supportables')} className="ui-link">
            See all {totalRowCount}
          </a>
        </p>
      )}
    </section>
  );
}
