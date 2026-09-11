export type DiscussionQuestion = {
  id: string;
  page: string;
  type: 'general' | 'element';
  text: string;
  elementHint?: string;
};

export const DISCUSSION_QUESTIONS: DiscussionQuestion[] = [
  {
    id: 'question-1',
    page: '/',
    type: 'general',
    text: 'What do you expect to find on this dashboard?',
  },
  {
    id: 'question-2',
    page: '/bookings',
    type: 'general',
    text: 'How do you keep track of upcoming support and gaps today?',
  },
  {
    id: 'question-3',
    page: '/bookings',
    type: 'general',
    text: 'What would you do if a booking needed attention?',
  },
  {
    id: 'question-4',
    page: '/',
    type: 'general',
    text: 'Is anything missing for managing support here?',
  },
  {
    id: 'persona-vantage',
    page: '/',
    type: 'general',
    text: 'From this organisation, sector, role, and starting point, what work would you expect to be responsible for here?',
  },
  {
    id: 'bookings-general',
    page: '/bookings',
    type: 'general',
    text: 'Talk me through how you would use this schedule to understand what is coming up, who is working, and where the gaps are.',
  },
  {
    id: 'request-general',
    page: '/request-booking',
    type: 'general',
    text: 'Talk me through how you would request a booking here.',
  },
  {
    id: 'notifications-general',
    page: '/notifications',
    type: 'general',
    text: 'Does this show the work assigned to you from the right starting point? What would you expect to be notified about here?',
  },
  {
    id: 'messages-general',
    page: '/messages',
    type: 'general',
    text: 'This conversation with the worker stays continuous, even when several managers contribute. Does that match how you coordinate and follow up?',
  },
  {
    id: 'workers-general',
    page: '/workers',
    type: 'general',
    text: 'Talk me through how you would find the next worker to ask about a shift.',
  },
  {
    id: 'settings-general',
    page: '/manage-location',
    type: 'general',
    text: 'What would you expect to manage here?',
  },
  {
    id: 'organisation-general',
    page: '/organisation-settings',
    type: 'general',
    text: 'What would you expect to manage for the organisation rather than a location?',
  },
  {
    id: 'settings-co-design',
    page: '/settings',
    type: 'general',
    text: "Walk me through what you'd expect to find under each of these settings areas — Location, Organisation, and your Account. If you were organising this menu yourself, what would you add, rename, or move?",
  },
  {
    id: 'bookings-actions',
    page: '/bookings',
    type: 'element',
    text: 'Do these links surface the shift actions that need your attention?',
    elementHint: 'shift actions above the weekly booking schedule',
  },
  {
    id: 'bookings-week',
    page: '/bookings',
    type: 'element',
    text: 'Does this weekly schedule match how you understand upcoming support, who is working, and where the gaps are?',
    elementHint: 'weekly booking schedule',
  },
  {
    id: 'grouping-locations',
    page: '/',
    type: 'element',
    text: 'A house and a client are not the same kind of waiting. Do these two lists help you decide where to go first?',
    elementHint: 'grouping dashboard houses, centres, and clients',
  },
  {
    id: 'grouping-requests',
    page: '/',
    type: 'element',
    text: 'Does this order match how you would pick which request to deal with first?',
    elementHint: 'grouping dashboard requests ordered by urgency',
  },
  {
    id: 'grouping-usage',
    page: '/',
    type: 'element',
    text: 'Does this booking volume tell you anything useful about how this grouping uses Hireup?',
    elementHint: 'grouping dashboard booking volume',
  },
  {
    id: 'workers-location-tiers',
    page: '/workers',
    type: 'element',
    text: 'Which differences stand out first here? Do hours worked and location history lead clearly enough, while support plan status and assessments still give you what you need?',
    elementHint: 'location worker tiers and row evidence',
  },
  {
    id: 'workers-grouping-order',
    page: '/',
    type: 'element',
    text: 'Do hours worked and locations worked together help you understand depth and breadth in this workforce?',
    elementHint: 'grouping dashboard worker ranking and row evidence',
  },
  {
    id: 'workers-search',
    page: '/workers',
    type: 'element',
    text: 'Does this search reach the people you need across your location team, workers from elsewhere at the provider, and nearby workers?',
    elementHint: 'location worker search',
  },
  {
    id: 'workers-profile-context',
    page: '/workers',
    type: 'element',
    text: 'Does this profile give you enough context to judge a worker who has not worked here?',
    elementHint: 'worker profile from another location',
  },
  {
    id: 'bookings-status',
    page: '/bookings',
    type: 'element',
    text: 'Do these booking groups match how you think about the work?',
    elementHint: 'booking status navigation',
  },
  {
    id: 'bookings-filters',
    page: '/bookings',
    type: 'element',
    text: 'Which filters would you use to find a booking?',
    elementHint: 'booking filters',
  },
  {
    id: 'booking-card-fatigue',
    page: '/bookings',
    type: 'element',
    text: 'Does this rest signal give you enough to judge the booking without revealing the worker’s other work?',
    elementHint: 'fatigue signal on booking card',
  },
  {
    id: 'booking-detail-fatigue',
    page: '/bookings/detail',
    type: 'element',
    text: 'What would you need to understand or do after seeing this rest signal?',
    elementHint: 'fatigue signal on booking detail',
  },
  {
    id: 'request-participants',
    page: '/request-booking',
    type: 'element',
    text: 'For this kind of location, who would you expect this booking to cover — and would you name them on the shift?',
    elementHint: 'who the booking covers',
  },
  {
    id: 'request-finance',
    page: '/request-booking',
    type: 'element',
    text: 'When would a finance reference be useful on a booking like this?',
    elementHint: 'finance reference on a day-program request',
  },
  {
    id: 'booking-card-participants',
    page: '/bookings',
    type: 'element',
    text: 'Does this tell you who the booking is for, in a way that matches the support being provided?',
    elementHint: 'who the booking covers on a booking card',
  },
  {
    id: 'request-location',
    page: '/request-booking',
    type: 'element',
    text: 'Is it clear which location this booking will belong to?',
    elementHint: 'location dropdown',
  },
  {
    id: 'request-frequency',
    page: '/request-booking',
    type: 'element',
    text: 'Do these frequency options match the bookings you usually create?',
    elementHint: 'frequency radios',
  },
  {
    id: 'request-workers',
    page: '/request-booking',
    type: 'element',
    text: 'Do hours worked, location history, support plan status, and assessments give you enough to choose someone for this shift?',
    elementHint: 'available worker tiers and row evidence',
  },
  {
    id: 'request-worker-fallback',
    page: '/request-booking',
    type: 'element',
    text: 'When nobody familiar is available, does this give you enough to decide what to do next?',
    elementHint: 'nearby worker fallback',
  },
  {
    id: 'request-worker-fatigue',
    page: '/request-booking',
    type: 'element',
    text: 'How would this rest signal affect who you choose for the shift?',
    elementHint: 'fatigue signal beside worker availability',
  },
  {
    id: 'notifications-list',
    page: '/notifications',
    type: 'element',
    text: 'Does this order put the urgent work first and separate it clearly from checks and approvals? Do worker cancellations, lapsed assessments, support plans needing review, and invoices needing approval belong here? Is it clear which supportable each notification concerns and which need you to take action?',
    elementHint: 'persona entry notification scope and supportable labels',
  },
  {
    id: 'messages-conversations',
    page: '/messages',
    type: 'element',
    text: 'Do the sender names make it clear who sent the latest message and who has contributed to the thread?',
    elementHint: 'conversation preview and outbound messages in the shared thread',
  },
  {
    id: 'messages-nav',
    page: '/messages',
    type: 'element',
    text: 'Would you look here for these conversations, or somewhere else?',
    elementHint: 'Messages in the location navigation',
  },
  {
    id: 'settings-sections',
    page: '/manage-location',
    type: 'element',
    text: 'Do these sections match what you would expect to manage here?',
    elementHint: 'settings section navigation',
  },
  {
    id: 'access-context',
    page: '/bookings',
    type: 'element',
    text: 'Does the breadcrumb make it clear which grouping and location you are in? Would you expect Location Settings in the section navigation and Organisation Settings in the account menu?',
    elementHint: 'breadcrumb, section navigation, and settings access',
  },
];

export function questionById(id: string): DiscussionQuestion | undefined {
  return DISCUSSION_QUESTIONS.find((question) => question.id === id);
}

export function questionsForPage(
  page: string,
  type?: DiscussionQuestion['type'],
): DiscussionQuestion[] {
  return DISCUSSION_QUESTIONS.filter(
    (question) => question.page === page && (!type || question.type === type),
  );
}
