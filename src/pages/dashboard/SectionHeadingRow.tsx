import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { LineAlignedControl } from '../../components/LineAlignedControl';
import type { DashboardAsideSort } from '../../lib/pageContent';

type SectionHeadingRowProps = {
  title: ReactNode;
  supportingLine?: ReactNode;
  aside?: ReactNode;
};

export function SectionHeadingRow({
  title,
  supportingLine,
  aside,
}: SectionHeadingRowProps) {
  return (
    <div className="mb-3 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-md font-bold text-text">{title}</h2>
        {supportingLine ? (
          <p className="mt-1 max-w-content text-sm text-text-secondary">
            {supportingLine}
          </p>
        ) : null}
      </div>
      {aside ? (
        <LineAlignedControl line="md" className="shrink-0">
          {aside}
        </LineAlignedControl>
      ) : null}
    </div>
  );
}

export function GroupingLocationSortControl({
  sortOption,
  onSortChange,
  ariaLabel = 'Sort locations',
}: {
  sortOption: DashboardAsideSort;
  onSortChange: (value: DashboardAsideSort) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="inline-flex shrink-0 items-center gap-2">
      <span className="shrink-0 text-xs font-medium text-text">Sort by</span>
      <span className="relative block w-full max-w-xs min-w-0">
        <select
          value={sortOption}
          onChange={(event) =>
            onSortChange(event.target.value as DashboardAsideSort)
          }
          aria-label={ariaLabel}
          className="ui-select ui-select--small w-full"
        >
          <option value="soonest-shift">Soonest shift</option>
          <option value="most-waiting">Most outstanding tasks</option>
          <option value="house-name">Name A to Z</option>
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
        />
      </span>
    </div>
  );
}
