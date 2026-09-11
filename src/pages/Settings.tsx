import { useState, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { LocationProfileSettings } from '../components/LocationProfileSettings';
import {
  LANDING_CONTENT_ENABLED,
  LandingPlaceholder,
} from '../components/LandingPlaceholder';
import { PageHeading } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Button } from '../components/ui/Button';
import { Card as UiCard } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import { IconButton } from '../components/ui/IconButton';
import {
  locationsForOrganisation,
  serviceTypeLabel,
  type LocationData,
} from '../data/locations';
import {
  ACCOUNT_SECTIONS,
  CAN_EDIT_ORGANISATION_DETAILS,
  LOCATION_SECTIONS,
  ORGANISATION_SECTIONS,
  ROUTES,
  personasForOrganisation,
  sectionFromPath,
  type Organisation,
  type Persona,
  type SettingsSection,
} from '../lib/informationArchitecture';
import { href } from '../lib/router';

function PrivacyNote({ extra }: { extra?: string }) {
  return (
    <p className="mt-1 text-sm text-text-strong">
      {extra}
      More information on how we keep your personal details secure can be found in our{' '}
      <a href={href('/privacy')} className="ui-link">
        privacy policy
      </a>
      .
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-text">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        aria-readonly={readOnly}
        className="mt-1 h-10 w-full rounded border border-border bg-surface px-3 text-sm font-normal text-text"
      />
    </label>
  );
}

function SaveButton({ disabled = false }: { disabled?: boolean }) {
  return (
    <Button type="button" disabled={disabled}>
      Save
    </Button>
  );
}

function SettingsCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <UiCard as="section" className="px-6 py-6">
      <h2 className="text-sm font-bold text-text">{title}</h2>
      {intro}
      <div className="mt-3 space-y-4">{children}</div>
    </UiCard>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-border"
      />
      {label}
    </label>
  );
}

function OrganisationDetails({
  canEdit,
  organisationName,
}: {
  canEdit: boolean;
  organisationName: string;
}) {
  const [name, setName] = useState(organisationName);
  const [address, setAddress] = useState('7 Old South Head Rd, Vaucluse NSW 2030, Australia');
  const [cantFindAddress, setCantFindAddress] = useState(false);
  const [mobile, setMobile] = useState('');
  const [homePhone, setHomePhone] = useState('04657656787');
  const [emergencyName, setEmergencyName] = useState('Dom Green - Manageree');
  const [emergencyMobile, setEmergencyMobile] = useState('');
  const [emergencyHome, setEmergencyHome] = useState('0487676565');

  return (
    <div className="space-y-6">
      <SettingsCard title="Organisation name">
        <Field label="Name" value={name} onChange={setName} readOnly={!canEdit} />
        <SaveButton disabled={!canEdit} />
      </SettingsCard>

      <SettingsCard title="Address" intro={<PrivacyNote />}>
        <Field label="Your address" value={address} onChange={setAddress} readOnly={!canEdit} />
        <CheckRow
          label="Can't find my address"
          checked={cantFindAddress}
          onChange={setCantFindAddress}
          disabled={!canEdit}
        />
        <SaveButton disabled={!canEdit} />
      </SettingsCard>

      <SettingsCard
        title="Contact number"
        intro={<PrivacyNote extra="At least one contact number is required. " />}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mobile number" value={mobile} onChange={setMobile} readOnly={!canEdit} />
          <Field label="Home phone number" value={homePhone} onChange={setHomePhone} readOnly={!canEdit} />
        </div>
        <SaveButton disabled={!canEdit} />
      </SettingsCard>

      <SettingsCard
        title="Emergency contact"
        intro={
          <p className="mt-1 text-sm text-text-strong">
            Please nominate an adult who may be contacted on their mobile in the event of an
            emergency. This person could be a parent, partner or close friend.
          </p>
        }
      >
        <Field label="Full name" value={emergencyName} onChange={setEmergencyName} readOnly={!canEdit} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mobile number" value={emergencyMobile} onChange={setEmergencyMobile} readOnly={!canEdit} />
          <Field label="Home phone number" value={emergencyHome} onChange={setEmergencyHome} readOnly={!canEdit} />
        </div>
        <SaveButton disabled={!canEdit} />
      </SettingsCard>
    </div>
  );
}

function PreferenceList({ title, options }: { title: string; options: string[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  return (
    <SettingsCard title={title}>
      <div className="space-y-2">
        {options.map((option) => (
          <CheckRow
            key={option}
            label={option}
            checked={Boolean(selected[option])}
            onChange={(checked) => setSelected((current) => ({ ...current, [option]: checked }))}
          />
        ))}
      </div>
      <SaveButton />
    </SettingsCard>
  );
}

function FinancialDetails({
  canEdit,
  organisationName,
}: {
  canEdit: boolean;
  organisationName: string;
}) {
  const [abn, setAbn] = useState('12 345 678 901');
  const [accountName, setAccountName] = useState(organisationName);

  return (
    <SettingsCard title="Financial details" intro={<PrivacyNote />}>
      <Field label="ABN" value={abn} onChange={setAbn} readOnly={!canEdit} />
      <Field label="Account name" value={accountName} onChange={setAccountName} readOnly={!canEdit} />
      <SaveButton disabled={!canEdit} />
    </SettingsCard>
  );
}

function Documents({ canEdit }: { canEdit: boolean }) {
  const items = ['Public liability insurance', 'NDIS registration', 'Police check'];

  return (
    <SettingsCard
      title="Documents"
      intro={
        <p className="mt-1 text-sm text-text-strong">
          Upload documents related to your organisation.
        </p>
      }
    >
      <UiCard as="ul" divided>
        {items.map((item) => (
          <li key={item} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="font-medium text-text">{item}</span>
            <Button type="button" size="small" disabled={!canEdit}>
              Upload
            </Button>
          </li>
        ))}
      </UiCard>
    </SettingsCard>
  );
}

function Account({ persona }: { persona: Persona }) {
  const [email, setEmail] = useState(
    `${persona.name.toLowerCase().replace(/\s+/g, '.')}@hireupdemo.com`,
  );
  const [password, setPassword] = useState('');

  return (
    <SettingsCard title="Account" intro={<PrivacyNote />}>
      <Field label="Email address" value={email} onChange={setEmail} type="email" />
      <div>
        <p className="text-sm font-medium text-text">Profile photo</p>
        <div className="mt-1 flex items-center gap-4">
          <Avatar name={persona.name} size="lg" />
          <Button type="button" size="small">
            Choose file
          </Button>
        </div>
      </div>
      <Field label="Password" value={password} onChange={setPassword} type="password" />
      <SaveButton />
    </SettingsCard>
  );
}

function SupportPlan({
  locationName,
  client,
}: {
  locationName: string;
  client: boolean;
}) {
  return (
    <SettingsCard title="Support plan">
      <p className="text-sm text-text-strong">
        {client
          ? `Manage the support plan shared with workers booked to support ${locationName}.`
          : `Manage the support plan shared with workers booked at ${locationName}.`}
      </p>
      <Button type="button">View support plan</Button>
    </SettingsCard>
  );
}

function LocationName({
  initialName,
  serviceType,
  sector,
  client,
}: {
  initialName: string;
  serviceType: LocationData['location']['serviceType'];
  sector: LocationData['location']['sector'];
  client: boolean;
}) {
  const [name, setName] = useState(initialName);

  return (
    <SettingsCard title={client ? `${initialName} details` : 'Location name'}>
      <Field label="Name" value={name} onChange={setName} />
      <Field
        label={client ? 'Support type' : 'Service type'}
        value={serviceTypeLabel(serviceType, sector)}
        onChange={() => {}}
        readOnly
      />
      <SaveButton />
    </SettingsCard>
  );
}

const PEOPLE_ACCESS = [
  'Can manage bookings, workers and settings',
  'Can manage bookings and view workers',
  'Can view bookings and message workers',
];

function PeopleList({
  scope,
  locationName,
  organisation,
  client = false,
  canEdit = true,
}: {
  scope: 'location' | 'organisation';
  locationName: string;
  organisation: Organisation;
  client?: boolean;
  canEdit?: boolean;
}) {
  const organisationLocations = locationsForOrganisation(organisation);
  const people = personasForOrganisation(organisation)
    .slice(0, PEOPLE_ACCESS.length)
    .map((persona, index) => ({
      name: persona.name,
      locationAccess: PEOPLE_ACCESS[index],
      visibleLocations: (
        index === 0
          ? organisationLocations
          : organisationLocations.slice(0, index === 1 ? 3 : 2)
      ).map(({ name }) => name),
    }));

  return (
    <SettingsCard title="People">
      <UiCard as="ul" divided>
        {people.map((person) => (
          <li
            key={person.name}
            className="ui-inset-row flex entity-row items-center gap-3"
          >
            <Avatar name={person.name} size="md" />
            <div className="min-w-0 flex-1">
              <EntityLink as="span">{person.name}</EntityLink>
              <p className="mt-1 text-sm text-text-secondary">
                {scope === 'location'
                  ? `${person.locationAccess} ${client ? 'for' : 'at'} ${locationName}.`
                  : `Can see ${person.visibleLocations.join(', ')}.`}
              </p>
            </div>
            <IconButton
              type="button"
              disabled={!canEdit}
              aria-label={`More options for ${person.name}`}
              data-tooltip={`More options for ${person.name}`}
              className="ui-tooltip"
            >
              <MoreHorizontal className="h-5 w-5" />
            </IconButton>
          </li>
        ))}
      </UiCard>
    </SettingsCard>
  );
}

function LocationSection({
  section,
  data,
}: {
  section: string;
  data: LocationData;
}) {
  const client = data.location.serviceType === 'home-community';
  switch (section) {
    case 'profile':
      return <LocationProfileSettings data={data} />;
    case 'preferences':
      return (
        <PreferenceList
          title="Support worker preferences"
          options={[
            'Has a vehicle',
            'Non-smoker',
            'Has a current first aid certificate',
            'Available for sleepovers',
          ]}
        />
      );
    case 'support-plan':
      return (
        <SupportPlan
          locationName={data.location.name}
          client={client}
        />
      );
    case 'location-name':
      return (
        <LocationName
          initialName={data.location.name}
          serviceType={data.location.serviceType}
          sector={data.location.sector}
          client={client}
        />
      );
    case 'people':
      return (
        <PeopleList
          scope="location"
          locationName={data.location.name}
          organisation={data.location.organisation}
          client={client}
        />
      );
    default:
      return null;
  }
}

function OrganisationSection({
  section,
  data,
  canEdit,
}: {
  section: string;
  data: LocationData;
  canEdit: boolean;
}) {
  switch (section) {
    case 'organisation':
      return (
        <OrganisationDetails
          key={data.location.organisation}
          organisationName={data.location.organisation}
          canEdit={canEdit}
        />
      );
    case 'financial':
      return (
        <FinancialDetails
          key={data.location.organisation}
          organisationName={data.location.organisation}
          canEdit={canEdit}
        />
      );
    case 'documents':
      return <Documents canEdit={canEdit} />;
    case 'people':
      return (
        <PeopleList
          scope="organisation"
          locationName={data.location.name}
          organisation={data.location.organisation}
          canEdit={canEdit}
        />
      );
    default:
      return null;
  }
}

function AccountSection({
  section,
  persona,
}: {
  section: string;
  persona: Persona;
}) {
  switch (section) {
    case 'account':
      return <Account persona={persona} />;
    default:
      return null;
  }
}

function SettingsPage({
  title,
  path,
  basePath,
  sections,
  renderSection,
}: {
  title: string;
  path: string;
  basePath: string;
  sections: SettingsSection[];
  renderSection: (section: string) => ReactNode;
}) {
  const section = sectionFromPath(path, sections);
  return (
    <div>
      {LANDING_CONTENT_ENABLED ? (
      <>
      <PageHeading title={title} />
      <div className="layout-rail-content">
      <aside className="ui-rail-stack">
      <nav className="relative space-y-1" aria-label={title}>
        <PinnedQuestion
          questionId="settings-sections"
          className="absolute top-1 right-1 z-10"
        />
        {sections.map((item) => {
          const active = section === item.id;
          return (
            <a
              key={item.id}
              href={href(`${basePath}/${item.id}`)}
              aria-current={active ? 'page' : undefined}
              className={`flex w-full items-center gap-2 border-l-4 px-3 py-2 text-left text-sm font-bold ${
                active
                  ? 'border-text bg-info-surface text-text'
                  : 'border-transparent text-text-strong hover:bg-surface-selected'
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
      </aside>

      <div className="w-full max-w-content">
        {renderSection(section)}
      </div>
      </div>
      </>
      ) : (
        <LandingPlaceholder />
      )}
    </div>
  );
}

export function ManageLocationSettings({
  data,
  path,
}: {
  data: LocationData;
  path: string;
}) {
  const client = data.location.serviceType === 'home-community';
  const sections = client
    ? LOCATION_SECTIONS.map((section) => {
        if (section.id === 'profile') {
          return { ...section, label: `${data.location.name} profile` };
        }
        if (section.id === 'location-name') {
          return { ...section, label: 'Personal details' };
        }
        if (section.id === 'people') {
          return { ...section, label: 'People with access' };
        }
        return section;
      })
    : LOCATION_SECTIONS;
  return (
    <SettingsPage
      title={client ? `${data.location.name} settings` : 'Location settings'}
      path={path}
      basePath={ROUTES.manageLocation}
      sections={sections}
      renderSection={(section) => <LocationSection section={section} data={data} />}
    />
  );
}

export function OrganisationSettings({
  data,
  path,
  canEdit = CAN_EDIT_ORGANISATION_DETAILS,
}: {
  data: LocationData;
  path: string;
  canEdit?: boolean;
}) {
  return (
    <SettingsPage
      title="Organisation settings"
      path={path}
      basePath={ROUTES.organisationSettings}
      sections={ORGANISATION_SECTIONS}
      renderSection={(section) => (
        <OrganisationSection
          section={section}
          data={data}
          canEdit={canEdit}
        />
      )}
    />
  );
}

export function YourAccountSettings({
  path,
  persona,
}: {
  path: string;
  persona: Persona;
}) {
  return (
    <SettingsPage
      title="Your account"
      path={path}
      basePath={ROUTES.yourAccount}
      sections={ACCOUNT_SECTIONS}
      renderSection={(section) => (
        <AccountSection section={section} persona={persona} />
      )}
    />
  );
}
