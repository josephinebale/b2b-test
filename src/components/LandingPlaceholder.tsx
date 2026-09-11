import { Card } from './ui/Card';

/** Flip to true to restore landing page bodies, badges, and waiting-work counts. */
export const LANDING_CONTENT_ENABLED = false;

export function LandingPlaceholder() {
  return (
    <Card className="p-6">
      <p className="max-w-content text-sm text-text-strong">
        This screen is in progress.
      </p>
    </Card>
  );
}
