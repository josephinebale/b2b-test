import type { BookingStatus } from '../data/locations';

const LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  requested: 'Requested',
  ended: 'Shift ended',
  cancelled: 'Worker cancelled',
};

/** Solid carries a decision that is still waiting; tinted only reports state. */
const STYLES: Record<BookingStatus, string> = {
  confirmed: 'bg-success-surface text-success',
  requested: 'bg-pending text-surface',
  ended: 'bg-neutral-surface text-neutral',
  cancelled: 'bg-pending text-surface',
};

export function StatusPill({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`flex w-full items-center justify-center rounded px-1.5 py-1 text-xs font-medium whitespace-nowrap ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
