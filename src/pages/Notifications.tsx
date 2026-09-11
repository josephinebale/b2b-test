import {
  Calendar,
  CalendarCheck,
  CalendarX,
  ClipboardList,
  MessageSquare,
  ReceiptText,
  ShieldAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { LocationData } from '../data/locations';
import { PageHeading } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Card } from '../components/ui/Card';
import { unreadMessagesFromDescription } from '../data/conversations';
import { addDays, formatLongDate, startOfDay } from '../lib/date';
import {
  EMPTY_STATES,
  WORKERS_ROUTE,
  bookingDetailPath,
  bookingsViewPath,
  workerProfilePath,
} from '../lib/pageContent';
import { href } from '../lib/router';

type Item = {
  id: string;
  section: 'urgent' | 'review' | 'messages';
  priority: number;
  title: string;
  description: string;
  Icon: LucideIcon;
  date: Date;
  sortDate?: Date;
  path: string;
  locationId: string;
  locationName: string;
};

function buildItems(data: LocationData[]): Item[] {
  const today = startOfDay(new Date());

  const items: Item[] = data.flatMap((locationData) => {
    const location = {
      locationId: locationData.location.id,
      locationName: locationData.location.name,
    };

    const requestedBookings = locationData.bookings.filter(
      (booking) => booking.status === 'requested' && booking.start >= today,
    );
    const cancelledBookings = locationData.bookings.filter(
      (booking) => booking.status === 'cancelled',
    );
    const lapsedAssessments = locationData.workers.flatMap((worker) =>
      [
        {
          id: `${worker.id}-medication`,
          worker,
          name: 'Medication',
          expiresAt: worker.assessments.medicationExpiresAt,
        },
        {
          id: `${worker.id}-driving`,
          worker,
          name: 'Driving',
          expiresAt: worker.assessments.drivingExpiresAt,
        },
      ].filter(({ expiresAt }) => expiresAt < today),
    );
    const supportPlansDue = locationData.workers.filter(
      (worker) =>
        worker.supportPlanReviewDueAt !== null &&
        worker.supportPlanReviewDueAt < today,
    );
    const invoicesReady = locationData.invoices.filter(
      (invoice) => invoice.approvalState === 'ready-for-approval',
    );

    return [
      ...cancelledBookings.map((booking) => ({
        ...location,
        id: `${locationData.location.id}-cancelled-${booking.id}`,
        section: 'urgent' as const,
        priority: 0,
        title: `${booking.cancelledBy ?? booking.workerName} cancelled a booking`,
        description: `A replacement is needed for the shift starting ${formatLongDate(booking.start)}.`,
        Icon: CalendarX,
        date: booking.cancelledAt ?? today,
        sortDate: booking.start,
        path: bookingDetailPath(booking.id),
      })),
      ...(locationData.requestsToAccept > 0
        ? [
            {
              ...location,
              id: `${locationData.location.id}-requests`,
              section: 'urgent' as const,
              priority: 1,
              title: `${locationData.requestsToAccept} ${locationData.requestsToAccept === 1 ? 'request' : 'requests'} waiting to be accepted`,
              description: 'Workers have not yet responded to these requests.',
              Icon: Calendar,
              date: requestedBookings[0]?.start ?? today,
              path: bookingsViewPath('requested'),
            },
          ]
        : []),
      ...(locationData.bookingsToApprove > 0
        ? [
            {
              ...location,
              id: `${locationData.location.id}-booking-approvals`,
              section: 'review' as const,
              priority: 0,
              title: `${locationData.bookingsToApprove} bookings to approve`,
              description:
                'Approve completed bookings so workers can be paid on time.',
              Icon: CalendarCheck,
              date: addDays(today, -2),
              path: bookingsViewPath('approve'),
            },
          ]
        : []),
      ...invoicesReady.map((invoice) => ({
        ...location,
        id: `${locationData.location.id}-invoice-${invoice.id}`,
        section: 'review' as const,
        priority: 1,
        title: 'Invoice ready to approve',
        description: 'Review this invoice before it goes to finance.',
        Icon: ReceiptText,
        date: invoice.submittedAt,
        path: '/invoices',
      })),
      ...lapsedAssessments.map(({ id, worker, name, expiresAt }) => ({
        ...location,
        id: `${locationData.location.id}-assessment-${id}`,
        section: 'review' as const,
        priority: 2,
        title: `${worker.name}'s ${name.toLowerCase()} assessment has lapsed`,
        description: `${name} assessment expired ${formatLongDate(expiresAt)}.`,
        Icon: ShieldAlert,
        date: expiresAt,
        path: workerProfilePath(worker.id),
      })),
      ...supportPlansDue.map((worker) => ({
        ...location,
        id: `${locationData.location.id}-support-plan-${worker.id}`,
        section: 'review' as const,
        priority: 3,
        title: `${worker.name}'s support plan needs review`,
        description: `Review became due ${formatLongDate(worker.supportPlanReviewDueAt!)}.`,
        Icon: ClipboardList,
        date: worker.supportPlanReviewDueAt!,
        path: workerProfilePath(worker.id),
      })),
      ...(locationData.unreadMessages > 0
        ? [
            {
              ...location,
              id: `${locationData.location.id}-messages`,
              section: 'messages' as const,
              priority: 0,
              title: `${locationData.unreadMessages} unread ${locationData.unreadMessages === 1 ? 'message' : 'messages'}`,
              description: unreadMessagesFromDescription(
                locationData.location.id,
              ),
              Icon: MessageSquare,
              date: today,
              path: '/messages',
            },
          ]
        : []),
    ];
  });

  return items.sort(
    (a, b) =>
      a.priority - b.priority ||
      (a.sortDate ?? a.date).getTime() - (b.sortDate ?? b.date).getTime() ||
      a.locationName.localeCompare(b.locationName),
  );
}

export function notificationCount(data: LocationData[]): number {
  return data.reduce(
    (total, locationData) => {
      const cancelledBookings = locationData.bookings.filter(
        (booking) => booking.status === 'cancelled',
      );

      return (
        total +
        locationData.requestsToAccept +
        cancelledBookings.length
      );
    },
    0,
  );
}

export function Notifications({
  data,
  onSelectLocation,
}: {
  data: LocationData[];
  onSelectLocation: (locationId: string) => void;
}) {
  const items = buildItems(data);
  const showLocation = data.length > 1;
  const sections = [
    {
      id: 'urgent',
      title: 'Needs attention now',
      items: items.filter((item) => item.section === 'urgent'),
    },
    {
      id: 'review',
      title: 'Checks and approvals',
      items: items.filter((item) => item.section === 'review'),
    },
    {
      id: 'messages',
      title: 'Messages',
      items: items.filter((item) => item.section === 'messages'),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="width-main-column">
      <PageHeading title="Notifications" />

      {items.length === 0 ? (
        <Card className="p-6">
          <p className="text-lg font-bold text-text">
            {EMPTY_STATES.notifications.title}
          </p>
          <p className="mt-1 max-w-content text-sm text-text-secondary">
            {EMPTY_STATES.notifications.description}
          </p>
        </Card>
      ) : (
        <div className="relative">
          <PinnedQuestion
            questionId="notifications-list"
            className="absolute -top-3 right-3 z-10"
          />
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.id}>
                <h2 className="mb-3 text-md font-bold text-text">
                  {section.title}
                </h2>
                <Card as="ul" divided>
                  {section.items.map(
                    ({
                      id,
                      title,
                      description,
                      Icon,
                      date,
                      path,
                      locationId,
                      locationName,
                    }) => (
                      <li
                        key={id}
                        className="ui-inset-row ui-target-row flex items-start gap-3"
                      >
                        <Icon className="h-5 w-5 shrink-0 text-text-strong" />
                        <div className="min-w-0 flex-1">
                          <a
                            href={href(path)}
                            onClick={() => onSelectLocation(locationId)}
                            className="ui-target-row__link ui-target-row__link--text"
                          >
                            {title}
                          </a>
                          <p className="mt-1 text-sm text-text-secondary">
                            {description}
                          </p>
                          {showLocation && (
                            <p className="mt-1 text-xs text-text-tertiary">
                              {locationName}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm text-text-tertiary">
                          {formatLongDate(date)}
                        </span>
                      </li>
                    ),
                  )}
                </Card>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
