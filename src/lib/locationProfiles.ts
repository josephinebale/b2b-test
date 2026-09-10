import type { Location } from '../data/locations.ts';

export type LocationProfile = {
  locationId: string;
  about: string;
  supportPlaces: string[];
  supportNeeds: string[];
  supportRequired: string[];
  safety: string;
};

const KEY = 'hm.locationProfiles';
export const LOCATION_PROFILE_PREVIEW_ROUTE = '/location-profile-preview';

export const SUPPORT_PLACE_OPTIONS = [
  'At the location',
  'In the community',
];

export const SUPPORT_REQUIRED_OPTIONS = [
  'Help around the location',
  'In-home care',
  'Out and about',
  'Personal care and hygiene',
  'Specialised support',
  'Therapy support',
  'Transport',
];

export function supportPlaceLabel(value: string, location: Location): string {
  return location.serviceType === 'home-community' && value === 'At the location'
    ? 'At home'
    : value;
}

export function supportRequiredLabel(
  value: string,
  location: Location,
): string {
  return location.serviceType === 'home-community' &&
    value === 'Help around the location'
    ? 'Help at home'
    : value;
}

export function createDefaultLocationProfile(location: Location): LocationProfile {
  const about =
    location.serviceType === 'centre'
      ? `${location.name} is a centre and day program in ${location.suburb}. Support is planned around who is attending each session.`
      : location.serviceType === 'home-community'
        ? `${location.name} lives in ${location.suburb}. Support is provided at home and in the community.`
        : `${location.name} is a supported independent living location in ${location.suburb}. We focus on consistent routines, choice, community participation, and support that reflects each resident’s goals.`;

  return {
    locationId: location.id,
    about,
    supportPlaces: [...SUPPORT_PLACE_OPTIONS],
    supportNeeds: [
      'Cerebral palsy',
      'Complex physical support',
      'Community access',
    ],
    supportRequired: [
      'Help around the location',
      'In-home care',
      'Out and about',
      'Personal care and hygiene',
      'Transport',
    ],
    safety: 'Workers should review the shift notes and relevant support plans before each booking.',
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isLocationProfile(value: unknown): value is LocationProfile {
  if (typeof value !== 'object' || value === null) return false;
  const profile = value as Partial<LocationProfile>;
  return (
    typeof profile.locationId === 'string' &&
    typeof profile.about === 'string' &&
    isStringArray(profile.supportPlaces) &&
    isStringArray(profile.supportNeeds) &&
    isStringArray(profile.supportRequired) &&
    typeof profile.safety === 'string'
  );
}

export function parseLocationProfiles(raw: string | null): Record<string, LocationProfile> {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, LocationProfile] =>
        isLocationProfile(entry[1]),
      ),
    );
  } catch {
    return {};
  }
}

export function readLocationProfile(location: Location): LocationProfile {
  try {
    const profiles = parseLocationProfiles(window.localStorage.getItem(KEY));
    return profiles[location.id] ?? createDefaultLocationProfile(location);
  } catch {
    return createDefaultLocationProfile(location);
  }
}

export function clearLocationProfiles(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // See writeLocationProfile().
  }
}

export function writeLocationProfile(profile: LocationProfile): void {
  try {
    const profiles = parseLocationProfiles(window.localStorage.getItem(KEY));
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ ...profiles, [profile.locationId]: profile }),
    );
  } catch {
    // Prototype only; blocked storage leaves the current screen usable.
  }
}
