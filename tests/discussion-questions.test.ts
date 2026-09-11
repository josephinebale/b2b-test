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
    'frequency radios',
    'Messages in the location navigation',
    'grouping dashboard houses, centres, and clients',
    'grouping dashboard requests ordered by urgency',
    'grouping dashboard booking volume',
    'location worker tiers and row evidence',
    'grouping dashboard worker ranking and row evidence',
    'location worker search',
    'worker profile from another location',
    'available worker tiers and row evidence',
    'nearby worker fallback',
    'fatigue signal beside worker availability',
    'fatigue signal on booking card',
    'fatigue signal on booking detail',
    'breadcrumb, section navigation, and settings access',
    'who the booking covers',
    'finance reference on a day-program request',
    'shift actions above the weekly booking schedule',
    'weekly booking schedule',
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

test('location schedule questions live on Bookings, not the grouping Dashboard', () => {
  assert.equal(questionById('bookings-actions')?.page, '/bookings');
  assert.equal(questionById('bookings-week')?.page, '/bookings');
  assert.equal(questionById('dashboard-worker-order'), undefined);
  assert.ok(
    questionsForPage('/bookings', 'general').some(
      (question) => question.id === 'bookings-general',
    ),
  );
});

test('worker questions follow the moved grouping population and location-only search', () => {
  assert.equal(questionById('workers-grouping-order')?.page, '/');
  assert.equal(
    questionById('workers-grouping-order')?.elementHint,
    'grouping dashboard worker ranking and row evidence',
  );
  assert.equal(questionById('workers-search')?.page, '/workers');
  assert.equal(
    questionById('workers-search')?.elementHint,
    'location worker search',
  );
  assert.match(
    questionById('workers-search')?.text ?? '',
    /location team.*elsewhere.*nearby/i,
  );
});

test('the access question covers the breadcrumb and relocated settings', () => {
  const question = questionById('access-context');

  assert.equal(question?.page, '/bookings');
  assert.equal(
    question?.elementHint,
    'breadcrumb, section navigation, and settings access',
  );
  assert.match(question?.text ?? '', /breadcrumb/);
  assert.match(question?.text ?? '', /Settings/);
  assert.match(question?.text ?? '', /account menu/);
});

test('notification questions test person scope and supportable context', () => {
  const general = questionById('notifications-general');
  const list = questionById('notifications-list');

  assert.match(general?.text ?? '', /work assigned to you/i);
  assert.match(general?.text ?? '', /starting point/i);
  assert.equal(
    list?.elementHint,
    'persona entry notification scope and supportable labels',
  );
  assert.match(list?.text ?? '', /supportable/i);
  assert.match(list?.text ?? '', /each notification/i);
  assert.match(list?.text ?? '', /cancel/i);
  assert.match(list?.text ?? '', /assessment/i);
  assert.match(list?.text ?? '', /support plan/i);
  assert.match(list?.text ?? '', /invoice/i);
  assert.match(list?.text ?? '', /urgent/i);
  assert.match(list?.text ?? '', /checks and approvals/i);
});

test('the worker hierarchy question tests which differences stand out first', () => {
  const question = questionById('workers-location-tiers');

  assert.match(question?.text ?? '', /stand out first/i);
  assert.match(question?.text ?? '', /hours/i);
  assert.match(question?.text ?? '', /location history/i);
  assert.match(question?.text ?? '', /support plan/i);
  assert.match(question?.text ?? '', /assessments/i);
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
