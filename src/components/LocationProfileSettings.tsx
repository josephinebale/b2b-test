import { useEffect, useState } from 'react';
import type { LocationData } from '../data/locations';
import {
  LOCATION_PROFILE_PREVIEW_ROUTE,
  readLocationProfile,
  SUPPORT_PLACE_OPTIONS,
  SUPPORT_REQUIRED_OPTIONS,
  supportPlaceLabel,
  supportRequiredLabel,
  writeLocationProfile,
  type LocationProfile,
} from '../lib/locationProfiles';
import { href } from '../lib/router';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function LocationProfileSettings({ data }: { data: LocationData }) {
  const client = data.location.serviceType === 'home-community';
  const [profile, setProfile] = useState<LocationProfile>(
    () => readLocationProfile(data.location),
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(readLocationProfile(data.location));
    setSaved(false);
  }, [data.location]);

  const update = <Key extends keyof LocationProfile>(
    key: Key,
    value: LocationProfile[Key],
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        writeLocationProfile(profile);
        setSaved(true);
      }}
    >
      <Card as="section" className="p-6">
        <h2 className="text-sm font-bold text-text">
          {client ? `About ${data.location.name}` : 'About this location'}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {client
            ? `Introduce ${data.location.name} and how workers support them.`
            : 'Introduce the location and the way its workers support residents.'}
        </p>
        <label className="mt-4 block text-sm font-medium text-text">
          About
          <textarea
            value={profile.about}
            onChange={(event) => update('about', event.target.value)}
            rows={6}
            className="mt-1 w-full resize-y rounded border border-border bg-surface px-3 py-2 text-sm font-normal text-text"
          />
        </label>
      </Card>

      <Card as="section" className="p-6">
        <h2 className="text-sm font-bold text-text">Where support may take place</h2>
        <div className="mt-3 space-y-2">
          {SUPPORT_PLACE_OPTIONS.map((place) => (
            <label key={place} className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={profile.supportPlaces.includes(place)}
                onChange={() =>
                  update('supportPlaces', toggleValue(profile.supportPlaces, place))
                }
                className="h-4 w-4 rounded border-border"
              />
              {supportPlaceLabel(place, data.location)}
            </label>
          ))}
        </div>
      </Card>

      <Card as="section" className="p-6">
        <h2 className="text-sm font-bold text-text">
          {client ? 'Support needs' : 'People supported'}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {client
            ? 'Add broad support needs only. Do not include private details.'
            : 'Add broad support needs only. Do not include resident names or private details.'}
        </p>
        <label className="mt-4 block text-sm font-medium text-text">
          Support needs
          <input
            value={profile.supportNeeds.join(', ')}
            onChange={(event) =>
              update(
                'supportNeeds',
                event.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
            placeholder="For example: Community access, complex physical support"
            className="mt-1 h-10 w-full rounded border border-border bg-surface px-3 text-sm font-normal text-text"
          />
        </label>
      </Card>

      <Card as="section" className="p-6">
        <h2 className="text-sm font-bold text-text">Safety information</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Share general expectations. Booking-specific details stay in support plans and shift notes.
        </p>
        <label className="mt-4 block text-sm font-medium text-text">
          What workers should know
          <textarea
            value={profile.safety}
            onChange={(event) => update('safety', event.target.value)}
            rows={4}
            className="mt-1 w-full resize-y rounded border border-border bg-surface px-3 py-2 text-sm font-normal text-text"
          />
        </label>
      </Card>

      <Card as="section" className="p-6">
        <h2 className="text-sm font-bold text-text">Support required</h2>
        <div className="mt-3 space-y-2">
          {SUPPORT_REQUIRED_OPTIONS.map((support) => (
            <label key={support} className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={profile.supportRequired.includes(support)}
                onChange={() =>
                  update(
                    'supportRequired',
                    toggleValue(profile.supportRequired, support),
                  )
                }
                className="h-4 w-4 rounded border-border"
              />
              {supportRequiredLabel(support, data.location)}
            </label>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit">Save profile</Button>
        <Button href={href(LOCATION_PROFILE_PREVIEW_ROUTE)} variant="secondary">
          Preview profile
        </Button>
        {saved && <span role="status" className="text-sm text-text-secondary">Saved</span>}
      </div>
    </form>
  );
}
