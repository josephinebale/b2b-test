import { addDays, startOfDay, startOfWeek } from '../lib/date.ts';
import type { Organisation, Sector } from '../lib/informationArchitecture.ts';

export type BookingStatus = 'confirmed' | 'requested' | 'ended';
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
  organisation: Organisation;
  sector: Sector;
  locationIds: string[];
  groupingIds?: string[];
};

export type Worker = {
  id: string;
  name: string;
  bookingCount: number;
  planConfirmed: boolean;
  assessments: WorkerAssessments;
};

export type WorkerAssessments = {
  medication: boolean;
  driving: boolean;
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
  sleepover: boolean;
  createdByMe: boolean;
  address?: string;
  description?: string;
  driving?: 'not-required' | 'worker-vehicle' | 'location-vehicle';
  financeReference?: string;
  frequency?: 'one-off' | 'weekly' | 'fortnightly';
  requestedAt?: Date;
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

export type LocationData = {
  location: Location;
  workers: Worker[];
  bookings: Booking[];
  requestsToAccept: number;
  bookingsToApprove: number;
  plansToReview: number;
  unreadMessages: number;
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
  assessments: WorkerAssessments;
  locations: WorkerLocationHistory[];
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
  sites: Set<number>;
  core: boolean;
  planConfirmed: boolean;
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

export const LOCATIONS: Location[] = [
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
];

export const GROUPING: Grouping = {
  id: 'northern-sydney',
  name: 'Northern Sydney',
  organisation: 'Cerebral Palsy Alliance',
  sector: 'disability',
  locationIds: [
    'allambie-heights-day-program',
    'dee-why-1',
    'galston-1',
    'hornsby',
    'north-ryde-1',
    'wahroonga',
  ],
};

/**
 * Two peer groupings drawn by different service lines. They share Dee Why 1 and
 * North Ryde 1, because a house really does have two parents, but three houses
 * on each side belong to one grouping only — otherwise standing at the caseload
 * looks exactly like standing in the region.
 */
export const GROUPINGS: Grouping[] = [
  GROUPING,
  {
    id: 'northern-lifestyles',
    name: 'Northern Lifestyles',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'allambie-heights-day-program',
      'brookvale-day-program',
      'forestville-home',
      'chatswood-home',
    ],
  },
  {
    id: 'careforce-area',
    name: 'Careforce area',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [],
    groupingIds: [
      'careforce-caseload',
      'careforce-northern-caseload',
    ],
  },
  {
    id: 'careforce-caseload',
    name: 'Careforce caseload',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'dee-why-1',
      'forestville-home',
      'gladesville-1',
      'lane-cove-1',
      'manly-1',
      'north-ryde-1',
    ],
  },
  {
    id: 'careforce-northern-caseload',
    name: 'Careforce Northern caseload',
    organisation: 'Cerebral Palsy Alliance',
    sector: 'disability',
    locationIds: [
      'galston-1',
      'hornsby',
      'lane-cove-1',
      'chatswood-home',
      'north-ryde-1',
      'wahroonga',
    ],
  },
  {
    id: 'northcott-sil-services',
    name: 'Western Sydney SIL services',
    organisation: 'Northcott',
    sector: 'disability',
    locationIds: ['north-parramatta-1', 'westmead-1'],
  },
  {
    id: 'northcott-individual-services',
    name: 'Western Sydney individual services',
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
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    locationIds: [],
    groupingIds: ['lwb-northern-sydney', 'lwb-western-sydney'],
  },
  {
    id: 'lwb-northern-sydney',
    name: 'Northern Sydney',
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
    organisation: 'Life Without Barriers',
    sector: 'aged care',
    locationIds: [
      'patricia-moore-home',
      'john-kelly-home',
      'linda-cooper-home',
      'michael-ward-home',
    ],
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

const NEARBY_WORKERS: NearbyWorker[] = [
  {
    id: 'leah-c',
    name: 'Leah C',
    suburb: 'Chatswood',
    distanceKm: 4,
    assessments: { medication: true, driving: true },
  },
  {
    id: 'omar-h',
    name: 'Omar H',
    suburb: 'Frenchs Forest',
    distanceKm: 6,
    assessments: { medication: true, driving: false },
  },
  {
    id: 'rachel-t',
    name: 'Rachel T',
    suburb: 'Ryde',
    distanceKm: 8,
    assessments: { medication: false, driving: true },
  },
  {
    id: 'samira-a',
    name: 'Samira A',
    suburb: 'Epping',
    distanceKm: 9,
    assessments: { medication: true, driving: true },
  },
  {
    id: 'will-j',
    name: 'Will J',
    suburb: 'Mona Vale',
    distanceKm: 12,
    assessments: { medication: false, driving: false },
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

function countAt(seeds: WorkerSeed[], locationIndex: number): number {
  return seeds.filter((worker) => worker.sites.has(locationIndex)).length;
}

/** One identity per provider. History overlaps locations but never organisations. */
function buildWorkerSeeds(): WorkerSeed[] {
  let seedIndex = 0;
  const seeds = Object.entries(WORKER_POOL).flatMap(
    ([organisation, names]) =>
      names.map((name) => {
        const index = seedIndex;
        seedIndex += 1;
        return {
          id: slugName(name),
          name,
          organisation: organisation as Organisation,
          sites: new Set<number>(),
          core: false,
          planConfirmed: index % 3 !== 0,
          assessments: {
            medication: index % 3 !== 1,
            driving: index % 4 !== 1,
          },
        };
      }),
  );

  for (const organisation of Object.keys(WORKER_POOL) as Organisation[]) {
    const locationIndexes = LOCATIONS.flatMap((location, index) =>
      location.organisation === organisation ? [index] : [],
    );
    const providerSeeds = seeds.filter(
      (worker) => worker.organisation === organisation,
    );

    /* Keep a few narrow histories for breadth comparisons. */
    const singleSiteCount = Math.min(2, locationIndexes.length);
    for (let index = 0; index < singleSiteCount; index += 1) {
      providerSeeds[index].sites.add(locationIndexes[index]);
      providerSeeds[index].core = true;
    }

    let next = singleSiteCount;
    if (locationIndexes.length > 1 && providerSeeds[next]) {
      providerSeeds[next].sites.add(locationIndexes[0]);
      providerSeeds[next].sites.add(locationIndexes[locationIndexes.length - 1]);
      providerSeeds[next].core = true;
      next += 1;
    }

    /* Two people carry history across this provider, never across providers. */
    for (const worker of providerSeeds.slice(next, next + 2)) {
      for (const locationIndex of locationIndexes) {
        worker.sites.add(locationIndex);
      }
    }
    next += 2;

    const fill = providerSeeds.slice(next);
    for (const locationIndex of locationIndexes) {
      const fixedCount = countAt(providerSeeds, locationIndex);
      const target = Math.min(
        WORKERS_PER_LOCATION[locationIndex],
        providerSeeds.length - 4,
        fixedCount + fill.length,
      );
      const offset = locationIndexes.indexOf(locationIndex) % fill.length;
      const rotatedFill = [...fill.slice(offset), ...fill.slice(0, offset)];
      while (countAt(providerSeeds, locationIndex) < target) {
        const candidate = rotatedFill.find(
          (worker) => !worker.sites.has(locationIndex),
        );
        if (!candidate) break;
        candidate.sites.add(locationIndex);
      }
    }
  }

  return seeds;
}

const WORKER_SEEDS = buildWorkerSeeds();

function rosterFor(locationIndex: number): WorkerSeed[] {
  return WORKER_SEEDS.filter((worker) => worker.sites.has(locationIndex));
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
function daytimeCountFor(locationIndex: number, random: () => number): number {
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
  (_, index) => APPROVAL_PATTERN[index % APPROVAL_PATTERN.length],
);

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

function assignRequested(bookings: Booking[], locationIndex: number, now: Date): void {
  const pressure = REQUEST_PRESSURE[locationIndex] ?? REQUEST_PRESSURE[0];
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
  const random = seededRandom(4801 + locationIndex * 977);
  const today = startOfDay(new Date());
  const now = new Date();
  const bookings: Booking[] = [];
  const anchor = roster.find((worker) => worker.core);

  for (let offset = -14; offset <= 27; offset += 1) {
    if (
      location.serviceType === 'home-community' &&
      offset !== 0 &&
      random() < 0.4
    ) {
      continue;
    }

    const day = addDays(today, offset);
    const daytime = DAYTIME_SHIFTS[daytimeCountFor(locationIndex, random)];
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

  assignRequested(bookings, locationIndex, now);
  return bookings.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function buildLocationData(location: Location, locationIndex: number): LocationData {
  const roster = rosterFor(locationIndex);
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
    bookingsToApprove: endedRecently.slice(0, APPROVALS_WAITING[locationIndex] ?? 0).length,
    plansToReview: workers.filter((worker) => !worker.planConfirmed).length,
    unreadMessages: UNREAD_MESSAGES[locationIndex] ?? 0,
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

export function pendingCountsForLocation(locationId: string) {
  const data = getLocationData(locationId);
  return {
    requests: data.requestsToAccept,
    approvals: data.bookingsToApprove,
    messages: data.unreadMessages,
  };
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

/** Houses and centres first, then home-and-community clients, in grouping order. */
export function partitionGroupingLocations(grouping: Grouping): {
  housesAndCentres: Location[];
  clients: Location[];
} {
  const locations = descendantLocationIds(grouping)
    .map(findLocation)
    .filter((location): location is Location => location !== null);
  return {
    housesAndCentres: locations.filter((location) => location.serviceType !== 'home-community'),
    clients: locations.filter((location) => location.serviceType === 'home-community'),
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

function groupingContainsGrouping(grouping: Grouping, groupingId: string): boolean {
  if (grouping.id === groupingId) return true;
  return childGroupings(grouping).some((child) =>
    groupingContainsGrouping(child, groupingId),
  );
}

/** Only the entry organisation, with its entry branch leading. */
export function orderedGroupingsForMenu(entryGroupingId: string): Grouping[] {
  const childIds = new Set(GROUPINGS.flatMap((grouping) => grouping.groupingIds ?? []));
  const entryGrouping = findGrouping(entryGroupingId) ?? GROUPING;
  const roots = GROUPINGS.filter(
    (grouping) =>
      !childIds.has(grouping.id) &&
      grouping.organisation === entryGrouping.organisation,
  );
  const entryRoot = roots.find((grouping) =>
    groupingContainsGrouping(grouping, entryGroupingId),
  );
  if (!entryRoot) return roots;
  return [entryRoot, ...roots.filter((grouping) => grouping.id !== entryRoot.id)];
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
  const knownHere = [...getLocationData(locationId).workers].sort((a, b) =>
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
  if (booking.status === 'ended' || booking.start <= now) return null;

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
