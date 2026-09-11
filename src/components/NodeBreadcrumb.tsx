import { ChevronRight } from 'lucide-react';
import {
  groupingPath,
  type Grouping,
  type Location,
} from '../data/locations';
import { PinnedQuestion } from './PinnedQuestion';

export function NodeBreadcrumb({
  location,
  grouping,
  nodeType,
  onSelectGrouping,
}: {
  location: Location | null;
  grouping: Grouping;
  nodeType: 'grouping' | 'location';
  onSelectGrouping: (groupingId: string) => void;
}) {
  const path = groupingPath(grouping);

  return (
    <div className="flex min-w-0 items-center gap-1">
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-2">
          {path.map((segment, index) => {
            const isCurrentGrouping =
              nodeType === 'grouping' && index === path.length - 1;
            return (
              <li key={segment.id} className="flex min-w-0 items-center gap-2">
                {index > 0 && (
                  <ChevronRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-text-tertiary"
                  />
                )}
                {isCurrentGrouping ? (
                  <span
                    aria-current="page"
                    className="truncate text-sm font-bold text-text"
                  >
                    {segment.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectGrouping(segment.id)}
                    className="ui-link shrink-0 rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {segment.name}
                  </button>
                )}
              </li>
            );
          })}

          {nodeType === 'location' && location && (
            <li className="flex min-w-0 items-center gap-2">
              <ChevronRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-text-tertiary"
              />
              <span
                aria-current="page"
                className="min-w-0 truncate text-sm font-bold text-text"
              >
                {location.name}
              </span>
            </li>
          )}
        </ol>
      </nav>
      <PinnedQuestion questionId="access-context" />
    </div>
  );
}
