import { PageHeading } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { LandingPlaceholder } from '../components/LandingPlaceholder';
import type { Booking, Grouping } from '../data/locations';
import { groupingHasDefinedOverview } from '../lib/informationArchitecture';
import { groupingOverviewHeading } from '../lib/pageContent';
import { BookingsNeedingAttention } from './dashboard/BookingsNeedingAttention';
import { HousesAndCentresPanel } from './dashboard/HousesAndCentresPanel';
import { WorkersPanel } from './dashboard/WorkersPanel';

export function Dashboard({
  grouping,
  createdBookings = [],
  onSelectLocation,
  onSelectGrouping,
}: {
  grouping: Grouping;
  createdBookings?: Booking[];
  onSelectLocation?: (locationId: string, path?: string) => void;
  onSelectGrouping?: (groupingId: string) => void;
}) {
  if (!groupingHasDefinedOverview(grouping)) {
    return (
      <div className="width-main-column">
        <LandingPlaceholder />
      </div>
    );
  }

  return (
    <div>
      <PageHeading title={groupingOverviewHeading(grouping.name)} />

      <div className="layout-content-aside">
        <div className="flex min-w-0 flex-col gap-8">
          <BookingsNeedingAttention
            grouping={grouping}
            extraBookings={createdBookings}
            onSelectLocation={onSelectLocation}
          />
          <HousesAndCentresPanel
            grouping={grouping}
            extraBookings={createdBookings}
            onSelectLocation={onSelectLocation}
            onSelectGrouping={onSelectGrouping}
          />
        </div>

        <aside>
          <WorkersPanel
            grouping={grouping}
            preview
            onSelectLocation={onSelectLocation}
            extraQuestion={<PinnedQuestion questionId="grouping-usage" />}
          />
        </aside>
      </div>
    </div>
  );
}
