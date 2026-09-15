import type { MouseEvent, ReactNode } from 'react';
import { Calendar, MessageSquare } from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { PinnedQuestion } from '../../components/PinnedQuestion';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EntityLink } from '../../components/ui/EntityLink';
import { Tag } from '../../components/ui/Tag';
import {
  descendantLocationIds,
  groupingDashboardWorkers,
  type Grouping,
} from '../../data/locations';
import {
  dashboardWorkerEvidenceLine,
  dashboardWorkerExceptionLines,
  dashboardWorkerPrimaryLocation,
  EMPTY_STATES,
  workerProfilePath,
} from '../../lib/pageContent';
import { href } from '../../lib/router';
import { SectionHeadingRow } from './SectionHeadingRow';

export const GROUPING_OVERVIEW_WORKER_EXCEPTION_TAGS_VISIBLE = false;

const WORKERS_PREVIEW = 6;

function WorkerExceptionTags({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {lines.map((line) => (
        <Tag key={line} tone="pending">
          {line}
        </Tag>
      ))}
    </div>
  );
}

export function WorkersPanel({
  grouping,
  extraQuestion,
  preview = false,
  onSelectLocation,
}: {
  grouping: Grouping;
  extraQuestion?: ReactNode;
  preview?: boolean;
  onSelectLocation?: (locationId: string, path?: string) => void;
}) {
  const workers = groupingDashboardWorkers(grouping.id);
  const visible = preview ? workers.slice(0, WORKERS_PREVIEW) : workers;
  const locationOrder = descendantLocationIds(grouping);

  return (
    <section>
      <SectionHeadingRow
        title={
          <span className="flex min-w-0 items-center gap-2">
            <span>Recently booked workers</span>
            <PinnedQuestion questionId="workers-grouping-order" />
            {extraQuestion}
          </span>
        }
        aside={
          <a href={href('/workers')} className="ui-link text-sm">
            View all
          </a>
        }
      />

      {workers.length === 0 ? (
        <Card>
          <p className="ui-inset-row text-sm font-bold text-text">
            {EMPTY_STATES.dashboardWorkers.title}
          </p>
        </Card>
      ) : (
        <Card divided>
          {visible.map((worker) => {
            const primaryLocationId = dashboardWorkerPrimaryLocation(
              worker,
              locationOrder,
            );
            const exceptions = dashboardWorkerExceptionLines(worker);

            return (
              <div key={worker.id} className="ui-inset-card">
                <div className="flex items-center gap-3">
                  <Avatar name={worker.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <EntityLink href={href(workerProfilePath(worker.id))}>
                      {worker.name}
                    </EntityLink>
                    <p className="mt-1 text-xs text-text-tertiary">
                      {dashboardWorkerEvidenceLine(worker)}
                    </p>
                  </div>
                </div>
                {GROUPING_OVERVIEW_WORKER_EXCEPTION_TAGS_VISIBLE ? (
                  <WorkerExceptionTags lines={exceptions} />
                ) : null}
                {primaryLocationId && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      href={href('/messages')}
                      size="small"
                      variant="secondary"
                      onClick={(event: MouseEvent) => {
                        event.preventDefault();
                        onSelectLocation?.(primaryLocationId, '/messages');
                      }}
                    >
                      <MessageSquare className="h-4 w-4" aria-hidden />
                      Message
                    </Button>
                    <Button
                      href={href('/request-booking')}
                      size="small"
                      variant="secondary"
                      onClick={(event: MouseEvent) => {
                        event.preventDefault();
                        onSelectLocation?.(
                          primaryLocationId,
                          '/request-booking',
                        );
                      }}
                    >
                      <Calendar className="h-4 w-4" aria-hidden />
                      Book
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </section>
  );
}
