# Location Manager prototype — current project

**This file (`PROJECT.md`) describes the prototype as it works today (10 September 2026).** Give it to another agent as the current-behaviour handoff. Older copies attached in other chats are out of date — use this file from `/Users/josephine/Downloads/b2b-test/PROJECT.md` only.

**Agreed future IA (not built):** [`TARGET-IA.md`](TARGET-IA.md). That file is target state only. Do not treat it as a description of this prototype. Do not copy target structure or naming into this file as if it were live. Do not edit it unless a task says to.

**Work in this folder only:** `/Users/josephine/Downloads/b2b-test`  
**Current branch:** `josephine-b2b-improvements`  
Do **not** open `/Users/josephine/Downloads/dorothy-test` — that is an older folder with the previous branch name.

GitHub Pages serves **`main`**. If this file and the live site disagree, `main` is stale.

## Read this first (for a new agent)

- **What:** Clickable research prototype of Hireup for Providers. Not a redesign. Match the existing product.
- **Who:** Twelve switchable signed-in personas across **Cerebral Palsy Alliance**, **Northcott**, and **Life Without Barriers**. **Organisation is a hard data boundary.** Role sets the entry node only and never gates access or changes a screen within that organisation.
- **Language:** Say **location**, not house. A house, centre or day program stays place-based. A client is named as a person. Disability clients display **Home and community**; aged-care clients display **Support at Home**. Sector changes labels only, never screens or behaviour. Legacy `/manage-house` URLs still rewrite to `/manage-location`.
- **Do not:** invent tokens, visual language, or dependencies. Prefer `src/components/ui`.
- **Run:** `npm install` then `npm run dev`. Open http://localhost:3021/ (hash routes, e.g. `#/bookings`).
- **Check:** `npm run lint` and `node --test tests/*.test.ts`. There are **235** source-file assertion tests — update them, do not delete them.
- **Verify UI** from **Start a session** on a fresh run; a return visit with a remembered persona should skip it. Choose-location has a stripped header.
- **Commit:** only if asked. Work on a `josephine-*` branch, never `main`. Never force-push.
- **Target IA:** if the task is building toward the research IA, also read [`TARGET-IA.md`](TARGET-IA.md) first. It is not current behaviour.

Folder: `/Users/josephine/Downloads/b2b-test`  
GitHub: `https://github.com/josephinebale/dorothy-test` (repo name is still `dorothy-test`)  
Live: `https://josephinebale.github.io/dorothy-test/`  
Stack: React 19 + TypeScript + Vite 6 + Tailwind 4. Runtime extras: `lucide-react` only.

## Run it

- Dev: `npm run dev` → http://localhost:3021/ (hash routes, e.g. `#/bookings`). The port is pinned in `package.json` to **3021**. If that port is busy, extra servers slide onto 3022, 3023, … and look like “nothing changed”. Keep **one** preview.
- Typecheck: `npm run lint` (`tsc --noEmit`).
- Tests: `node --test tests/*.test.ts` (there is no `npm test` script). Tests are mostly **source-file assertions**, not DOM tests. Removing a label or section will break them — update the assertion, do not delete it.

`README.md` is a short how-to-run note. **This file is the source of truth for current behaviour.** [`TARGET-IA.md`](TARGET-IA.md) is the source of truth for the agreed **unbuilt** IA. Keep those two distinct.

## Branch and deploy

Work on a `josephine-*` branch. Do **not** commit to `main` as the working branch. Do **not** force-push.

GitHub Pages deploys from **`main`** via `.github/workflows/deploy.yml`. `vite.config.ts` uses `base: './'` so the build works on a sub-path.

To ship: commit on the `josephine-*` branch, merge into `main`, push `main`. Until that merge, local work is invisible on the live URL.

## What it is for

A manager at one of three seeded providers, entering at the node that matches their work. Every persona carries an organisation and sector (`disability` or `aged care`). Organisation-level fields are read-only (`CAN_EDIT_ORGANISATION_DETAILS = false`).

The current **node** can be a location or a grouping. Groupings are recursive: a region, Lifestyles grouping, or caseload can contain locations, while the Careforce area contains two caseload groupings. The other scopes are the **organisation** and the signed-in person. Locations may appear beneath more than one grouping.

Twelve personas use the two existing faces:

- **Cerebral Palsy Alliance · disability**
  - **Helen Dawson — House Manager:** location face at Dee Why 1, in Northern Sydney.
  - **Marcus Lee — Regional Manager:** grouping face at Northern Sydney.
  - **Sofia Patel — Roster Coordinator:** grouping face at Careforce caseload.
  - **Ava Thompson — Team Leader:** location face at Allambie Heights Day Program, in Northern Lifestyles.
  - **Grace Kim — Regional Lifestyles Manager:** grouping face at Northern Lifestyles, over centres, day programs, and community clients.
  - **Daniel Okafor — Service Manager:** location face at Maya Nguyen’s home-and-community location, in Northern Lifestyles.
  - **Rachel Morgan — Area Manager (Careforce):** grouping face at Careforce area, whose children are the two seeded caseloads. Research says this role holds five Roster Coordinators; the prototype seeds two representative caseloads. Rostering is not the role’s primary work, but they can step in when needed.
- **Northcott · disability**
  - **Leila Hassan — Service Coordinator (SIL):** grouping face at Western Sydney SIL services, holding North Parramatta 1 and Westmead 1.
  - **Ben Carter — Coordinator, Individual Service:** grouping face at Western Sydney individual services, a separate caseload of three clients rostered individually at Northcott homes.
- **Life Without Barriers · aged care**
  - **Olivia Grant — Rostering Officer (reactive):** grouping face at Life Without Barriers’ Northern Sydney region.
  - **Ethan Murphy — Rostering Officer (forward planning):** the same Northern Sydney entry. Shift ownership is not modelled, so their faces and data scope are deliberately identical.
  - **Natalie Brooks — Rostering Lead:** grouping face at Greater Sydney, whose children are the Northern Sydney and Western Sydney regions.

All twelve can navigate anywhere within their own organisation. Nothing is hidden by role or sector, but groupings, locations, clients, provider worker history, bookings, and messages from the other two organisations do not appear.

The test used when trimming settings: **is there a surface anywhere in this product where this content is consumed?** If nothing renders it, it goes. Consumer-product leftovers (bios, profile visibility, marketplace matching fields, location photos that never display) have been removed. Two location sections are **kept on purpose for research** — see Settings below.

## Session and first run

Persisted in `localStorage`:

- `hm.prototypeStarted`
- `hm.signedIn`
- `hm.lastLocationId` (legacy house key still read)
- `hm.lastNodeType` (`location` or `grouping`)
- `hm.lastGroupingId` (any grouping id, including a nested Careforce caseload)
- `hm.personaId` (one of the twelve persona ids in `PERSONAS`)
- `hm.sessionQuestions` (research overlay)
- `hm.locationProfiles` (worker-facing profile details for each location)

No prototype-start flag → **Start a session**, a moderator landing with three title-only action cards. Each card leads with a plain 20px lucide icon at `text-text-strong`, on the left like every other identifying icon in the product (not a tinted location-marker square): **AppWindow** for Play the prototype, **ListChecks** for Jobs to be done, **Network** for Information architecture. **Play the prototype** opens **Choose a persona**, also title-only. All twelve personas are grouped by organisation using the location switcher’s grouping heading (`px-3 pb-1 pt-2`, more space above than below). Each row shows role, team and sector — the same information as the dock persona menu. Choosing a persona goes to **Log in to Hireup**, the existing simplified login: logo, tagline, and one **Login** button, with no credential fields. Login then enters that persona’s entry node with their header identity. Participants never see the persona picker once the run has started. **Jobs to be done** (`#/jobs-to-be-done`) opens the research catalogue described below; **Information architecture** (`#/information-architecture`) opens the generated structure described below. Return visits with `hm.prototypeStarted` already true skip the landing and reopen the remembered persona and node when it belongs to that persona’s organisation; stale cross-organisation selections fall back to the persona’s entry world. The header switcher can move through every grouping and location in the active persona’s organisation; role never gates access within it. Account menu: **Log out**, then **Log back in** (login screen for the current persona) or **Log in as a new user** (clears `hm.prototypeStarted` and the remembered location and returns to **Start a session**, without resetting to Helen).

The annotations **control** is not on screen. Discussion question data, `PinnedQuestion` markers, and `hm.sessionQuestions` are retained so the overlay can come back later without the catalogue rotting. Visibility still defaults to off, so markers stay hidden until a control writes that flag again. Markers still open a popover containing only the element-specific question text. There is no Session questions panel, notes list, or copy-all control.

**Every moderator control shares one dock**, bottom right (`.session-questions-controls` in `SessionQuestions.tsx`, which places the switches from `PageVariantToggle.tsx`). They are all behind-the-scenes controls, so they sit together in one corner away from participant chrome rather than in two. Order is persona menu, page variant where the page has one, then **Restart session** last.

The **persona menu** is icon-only. The closed control has no tooltip and does not name a persona, so it gives nothing away with a participant watching. Opening it groups all twelve personas under Cerebral Palsy Alliance, Northcott, and Life Without Barriers so the moderator can scan by organisation and pick one directly. Each row shows role/team and sector. Switching goes to the persona’s entry node and updates the header identity without logging out. The persona and entry survive navigation and reload; **Restart session** clears them.

On pages listed in `src/lib/pageVariants.ts`, a second icon appears beside the persona menu. It swaps the page to another version mid-session — currently only **Show more worker detail** on `/request-booking`, which adds suburb, distance, and the full platform-held training list to step 3. Provider hours, location history, support plan status, medication and driving assessments, and fatigue are part of the baseline row. The state lives in `App.tsx`, so it survives moving between steps and resets on restart.

**Restart session** sits last in the dock, furthest from the switches used mid-session. It returns to the **Start a session** landing. The consequence lives in the confirmation: *“Restart session? The persona you are signed in as, where you were up to, and any bookings created in this session will be discarded.”* On a yes it clears `hm.prototypeStarted`, the remembered location/node/grouping/persona, `hm.signedIn`, and `hm.locationProfiles`, drops in-memory bookings and the unread override, and returns to **Start a session**. It deliberately keeps `hm.sessionQuestions`, since annotation visibility is the moderator’s preference, not the participant’s state. **The confirmation is not optional** — it has been dropped once already, so `tests/discussion-guide-ui.test.ts` asserts `window.confirm` gates the only call to `onRestart` and that the dialog names the persona, the place and the bookings. The dock is not on pre-session screens; **Back** covers leaving those.

`src/data/discussionQuestions.ts` is the source of truth for question wording and metadata: `{ id, page, type, text, elementHint? }`. It stores no answers. `elementHint` is a human-readable placement description, never a selector. Markers are placed manually in page JSX. The general `settings-co-design` activity is in the catalogue for the Location, Organisation, and Account settings areas.

## Jobs to be done

Route: `#/jobs-to-be-done`. This is a moderator/stakeholder research screen outside the signed-in product. It uses the standard page width, type, spacing, `Card`, `Tag`, `Button`, product logo header and footer. The page heading is title-only, matching the other pre-session screens.

`src/data/jobsToBeDone.ts` is the source of truth. It contains **119** typed records seeded from the rebuilt root `jobs-to-be-done.xlsx` snapshot on 10 September 2026. The workbook has one job sheet; its Summary content is not copied. The workbook is not read by the app and is not kept in sync. **After this seed, add or edit jobs directly in `src/data/jobsToBeDone.ts`; do not update the workbook and expect the screen to change.** Counts and filter options are derived from the array.

Each record carries `{ id, organisation, sector, theme, job, saidBy, iaRelevant }`. IDs follow workbook order (`job-001` through `job-119`). `iaRelevant` is a boolean attribute, not a separate list. The workbook’s **Validated?** and **Notes** authoring columns are deliberately not seeded or rendered.

The screen has one list with a live matching count. A row gives the participant-worded job room to read, then shows who said it plus theme, organisation, sector, and IA relevance. There is no expandable evidence section: the job itself now carries the participant’s terms of phrase. Organisation, sector, theme, and IA relevance are four cumulative filters joined with AND; selecting more than one narrows to jobs matching every active choice. **All** leaves that dimension unconstrained. The single empty state appears when no job matches the active combination.

## Information architecture screen

Route: `#/information-architecture`. Like Jobs to be done, this is a stakeholder screen outside the signed-in product. It uses the product logo header, a title-only heading, and a short assumption list rather than boxed context cards. `src/pages/InformationArchitecture.tsx` generates the current structure directly from `ORGANISATIONS`, `PERSONAS`, `GROUPINGS`, `LOCATIONS`, their ID relationships, `serviceTypeLabel`, and `NODE_NAV_ITEMS`. It contains no persona, grouping, or location names. Adding or changing those data records updates the tree automatically; a location listed in several groupings renders beneath every direct parent. A location not yet assigned to a grouping still appears in its organisation rather than disappearing.

`NODE_NAV_ITEMS` in `src/lib/informationArchitecture.ts` is the shared source of truth for node destinations. The signed-in `AppHeader`, the location switcher’s Location settings item, and this screen all read it. A grouping resolves to **Dashboard** and **Workers**. A location resolves to **Dashboard**, **Bookings**, **Messages**, **Notifications**, **Workers**, and **Location settings**. The visualisation does not restate those lists.

All three organisation cards are open by default, while their grouping branches are collapsed so ten groupings and twenty-five locations do not become one unscannable page. Organisation and grouping summaries use the product `ChevronDown` on the right: down when collapsed, up when expanded, the same as the location switcher and account menu. Rotation is scoped to that row’s own `details`, so a nested grouping does not inherit an ancestor’s open state. A grouping summary still shows its recursively derived location count. Opening it reveals its pages, nested grouping branches, and direct locations with service-type labels. Selecting a persona removes the other organisations completely, then opens the path to that persona’s configured entry and labels the exact grouping or location **Starting point**.

The list under the heading is titled **Assumptions** and uses a bullet list. The three lines are unchanged: organisation is a hard boundary; role does not hide anything, and everyone at a provider can access and edit anything in that provider’s tree, recorded as an MVP assumption that may change; and a provider configures which node each role lands on so a person starts in the right place on first use.

## Routing

Custom hash router (`src/lib/router.ts`): `href`, `navigate`, `useHashRoute`, `canonicalPath`.

| Path | Page |
| --- | --- |
| `/` | **Start a session** when `hm.prototypeStarted` is missing; otherwise the dashboard for the current node: existing location dashboard, or grouping dashboard (houses and centres, then clients if any; requests ordered by urgency; Hireup booking volume) |
| `/jobs-to-be-done` | Filterable jobs research catalogue (from the session landing) |
| `/information-architecture` | Generated organisation, grouping, location and node-page tree with persona filter |
| `/bookings` | Bookings list (status rail), defaults to Confirmed |
| `/bookings/:status` | One rail status: `requested`, `confirmed`, `waiting`, `approve`, `next-invoice`, `invoiced` (`bookingsViewPath` / `bookingViewFromPath` in `pageContent.ts`) |
| `/request-booking` | Three-step request flow |
| `/bookings/request/:id` | Requested booking detail |
| `/bookings/detail/:id` | Detail for any calendar booking |
| `/workers` | Workers for the current node |
| `/workers/:workerId` | Worker profile |
| `/location-profile-preview` | Preview of the selected location profile workers see |
| `/messages` | Messages |
| `/notifications` | Notifications |
| `/manage-location…` | Location settings |
| `/organisation-settings…` | Organisation settings |
| `/your-account…` | Signed-in person’s account |
| stubs | Report incident, help, legal, etc. (`src/pages/Stub.tsx`) |

**Bookings** stays the active header tab on `/request-booking`, `/bookings/request/…`, and every `/bookings/:status`.

The rail writes the status into the address (`navigate(bookingsViewPath(id))`) rather than holding it in component state, so notifications can deep-link and the back button returns to the previous status. Requests-waiting notifications open `requested`; approvals notifications open `approve`. An unrecognised status falls through to the stub route, and `/bookings/request/:id` is matched first so it never reads as a status.

At any grouping node, Dashboard and Workers are the two node-relative main-nav items. The same grouping face serves a region, a Lifestyles grouping, a caseload, and the Careforce area. At the area, the existing face resolves locations recursively through its child caseloads; it does not invent a third face or a role-specific screen. Bookings, Messages, Notifications, and Location settings are unavailable until a location is entered. Direct location-scoped paths render the active grouping dashboard instead of aggregating records. Organisation settings and Your account remain available because they are not location-scoped. Old `/team` profile and list links rewrite to `/workers`.

Unknown or removed settings section IDs still resolve to that scope’s first remaining section (`sectionFromPath` in `src/lib/informationArchitecture.ts`). House aliases rewrite in `canonicalPath`.

## Placeholder data

`src/data/locations.ts`. Twenty-five placeholder locations across three providers. Each has an **organisation**, **sector**, **service type** (`sil`, `centre`, or `home-community`), and a list of **participants** (`id` and `name` only — no funding, balance, or dollar figure). The bookable entity is still the **location** in every case. A booking is always `locationId` plus `participantIds[]`; there is no `participantId` as the booking target. Sector changes labels only: a disability `home-community` location displays **Home and community**, while an aged-care `home-community` location displays **Support at Home**. It does not change screens, flows, data shape, or behaviour.

- **Cerebral Palsy Alliance · disability (twelve):** eight SIL houses (Dee Why 1, Galston 1, Gladesville 1, Hornsby, Lane Cove 1, Manly 1, North Ryde 1, Wahroonga); two centres (Allambie Heights Day Program and Brookvale Day Program); and two home-and-community clients (Maya Nguyen in Forestville and Noah Williams in Chatswood).
- **Northcott · disability (five):** two SIL houses (North Parramatta 1 and Westmead 1) plus three separately rostered home-and-community clients (Amelia Roberts, Lucas Brown, and Zara Khan). Those clients live at Northcott homes, represented by `providerSite: true`, but each remains its own bookable location.
- **Life Without Barriers · aged care (eight):** Margaret Ellis, Robert Hughes, Susan Bennett, Alan Whitfield, Patricia Moore, John Kelly, Linda Cooper, and Michael Ward. Every location is home and community with one participant and `providerSite: false`; Life Without Barriers has no SIL houses, centres, or day programs.

Suburbs only — no private street addresses.

`GROUPINGS` contains ten grouping records:

- **Northern Sydney** — six direct locations: Allambie Heights Day Program, Dee Why 1, Galston 1, Hornsby, North Ryde 1, and Wahroonga.
- **Northern Lifestyles** — the two day programs plus Maya Nguyen and Noah Williams.
- **Careforce caseload** — six direct locations: Dee Why 1, Maya Nguyen, Gladesville 1, Lane Cove 1, Manly 1, and North Ryde 1.
- **Careforce Northern caseload** — six direct locations: Galston 1, Hornsby, Lane Cove 1, Noah Williams, North Ryde 1, and Wahroonga.
- **Careforce area** — no direct locations; its children are the two Careforce caseloads.
- **Western Sydney SIL services (Northcott)** — North Parramatta 1 and Westmead 1.
- **Western Sydney individual services (Northcott)** — Amelia Roberts, Lucas Brown, and Zara Khan.
- **Greater Sydney (Life Without Barriers)** — no direct locations; its children are the Northern Sydney and Western Sydney aged-care regions.
- **Northern Sydney (Life Without Barriers)** — Margaret Ellis, Robert Hughes, Susan Bennett, and Alan Whitfield.
- **Western Sydney (Life Without Barriers)** — Patricia Moore, John Kelly, Linda Cooper, and Michael Ward.

`descendantLocationIds` resolves a grouping’s unique locations through any child groupings. Dashboard counts, requests, usage, grouping Workers, worker tiers, and fatigue use those resolved locations. This is the recursive case: the Area Manager stands at Careforce area but sees the same grouping face over both child caseloads. `GROUPING` remains Northern Sydney for compatibility.

Request pressure, approvals, messages, workers, and booking patterns differ by location. The node menu scrolls (`max-h-[70vh]`), shows only the active persona’s organisation, and renders child caseloads or regions recursively. The entry branch leads, and every grouping and location within that organisation remains reachable.

`pendingCountsForLocation` supplies request, approval, and unread-message counts beside each location. `groupingOpenRequests(groupingId)`, `groupingUsageLast7Days(groupingId)`, and `groupingWorkers(groupingId)` resolve against the active grouping without merging records upward. Plan-review counts stay on the location. Requests remain ordered by shift start then unanswered age (`requestedAt`).

The grouping dashboard splits the location list into **Houses and centres** then **Clients**. A house and a client are not comparable in one flat list: four requests at a house are roster gaps covering several residents; one request at a client’s home is that person having nobody. Order inside each section follows the grouping’s location list. Either section is omitted when empty: Northern Sydney omits Clients, while Life Without Barriers’ client-only regions omit Houses and centres. **Requests waiting** stays one urgency-ordered list. The grouping dashboard does not show booking, message, or notification content, and it does not describe staffing, vacancies, coverage, or risk. Clicking a row enters that house, centre, day program, or client’s dashboard. Clicking a request enters its requested bookings list.

Each location:

- **10–18** workers known at that location, drawn from an organisation-owned provider-history pool. A worker has one id (slug of their name) and can belong to more than one location at that provider, but seeded history never crosses organisations. Narrow one- and two-location histories sit beside workers with broader provider coverage, and shift volume remains independent of site count.
- Each provider-history worker carries deterministic platform-held medication and driving assessment status. These are not provider-side training or induction records. `providerHoursForWorker` totals completed booking duration across every location belonging to the active provider.
- Bookings carry `workerId`, `workerName`, and `participantIds`, seeded relative to **today** (stable between reloads, week view always includes today)
- **SIL** pattern is **24/7**: daytime shifts plus an overnight sleepover. A **centre** seeds daytime sessions only. **Home and community** seeds daytime visits and skips some days, so the week is not a wall of identical columns.
- Volume is deliberately **light for research sessions**. A SIL day is **2–4 bookings** (one to three day shifts plus the overnight) and a week 16–24, against 35 for a full roster. Every day fits inside `COLLAPSED_BOOKINGS_PER_DAY`, so nothing hides behind the expander and the sleepover shows without expanding.
- Day staffing **varies day to day** (`daytimeCountFor`) around each location's `DAYTIME_COUNTS` base, weighted towards the base and above. Uniform columns made the week grid read as a wall. Raise `DAYTIME_COUNTS` to go back to a dense roster.
- A worker is **not booked twice on the same day**
- Status mix: `confirmed` | `requested` | `ended`. At most **three requested bookings per week per location**, on different days. Request volume is **not the same at every location**: Gladesville 1 and Hornsby have several waiting (soon starts, some unanswered for days); Galston 1 and Lane Cove 1 have none this week and still run a full 24/7 confirmed week. Requested bookings carry `requestedAt` so unanswered age is knowable. Approvals waiting and unread messages also differ by location (`APPROVALS_WAITING`, `UNREAD_MESSAGES`).
- Private platform-calendar entries seed rest signals without exposing those entries in provider-facing data. Galston’s first daytime booking tomorrow and one available worker for a Dee Why request tomorrow at midday have four hours between bookings.

## Workers at each node

Route: `#/workers`. **Workers** appears in the main navigation at locations and every grouping. The same route resolves against the active node and grouping in the header.

At a location, three tiers appear in order:

1. **Your location team** — the people known at this location (the old Team population), alphabetised. Each row shows total completed hours at the provider, support plan status, and current/not-current medication and driving assessments. It does not repeat “Known at [location]”; the tier heading already establishes that context. “Team” survives only in this tier heading because it gives the first group a familiar, owned meaning without renaming the whole section.
2. **Worked elsewhere in Northern Sydney** — people with completed shifts at another location in the grouping, but not known here. Each row shows total completed hours at the provider, support plan status, per-location completed shift counts, and medication and driving assessment status. Hours supply depth; shifts and locations supply breadth.
3. **Available nearby** — deterministic placeholder people from Hireup’s shared marketplace, with no history at the active provider, showing suburb, distance, support plan not shared, and platform-held medication and driving assessment status.

The first tier is the full leading list; the other tiers follow below rather than appearing as equal tabs. Search filters all three. At the grouping, the default list is one provider workforce: everyone with completed booking history at that organisation, ranked by completed shifts, then number of that organisation’s locations worked, then name. A grouping search also reaches the nearby placeholder population, but those people do not appear in the default provider-history list.

Tier 1 and tier 2 are hard-scoped to the provider: another organisation cannot see a worker’s shifts, hours, or location history there. Tier 3 is deliberately not partitioned by organisation because it represents Hireup’s shared marketplace. The same marketplace identities can therefore be searched by every provider without exposing provider history.

Worker rows do not show pay level or provider-side training records. Support plan status remains on every row: confirmed or needs review for workers with provider history, and not shared for nearby workers. Grouping rows use the same evidence: provider hours, shifts and locations worked, support plan status, and platform assessments. `groupingWorkers`, `locationWorkerTiers`, `nearbyWorkers`, and `providerHoursForWorker` in `src/data/locations.ts` supply these populations and attributes.

Discussion pins cover the location tier order, grouping ranking, search reach, and the context available when a worker profile is opened from another location.

Avatars: photo files in `src/assets/avatars/`, keyed in `src/data/avatars.ts`. All twelve personas have distinct mapped photos. Square = place (`LocationMarker`). Circle = person (`Avatar`).

Created booking requests are **session-only** (`createdBookings` in `App.tsx`). They prepend onto the current location’s list and bump `requestsToAccept`. Refresh loses them.

## Booking request flow

Entry: **Request booking** (`PageHeading`) → `#/request-booking`.

1. **Location, date and time** — a location **dropdown** containing only the active persona’s organisation, already set to the location in the header. Changing it updates the header and the worker list. Continue needs a date and an end time after start. Frequency: one-off / weekly / fortnightly. The location’s **service type** is shown under the dropdown. **Who the booking covers** depends on type (see below). A SIL house does not nominate residents per shift.
2. **Details** — support description, “I’ll share all relevant support plans…”, driving radios. Optional **finance reference** only for a **centre / day program**, where the claim divisor depends on who attended. It is not shown for SIL or home and community, and participants never carry a balance.
3. **Select workers** — Workers with the requested date and time applied. `requestWorkerTiers` starts from the same location-relative populations as Workers and removes provider-history workers who overlap a confirmed Hireup booking. Requested and ended bookings do not block availability.

   Tier 1 (**Your location team**) appears first, followed by tier 2 (**Worked elsewhere in Northern Sydney**). Unavailable people are omitted rather than shown disabled. Both tiers show provider hours, support plan status, and medication and driving assessments. Tier 1 relies on its heading instead of repeating “Known at [location]” on every row. Tier 2 also retains the locations and completed-shift counts that make cross-location judgement possible. Fatigue remains a separate conditional tag. The richer moderator variant adds suburb, distance, and platform-held training without replacing this baseline evidence.

   Tier 3 (**Available nearby**) appears only when both earlier tiers are empty. Its explanation says nobody known to the location or grouping is available for that time. Nearby rows remain selectable and provide a **Message** action using the existing Messages destination. They state only what the prototype knows: suburb, distance, no history with this provider, and support plan not shared. They do not mention induction or buddy shifts. Created-request detail preserves names selected from any tier; nearby names are plain labels because no provider-history profile exists.

   Placeholder provider-worker availability marks **2:00am–5:00am on any date** unavailable for everyone with provider history, giving research sessions a reliable way to demonstrate the fallback. At other times, confirmed Hireup booking overlaps decide availability. Changing the date or time clears any earlier selections.

   Rest signals are derived by `fatigueSignalForWorker` at render time from the worker’s current confirmed and completed bookings, plus private placeholder bookings elsewhere on the platform and any session-created bookings. The booking being displayed is excluded. Zero gap or an overlap reads **No break before shift**; a positive gap under eight hours reads **Less than 8 hours rest**. The UI receives only that derived result, never the source booking’s time, location, client, provider, or shift count. Signals appear beside available workers, while no tag is shown when the worker has at least eight hours.

How a booking expresses **participants**:

- **SIL house** — `participantIds` is every resident, the same on every shift (the roster of care is set upstream). The UI keeps this in the background: no picker on request, and booking cards / week / detail do not list residents.
- **Centre / day program** — `participantIds` is who is attending that session. The request flow has **Who is attending** checkboxes; continue needs at least one. Cards, week, and detail name the people (or “N attending” in the week grid).
- **Home and community** — `participantIds` is the one named person. Request shows that name with no picker. Cards, week, and detail show the name.

Location settings **Location name** shows service type as a read-only field. Worker tiers, site coverage, fatigue, messages, and grouping faces are unchanged: a location is still a location.

`<BookingRequest key={visibleData.location.id} />` so switching location in the header **resets the draft**.

Submit writes a `requested` booking and goes to `#/bookings/request/{id}`. Detail: status stepper, workers, pricing estimate (`$72.74` / hour, same as list cards).

**Requested** list cards use `href(/bookings/request/${booking.id})`. Confirmed cards still stay on `/bookings`.

Dashboard week grid collapses to **4 bookings per day** with show more / Show less (`COLLAPSED_BOOKINGS_PER_DAY`). At current seeded volume no day reaches that cap, so the expander stays hidden; it still covers denser weeks and session-created requests. A day with no bookings shows **No bookings** on the same line as a card's first line of text, not above it: the label carries the card's own box (a transparent 1px border plus `.ui-inset-compact`) so it clears the same 9px a card's border and inset add. Do not centre it in the column — that dropped it below its neighbours and read as detached from the row. Every shift card is a whole-card link to `/bookings/detail/:id`; the detail adapts the existing requested-booking layout for requested, confirmed, and completed bookings. The neutral detail route keeps confirmed and ended shifts from being described as requests. Newly submitted requests still open their established `/bookings/request/:id` route.

Booking cards in the Bookings list and Dashboard week, plus booking detail, derive the same rest signal on every render. Cards and detail keep the booking’s own times and duration visible; the disclosure limit applies to the other work used in the calculation. Vehicle allowance is not shown on booking cards or detail. Driving required/not required remains booking support context and is separate from an allowance.

`fatigueSignalForBooking` shows the signal only while there is still a decision to make: an `ended` booking, or one whose start has already passed, returns nothing. Requested and confirmed shifts still ahead keep it. Worker selection is unaffected, because it asks about a shift that has not been created yet.

The week grid states the signal as a plain bold `text-xs` line, the same treatment the card already gives **Sleepover**, rather than as a `Tag`. `.ui-tag` is one line (`white-space: nowrap`) and `.ui-card` clips overflow, so at a seventh of the column the label lost its last word (“Less than 8 hours r”). A wrapping line fits the 112px text box in two lines at page width, and `break-words` keeps a long word from being cut in a narrow window. Tags remain correct on the wide Bookings list card and detail. Do not put the grid label back in a `Tag`, and do not loosen `.ui-tag` globally — prices and status tags depend on staying one line.

## Worker profiles

Clicking a worker name from Workers, the Dashboard’s Most booked workers list, a booking card, a requested-booking detail, or the active message thread opens `#/workers/{workerId}`. Names inside worker-selection controls and the conversation list keep their selection behaviour instead of navigating.

The profile adapts the existing Hireup worker profile into this prototype’s UI primitives: identity and verification summary, About, availability, support offered, verified documents, qualifications, and work history. Profile content is deterministic placeholder data derived from the worker’s location record.

Because a profile link can point at a worker outside the current location, `findWorker(workerId, organisation)` in `src/data/locations.ts` resolves an ID against locations in the active organisation only. At a location, the heading distinguishes someone known here from someone with history elsewhere in the active grouping. At a grouping, it summarises shifts and number of locations in that grouping. An ID with no history at the active provider shows the not-found state, even if that person has history at another organisation.

## Messages belongs to the location

Messages is a **location main-nav item** (Dashboard / Bookings / Messages / Workers), not a header utility. Notifications stays in the header identity cluster.

The conversation **list** is that location’s inbox: `buildConversationsForLocation(locationId)`. Switching location remounts Messages (`key={locationId}`) and shows that location’s threads. Each conversation record has a `locationId`. Unread counts vary by location (`UNREAD_MESSAGES`, including a quiet house with none). Rows still name the location on a quiet third line; search matches worker, preview, and location name.

A thread belongs continuously to the location and worker, not to whichever manager is currently signed in. Every outbound `ChatMessage` carries `senderName`. In the list preview and above the outbound bubble in the thread, the active persona’s name resolves to **You**; another manager’s message shows that manager’s full name. A newly sent message records the active persona. Seeded shared threads contain more than one manager, including a Dee Why 1 thread where house manager Helen Dawson and Careforce Roster Coordinator Sofia Patel have both messaged the same worker. Sender roles, permissions, and reply rights are deliberately not modelled.

The Messages **nav badge** is the current location unread count (`unreadOverride ?? visibleData.unreadMessages`), the same number as the dashboard unread-messages card, using the same inline `Badge` as Bookings. Marking threads read updates the override; switching location clears it. Notifications stay location-scoped: that page reports on the location you are in.

## Header and footer (settled)

Two tiers, `max-w-page` + `px-8` on both. The header is **not sticky** — it scrolls away with the page. The request-booking Summary still sticks, but to `top-8` (page padding), not to a 128px offset that used to clear a pinned header.

**Tier 1** (56px, `--header-identity-height`): Hireup lockup (24px, `block h-6 w-auto`) · node switcher · Notifications at a location only (36px icon-only control with a contextual badge) · account (active persona’s **sm 28px** photo and rotating chevron). Name, role, and team live in the open menu, not on the closed control — the header already shows which grouping you are standing in. The extra row height gives every 36px control 10px above and below.

**Tier 2** (48px, `--header-nav-height`): Dashboard / Bookings / Messages / Workers at a location; Dashboard / Workers at the grouping. Links use 14/20 type (`text-sm`) with 24px gaps. Inactive links use dark `--color-text-strong` at 500, not a muted grey; active links use primary body text at 700 plus a 3px body-text underline on the **row bottom** (`.main-nav-link` carries a matching 3px `padding-top` so the label stays optically centred). Type stays 14px — definition comes from weight and the underline, not size. Links are `h-full`. Bookings and Messages use the inline nav `Badge`. The two row heights total 104px; the 1px separator sits between them. Header bottom hairline is `box-shadow: 0 1px 0` on `.app-header` — it sits **under** the active underline, not on top of it.

**Footer:** unchanged by the header refresh. Compact logo **18px** (`block w-auto`), row `flex items-center`, `py-3`, `--footer-gap`.

### Alignment traps (do not “fix” with extra padding)

- `.ui-button--default` is **unlayered CSS**: `height: 2.25rem; padding: 0 var(--space-4)` (16px). Header dropdown triggers also carry the later `.header-menu-trigger`, which intentionally gives both account and location controls 36px height and 8px horizontal padding.
- `.ui-button` already `inline-flex` + `align-items: center` + `gap: var(--space-2)`.
- An input placed beside a button must come down to the button’s 36px (`h-9`), not the other way round: button height is unlayered CSS, so a Tailwind height on the button is a silent no-op. Stacked form fields with labels stay 40px (`h-10`). Any row mixing controls also needs `items-center`, or the default stretch top-aligns them (this was the Messages search row: 40 / 36 / 28px, all top-aligned).
- `.header-menu-trigger` supplies the shared location/account height, radius, 12px gap (`--space-3`, same as list rows next to an avatar), and subtle hover. Both use one ChevronDown which rotates while open. **Both are contained**, with the same 1px `--color-border` and white fill as the icon buttons beside them, so every control in the row is bounded. That forces their contents down a step: a 36px trigger leaves a 34px content box, and the avatar and location marker were themselves 36px, so the border cut straight through them. Both drop to **28px** — the account uses `Avatar size="sm"` and the trigger uses `LocationMarker size="sm"`. The marker keeps 36px everywhere else (`size="md"`, the default), because in list rows it stands beside a 36px avatar. There is no way to contain these without shrinking the contents; growing the triggers to 44px was the alternative and it unbalances them against the 36px icon buttons.
- Neither trigger has a pull-back any more, and **do not reintroduce one**. `margin-inline-start` on the location switcher and `-mr-4` on the account trigger existed only because the triggers' 8px insets were invisible, so the marker and avatar had to be dragged out to line up with the logo and the page edge. Now the bordered box is the visible edge and aligns on those itself: measured, the logo and nav both start at 32px, the logo and the switcher sit 24px apart, and the account box ends 32px from the right edge. Keeping the pulls would overhang the page padding. The logo and location switcher sit in a `gap-6` (24px) cluster — the same step as the nav links. The 24px hairline that used to sit between them is **gone, and should not come back**: it was there to separate the logo from a borderless trigger, and once the trigger became a bordered box the line and the border were two separators doing one job. A boxed control is already visibly its own object, so the rule is that a divider earns its place only next to something unbounded. The outer identity row stays `gap-4` between this cluster and the utilities.
- Badge: 18px height, `min-width: 1.125rem`, 6px horizontal padding (`calc(var(--space-1) * 1.5)`), `leading-none` / flex centre, and `tabular-nums`. Digits are already centred by the flex box — 4px padding made the pill look cramped rather than off-centre, so the fix was air, not alignment. Two digits render 27.5px wide, one digit 19.7px. Colour remains `#D6244A` (about 4.99:1 with white, so no token change was needed). Header utility badges are overlaid at the top-right with a 2px surface-coloured separation ring; the Bookings and Messages nav badges remain inline.
- A button uses an icon or a text label, not both, except the two header menus: the account trigger is avatar plus chevron, and the location trigger is marker, name, and chevron. Those extras are identity or navigation, not decoration. Icon-only controls keep accessible labels. Icons stay `h-5 w-5` (20px), with one sanctioned exception: a glyph inside the 32px `size="small"` IconButton drops to `h-4 w-4` (16px). That is a **pairing, not a second free size** — 20px in the 36px control and 16px in the 32px one both leave exactly 8px on each side, so the two controls look equally inset rather than the small one looking tighter. `tests/icon-size.test.ts` enforces it by checking each 16px glyph really does sit inside a small IconButton, so the size cannot leak out to loose icons.
- Repeated actions in a dense list use the 32px control: the Dashboard's Most booked workers Message and Book buttons take the same `size="small"` as the week arrows, 8px apart. Standalone controls that are not in a list — the header utilities, the research dock, the row overflow menus on Workers and Settings — stay at 36px.
- Location marker: `h-9 w-9 rounded-lg`, no border/ring, one green for every location (`#E6F2E8` / `#216B2D`).

## Visual consistency rules

- Standard page shell: 32px top padding and 24px between `PageHeading` and the first content block. Do not remove page headings, including Dashboard. Dashboard’s heading action is **Request booking** only; **Report incident** stays on booking cards, not the Dashboard.
- Container insets come from one three-step scale, picked by density rather than a single number everywhere. `.ui-inset-compact` (8px) is for dense data cells — the Dashboard week grid and the booking chips inside it, where seven columns share one row. `.ui-inset-row` (12px vertical, 16px horizontal) is for list rows — Workers, Most booked workers, Messages, Notifications, Settings people, Choose location, and the nested worker card on a booking. The horizontal 16px matches the card step, so row content and card content share one left edge. `.ui-inset-card` (16px) is for cards holding prose or several blocks. Larger standalone settings sections keep their 24px inset.
- One heading block per page, like Workers: title, description, and the page action inline in the same row. Bookings keeps **Bookings** as its title with **Request booking** on the right; the selected view (`activeLabel` — Confirmed, Requested, and so on) and its “Showing 1 – 40 of N …” count head the results column instead, next to the rail that changes them. Folding the view name into the page heading was tried and reverted.
- Colour signals status or interactivity. On the Dashboard week grid, only `requested` cards are tinted because they need a decision; `confirmed` and `ended` cards stay white with quiet status pills.
- Whole-surface links use the same flat interaction treatment: `ui-target-row` for stretched-link rows and `ui-linked-surface` for a link wrapping a card. Both transition only background and border colour over 150ms, use `surface-subtle` on hover and `surface-selected` while pressed, and keep the blue focus outline. Requested cards mix the existing pending surface and pending colour so their decision signal does not disappear on hover. Do not add chevrons, movement, or shadows — those crowd the seven-column grid or make a data tile look like a floating overlay.
- **A clickable thing says so at rest, and how it says so depends on whether it has text of its own.** An entity name that navigates takes the link treatment through `a.ui-entity-link` — brand blue, underlined. It is keyed to the *element*, not an opt-in class, so a name that opens a profile cannot ship looking like dead text; that is exactly how the old Team list read for months while the dashboard worker list beside it was blue. Rendered `as="span"` (Settings people, Choose location, nearby workers without local profiles) it is a label and keeps the plain strong-text treatment. The Messages conversation list opts out with `a.ui-entity-link--plain`, because its name selects a conversation in the pane beside it rather than navigating and the row already carries a selected state; the opt-out matches the base rule's specificity, so it must stay **after** it in the file.
- Week-grid cards get no text cue at all. The card is one link to the booking and the worker name inside it is not separately clickable, so styling that name as a link would promise a profile and deliver a booking. The tile carries the affordance instead: `.ui-linked-surface > .ui-card--default` takes a full-strength `--color-border` at rest rather than the `--color-border-subtle` a static card uses. Hover then moves only the fill, matching how a pending card in the same grid already behaves — there is no `gray-400`, so a darker hover border would have to jump to `gray-500` and read as heavy.
- **One hover for every text link: lose the rest-state underline and deepen to `--color-brand-hover`.** All three treatments resolve to it — `.ui-link` (the standard link), `a.ui-entity-link` (a name that opens a profile), and `.ui-target-row__link--text` (a row's own link) — so hovering a link never depends on which screen it is on. Use `.ui-link` rather than hand-rolling `text-brand underline hover:text-brand-hover`; that pattern was written out longhand in seven places and six of them silently missed the hover. `.ui-link--flush` is the one variant: the week grid's expand control spans the card and sits on its bottom edge, so its focus ring is inset `-2px` instead of outset. It must stay **after** the shared `:focus-visible` rule to win. The footer follows it too, through `.ui-link--muted`: those links stay secondary grey rather than brand blue, but they now carry the underline at rest and lose it on hover like everything else. They previously did the exact inverse — no underline until hover — which meant hovering meant two opposite things depending on where you were on the page. The variant sets colour only, so it must stay **after** `.ui-link` to win.
- A link **nested** inside an interactive surface — currently just the worker link on a Bookings card, which opens a profile while the card opens the booking — carries `.ui-nested-link` and answers on its own. While the pointer is on it the row holds its rest state, so two destinations are never lit at once, and the link drops the underline it carries at rest and deepens to `--color-brand-hover`. Losing an underline is a change only the link can make, so it cannot be misread as the surface behind it highlighting. This is deliberately **not** applied to a link that *is* its row's own link (Workers, Notifications, the dashboard worker list): those share the row's destination and should highlight together. The suppression is written as `:not(:has(.ui-nested-link:hover))` on the row's hover and active rules rather than a background override, so it does not have to guess the row's rest colour; `.ui-target-row--active` is excluded by name rather than out-specified, so a selected row keeps its blue through hover.
- Booking prices use neutral tags, not success green.
- List rows keep one line: avatar, name, then row actions right-aligned and centred against the avatar. The Dashboard’s Most booked workers rows use 36px icon-only `IconButton`s (`MessageSquare` for Message, `Calendar` for Book) with `aria-label` and a matching tooltip, so a narrow column does not push actions onto a second line.
- **Every icon-only button carries an outline at rest.** `.ui-icon-button` itself sets the 1px `--color-border` and white `--color-surface`, so the outline is the base rather than an opt-in prop — a new icon button cannot ship bare by leaving something off. Emphasis-per-setting was tried and abandoned: outlining only standalone controls (week arrows, research dock) while dense row actions took a grey `--subtle` fill and header utilities took no chrome at all left three resting states on one screen, and the grey fill read as a tag or a location marker rather than a control. Adjacent actions sit 8px apart. Because the class is unlayered CSS its background beats any Tailwind `bg-*` utility, so the header's selected state needs the plain `.header-utility--active` class; a utility there paints nothing. Decorative icons — the glyphs on notification summaries — stay bare `lucide` glyphs, and that contrast is now the whole tell. Controls that already pair an icon with a label or an avatar (the location switcher, the account trigger) are exempt; their text carries the affordance.
- Tooltips sit **under** their trigger, centred, everywhere. The moderator dock is the only exception: its tooltips flip above and anchor to their inner edge, because a centred tooltip on a corner button overhangs the viewport even while hidden and gives the page a horizontal scrollbar. `.ui-card--divided` is `overflow: visible` and rounds its own first and last rows instead (`calc(var(--radius-lg) - 1px)`, inset by the border), so a row action's tooltip can hang below the card. Do not put `overflow: hidden` back on it — that clips the tooltip, and the old workaround of flipping it to the side of the button reads as misplaced. Raising the tooltip's own `z-index` does not lift it out of its row: `.ui-target-row__action` needs `z-index: 2` to clear the stretched link, and that makes each row's actions a stacking context, so the tooltip is trapped inside it and the next row's actions paint straight over it. `.ui-target-row__action:hover, :focus-within` lifts the row being pointed at to `z-index: 3` instead. This only became visible once icon buttons gained a background — while they were transparent there was nothing to cover it.
- Rail navigation on Bookings and all Settings scopes uses the same active treatment: **4px** body-text left marker, `px-3 py-2`, quiet blue selected background (`bg-info-surface`), and **bold labels at rest**. The marker takes body text colour rather than brand blue, matching the active nav underline in the header.
- Dividers stay only where they separate adjacent content that would otherwise read as one group. The line above Bookings filters is intentionally absent; the rail’s 16px gap separates navigation from filters.

## Layout archetypes

- Page shell: 1440px (`--container-page: 90rem`), main `px-8 pt-8 pb-4`.
- Narrow column: `--narrow-column-width: 20rem` (320px). Do not invent per-page sidebar widths.
- Bookings + Settings: `layout-rail-content`.
- Messages: `layout-master-detail`. The shell is a **definite** `height: var(--messages-shell-height)` with `grid-template-rows: minmax(0, 1fr)`, and both columns carry `min-h-0`. All three are needed: with only a height the grid row still stretches to its content, and without `min-h-0` a column refuses to shrink, so the list grows instead of scrolling. Conversation rows carry the divider on the `li` with `last:border-b-0`, so the list finishes on one line rather than doubling up against the next element.
- Dashboard: `layout-content-aside`.
- Workers / stubs: `width-main-column`.

## Design tokens (`src/index.css`)

Do not add tokens. Prefer primitives in `src/components/ui/`.

**Spacing trap:** named `--space-1`…`--space-8` = 4, 8, 12, 16, 24, 32, 40, 48px. Tailwind numbered utilities multiply `--spacing` (4px): `gap-6` = **24px**, `px-8` = **32px**. Do not equate `*-6` with `--space-6`.

| Token | Value |
| --- | --- |
| Brand | `#1424E0` (hover `#0F1CB8`) |
| Badge | `#D6244A` |
| Page | `#eff1f5` |
| Radii | control 4px, surface 8px |
| Avatars | sm 28, md 36, lg 44 |
| Type | xs 12/16, sm 14/20, md 16/24, lg 20/28, xl 24/32. Weights 400 / 500 / 700 |

Primitives: `Button`, `IconButton`, `Card` (incl. `tone="subtle"`), `Badge`, `Tag`, `EntityLink`, `Avatar`.

Type hierarchy already tightened: card / empty titles `text-sm font-bold`; page title `text-xl font-bold`.

## Menus

Defined in `src/lib/informationArchitecture.ts` plus the two header menus.

**Node menu** (`LocationSwitcher`): the active persona’s organisation is a plain, non-interactive label, with the root branch containing their entry grouping first. Only that organisation’s groupings and locations render. Careforce caseloads and Life Without Barriers regions nest recursively beneath their parent areas. A location belonging to several groupings appears under each relevant direct parent; choosing it sets that grouping as context. Every grouping and location in the organisation stays reachable regardless of role. The list scrolls if the window is short. Selecting any grouping opens the same grouping Dashboard. After a divider, **Location settings** (`/manage-location`) appears for a house, centre, or day program; a client uses **[Name] settings** on the same route. **Organisation settings** (`/organisation-settings`) appears at either node and uses the selected node’s organisation name.

**Account menu** (`AppHeader`): closed control is avatar and chevron only (accessible name still includes the persona). Open menu: identity heading for the active persona (name plus role/team), **Your account** (`/your-account`), a separator, **Log out**. Account page sections are not duplicated as extra menu rows. No row icons.

## Settings (three scopes)

Still three destinations with a **left rail** per scope (not one dumped settings page). Routes and surviving section IDs are unchanged.

**Location settings** (`/manage-location`) uses entity-specific labels without changing its route, section IDs, structure, or stored location model.

For a house, centre, or day program, the heading remains **Location settings** and the existing language remains place-based:

- Location profile — editable worker-facing About, support locations, broad support needs, safety information, and support required; includes **Preview profile**
- Support worker preferences
- Support plan — **kept for research**. A house-level plan is likely leftover from one-client matching; ask the participant whether a SIL house has one plan or many.
- Location name — **kept for research**. Names are public CPA SIL listing names; ask whether a house manager would rename them.
- People (load-bearing for roles and access)

For a client, the page heading is **[Name] settings**. Its rail uses **[Name] profile**, **Support worker preferences**, **Support plan**, **Personal details**, and **People with access**. Profile copy uses **About [Name]**, **At home**, **Support needs**, and **Help at home**. The details card uses **[Name] details**, **Name**, and **Support type**. Support-plan and access helper text says workers are booked to support the named person rather than booked at a location. Profile preview follows the same language.

Removed from this scope: location picture (the marker is initials, no photo renders), support areas, specialised support, COVID-19.

Location profile edits persist per location in `hm.locationProfiles`. The preview deliberately uses broad location-level information only: never add resident names, diagnoses tied to individuals, private addresses, or booking-specific support-plan details.

**Organisation settings** (`/organisation-settings`): organisation details, financial details, documents, people. Whole scope is **read-only**. Financial and documents are still present (thin placeholder content).

**Your account** (`/your-account`): a **single Account section** with an email and profile photo derived from the active persona, plus one password field. Removed: About you (no one reads a manager bio here), Privacy (no profile visibility to govern). Old paths such as `/your-account/privacy` still open the Account section.

## Files that matter

| Area | Path |
| --- | --- |
| Routes / created bookings / persona entry / node navigation definitions | `src/App.tsx`, `src/lib/session.ts`, `src/lib/informationArchitecture.ts` |
| Request flow | `src/pages/BookingRequest.tsx` |
| Bookings list | `src/pages/Bookings.tsx` |
| Node-relative Workers | `src/pages/Workers.tsx`, `src/pages/dashboard/WorkersPanel.tsx` |
| Worker profile | `src/pages/WorkerProfile.tsx`, `src/lib/pageContent.ts` |
| Header / account menu | `src/components/AppHeader.tsx` |
| Location switcher / marker | `src/components/LocationSwitcher.tsx`, `LocationMarker.tsx` |
| Settings scopes | `src/pages/Settings.tsx`, `src/lib/informationArchitecture.ts` |
| Location profile edit / preview | `src/components/LocationProfileSettings.tsx`, `src/pages/LocationProfilePreview.tsx`, `src/lib/locationProfiles.ts` |
| Data | `src/data/locations.ts` |
| Jobs catalogue | `src/data/jobsToBeDone.ts`, `src/pages/JobsToBeDone.tsx` |
| Generated IA screen | `src/pages/InformationArchitecture.tsx`, `src/lib/informationArchitecture.ts`, `src/data/locations.ts` |
| Discussion guide | `src/data/discussionQuestions.ts`, `src/components/PinnedQuestion.tsx` |
| Moderator dock (persona menu, page variant, Restart session with confirmation; annotations data retained) | `src/components/SessionQuestions.tsx`, `src/components/PageVariantToggle.tsx`, `src/lib/session.ts` |
| Tokens | `src/index.css` |
| Flow tests | `tests/booking-request-flow.test.ts` |
| Header tests | `tests/header-polish.test.ts` |
| Page polish tests | `tests/icon-or-label.test.ts`, `tests/status-colour.test.ts`, `tests/page-polish.test.ts` |
| IA / menus tests | `tests/information-architecture.test.ts` |
| Personas, providers, organisation boundary | `tests/personas-and-groupings.test.ts`, `tests/providers-and-personas.test.ts`, `tests/organisation-boundary.test.ts` |
| Node-relative Workers tests | `tests/workers-node.test.ts`, `tests/worker-profile.test.ts`, `tests/worker-row-content.test.ts` |
| Discussion guide tests | `tests/discussion-questions.test.ts`, `tests/discussion-guide-ui.test.ts`, `tests/session-questions.test.ts` |
| Jobs catalogue tests | `tests/jobs-to-be-done.test.ts` |
| Generated IA screen tests | `tests/information-architecture-screen.test.ts` |

## Not built

Profile previews on hover, acting on several locations in one pass, invoices as a real product, booking request persistence across refresh, and Edit / Cancel on the detail screen (buttons are present, not wired). Settings **content** is still mostly placeholder; structure is what matters for research.

## Agent habits

- Check `src/components/ui` and existing pages before new UI.
- Empty, error, and loading/absent states when UI depends on data.
- After UI work, verify in the browser at **http://localhost:3021/**. A fresh run opens **Start a session**; Play the prototype then chooses a persona before login. Inside a run, use the organisation-grouped persona menu in the bottom-right dock to switch among all twelve.
- `npm run lint` and `node --test tests/*.test.ts` after behaviour changes.
- Do not commit unless asked. Do not force-push. Do not use `main` as a working branch.
- After shipping, update **this** `PROJECT.md` in the same merge to `main`. Do not leave an uncommitted local copy as the “real” spec.
