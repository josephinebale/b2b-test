# House Manager dashboard prototype

A prototype of the provider experience for a House Manager who runs a single SIL location, built to
match the existing Hireup for Providers UI. React, Vite and Tailwind, no other dependencies.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3021/

## Checking it still compiles

```bash
npm run lint
```

## What is built

- **Dashboard**, scoped to the selected node: the location face has notifications, upcoming
  bookings, and most-booked workers; the grouping face compares waiting counts, urgent requests,
  and recent Hireup booking volume across locations.
- **Location switcher** in the global nav. Switching keeps you on the page you are on
  and swaps the location context.
- **First run**: a simple branded holding screen starts the prototype without credentials, then
  opens "Choose your location". After choosing, return visits open the last location.
- **Bookings**, scoped to the selected location: status views, worker and date filters, a
  "Bookings I have created" toggle, and booking detail cards.
- **Workers**, scoped to the selected node. At a location it leads with the location team, followed
  by workers known elsewhere in the grouping and people available nearby. At the grouping it ranks
  everyone with provider history by shifts and locations worked. Both faces include search.
- **Messages**, scoped to the selected location: conversation list, empty state, and a
  thread view matching the existing Messages layout. Switching location switches the inbox.
- **Settings** for this location, the organisation, and Helen’s account. The account menu goes to
  Your account or Log out. Location settings includes an editable worker-facing profile and preview.

## Annotations (for research sessions)

The eye control at the bottom right shows or hides discussion-guide pins beside selected UI
elements. Pins open the question text only. Visibility is saved in the browser under
`hm.sessionQuestions`, so it survives a reload during a session. The restart control beside it
returns to the holding screen for the next participant.

## Testing the first-run experience

The account menu (top right) has **Log out**. That screen offers:

- **Log back in** — returns you to the location you were last in.
- **Log in as a new user** — forgets the remembered location so you see "Choose your location" again.

## Placeholder data

Five alphabetised public Cerebral Palsy Alliance SIL listing names and suburbs, each with its own
placeholder workers and bookings, plus nearby workers with no provider history. Private street
addresses are not used. Bookings are generated from a fixed seed relative to today, so the data is
stable between reloads but the week view always includes today. See `src/data/locations.ts`.

## Booking requests

The prototype includes a three-step booking request flow for location and time, support details,
and worker selection. Selection shows available location workers first, then available workers
known elsewhere in the grouping; nearby workers appear only when both are empty. Submitted
requests appear in the Requested bookings list and open into a status and detail view. Created
requests are kept for the current app session rather than sent to a backend.

## Not built

Jobs, invoices as a real product, settings content, booking-request tier gating, worker fatigue,
hover profile previews, role-based entry nodes, and personas.
