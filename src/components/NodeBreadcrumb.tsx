import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  breadcrumbTrail,
  childGroupings,
  findLocation,
  groupingContentsSummary,
  pendingCountsForGrouping,
  pendingCountsForLocation,
  rootGroupingsForOrganisation,
  serviceTypeLabel,
  type Grouping,
  type Location,
} from '../data/locations';
import {
  visibleBreadcrumbItems,
  type BreadcrumbCrumb,
  type VisibleBreadcrumbItem,
} from '../lib/breadcrumb';
import { useKeyboardMenu } from '../lib/useKeyboardMenu';
import { pendingWorkParts } from '../lib/pageContent';
import { LANDING_CONTENT_ENABLED } from './LandingPlaceholder';
import { PinnedQuestion } from './PinnedQuestion';
import { Card } from './ui/Card';

const measureCanvas =
  typeof document === 'undefined' ? null : document.createElement('canvas');
const BREADCRUMB_MENU_LIMIT = 20;
export const BREADCRUMB_MENU_MODE: 'siblings' | 'children' = 'siblings';

type MenuItem = {
  id: string;
  name: string;
  nodeType: 'grouping' | 'location';
  grouping?: Grouping;
  location?: Location;
};

function fontFor(el: HTMLElement, weight: string): string {
  const styles = getComputedStyle(el);
  return `${weight} ${styles.fontSize} ${styles.fontFamily}`;
}

function measureItem(
  item: VisibleBreadcrumbItem,
  mediumFont: string,
  boldFont: string,
): number {
  const context = measureCanvas?.getContext('2d');
  if (!context) return 0;
  if (item.type === 'ellipsis') {
    context.font = mediumFont;
    return context.measureText('…').width;
  }
  context.font = item.crumb.role === 'current' ? boldFont : mediumFont;
  return context.measureText(item.crumb.label).width;
}

function OrganisationCrumb({
  label,
  onSelectOrganisation,
}: {
  label: string;
  onSelectOrganisation: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelectOrganisation}
      className="ui-link shrink-0 rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {label}
    </button>
  );
}

function siblingItems(
  crumb: BreadcrumbCrumb,
  path: Grouping[],
  location: Location | null,
  organisation: Grouping['organisation'],
): MenuItem[] {
  if (crumb.role === 'organisation' || crumb.id === 'organisation') return [];

  if (location?.id === crumb.id) {
    const parent = path.at(-1);
    if (!parent) return [];
    return parent.locationIds
      .map(findLocation)
      .filter((item): item is Location => item !== null)
      .map((item) => ({
        id: item.id,
        name: item.name,
        nodeType: 'location' as const,
        location: item,
      }));
  }

  const pathIndex = path.findIndex((segment) => segment.id === crumb.id);
  if (pathIndex < 0) return [];
  const parent = pathIndex > 0 ? path[pathIndex - 1] : null;
  const siblings = parent
    ? childGroupings(parent)
    : rootGroupingsForOrganisation(organisation);
  return siblings.map((item) => ({
    id: item.id,
    name: item.name,
    nodeType: 'grouping' as const,
    grouping: item,
  }));
}

function childItems(
  crumb: BreadcrumbCrumb,
  path: Grouping[],
  location: Location | null,
  organisation: Grouping['organisation'],
): MenuItem[] {
  if (crumb.id === 'organisation') {
    return rootGroupingsForOrganisation(organisation).map((item) => ({
      id: item.id,
      name: item.name,
      nodeType: 'grouping' as const,
      grouping: item,
    }));
  }
  if (location?.id === crumb.id) return [];

  const grouping = path.find((segment) => segment.id === crumb.id);
  if (!grouping) return [];

  return [
    ...childGroupings(grouping).map((item) => ({
      id: item.id,
      name: item.name,
      nodeType: 'grouping' as const,
      grouping: item,
    })),
    ...grouping.locationIds
      .map(findLocation)
      .filter((item): item is Location => item !== null)
      .map((item) => ({
        id: item.id,
        name: item.name,
        nodeType: 'location' as const,
        location: item,
      })),
  ];
}

function menuItemsFor(
  crumb: BreadcrumbCrumb,
  path: Grouping[],
  location: Location | null,
  organisation: Grouping['organisation'],
): MenuItem[] {
  return BREADCRUMB_MENU_MODE === 'children'
    ? childItems(crumb, path, location, organisation)
    : siblingItems(crumb, path, location, organisation);
}

function crumbOpensMenu(items: MenuItem[]): boolean {
  return BREADCRUMB_MENU_MODE === 'children'
    ? items.length > 0
    : items.length > 1;
}

function BreadcrumbMenu({
  crumb,
  items,
  currentIds,
  onSelectGrouping,
  onSelectLocation,
  onSelectOrganisation,
}: {
  crumb: BreadcrumbCrumb;
  items: MenuItem[];
  currentIds: Set<string>;
  onSelectGrouping: (groupingId: string) => void;
  onSelectLocation: (locationId: string) => void;
  onSelectOrganisation: () => void;
}) {
  const menu = useKeyboardMenu();
  const ordered =
    BREADCRUMB_MENU_MODE === 'siblings'
      ? [...items].sort((a, b) => a.name.localeCompare(b.name))
      : items;
  const shown = ordered.slice(0, BREADCRUMB_MENU_LIMIT);
  const moreCount = ordered.length - shown.length;
  const isCurrent = crumb.role === 'current';
  const isOrganisation = crumb.id === 'organisation';

  const select = (item: MenuItem) => {
    menu.close(false);
    if (item.nodeType === 'location') onSelectLocation(item.id);
    else onSelectGrouping(item.id);
  };

  const chevron = (
    <ChevronDown
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 transition-transform ${
        menu.open ? 'rotate-180' : ''
      }`}
    />
  );

  return (
    <div className="relative shrink-0">
      {isOrganisation ? (
        <span className="inline-flex items-center gap-1">
          {isCurrent ? (
            <span aria-current="page" className="text-sm font-bold text-text">
              {crumb.label}
            </span>
          ) : (
            <button
              type="button"
              onClick={onSelectOrganisation}
              className="ui-link rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {crumb.label}
            </button>
          )}
          <button
            ref={menu.triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={menu.open}
            aria-label={`${crumb.label} ${BREADCRUMB_MENU_MODE}`}
            onClick={menu.toggle}
            onKeyDown={menu.onTriggerKeyDown}
            className="inline-flex items-center rounded ui-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {chevron}
          </button>
        </span>
      ) : (
      <button
        ref={menu.triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-current={isCurrent ? 'page' : undefined}
        onClick={menu.toggle}
        onKeyDown={menu.onTriggerKeyDown}
        className={`inline-flex items-center gap-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          isCurrent ? 'font-bold text-text' : 'ui-link font-medium'
        }`}
      >
        <span>{crumb.label}</span>
        {chevron}
      </button>
      )}

      {menu.open && (
        <Card className="absolute top-full left-0 z-30 mt-1 w-72 shadow-lg">
          <div
            ref={menu.menuRef}
            role="menu"
            aria-label={`${crumb.label} ${BREADCRUMB_MENU_MODE}`}
            onKeyDown={menu.onMenuKeyDown}
            className="py-1"
          >
            {shown.map((item) => {
              const pendingWork = item.grouping
                ? pendingWorkParts(pendingCountsForGrouping(item.grouping))
                : item.location
                  ? pendingWorkParts(pendingCountsForLocation(item.location.id))
                  : [];

              return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-current={currentIds.has(item.id) ? 'page' : undefined}
                onClick={() => select(item)}
                className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm text-text-strong hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="min-w-0">
                  <span className="block">{item.name}</span>
                  {item.grouping && (
                    <span className="mt-1 block text-xs text-text-secondary">
                      {groupingContentsSummary(item.grouping)}
                    </span>
                  )}
                  {item.location && (
                    <span className="mt-1 block text-xs text-text-secondary">
                      {serviceTypeLabel(
                        item.location.serviceType,
                        item.location.sector,
                      )}{' '}
                      · {item.location.suburb}
                    </span>
                  )}
                  {pendingWork.length > 0 && (
                    LANDING_CONTENT_ENABLED ? (
                    <span className="mt-1 block text-xs text-text-secondary">
                      {pendingWork.join(' · ')}
                    </span>
                    ) : null
                  )}
                </span>
                {currentIds.has(item.id) && (
                  <Check
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-brand"
                  />
                )}
              </button>
              );
            })}
            {moreCount > 0 && (
              <p className="px-3 py-2 text-xs text-text-secondary">
                {moreCount} more
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function EllipsisMenu({
  hiddenCrumbs,
  onSelectGrouping,
  onSelectOrganisation,
}: {
  hiddenCrumbs: BreadcrumbCrumb[];
  onSelectGrouping: (groupingId: string) => void;
  onSelectOrganisation: () => void;
}) {
  const menu = useKeyboardMenu();
  const shown = hiddenCrumbs.slice(0, BREADCRUMB_MENU_LIMIT);
  const moreCount = hiddenCrumbs.length - shown.length;

  return (
    <div className="relative shrink-0">
      <button
        ref={menu.triggerRef}
        type="button"
        aria-label="Show hidden breadcrumb ancestors"
        aria-haspopup="menu"
        aria-expanded={menu.open}
        onClick={menu.toggle}
        onKeyDown={menu.onTriggerKeyDown}
        className="ui-link rounded text-sm font-medium text-text-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        …
      </button>
      {menu.open && (
        <Card className="absolute top-full left-0 z-30 mt-1 w-72 shadow-lg">
          <div
            ref={menu.menuRef}
            role="menu"
            aria-label="Hidden breadcrumb ancestors"
            onKeyDown={menu.onMenuKeyDown}
            className="py-1"
          >
            {shown.map((crumb) =>
              crumb.id === 'organisation' ? (
                <button
                  key={crumb.id}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    menu.close(false);
                    onSelectOrganisation();
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-text-strong hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {crumb.label}
                </button>
              ) : (
                <button
                  key={crumb.id}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    menu.close(false);
                    onSelectGrouping(crumb.id);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-text-strong hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {crumb.label}
                </button>
              ),
            )}
            {moreCount > 0 && (
              <p className="px-3 py-2 text-xs text-text-secondary">
                {moreCount} more
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function trailCrumbs(
  grouping: Grouping,
  location: Location | null,
  nodeType: 'grouping' | 'location' | 'organisation',
  entryGroupingId: string,
): { crumbs: BreadcrumbCrumb[]; path: Grouping[] } {
  const path = breadcrumbTrail({
    grouping,
    location: nodeType === 'location' ? location : null,
    entryGroupingId,
  });
  if (nodeType === 'organisation') {
    return {
      crumbs: [
        {
          id: 'organisation',
          label: grouping.organisation,
          role: 'current',
        },
      ],
      path,
    };
  }
  const crumbs: BreadcrumbCrumb[] = [
    {
      id: 'organisation',
      label: grouping.organisation,
      role: 'organisation',
    },
    ...path.map((segment, index) => ({
      id: segment.id,
      label: segment.name,
      role:
        nodeType === 'grouping' && index === path.length - 1
          ? ('current' as const)
          : ('ancestor' as const),
    })),
  ];
  if (nodeType === 'location' && location) {
    crumbs.push({
      id: location.id,
      label: location.name,
      role: 'current',
    });
  }
  return { crumbs, path };
}

export function NodeBreadcrumb({
  location,
  grouping,
  nodeType,
  entryGroupingId,
  onSelectGrouping,
  onSelectOrganisation,
  onSelectLocation,
}: {
  location: Location | null;
  grouping: Grouping;
  nodeType: 'grouping' | 'location' | 'organisation';
  entryGroupingId: string;
  onSelectGrouping: (groupingId: string) => void;
  onSelectOrganisation: () => void;
  onSelectLocation: (locationId: string) => void;
}) {
  /* Measured on the box that holds the space beside the logo and the header
     utilities, never on the trail itself: a box sized by the crumbs reports the
     width they already occupy, so it can never report room to spare. */
  const spaceRef = useRef<HTMLDivElement | null>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const { crumbs, path } = trailCrumbs(
    grouping,
    location,
    nodeType,
    entryGroupingId,
  );
  const itemsByCrumb = new Map(
    crumbs.map((crumb) => [
      crumb.id,
      menuItemsFor(crumb, path, location, grouping.organisation),
    ]),
  );
  const currentIds = new Set(crumbs.map((crumb) => crumb.id));
  const box = spaceRef.current;
  const mediumFont = box ? fontFor(box, '500') : '';
  const boldFont = box ? fontFor(box, '700') : '';
  const measured = availableWidth !== null && availableWidth > 0;
  const items =
    !measured || !mediumFont
      ? crumbs.map((crumb) => ({ type: 'crumb' as const, crumb }))
      : visibleBreadcrumbItems(crumbs, availableWidth, (item) =>
          measureItem(item, mediumFont, boldFont) +
          (item.type === 'crumb' &&
          crumbOpensMenu(itemsByCrumb.get(item.crumb.id) ?? [])
            ? 20
            : 0),
        );
  const visibleIds = new Set(
    items.flatMap((item) => (item.type === 'crumb' ? [item.crumb.id] : [])),
  );
  const hiddenCrumbs = crumbs.filter((crumb) => !visibleIds.has(crumb.id));

  useEffect(() => {
    const el = spaceRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      setAvailableWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setAvailableWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={spaceRef}
      className="flex min-w-0 flex-1 items-center gap-1 text-sm"
    >
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-2">
          {items.map((item, index) => (
            <li
              key={item.type === 'ellipsis' ? 'ellipsis' : item.crumb.id}
              className="flex shrink-0 items-center gap-2"
            >
              {index > 0 && (
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-text-tertiary"
                />
              )}
              {item.type === 'ellipsis' ? (
                <EllipsisMenu
                  hiddenCrumbs={hiddenCrumbs}
                  onSelectGrouping={onSelectGrouping}
                  onSelectOrganisation={onSelectOrganisation}
                />
              ) : crumbOpensMenu(itemsByCrumb.get(item.crumb.id) ?? []) ? (
                <BreadcrumbMenu
                  crumb={item.crumb}
                  items={itemsByCrumb.get(item.crumb.id) ?? []}
                  currentIds={currentIds}
                  onSelectGrouping={onSelectGrouping}
                  onSelectLocation={onSelectLocation}
                  onSelectOrganisation={onSelectOrganisation}
                />
              ) : item.crumb.role === 'current' ? (
                <span
                  aria-current="page"
                  className="text-sm font-bold text-text"
                >
                  {item.crumb.label}
                </span>
              ) : item.crumb.role === 'organisation' ? (
                <OrganisationCrumb
                  label={item.crumb.label}
                  onSelectOrganisation={onSelectOrganisation}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectGrouping(item.crumb.id)}
                  className="ui-link shrink-0 rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {item.crumb.label}
                </button>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <PinnedQuestion questionId="access-context" />
    </div>
  );
}
