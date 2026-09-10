import { ChevronRight } from 'lucide-react';
import {
  GROUPING,
  groupingOpenRequests,
  groupingUsageLast7Days,
  partitionGroupingLocations,
  pendingCountsForLocation,
  serviceTypeLabel,
  type Booking,
  type Grouping,
  type Location,
  type LocationData,
} from '../data/locations';
import { LocationMarker } from '../components/LocationMarker';
import { PageHeading, RequestBookingButton } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import { formatLongDate, formatTime } from '../lib/date';
import { bookingsViewPath } from '../lib/pageContent';
import { BookingsWeek } from './dashboard/BookingsWeek';
import { NotificationStrip } from './dashboard/NotificationStrip';
import { WorkersPanel } from './dashboard/WorkersPanel';

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

function unansweredLabel(requestedAt: Date, now = new Date()): string {
  const hours = Math.max(1, Math.round((now.getTime() - requestedAt.getTime()) / 3600000));
  if (hours < 24) {
    return hours === 1 ? 'Unanswered for 1 hour' : `Unanswered for ${hours} hours`;
  }
  const days = Math.max(1, Math.round(hours / 24));
  return days === 1 ? 'Unanswered for 1 day' : `Unanswered for ${days} days`;
}

function GroupingLocationRow({
  location,
  onSelectLocation,
}: {
  location: Location;
  onSelectLocation?: (locationId: string, path?: string) => void;
}) {
  const counts = pendingCountsForLocation(location.id);
  return (
    <button
      type="button"
      onClick={() => onSelectLocation?.(location.id)}
      className="ui-inset-row flex w-full items-center gap-3 text-left hover:bg-surface-subtle"
    >
      <LocationMarker location={location} />
      <span className="min-w-0 flex-1">
        <EntityLink as="span" className="block">
          {location.name}
        </EntityLink>
        <span className="mt-1 block text-sm text-text-secondary">
          {serviceTypeLabel(location.serviceType, location.sector)} · {location.suburb}
        </span>
        <span className="mt-1 block text-sm text-text-secondary">
          {counts.requests} {plural(counts.requests, 'request', 'requests')} ·{' '}
          {counts.approvals} {plural(counts.approvals, 'approval', 'approvals')} ·{' '}
          {counts.messages} unread {plural(counts.messages, 'message', 'messages')}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-text-tertiary" />
    </button>
  );
}

export function Dashboard({
  data,
  nodeType = 'location',
  grouping = GROUPING,
  onSelectLocation,
  calendarBookings = [],
}: {
  data?: LocationData;
  nodeType?: 'grouping' | 'location';
  grouping?: Grouping;
  onSelectLocation?: (locationId: string, path?: string) => void;
  calendarBookings?: Booking[];
}) {
  if (nodeType === 'grouping') {
    const { housesAndCentres, clients } = partitionGroupingLocations(grouping);
    const requests = groupingOpenRequests(grouping.id);
    const usage = groupingUsageLast7Days(grouping.id);

    return (
      <div className="width-main-column space-y-8">
        <PageHeading
          title="Dashboard"
          description={`Locations in ${grouping.name}`}
        />

        {housesAndCentres.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-md font-bold text-text">Houses and centres</h2>
              <PinnedQuestion questionId="grouping-locations" />
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
              {housesAndCentres.length === 0 && (
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

        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-md font-bold text-text">Requests waiting</h2>
            <PinnedQuestion questionId="grouping-requests" />
          </div>
          <p className="mb-3 text-sm text-text-secondary">
            Ordered by how soon the shift starts, then how long the request has gone unanswered.
          </p>
          <Card divided>
            {requests.length === 0 ? (
              <p className="ui-inset-row text-sm text-text-secondary">
                No requests waiting.
              </p>
            ) : (
              requests.map((request) => (
                <button
                  key={request.id}
                  type="button"
                  onClick={() =>
                    onSelectLocation?.(request.locationId, bookingsViewPath('requested'))
                  }
                  className="ui-inset-row flex w-full items-center gap-3 text-left hover:bg-surface-subtle"
                >
                  <span className="min-w-0 flex-1">
                    <EntityLink as="span" className="block">
                      {request.locationName}
                    </EntityLink>
                    <span className="mt-1 block text-sm text-text-secondary">
                      Starts {formatLongDate(request.start)} {formatTime(request.start)} ·{' '}
                      {unansweredLabel(request.requestedAt)}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-text-tertiary" />
                </button>
              ))
            )}
          </Card>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-md font-bold text-text">Platform use</h2>
            <PinnedQuestion questionId="grouping-usage" />
          </div>
          <p className="mb-3 text-sm text-text-secondary">
            {usage.total} {plural(usage.total, 'booking', 'bookings')} on Hireup in the last 7 days.
          </p>
          <Card divided>
            {usage.locations.map((item) => (
              <div key={item.locationId} className="ui-inset-row flex items-center gap-3">
                <span className="min-w-0 flex-1 text-sm text-text">{item.locationName}</span>
                <span className="shrink-0 text-sm text-text-secondary">
                  {item.bookingCount} {plural(item.bookingCount, 'booking', 'bookings')}
                </span>
              </div>
            ))}
          </Card>
        </section>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="layout-content-aside flex items-baseline gap-6">
      <div className="min-w-0 flex-1">
        <PageHeading
          title="Dashboard"
          actions={<RequestBookingButton />}
        />
        <div className="space-y-6">
          <NotificationStrip data={data} />
          <BookingsWeek data={data} calendarBookings={calendarBookings} />
        </div>
      </div>

      <aside className="shrink-0">
        <WorkersPanel data={data} />
      </aside>
    </div>
  );
}
