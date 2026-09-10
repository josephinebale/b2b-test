import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  buildAllConversations,
  buildConversationsForLocation,
  unreadMessagesFromDescription,
  unreadWorkerNamesForLocation,
} from '../src/data/conversations.ts';
import { LOCATIONS, getLocationData } from '../src/data/locations.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('every conversation belongs to exactly one location, and each location has some', () => {
  const conversations = buildAllConversations();

  for (const conversation of conversations) {
    assert.ok(conversation.locationId);
    assert.ok(LOCATIONS.some((location) => location.id === conversation.locationId));
  }

  const unreadByLocation = LOCATIONS.map(
    (location) => getLocationData(location.id).unreadMessages,
  );
  assert.ok(new Set(unreadByLocation).size > 1, 'unread counts should vary by location');

  for (const location of LOCATIONS) {
    const forLocation = buildConversationsForLocation(location.id);
    assert.ok(forLocation.length > 0, `missing conversations for ${location.id}`);
    assert.ok(forLocation.every((item) => item.locationId === location.id));
    assert.equal(forLocation.length, getLocationData(location.id).workers.length);
  }
});

test('each conversation names the location the worker is affiliated with', () => {
  for (const conversation of buildAllConversations()) {
    const location = LOCATIONS.find((item) => item.id === conversation.locationId);
    assert.ok(location);
    assert.equal(conversation.locationName, location.name);
  }
});

test('a location inbox is newest first and never mixes other locations', () => {
  for (const location of LOCATIONS) {
    const conversations = buildConversationsForLocation(location.id);
    const times = conversations.map((item) => item.at.getTime());

    assert.deepEqual(times, [...times].sort((a, b) => b - a));
    assert.equal(new Set(conversations.map((item) => item.locationId)).size, 1);
  }
});

test('unread message copy names the workers with unread threads', () => {
  for (const location of LOCATIONS) {
    const names = unreadWorkerNamesForLocation(location.id);
    const expectedCount = getLocationData(location.id).unreadMessages;

    assert.equal(names.length, expectedCount);
    assert.equal(new Set(names).size, names.length);

    const description = unreadMessagesFromDescription(location.id);
    if (expectedCount === 0) {
      assert.equal(description, '');
      continue;
    }
    for (const name of names) {
      assert.match(description, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
    const relationship =
      location.serviceType === 'home-community'
        ? `${names.length === 1 ? 'has' : 'have'} supported ${location.name}`
        : `known at ${location.name}`;
    assert.match(
      description,
      new RegExp(relationship.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    );
    assert.doesNotMatch(description, /workers at/);
    assert.doesNotMatch(description, / team/);
  }
});

test('a location inbox unread count matches that location, not the organisation total', () => {
  for (const location of LOCATIONS) {
    const unread = buildConversationsForLocation(location.id).reduce(
      (sum, item) => sum + item.unread,
      0,
    );
    assert.equal(unread, getLocationData(location.id).unreadMessages);
  }
});

test('every outbound message records its sender and previews name that sender', () => {
  for (const conversation of buildAllConversations()) {
    for (const message of conversation.messages) {
      if (message.from === 'provider') {
        assert.ok(message.senderName);
      }
    }

    const last = conversation.messages[conversation.messages.length - 1];
    if (last.from === 'provider') {
      assert.match(conversation.preview, new RegExp(`^${last.senderName}: `));
    }
  }
});

test('a Dee Why thread includes both its house manager and Careforce coordinator', () => {
  const sharedThread = buildConversationsForLocation('dee-why-1').find(
    (conversation) => {
      const senders = new Set(
        conversation.messages.flatMap((message) =>
          message.from === 'provider' ? [message.senderName] : [],
        ),
      );
      return senders.has('Helen Dawson') && senders.has('Sofia Patel');
    },
  );

  assert.ok(sharedThread);
});

test('Messages renders the signed-in sender as You and names other managers', () => {
  const messages = source('../src/pages/Messages.tsx');
  const app = source('../src/App.tsx');

  assert.match(app, /<Messages[\s\S]*persona=\{persona\}/);
  assert.match(
    messages,
    /message\.senderName === persona\.name\s*\?\s*'You'\s*:\s*message\.senderName/,
  );
  assert.match(messages, /senderName: persona\.name/);
  assert.match(messages, /preview: `\$\{persona\.name\}:/);
});

test('the Messages page lists the current location inbox', () => {
  const messages = source('../src/pages/Messages.tsx');
  const app = source('../src/App.tsx');

  assert.match(messages, /buildConversationsForLocation\(/);
  assert.doesNotMatch(messages, /buildAllConversations\(\)/);
  assert.match(messages, /\{selected\.locationName\}/);
  assert.match(app, /<Messages[\s\S]*key=\{activeLocation\.id\}/);
  assert.match(app, /locationId=\{activeLocation\.id\}/);
});

test('the Messages nav badge is the current location unread count', () => {
  const app = source('../src/App.tsx');

  assert.match(app, /unreadMessages=\{unreadOverride \?\? visibleData\.unreadMessages\}/);
  assert.doesNotMatch(app, /totalUnreadMessages\(\)/);
});

test('a worker profile resolves an id from any location in the active organisation', () => {
  const profile = source('../src/pages/WorkerProfile.tsx');

  assert.match(profile, /findWorker\(workerId, data\.location\.organisation\)/);
  assert.match(profile, /known at \$\{data\.location\.name\}/);
  assert.match(profile, /history elsewhere in \$\{grouping\.name\}/);
  assert.match(profile, /nodeType === 'grouping'/);
});
