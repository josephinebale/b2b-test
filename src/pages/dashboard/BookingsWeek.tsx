import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import {
  fatigueSignalForBooking,
  fatigueSignalLabel,
  type Booking,
  type LocationData,
  bookingParticipantSummary,
} from '../../data/locations';
import { PinnedQuestion } from '../../components/PinnedQuestion';
import { StatusPill } from '../../components/StatusPill';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/IconButton';
import { Tag } from '../../components/ui/Tag';
import {
  attentionCardSendLine,
  bookingDetailPath,
  bookingWeekCardTone,
  EMPTY_STATES,
} from '../../lib/pageContent';
import { href } from '../../lib/router';
import {
  addDays,
  formatTime,
  formatWeekRange,
  isSameDay,
  startOfDay,
  startOfWeek,
  weekdayShort,
} from '../../lib/date';

export const COLLAPSED_BOOKINGS_PER_DAY = 4;

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

export function WeekScheduleControls({
  onToday,
  onPrevious,
  onNext,
}: {
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button type="button" onClick={onToday}>
        Today
      </Button>
      <IconButton
        type="button"
        onClick={onPrevious}
        className="ui-tooltip"
        aria-label="Previous week"
        data-tooltip="Previous week"
      >
        <ChevronLeft className="h-5 w-5" />
      </IconButton>
      <IconButton
        type="button"
        onClick={onNext}
        className="ui-tooltip"
        aria-label="Next week"
        data-tooltip="Next week"
      >
        <ChevronRight className="h-5 w-5" />
      </IconButton>
    </div>
  );
}

export function WeekScheduleGrid<T extends { id: string }>({
  days,
  today,
  bookingsByDay,
  gridId,
  expanded,
  onToggleExpanded,
  hiddenBookingCount,
  emptyDayLabel,
  emptyDayClassName = '',
  renderCard,
  stretchColumns = true,
}: {
  days: Date[];
  today: Date;
  bookingsByDay: T[][];
  gridId: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  hiddenBookingCount: number;
  emptyDayLabel: string;
  emptyDayClassName?: string;
  renderCard: (booking: T) => ReactNode;
  stretchColumns?: boolean;
}) {
  return (
    <>
      <div className="booking-week-scroll">
        <div className="booking-week-grid">
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={`ui-inset-compact border-t-2 border-b border-l border-border-subtle first:border-l-0 ${
                  isToday ? 'border-t-brand' : 'border-t-transparent'
                }`}
              >
                <p
                  className={`text-xs ${isToday ? 'font-bold text-text' : 'text-text-strong'}`}
                >
                  {isToday ? 'Today' : weekdayShort(day)}
                </p>
                <p className="text-sm font-bold text-text">{day.getDate()}</p>
              </div>
            );
          })}
        </div>

        <div
          id={gridId}
          className={`booking-week-grid${stretchColumns ? ' booking-grid' : ''}`}
        >
          {days.map((day, index) => {
            const dayBookings = bookingsByDay[index];
            const visibleDayBookings = expanded
              ? dayBookings
              : dayBookings.slice(0, COLLAPSED_BOOKINGS_PER_DAY);
            return (
              <div
                key={day.toISOString()}
                className="ui-inset-compact space-y-2 border-l border-border-subtle first:border-l-0"
              >
                {dayBookings.length === 0 ? (
                  <p
                    className={`ui-inset-compact border border-transparent text-xs text-text-tertiary ${emptyDayClassName}`.trim()}
                  >
                    {emptyDayLabel}
                  </p>
                ) : (
                  visibleDayBookings.map((booking) => (
                    <div key={booking.id}>{renderCard(booking)}</div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
      {hiddenBookingCount > 0 && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={gridId}
          onClick={onToggleExpanded}
          className="ui-link ui-link--flush flex w-full items-center justify-center gap-1 border-t border-border-subtle px-4 py-3 text-sm font-medium"
        >
          {expanded
            ? 'Show less'
            : `${hiddenBookingCount} more ${plural(hiddenBookingCount, 'booking', 'bookings')}`}
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      )}
    </>
  );
}

function BookingCard({
  booking,
  suburb,
  state,
  location,
  calendarBookings,
}: {
  booking: Booking;
  suburb: string;
  state: string;
  location: LocationData['location'];
  calendarBookings: Booking[];
}) {
  const fatigueSignal = fatigueSignalForBooking(booking, {
    additionalBookings: calendarBookings,
  });
  const participantSummary = bookingParticipantSummary(booking, location);

  return (
    <a
      href={href(bookingDetailPath(booking.id))}
      aria-label={`Open booking for ${booking.workerName}`}
      className="ui-linked-surface"
    >
      <Card
        tone={bookingWeekCardTone(booking)}
        className="ui-inset-compact !rounded-sm"
      >
        <p className="text-xs text-text">
          {formatTime(booking.start)} - {formatTime(booking.end)}
        </p>
        {booking.sleepover && (
          <p className="mt-1 text-xs font-bold text-text">Sleepover</p>
        )}
        <p className="mt-1 text-xs text-text-strong">
          {suburb}, {state}
        </p>
        {participantSummary && (
          <p className="mt-1 text-xs text-text-strong">{participantSummary}</p>
        )}
        <p className="mt-1 text-xs text-text-strong">{booking.workerName}</p>
        {/* A Tag holds one line and the card clips what overflows, so at a
            seventh of the column the label lost its last word. The card already
            states Sleepover as a plain bold line; this reads the same way and
            can take a second line. */}
        {fatigueSignal && (
          <p className="mt-2 text-xs font-bold text-text break-words">
            {fatigueSignalLabel(fatigueSignal)}
          </p>
        )}
        {booking.status === 'cancelled' ? (
          <p className="mt-3 text-xs font-bold text-badge break-words">
            {attentionCardSendLine(booking)}
          </p>
        ) : (
          <div className="mt-3">
            <StatusPill status={booking.status} />
          </div>
        )}
      </Card>
    </a>
  );
}

export function BookingsWeek({
  data,
  calendarBookings = [],
}: {
  data: LocationData;
  calendarBookings?: Booking[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const today = startOfDay(new Date());
  const weekStart = addDays(startOfWeek(today), weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const inWeek = data.bookings.filter(
    (booking) => booking.start >= weekStart && booking.start < addDays(weekEnd, 1),
  );
  const bookingsByDay = days.map((day) =>
    inWeek.filter((booking) => isSameDay(booking.start, day)),
  );
  const hiddenBookingCount = bookingsByDay.reduce(
    (total, bookings) => total + Math.max(0, bookings.length - COLLAPSED_BOOKINGS_PER_DAY),
    0,
  );

  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-md font-bold text-text">
            <span>Bookings for {formatWeekRange(weekStart, weekEnd)}:</span>
            <Tag>{inWeek.length}</Tag>
            <PinnedQuestion questionId="bookings-week" />
          </h2>
          <p className="mt-1 max-w-content text-sm text-text-secondary">
            Times are displayed in the local time of the booking.
          </p>
        </div>

        <WeekScheduleControls
          onToday={() => {
            setWeekOffset(0);
            setExpanded(false);
          }}
          onPrevious={() => {
            setWeekOffset((value) => value - 1);
            setExpanded(false);
          }}
          onNext={() => {
            setWeekOffset((value) => value + 1);
            setExpanded(false);
          }}
        />
      </div>

      <Card>
        {inWeek.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-lg font-bold text-text">
              {EMPTY_STATES.bookingsWeek.title}
            </p>
            <p className="mt-1 mx-auto max-w-content text-sm text-text-secondary">
              {EMPTY_STATES.bookingsWeek.description}
            </p>
          </div>
        ) : (
          <WeekScheduleGrid
            days={days}
            today={today}
            bookingsByDay={bookingsByDay}
            gridId="bookings-week-grid"
            expanded={expanded}
            onToggleExpanded={() => setExpanded((value) => !value)}
            hiddenBookingCount={hiddenBookingCount}
            emptyDayLabel="No bookings"
            renderCard={(booking) => (
              <BookingCard
                booking={booking}
                suburb={data.location.suburb}
                state={data.location.state}
                location={data.location}
                calendarBookings={calendarBookings}
              />
            )}
          />
        )}
      </Card>
    </section>
  );
}
