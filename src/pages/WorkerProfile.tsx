import { CheckCircle2 } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { PageHeading } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import {
  GROUPING,
  findWorker,
  groupingWorkers,
  locationHistoryForWorker,
  type LocationData,
  type Grouping,
} from '../data/locations';
import { WORKERS_ROUTE } from '../lib/pageContent';
import { href } from '../lib/router';

const SUPPORT_AREAS = [
  'Personal care',
  'Community access',
  'Domestic assistance',
  'Transport',
  'Social and recreational support',
];

const QUALIFICATIONS = [
  'Certificate III in Individual Support',
  'First aid and CPR',
  'Medication assistance',
];

const AVAILABILITY = [
  ['Monday', 'Morning', 'Afternoon'],
  ['Tuesday', 'Afternoon'],
  ['Wednesday', 'Morning', 'Evening'],
  ['Thursday', 'Afternoon', 'Evening'],
  ['Friday', 'Morning'],
  ['Saturday', 'Sleepover'],
];

function needsAttentionClass(needsAttention: boolean): string {
  return needsAttention ? 'font-medium text-text' : 'text-text-tertiary';
}

export function WorkerProfile({
  data,
  workerId,
  nodeType = 'location',
  grouping = GROUPING,
}: {
  data: LocationData;
  workerId: string | null;
  nodeType?: 'grouping' | 'location';
  grouping?: Grouping;
}) {
  const localIndex = data.workers.findIndex((item) => item.id === workerId);
  const found =
    localIndex >= 0
      ? { worker: data.workers[localIndex], location: data.location, index: localIndex }
      : findWorker(workerId, data.location.organisation);
  const worker = found?.worker;
  const workerIndex = found?.index ?? 0;

  if (!worker || !found) {
    return (
      <div className="width-main-column">
        <PageHeading title="Worker profile" />
        <Card className="px-6 py-12 text-center">
          <p className="text-lg font-bold text-text">Worker not found</p>
          <p className="mt-1 text-sm text-text-secondary">
            This worker has no booking history with this provider.
          </p>
          <Button href={href(WORKERS_ROUTE)} variant="secondary" className="mt-4">
            Back to workers
          </Button>
        </Card>
      </div>
    );
  }

  const providerWorker = groupingWorkers(grouping.id).find(
    (item) => item.id === worker.id,
  );
  const providerHistory = locationHistoryForWorker(
    worker.id,
    data.location.organisation,
  );
  const history =
    nodeType === 'grouping' ? providerWorker?.locations ?? [] : providerHistory;
  const completedBookings =
    nodeType === 'grouping'
      ? providerWorker?.shiftCount ?? worker.bookingCount
      : Math.max(worker.bookingCount, 8 + workerIndex * 3);
  const yearsExperience = 3 + (workerIndex % 6);
  const client = data.location.serviceType === 'home-community';
  const profileDescription =
    nodeType === 'grouping'
      ? `Support worker with history at ${history.length} ${history.length === 1 ? 'location' : 'locations'} in ${grouping.name}`
      : localIndex >= 0
        ? client
          ? `Support worker who has worked with ${data.location.name}`
          : `Support worker known at ${data.location.name}`
        : `Support worker with history elsewhere in ${grouping.name}`;

  return (
    <div>
      <a
        href={href(WORKERS_ROUTE)}
        className="ui-link mb-4 inline-block rounded text-sm"
      >
        Back to workers
      </a>

      <PageHeading
        title={worker.name}
        description={profileDescription}
        actions={
          <>
            <PinnedQuestion questionId="workers-profile-context" />
            <Button href={href('/messages')} variant="secondary">
              Message
            </Button>
            <Button href={href('/request-booking')}>Request booking</Button>
          </>
        }
      />

      <div className="layout-rail-content">
        <aside className="ui-rail-stack">
          <Card className="p-6 text-center">
            <div className="flex justify-center">
              <Avatar name={worker.name} size="lg" />
            </div>
            <p className="mt-3 text-md font-bold text-text">{worker.name}</p>
            <p className="mt-1 text-sm text-text-secondary">Support worker</p>
            <p className="mt-1 text-xs text-text-tertiary">
              {nodeType === 'grouping' ? grouping.organisation : found.location.name}
            </p>
            <p className="mt-4 text-sm text-text">
              {nodeType === 'grouping'
                ? `${completedBookings} shifts across ${history.length} ${history.length === 1 ? 'location' : 'locations'}`
                : `${completedBookings} bookings with ${found.location.name}`}
            </p>
            <div className="mt-4 border-t border-border-subtle pt-4 text-left">
              <p className="flex items-center gap-2 text-sm text-text">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Identity verified
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-text">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Worker screening verified
              </p>
            </div>
            <p
              className={`mt-3 text-left text-sm ${needsAttentionClass(!worker.planConfirmed)}`}
            >
              {worker.planConfirmed ? 'Support plan confirmed' : 'Support plan needs review'}
            </p>
          </Card>
        </aside>

        <div className="min-w-0 space-y-6">
          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">About</h2>
            <p className="mt-3 text-sm text-text-strong">
              I’m a disability support worker with {yearsExperience} years of experience supporting
              people at home and in the community. I enjoy building steady routines, helping people
              stay connected, and working closely with{' '}
              {client
                ? `other workers supporting ${data.location.name}.`
                : 'each location’s wider support workers.'}
            </p>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Availability</h2>
            <div className="mt-3 space-y-3">
              {AVAILABILITY.map(([day, ...times]) => (
                <div key={day} className="flex items-start gap-4">
                  <p className="w-24 shrink-0 text-sm font-medium text-text">{day}</p>
                  <div className="flex flex-wrap gap-2">
                    {times.map((time) => <Tag key={time}>{time}</Tag>)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Support offered</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
              {SUPPORT_AREAS.map((area) => (
                <li key={area} className="flex items-center gap-2 text-sm text-text">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  {area}
                </li>
              ))}
            </ul>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Verified documents</h2>
            <ul className="mt-3 divide-y divide-border-subtle">
              {['NDIS Worker Screening Check', 'Working with Children Check', 'First aid certificate'].map((document) => (
                <li key={document} className="flex items-center gap-2 py-3 first:pt-0 last:pb-0">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  <span className="text-sm text-text">{document}</span>
                  <span className="ml-auto text-xs text-text-secondary">Verified</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Qualifications</h2>
            <ul className="mt-3 space-y-3">
              {QUALIFICATIONS.map((qualification, index) => (
                <li key={qualification}>
                  <p className="text-sm font-medium text-text">{qualification}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Completed {2021 + index} · Self declared
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Work history</h2>
            <div className="mt-3 space-y-4">
              <div>
                <p className="text-sm font-medium text-text">Disability Support Worker</p>
                <p className="mt-1 text-sm text-text-secondary">Community support provider</p>
                <p className="mt-1 text-xs text-text-secondary">2022 – Present</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text">Support Worker</p>
                <p className="mt-1 text-sm text-text-secondary">Independent support work</p>
                <p className="mt-1 text-xs text-text-secondary">2019 – 2022</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
