import { Card } from './ui/Card';

/** Flip to true to restore landing page bodies, badges, and waiting-work counts. */
export const LANDING_CONTENT_ENABLED = false;

/** Table built in GroupingWorkersTable.tsx — flip to true to show grouping Workers while LANDING_CONTENT_ENABLED stays off. */
export const GROUPING_WORKERS_CONTENT_ENABLED = false;

export function LandingPlaceholder() {
  /* 24px is intentional air for this placeholder. It is not a prose card.
     The extra inset disappears with the card when LANDING_CONTENT_ENABLED is on. */
  return (
    <Card className="p-6">
      <p className="max-w-content text-sm text-text-strong">
        This screen is in progress.
      </p>
    </Card>
  );
}
