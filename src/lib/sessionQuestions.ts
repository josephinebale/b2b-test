import { ROUTES } from './informationArchitecture.ts';
import { WORKERS_ROUTE } from './pageContent.ts';

export type SessionQuestionsState = {
  annotationsVisible: boolean;
};

const KEY = 'hm.sessionQuestions';
export const SESSION_QUESTIONS_CHANGE_EVENT = 'hm.sessionQuestions:change';

const PAGE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/bookings': 'Bookings',
  [WORKERS_ROUTE]: 'Workers',
  '/messages': 'Messages',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/support-plan': 'Support plan',
  '/report-incident': 'Report incident',
  '/knowledge-hub': 'Knowledge hub',
  '/invoices': 'Invoices',
  '/help-centre': 'Help centre',
  '/contact': 'Contact us',
  '/terms': 'Terms of use',
  '/privacy': 'Privacy policy',
  '/request-booking': 'Request booking',
};

export function createDefaultSessionQuestions(): SessionQuestionsState {
  return {
    annotationsVisible: false,
  };
}

export function pageLabel(path: string): string {
  if (path === '/request-booking') return 'Request booking';
  if (path.startsWith('/bookings/request/')) return 'Requested booking';
  if (
    path === ROUTES.manageLocation ||
    path.startsWith(`${ROUTES.manageLocation}/`) ||
    path === '/manage-house' ||
    path.startsWith('/manage-house/')
  ) {
    return 'Location settings';
  }
  if (
    path === ROUTES.organisationSettings ||
    path.startsWith(`${ROUTES.organisationSettings}/`)
  ) {
    return 'Organisation settings';
  }
  if (
    path === ROUTES.yourAccount ||
    path.startsWith(`${ROUTES.yourAccount}/`)
  ) {
    return 'Your account';
  }
  return PAGE_LABELS[path] ?? path;
}

export function parseSessionQuestions(raw: string | null): SessionQuestionsState {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (typeof parsed !== 'object' || parsed === null) return createDefaultSessionQuestions();

    const state = parsed as Partial<SessionQuestionsState>;
    return {
      annotationsVisible:
        typeof state.annotationsVisible === 'boolean'
          ? state.annotationsVisible
          : false,
    };
  } catch {
    return createDefaultSessionQuestions();
  }
}

export function readSessionQuestions(): SessionQuestionsState {
  try {
    return parseSessionQuestions(window.localStorage.getItem(KEY));
  } catch {
    return createDefaultSessionQuestions();
  }
}

export function writeSessionQuestions(state: SessionQuestionsState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent<SessionQuestionsState>(SESSION_QUESTIONS_CHANGE_EVENT, {
        detail: state,
      }),
    );
  } catch {
    // Prototype only; a blocked storage API just means the annotation toggle is not remembered.
  }
}
