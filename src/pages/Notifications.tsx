import { Calendar, CalendarCheck, ClipboardList, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { LocationData } from '../data/locations';
import { PageHeading } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Card } from '../components/ui/Card';
import { unreadMessagesFromDescription } from '../data/conversations';
import { addDays, formatLongDate, startOfDay } from '../lib/date';
import { EMPTY_STATES, WORKERS_ROUTE, bookingsViewPath } from '../lib/pageContent';
import { href } from '../lib/router';

type Item = {
  title: string;
  description: string;
  Icon: LucideIcon;
  date: Date;
  path: string;
};

function buildItems(data: LocationData): Item[] {
  const today = startOfDay(new Date());

  const items: Item[] = [
    {
      title: `${data.unreadMessages} unread ${data.unreadMessages === 1 ? 'message' : 'messages'}`,
      description: unreadMessagesFromDescription(data.location.id),
      Icon: MessageSquare,
      date: today,
      path: '/messages',
    },
    {
      title: `${data.requestsToAccept} ${data.requestsToAccept === 1 ? 'request' : 'requests'} waiting to be accepted`,
      description: 'Workers have not yet responded to these requests.',
      Icon: Calendar,
      date: addDays(today, -1),
      path: bookingsViewPath('requested'),
    },
    {
      title: `${data.bookingsToApprove} bookings to approve`,
      description: 'Approve completed bookings so workers can be paid on time.',
      Icon: CalendarCheck,
      date: addDays(today, -2),
      path: bookingsViewPath('approve'),
    },
    {
      title: `${data.plansToReview} ${data.plansToReview === 1 ? 'worker has' : 'workers have'} not confirmed the support plan`,
      description: 'Remind them to read and confirm the latest support plan.',
      Icon: ClipboardList,
      date: addDays(today, -4),
      path: WORKERS_ROUTE,
    },
  ];

  return items;
}

export function Notifications({ data }: { data: LocationData }) {
  const items = buildItems(data);

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
          <Card as="ul" divided>
            {items.map(({ title, description, Icon, date, path }) => (
              <li
                key={title}
                className="ui-inset-row ui-target-row flex items-start gap-3"
              >
                <Icon className="h-5 w-5 shrink-0 text-text-strong" />
                <div className="min-w-0 flex-1">
                  <a
                    href={href(path)}
                    className="ui-target-row__link ui-target-row__link--text"
                  >
                    {title}
                  </a>
                  <p className="mt-1 text-sm text-text-secondary">{description}</p>
                </div>
                <span className="shrink-0 text-sm text-text-tertiary">{formatLongDate(date)}</span>
              </li>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
