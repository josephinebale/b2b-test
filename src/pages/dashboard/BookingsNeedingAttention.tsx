import { useState } from 'react';
import {
  directLocationCount,
  groupingAttentionBookings,
  GROUPING_ATTENTION_GRID_LOCATION_THRESHOLD,
  type AttentionBooking,
  type Booking,
  type Grouping,
} from '../../data/locations';
import { PinnedQuestion } from '../../components/PinnedQuestion';
import { Card } from '../../components/ui/Card';
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
  isSameDay,
  startOfDay,
  startOfWeek,
} from '../../lib/date';
import {
  COLLAPSED_BOOKINGS_PER_DAY,
  WeekScheduleControls,
  WeekScheduleGrid,
} from './BookingsWeek';
import { SectionHeadingRow } from './SectionHeadingRow';

function AttentionCardStatus({ booking }: { booking: AttentionBooking }) {
  const sendLine = attentionCardSendLine(booking);
  if (!sendLine) return null;

  const toneClass =
    booking.status === 'cancelled'
      ? 'attention-grid-status-pill--attention'
      : 'attention-grid-status-pill--pending';

  return (
    <div className="mt-3">
      <span
        className={`flex w-full items-center justify-center rounded px-1.5 py-1 text-center text-xs font-medium ${toneClass}`}
      >
        {sendLine}
      </span>
    </div>
  );
}

function AttentionBookingCard({
  booking,
  onSelectLocation,
}: {
  booking: AttentionBooking;
  onSelectLocation?: (locationId: string, path?: string) => void;
}) {
  const detailPath = bookingDetailPath(booking.id);

  return (
    <a
      href={href(detailPath)}
      aria-label={`Open booking at ${booking.locationName}`}
      className="ui-linked-surface"
      onClick={(event) => {
        event.preventDefault();
        onSelectLocation?.(booking.locationId, detailPath);
      }}
    >
      <Card
        tone={bookingWeekCardTone(booking)}
        className="ui-inset-compact !rounded-sm"
      >
        <p className="text-xs font-bold text-text ">
          {booking.locationName}
        </p>
        <p className="mt-1 text-xs text-text ">
          {formatTime(booking.start)} - {formatTime(booking.end)}
        </p>
        <AttentionCardStatus booking={booking} />
      </Card>
    </a>
  );
}

function AttentionBookingListRow({
  booking,
  onSelectLocation,
}: {
  booking: AttentionBooking;
  onSelectLocation?: (locationId: string, path?: string) => void;
}) {
  const detailPath = bookingDetailPath(booking.id);

  return (
    <a
      href={href(detailPath)}
      className="ui-linked-surface block"
      onClick={(event) => {
        event.preventDefault();
        onSelectLocation?.(booking.locationId, detailPath);
      }}
    >
      <Card
        tone={bookingWeekCardTone(booking)}
        className="ui-inset-compact !rounded-sm"
      >
        <p className="text-xs font-bold text-text ">
          {booking.locationName}
        </p>
        <p className="mt-1 text-xs text-text ">
          {formatTime(booking.start)} - {formatTime(booking.end)}
        </p>
        <AttentionCardStatus booking={booking} />
      </Card>
    </a>
  );
}

export function BookingsNeedingAttention({
  grouping,
  extraBookings = [],
  onSelectLocation,
}: {
  grouping: Grouping;
  extraBookings?: Booking[];
  onSelectLocation?: (locationId: string, path?: string) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const today = startOfDay(new Date());
  const weekStart = addDays(startOfWeek(today), weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const useList =
    directLocationCount(grouping) > GROUPING_ATTENTION_GRID_LOCATION_THRESHOLD;

  const attentionBookings = groupingAttentionBookings(
    grouping.id,
    extraBookings,
  );
  const inWeek = attentionBookings.filter(
    (booking) =>
      booking.start >= weekStart && booking.start < addDays(weekEnd, 1),
  );
  const bookingsByDay = days.map((day) =>
    inWeek.filter((booking) => isSameDay(booking.start, day)),
  );
  const hiddenBookingCount = bookingsByDay.reduce(
    (total, bookings) =>
      total + Math.max(0, bookings.length - COLLAPSED_BOOKINGS_PER_DAY),
    0,
  );

  return (
    <section>
      <SectionHeadingRow
        title={
          <span className="flex items-center gap-2">
            <span>Unfilled shifts:</span>
            <Tag tone="neutral">{inWeek.length}</Tag>
            <PinnedQuestion questionId="grouping-requests" />
          </span>
        }
        supportingLine="Times are displayed in the local time of the booking."
        aside={
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
        }
      />

      {inWeek.length === 0 ? (
        <Card>
          <div className="px-4 py-10 text-center">
            <p className="text-lg font-bold text-text">
              {EMPTY_STATES.dashboardAttentionBookings.title}
            </p>
            <p className="mt-1 mx-auto max-w-content text-sm text-text-secondary">
              {EMPTY_STATES.dashboardAttentionBookings.description}
            </p>
          </div>
        </Card>
      ) : useList ? (
        <Card as="ul" divided>
          {inWeek.map((booking) => (
            <li key={booking.id}>
              <AttentionBookingListRow
                booking={booking}
                onSelectLocation={onSelectLocation}
              />
            </li>
          ))}
        </Card>
      ) : (
        <Card>
          <WeekScheduleGrid
            days={days}
            today={today}
            bookingsByDay={bookingsByDay}
            gridId="bookings-attention-grid"
            expanded={expanded}
            onToggleExpanded={() => setExpanded((value) => !value)}
            hiddenBookingCount={hiddenBookingCount}
            emptyDayLabel="Nothing waiting"
            emptyDayClassName="text-center"
            renderCard={(booking) => (
              <AttentionBookingCard
                booking={booking}
                onSelectLocation={onSelectLocation}
              />
            )}
          />
        </Card>
      )}
    </section>
  );
}
