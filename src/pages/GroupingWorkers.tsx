import {
  GROUPING_WORKERS_CONTENT_ENABLED,
  LandingPlaceholder,
} from '../components/LandingPlaceholder';
import { PageHeading } from '../components/PageHeading';
import type { Grouping } from '../data/locations';
import { groupingWorkersHeading } from '../lib/pageContent';
import { GroupingWorkersTable } from './GroupingWorkersTable';

export function GroupingWorkers({ grouping }: { grouping: Grouping }) {
  return (
    <div className="width-main-column">
      {GROUPING_WORKERS_CONTENT_ENABLED ? (
        <>
          <PageHeading title={groupingWorkersHeading(grouping.name)} />
          <GroupingWorkersTable grouping={grouping} />
        </>
      ) : (
        <LandingPlaceholder />
      )}
    </div>
  );
}
