import { ChevronRight } from 'lucide-react';
import {
  groupingOpenRequests,
  groupingUsageLast7Days,
  type Grouping,
} from '../data/locations';
import {
  LANDING_CONTENT_ENABLED,
  LandingPlaceholder,
} from '../components/LandingPlaceholder';
import { PageHeading } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import { formatLongDate, formatTime } from '../lib/date';
import { bookingsViewPath } from '../lib/pageContent';

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

export function Dashboard({
  grouping,
  onSelectLocation,
}: {
  grouping: Grouping;
  onSelectLocation?: (locationId: string, path?: string) => void;
}) {
  const requests = groupingOpenRequests(grouping.id);
  const usage = groupingUsageLast7Days(grouping.id);

  return (
      <div className="width-main-column space-y-8">
        {LANDING_CONTENT_ENABLED ? (
        <>
        <PageHeading
          title="Dashboard"
          description={`Requests and platform use in ${grouping.name}`}
        />

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
        </>
        ) : (
          <LandingPlaceholder />
        )}
      </div>
  );
}
