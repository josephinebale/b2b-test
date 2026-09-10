export const ORGANISATION_NAME = 'Cerebral Palsy Alliance';
export const CAN_EDIT_ORGANISATION_DETAILS = false;

export const ORGANISATIONS = [
  'Cerebral Palsy Alliance',
  'Northcott',
  'Life Without Barriers',
] as const;

export type Organisation = (typeof ORGANISATIONS)[number];
export type Sector = 'disability' | 'aged care';

export type PersonaId =
  | 'house-manager'
  | 'regional-manager'
  | 'roster-coordinator'
  | 'team-leader'
  | 'regional-lifestyles-manager'
  | 'service-manager'
  | 'area-manager'
  | 'northcott-service-coordinator'
  | 'northcott-individual-service-coordinator'
  | 'lwb-reactive-rostering-officer'
  | 'lwb-forward-rostering-officer'
  | 'lwb-rostering-lead';

export type Persona = {
  id: PersonaId;
  name: string;
  role: string;
  team?: string;
  organisation: Organisation;
  sector: Sector;
  entry:
    | {
        nodeType: 'location';
        locationId: string;
        groupingId: string;
      }
    | {
        nodeType: 'grouping';
        groupingId: string;
      };
};

export const PERSONAS: Persona[] = [
  {
    id: 'house-manager',
    name: 'Helen Dawson',
    role: 'House Manager',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    entry: {
      nodeType: 'location',
      locationId: 'dee-why-1',
      groupingId: 'northern-sydney',
    },
  },
  {
    id: 'regional-manager',
    name: 'Marcus Lee',
    role: 'Regional Manager',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    entry: {
      nodeType: 'grouping',
      groupingId: 'northern-sydney',
    },
  },
  {
    id: 'roster-coordinator',
    name: 'Sofia Patel',
    role: 'Roster Coordinator',
    team: 'Careforce',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    entry: {
      nodeType: 'grouping',
      groupingId: 'careforce-caseload',
    },
  },
  {
    id: 'team-leader',
    name: 'Ava Thompson',
    role: 'Team Leader',
    team: 'Lifestyles',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    entry: {
      nodeType: 'location',
      locationId: 'allambie-heights-day-program',
      groupingId: 'northern-lifestyles',
    },
  },
  {
    id: 'regional-lifestyles-manager',
    name: 'Grace Kim',
    role: 'Regional Lifestyles Manager',
    team: 'Lifestyles',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    entry: {
      nodeType: 'grouping',
      groupingId: 'northern-lifestyles',
    },
  },
  {
    id: 'service-manager',
    name: 'Daniel Okafor',
    role: 'Service Manager',
    team: 'Home and community',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    entry: {
      nodeType: 'location',
      locationId: 'forestville-home',
      groupingId: 'northern-lifestyles',
    },
  },
  {
    id: 'area-manager',
    name: 'Rachel Morgan',
    role: 'Area Manager',
    team: 'Careforce',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    entry: {
      nodeType: 'grouping',
      groupingId: 'careforce-area',
    },
  },
  {
    id: 'northcott-service-coordinator',
    name: 'Leila Hassan',
    role: 'Service Coordinator',
    team: 'SIL',
    organisation: 'Northcott',
    sector: 'disability',
    entry: {
      nodeType: 'grouping',
      groupingId: 'northcott-sil-services',
    },
  },
  {
    id: 'northcott-individual-service-coordinator',
    name: 'Ben Carter',
    role: 'Coordinator, Individual Service',
    team: 'Community',
    organisation: 'Northcott',
    sector: 'disability',
    entry: {
      nodeType: 'grouping',
      groupingId: 'northcott-individual-services',
    },
  },
  {
    id: 'lwb-reactive-rostering-officer',
    name: 'Olivia Grant',
    role: 'Rostering Officer',
    team: 'Reactive',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    entry: {
      nodeType: 'grouping',
      groupingId: 'lwb-northern-sydney',
    },
  },
  {
    id: 'lwb-forward-rostering-officer',
    name: 'Ethan Murphy',
    role: 'Rostering Officer',
    team: 'Forward planning',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    entry: {
      nodeType: 'grouping',
      groupingId: 'lwb-northern-sydney',
    },
  },
  {
    id: 'lwb-rostering-lead',
    name: 'Natalie Brooks',
    role: 'Rostering Lead',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    entry: {
      nodeType: 'grouping',
      groupingId: 'lwb-greater-sydney',
    },
  },
];

export const MANAGER_NAME = PERSONAS[0].name;

export function personaById(personaId: string | null): Persona {
  return PERSONAS.find((persona) => persona.id === personaId) ?? PERSONAS[0];
}

export function personasForOrganisation(organisation: Organisation): Persona[] {
  return PERSONAS.filter((persona) => persona.organisation === organisation);
}

export const ROUTES = {
  manageLocation: '/manage-location',
  organisationSettings: '/organisation-settings',
  yourAccount: '/your-account',
} as const;

export type NavigationNodeType = 'grouping' | 'location';
export type NodeNavigationPlacement = 'main' | 'utility' | 'settings';

export const NOTIFICATIONS_NODE_ITEM = {
  label: 'Notifications',
  path: '/notifications',
  nodeTypes: ['location'],
  placement: 'utility',
} as const;

export const LOCATION_SETTINGS_NODE_ITEM = {
  label: 'Location settings',
  path: ROUTES.manageLocation,
  nodeTypes: ['location'],
  placement: 'settings',
} as const;

/** One definition for what can be reached from each node. */
export const NODE_NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/',
    nodeTypes: ['grouping', 'location'],
    placement: 'main',
  },
  {
    label: 'Bookings',
    path: '/bookings',
    nodeTypes: ['location'],
    placement: 'main',
  },
  {
    label: 'Messages',
    path: '/messages',
    nodeTypes: ['location'],
    placement: 'main',
  },
  NOTIFICATIONS_NODE_ITEM,
  {
    label: 'Workers',
    path: '/workers',
    nodeTypes: ['grouping', 'location'],
    placement: 'main',
  },
  LOCATION_SETTINGS_NODE_ITEM,
] as const;

export type SettingsSection = {
  id: string;
  label: string;
};

export const LOCATION_SECTIONS: SettingsSection[] = [
  { id: 'profile', label: 'Location profile' },
  { id: 'preferences', label: 'Support worker preferences' },
  { id: 'support-plan', label: 'Support plan' },
  { id: 'location-name', label: 'Location name' },
  { id: 'people', label: 'People' },
];

export const ORGANISATION_SECTIONS: SettingsSection[] = [
  { id: 'organisation', label: 'Organisation details' },
  { id: 'financial', label: 'Financial details' },
  { id: 'documents', label: 'Documents' },
  { id: 'people', label: 'People' },
];

export const ACCOUNT_SECTIONS: SettingsSection[] = [
  { id: 'account', label: 'Account' },
];

export const PERSONAL_MENU_ITEMS = [
  { label: 'Your account', path: '/your-account' },
] as const;

const LEGACY_SECTION_IDS: Record<string, string> = {
  'house-name': 'location-name',
  'house-picture': 'location-picture',
};

export function sectionFromPath(
  path: string,
  sections: SettingsSection[],
): string {
  const requested = path.split('/').filter(Boolean).at(-1);
  const id = requested ? (LEGACY_SECTION_IDS[requested] ?? requested) : undefined;
  return sections.find((section) => section.id === id)?.id ?? sections[0].id;
}

export function menuIndexAfterKey(
  currentIndex: number,
  key: string,
  itemCount: number,
): number | null {
  if (key === 'Escape') return null;
  if (key === 'Home') return 0;
  if (key === 'End') return itemCount - 1;
  if (key === 'ArrowDown') return (currentIndex + 1) % itemCount;
  if (key === 'ArrowUp') return (currentIndex - 1 + itemCount) % itemCount;
  return currentIndex;
}
