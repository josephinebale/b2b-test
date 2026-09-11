import { Building2, CheckCircle2, MapPin } from 'lucide-react';
import { LocationMarker } from '../components/LocationMarker';
import { PageHeading } from '../components/PageHeading';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import type { LocationData } from '../data/locations';
import { ROUTES } from '../lib/informationArchitecture';
import {
  readLocationProfile,
  supportPlaceLabel,
  supportRequiredLabel,
} from '../lib/locationProfiles';
import { href } from '../lib/router';

export function LocationProfilePreview({ data }: { data: LocationData }) {
  const profile = readLocationProfile(data.location);
  const client = data.location.serviceType === 'home-community';

  return (
    <div>
      <PageHeading
        title={client ? `${data.location.name} profile preview` : 'Location profile preview'}
        description={
          client
            ? `Preview of what workers see before accepting work with ${data.location.name}.`
            : 'Preview of what workers see before accepting work at this location.'
        }
        actions={
          <Button href={href(`${ROUTES.manageLocation}/profile`)} variant="secondary">
            Edit profile
          </Button>
        }
      />

      <div className="layout-rail-content">
        <aside className="ui-rail-stack">
          <Card className="p-6 text-center">
            <div className="flex justify-center">
              <LocationMarker location={data.location} />
            </div>
            <h2 className="mt-3 text-md font-bold text-text">{data.location.name}</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {data.location.organisation}
            </p>
            <Tag className="mt-3">Worker view</Tag>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
              <MapPin className="h-5 w-5" />
              {data.location.suburb}, {data.location.state}
            </p>
          </Card>
        </aside>

        <div className="min-w-0 space-y-6">
          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">
              {client ? `About ${data.location.name}` : 'About this location'}
            </h2>
            <p className="mt-3 text-sm text-text-strong">{profile.about}</p>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Where support may take place</h2>
            <ul className="mt-3 space-y-2">
              {profile.supportPlaces.map((place) => (
                <li key={place} className="flex items-center gap-2 text-sm text-text">
                  <MapPin className="h-5 w-5 shrink-0" />
                  {supportPlaceLabel(place, data.location)}
                </li>
              ))}
            </ul>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">
              {client ? 'Support needs' : 'People supported'}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.supportNeeds.map((need) => <Tag key={need}>{need}</Tag>)}
            </div>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Safety</h2>
            <p className="mt-3 flex items-start gap-2 text-sm text-text-strong">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              {profile.safety}
            </p>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Support required</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
              {profile.supportRequired.map((support) => (
                <li key={support} className="flex items-center gap-2 text-sm text-text">
                  <Building2 className="h-5 w-5 shrink-0" />
                  {supportRequiredLabel(support, data.location)}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
