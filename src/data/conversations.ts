import { LOCATIONS, getLocationData, type LocationData } from './locations.ts';
import { addDays, startOfDay } from '../lib/date.ts';
import { personasForOrganisation } from '../lib/informationArchitecture.ts';

export type ChatMessage =
  | {
      id: string;
      from: 'provider';
      senderName: string;
      text: string;
    }
  | {
      id: string;
      from: 'worker';
      text: string;
    };

export type Conversation = {
  id: string;
  workerName: string;
  locationId: string;
  locationName: string;
  preview: string;
  at: Date;
  unread: number;
  messages: ChatMessage[];
};

const WORKER_REPLIES = [
  'Yes I can do that shift.',
  'Hi',
  'This is a response from a worker',
  'I am available next week.',
  'Yes 😎',
];

const PROVIDER_NOTES = [
  'Hello, are you available to cover a shift this week?',
  "I'd love to know more about your availability.",
  'Thank you for assisting us with last week’s bookings.',
  'What is your availability for shifts next week?',
  'Booking confirmed',
  'hey',
];

function previewFor(last: ChatMessage): string {
  if (last.from === 'provider') {
    const clipped = last.text.length > 38 ? `${last.text.slice(0, 38).trim()}...` : last.text;
    return `${last.senderName}: ${clipped}`;
  }
  return last.text.length > 42 ? `${last.text.slice(0, 42).trim()}...` : last.text;
}

/**
 * One inbox per location. Dates are offset by location so neighbouring
 * houses do not all look like they last heard from someone on the same day.
 */
function buildForLocation(data: LocationData, locationIndex: number): Conversation[] {
  const today = startOfDay(new Date());
  const workers = [...data.workers].sort((a, b) => a.name.localeCompare(b.name));
  const managerNames = personasForOrganisation(data.location.organisation).map(
    (persona) => persona.name,
  );

  const conversations = workers
    .map((worker, index) => {
      const interleaved = index * LOCATIONS.length + locationIndex;
      const at = addDays(today, -(4 + interleaved * 2));
      at.setHours(14, 20 + (index % 6) * 5, 0, 0);

      const outgoing = PROVIDER_NOTES[index % PROVIDER_NOTES.length];
      const incoming = WORKER_REPLIES[index % WORKER_REPLIES.length];
      const primarySender =
        data.location.id === 'dee-why-1' && index === 0
          ? 'Helen Dawson'
          : managerNames[(locationIndex + index) % managerNames.length];
      const followUpSender =
        data.location.id === 'dee-why-1' && index === 0
          ? 'Sofia Patel'
          : managerNames[
              (locationIndex + index + 1) % managerNames.length
            ];
      const messages: ChatMessage[] = [
        {
          id: `${worker.id}-1`,
          from: 'provider',
          senderName: primarySender,
          text: outgoing,
        },
        { id: `${worker.id}-2`, from: 'worker', text: incoming },
      ];

      if (index % 3 === 0) {
        messages.push({
          id: `${worker.id}-3`,
          from: 'provider',
          senderName: followUpSender,
          text: 'Thanks, that helps.',
        });
      }

      const last = messages[messages.length - 1];

      return {
        id: worker.id,
        workerName: worker.name,
        locationId: data.location.id,
        locationName: data.location.name,
        preview: previewFor(last),
        at,
        unread: 0,
        messages,
      };
    })
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  let unreadLeft = data.unreadMessages;
  for (const conversation of conversations) {
    if (unreadLeft <= 0) break;
    conversation.unread = 1;
    unreadLeft -= 1;
  }

  return conversations;
}

export function buildConversationsForLocation(locationId: string): Conversation[] {
  const locationIndex = LOCATIONS.findIndex((item) => item.id === locationId);
  if (locationIndex < 0) return [];
  return buildForLocation(getLocationData(locationId), locationIndex);
}

export function buildAllConversations(): Conversation[] {
  return LOCATIONS.flatMap((location, locationIndex) =>
    buildForLocation(getLocationData(location.id), locationIndex),
  ).sort((a, b) => b.at.getTime() - a.at.getTime());
}

export function unreadWorkerNamesForLocation(locationId: string): string[] {
  return buildConversationsForLocation(locationId)
    .filter((item) => item.unread > 0)
    .map((item) => item.workerName);
}

export function unreadMessagesFromDescription(locationId: string): string {
  const unread = buildConversationsForLocation(locationId).filter(
    (item) => item.unread > 0,
  );
  const names = unread.map((item) => item.workerName);
  if (names.length === 0) return '';

  const locationName = unread[0].locationName;
  const location = LOCATIONS.find((item) => item.id === locationId);
  const from =
    names.length === 1
      ? names[0]
      : names.length === 2
        ? `${names[0]} and ${names[1]}`
        : `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;

  return location?.serviceType === 'home-community'
    ? `From ${from}, who ${names.length === 1 ? 'has' : 'have'} supported ${locationName}.`
    : `From ${from}, known at ${locationName}.`;
}
