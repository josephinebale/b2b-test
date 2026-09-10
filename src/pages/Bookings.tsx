import { useMemo, useState } from 'react';
import { Check, Clock3, MapPin, Moon, Repeat2, Users, X } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { RequestBookingButton } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Badge } from '../components/ui/Badge';
import { Tag } from '../components/ui/Tag';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import {
  bookingParticipantSummary,
  bookingParticipants,
  fatigueSignalForBooking,
  fatigueSignalLabel,
  type Booking,
  type LocationData,
} from '../data/locations';
import { formatTime, startOfDay } from '../lib/date';
import {
  EMPTY_STATES,
  WORKERS_ROUTE,
  bookingsViewPath,
  workerProfilePath,
  type BookingViewId,
} from '../lib/pageContent';
import { href, navigate } from '../lib/router';

type BookingView = BookingViewId;

const VIEWS: { id: BookingView; label: string }[] = [
  { id: 'requested', label: 'Requested' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'waiting', label: 'Waiting for submission' },
  { id: 'approve', label: 'Ready to approve' },
  { id: 'next-invoice', label: 'Next invoice' },
  { id: 'invoiced', label: 'Invoiced' },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fullDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function bookingTitle(booking: Booking): string {
  const start = fullDate(booking.start);
  const end = fullDate(booking.end);
  const time = `${formatTime(booking.start)} - ${formatTime(booking.end)}`;

  if (dateKey(booking.start) === dateKey(booking.end)) return `${start}, ${time}`;
  return `${start} - ${end}, ${time}`;
}

function durationHours(booking: Booking): number {
  return Math.round(((booking.end.getTime() - booking.start.getTime()) / 36e5) * 10) / 10;
}

function priceFor(booking: Booking): string {
  const cents = Math.round(durationHours(booking) * (booking.sleepover ? 41.15 : 72.74) * 100);
  return `$${(cents / 100).toFixed(2)}`;
}

function bookingsForView(data: LocationData, view: BookingView): Booking[] {
  const today = startOfDay(new Date());

  if (view === 'confirmed') {
    return data.bookings.filter(
      (booking) => booking.status === 'confirmed' && booking.end >= today,
    );
  }
  if (view === 'requested') {
    return data.bookings.filter(
      (booking) => booking.status === 'requested' && booking.end >= today,
    );
  }
  if (view === 'approve') {
    return data.bookings
      .filter((booking) => booking.status === 'ended')
      .slice(-data.bookingsToApprove);
  }
  return [];
}

function BookingCard({
  booking,
  data,
  calendarBookings,
  showFatigueQuestion,
}: {
  booking: Booking;
  data: LocationData;
  calendarBookings: Booking[];
  showFatigueQuestion: boolean;
}) {
  const hours = durationHours(booking);
  const worker = data.workers.find((item) => item.name === booking.workerName);
  const fatigueSignal = fatigueSignalForBooking(booking, {
    additionalBookings: calendarBookings,
  });
  const detailHref =
    booking.status === 'requested'
      ? href(`/bookings/request/${booking.id}`)
      : href('/bookings');

  return (
    <Card as="article" className="ui-inset-card ui-target-row">
      <h3>
        <a href={detailHref} className="ui-target-row__link">
          {bookingTitle(booking)}
        </a>
      </h3>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Tag tone="neutral">{priceFor(booking)}</Tag>
        {fatigueSignal && (
          <Tag tone="neutral">{fatigueSignalLabel(fatigueSignal)}</Tag>
        )}
        {showFatigueQuestion && (
          <PinnedQuestion questionId="booking-card-fatigue" />
        )}
      </div>

      <Card tone="subtle" className="ui-inset-row mt-4 flex items-center gap-3">
        <Avatar name={booking.workerName} size="lg" />
        <div>
          <EntityLink
            href={href(worker ? workerProfilePath(worker.id) : WORKERS_ROUTE)}
            className="ui-target-row__action ui-target-row__link--text ui-nested-link"
          >
            {booking.workerName}
          </EntityLink>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
            {booking.status === 'confirmed' && <Check className="h-5 w-5 text-success" />}
            {booking.status === 'confirmed' ? 'Worker confirmed' : 'Waiting for worker response'}
          </p>
        </div>
      </Card>

      <dl className="mt-3 space-y-1 text-sm text-text-strong">
        <div className="flex items-center gap-2">
          <Clock3 className="h-5 w-5" />
          <span>{hours} {hours === 1 ? 'hour' : 'hours'}</span>
        </div>
        {booking.sleepover && (
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            <span>Sleepover</span>
          </div>
        )}
        {bookingParticipantSummary(booking, data.location) && (
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>
              {bookingParticipants(booking, data.location)
                .map((person) => person.name)
                .join(', ')}
            </span>
            {showFatigueQuestion && (
              <PinnedQuestion questionId="booking-card-participants" />
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Repeat2 className="h-5 w-5" />
          <span>Weekly on a {WEEKDAYS[booking.start.getDay()]}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <span>{data.location.suburb}, {data.location.state}</span>
        </div>
      </dl>

      <div className="ui-target-row__action mt-3 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="small"
        >
          Duplicate
        </Button>
        {booking.createdByMe && (
          <Button type="button" size="small">
            Edit
          </Button>
        )}
        <Button href={href('/report-incident')} size="small">
          Report incident
        </Button>
      </div>
    </Card>
  );
}

export function Bookings({
  data,
  view,
  calendarBookings = [],
}: {
  data: LocationData;
  view: BookingView;
  calendarBookings?: Booking[];
}) {
  const [worker, setWorker] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createdByMe, setCreatedByMe] = useState(false);

  const viewBookings = useMemo(() => bookingsForView(data, view), [data, view]);
  const filteredBookings = useMemo(
    () =>
      viewBookings.filter((booking) => {
        if (worker && booking.workerName !== worker) return false;
        if (dateFrom && dateKey(booking.start) < dateFrom) return false;
        if (dateTo && dateKey(booking.start) > dateTo) return false;
        if (createdByMe && !booking.createdByMe) return false;
        return true;
      }),
    [createdByMe, dateFrom, dateTo, viewBookings, worker],
  );

  const resetFilters = () => {
    setWorker('');
    setDateFrom('');
    setDateTo('');
    setCreatedByMe(false);
  };

  const activeLabel = VIEWS.find((item) => item.id === view)?.label ?? 'Bookings';

  return (
    <div>
      {/* Each column opens with its own heading, so the two headings start level
          while each keeps its own gap to the content beneath it. */}
      <div className="grid layout-rail-content items-start gap-6">
      <div>
      <h1 className="text-xl font-bold text-text">Bookings</h1>

      <aside className="mt-6 space-y-4">
        <nav className="relative space-y-1" aria-label="Booking status">
          <PinnedQuestion
            questionId="bookings-status"
            className="absolute top-1 right-1 z-10"
          />
          {VIEWS.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(bookingsViewPath(item.id))}
                className={`flex w-full items-center gap-2 border-l-4 px-3 py-2 text-left text-sm font-bold ${
                  active
                    ? 'border-text bg-info-surface text-text'
                    : 'border-transparent text-text-strong hover:bg-surface-selected'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'approve' && data.bookingsToApprove > 0 && (
                  <Badge count={data.bookingsToApprove} />
                )}
              </button>
            );
          })}
        </nav>

        <Card as="section" className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-text">Filter results</h2>
            <PinnedQuestion questionId="bookings-filters" />
          </div>

          <div className="mt-3 space-y-4">
          <label className="block text-xs font-medium text-text">
            Support worker
            <span className="relative mt-1 block">
              <select
                value={worker}
                onChange={(event) => setWorker(event.target.value)}
                className="h-10 w-full appearance-none rounded border border-border bg-surface px-2 pr-8 text-sm font-normal text-text"
              >
                <option value="">All workers</option>
                {data.workers.map((option) => (
                  <option key={option.id} value={option.name}>{option.name}</option>
                ))}
              </select>
              {worker && (
                <button
                  type="button"
                  onClick={() => setWorker('')}
                  aria-label="Clear worker filter"
                  className="absolute top-1/2 right-8 -translate-y-1/2 text-text-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </span>
          </label>

          <label className="block text-xs font-medium text-text">
            Date from
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="mt-1 h-10 w-full rounded border border-border bg-surface px-2 text-sm font-normal text-text"
            />
          </label>

          <label className="block text-xs font-medium text-text">
            Date to
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="mt-1 h-10 w-full rounded border border-border bg-surface px-2 text-sm font-normal text-text"
            />
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-text">
            <input
              type="checkbox"
              checked={createdByMe}
              onChange={(event) => setCreatedByMe(event.target.checked)}
              className="m-0 h-4 w-4 shrink-0"
            />
            Bookings I have created
          </label>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="small" className="flex-1">
              Apply filters
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={resetFilters}
              size="small"
              className="flex-1"
            >
              Reset
            </Button>
          </div>
          </div>
        </Card>
      </aside>
      </div>

      <div>
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-text">{activeLabel}</h2>
          <p className="mt-1 max-w-content text-sm text-text-strong">
            Showing {filteredBookings.length > 0 ? 1 : 0} - {Math.min(filteredBookings.length, 40)} of{' '}
            {filteredBookings.length}{' '}
            {view === 'confirmed'
              ? 'upcoming bookings that have been accepted by a worker.'
              : 'bookings.'}
          </p>
        </div>
        <RequestBookingButton />
      </div>

      <section className="mt-6">
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.slice(0, 40).map((booking, index) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                data={data}
                calendarBookings={calendarBookings}
                showFatigueQuestion={index === 0}
              />
            ))}
          </div>
        ) : (
          <Card className="px-6 py-12 text-center">
            <p className="text-lg font-bold text-text">
              {EMPTY_STATES.bookingsFiltered.title}
            </p>
            <p className="mt-1 mx-auto max-w-content text-sm text-text-secondary">
              {EMPTY_STATES.bookingsFiltered.description}
            </p>
          </Card>
        )}
      </section>
      </div>
      </div>
    </div>
  );
}
