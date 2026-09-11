import { useState } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { LocationMarker } from '../components/LocationMarker';
import { Logo } from '../components/Logo';
import { PageHeading } from '../components/PageHeading';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import {
  GROUPINGS,
  LOCATIONS,
  descendantLocationIds,
  rootGroupingsForOrganisation,
  serviceTypeLabel,
  type Grouping,
  type Location,
} from '../data/locations';
import {
  NODE_NAV_ITEMS,
  PERSONAS,
  ROUTES,
  VISIBLE_ORGANISATIONS,
  treeSectionLabel,
  type NavigationNodeType,
  type Organisation,
  type Persona,
  type PersonaId,
} from '../lib/informationArchitecture';
import { href } from '../lib/router';

function directLocations(grouping: Grouping): Location[] {
  return grouping.locationIds
    .map((locationId) =>
      LOCATIONS.find((location) => location.id === locationId),
    )
    .filter((location): location is Location => location !== undefined);
}

function childGroupings(grouping: Grouping): Grouping[] {
  return (grouping.groupingIds ?? [])
    .map((groupingId) =>
      GROUPINGS.find((candidate) => candidate.id === groupingId),
    )
    .filter((child): child is Grouping => child !== undefined);
}

function containsGrouping(grouping: Grouping, groupingId: string): boolean {
  return (
    grouping.id === groupingId ||
    childGroupings(grouping).some((child) =>
      containsGrouping(child, groupingId),
    )
  );
}

function isEntryBranch(
  grouping: Grouping,
  selectedPersona: Persona | null,
): boolean {
  return selectedPersona
    ? containsGrouping(grouping, selectedPersona.entry.groupingId)
    : false;
}

function NodePages({
  nodeType,
  grouping,
  location,
}: {
  nodeType: NavigationNodeType;
  grouping: Grouping;
  location?: Location;
}) {
  const pages = NODE_NAV_ITEMS.filter(
    (item) =>
      item.placement === 'main' &&
      item.nodeTypes.some((itemNodeType) => itemNodeType === nodeType),
  );

  return (
    <div className="flex flex-wrap gap-2">
      {pages.map((page) => {
        const label =
          page.path === '/supportables'
            ? treeSectionLabel(grouping, nodeType)
            : page.path === ROUTES.manageLocation &&
                location?.serviceType === 'home-community'
              ? `${location.name} settings`
              : page.label;
        return <Tag key={page.path}>{label}</Tag>;
      })}
    </div>
  );
}

function StartingPoint() {
  return <Tag>Starting point</Tag>;
}

function LocationNode({
  location,
  grouping,
  selectedPersona,
}: {
  location: Location;
  grouping: Grouping;
  selectedPersona: Persona | null;
}) {
  const entry =
    selectedPersona?.entry.nodeType === 'location' &&
    selectedPersona.entry.locationId === location.id &&
    selectedPersona.entry.groupingId === grouping.id;

  return (
    <div className="ui-inset-row rounded border border-border-subtle bg-surface">
      <div className="flex items-center gap-3">
        <LocationMarker location={location} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-text">{location.name}</h4>
            {entry && <StartingPoint />}
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            {serviceTypeLabel(location.serviceType, location.sector)}
          </p>
        </div>
      </div>
      <div className="mt-3 pl-12">
        <NodePages nodeType="location" grouping={grouping} location={location} />
      </div>
    </div>
  );
}

function GroupingNode({
  grouping,
  selectedPersona,
}: {
  grouping: Grouping;
  selectedPersona: Persona | null;
}) {
  const children = childGroupings(grouping);
  const locations = directLocations(grouping);
  const entry =
    selectedPersona?.entry.nodeType === 'grouping' &&
    selectedPersona.entry.groupingId === grouping.id;

  return (
    <details
      open={isEntryBranch(grouping, selectedPersona)}
      className="rounded border border-border-subtle bg-surface open:[&>summary>:last-child]:rotate-180"
    >
      <summary className="ui-inset-row flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-location-surface text-location-foreground">
          <Building2 className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-text">
              {grouping.name}
            </span>
            {entry && <StartingPoint />}
          </span>
          <span className="mt-1 block text-xs text-text-secondary">
            Grouping · {descendantLocationIds(grouping).length} locations
          </span>
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-text-tertiary transition-transform" />
      </summary>

      <div className="ui-inset-card space-y-3 border-t border-border-subtle">
        <NodePages nodeType="grouping" grouping={grouping} />

        {children.length > 0 && (
          <div className="space-y-3 border-l border-border-subtle pl-4">
            {children.map((child) => (
              <GroupingNode
                key={child.id}
                grouping={child}
                selectedPersona={selectedPersona}
              />
            ))}
          </div>
        )}

        {locations.length > 0 && (
          <div className="space-y-3 border-l border-border-subtle pl-4">
            {locations.map((location) => (
              <LocationNode
                key={`${grouping.id}-${location.id}`}
                location={location}
                grouping={grouping}
                selectedPersona={selectedPersona}
              />
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

function ungroupedLocations(organisation: Organisation): Location[] {
  const groupedIds = new Set(
    GROUPINGS.filter(
      (grouping) => grouping.organisation === organisation,
    ).flatMap((grouping) => grouping.locationIds),
  );
  return LOCATIONS.filter(
    (location) =>
      location.organisation === organisation && !groupedIds.has(location.id),
  );
}

export function InformationArchitecture() {
  const [personaFilter, setPersonaFilter] = useState<PersonaId | ''>('');
  const selectedPersona =
    PERSONAS.find((persona) => persona.id === personaFilter) ?? null;
  const visibleOrganisations = VISIBLE_ORGANISATIONS.filter(
    (organisation) =>
      !selectedPersona || organisation === selectedPersona.organisation,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="app-header">
        <div className="app-header-row mx-auto flex max-w-page items-center px-8">
          <a
            href={href('/')}
            aria-label="Start a session"
            className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Logo />
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-page flex-1 px-8 py-8">
        <div>
          <PageHeading
            title="Information architecture"
            actions={<Button href={href('/')}>Back</Button>}
          />

          <div className="max-w-content">
            <h2 className="text-sm font-bold text-text">Assumptions</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
              <li>
                Organisation is a hard boundary
              </li>
              <li>
                Role does not hide anything: everyone at a provider can access and edit anything in their provider’s tree. This is an MVP assumption based on current understanding, not an established finding, and it may change as more organisations come into view.
              </li>
              <li>
                A provider configures which node each role lands on, so a person starts in the right place on first use.
              </li>
              <li>
                Organisation → Arm → Grouping → Location. An arm is a grouping whose children are always groupings. No persona enters at an arm.
              </li>
              <li>
                A node lists its children, not its descendants. Counts roll up; rows do not.
              </li>
            </ul>
          </div>

          <Card as="section" className="mt-8 p-4">
            <h2 className="text-sm font-bold text-text">Filter tree</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium text-text">
                Persona
                <span className="relative mt-1 block">
                  <select
                    value={personaFilter}
                    onChange={(event) =>
                      setPersonaFilter(event.target.value as PersonaId | '')
                    }
                    className="h-10 w-full appearance-none rounded border border-border bg-surface px-3 pr-10 text-sm font-normal text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <option value="">All organisations and personas</option>
                    {VISIBLE_ORGANISATIONS.map((organisation) => (
                      <optgroup key={organisation} label={organisation}>
                        {PERSONAS.filter(
                          (persona) => persona.organisation === organisation,
                        ).map((persona) => (
                          <option key={persona.id} value={persona.id}>
                            {persona.name} — {persona.role}
                            {persona.team ? ` · ${persona.team}` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                </span>
              </label>
            </div>
          </Card>

          <div className="mt-8 space-y-4">
            {visibleOrganisations.map((organisation) => {
              const roots = rootGroupingsForOrganisation(organisation);
              const withoutGrouping = ungroupedLocations(organisation);

              return (
                <Card
                  key={`${personaFilter}-${organisation}`}
                  as="section"
                >
                  <details open className="open:[&>summary>:last-child]:rotate-180">
                    <summary className="ui-inset-card flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1 text-md font-bold text-text">
                        {organisation}
                      </span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-text-tertiary transition-transform" />
                    </summary>
                    <div className="ui-inset-card space-y-3 border-t border-border-subtle">
                      <NodePages
                        nodeType="organisation"
                        grouping={{
                          id: organisation,
                          name: organisation,
                          organisation,
                          locationIds: [],
                          groupingIds: roots.map((root) => root.id),
                        }}
                      />
                      {roots.map((grouping) => (
                        <GroupingNode
                          key={grouping.id}
                          grouping={grouping}
                          selectedPersona={selectedPersona}
                        />
                      ))}
                      {withoutGrouping.map((location) => (
                        <LocationNode
                          key={location.id}
                          location={location}
                          grouping={{
                            id: '',
                            name: '',
                            organisation,
                            sector: location.sector,
                            locationIds: [location.id],
                          }}
                          selectedPersona={selectedPersona}
                        />
                      ))}
                    </div>
                  </details>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
