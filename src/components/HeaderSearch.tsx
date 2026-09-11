import { Search } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  groupingContentsSummary,
  searchOrganisation,
  serviceTypeLabel,
} from '../data/locations';
import type { Organisation } from '../lib/informationArchitecture';
import { Card } from './ui/Card';
import { EntityLink } from './ui/EntityLink';

export const HEADER_SEARCH_VISIBLE = false;

type HeaderSearchProps = {
  organisation: Organisation;
  onSelectLocation: (locationId: string) => void;
  onSelectGrouping: (groupingId: string) => void;
  onSelectWorker: (workerId: string, locationId: string) => void;
};

function ResultGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border-subtle last:border-b-0">
      <h2 className="px-4 pt-3 pb-1 text-xs font-bold text-text-secondary">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ResultButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ui-inset-row block w-full text-left hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
    >
      {children}
    </button>
  );
}

export function HeaderSearch({
  organisation,
  onSelectLocation,
  onSelectGrouping,
  onSelectWorker,
}: HeaderSearchProps) {
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const results = searchOrganisation(query, organisation);
  const hasResults = Object.values(results).some((group) => group.length > 0);
  const visible = query.trim() !== '';

  const select = (action: () => void) => {
    setQuery('');
    action();
  };

  useEffect(() => {
    if (!visible) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setQuery('');
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [visible]);

  return (
    <div ref={wrapperRef} className="relative w-72 shrink-0">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-tertiary"
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setQuery('');
        }}
        aria-label="Search this organisation"
        placeholder="Search"
        className="h-9 w-full rounded border border-border bg-surface pr-3 pl-9 text-sm text-text placeholder:text-text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      />

      {visible && (
        <Card
          className="absolute top-full right-0 z-30 mt-1 max-h-[32rem] w-96 overflow-y-auto shadow-lg"
          aria-live="polite"
        >
          {!hasResults ? (
            <p className="ui-inset-card text-sm text-text-secondary">
              No results for “{query.trim()}” in supportables, clients, workers
              or groupings.
            </p>
          ) : (
            <>
              {results.supportables.length > 0 && (
                <ResultGroup title="Supportables">
                  {results.supportables.map((result) => (
                    <ResultButton
                      key={result.id}
                      onClick={() =>
                        select(() => onSelectLocation(result.id))
                      }
                    >
                      <EntityLink as="span">{result.name}</EntityLink>
                      <span className="mt-1 block text-xs text-text-secondary">
                        {serviceTypeLabel(result.serviceType, result.sector)} ·{' '}
                        {result.suburb}
                      </span>
                    </ResultButton>
                  ))}
                </ResultGroup>
              )}

              {results.clients.length > 0 && (
                <ResultGroup title="Clients">
                  {results.clients.map((result) => (
                    <ResultButton
                      key={result.id}
                      onClick={() =>
                        select(() => onSelectLocation(result.id))
                      }
                    >
                      <EntityLink as="span">{result.name}</EntityLink>
                      <span className="mt-1 block text-xs text-text-secondary">
                        {serviceTypeLabel(result.serviceType, result.sector)} ·{' '}
                        {result.suburb}
                      </span>
                    </ResultButton>
                  ))}
                </ResultGroup>
              )}

              {results.workers.length > 0 && (
                <ResultGroup title="Workers">
                  {results.workers.map((result) => (
                    <ResultButton
                      key={result.id}
                      onClick={() =>
                        select(() =>
                          onSelectWorker(result.id, result.locationId),
                        )
                      }
                    >
                      <EntityLink as="span">{result.name}</EntityLink>
                      <span className="mt-1 block text-xs text-text-secondary">
                        {result.totalHours} hours at this provider
                      </span>
                    </ResultButton>
                  ))}
                </ResultGroup>
              )}

              {results.groupings.length > 0 && (
                <ResultGroup title="Groupings">
                  {results.groupings.map((result) => (
                    <ResultButton
                      key={result.id}
                      onClick={() =>
                        select(() => onSelectGrouping(result.id))
                      }
                    >
                      <EntityLink as="span">{result.name}</EntityLink>
                      <span className="mt-1 block text-xs text-text-secondary">
                        {groupingContentsSummary(result)}
                      </span>
                    </ResultButton>
                  ))}
                </ResultGroup>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}
