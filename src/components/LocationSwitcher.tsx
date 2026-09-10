import { Fragment } from 'react';
import {
  Building2,
  Check,
  ChevronDown,
  House,
} from 'lucide-react';
import {
  childGroupings,
  descendantLocationIds,
  findLocation,
  orderedGroupingsForMenu,
  serviceTypeLabel,
  type Grouping,
  type Location,
} from '../data/locations';
import {
  LOCATION_SETTINGS_NODE_ITEM,
  ROUTES,
  type Persona,
} from '../lib/informationArchitecture';
import { href } from '../lib/router';
import { useKeyboardMenu } from '../lib/useKeyboardMenu';
import { LocationMarker } from './LocationMarker';
import { PinnedQuestion } from './PinnedQuestion';
import { Card } from './ui/Card';

type LocationSwitcherProps = {
  location: Location | null;
  grouping: Grouping;
  persona: Persona;
  nodeType: 'grouping' | 'location';
  onSelect: (locationId: string, groupingId: string) => void;
  onSelectGrouping: (groupingId: string) => void;
};

/** Every item in the menu shares this row, so items differ only by their leading mark. */
const MENU_ROW =
  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium text-text-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

const MANAGEMENT_ITEMS = [
  { ...LOCATION_SETTINGS_NODE_ITEM, Icon: House },
  {
    label: 'Organisation settings',
    path: ROUTES.organisationSettings,
    Icon: Building2,
  },
];

export function LocationSwitcher({
  location,
  grouping: activeGrouping,
  persona,
  nodeType,
  onSelect,
  onSelectGrouping,
}: LocationSwitcherProps) {
  const menu = useKeyboardMenu();
  const currentName =
    nodeType === 'grouping' ? activeGrouping.name : location?.name ?? '';
  const clientSelected =
    nodeType === 'location' && location?.serviceType === 'home-community';
  const menuGroupings = orderedGroupingsForMenu(persona.entry.groupingId);
  const renderGrouping = (
    grouping: Grouping,
    depth = 0,
    groupingIndex = 0,
  ) => {
    const groupingSelected =
      nodeType === 'grouping' && grouping.id === activeGrouping.id;
    const children = childGroupings(grouping);
    return (
      <div
        key={grouping.id}
        className={
          depth === 0 && groupingIndex > 0
            ? 'border-t border-border-subtle py-1'
            : undefined
        }
      >
        <button
          role="menuitem"
          tabIndex={-1}
          type="button"
          onClick={() => {
            onSelectGrouping(grouping.id);
            menu.close();
          }}
          className={`${MENU_ROW} ${depth > 0 ? 'pl-8' : ''} ${
            groupingSelected ? 'bg-surface-selected' : 'hover:bg-surface-subtle'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-location-surface text-location-foreground">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1">
              <span className="truncate">{grouping.name}</span>
              {groupingSelected && (
                <Check className="h-5 w-5 shrink-0 text-brand" />
              )}
            </span>
            <span className="mt-1 block truncate text-xs font-normal text-text-secondary">
              {descendantLocationIds(grouping).length} locations
            </span>
          </span>
        </button>

        {grouping.locationIds.map((locationId) => {
          const option = findLocation(locationId);
          if (!option) return null;
          const selected =
            nodeType === 'location' &&
            option.id === location?.id &&
            grouping.id === activeGrouping.id;
          return (
            <button
              key={`${grouping.id}-${option.id}`}
              role="menuitem"
              tabIndex={-1}
              type="button"
              onClick={() => {
                onSelect(option.id, grouping.id);
                menu.close();
              }}
              className={`${MENU_ROW} ${depth > 0 ? 'pl-12' : 'pl-8'} ${
                selected ? 'bg-surface-selected' : 'hover:bg-surface-subtle'
              }`}
            >
              <LocationMarker location={option} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1">
                  <span className="truncate">{option.name}</span>
                  {selected && (
                    <Check className="h-5 w-5 shrink-0 text-brand" />
                  )}
                </span>
                <span className="mt-1 block truncate text-xs font-normal text-text-secondary">
                  {serviceTypeLabel(option.serviceType, option.sector)} · {option.suburb}, {option.state}
                </span>
              </span>
            </button>
          );
        })}

        {children.map((child) => renderGrouping(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="relative flex shrink-0 items-center gap-1">
      <button
        ref={menu.triggerRef}
        type="button"
        onClick={menu.toggle}
        onKeyDown={menu.onTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-label={`Switch location, client or grouping. Current: ${currentName}`}
        className="header-menu-trigger location-switcher-trigger"
      >
        {nodeType === 'location' && location ? (
          <LocationMarker location={location} size="sm" />
        ) : (
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-location-surface text-location-foreground">
            <Building2 className="h-5 w-5" />
          </span>
        )}
        <span className="min-w-0 truncate text-sm font-medium text-text">
          {currentName}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-text-tertiary transition-transform ${
            menu.open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <PinnedQuestion questionId="access-context" />

      {menu.open && (
        <Card className="absolute top-full left-0 z-20 mt-1 w-72 shadow-lg">
          <div
            ref={menu.menuRef}
            role="menu"
            aria-label="Location, client and organisation"
            onKeyDown={menu.onMenuKeyDown}
            className="max-h-[70vh] overflow-y-auto"
          >
            <div className="py-1">
              {menuGroupings.map((grouping, groupingIndex) => (
                <Fragment key={grouping.id}>
                  {(groupingIndex === 0 ||
                    menuGroupings[groupingIndex - 1].organisation !==
                      grouping.organisation) && (
                    <p className="px-3 pb-1 pt-2 text-xs font-bold text-text-secondary">
                      {grouping.organisation}
                    </p>
                  )}
                  {renderGrouping(grouping, 0, groupingIndex)}
                </Fragment>
              ))}
            </div>

            <div className="border-t border-border-subtle py-1">
              {MANAGEMENT_ITEMS.filter(
                ({ path }) => nodeType === 'location' || path !== ROUTES.manageLocation,
              ).map(({ label, path, Icon }) => {
                const visibleLabel =
                  path === ROUTES.manageLocation && clientSelected && location
                    ? `${location.name} settings`
                    : label;
                return (
                  <a
                    key={path}
                    role="menuitem"
                    tabIndex={-1}
                    href={href(path)}
                    onClick={() => menu.close()}
                    className={`${MENU_ROW} hover:bg-surface-subtle`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </span>
                    {visibleLabel}
                  </a>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
