import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import { Tag } from '../components/ui/Tag';
import {
  descendantLocationIds,
  groupingWorkers,
  type Grouping,
  type ProviderWorkerSummary,
  type WorkerAssessments,
} from '../data/locations';
import { EMPTY_STATES, namedLocationList } from '../lib/pageContent';

type SortColumn = 'worker' | 'houses' | 'shifts' | 'hours';
type SortDirection = 'asc' | 'desc';

function exceptionLines(assessments: WorkerAssessments): string[] {
  const lines: string[] = [];
  if (!assessments.medication) lines.push('Medication assessment not current');
  if (!assessments.driving) lines.push('Driving assessment not current');
  return lines;
}

function houseNamesByShifts(worker: ProviderWorkerSummary): string[] {
  return [...worker.locations]
    .sort(
      (first, second) =>
        second.bookingCount - first.bookingCount ||
        first.locationName.localeCompare(second.locationName),
    )
    .map((location) => location.locationName);
}

function compareWorkers(
  first: ProviderWorkerSummary,
  second: ProviderWorkerSummary,
  column: SortColumn,
  direction: SortDirection,
): number {
  const factor = direction === 'asc' ? 1 : -1;
  let primary = 0;

  switch (column) {
    case 'worker':
      primary = first.name.localeCompare(second.name);
      break;
    case 'houses':
      primary = first.locations.length - second.locations.length;
      break;
    case 'shifts':
      primary = first.shiftCount - second.shiftCount;
      break;
    case 'hours':
      primary = first.totalHours - second.totalHours;
      break;
  }

  if (primary !== 0) return primary * factor;

  return (
    second.shiftCount - first.shiftCount ||
    second.locations.length - first.locations.length ||
    first.name.localeCompare(second.name)
  );
}

function SortHeaderButton({
  label,
  column,
  activeColumn,
  direction,
  align = 'left',
  onSort,
}: {
  label: string;
  column: SortColumn;
  activeColumn: SortColumn;
  direction: SortDirection;
  align?: 'left' | 'right';
  onSort: (column: SortColumn) => void;
}) {
  const active = column === activeColumn;
  const Icon = direction === 'asc' ? ChevronUp : ChevronDown;

  return (
    <th
      scope="col"
      aria-sort={
        active ? (direction === 'asc' ? 'ascending' : 'descending') : undefined
      }
      className={`ui-inset-row text-left text-xs font-normal text-text-secondary ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`ui-button ui-button--ghost ui-button--small inline-flex items-center gap-1 ${
          align === 'right' ? 'ml-auto' : ''
        }`}
      >
        {label}
        {active && <Icon className="h-4 w-4" aria-hidden="true" />}
      </button>
    </th>
  );
}

export function GroupingWorkersTable({ grouping }: { grouping: Grouping }) {
  const workers = groupingWorkers(grouping.id);
  const locationTotal = descendantLocationIds(grouping).length;
  const [sortColumn, setSortColumn] = useState<SortColumn>('shifts');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedWorkers = useMemo(
    () =>
      [...workers].sort((first, second) =>
        compareWorkers(first, second, sortColumn, sortDirection),
      ),
    [workers, sortColumn, sortDirection],
  );

  function handleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortColumn(column);
    setSortDirection(column === 'worker' ? 'asc' : 'desc');
  }

  return (
    <section>
      <div className="flex items-center gap-2">
        <h2 className="text-md font-bold text-text">Workers used regularly</h2>
        <PinnedQuestion questionId="workers-grouping-order" />
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        Everyone who has worked in this region, and how much they have worked at
        each house.
      </p>

      {workers.length === 0 ? (
        <Card className="mt-3">
          <p className="ui-inset-row text-sm font-bold text-text">
            {EMPTY_STATES.dashboardWorkers.title}
          </p>
        </Card>
      ) : (
        <Card className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <SortHeaderButton
                  label="Worker"
                  column="worker"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortHeaderButton
                  label="Houses"
                  column="houses"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortHeaderButton
                  label="Shifts"
                  column="shifts"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  align="right"
                  onSort={handleSort}
                />
                <SortHeaderButton
                  label="Hours"
                  column="hours"
                  activeColumn={sortColumn}
                  direction={sortDirection}
                  align="right"
                  onSort={handleSort}
                />
                <th
                  scope="col"
                  className="ui-inset-row text-left text-xs font-normal text-text-secondary"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedWorkers.map((worker, index) => {
                const exceptions = exceptionLines(worker.assessments);
                const houseNames = houseNamesByShifts(worker);

                return (
                  <tr
                    key={worker.id}
                    className={
                      index < sortedWorkers.length - 1
                        ? 'border-b border-border-subtle'
                        : undefined
                    }
                  >
                    <td className="ui-inset-row text-left">
                      <div className="flex items-center gap-3">
                        <Avatar name={worker.name} size="md" />
                        <EntityLink as="span">{worker.name}</EntityLink>
                      </div>
                    </td>
                    <td className="ui-inset-row text-left">
                      <p>
                        {worker.locations.length} of {locationTotal}
                      </p>
                      {houseNames.length > 0 && (
                        <p className="mt-1 text-text-secondary">
                          {namedLocationList(houseNames, 3)}
                        </p>
                      )}
                    </td>
                    <td className="ui-inset-row text-right tabular-nums">
                      {worker.shiftCount}
                    </td>
                    <td className="ui-inset-row text-right tabular-nums">
                      {worker.totalHours}
                    </td>
                    <td className="ui-inset-row text-left">
                      {exceptions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {exceptions.map((line) => (
                            <Tag key={line} tone="pending">
                              {line}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}
