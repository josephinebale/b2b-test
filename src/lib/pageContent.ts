export const WORKERS_ROUTE = '/workers';

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
  dashboardWorkers: {
    title: 'No workers yet',
    description: 'Workers will appear after they’re booked for this location.',
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
