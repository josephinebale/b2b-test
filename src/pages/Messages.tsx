import { useEffect, useMemo, useState } from 'react';
import { Info, MoreHorizontal } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import {
  LANDING_CONTENT_ENABLED,
  LandingPlaceholder,
} from '../components/LandingPlaceholder';
import { PageHeading } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import { IconButton } from '../components/ui/IconButton';
import {
  buildConversationsForLocation,
  type Conversation,
} from '../data/conversations';
import { formatTime } from '../lib/date';
import type { Persona } from '../lib/informationArchitecture';
import { EMPTY_STATES, workerProfilePath } from '../lib/pageContent';
import { href } from '../lib/router';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function ordinal(day: number): string {
  if (day % 10 === 1 && day % 100 !== 11) return `${day}st`;
  if (day % 10 === 2 && day % 100 !== 12) return `${day}nd`;
  if (day % 10 === 3 && day % 100 !== 13) return `${day}rd`;
  return `${day}th`;
}

function listDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]} ${date.getFullYear()}`;
}

function dividerLabel(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${ordinal(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${formatTime(date)}`;
}

function previewForPersona(preview: string, personaName: string): string {
  const ownPrefix = `${personaName}: `;
  return preview.startsWith(ownPrefix)
    ? `You: ${preview.slice(ownPrefix.length)}`
    : preview;
}

type MessagesProps = {
  locationId: string;
  persona: Persona;
  onUnreadChange: (count: number) => void;
};

export function Messages({ locationId, persona, onUnreadChange }: MessagesProps) {
  const [conversations, setConversations] = useState(() =>
    buildConversationsForLocation(locationId),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    onUnreadChange(
      buildConversationsForLocation(locationId).reduce(
        (sum, item) => sum + item.unread,
        0,
      ),
    );
  }, [locationId, onUnreadChange]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter(
      (conversation) =>
        conversation.workerName.toLowerCase().includes(needle) ||
        conversation.locationName.toLowerCase().includes(needle) ||
        conversation.preview.toLowerCase().includes(needle),
    );
  }, [conversations, search]);

  const visible = filtered.slice(0, visibleCount);
  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;

  const selectConversation = (conversation: Conversation) => {
    setShowArchived(false);
    setSelectedId(conversation.id);
    setDraft('');
    if (conversation.unread === 0) return;

    const next = conversations.map((item) =>
      item.id === conversation.id ? { ...item, unread: 0 } : item,
    );
    setConversations(next);
    onUnreadChange(next.reduce((sum, item) => sum + item.unread, 0));
  };

  const markAllRead = () => {
    const next = conversations.map((item) => ({ ...item, unread: 0 }));
    setConversations(next);
    onUnreadChange(0);
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (!text || !selected) return;
    const next: Conversation[] = conversations.map((item) => {
      if (item.id !== selected.id) return item;
      return {
        ...item,
        preview: `${persona.name}: ${text.length > 38 ? `${text.slice(0, 38).trim()}...` : text}`,
        at: new Date(),
        messages: [
          ...item.messages,
          {
            id: `${item.id}-${Date.now()}`,
            from: 'provider',
            senderName: persona.name,
            text,
          },
        ],
      };
    });
    setConversations(next);
    setDraft('');
  };

  return (
    <div>
      {LANDING_CONTENT_ENABLED ? (
        <>
      <PageHeading
        title="Messages"
        actions={
          <>
          <Button
            type="button"
            variant="ghost"
            size="small"
            onClick={() => {
              setShowArchived(true);
              setSelectedId(null);
            }}
          >
            Archived
          </Button>
          <Button
            type="button"
            onClick={markAllRead}
            size="small"
          >
            Mark all as read
          </Button>
          </>
        }
      />

      <Card className="layout-master-detail messages-shell">
        <div className="flex min-h-0 min-w-0 flex-col border-r border-border-subtle">
          <form
            className="flex items-center gap-2 border-b border-border-subtle p-3"
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(query);
              setVisibleCount(8);
            }}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search messages"
              className="h-9 min-w-0 flex-1 rounded border border-border px-3 text-sm"
              aria-label="Search conversations"
            />
            <Button type="submit">
              Search
            </Button>
            <PinnedQuestion questionId="messages-conversations" />
          </form>

          <ul className="min-h-0 flex-1 overflow-auto">
            {visible.length === 0 ? (
              <li className="px-4 py-10 text-center">
                <p className="text-lg font-bold text-text">
                  {EMPTY_STATES.conversations.title}
                </p>
                <p className="mt-1 max-w-content mx-auto text-sm text-text-secondary">
                  {EMPTY_STATES.conversations.description}
                </p>
              </li>
            ) : (
              visible.map((conversation) => {
                const active = conversation.id === selectedId;
                return (
                  <li key={conversation.id} className="border-b border-border-subtle last:border-b-0">
                    <div
                      className={`ui-inset-row ui-target-row flex w-full items-start gap-3 text-left ${
                        active ? 'ui-target-row--active' : ''
                      }`}
                    >
                      <Avatar name={conversation.workerName} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <EntityLink
                            href={href('/messages')}
                            className="ui-entity-link--plain ui-target-row__link truncate"
                            onClick={(event) => {
                              event.preventDefault();
                              selectConversation(conversation);
                            }}
                          >
                            {conversation.workerName}
                          </EntityLink>
                          <span className="shrink-0 text-xs text-text-tertiary">
                            {listDate(conversation.at)}
                          </span>
                        </span>
                        <span className="mt-1 flex items-start justify-between gap-2">
                          <span className="line-clamp-1 text-sm text-text-secondary">
                            {previewForPersona(
                              conversation.preview,
                              persona.name,
                            )}
                          </span>
                          <Badge count={conversation.unread} />
                        </span>
                        <span className="mt-1 block truncate text-xs text-text-tertiary">
                          {conversation.locationName}
                        </span>
                      </span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          {filtered.length > visibleCount && (
            <div className="border-t border-border-subtle p-3">
              <Button
                type="button"
                onClick={() => setVisibleCount(filtered.length)}
                className="w-full"
              >
                More conversations
              </Button>
            </div>
          )}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {showArchived ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-selected text-text-secondary">
                <Info className="h-5 w-5" />
              </span>
              <p className="mt-4 text-lg font-bold text-text">
                {EMPTY_STATES.archivedConversations.title}
              </p>
              <p className="mt-1 max-w-content text-sm text-text-secondary">
                {EMPTY_STATES.archivedConversations.description}
              </p>
            </div>
          ) : selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
                <Avatar name={selected.workerName} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    <EntityLink href={href(workerProfilePath(selected.id))}>
                      {selected.workerName}
                    </EntityLink>
                    {' '}
                    <span className="font-normal text-text-secondary">(Support worker)</span>
                  </p>
                  <p className="truncate text-xs text-text-tertiary">
                    {selected.locationName}
                  </p>
                </div>
                <Button
                  href={href('/request-booking')}
                  variant="primary"
                  size="small"
                >
                  Book
                </Button>
                <IconButton
                  type="button"
                  size="small"
                  aria-label="More actions"
                  data-tooltip="More actions"
                  className="ui-tooltip"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </IconButton>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-auto px-6 py-6">
                <p className="text-center text-sm text-text-tertiary">{dividerLabel(selected.at)}</p>
                {selected.messages.map((message) => {
                  if (message.from === 'provider') {
                    const senderLabel =
                      message.senderName === persona.name
                        ? 'You'
                        : message.senderName;
                    return (
                      <div key={message.id} className="ml-auto max-w-4/5 text-right">
                      <p className="mb-1 text-xs text-text-secondary">
                        {senderLabel}
                      </p>
                      <p className="inline-block rounded bg-brand px-3 py-2 text-left text-sm text-surface">
                        {message.text}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">{formatTime(selected.at)}</p>
                    </div>
                    );
                  }
                  return (
                    <div key={message.id} className="flex max-w-4/5 gap-2">
                      <Avatar name={selected.workerName} size="sm" />
                      <div>
                        <p className="text-xs text-text-secondary">
                          <EntityLink href={href(workerProfilePath(selected.id))}>
                            {selected.workerName}
                          </EntityLink>
                          {' · Support worker'}
                        </p>
                        <p className="mt-1 inline-block rounded bg-surface-selected px-3 py-2 text-sm text-text">
                          {message.text}
                        </p>
                        <p className="mt-1 text-xs text-text-tertiary">{formatTime(selected.at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                className="flex items-end gap-2 border-t border-border-subtle p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendDraft();
                }}
              >
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={2}
                  className="message-composer-input min-w-0 flex-1 resize-none rounded border border-border px-3 py-2 text-sm"
                  aria-label="Write a message"
                />
                <Button
                  type="submit"
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-selected text-text-secondary">
                <Info className="h-5 w-5" />
              </span>
              <p className="mt-4 text-lg font-bold text-text">
                {EMPTY_STATES.conversationSelection.title}
              </p>
              <p className="mt-1 max-w-content text-sm text-text-secondary">
                {EMPTY_STATES.conversationSelection.description}
              </p>
            </div>
          )}
        </div>
      </Card>
        </>
      ) : (
        <LandingPlaceholder />
      )}
    </div>
  );
}
