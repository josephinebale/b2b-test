import {
  LANDING_CONTENT_ENABLED,
  LandingPlaceholder,
} from '../components/LandingPlaceholder';
import { PageHeading } from '../components/PageHeading';
import type { Grouping } from '../data/locations';
import { WorkersPanel } from './dashboard/WorkersPanel';

export function GroupingWorkers({ grouping }: { grouping: Grouping }) {
  return (
    <div className="width-main-column">
      {LANDING_CONTENT_ENABLED ? (
        <>
      <PageHeading
        title="Workers"
        description={`Workers used regularly in ${grouping.name}`}
      />
      <WorkersPanel grouping={grouping} />
        </>
      ) : (
        <LandingPlaceholder />
      )}
    </div>
  );
}
