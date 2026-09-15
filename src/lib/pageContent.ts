import { findLocation, type Location } from '../data/locations.ts';
import {
  addDays,
  formatShiftClock,
  isSameDay,
  startOfDay,
  weekdayLong,
} from './date.ts';

export const WORKERS_ROUTE = '/workers';

/** Grouping Overview page title: node name keeps its capitalisation; suffix is lowercase. */
export function groupingOverviewHeading(groupingName: string): string {
  return `${groupingName} overview`;
}

/** Grouping Workers page title: node name keeps its capitalisation; suffix is lowercase. */
export function groupingWorkersHeading(groupingName: string): string {
  return `${groupingName} workers`;
}

/**
 * Place-based section label from direct location children's service types.
 * SIL houses only → Houses; centres / day programs only → Centres; both → Houses and centres.
 */
export function groupingPlaceBasedLabel(
  housesAndCentres: readonly Location[],
): string {
  if (housesAndCentres.length === 0) return 'Houses and centres';
  const allHouses = housesAndCentres.every(
    (location) => location.serviceType === 'sil',
  );
  const allCentres = housesAndCentres.every(
    (location) => location.serviceType === 'centre',
  );
  if (allHouses) return 'Houses';
  if (allCentres) return 'Centres';
  return 'Houses and centres';
}

/** Child-list page title when more than one section renders — suffix matches the tab label, lowercase. */
export function groupingChildListPageHeading(
  groupingName: string,
  tabLabel: string,
): string {
  return `${groupingName} ${tabLabel.toLowerCase()}`;
}

export function workerProfilePath(workerId: string): string {
  return `${WORKERS_ROUTE}/${workerId}`;
}

export function workerIdFromPath(path: string): string | null {
  if (!path.startsWith(`${WORKERS_ROUTE}/`)) return null;
  return path.slice(WORKERS_ROUTE.length + 1) || null;
}

export const BOOKINGS_ROUTE = '/bookings';
export const BOOKING_DETAIL_ROUTE = `${BOOKINGS_ROUTE}/detail/`;

export function bookingDetailPath(bookingId: string): string {
  return `${BOOKING_DETAIL_ROUTE}${bookingId}`;
}

export function bookingIdFromDetailPath(path: string): string | null {
  if (!path.startsWith(BOOKING_DETAIL_ROUTE)) return null;
  return path.slice(BOOKING_DETAIL_ROUTE.length) || null;
}

/** Each rail status is addressable, so a notification can open the right one. */
export const BOOKING_VIEW_IDS = [
  'requested',
  'confirmed',
  'waiting',
  'approve',
  'next-invoice',
  'invoiced',
] as const;

export type BookingViewId = (typeof BOOKING_VIEW_IDS)[number];

export function bookingsViewPath(view: BookingViewId): string {
  return `${BOOKINGS_ROUTE}/${view}`;
}

export type BookingActionItem = {
  label: string;
  path: string;
};

export type DashboardAsidePendingItem = {
  count: number;
  label: string;
  path: string;
};

export function bookingActionItems(
  requestsToAccept: number,
  bookingsToApprove: number,
): BookingActionItem[] {
  const actions: BookingActionItem[] = [];

  if (requestsToAccept > 0) {
    actions.push({
      label: `${requestsToAccept} ${
        requestsToAccept === 1 ? 'request' : 'requests'
      } waiting to be accepted`,
      path: bookingsViewPath('requested'),
    });
  }

  if (bookingsToApprove > 0) {
    actions.push({
      label: `${bookingsToApprove} ${
        bookingsToApprove === 1 ? 'booking' : 'bookings'
      } to approve`,
      path: bookingsViewPath('approve'),
    });
  }

  return actions;
}

/* A grouping row states the same waiting work as the location's own action
   line, so it drops a zero the same way: a quiet location reads as quiet in
   both places rather than as "0 requests · 0 approvals · 0 unread messages".
   Messages stay in this summary — a grouping has no nav badge to carry them. */
export function pendingWorkParts(counts: {
  requests: number;
  approvals: number;
  messages: number;
}): string[] {
  const parts: string[] = [];

  if (counts.requests > 0) {
    parts.push(
      `${counts.requests} ${counts.requests === 1 ? 'request' : 'requests'}`,
    );
  }

  if (counts.approvals > 0) {
    parts.push(
      `${counts.approvals} ${counts.approvals === 1 ? 'approval' : 'approvals'}`,
    );
  }

  if (counts.messages > 0) {
    parts.push(
      `${counts.messages} unread ${
        counts.messages === 1 ? 'message' : 'messages'
      }`,
    );
  }

  return parts;
}

/** Approvals and unread messages on Overview house rows — shift counts stay in the calendar. */
export function dashboardHouseRowPendingLinks(counts: {
  approvals: number;
  messages: number;
}): DashboardAsidePendingItem[] {
  const items: DashboardAsidePendingItem[] = [];

  if (counts.approvals > 0) {
    items.push({
      count: counts.approvals,
      label:
        counts.approvals === 1 ? 'booking to approve' : 'bookings to approve',
      path: bookingsViewPath('approve'),
    });
  }

  if (counts.messages > 0) {
    items.push({
      count: counts.messages,
      label: counts.messages === 1 ? 'unread message' : 'unread messages',
      path: '/messages',
    });
  }

  return items;
}

/** Cancelled and awaiting shifts, then approvals and messages — full stack (Supportables-style). */
export function dashboardAsidePendingLinks(counts: {
  cancelled: number;
  awaiting: number;
  approvals: number;
  messages: number;
}): DashboardAsidePendingItem[] {
  const items: DashboardAsidePendingItem[] = [];

  if (counts.cancelled > 0) {
    items.push({
      count: counts.cancelled,
      label: counts.cancelled === 1 ? 'cancelled shift' : 'cancelled shifts',
      path: bookingsViewPath('requested'),
    });
  }

  if (counts.awaiting > 0) {
    items.push({
      count: counts.awaiting,
      label:
        counts.awaiting === 1
          ? 'shift awaiting a worker'
          : 'shifts awaiting workers',
      path: bookingsViewPath('requested'),
    });
  }

  if (counts.approvals > 0) {
    items.push({
      count: counts.approvals,
      label:
        counts.approvals === 1 ? 'booking to approve' : 'bookings to approve',
      path: bookingsViewPath('approve'),
    });
  }

  if (counts.messages > 0) {
    items.push({
      count: counts.messages,
      label: counts.messages === 1 ? 'unread message' : 'unread messages',
      path: '/messages',
    });
  }

  return items;
}

export type DashboardAsideSort =
  | 'most-waiting'
  | 'soonest-shift'
  | 'house-name';

export type DashboardAsideSortableLocation = {
  id: string;
  name: string;
};

export type DashboardAsideLocationSortMetrics = {
  waitingCount: number;
  soonestAwaitingStart: Date | null;
};

export function dashboardAsideWaitingCount(counts: {
  cancelled: number;
  awaiting: number;
  approvals: number;
  messages: number;
}): number {
  return (
    counts.cancelled + counts.awaiting + counts.approvals + counts.messages
  );
}

export function sortDashboardAsideLocations<
  T extends DashboardAsideSortableLocation,
>(
  locations: T[],
  sort: DashboardAsideSort,
  metrics: Map<string, DashboardAsideLocationSortMetrics>,
): T[] {
  const sorted = [...locations];

  if (sort === 'house-name') {
    return sorted.sort((first, second) =>
      first.name.localeCompare(second.name),
    );
  }

  if (sort === 'soonest-shift') {
    return sorted.sort((first, second) => {
      const firstStart = metrics.get(first.id)?.soonestAwaitingStart;
      const secondStart = metrics.get(second.id)?.soonestAwaitingStart;

      if (!firstStart && !secondStart) {
        return first.name.localeCompare(second.name);
      }
      if (!firstStart) return 1;
      if (!secondStart) return -1;
      if (firstStart.getTime() !== secondStart.getTime()) {
        return firstStart.getTime() - secondStart.getTime();
      }
      return first.name.localeCompare(second.name);
    });
  }

  return sorted.sort((first, second) => {
    const firstCount = metrics.get(first.id)?.waitingCount ?? 0;
    const secondCount = metrics.get(second.id)?.waitingCount ?? 0;
    if (secondCount !== firstCount) return secondCount - firstCount;
    return first.name.localeCompare(second.name);
  });
}

export function attentionCardSendLine(booking: {
  status: string;
  cancelledBy?: string;
  requestedWorkerNames?: string[];
  declinedWorkerNames?: string[];
}): string | null {
  if (booking.status === 'cancelled') {
    return `${booking.cancelledBy ?? 'A worker'} cancelled`;
  }

  const sent = booking.requestedWorkerNames?.length ?? 0;
  const declined = booking.declinedWorkerNames?.length ?? 0;

  if (declined === 0) return 'Not yet accepted';
  return `${declined} of ${sent} declined`;
}

export function bookingWeekCardTone(booking: {
  status: string;
}): 'default' | 'pending' | 'attention' {
  if (booking.status === 'requested') return 'pending';
  if (booking.status === 'cancelled') return 'attention';
  return 'default';
}

export function attentionCardStatusTone(booking: {
  status: string;
}): 'attention-grid-pending' | 'attention-grid-attention' {
  /* White tags on tinted cards: pending text on tan, badge text on attention. */
  return booking.status === 'cancelled'
    ? 'attention-grid-attention'
    : 'attention-grid-pending';
}

function rankWorkerLocations<
  T extends { locationId: string; bookingCount: number },
>(locations: T[], locationOrder: string[]): T[] {
  return [...locations].sort((first, second) => {
    if (second.bookingCount !== first.bookingCount) {
      return second.bookingCount - first.bookingCount;
    }
    return (
      locationOrder.indexOf(first.locationId) -
      locationOrder.indexOf(second.locationId)
    );
  });
}

export function dashboardWorkerPrimaryLocation(
  worker: { locations: { locationId: string; bookingCount: number }[] },
  locationOrder: string[],
): string | undefined {
  return rankWorkerLocations(worker.locations, locationOrder)[0]?.locationId;
}

export function dashboardWorkerShiftSplitLine(
  worker: {
    shiftCount: number;
    locations: {
      locationId: string;
      locationName: string;
      bookingCount: number;
    }[];
  },
  locationOrder: string[],
): string {
  const ranked = rankWorkerLocations(worker.locations, locationOrder);
  const split = ranked
    .map((location) => `${location.locationName} (${location.bookingCount})`)
    .join(', ');
  const shiftWord = worker.shiftCount === 1 ? 'shift' : 'shifts';
  return `${worker.shiftCount} ${shiftWord}: ${split}`;
}

export function dashboardWorkerEvidenceLine(
  worker: { lastWorkedAt?: Date; lastWorkedLocationId?: string },
  now = new Date(),
): string {
  if (worker.lastWorkedAt && worker.lastWorkedLocationId) {
    const location = findLocation(worker.lastWorkedLocationId);
    if (location) {
      const when = dashboardWorkerLastWorkedLabel(worker.lastWorkedAt, now);
      const preposition =
        location.serviceType === 'home-community' ? 'for' : 'at';
      return `${when} ${preposition} ${location.name}`;
    }
  }
  if (worker.lastWorkedAt) {
    return dashboardWorkerLastWorkedLabel(worker.lastWorkedAt, now);
  }
  return 'Last worked recently';
}

export function dashboardWorkerExceptionLines(worker: {
  assessments: { medication: boolean; driving: boolean };
}): string[] {
  const lines: string[] = [];
  if (!worker.assessments.medication) {
    lines.push('Medication assessment not current');
  }
  if (!worker.assessments.driving) lines.push('Driving assessment not current');
  return lines;
}

export function dashboardWorkerLastWorkedLabel(
  lastWorkedAt: Date,
  now = new Date(),
): string {
  const today = startOfDay(now);
  const worked = startOfDay(lastWorkedAt);
  if (isSameDay(worked, today)) return 'Last worked today';
  if (isSameDay(worked, addDays(today, -1))) return 'Last worked yesterday';
  const days = Math.round(
    (today.getTime() - worked.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (days === 7) return 'Last worked 1 week ago';
  if (days > 7 && days % 7 === 0) {
    return `Last worked ${days / 7} weeks ago`;
  }
  return `Last worked ${days} days ago`;
}

export function attentionCardTimeRange(booking: {
  start: Date;
  end: Date;
}): string {
  return `${formatShiftClock(booking.start)} to ${formatShiftClock(booking.end)}`;
}

export function namedLocationList(names: string[], limit = 4): string {
  if (names.length === 0) return '';
  if (names.length <= limit) return names.join(', ');
  const remaining = names.length - limit;
  return `${names.slice(0, limit).join(', ')} and ${remaining} more`;
}

function countWord(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function formatDurationHours(hours: number): string {
  const rounded = Math.max(1, Math.round(hours));
  if (rounded < 24) {
    return `${rounded} ${countWord(rounded, 'hour', 'hours')}`;
  }
  const days = Math.max(1, Math.round(rounded / 24));
  return `${days} ${countWord(days, 'day', 'days')}`;
}

function isOvernightShift(start: Date, end: Date): boolean {
  return (
    end.getFullYear() !== start.getFullYear() ||
    end.getMonth() !== start.getMonth() ||
    end.getDate() !== start.getDate()
  );
}

function shiftLead(
  booking: { start: Date; end: Date; sleepover?: boolean },
  now: Date,
): string {
  const times = `${formatShiftClock(booking.start)} to ${formatShiftClock(booking.end)}`;
  const overnight = isOvernightShift(booking.start, booking.end);
  const tonight = isSameDay(booking.start, now);

  if (tonight && booking.sleepover) return `Tonight's sleepover, ${times}`;
  if (tonight && overnight) return `Tonight's overnight, ${times}`;
  if (overnight) return `${weekdayLong(booking.start)} overnight, ${times}`;
  return `${weekdayLong(booking.start)} ${times}`;
}

export function requestActivityLine(
  booking: {
    status: string;
    cancelledBy?: string;
    cancelledAt?: Date;
    requestedWorkerNames?: string[];
    declinedWorkerNames?: string[];
    requestedAt?: Date;
    sleepover?: boolean;
    start: Date;
    end?: Date;
  },
  now = new Date(),
): string {
  const end = booking.end ?? booking.start;
  const shift = shiftLead({ ...booking, end }, now);

  if (booking.status === 'cancelled') {
    const name = booking.cancelledBy ?? 'A worker';
    return `${shift}. ${name} cancelled.`;
  }

  const sent = booking.requestedWorkerNames ?? [];
  const declined = booking.declinedWorkerNames ?? [];

  if (declined.length === 0) {
    return `${shift}. No acceptances from ${sent.length} ${countWord(sent.length, 'worker', 'workers')}.`;
  }

  const unansweredFrom = booking.requestedAt ?? now;
  const hours = (now.getTime() - unansweredFrom.getTime()) / 3600000;
  return `${shift}. ${declined.length} of ${sent.length} declined, unanswered for ${formatDurationHours(hours)}.`;
}

export function shiftStartUrgency(
  booking: { start: Date },
  now = new Date(),
): { tone: 'pending'; label: string } | null {
  const ms = booking.start.getTime() - now.getTime();
  if (ms < 0) return { tone: 'pending', label: 'Started' };
  if (ms <= 24 * 3600 * 1000) {
    return {
      tone: 'pending',
      label: `Starts in ${formatDurationHours(ms / 3600000)}`,
    };
  }
  return null;
}

export function shiftDateTime(booking: { start: Date; end?: Date }): string {
  const end = booking.end ?? booking.start;
  return `${weekdayLong(booking.start)} ${formatShiftClock(booking.start)} to ${formatShiftClock(end)}`;
}

export function requestSendLine(booking: {
  status: string;
  requestedWorkerNames?: string[];
  declinedWorkerNames?: string[];
}): string | null {
  const detail = shiftSendDetail(booking);
  if (!detail) return null;
  return `${detail.charAt(0).toUpperCase()}${detail.slice(1)}.`;
}

export function shiftSendDetail(booking: {
  status: string;
  requestedWorkerNames?: string[];
  declinedWorkerNames?: string[];
}): string | null {
  if (booking.status === 'cancelled') return null;

  const sent = booking.requestedWorkerNames ?? [];
  const declined = booking.declinedWorkerNames ?? [];

  if (declined.length === 0) {
    return `sent to ${sent.length} ${countWord(sent.length, 'worker', 'workers')}, none accepted`;
  }
  return `sent to ${sent.length} ${countWord(sent.length, 'worker', 'workers')}, ${declined.length} declined`;
}

function shiftCountdown(booking: { start: Date }, now: Date): string {
  const ms = booking.start.getTime() - now.getTime();
  if (ms < 0) {
    return `started ${formatDurationHours(Math.abs(ms) / 3600000)} ago`;
  }
  return `starts in ${formatDurationHours(ms / 3600000)}`;
}

export function shiftWaitingLine(
  booking: {
    status: string;
    start: Date;
    requestedWorkerNames?: string[];
    declinedWorkerNames?: string[];
  },
  now = new Date(),
): string | null {
  if (booking.status === 'cancelled') return null;
  const send = shiftSendDetail(booking);
  const countdown = shiftCountdown(booking, now);
  return send ? `${countdown}, ${send}` : countdown;
}

export function shiftStateTag(
  booking: { status: string; start: Date },
  now = new Date(),
): { tone: 'pending' | 'attention'; label: string } | null {
  if (booking.status === 'cancelled') {
    return { tone: 'attention', label: 'Worker cancelled' };
  }

  const ms = booking.start.getTime() - now.getTime();
  if (ms < 0) {
    return {
      tone: 'pending',
      label: `Started ${formatDurationHours(Math.abs(ms) / 3600000)} ago`,
    };
  }
  if (ms <= 24 * 3600 * 1000) {
    return {
      tone: 'pending',
      label: `Starts in ${formatDurationHours(ms / 3600000)}`,
    };
  }
  return null;
}

export function moreShiftsWaitingLabel(count: number): string {
  return `${count} more ${countWord(count, 'shift', 'shifts')} waiting`;
}

export function othersWaitingLine(count: number): string | null {
  if (count <= 0) return null;
  return `And ${count} ${countWord(count, 'other', 'others')} waiting.`;
}

/** Houses, then centres, then clients. Omit zeros. Never a category name. */
export function childCountLine(counts: {
  houses: number;
  centres: number;
  clients: number;
}): string {
  const parts: string[] = [];

  if (counts.houses > 0) {
    parts.push(`${counts.houses} ${counts.houses === 1 ? 'house' : 'houses'}`);
  }
  if (counts.centres > 0) {
    parts.push(
      `${counts.centres} ${counts.centres === 1 ? 'centre' : 'centres'}`,
    );
  }
  if (counts.clients > 0) {
    parts.push(
      `${counts.clients} ${counts.clients === 1 ? 'client' : 'clients'}`,
    );
  }

  if (parts.length <= 1) return parts[0] ?? '';
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export function bookingViewFromPath(path: string): BookingViewId | null {
  if (!path.startsWith(`${BOOKINGS_ROUTE}/`)) return null;
  const candidate = path.slice(BOOKINGS_ROUTE.length + 1);
  return BOOKING_VIEW_IDS.find((view) => view === candidate) ?? null;
}

export const NOTIFICATION_EMPTY_DESCRIPTIONS = {
  requests: "We'll let you know when a booking request needs your attention.",
  approvals: "We'll let you know when a booking needs your approval.",
  messages: "We'll let you know when you have a new message.",
} as const;

export const EMPTY_STATES = {
  bookingsWeek: {
    title: 'No bookings this week',
    description: 'Bookings scheduled for this week will appear here.',
  },
  workers: {
    title: 'No workers to show',
    description: 'Workers will appear after they have booking history with this provider.',
  },
  notifications: {
    title: 'No notifications',
    description: 'New notifications will appear here.',
  },
  conversations: {
    title: 'No conversations found',
    description: 'Try a different name or message.',
  },
  bookingsFiltered: {
    title: 'No bookings to show',
    description: 'Bookings will appear when they match this status and your filters.',
  },
  dashboardAttentionBookings: {
    title: 'No unfilled shifts this week.',
    description: 'Shifts still waiting for a worker, or where a worker cancelled, will appear here.',
  },
  dashboardWorkers: {
    title: 'No workers have shifts in the last eight weeks.',
    description: 'Workers with completed shifts in the last eight weeks will appear here.',
  },
  dashboardChildren: {
    title: 'This grouping has no houses or groupings.',
    description: 'This grouping has no houses or groupings.',
  },
  archivedConversations: {
    title: 'No archived conversations',
    description: 'Archived conversations will appear here.',
  },
  conversationSelection: {
    title: 'No conversation selected',
    description: 'Select a conversation to display it here.',
  },
} as const;
