import { addDays, startOfDay, startOfWeek } from '../lib/date.ts';
import type { Organisation, Sector } from '../lib/informationArchitecture.ts';
import {
  childCountLine,
  groupingDirectLocationListLabel,
  groupingPlaceBasedLabel,
} from '../lib/pageContent.ts';

export type BookingStatus = 'confirmed' | 'requested' | 'ended' | 'cancelled';
export type FatigueSignal = 'no-break' | 'short-rest' | null;
export type ServiceType = 'sil' | 'centre' | 'home-community';

export type Participant = {
  id: string;
  name: string;
};

export type Location = {
  id: string;
  name: string;
  suburb: string;
  state: string;
  organisation: Organisation;
  sector: Sector;
  serviceType: ServiceType;
  participants: Participant[];
  providerSite?: boolean;
};

export type Grouping = {
  id: string;
  name: string;
  kind?: 'arm' | 'area' | 'caseload' | 'lifestyles' | 'region' | 'service';
  organisation: Organisation;
  sector?: Sector;
  locationIds: string[];
  groupingIds?: string[];
};

export type Worker = {
  id: string;
  name: string;
  bookingCount: number;
  planConfirmed: boolean;
  supportPlanReviewDueAt: Date | null;
  assessments: WorkerAssessments;
};

export type WorkerAssessments = {
  medication: boolean;
  medicationExpiresAt: Date;
  driving: boolean;
  drivingExpiresAt: Date;
};

export type Booking = {
  id: string;
  locationId: string;
  workerId: string;
  workerName: string;
  requestedWorkerNames?: string[];
  start: Date;
  end: Date;
  status: BookingStatus;
  cancelledBy?: string;
  cancelledAt?: Date;
  sleepover: boolean;
  createdByMe: boolean;
  address?: string;
  description?: string;
  driving?: 'not-required' | 'worker-vehicle' | 'location-vehicle';
  financeReference?: string;
  frequency?: 'one-off' | 'weekly' | 'fortnightly';
  requestedAt?: Date;
  declinedWorkerNames?: string[];
  lastActivityAt?: Date;
  participantIds: string[];
};

export type GroupingRequestSummary = {
  id: string;
  locationId: string;
  locationName: string;
  start: Date;
  requestedAt: Date;
};

export type GroupingUsage = {
  total: number;
  locations: { locationId: string; locationName: string; bookingCount: number }[];
};

export type InvoiceApprovalState = 'ready-for-approval' | 'approved';

export type Invoice = {
  id: string;
  locationId: string;
  submittedAt: Date;
  approvalState: InvoiceApprovalState;
};

export type LocationData = {
  location: Location;
  workers: Worker[];
  bookings: Booking[];
  requestsToAccept: number;
  bookingsToApprove: number;
  plansToReview: number;
  unreadMessages: number;
  invoices: Invoice[];
};

export type WorkerLocationHistory = {
  locationId: string;
  locationName: string;
  bookingCount: number;
};

export type ProviderWorkerSummary = {
  id: string;
  name: string;
  planConfirmed: boolean;
  shiftCount: number;
  totalHours: number;
  lastWorkedAt?: Date;
  lastWorkedLocationId?: string;
  assessments: WorkerAssessments;
  locations: WorkerLocationHistory[];
};

export type OrganisationSearchWorker = {
  id: string;
  name: string;
  organisation: Organisation;
  totalHours: number;
  locationId: string;
};

export type OrganisationSearchResults = {
  supportables: Location[];
  clients: Location[];
  workers: OrganisationSearchWorker[];
  groupings: Grouping[];
};

export type NearbyWorker = {
  id: string;
  name: string;
  suburb: string;
  distanceKm: number;
  assessments: WorkerAssessments;
};

type WorkerSeed = {
  id: string;
  name: string;
  organisation: Organisation;
  sites: Set<string>;
  core: boolean;
  planConfirmed: boolean;
  supportPlanReviewDueAt: Date | null;
  assessments: WorkerAssessments;
};
function people(locationId: string, names: string[]): Participant[] {
  return names.map((name) => ({
    id: `${locationId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    name,
  }));
}

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  sil: 'SIL house',
  centre: 'Centre / day program',
  'home-community': 'Home and community',
};

export function serviceTypeLabel(
  serviceType: ServiceType,
  sector: Sector,
): string {
  if (serviceType === 'home-community' && sector === 'aged care') {
    return 'Support at Home';
  }
  return SERVICE_TYPE_LABEL[serviceType];
}

/** Service type and suburb on one line — comma-separated everywhere it appears. */
export function locationTypeSuburbLine(
  location: Pick<Location, 'serviceType' | 'sector' | 'suburb' | 'state'>,
  options?: { includeState?: boolean },
): string {
  const type = serviceTypeLabel(location.serviceType, location.sector);
  if (options?.includeState) {
    return `${type}, ${location.suburb}, ${location.state}`;
  }
  return `${type}, ${location.suburb}`;
}

const LEGACY_LOCATIONS: Location[] = [
  {
    id: 'allambie-heights-day-program',
    name: 'Allambie Heights Day Program',
    suburb: 'Allambie Heights',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'centre',
    participants: people('allambie-heights-day-program', [
      'Amira S',
      'Ben T',
      'Cora W',
      'Dylan H',
      'Eva R',
      'Farid N',
      'Grace P',
      'Hugo L',
    ]),
  },
  {
    id: 'brookvale-day-program',
    name: 'Brookvale Day Program',
    suburb: 'Brookvale',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'centre',
    participants: people('brookvale-day-program', [
      'Imogen C',
      'Jamal D',
      'Keira F',
      'Luca G',
      'Mei H',
      'Nate J',
      'Olive K',
    ]),
  },
  {
    id: 'dee-why-1',
    name: 'Dee Why 1',
    suburb: 'Dee Why',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('dee-why-1', ['Jonah A', 'Leah B', 'Nina C', 'Owen D']),
  },
  {
    id: 'galston-1',
    name: 'Galston 1',
    suburb: 'Galston',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('galston-1', ['Patrick E', 'Quinn F', 'Rosa G']),
  },
  {
    id: 'gladesville-1',
    name: 'Gladesville 1',
    suburb: 'Gladesville',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('gladesville-1', ['Sam H', 'Tessa I', 'Uma J', 'Vic K']),
  },
  {
    id: 'hornsby',
    name: 'Hornsby',
    suburb: 'Hornsby',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('hornsby', ['Wendy L', 'Xavier M', 'Yasmin N', 'Zane O', 'Ada P']),
  },
  {
    id: 'lane-cove-1',
    name: 'Lane Cove 1',
    suburb: 'Lane Cove',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('lane-cove-1', ['Beau Q', 'Clara R', 'Drew S']),
  },
  {
    id: 'manly-1',
    name: 'Manly 1',
    suburb: 'Manly',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('manly-1', ['Eden T', 'Felix U', 'Gwen V', 'Hugo W']),
  },
  {
    id: 'forestville-home',
    name: 'Maya Nguyen',
    suburb: 'Forestville',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'home-community',
    providerSite: false,
    participants: people('forestville-home', ['Maya Nguyen']),
  },
  {
    id: 'chatswood-home',
    name: 'Noah Williams',
    suburb: 'Chatswood',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'home-community',
    providerSite: false,
    participants: people('chatswood-home', ['Noah Williams']),
  },
  {
    id: 'north-ryde-1',
    name: 'North Ryde 1',
    suburb: 'North Ryde',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('north-ryde-1', ['Ivy X', 'Jules Y', 'Kurt Z', 'Lila A']),
  },
  {
    id: 'wahroonga',
    name: 'Wahroonga',
    suburb: 'Wahroonga',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('wahroonga', ['Milo B', 'Nora C', 'Otto D']),
  },
  {
    id: 'north-parramatta-1',
    name: 'North Parramatta 1',
    suburb: 'North Parramatta',
    state: 'NSW',
    organisation: 'Northcott',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('north-parramatta-1', ['Aiden C', 'Bella J', 'Callum R']),
  },
  {
    id: 'westmead-1',
    name: 'Westmead 1',
    suburb: 'Westmead',
    state: 'NSW',
    organisation: 'Northcott',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('westmead-1', ['Dara M', 'Elise P', 'Finn S', 'Gia T']),
  },
  {
    id: 'amelia-roberts-home',
    name: 'Amelia Roberts',
    suburb: 'North Parramatta',
    state: 'NSW',
    organisation: 'Northcott',
    sector: 'disability',
    serviceType: 'home-community',
    providerSite: true,
    participants: people('amelia-roberts-home', ['Amelia Roberts']),
  },
  {
    id: 'lucas-brown-home',
    name: 'Lucas Brown',
    suburb: 'Westmead',
    state: 'NSW',
    organisation: 'Northcott',
    sector: 'disability',
    serviceType: 'home-community',
    providerSite: true,
    participants: people('lucas-brown-home', ['Lucas Brown']),
  },
  {
    id: 'zara-khan-home',
    name: 'Zara Khan',
    suburb: 'North Parramatta',
    state: 'NSW',
    organisation: 'Northcott',
    sector: 'disability',
    serviceType: 'home-community',
    providerSite: true,
    participants: people('zara-khan-home', ['Zara Khan']),
  },
  {
    id: 'margaret-ellis-home',
    name: 'Margaret Ellis',
    suburb: 'Chatswood',
    state: 'NSW',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    serviceType: 'home-community',
    providerSite: false,
    participants: people('margaret-ellis-home', ['Margaret Ellis']),
  },
  {
    id: 'robert-hughes-home',
    name: 'Robert Hughes',
    suburb: 'Lane Cove',
    state: 'NSW',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    serviceType: 'home-community',
    providerSite: false,
    participants: people('robert-hughes-home', ['Robert Hughes']),
  },
  {
    id: 'susan-bennett-home',
    name: 'Susan Bennett',
    suburb: 'Mosman',
    state: 'NSW',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    serviceType: 'home-community',
    providerSite: false,
    participants: people('susan-bennett-home', ['Susan Bennett']),
  },
  {
    id: 'alan-whitfield-home',
    name: 'Alan Whitfield',
    suburb: 'Neutral Bay',
    state: 'NSW',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    serviceType: 'home-community',
    providerSite: false,
    participants: people('alan-whitfield-home', ['Alan Whitfield']),
  },
  {
    id: 'patricia-moore-home',
    name: 'Patricia Moore',
    suburb: 'Parramatta',
    state: 'NSW',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    serviceType: 'home-community',
    providerSite: false,
    participants: people('patricia-moore-home', ['Patricia Moore']),
  },
  {
    id: 'john-kelly-home',
    name: 'John Kelly',
    suburb: 'Blacktown',
    state: 'NSW',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    serviceType: 'home-community',
    providerSite: false,
    participants: people('john-kelly-home', ['John Kelly']),
  },
  {
    id: 'linda-cooper-home',
    name: 'Linda Cooper',
    suburb: 'Seven Hills',
    state: 'NSW',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    serviceType: 'home-community',
    providerSite: false,
    participants: people('linda-cooper-home', ['Linda Cooper']),
  },
  {
    id: 'michael-ward-home',
    name: 'Michael Ward',
    suburb: 'Penrith',
    state: 'NSW',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    serviceType: 'home-community',
    providerSite: false,
    participants: people('michael-ward-home', ['Michael Ward']),
  },
  {
    id: 'harris-park-1',
    name: 'Harris Park 1',
    suburb: 'Harris Park',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('harris-park-1', ['Pia E', 'Rory F', 'Sasha G']),
  },
  {
    id: 'blacktown-1',
    name: 'Blacktown 1',
    suburb: 'Blacktown',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('blacktown-1', ['Theo H', 'Una I', 'Vera J', 'Wes K']),
  },
  {
    id: 'newcastle-1',
    name: 'Newcastle 1',
    suburb: 'Newcastle',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('newcastle-1', ['Yara L', 'Zeke M', 'Arlo N']),
  },
  {
    id: 'maitland-1',
    name: 'Maitland 1',
    suburb: 'Maitland',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('maitland-1', ['Blair O', 'Cleo P', 'Duke Q', 'Ellis R']),
  },
  {
    id: 'wollongong-1',
    name: 'Wollongong 1',
    suburb: 'Wollongong',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('wollongong-1', ['Fran S', 'Gus T', 'Hana U']),
  },
  {
    id: 'shellharbour-1',
    name: 'Shellharbour 1',
    suburb: 'Shellharbour',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'sil',
    participants: people('shellharbour-1', ['Ivo V', 'June W', 'Kade X', 'Lina Y']),
  },
  {
    id: 'pennant-hills-day-program',
    name: 'Pennant Hills Day Program',
    suburb: 'Pennant Hills',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'centre',
    participants: people('pennant-hills-day-program', [
      'Mira Z',
      'Ned A',
      'Opal B',
      'Paul C',
    ]),
  },
  {
    id: 'ruby-chen-home',
    name: 'Ruby Chen',
    suburb: 'Carlingford',
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType: 'home-community',
    providerSite: false,
    participants: people('ruby-chen-home', ['Ruby Chen']),
  },
];

type SilRegionSeed = {
  id: string;
  name: string;
  existingLocationIds: string[];
  newHouseSuburbs: string[];
};

const SIL_REGION_SEEDS: SilRegionSeed[] = [
  {
    id: 'northern-sydney',
    name: 'Northern Sydney',
    existingLocationIds: ['dee-why-1', 'galston-1', 'hornsby', 'north-ryde-1', 'wahroonga'],
    newHouseSuburbs: ['Avalon Beach', 'Mosman'],
  },
  {
    id: 'cpa-western-sydney',
    name: 'Western Sydney',
    existingLocationIds: ['harris-park-1', 'blacktown-1'],
    newHouseSuburbs: ['Seven Hills', 'Toongabbie'],
  },
  {
    id: 'hunter',
    name: 'Hunter',
    existingLocationIds: ['newcastle-1', 'maitland-1'],
    newHouseSuburbs: ['Charlestown', 'Cessnock', 'Raymond Terrace'],
  },
  {
    id: 'illawarra',
    name: 'Illawarra',
    existingLocationIds: ['wollongong-1', 'shellharbour-1'],
    newHouseSuburbs: ['Dapto', 'Kiama', 'Corrimal'],
  },
  {
    id: 'northern-beaches',
    name: 'Northern Beaches',
    existingLocationIds: ['manly-1'],
    newHouseSuburbs: ['Narrabeen', 'Mona Vale', 'Brookvale', 'Freshwater', 'Collaroy'],
  },
  {
    id: 'lower-north-shore',
    name: 'Lower North Shore',
    existingLocationIds: ['gladesville-1', 'lane-cove-1'],
    newHouseSuburbs: ['Chatswood', 'Artarmon', 'Willoughby', 'Northbridge'],
  },
  {
    id: 'central-coast',
    name: 'Central Coast',
    existingLocationIds: [],
    newHouseSuburbs: ['Gosford', 'Wyoming', 'Erina', 'Woy Woy', 'Tuggerah', 'Bateau Bay'],
  },
  {
    id: 'nepean',
    name: 'Nepean',
    existingLocationIds: [],
    newHouseSuburbs: ['Penrith', 'Kingswood', 'St Marys', 'Emu Plains', 'Glenmore Park', 'Cambridge Park', 'Werrington'],
  },
  {
    id: 'south-western-sydney',
    name: 'South Western Sydney',
    existingLocationIds: [],
    newHouseSuburbs: ['Liverpool', 'Casula', 'Campbelltown', 'Ingleburn', 'Fairfield', 'Cabramatta', 'Narellan'],
  },
  {
    id: 'new-england',
    name: 'New England',
    existingLocationIds: [],
    newHouseSuburbs: ['Tamworth', 'Armidale', 'Gunnedah', 'Inverell', 'Moree', 'Narrabri', 'Glen Innes', 'Tenterfield'],
  },
  {
    id: 'mid-north-coast',
    name: 'Mid North Coast',
    existingLocationIds: [],
    newHouseSuburbs: ['Port Macquarie', 'Taree', 'Forster', 'Kempsey', 'Wauchope', 'Coffs Harbour', 'Sawtell', 'Nambucca Heads', 'Macksville'],
  },
  {
    id: 'southern-nsw',
    name: 'Southern NSW',
    existingLocationIds: [],
    newHouseSuburbs: ['Goulburn', 'Queanbeyan', 'Yass', 'Batemans Bay', 'Moruya', 'Bega', 'Cooma', 'Young', 'Cowra', 'Parkes'],
  },
  {
    id: 'far-west',
    name: 'Far West',
    existingLocationIds: [],
    newHouseSuburbs: ['Dubbo', 'Orange', 'Bathurst', 'Broken Hill', 'Mudgee', 'Forbes', 'Narromine', 'Wellington', 'Bourke', 'Cobar', 'Condobolin'],
  },
];

function generatedLocation(id: string, name: string, suburb: string, serviceType: ServiceType): Location {
  const participantNames =
    serviceType === 'centre'
      ? [`${name} client A`, `${name} client B`, `${name} client C`, `${name} client D`]
      : [`${suburb} resident A`, `${suburb} resident B`, `${suburb} resident C`];
  return {
    id,
    name,
    suburb,
    state: 'NSW',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    serviceType,
    participants: people(id, participantNames),
  };
}

const GENERATED_SIL_LOCATIONS = SIL_REGION_SEEDS.flatMap((region) =>
  region.newHouseSuburbs.map((suburb, index) => {
    const id = `${slugName(suburb)}-${index + 1}`;
    return generatedLocation(id, `${suburb} ${index + 1}`, suburb, 'sil');
  }),
);

const LIFESTYLES_CENTRE_SUBURBS = [
  'Frenchs Forest',
  'Chatswood',
  'Ryde',
  'Parramatta',
  'Penrith',
  'Liverpool',
  'Campbelltown',
  'Newcastle',
  'Wollongong',
];

const GENERATED_LIFESTYLES_LOCATIONS = LIFESTYLES_CENTRE_SUBURBS.map((suburb) => {
  const id = `${slugName(suburb)}-lifestyles-centre`;
  return generatedLocation(id, `${suburb} Lifestyles Centre`, suburb, 'centre');
});

export const LOCATIONS: Location[] = [
  ...LEGACY_LOCATIONS,
  ...GENERATED_SIL_LOCATIONS,
  ...GENERATED_LIFESTYLES_LOCATIONS,
];

export const GROUPING: Grouping = {
  id: 'northern-sydney',
  name: 'Northern Sydney',
  kind: 'region',
  organisation: 'Cerebral Palsy Alliance',
  sector: 'disability',
  locationIds: [
    'allambie-heights-day-program',
    'dee-why-1',
    'galston-1',
    'hornsby',
    'north-ryde-1',
    'wahroonga',
    'avalon-beach-1',
    'mosman-2',
  ],
};

/**
 * Sourced constraint: exactly three houses use a two-site manager model.
 * The seed has no manager-to-house assignment, so this is recorded here only;
 * grouping overlap represents service-line membership, not manager coverage.
 */
export const GROUPINGS: Grouping[] = [
  GROUPING,
  {
    id: 'cpa-western-sydney',
    name: 'Western Sydney',
    kind: 'region',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: ['harris-park-1', 'blacktown-1', 'seven-hills-1', 'toongabbie-2'],
  },
  {
    id: 'hunter',
    name: 'Hunter',
    kind: 'region',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: ['newcastle-1', 'maitland-1', 'charlestown-1', 'cessnock-2', 'raymond-terrace-3'],
  },
  {
    id: 'illawarra',
    name: 'Illawarra',
    kind: 'region',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: ['wollongong-1', 'shellharbour-1', 'dapto-1', 'kiama-2', 'corrimal-3'],
  },
  ...SIL_REGION_SEEDS.slice(4).map((region) => ({
    id: region.id,
    name: region.name,
    kind: 'region' as const,
    organisation: 'Cerebral Palsy Alliance' as const,
    sector: 'disability' as const,
    locationIds: [
      ...region.existingLocationIds,
      ...region.newHouseSuburbs.map((suburb, index) => `${slugName(suburb)}-${index + 1}`),
    ],
  })),
  /**
   * 12 Lifestyles centres is an assumed operating scale for research; confirm
   * the number and regional split with participants.
   */
  {
    id: 'northern-lifestyles',
    name: 'Northern Lifestyles',
    kind: 'lifestyles',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'allambie-heights-day-program',
      'brookvale-day-program',
      'forestville-home',
      'chatswood-home',
      'frenchs-forest-lifestyles-centre',
      'chatswood-lifestyles-centre',
      'ryde-lifestyles-centre',
      'parramatta-lifestyles-centre',
      'penrith-lifestyles-centre',
    ],
  },
  {
    id: 'western-lifestyles',
    name: 'Western Lifestyles',
    kind: 'lifestyles',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'pennant-hills-day-program',
      'ruby-chen-home',
      'liverpool-lifestyles-centre',
      'campbelltown-lifestyles-centre',
      'newcastle-lifestyles-centre',
      'wollongong-lifestyles-centre',
    ],
  },
  /**
   * 9 Careforce caseloads is an assumed operating scale for research; confirm
   * caseload count and boundaries with participants.
   */
  {
    id: 'careforce-area',
    name: 'Careforce area',
    kind: 'area',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [],
    groupingIds: [
      'careforce-caseload',
      'careforce-northern-caseload',
      'careforce-western-caseload',
      'careforce-hunter-caseload',
      'careforce-illawarra-caseload',
      'careforce-coastal-caseload',
      'careforce-metropolitan-caseload',
      'careforce-regional-caseload',
      'careforce-west-caseload',
    ],
  },
  {
    id: 'careforce-caseload',
    name: 'Careforce caseload',
    kind: 'caseload',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'dee-why-1',
      'forestville-home',
      'gladesville-1',
      'lane-cove-1',
      'manly-1',
      'north-ryde-1',
      'avalon-beach-1',
      'mosman-2',
    ],
  },
  {
    id: 'careforce-northern-caseload',
    name: 'Careforce Northern caseload',
    kind: 'caseload',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'galston-1',
      'hornsby',
      'lane-cove-1',
      'chatswood-home',
      'north-ryde-1',
      'wahroonga',
      'chatswood-1',
      'artarmon-2',
    ],
  },
  {
    id: 'careforce-western-caseload',
    name: 'Careforce Western caseload',
    kind: 'caseload',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'harris-park-1',
      'blacktown-1',
      'gladesville-1',
      'seven-hills-1',
      'toongabbie-2',
      'penrith-1',
      'kingswood-2',
      'st-marys-3',
    ],
  },
  {
    id: 'careforce-hunter-caseload',
    name: 'Careforce Hunter caseload',
    kind: 'caseload',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'newcastle-1',
      'maitland-1',
      'manly-1',
      'charlestown-1',
      'cessnock-2',
      'raymond-terrace-3',
      'gosford-1',
      'wyoming-2',
    ],
  },
  {
    id: 'careforce-illawarra-caseload',
    name: 'Careforce Illawarra caseload',
    kind: 'caseload',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'wollongong-1',
      'shellharbour-1',
      'forestville-home',
      'dapto-1',
      'kiama-2',
      'corrimal-3',
      'batemans-bay-4',
      'moruya-5',
    ],
  },
  {
    id: 'careforce-coastal-caseload',
    name: 'Careforce Coastal caseload',
    kind: 'caseload',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'narrabeen-1',
      'mona-vale-2',
      'brookvale-3',
      'freshwater-4',
      'collaroy-5',
      'gosford-1',
      'erina-3',
      'woy-woy-4',
    ],
  },
  {
    id: 'careforce-metropolitan-caseload',
    name: 'Careforce Metropolitan caseload',
    kind: 'caseload',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'lane-cove-1',
      'chatswood-1',
      'artarmon-2',
      'willoughby-3',
      'northbridge-4',
      'liverpool-1',
      'casula-2',
      'fairfield-5',
    ],
  },
  {
    id: 'careforce-regional-caseload',
    name: 'Careforce Regional caseload',
    kind: 'caseload',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'tamworth-1',
      'armidale-2',
      'gunnedah-3',
      'inverell-4',
      'port-macquarie-1',
      'taree-2',
      'forster-3',
      'kempsey-4',
    ],
  },
  {
    id: 'careforce-west-caseload',
    name: 'Careforce West caseload',
    kind: 'caseload',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'dubbo-1',
      'orange-2',
      'bathurst-3',
      'broken-hill-4',
      'mudgee-5',
      'forbes-6',
      'narromine-7',
      'wellington-8',
    ],
  },
  {
    id: 'northcott-sil-services',
    name: 'Western Sydney SIL services',
    kind: 'service',
    organisation: 'Northcott',
    sector: 'disability',
    locationIds: ['north-parramatta-1', 'westmead-1'],
  },
  {
    id: 'northcott-individual-services',
    name: 'Western Sydney individual services',
    kind: 'service',
    organisation: 'Northcott',
    sector: 'disability',
    locationIds: [
      'amelia-roberts-home',
      'lucas-brown-home',
      'zara-khan-home',
    ],
  },
  {
    id: 'lwb-greater-sydney',
    name: 'Greater Sydney',
    kind: 'area',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    locationIds: [],
    groupingIds: ['lwb-northern-sydney', 'lwb-western-sydney'],
  },
  {
    id: 'lwb-northern-sydney',
    name: 'Northern Sydney',
    kind: 'region',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    locationIds: [
      'margaret-ellis-home',
      'robert-hughes-home',
      'susan-bennett-home',
      'alan-whitfield-home',
    ],
  },
  {
    id: 'lwb-western-sydney',
    name: 'Western Sydney',
    kind: 'region',
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    locationIds: [
      'patricia-moore-home',
      'john-kelly-home',
      'linda-cooper-home',
      'michael-ward-home',
    ],
  },
  {
    id: 'cpa-sil',
    name: 'SIL',
    kind: 'arm',
    organisation: 'Cerebral Palsy Alliance',
    locationIds: [],
    groupingIds: [
      'northern-sydney',
      'cpa-western-sydney',
      'hunter',
      'illawarra',
      'northern-beaches',
      'lower-north-shore',
      'central-coast',
      'nepean',
      'south-western-sydney',
      'new-england',
      'mid-north-coast',
      'southern-nsw',
      'far-west',
    ],
  },
  {
    id: 'cpa-lifestyles',
    name: 'Lifestyles',
    kind: 'arm',
    organisation: 'Cerebral Palsy Alliance',
    locationIds: [],
    groupingIds: ['northern-lifestyles', 'western-lifestyles'],
  },
  {
    id: 'cpa-careforce',
    name: 'Careforce',
    kind: 'arm',
    organisation: 'Cerebral Palsy Alliance',
    locationIds: [],
    groupingIds: ['careforce-area'],
  },
  {
    id: 'northcott-disability-services',
    name: 'Disability services',
    kind: 'arm',
    organisation: 'Northcott',
    locationIds: [],
    groupingIds: [
      'northcott-sil-services',
      'northcott-individual-services',
    ],
  },
  {
    id: 'lwb-aged-care',
    name: 'Aged care',
    kind: 'arm',
    organisation: 'Life Without Barriers',
    locationIds: [],
    groupingIds: ['lwb-greater-sydney'],
  },
];

const WORKER_POOL: Record<Organisation, string[]> = {
  'Cerebral Palsy Alliance': [
    'Eleni P',
    'Angela O',
    'Maxine R',
    'Erica O',
    'Scarlett O',
    'Mandii Z',
    'Geoffrey L',
    'Brian R',
    'Charlies K',
    'Ira J',
    'Ginger N',
    'Han Hendrick P',
    'John M',
    'Pete C',
    'Sally M',
    'Venessa S',
    'Beth C',
    'Dylan S',
    'Farah T',
    'Joel V',
    'Kim R',
    'Luke A',
  ],
  Northcott: [
    'Priya N',
    'Tom W',
    'Aisha K',
    'Daniel F',
    'Mei L',
    'Chris B',
    'Nadia S',
    'Jarrah B',
    'Oliver H',
    'Bianca T',
    'Rosa D',
    'Hugo M',
    'Yasmin P',
    'Callum S',
    'Amara D',
    'Felix G',
    'Holly J',
    'Imran K',
    'Jade M',
    'Leo P',
  ],
  'Life Without Barriers': [
    'Irene V',
    'Noah K',
    'Pia L',
    'Kylie A',
    'Marcus D',
    'Nina E',
    'Owen F',
    'Fatima G',
    'George H',
    'Harper I',
    'Isaac J',
    'Julia K',
    'Kiran M',
    'Louise N',
    'Martin Q',
    'Alice B',
    'Connor C',
    'Deepa D',
    'Finn E',
    'Gemma F',
    'Hamish G',
  ],
};

/** Sparse lapsed assessments so exception tags stay rare in the Overview aside. */
function seededAssessmentStatus(index: number): {
  medication: boolean;
  driving: boolean;
} {
  switch (index % 22) {
    case 4:
      return { medication: true, driving: false };
    case 9:
      return { medication: false, driving: true };
    case 13:
      return { medication: false, driving: false };
    case 17:
      return { medication: false, driving: true };
    default:
      return { medication: true, driving: true };
  }
}

function workerAssessments(
  medication: boolean,
  driving: boolean,
  seed: number,
): WorkerAssessments {
  const today = startOfDay(new Date());
  return {
    medication,
    medicationExpiresAt: addDays(today, medication ? 60 + (seed % 30) : -(1 + (seed % 9))),
    driving,
    drivingExpiresAt: addDays(today, driving ? 90 + (seed % 30) : -(2 + (seed % 11))),
  };
}

const NEARBY_WORKERS: NearbyWorker[] = [
  {
    id: 'leah-c',
    name: 'Leah C',
    suburb: 'Chatswood',
    distanceKm: 4,
    assessments: workerAssessments(true, true, 1),
  },
  {
    id: 'omar-h',
    name: 'Omar H',
    suburb: 'Frenchs Forest',
    distanceKm: 6,
    assessments: workerAssessments(true, false, 2),
  },
  {
    id: 'rachel-t',
    name: 'Rachel T',
    suburb: 'Ryde',
    distanceKm: 8,
    assessments: workerAssessments(false, true, 3),
  },
  {
    id: 'samira-a',
    name: 'Samira A',
    suburb: 'Epping',
    distanceKm: 9,
    assessments: workerAssessments(true, true, 4),
  },
  {
    id: 'will-j',
    name: 'Will J',
    suburb: 'Mona Vale',
    distanceKm: 12,
    assessments: workerAssessments(false, false, 5),
  },
];

/** Regulars a provider location would typically book with (core plus casuals). */
const WORKER_COUNT_PATTERN = [12, 11, 14, 11, 13, 15, 10, 12, 10, 13, 13, 16];
const WORKERS_PER_LOCATION = LOCATIONS.map(
  (_, index) => WORKER_COUNT_PATTERN[index % WORKER_COUNT_PATTERN.length],
);

/**
 * Daytime shifts before the overnight sleepover. A real 24/7 house runs 2–4
 * overlapping day staff, but a full roster makes the dashboard week unreadable
 * in a session, so the prototype shows a lighter day: one or two day shifts plus
 * the overnight, which also keeps every day inside the grid without an expander.
 */
const DAYTIME_COUNT_PATTERN = [2, 2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 2];
const DAYTIME_COUNTS = LOCATIONS.map(
  (_, index) => DAYTIME_COUNT_PATTERN[index % DAYTIME_COUNT_PATTERN.length],
);

/** Seeded so the placeholder roster and shifts stay identical between reloads. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function at(day: Date, hours: number, minutes: number): Date {
  const d = startOfDay(day);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function slugName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function countAt(seeds: WorkerSeed[], locationId: string): number {
  return seeds.filter((worker) => worker.sites.has(locationId)).length;
}

/** One identity per provider. History overlaps locations but never organisations. */
function buildWorkerSeeds(): WorkerSeed[] {
  let seedIndex = 0;
  const seeds = Object.entries(WORKER_POOL).flatMap(
    ([organisation, names]) =>
      names.map((name) => {
        const index = seedIndex;
        seedIndex += 1;
        const planConfirmed = index % 3 !== 0;
        return {
          id: slugName(name),
          name,
          organisation: organisation as Organisation,
          sites: new Set<string>(),
          core: false,
          planConfirmed,
          supportPlanReviewDueAt: planConfirmed
            ? null
            : addDays(startOfDay(new Date()), -(1 + (index % 14))),
          assessments: (() => {
            const status = seededAssessmentStatus(index);
            return workerAssessments(
              status.medication,
              status.driving,
              index,
            );
          })(),
        };
      }),
  );

  for (const organisation of ['Northcott', 'Life Without Barriers'] as Organisation[]) {
    const providerLocations = LOCATIONS.filter(
      (location) => location.organisation === organisation,
    );
    const providerSeeds = seeds.filter(
      (worker) => worker.organisation === organisation,
    );

    /* Keep a few narrow histories for breadth comparisons. */
    const singleSiteCount = Math.min(2, providerLocations.length);
    for (let index = 0; index < singleSiteCount; index += 1) {
      providerSeeds[index].sites.add(providerLocations[index].id);
      providerSeeds[index].core = true;
    }

    let next = singleSiteCount;
    if (providerLocations.length > 1 && providerSeeds[next]) {
      providerSeeds[next].sites.add(providerLocations[0].id);
      providerSeeds[next].sites.add(providerLocations[providerLocations.length - 1].id);
      providerSeeds[next].core = true;
      next += 1;
    }

    /* Two people carry history across this provider, never across providers. */
    for (const worker of providerSeeds.slice(next, next + 2)) {
      for (const location of providerLocations) {
        worker.sites.add(location.id);
      }
    }
    next += 2;

    const fill = providerSeeds.slice(next);
    for (const location of providerLocations) {
      const legacyLocationIndex = LOCATIONS.indexOf(location);
      const fixedCount = countAt(providerSeeds, location.id);
      const target = Math.min(
        WORKERS_PER_LOCATION[legacyLocationIndex],
        providerSeeds.length - 4,
        fixedCount + fill.length,
      );
      const offset = providerLocations.indexOf(location) % fill.length;
      const rotatedFill = [...fill.slice(offset), ...fill.slice(0, offset)];
      while (countAt(providerSeeds, location.id) < target) {
        const candidate = rotatedFill.find(
          (worker) => !worker.sites.has(location.id),
        );
        if (!candidate) break;
        candidate.sites.add(location.id);
      }
    }
  }

  const cpaNamedSeeds = seeds.filter(
    (worker) => worker.organisation === 'Cerebral Palsy Alliance',
  );
  const generatedNames = [
    'Aaliyah', 'Amelia', 'Aria', 'Ava', 'Chloe', 'Evie', 'Grace', 'Harper',
    'Isla', 'Layla', 'Leo', 'Liam', 'Mason', 'Mia', 'Noah', 'Oliver',
    'Ruby', 'Sienna', 'Sophie', 'Theo', 'Willow', 'Xavier',
  ];
  let generatedNameIndex = 0;
  const generatedInitials = (index: number): string => {
    const first = String.fromCharCode(65 + (index % 26));
    const cycle = Math.floor(index / 26);
    return cycle === 0
      ? first
      : `${String.fromCharCode(64 + cycle)}${first}`;
  };
  const nextGeneratedWorkerName = (): string => {
    const index = generatedNameIndex;
    generatedNameIndex += 1;
    return `${generatedNames[index % generatedNames.length]} ${generatedInitials(
      Math.floor(index / generatedNames.length),
    )}`;
  };
  const makeGeneratedWorker = (
    id: string,
    name: string,
    locationIds: string[],
  ): WorkerSeed => {
    const index = seedIndex;
    seedIndex += 1;
    const status = seededAssessmentStatus(index);
    return {
      id,
      name,
      organisation: 'Cerebral Palsy Alliance',
      sites: new Set(locationIds),
      core: false,
      planConfirmed: index % 3 !== 0,
      supportPlanReviewDueAt:
        index % 3 !== 0 ? null : addDays(startOfDay(new Date()), -(1 + (index % 14))),
      assessments: workerAssessments(status.medication, status.driving, index),
    };
  };

  /**
   * 20% cross-house overlap is assumed and needs participant checking.
   * Shared workers are explicitly active at a second house, never a whole region.
   */
  SIL_REGION_SEEDS.forEach((region, regionIndex) => {
    const locationIds = [
      ...region.existingLocationIds,
      ...region.newHouseSuburbs.map((suburb, index) => `${slugName(suburb)}-${index + 1}`),
    ];
    const totalMemberships = locationIds.length * 13;
    const sharedCount = Math.round(totalMemberships / 6);
    const distinctCount = totalMemberships - sharedCount;
    const regionalSeeds: WorkerSeed[] = [];

    for (let workerIndex = 0; workerIndex < distinctCount; workerIndex += 1) {
      const named = regionIndex === 0 ? cpaNamedSeeds[workerIndex] : undefined;
      const generatedName = nextGeneratedWorkerName();
      const worker =
        named ??
        makeGeneratedWorker(
          `cpa-${region.id}-worker-${String(workerIndex + 1).padStart(3, '0')}`,
          generatedName,
          [],
        );
      worker.sites.clear();
      regionalSeeds.push(worker);
    }

    regionalSeeds.slice(0, sharedCount).forEach((worker, workerIndex) => {
      worker.sites.add(locationIds[workerIndex % locationIds.length]);
      worker.sites.add(
        locationIds[(workerIndex + Math.ceil(locationIds.length / 2)) % locationIds.length],
      );
    });
    regionalSeeds.slice(sharedCount).forEach((worker) => {
      const locationId = [...locationIds].sort(
        (a, b) => countAt(regionalSeeds, a) - countAt(regionalSeeds, b),
      )[0];
      worker.sites.add(locationId);
    });
    /* Eleni supplies one real many-house history for the uncapped Workers
       table and namedLocationList(..., 3). Keep this separate from the assumed
       cohort whose workers are active at exactly a second house. */
    if (regionIndex === 0 && regionalSeeds[0]) {
      regionalSeeds[0].sites.clear();
      locationIds.slice(0, 5).forEach((locationId) => {
        regionalSeeds[0].sites.add(locationId);
      });
    }
    seeds.push(...regionalSeeds.filter((worker) => !seeds.includes(worker)));
  });

  for (const location of LOCATIONS.filter(
    (item) =>
      item.organisation === 'Cerebral Palsy Alliance' && item.serviceType !== 'sil',
  )) {
    for (let workerIndex = 0; workerIndex < 12; workerIndex += 1) {
      const name = nextGeneratedWorkerName();
      seeds.push(
        makeGeneratedWorker(
          `cpa-${location.id}-worker-${String(workerIndex + 1).padStart(2, '0')}`,
          name,
          [location.id],
        ),
      );
    }
  }

  return seeds;
}

const WORKER_SEEDS = buildWorkerSeeds();

function rosterFor(locationId: string): WorkerSeed[] {
  return WORKER_SEEDS.filter((worker) => worker.sites.has(locationId));
}

const DAYTIME_SHIFTS: Record<number, { hour: number; minutes: number; hours: number }[]> = {
  1: [{ hour: 7, minutes: 0, hours: 14 }],
  2: [
    { hour: 7, minutes: 0, hours: 9 },
    { hour: 16, minutes: 0, hours: 6 },
  ],
  3: [
    { hour: 7, minutes: 0, hours: 8 },
    { hour: 15, minutes: 0, hours: 6 },
    { hour: 15, minutes: 30, hours: 6 },
  ],
  4: [
    { hour: 7, minutes: 0, hours: 8 },
    { hour: 7, minutes: 30, hours: 8 },
    { hour: 15, minutes: 0, hours: 6 },
    { hour: 15, minutes: 0, hours: 6 },
  ],
};

/**
 * Day staffing moves around the base level, so the week reads as a roster rather
 * than a wall of identical columns. The busiest day is three day shifts plus the
 * overnight, which still fits the dashboard grid without an expander.
 */
function daytimeCountFor(
  location: Location,
  locationIndex: number,
  offset: number,
  random: () => number,
): number {
  if (location.organisation === 'Cerebral Palsy Alliance') {
    if (location.serviceType === 'sil') return offset % 4 === 0 ? 1 : 2;
    return offset % 3 === 0 ? 3 : 2;
  }
  const base = DAYTIME_COUNTS[locationIndex];
  const roll = random();
  if (roll < 0.2) return Math.max(1, base - 1);
  if (roll < 0.65) return base;
  return Math.min(3, base + 1);
}

function pickWorker(
  roster: WorkerSeed[],
  used: Set<string>,
  random: () => number,
): WorkerSeed {
  const available = roster.filter((worker) => !used.has(worker.id));
  const pool = available.length > 0 ? available : roster;
  const core = pool.filter((worker) => worker.core);
  const slice = random() < 0.85 && core.length > 0 ? core : pool;
  return slice[Math.floor(random() * slice.length)];
}

function statusFor(offset: number, end: Date, now: Date): BookingStatus {
  if (offset < 0 || (offset === 0 && end < now)) return 'ended';
  return 'confirmed';
}

const MAX_REQUESTED_PER_WEEK = 3;

/* Locations must look different from the grouping dashboard. One or two houses
   have several requests waiting; a quiet house has none this week. Cap stays
   three a week, on different days, so a location week is still readable.
   Pressure sits mostly on houses with a single parent, so each grouping's
   request list is led by work the other grouping cannot see. */
const REQUEST_PRESSURE_PATTERN = [
  { thisWeek: 2, nextWeek: 1, unansweredHours: [48, 20, 6] },
  { thisWeek: 1, nextWeek: 2, unansweredHours: [30, 12, 4] },
  { thisWeek: 2, nextWeek: 1, unansweredHours: [90, 40, 10] },
  { thisWeek: 0, nextWeek: 0, unansweredHours: [] },
  { thisWeek: 3, nextWeek: 2, unansweredHours: [72, 36, 16, 9, 2] },
  { thisWeek: 3, nextWeek: 1, unansweredHours: [18, 8, 3, 26] },
  { thisWeek: 0, nextWeek: 1, unansweredHours: [22] },
  { thisWeek: 2, nextWeek: 1, unansweredHours: [26, 7, 4] },
  { thisWeek: 1, nextWeek: 0, unansweredHours: [16] },
  { thisWeek: 2, nextWeek: 2, unansweredHours: [62, 24, 8, 3] },
  { thisWeek: 1, nextWeek: 1, unansweredHours: [80, 12] },
  { thisWeek: 2, nextWeek: 1, unansweredHours: [54, 14, 6] },
];

const REQUEST_PRESSURE = LOCATIONS.map(
  (_, index) => REQUEST_PRESSURE_PATTERN[index % REQUEST_PRESSURE_PATTERN.length],
);
const UNREAD_PATTERN = [2, 1, 4, 0, 5, 2, 1, 3, 1, 4, 6, 1];
const UNREAD_MESSAGES = LOCATIONS.map(
  (_, index) => UNREAD_PATTERN[index % UNREAD_PATTERN.length],
);
const APPROVAL_PATTERN = [2, 1, 3, 1, 4, 2, 2, 4, 1, 3, 5, 0];
const APPROVALS_WAITING = LOCATIONS.map(
  (location, index) =>
    location.id === 'galston-1'
      ? 0
      : APPROVAL_PATTERN[index % APPROVAL_PATTERN.length],
);

const CPA_HIGH_PRESSURE_LOCATIONS = new Set([
  'allambie-heights-day-program',
  'dee-why-1',
  'hornsby',
  'north-ryde-1',
  'wahroonga',
  'avalon-beach-1',
  'harris-park-1',
  'newcastle-1',
  'wollongong-1',
  'manly-1',
  'gladesville-1',
  'gosford-1',
  'penrith-1',
  'liverpool-1',
  'tamworth-1',
  'port-macquarie-1',
  'goulburn-1',
  'dubbo-1',
]);

function requestPressureFor(location: Location, locationIndex: number) {
  if (location.organisation !== 'Cerebral Palsy Alliance') {
    return REQUEST_PRESSURE[locationIndex] ?? REQUEST_PRESSURE[0];
  }
  if (!CPA_HIGH_PRESSURE_LOCATIONS.has(location.id)) {
    return { thisWeek: 0, nextWeek: 0, unansweredHours: [] };
  }
  return { thisWeek: 3, nextWeek: 2, unansweredHours: [72, 36, 18, 8, 3] };
}

function unreadMessagesFor(location: Location, locationIndex: number): number {
  if (location.organisation !== 'Cerebral Palsy Alliance') {
    return UNREAD_MESSAGES[locationIndex] ?? 0;
  }
  if (location.id === 'galston-1') return 0;
  return CPA_HIGH_PRESSURE_LOCATIONS.has(location.id) ? 2 + (stableHash(location.id) % 5) : 0;
}

function approvalsWaitingFor(location: Location, locationIndex: number): number {
  if (location.organisation !== 'Cerebral Palsy Alliance') {
    return APPROVALS_WAITING[locationIndex] ?? 0;
  }
  if (location.id === 'galston-1') return 0;
  return CPA_HIGH_PRESSURE_LOCATIONS.has(location.id) ? 2 + (stableHash(location.id) % 4) : 0;
}

function markRequestedInWeek(
  bookings: Booking[],
  weekStart: Date,
  max: number,
  preferSoon: boolean,
  now: Date,
  unansweredHours: number[],
  hourIndex: { n: number },
): void {
  if (max <= 0) return;

  const today = startOfDay(now);
  const weekEnd = addDays(weekStart, 7);
  const byDay = new Map<string, Booking[]>();

  for (const booking of bookings) {
    if (booking.status !== 'confirmed') continue;
    if (booking.start < weekStart || booking.start >= weekEnd) continue;
    if (booking.start < today) continue;
    const key = startOfDay(booking.start).toISOString();
    const day = byDay.get(key) ?? [];
    day.push(booking);
    byDay.set(key, day);
  }

  const days = [...byDay.keys()].sort((a, b) => {
    const diff = new Date(a).getTime() - new Date(b).getTime();
    return preferSoon ? diff : -diff;
  });

  for (const day of days.slice(0, Math.min(max, MAX_REQUESTED_PER_WEEK, days.length))) {
    const pool = (byDay.get(day) ?? []).slice().sort((a, b) => a.start.getTime() - b.start.getTime());
    const pick = preferSoon ? pool[0] : pool[pool.length - 1];
    const hours = unansweredHours[hourIndex.n] ?? 8;
    hourIndex.n += 1;
    pick.status = 'requested';
    pick.requestedAt = new Date(now.getTime() - hours * 3600 * 1000);
  }
}

function assignRequested(
  bookings: Booking[],
  location: Location,
  locationIndex: number,
  now: Date,
): void {
  const pressure = requestPressureFor(location, locationIndex);
  const thisWeekStart = startOfWeek(startOfDay(now));
  const hourIndex = { n: 0 };
  markRequestedInWeek(
    bookings,
    thisWeekStart,
    pressure.thisWeek,
    true,
    now,
    pressure.unansweredHours,
    hourIndex,
  );
  markRequestedInWeek(
    bookings,
    addDays(thisWeekStart, 7),
    pressure.nextWeek,
    false,
    now,
    pressure.unansweredHours,
    hourIndex,
  );
}

function assignRequestOutreach(
  bookings: Booking[],
  location: Location,
  roster: { name: string }[],
  now: Date,
): void {
  const requested = bookings
    .filter((booking) => booking.status === 'requested')
    .sort(
      (a, b) =>
        (a.requestedAt?.getTime() ?? 0) - (b.requestedAt?.getTime() ?? 0),
    );
  const sentNames = roster.slice(0, 5).map((worker) => worker.name);

  requested.forEach((booking, index) => {
    booking.lastActivityAt = booking.requestedAt;

    booking.requestedWorkerNames = sentNames;

    if (location.id === 'north-ryde-1' && index === 0) {
      booking.declinedWorkerNames = sentNames.slice(0, 2);
      return;
    }

    if (location.id === 'hornsby' && index === 0) {
      booking.requestedAt = new Date(now.getTime() - 72 * 3600 * 1000);
      booking.lastActivityAt = booking.requestedAt;
      booking.declinedWorkerNames = [];
      return;
    }

    if (location.id === 'hornsby' && index === 1) {
      booking.declinedWorkerNames = sentNames.slice(0, 2);
      return;
    }

    booking.declinedWorkerNames =
      index % 3 === 1 ? sentNames.slice(0, 2) : [];
  });
}

function assignCancellation(
  bookings: Booking[],
  location: Location,
  now: Date,
): void {
  if (location.id !== 'dee-why-1') return;

  const booking = bookings.find(
    (candidate) =>
      candidate.status === 'confirmed' &&
      candidate.start >= addDays(startOfDay(now), 1),
  );
  if (!booking) return;

  booking.status = 'cancelled';
  booking.cancelledBy = 'Beth C';
  booking.cancelledAt = new Date(now.getTime() - 2 * 3600 * 1000);
}

function participantIdsForShift(
  location: Location,
  random: () => number,
): string[] {
  if (location.serviceType !== 'centre') {
    return location.participants.map((person) => person.id);
  }

  const target = Math.min(
    location.participants.length - 1,
    Math.max(3, 3 + Math.floor(random() * 3)),
  );
  const pool = [...location.participants];
  const picked: string[] = [];
  while (picked.length < target && pool.length > 0) {
    const index = Math.floor(random() * pool.length);
    picked.push(pool.splice(index, 1)[0].id);
  }
  return picked;
}

function buildBookings(
  location: Location,
  locationIndex: number,
  roster: WorkerSeed[],
): Booking[] {
  const random = seededRandom(
    location.organisation === 'Cerebral Palsy Alliance'
      ? 4801 + stableHash(location.id)
      : 4801 + locationIndex * 977,
  );
  const today = startOfDay(new Date());
  const now = new Date();
  const bookings: Booking[] = [];
  const anchor = roster.find((worker) => worker.core);

  const firstOffset =
    location.organisation === 'Cerebral Palsy Alliance' ? -56 : -14;
  for (let offset = firstOffset; offset <= 27; offset += 1) {
    if (
      location.serviceType === 'home-community' &&
      location.organisation !== 'Cerebral Palsy Alliance' &&
      offset !== 0 &&
      random() < 0.4
    ) {
      continue;
    }

    const day = addDays(today, offset);
    const daytime = DAYTIME_SHIFTS[
      daytimeCountFor(location, locationIndex, offset, random)
    ];
    const bookingRoster =
      offset >= 0 && anchor
        ? roster.filter((worker) => worker.id !== anchor.id)
        : roster;
    const used = new Set<string>();
    const dayBookings: Booking[] = [];
    let slot = 0;

    for (const shift of daytime) {
      const worker = pickWorker(bookingRoster, used, random);
      used.add(worker.id);
      const start = at(day, shift.hour, shift.minutes);
      const end = new Date(start.getTime() + shift.hours * 3600 * 1000);

      dayBookings.push({
        id: `${location.id}-${offset}-${slot}`,
        locationId: location.id,
        workerId: worker.id,
        workerName: worker.name,
        start,
        end,
        status: statusFor(offset, end, now),
        sleepover: false,
        createdByMe: random() < 0.7,
        participantIds: participantIdsForShift(location, random),
      });
      slot += 1;
    }

    if (location.serviceType === 'sil') {
      const sleepoverWorker = pickWorker(bookingRoster, used, random);
      const sleepoverStart = at(day, 21, 0);
      const sleepoverEnd = at(addDays(day, 1), 7, 0);

      dayBookings.push({
        id: `${location.id}-${offset}-${slot}`,
        locationId: location.id,
        workerId: sleepoverWorker.id,
        workerName: sleepoverWorker.name,
        start: sleepoverStart,
        end: sleepoverEnd,
        status: statusFor(offset, sleepoverEnd, now),
        sleepover: true,
        createdByMe: random() < 0.7,
        participantIds: participantIdsForShift(location, random),
      });
    }

    bookings.push(...dayBookings);
  }

  if (
    anchor &&
    !bookings.some(
      (booking) => booking.status === 'ended' && booking.workerId === anchor.id,
    )
  ) {
    const completed = bookings.find((booking) => booking.status === 'ended');
    if (completed) {
      completed.workerId = anchor.id;
      completed.workerName = anchor.name;
    }
  }

  assignRequested(bookings, location, locationIndex, now);
  assignRequestOutreach(bookings, location, roster, now);
  assignCancellation(bookings, location, now);
  return bookings.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function invoicesForLocation(
  location: Location,
  locationIndex: number,
): Invoice[] {
  return [
    {
      id: `${location.id}-invoice-${locationIndex + 1}`,
      locationId: location.id,
      submittedAt: addDays(startOfDay(new Date()), -(1 + (locationIndex % 4))),
      approvalState:
        location.id === 'north-ryde-1' ? 'ready-for-approval' : 'approved',
    },
  ];
}

function buildLocationData(location: Location, locationIndex: number): LocationData {
  const roster = rosterFor(location.id);
  const bookings = buildBookings(location, locationIndex, roster);
  const today = startOfDay(new Date());

  const counts = new Map<string, number>();
  roster.forEach((worker) => counts.set(worker.id, 0));
  bookings.forEach((booking) => {
    counts.set(booking.workerId, (counts.get(booking.workerId) ?? 0) + 1);
  });

  const workers: Worker[] = roster
    .map((worker) => ({
      id: worker.id,
      name: worker.name,
      bookingCount: counts.get(worker.id) ?? 0,
      planConfirmed: worker.planConfirmed,
      supportPlanReviewDueAt: worker.supportPlanReviewDueAt,
      assessments: worker.assessments,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount || a.name.localeCompare(b.name));

  const endedRecently = bookings.filter(
    (booking) => booking.status === 'ended' && booking.start >= addDays(today, -7),
  );

  return {
    location,
    workers,
    bookings,
    requestsToAccept: bookings.filter((b) => b.status === 'requested' && b.start >= today).length,
    bookingsToApprove: endedRecently.slice(0, approvalsWaitingFor(location, locationIndex)).length,
    plansToReview: workers.filter((worker) => !worker.planConfirmed).length,
    unreadMessages: unreadMessagesFor(location, locationIndex),
    invoices: invoicesForLocation(location, locationIndex),
  };
}

const cache = new Map<string, LocationData>();

export function getLocationData(locationId: string): LocationData {
  const cached = cache.get(locationId);
  if (cached) return cached;

  const locationIndex = Math.max(
    0,
    LOCATIONS.findIndex((location) => location.id === locationId),
  );
  const data = buildLocationData(LOCATIONS[locationIndex], locationIndex);
  cache.set(locationId, data);
  return data;
}

export function pendingCountsForLocation(
  locationId: string,
  extraBookings: Booking[] = [],
) {
  const data = getLocationData(locationId);
  const today = startOfDay(new Date());
  const extras = Array.isArray(extraBookings) ? extraBookings : [];
  const extraRequests = extras.filter(
    (booking) =>
      booking.locationId === locationId &&
      booking.status === 'requested' &&
      booking.start >= today,
  ).length;
  return {
    requests: data.requestsToAccept + extraRequests,
    approvals: data.bookingsToApprove,
    messages: data.unreadMessages,
  };
}

export function pendingCountsForGrouping(
  grouping: Grouping,
  extraBookings: Booking[] = [],
) {
  return descendantLocationIds(grouping)
    .map((locationId) => pendingCountsForLocation(locationId, extraBookings))
    .reduce(
      (total, counts) => ({
        requests: total.requests + counts.requests,
        approvals: total.approvals + counts.approvals,
        messages: total.messages + counts.messages,
      }),
      { requests: 0, approvals: 0, messages: 0 },
    );
}

export function locationBookings(
  locationId: string,
  extraBookings: Booking[] = [],
): Booking[] {
  const extras = extraBookings.filter(
    (booking) => booking.locationId === locationId,
  );
  return [...extras, ...getLocationData(locationId).bookings];
}

export function waitingRequestsForLocation(
  locationId: string,
  extraBookings: Booking[] = [],
  now = new Date(),
): Booking[] {
  const today = startOfDay(now);
  return locationBookings(locationId, extraBookings).filter(
    (booking) => booking.status === 'requested' && booking.start >= today,
  );
}

export function futureCancelledBookings(
  locationId: string,
  extraBookings: Booking[] = [],
  now = new Date(),
): Booking[] {
  return locationBookings(locationId, extraBookings).filter(
    (booking) => booking.status === 'cancelled' && booking.start > now,
  );
}

export function locationHasWaitingWork(
  locationId: string,
  extraBookings: Booking[] = [],
  now = new Date(),
): boolean {
  const counts = pendingCountsForLocation(locationId, extraBookings);
  if (counts.requests > 0 || counts.approvals > 0 || counts.messages > 0) {
    return true;
  }
  return futureCancelledBookings(locationId, extraBookings, now).length > 0;
}

export function groupingHasWaitingWork(
  grouping: Grouping,
  extraBookings: Booking[] = [],
  now = new Date(),
): boolean {
  return descendantLocationIds(grouping).some((locationId) =>
    locationHasWaitingWork(locationId, extraBookings, now),
  );
}

export function waitingDashboardChildren(
  grouping: Grouping,
  extraBookings: Booking[] = [],
  now = new Date(),
) {
  const children = groupingDashboardChildren(grouping);
  return {
    groupings: children.groupings.filter((child) =>
      groupingHasWaitingWork(child, extraBookings, now),
    ),
    housesAndCentres: children.housesAndCentres.filter((location) =>
      locationHasWaitingWork(location.id, extraBookings, now),
    ),
    clients: children.clients.filter((location) =>
      locationHasWaitingWork(location.id, extraBookings, now),
    ),
  };
}

function requestIsUnacted(booking: Booking): boolean {
  const declined = booking.declinedWorkerNames?.length ?? 0;
  return declined === 0;
}

export function comparePressingBookings(first: Booking, second: Booking): number {
  const firstUnacted = requestIsUnacted(first);
  const secondUnacted = requestIsUnacted(second);
  if (firstUnacted !== secondUnacted) return firstUnacted ? -1 : 1;
  const startDiff = first.start.getTime() - second.start.getTime();
  if (startDiff !== 0) return startDiff;
  return (first.requestedAt?.getTime() ?? 0) - (second.requestedAt?.getTime() ?? 0);
}

export function mostPressingWaitingBooking(
  locationId: string,
  extraBookings: Booking[] = [],
  now = new Date(),
): Booking | undefined {
  const requests = waitingRequestsForLocation(locationId, extraBookings, now);
  if (requests.length > 0) {
    return [...requests].sort(comparePressingBookings)[0];
  }
  return futureCancelledBookings(locationId, extraBookings, now)[0];
}

export function waitingShiftsForLocation(
  locationId: string,
  extraBookings: Booking[] = [],
  now = new Date(),
): Booking[] {
  return [
    ...waitingRequestsForLocation(locationId, extraBookings, now),
    ...futureCancelledBookings(locationId, extraBookings, now),
  ].sort((first, second) => first.start.getTime() - second.start.getTime());
}

export const GROUPING_DASHBOARD_WORKER_WEEKS = 8;

type DashboardRecencyStamp = {
  workerId: string;
  dayOffset: number;
};

/**
 * Most recent completed shift per worker within each grouping's locations.
 * Day offsets are from today; booking dates are rewritten after generation so
 * the evidence line stays derived from real ended bookings.
 */
const GROUPING_DASHBOARD_RECENCY: Record<string, DashboardRecencyStamp[]> = {
  'northern-sydney': [
    { workerId: 'farah-t', dayOffset: 0 },
    { workerId: 'joel-v', dayOffset: 0 },
    { workerId: 'john-m', dayOffset: -1 },
    { workerId: 'sally-m', dayOffset: -3 },
    { workerId: 'geoffrey-l', dayOffset: -6 },
    { workerId: 'scarlett-o', dayOffset: -14 },
    { workerId: 'eleni-p', dayOffset: -21 },
    { workerId: 'han-hendrick-p', dayOffset: -49 },
    { workerId: 'erica-o', dayOffset: -2 },
    { workerId: 'charlies-k', dayOffset: -4 },
  ],
  illawarra: [
    { workerId: 'ira-j', dayOffset: 0 },
    { workerId: 'ginger-n', dayOffset: -1 },
    { workerId: 'geoffrey-l', dayOffset: -3 },
    { workerId: 'charlies-k', dayOffset: -5 },
    { workerId: 'brian-r', dayOffset: -10 },
    { workerId: 'mandii-z', dayOffset: -14 },
    { workerId: 'scarlett-o', dayOffset: -21 },
    { workerId: 'han-hendrick-p', dayOffset: -49 },
  ],
  hunter: [
    { workerId: 'kim-r', dayOffset: 0 },
    { workerId: 'luke-a', dayOffset: 0 },
    { workerId: 'pete-c', dayOffset: -1 },
    { workerId: 'geoffrey-l', dayOffset: -3 },
    { workerId: 'han-hendrick-p', dayOffset: -6 },
    { workerId: 'charlies-k', dayOffset: -14 },
    { workerId: 'ira-j', dayOffset: -21 },
    { workerId: 'john-m', dayOffset: -49 },
  ],
};

/** One worker per grouping sits just outside the eight-week window. */
const GROUPING_DASHBOARD_OUTSIDE_WINDOW: Record<string, string[]> = {
  'northern-sydney': ['maxine-r'],
  illawarra: ['luke-a'],
  hunter: ['erica-o'],
};

let dashboardRecencyApplied = false;

function ensureAllLocationsLoaded(): void {
  for (const location of LOCATIONS) {
    getLocationData(location.id);
  }
}

function retargetBookingDay(booking: Booking, dayOffset: number, now: Date): void {
  const newStart = at(addDays(startOfDay(now), dayOffset), 7, 0);
  const duration = booking.end.getTime() - booking.start.getTime();
  booking.start = newStart;
  booking.end = new Date(newStart.getTime() + duration);
}

function endedBookingsForWorker(
  workerId: string,
  locationIds: readonly string[],
): Booking[] {
  const bookings: Booking[] = [];
  for (const locationId of locationIds) {
    for (const booking of getLocationData(locationId).bookings) {
      if (booking.workerId === workerId && booking.status === 'ended') {
        bookings.push(booking);
      }
    }
  }
  return bookings.sort((first, second) => second.start.getTime() - first.start.getTime());
}

/** Keep lastWorkedAt on the stamp while preserving in-window shift counts. */
function stampWorkerRecency(
  workerId: string,
  locationIds: readonly string[],
  dayOffset: number,
  now: Date,
): void {
  const bookings = endedBookingsForWorker(workerId, locationIds);
  if (bookings.length === 0) return;

  retargetBookingDay(bookings[0], dayOffset, now);
  for (let index = 1; index < bookings.length; index += 1) {
    retargetBookingDay(bookings[index], dayOffset - index, now);
  }
}

function applyDashboardRecencyStamps(now = new Date()): void {
  if (dashboardRecencyApplied) return;
  ensureAllLocationsLoaded();

  const today = startOfDay(now);
  const windowStart = addDays(today, -GROUPING_DASHBOARD_WORKER_WEEKS * 7);
  const outsideOffset = -(GROUPING_DASHBOARD_WORKER_WEEKS * 7 + 5);
  const silRegionIds = new Set(
    findGrouping('cpa-sil')?.groupingIds ?? [],
  );

  for (const grouping of GROUPINGS) {
    const locationIds = descendantLocationIds(grouping);
    if (locationIds.length === 0) continue;

    if (silRegionIds.has(grouping.id)) {
      const regionalWorkers = WORKER_SEEDS.filter((worker) =>
        locationIds.some((locationId) => worker.sites.has(locationId)),
      );
      [0, -1, -3, -7, -14, -21, -35, -49].forEach((dayOffset, index) => {
        const worker = regionalWorkers[index];
        if (worker) stampWorkerRecency(worker.id, locationIds, dayOffset, now);
      });
    }

    for (const workerId of GROUPING_DASHBOARD_OUTSIDE_WINDOW[grouping.id] ?? []) {
      for (const locationId of locationIds) {
        for (const booking of getLocationData(locationId).bookings) {
          if (booking.workerId !== workerId || booking.status !== 'ended') continue;
          if (booking.start >= windowStart) {
            retargetBookingDay(booking, outsideOffset, now);
          }
        }
      }
    }

    for (const stamp of GROUPING_DASHBOARD_RECENCY[grouping.id] ?? []) {
      stampWorkerRecency(stamp.workerId, locationIds, stamp.dayOffset, now);
    }
  }

  dashboardRecencyApplied = true;
}
export const GROUPING_ATTENTION_GRID_LOCATION_THRESHOLD = 20;

export type AttentionBooking = Booking & {
  locationName: string;
};

export function directLocationCount(grouping: Grouping): number {
  const { housesAndCentres, clients } = groupingDashboardChildren(grouping);
  return housesAndCentres.length + clients.length;
}

export function groupingAttentionBookings(
  groupingId = GROUPING.id,
  extraBookings: Booking[] = [],
  now = new Date(),
): AttentionBooking[] {
  const grouping = findGrouping(groupingId) ?? GROUPING;
  const bookings: AttentionBooking[] = [];

  for (const locationId of descendantLocationIds(grouping)) {
    const location = findLocation(locationId);
    if (!location) continue;
    for (const booking of waitingShiftsForLocation(
      locationId,
      extraBookings,
      now,
    )) {
      bookings.push({ ...booking, locationName: location.name });
    }
  }

  return bookings.sort(comparePressingBookings);
}

function completedShiftsInWindow(
  locationId: string,
  workerId: string,
  from: Date,
  until: Date,
): Booking[] {
  return getLocationData(locationId).bookings.filter(
    (booking) =>
      booking.workerId === workerId &&
      booking.status === 'ended' &&
      booking.start >= from &&
      booking.start < until,
  );
}

export function groupingDashboardWorkers(
  groupingId = GROUPING.id,
  now = new Date(),
): ProviderWorkerSummary[] {
  applyDashboardRecencyStamps(now);
  const grouping = findGrouping(groupingId) ?? GROUPING;
  const today = startOfDay(now);
  const from = addDays(today, -GROUPING_DASHBOARD_WORKER_WEEKS * 7);
  const until = addDays(today, 1);

  return WORKER_SEEDS.map((seed) => {
    const locations = descendantLocationIds(grouping)
      .map(findLocation)
      .flatMap((location) => {
        if (!location) return [];
        const shifts = completedShiftsInWindow(
          location.id,
          seed.id,
          from,
          until,
        );
        if (shifts.length === 0) return [];
        return [
          {
            locationId: location.id,
            locationName: location.name,
            bookingCount: shifts.length,
          },
        ];
      });

    const shiftCount = locations.reduce(
      (sum, location) => sum + location.bookingCount,
      0,
    );
    let totalHours = 0;
    let lastWorkedAt: Date | undefined;
    let lastWorkedLocationId: string | undefined;
    for (const locationId of descendantLocationIds(grouping)) {
      for (const booking of completedShiftsInWindow(
        locationId,
        seed.id,
        from,
        until,
      )) {
        totalHours += (booking.end.getTime() - booking.start.getTime()) / 36e5;
        if (!lastWorkedAt || booking.start > lastWorkedAt) {
          lastWorkedAt = booking.start;
          lastWorkedLocationId = locationId;
        }
      }
    }

    return {
      id: seed.id,
      name: seed.name,
      planConfirmed: seed.planConfirmed,
      shiftCount,
      totalHours: Math.round(totalHours),
      lastWorkedAt,
      lastWorkedLocationId,
      assessments: seed.assessments,
      locations,
    };
  })
    .filter((worker) => worker.shiftCount > 0)
    .sort(
      (first, second) =>
        (second.lastWorkedAt?.getTime() ?? 0) -
          (first.lastWorkedAt?.getTime() ?? 0) ||
        second.shiftCount - first.shiftCount ||
        first.name.localeCompare(second.name),
    );
}

export function compareWaitingLocationRows(
  firstId: string,
  secondId: string,
  extraBookings: Booking[] = [],
  now = new Date(),
): number {
  const first = mostPressingWaitingBooking(firstId, extraBookings, now);
  const second = mostPressingWaitingBooking(secondId, extraBookings, now);
  if (first && second) return comparePressingBookings(first, second);
  if (first) return -1;
  if (second) return 1;
  return 0;
}

export function compareSoonestShiftRows(
  firstId: string,
  secondId: string,
  extraBookings: Booking[] = [],
  now = new Date(),
): number {
  const first = mostPressingWaitingBooking(firstId, extraBookings, now);
  const second = mostPressingWaitingBooking(secondId, extraBookings, now);
  if (first && second) {
    const startDiff = first.start.getTime() - second.start.getTime();
    if (startDiff !== 0) return startDiff;
  } else if (first) {
    return -1;
  } else if (second) {
    return 1;
  }
  const firstName = findLocation(firstId)?.name ?? firstId;
  const secondName = findLocation(secondId)?.name ?? secondId;
  return firstName.localeCompare(secondName);
}

export function compareRequestUrgency(
  a: { start: Date; requestedAt: Date },
  b: { start: Date; requestedAt: Date },
): number {
  const startDiff = a.start.getTime() - b.start.getTime();
  if (startDiff !== 0) return startDiff;
  return a.requestedAt.getTime() - b.requestedAt.getTime();
}

export function groupingOpenRequests(
  groupingId = GROUPING.id,
): GroupingRequestSummary[] {
  const today = startOfDay(new Date());
  const requests: GroupingRequestSummary[] = [];
  const grouping = findGrouping(groupingId) ?? GROUPING;

  for (const location of descendantLocationIds(grouping).map(findLocation)) {
    if (!location) continue;
    for (const booking of getLocationData(location.id).bookings) {
      if (booking.status !== 'requested' || booking.start < today || !booking.requestedAt) {
        continue;
      }
      requests.push({
        id: booking.id,
        locationId: location.id,
        locationName: location.name,
        start: booking.start,
        requestedAt: booking.requestedAt,
      });
    }
  }

  return requests.sort(compareRequestUrgency);
}

export function groupingUsageLast7Days(
  groupingId = GROUPING.id,
): GroupingUsage {
  const today = startOfDay(new Date());
  const from = addDays(today, -6);
  const until = addDays(today, 1);
  const grouping = findGrouping(groupingId) ?? GROUPING;

  const locations = descendantLocationIds(grouping)
    .map(findLocation)
    .filter((location) => location !== null)
    .map((location) => ({
      locationId: location.id,
      locationName: location.name,
      bookingCount: getLocationData(location.id).bookings.filter(
        (booking) => booking.start >= from && booking.start < until,
      ).length,
    }));

  return {
    total: locations.reduce((sum, item) => sum + item.bookingCount, 0),
    locations,
  };
}

/** A worker id can belong to a location other than the one currently selected. */
export function findWorker(
  workerId: string | null,
  organisation?: Organisation,
): { worker: Worker; location: Location; index: number } | null {
  if (!workerId) return null;

  for (const location of LOCATIONS.filter(
    (item) => !organisation || item.organisation === organisation,
  )) {
    const data = getLocationData(location.id);
    const index = data.workers.findIndex((worker) => worker.id === workerId);
    if (index >= 0) return { worker: data.workers[index], location, index };
  }

  return null;
}

export function findLocation(locationId: string | null): Location | null {
  if (!locationId) return null;
  return LOCATIONS.find((location) => location.id === locationId) ?? null;
}

export function findLocationForOrganisation(
  locationId: string | null,
  organisation: Organisation,
): Location | null {
  const location = findLocation(locationId);
  return location?.organisation === organisation ? location : null;
}

export function findGrouping(groupingId: string | null): Grouping | null {
  if (!groupingId) return null;
  return GROUPINGS.find((grouping) => grouping.id === groupingId) ?? null;
}

export function rootGroupingsForOrganisation(
  organisation: Organisation,
): Grouping[] {
  const childIds = new Set(
    GROUPINGS.flatMap((grouping) => grouping.groupingIds ?? []),
  );
  return GROUPINGS.filter(
    (grouping) =>
      grouping.organisation === organisation && !childIds.has(grouping.id),
  );
}

/** Unique locations beneath a grouping, including locations in child groupings. */
export function descendantLocationIds(grouping: Grouping): string[] {
  const locationIds: string[] = [];
  const seenLocations = new Set<string>();
  const seenGroupings = new Set<string>();

  const visit = (current: Grouping) => {
    if (seenGroupings.has(current.id)) return;
    seenGroupings.add(current.id);
    for (const locationId of current.locationIds) {
      if (seenLocations.has(locationId)) continue;
      seenLocations.add(locationId);
      locationIds.push(locationId);
    }
    for (const childId of current.groupingIds ?? []) {
      const child = findGrouping(childId);
      if (child) visit(child);
    }
  };

  visit(grouping);
  return locationIds;
}

export function childGroupings(grouping: Grouping): Grouping[] {
  return (grouping.groupingIds ?? [])
    .map(findGrouping)
    .filter((child): child is Grouping => child !== null);
}

type GroupingKind = NonNullable<Grouping['kind']>;

const GROUPING_KIND_TITLES: Record<GroupingKind, string> = {
  arm: 'Arms',
  area: 'Areas',
  caseload: 'Caseloads',
  lifestyles: 'Lifestyles',
  region: 'Regions',
  service: 'Services',
};

export function childGroupingSectionTitle(groupings: Grouping[]): string {
  if (groupings.length === 0) return 'Groupings';
  const kind = groupings[0].kind;
  return kind && groupings.every((grouping) => grouping.kind === kind)
    ? GROUPING_KIND_TITLES[kind]
    : 'Groupings';
}

/** Child-list tab and single-section page title — never "Supportables". */
export function groupingChildListTabLabel(grouping: Grouping): string {
  const { groupings, housesAndCentres, clients } =
    groupingDashboardChildren(grouping);
  if (groupings.length > 0) {
    return 'Groupings';
  }
  return groupingDirectLocationListLabel(housesAndCentres, clients);
}

function housesAndCentresPhrase(locations: Location[], counted: boolean): string | null {
  if (locations.length === 0) return null;
  const count = locations.length;
  const allHouses = locations.every((location) => location.serviceType === 'sil');
  const allCentres = locations.every((location) => location.serviceType === 'centre');
  if (allHouses) {
    return counted ? `${count} ${count === 1 ? 'house' : 'houses'}` : 'houses';
  }
  if (allCentres) {
    return counted ? `${count} ${count === 1 ? 'centre' : 'centres'}` : 'centres';
  }
  return counted ? `${count} houses and centres` : 'houses and centres';
}

function clientsPhrase(count: number, counted: boolean): string | null {
  if (count === 0) return null;
  if (!counted) return 'clients';
  return `${count} ${count === 1 ? 'client' : 'clients'}`;
}

function joinHoldings(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/** What sits beneath a grouping: each location kind that is present. */
export function groupingContentsSummary(grouping: Grouping): string {
  const locations = descendantLocationIds(grouping)
    .map(findLocation)
    .filter((location): location is Location => location !== null);
  return childCountLine({
    houses: locations.filter((location) => location.serviceType === 'sil').length,
    centres: locations.filter((location) => location.serviceType === 'centre')
      .length,
    clients: locations.filter(
      (location) => location.serviceType === 'home-community',
    ).length,
  });
}

function housesAndCentresChildCount(housesAndCentres: Location[]) {
  return childCountLine({
    houses: housesAndCentres.filter((location) => location.serviceType === 'sil')
      .length,
    centres: housesAndCentres.filter(
      (location) => location.serviceType === 'centre',
    ).length,
    clients: 0,
  });
}

/** Direct SIL houses and centres at this node, for the Overview supporting line. */
export function groupingHousesAndCentresCountLine(grouping: Grouping): string {
  const { housesAndCentres } = groupingDashboardChildren(grouping);
  const summary = housesAndCentresChildCount(housesAndCentres);
  return summary ? `${summary} in ${grouping.name}` : '';
}

/** Direct home and community clients at this node, for the Overview supporting line. */
export function groupingClientsCountLine(grouping: Grouping): string {
  const { clients } = groupingDashboardChildren(grouping);
  const summary = childCountLine({
    houses: 0,
    centres: 0,
    clients: clients.length,
  });
  return summary ? `${summary} in ${grouping.name}` : '';
}

/** Direct supportables at this node — all location kinds combined. */
export function groupingDirectChildrenCountLine(grouping: Grouping): string {
  const { housesAndCentres, clients } = groupingDashboardChildren(grouping);
  const summary = childCountLine({
    houses: housesAndCentres.filter((location) => location.serviceType === 'sil')
      .length,
    centres: housesAndCentres.filter(
      (location) => location.serviceType === 'centre',
    ).length,
    clients: clients.length,
  });
  return `${summary} in ${grouping.name}`;
}

/** Page description keyed to the node's direct children, never "children" or "nodes". */
export function groupingDashboardDescription(grouping: Grouping): string {
  const { groupings, housesAndCentres, clients } =
    groupingDashboardChildren(grouping);
  if (groupings.length > 0) {
    return `The ${childGroupingSectionTitle(groupings).toLowerCase()} in ${grouping.name}`;
  }
  const held = joinHoldings(
    [
      housesAndCentresPhrase(housesAndCentres, false),
      clientsPhrase(clients.length, false),
    ].filter((part): part is string => part !== null),
  );
  return `The ${held} in ${grouping.name}`;
}

/** The current grouping and any grouping ancestors, ordered root first. */
export function groupingPath(grouping: Grouping): Grouping[] {
  const path: Grouping[] = [];
  const seen = new Set<string>();
  let current: Grouping | undefined = grouping;

  while (current && !seen.has(current.id)) {
    path.unshift(current);
    seen.add(current.id);
    current = GROUPINGS.find(
      (candidate) =>
        candidate.organisation === grouping.organisation &&
        candidate.groupingIds?.includes(current!.id),
    );
  }

  return path;
}

/**
 * Every chain of groupings leading from a grouping down to a location, the
 * grouping itself excluded. A location can sit under more than one parent, so
 * this can return more than one chain.
 */
function descentChains(
  grouping: Grouping,
  locationId: string,
  visited: ReadonlySet<string> = new Set<string>(),
): Grouping[][] {
  if (visited.has(grouping.id)) return [];
  const seen = new Set(visited).add(grouping.id);
  const chains: Grouping[][] = grouping.locationIds.includes(locationId) ? [[]] : [];

  childGroupings(grouping).forEach((child) => {
    descentChains(child, locationId, seen).forEach((chain) => {
      chains.push([child, ...chain]);
    });
  });

  return chains;
}

/** The chain the person came down, preferring the branch holding their entry node. */
function descentFrom(
  grouping: Grouping,
  locationId: string,
  entryGroupingId?: string | null,
): Grouping[] | null {
  const chains = descentChains(grouping, locationId);
  if (chains.length === 0) return null;
  const entered = entryGroupingId
    ? chains.find((chain) => chain.some((segment) => segment.id === entryGroupingId))
    : undefined;
  return entered ?? chains.reduce((shortest, chain) =>
    chain.length < shortest.length ? chain : shortest,
  );
}

/**
 * The groupings a breadcrumb renders, root first. This is the path the person
 * travelled: the ancestors of the node they are standing on, then every
 * grouping between that node and the location they opened. A location can have
 * more than one parent, so the path is never rediscovered from its parent list.
 */
export function breadcrumbTrail({
  grouping,
  location,
  entryGroupingId,
}: {
  grouping: Grouping;
  location?: Location | null;
  entryGroupingId?: string | null;
}): Grouping[] {
  if (!location) return groupingPath(grouping);

  const descent = descentFrom(grouping, location.id, entryGroupingId);
  if (descent) return [...groupingPath(grouping), ...descent];

  const entry = entryGroupingId ? findGrouping(entryGroupingId) : null;
  const fromEntry = entry ? descentFrom(entry, location.id, entryGroupingId) : null;
  if (entry && fromEntry) return [...groupingPath(entry), ...fromEntry];

  const parent = directParentGroupings(location.id, location.organisation)[0];
  return parent ? groupingPath(parent) : groupingPath(grouping);
}

function directParentGroupings(
  locationId: string,
  organisation: Organisation,
): Grouping[] {
  return GROUPINGS.filter(
    (grouping) =>
      grouping.organisation === organisation && grouping.locationIds.includes(locationId),
  );
}

/**
 * The grouping a location should open under: the node the link came from, then
 * the node the person is standing on, then their entry node, then the
 * location's first direct parent. Never an arm they did not travel through.
 */
export function parentGroupingForLocation(
  locationId: string,
  {
    preferredGroupingId,
    currentGroupingId,
    entryGroupingId,
    organisation,
  }: {
    preferredGroupingId?: string | null;
    currentGroupingId?: string | null;
    entryGroupingId?: string | null;
    organisation: Organisation;
  },
): string | null {
  const holding = [preferredGroupingId, currentGroupingId, entryGroupingId].find(
    (groupingId) => {
      const grouping = groupingId ? findGrouping(groupingId) : null;
      return (
        grouping !== null &&
        grouping.organisation === organisation &&
        descendantLocationIds(grouping).includes(locationId)
      );
    },
  );
  if (holding) return holding;

  const parents = directParentGroupings(locationId, organisation);
  const entry = entryGroupingId ? findGrouping(entryGroupingId) : null;
  const entryArm = entry ? groupingPath(entry)[0]?.id : undefined;
  const inEntryArm = entryArm
    ? parents.find((parent) => groupingPath(parent)[0]?.id === entryArm)
    : undefined;

  return (inEntryArm ?? parents[0])?.id ?? null;
}

/** Direct location children: houses and centres first, then clients. */
export function partitionGroupingLocations(grouping: Grouping): {
  housesAndCentres: Location[];
  clients: Location[];
} {
  const locations = grouping.locationIds
    .map(findLocation)
    .filter((location): location is Location => location !== null);
  return {
    housesAndCentres: locations.filter((location) => location.serviceType !== 'home-community'),
    clients: locations.filter((location) => location.serviceType === 'home-community'),
  };
}

/** Direct children only. Counts for a grouping child may still resolve recursively. */
export function groupingDashboardChildren(grouping: Grouping): {
  groupings: Grouping[];
  housesAndCentres: Location[];
  clients: Location[];
} {
  return {
    groupings: childGroupings(grouping),
    ...partitionGroupingLocations(grouping),
  };
}

export function bookingParticipants(
  booking: Booking,
  location: Location | null = findLocation(booking.locationId),
): Participant[] {
  if (!location) return [];
  return location.participants.filter((person) =>
    booking.participantIds.includes(person.id),
  );
}

export function bookingParticipantSummary(
  booking: Booking,
  location: Location,
): string | null {
  if (location.serviceType === 'sil') return null;
  const covered = bookingParticipants(booking, location);
  if (covered.length === 0) return null;
  if (location.serviceType === 'home-community') return covered[0].name;
  if (covered.length === 1) return covered[0].name;
  return `${covered.length} attending`;
}

export function defaultParticipantIds(location: Location): string[] {
  if (location.serviceType === 'centre') return [];
  return location.participants.map((person) => person.id);
}

export function groupingsForLocation(locationId: string): Grouping[] {
  return GROUPINGS.filter((grouping) =>
    descendantLocationIds(grouping).includes(locationId),
  );
}

export function locationsForOrganisation(
  organisation: Organisation,
): Location[] {
  return LOCATIONS.filter((location) => location.organisation === organisation);
}

export function searchOrganisation(
  query: string,
  organisation: Organisation,
): OrganisationSearchResults {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return { supportables: [], clients: [], workers: [], groupings: [] };
  }

  const locations = locationsForOrganisation(organisation);
  const matches = (value: string) =>
    value.toLowerCase().includes(normalizedQuery);
  const byName = <Item extends { name: string }>(a: Item, b: Item) =>
    a.name.localeCompare(b.name);

  const providerWorkers = new Map<string, OrganisationSearchWorker>();
  for (const location of locations) {
    for (const worker of getLocationData(location.id).workers) {
      if (providerWorkers.has(worker.id)) continue;
      providerWorkers.set(worker.id, {
        id: worker.id,
        name: worker.name,
        organisation,
        totalHours: providerHoursForWorker(worker.id, organisation),
        locationId: location.id,
      });
    }
  }

  return {
    supportables: locations
      .filter(
        (location) =>
          location.serviceType !== 'home-community' &&
          (matches(location.name) || matches(location.suburb)),
      )
      .sort(byName),
    clients: locations
      .filter(
        (location) =>
          location.serviceType === 'home-community' && matches(location.name),
      )
      .sort(byName),
    workers: [...providerWorkers.values()]
      .filter((worker) => matches(worker.name))
      .sort(byName),
    groupings: GROUPINGS.filter(
      (grouping) =>
        grouping.organisation === organisation && matches(grouping.name),
    ).sort(byName),
  };
}

export function locationHistoryForWorker(
  workerId: string,
  organisation?: Organisation,
): WorkerLocationHistory[] {
  const history: WorkerLocationHistory[] = [];
  for (const location of LOCATIONS.filter(
    (item) => !organisation || item.organisation === organisation,
  )) {
    const data = getLocationData(location.id);
    const worker = data.workers.find((item) => item.id === workerId);
    if (!worker) continue;
    history.push({
      locationId: location.id,
      locationName: location.name,
      bookingCount: worker.bookingCount,
    });
  }
  return history;
}

export function providerHoursForWorker(
  workerId: string,
  organisation: Organisation,
): number {
  return LOCATIONS
    .filter((location) => location.organisation === organisation)
    .flatMap((location) => getLocationData(location.id).bookings)
    .filter(
      (booking) => booking.workerId === workerId && booking.status === 'ended',
    )
    .reduce(
      (hours, booking) =>
        hours + (booking.end.getTime() - booking.start.getTime()) / 36e5,
      0,
    );
}

export function nearbyWorkers(): NearbyWorker[] {
  return NEARBY_WORKERS.map((worker) => ({
    ...worker,
    assessments: { ...worker.assessments },
  }));
}

export function groupingWorkers(
  groupingId = GROUPING.id,
): ProviderWorkerSummary[] {
  const grouping = findGrouping(groupingId) ?? GROUPING;
  return WORKER_SEEDS.map((seed) => {
    const locations = descendantLocationIds(grouping).map(findLocation).flatMap((location) => {
      if (!location) return [];
      const shiftCount = getLocationData(location.id).bookings.filter(
        (booking) => booking.workerId === seed.id && booking.status === 'ended',
      ).length;
      return [{
        locationId: location.id,
        locationName: location.name,
        bookingCount: shiftCount,
      }];
    }).filter((location) => location.bookingCount > 0);

    return {
      id: seed.id,
      name: seed.name,
      planConfirmed: seed.planConfirmed,
      shiftCount: locations.reduce((sum, location) => sum + location.bookingCount, 0),
      totalHours: providerHoursForWorker(seed.id, grouping.organisation),
      assessments: seed.assessments,
      locations,
    };
  })
    .filter((worker) => worker.shiftCount > 0)
    .sort(
      (a, b) =>
        b.shiftCount - a.shiftCount ||
        b.locations.length - a.locations.length ||
        a.name.localeCompare(b.name),
    );
}

export function locationWorkerTiers(
  locationId: string,
  groupingId = groupingsForLocation(locationId)[0]?.id ?? GROUPING.id,
): {
  knownHere: Worker[];
  workedElsewhere: ProviderWorkerSummary[];
  nearby: NearbyWorker[];
} {
  const data = getLocationData(locationId);
  const completedShifts = new Map<string, number>();
  for (const booking of data.bookings) {
    if (booking.status !== 'ended') continue;
    completedShifts.set(
      booking.workerId,
      (completedShifts.get(booking.workerId) ?? 0) + 1,
    );
  }
  const knownHere = [...data.workers].sort(
    (a, b) =>
      (completedShifts.get(b.id) ?? 0) -
        (completedShifts.get(a.id) ?? 0) ||
      a.name.localeCompare(b.name),
  );
  const knownIds = new Set(knownHere.map((worker) => worker.id));

  return {
    knownHere,
    workedElsewhere: groupingWorkers(groupingId).filter(
      (worker) => !knownIds.has(worker.id),
    ),
    nearby: nearbyWorkers(),
  };
}

function windowsOverlap(
  first: { start: Date; end: Date },
  second: { start: Date; end: Date },
): boolean {
  return first.start < second.end && first.end > second.start;
}

/**
 * Placeholder availability for the request flow. Provider-history workers have
 * all marked 2–5am unavailable so research sessions can reliably reach the
 * nearby fallback. At other times, a confirmed Hireup booking makes a worker
 * unavailable; requested and ended bookings do not.
 */
function providerWorkerIsAvailable(
  workerId: string,
  start: Date,
  end: Date,
): boolean {
  const gapStart = startOfDay(start);
  gapStart.setHours(2);
  const gapEnd = startOfDay(start);
  gapEnd.setHours(5);
  if (windowsOverlap({ start, end }, { start: gapStart, end: gapEnd })) {
    return false;
  }

  return !bookingsForWorker(workerId).some(
    (booking) =>
      booking.status === 'confirmed' &&
      windowsOverlap({ start, end }, booking),
  );
}

export function requestWorkerTiers(
  locationId: string,
  start: Date,
  end: Date,
  groupingId = groupingsForLocation(locationId)[0]?.id ?? GROUPING.id,
): {
  knownHere: Worker[];
  workedElsewhere: ProviderWorkerSummary[];
  nearby: NearbyWorker[];
} {
  if (end <= start) {
    return { knownHere: [], workedElsewhere: [], nearby: [] };
  }

  const tiers = locationWorkerTiers(locationId, groupingId);
  return {
    knownHere: tiers.knownHere.filter((worker) =>
      providerWorkerIsAvailable(worker.id, start, end),
    ),
    workedElsewhere: tiers.workedElsewhere.filter((worker) =>
      providerWorkerIsAvailable(worker.id, start, end),
    ),
    nearby: tiers.nearby,
  };
}

export function bookingsForWorker(
  workerId: string,
  window?: { start: Date; end: Date },
): Booking[] {
  const bookings: Booking[] = [];
  for (const location of LOCATIONS) {
    for (const booking of getLocationData(location.id).bookings) {
      if (booking.workerId !== workerId) continue;
      if (window && (booking.start < window.start || booking.start >= window.end)) continue;
      bookings.push(booking);
    }
  }
  return bookings.sort((a, b) => a.start.getTime() - b.start.getTime());
}

const INADEQUATE_REST_HOURS = 8;

function privatePlatformCalendar(): Booking[] {
  const entries: Booking[] = [];
  const addPrivatePriorBooking = (
    id: string,
    workerId: string,
    targetStart: Date,
    restHours: number,
  ) => {
    const end = new Date(targetStart.getTime() - restHours * 36e5);
    entries.push({
      id,
      locationId: 'private-platform-calendar',
      workerId,
      workerName: '',
      start: new Date(end.getTime() - 6 * 36e5),
      end,
      status: 'confirmed',
      sleepover: false,
      createdByMe: false,
      participantIds: [],
    });
  };

  /* A confirmed Galston booking is the card/detail demonstration. */
  const bookingTarget = getLocationData('galston-1').bookings.find(
    (booking) => booking.id === 'galston-1-1-0',
  );
  if (bookingTarget) {
    addPrivatePriorBooking(
      'private-card-fatigue',
      bookingTarget.workerId,
      bookingTarget.start,
      4,
    );
  }

  /* Dee Why tomorrow at midday is the worker-selection demonstration. */
  const selectionStart = addDays(startOfDay(new Date()), 1);
  selectionStart.setHours(12);
  const selectionEnd = new Date(selectionStart.getTime() + 2 * 36e5);
  const selectionTiers = requestWorkerTiers(
    'dee-why-1',
    selectionStart,
    selectionEnd,
  );
  const selectionWorker =
    selectionTiers.knownHere[0] ?? selectionTiers.workedElsewhere[0];
  if (selectionWorker) {
    addPrivatePriorBooking(
      'private-selection-fatigue',
      selectionWorker.id,
      selectionStart,
      4,
    );
  }

  return entries;
}

export function fatigueSignalForWorker(
  workerId: string,
  shiftStart: Date,
  options: {
    excludeBookingId?: string;
    additionalBookings?: Booking[];
  } = {},
): FatigueSignal {
  const calendar = [
    ...bookingsForWorker(workerId),
    ...privatePlatformCalendar(),
    ...(options.additionalBookings ?? []),
  ];
  const previous = calendar
    .filter(
      (booking) =>
        booking.workerId === workerId &&
        booking.id !== options.excludeBookingId &&
        booking.status !== 'requested' &&
        booking.start < shiftStart,
    )
    .sort((a, b) => b.end.getTime() - a.end.getTime())[0];

  if (!previous) return null;

  const restMilliseconds = shiftStart.getTime() - previous.end.getTime();
  if (restMilliseconds <= 0) return 'no-break';
  if (restMilliseconds < INADEQUATE_REST_HOURS * 36e5) return 'short-rest';
  return null;
}

/**
 * Rest is only worth stating while the shift can still change. An ended shift,
 * or one that has already begun, leaves the manager nothing to act on, so the
 * signal stops at the moment the decision closes.
 */
export function fatigueSignalForBooking(
  booking: Booking,
  options: { additionalBookings?: Booking[]; now?: Date } = {},
): FatigueSignal {
  const now = options.now ?? new Date();
  if (
    booking.status === 'ended' ||
    booking.status === 'cancelled' ||
    booking.start <= now
  ) {
    return null;
  }

  return fatigueSignalForWorker(booking.workerId, booking.start, {
    excludeBookingId: booking.id,
    additionalBookings: options.additionalBookings,
  });
}

export function fatigueSignalLabel(
  signal: Exclude<FatigueSignal, null>,
): string {
  return signal === 'no-break'
    ? 'No break before shift'
    : 'Less than 8 hours rest';
}
