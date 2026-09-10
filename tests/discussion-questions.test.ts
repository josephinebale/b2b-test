import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DISCUSSION_QUESTIONS,
  questionById,
  questionsForPage,
} from '../src/data/discussionQuestions.ts';

test('discussion questions have unique ids and element questions have placement hints', () => {
  const ids = DISCUSSION_QUESTIONS.map((question) => question.id);

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(DISCUSSION_QUESTIONS.some((question) => question.type === 'general'));
  assert.ok(DISCUSSION_QUESTIONS.some((question) => question.type === 'element'));
  assert.ok(
    DISCUSSION_QUESTIONS
      .filter((question) => question.type === 'element')
      .every((question) => Boolean(question.elementHint)),
  );
  assert.ok(
    DISCUSSION_QUESTIONS.every(
      (question) =>
        Object.keys(question).every((key) =>
          ['id', 'page', 'type', 'text', 'elementHint'].includes(key),
        ),
    ),
  );
});

test('the catalogue covers every requested research context', () => {
  const pages = new Set(DISCUSSION_QUESTIONS.map((question) => question.page));

  for (const page of [
    '/',
    '/bookings',
    '/request-booking',
    '/notifications',
    '/messages',
    '/workers',
    '/manage-location',
    '/organisation-settings',
  ]) {
    assert.ok(pages.has(page), `missing ${page}`);
  }

  for (const hint of [
    'worker list sort order',
    'frequency radios',
    'Messages in the location navigation',
    'grouping dashboard houses, centres, and clients',
    'grouping dashboard requests ordered by urgency',
    'grouping dashboard booking volume',
    'location worker tiers and row evidence',
    'grouping worker ranking and row evidence',
    'node-relative worker search',
    'worker profile from another location',
    'available worker tiers and row evidence',
    'nearby worker fallback',
    'fatigue signal beside worker availability',
    'fatigue signal on booking card',
    'fatigue signal on booking detail',
    'location, grouping, and organisation access',
    'who the booking covers',
    'finance reference on a day-program request',
  ]) {
    assert.ok(
      DISCUSSION_QUESTIONS.some((question) => question.elementHint === hint),
      `missing ${hint}`,
    );
  }
});

test('question lookup and page grouping use the canonical catalogue', () => {
  assert.equal(questionById('request-frequency')?.elementHint, 'frequency radios');
  assert.equal(
    questionById('persona-vantage')?.text,
    'From this organisation, sector, role, and starting point, what work would you expect to be responsible for here?',
  );
  assert.ok(
    questionsForPage('/', 'general').every(
      (question) => question.page === '/' && question.type === 'general',
    ),
  );
});

test('the catalogue includes one cross-settings co-design activity', () => {
  const activities = DISCUSSION_QUESTIONS.filter(
    (question) => question.id === 'settings-co-design',
  );

  assert.equal(activities.length, 1);
  assert.equal(activities[0].type, 'general');
  assert.equal(activities[0].page, '/settings');
  assert.match(activities[0].text, /Location, Organisation, and your Account/);
  assert.match(activities[0].text, /add, rename, or move/);
});
