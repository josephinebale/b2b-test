import { Avatar } from '../../components/Avatar';
import { PinnedQuestion } from '../../components/PinnedQuestion';
import { Card } from '../../components/ui/Card';
import { EntityLink } from '../../components/ui/EntityLink';
import {
  groupingWorkers,
  type Grouping,
  type WorkerAssessments,
} from '../../data/locations';
import { EMPTY_STATES } from '../../lib/pageContent';

function supportPlanLabel(confirmed: boolean): string {
  return confirmed ? 'Support plan confirmed' : 'Support plan needs review';
}

function needsAttentionClass(needsAttention: boolean): string {
  return needsAttention ? 'font-medium text-text' : 'text-text-tertiary';
}

function assessmentSummary(assessments: WorkerAssessments) {
  return (
    <>
      <span className={needsAttentionClass(!assessments.medication)}>
        Medication assessment {assessments.medication ? 'current' : 'not current'}
      </span>
      <span aria-hidden="true" className="text-text-tertiary">·</span>
      <span className={needsAttentionClass(!assessments.driving)}>
        Driving assessment {assessments.driving ? 'current' : 'not current'}
      </span>
    </>
  );
}

export function WorkersPanel({ grouping }: { grouping: Grouping }) {
  const workers = groupingWorkers(grouping.id);

  return (
    <section>
      <div className="flex items-center gap-2">
        <h2 className="text-md font-bold text-text">Workers used regularly</h2>
        <PinnedQuestion questionId="workers-grouping-order" />
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        Ranked by completed shifts, then locations worked.
      </p>

      {workers.length === 0 ? (
        <Card className="mt-3 p-4">
          <p className="text-lg font-bold text-text">
            {EMPTY_STATES.dashboardWorkers.title}
          </p>
          <p className="mt-1 max-w-content text-sm text-text-secondary">
            {EMPTY_STATES.dashboardWorkers.description}
          </p>
        </Card>
      ) : (
        <Card as="ul" divided className="mt-3">
          {workers.map((worker) => (
            <li
              key={worker.id}
              className="ui-inset-row flex items-center gap-3"
            >
              <Avatar name={worker.name} size="md" />
              <div className="min-w-0 flex-1">
                <EntityLink as="span">{worker.name}</EntityLink>
                <p className="mt-1 text-sm text-text-secondary">
                  {worker.totalHours} hours at this provider · {worker.shiftCount}{' '}
                  shifts across {worker.locations.length} locations:{' '}
                  {worker.locations
                    .map((location) => location.locationName)
                    .join(', ')}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs">
                  <span
                    className={needsAttentionClass(!worker.planConfirmed)}
                  >
                    {supportPlanLabel(worker.planConfirmed)}
                  </span>
                  <span aria-hidden="true" className="text-text-tertiary">·</span>
                  {assessmentSummary(worker.assessments)}
                </p>
              </div>
            </li>
          ))}
        </Card>
      )}
    </section>
  );
}
