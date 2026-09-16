# Information architecture — live plus remaining target

**STATUS: LIVE as of 16 September 2026, with remaining research items called out below.**

This file is the information architecture the prototype follows today, plus the agreed research items that are still unbuilt. Use it with **`PROJECT.md`**:

- **`PROJECT.md`** — how screens, routes, chrome, data and tests work today. Give that file to another agent as the current-behaviour handoff.
- **This file** — the node tree, node rules, naming, and what is still target-only.

If a later task appears to contradict the live tree, **stop and raise the conflict**. Do not silently restore an older target (location-scoped Notifications or a location Dashboard) as if it were still the plan.

---

## Live IA (what the prototype does now)

Two sections resolve at whichever node the user is standing on, rather than having a fixed level. Everything else declares one level and a hard or soft boundary.

```
Organisation
├─ Overview                               deliberately undefined;
│                                          placeholder only; no persona
│                                          starts here
├─ Organisation settings                  (org, hard, read-only;
│                                          account menu, not a section
│                                          of this face)
├─ Notifications                          (person; resolves at the
│                                          entry node; header utility
│                                          at grouping, location, and
│                                          organisation)
├─ Arm                                    same grouping face and sections;
│   │                                      children are always groupings
│   └─ Grouping                           region, area, caseload, lifestyles,
│       │                                  or service; may nest recursively
│       ├─ Overview                       when direct children include
│       │                                  locations: landing; full body
│       │                                  (Unfilled shifts, direct-child
│       │                                  sections, Recently booked workers).
│       │                                  When children are groupings only:
│       │                                  in-progress card; child list is
│       │                                  the landing.
│       ├─ Child list (/supportables)     tab and landing only when
│       │                                  children are groupings; tab
│       │                                  omitted where Overview is
│       │                                  defined; route and list
│       │                                  retained everywhere, also
│       │                                  from Overview See all N
│       ├─ Workers                        all-time history ranked by
│       │                                  shifts, then sites; per-location
│       │                                  shift counts; read-only, no
│       │                                  section-local search, marketplace,
│       │                                  profile, message or book actions
│       └─ Location                       bookable entity; SIL house,
│           │                              centre / day program, or
│           │                              home and community
│           ├─ Bookings                   (location, hard; default page)
│           │    week schedule first; View by status is secondary.
│           │    Request worker selection = Workers with a time window.
│           │    Fatigue: see the Fatigue rule. The booking is against
│           │    the location and carries which participants it covers.
│           │    Finance reference is for a centre only. Tier 3 appears
│           │    only when tiers 1 and 2 return nobody available.
│           ├─ Workers                    (location, hard)
│           │    tier 1: known at this location
│           │    tier 2: worked elsewhere in the grouping, + site coverage
│           │    tier 3: available nearby, no history, + search
│           ├─ Messages                   (location, hard, owned by the
│           │                              location; unread is this location)
│           └─ Location settings/profile  (location, hard)
└─ Your account                           (person)
```

A location may belong to more than one operational grouping at once: a **region** and a **caseload**. Those are the same kind of object at similar granularity, drawn by different service lines, not a stack. The tree above still shows Location under Grouping; it does not mean a location has only one parent. An arm’s children are always groupings. An operational grouping’s direct children may be child groupings, locations of any service type, or both.

Chrome: two-tier header at every node. The identity row holds logo, breadcrumb, Notifications, and account; organisation-wide search is built but hidden by default while navigation and IA are the research focus. The section row follows `groupingHasDefinedOverview`: when direct children include locations, **Overview** then **Workers**; when they are groupings only (including the organisation), the derived child-list tab then **Overview** then **Workers**, with the child list as landing and Overview on the in-progress card. At a location: Bookings / Workers / Messages / Location settings. No persona enters at the organisation or an arm. Organisation breadcrumb behaviour is in the breadcrumb dropdown rule below; its arms are reached from organisation Supportables. There is no organisation Workers page — `/workers` there falls back to the child list. Organisation settings stays in the account menu and is not a section of this face. Eligible breadcrumb crumbs open their siblings. The current node stays fully visible; when the path does not fit its available width, ancestors drop from the left and an interactive ellipsis opens the hidden path. A left scope rail was tried and reverted: rendering the whole organisation tree showed a house manager twenty-five things they would never open.

### Notifications (live)

A notification is about **work assigned to a person**, not about a place. It resolves at the node that person entered at, not the node they later stand on, and not by rolling location counts up a tree. A house manager who enters at one supportable sees that supportable’s notifications. A central rostering coordinator who enters at a caseload sees notifications across every supportable in it, each naming which one it concerns. A regional manager who enters at a region sees them across that region on the same rule. Research does not ask for this at a region: asked about region-wide message traffic, the participant said probably not for her, because that traffic is house managers to the central rostering team and casuals. Wanting fewer is a **preference**, which is where per-type notification preferences land, not a different scope. Those preferences are not built.

The list is grouped by urgency, not by type or location: **Needs attention now** (cancellations, then waiting requests), **Checks and approvals** (booking approvals, invoices, lapsed assessments, support-plan reviews), then **Messages**. The header badge counts only the first group. The earlier model treated Notifications as location-hard with a count rollup; that rollup is no longer what the model does.

### Location, service type, and participants

A location is the **bookable entity** in every case. Providers fill shifts for a place. Who is present in shared accommodation is not what decides the shift.

There are three service types. All three are locations. Worker tiers, site coverage, fatigue, messages, and the grouping faces behave identically on any of them:

- **SIL house**
- **Centre or day program**
- **Home and community** (the individual’s home is the location). On lists, the **person** is the name and the suburb is the place beneath: “Maya Nguyen” with “Home and community · Forestville”, not “Forestville (Maya Nguyen)”. In a grouping, a home and community location is a **client**, listed after houses and centres, because a house roster gap and a person with nobody are not comparable in one flat list. Aged-care clients display **Support at Home**; that is a label change only. **Superseded for this round:** grouping Overview and `/supportables` now render one merged direct-child location list (`groupingDirectLocationListLabel`, one sort control on Overview when two or more rows) so participants can judge whether houses, centres and clients belong in one flat list. **Building2** marks a house or centre row and **User** marks a client row (`directChildLocationListIcon`) so the person/place distinction survives without a separate section.

A location has **participants**. A booking is still booked against the location; it also carries which participants that shift covers:

- **SIL house** — every resident. Nobody is named per shift. The ratio is set upstream in the roster of care.
- **Centre or day program** — who is attending that session. It changes session to session.
- **Home and community** — the one named person.

Under the NDIS the **participant** is always the claimed entity, including for SIL, where the provider claims shared support against each participant’s funds by a ratio set upstream in the roster of care. The location is the rostering unit and the participant is the claiming unit. That is why a finance reference is redundant for accommodation and meaningful for a centre, where the amount claimed per participant depends on how many attended.

Fatigue is a worker signal with **no node**. It is computed at render time against the worker's current calendar, not stamped at booking time, and appears at the worker selection step and on the booking card and detail. It must not disclose the worker's other bookings, only a derived rest signal.

Three kinds of content behave differently:

- **Records** belong to exactly one node. Content never aggregates upward.
- **Rollups** are counts computed at a node from the records beneath it (grouping Overview attention calendar and aside status lines; Notifications is not a rollup).
- **Worker attributes** are computed relative to the node you are standing on, so the same worker reads differently at different nodes.

Role sets the **entry node only**. Nothing is hidden by role. Research established that access is not the constraint at this provider: everyone from house managers up can already see all sites. Organisation is a hard data boundary: a persona never sees another provider’s groupings, locations, workers, bookings, or messages.

**Naming:** “Team” is “Workers” throughout. “Team” survives only as wording inside location Workers tier 1.

---

## Role and entry node (live)

There is no per-role IA. A house manager sees what anyone standing at a location sees. A regional manager or a Roster Coordinator sees what anyone standing at a grouping sees. No navigation, section, or control is hidden by role.

What differs is the **entry node**. Twelve personas across three organisations:

- **Cerebral Palsy Alliance** — Helen Dawson at Dee Why 1; Marcus Lee at Northern Sydney; Sofia Patel at Careforce caseload; Ava Thompson at Allambie Heights Day Program; Grace Kim at Northern Lifestyles; Daniel Okafor at Maya Nguyen; Rachel Morgan at Careforce area.
- **Northcott** — Leila Hassan at Western Sydney SIL services; Ben Carter at Western Sydney individual services.
- **Life Without Barriers** — Olivia Grant and Ethan Murphy at Northern Sydney (same entry; shift ownership is not modelled); Natalie Brooks at Greater Sydney.

**Assumption we are carrying, not a finding:** the mapping from role to entry node is configured per provider. It is not derived from the role.

A caseload is 8 to 12 houses, allocated geographically. CPA’s SIL footprint is **Sydney metro, the Central Coast, and Newcastle/Hunter** only; a **region** is a geographically compact sub-metro cluster of roughly **eight houses** under one Regional Manager. The seed holds **13 regions** and **90 group homes**; a caseload and a region are comparable in size. Workers **often work across houses within a region**; the seed uses a **40%** cross-house overlap rate as the interpretation of “often”, not a measured figure. A Roster Coordinator is not above a regional manager. Their caseload is a grouping **beside** a region, not a level above it. The caseload is a **default, not a boundary**: coordinators specialise in the services they hold but are expected to be across all houses. The prototype seeds representative caseloads, not the full 8–12.

Mid-session persona switching is a **moderator** control in the bottom-right dock, not a participant one. Signed-in identity follows the persona: name, photo, role, organisation, and entry node. Restart clears it. For this round, Choose a persona and the dock list Helen Dawson, Marcus Lee, and Sofia Patel only (`VISIBLE_PERSONA_IDS` in `src/lib/informationArchitecture.ts`); all twelve persona records remain in data. This is research scoping, not role gating.

A caseload uses the same grouping face as a region; it is not a fourth kind of node. Careforce area nests five caseloads and still uses that face; its child list is the landing because its direct children are groupings only. A caseload with location children lands on Overview. Page headings carry the node name: **{node name} overview** on Overview and **{node name} workers** on Workers (sentence case).

### Navigation model at scale — first slice live

**A node lists its children, not its descendants. Counts roll up; rows do not.** `descendantLocationIds` still resolves recursively for rolled-up counts and Notifications scope, but grouping Supportables renders only direct children. A child grouping has its own row with its name, recursively resolved contents and summed waiting work; selecting it enters that grouping's landing — Overview when direct children include locations, the child list when they are groupings only. Direct location children render in one merged list (`groupingDirectLocationListLabel`) with **Building2** / **User** row icons (`directChildLocationListIcon`) and type lines from `directChildLocationTypeLine`. This matters because flattening works at Careforce area over five caseloads but stops working at an arm over 13 regions, where the manager would see leaves instead of their own structure.

### Navigation model at scale — second slice live

**Overview is conditional on what a node holds** (`groupingHasDefinedOverview` in `src/lib/informationArchitecture.ts`). When direct children include locations, the second tier is **Overview** then **Workers** and Overview is the landing. When direct children are groupings only, the second tier is the child-list tab (`groupingChildListTabLabel` — never “Supportables”), then **Overview** and **Workers**; the child list is the landing and Overview renders the in-progress card. The full Overview body renders only when defined. **`groupingDirectLocationListLabel`** (`src/lib/pageContent.ts`) derives the direct-child location list title from every service type present among direct location children — houses, then centres, then clients, omitting zeros (**Houses**, **Clients**, **Houses and clients**, **Houses, centres and clients**, and so on). The same wording feeds the Overview `SectionHeadingRow` title, `groupingChildListTabLabel`, and `groupingChildListPageHeading` on `/supportables`. Child-grouping titles are unchanged. One `.layout-content-aside` holds **Unfilled shifts** (week calendar for requested and upcoming cancelled shifts; heading **Unfilled shifts:** with count `Tag`; supporting line matches the location week — *Times are displayed in the local time of the booking.*; status pills use the same tones as the location week cards via `bookingWeekCardTone`) and one merged direct-child location list (or the shared-kind title when child groupings are present) with `groupingDirectChildrenCountLine` as the supporting line in the content column, and **Recently booked workers** (eight-week window, cap six; ordered by most recent shift for recall, not performance; no section supporting line; house-shaped rows with profile link, last-worked subtitle, and Message/Book secondary buttons to the worker's busiest house; pending assessment exception tags only when `GROUPING_OVERVIEW_WORKER_EXCEPTION_TAGS_VISIBLE` is on — default off, so the row is recall-only) in the 320px aside. Every Overview section heading is built through **`SectionHeadingRow`** (`SectionHeadingRow.tsx`): one row with title and optional supporting line on the left and one optional control on the right — week controls on **Unfilled shifts**, one `GroupingLocationSortControl` (**Sort by** label and select on one line; options **Soonest unfilled shift**, **Most outstanding tasks**, and **Name A to Z**) on the merged location list when it holds two or more rows, **View all** on **Recently booked workers**. Under **Soonest unfilled shift** only, each direct-location row exposes that sort key as the next unfilled date and time on its existing waiting-evidence line; no shift count or placeholder is added, and `/supportables` remains unchanged. Week controls share **`--control-height-small`** (32px) with the aside **Message** / **Book** buttons; the sort dropdown takes the 40px **`--control-height-field`** that every dropdown in the product uses, because height follows the control's role rather than whatever sits in the row above it. Direct-child rows on Overview and `/supportables` carry **Building2** or **User** (`directChildLocationListIcon` / `DirectChildLocationListIcon`) beside `directChildLocationTypeLine` — not `LocationMarker` squares. Do not adjust section heading alignment by editing a page; change `SectionHeadingRow`, or leave it alone. See **Section layout rules** in `PROJECT.md`. `/supportables` owns the complete direct-child list everywhere and is also reached from the Overview direct-child block when that list caps at twelve. Workers owns the complete all-time read-only provider-history population, resolved across descendant locations and ranked by shifts, then locations worked, then name, with per-location shift counts. It has no search, marketplace rows, profile links, or message/book actions. This fills the same 48px second header tier used at a location, so page headings no longer shift vertically between node types.

### Navigation model at scale — third slice live

**Organisation → Arm → Grouping → Location** is now the live tree. An arm is an ordinary grouping record with the same grouping face; it introduces no node type, page, or role behaviour, and its children are always groupings. Cerebral Palsy Alliance has SIL, Lifestyles, and Careforce arms; Northcott has Disability services; Life Without Barriers has Aged care. Counts resolve recursively and Supportables lists direct children, preserving the first-slice rule. Every persona keeps their previous entry grouping or location, so no persona starts at an arm. This retains the original reasoning: **Elise** (Cerebral Palsy Alliance; structure session · 30:35 and 31:47), asked to confirm the Lifestyles structure, corrected it unprompted because a level was missing above the lifestyles manager. The arm distinguishes service lines from geographic groupings instead of presenting both as one flat sibling list.

### Navigation model at scale — fourth slice live

Search is built as the low-frequency, wide-reach control but hidden by default while the next research sessions focus on navigation and IA. Turning its single named constant on restores it in the 56px identity row at every node. It uses plain case-insensitive substring matching within the signed-in organisation only. Results are grouped as **Supportables**, **Clients**, **Workers**, and **Groupings**: supportables match name or suburb; clients, provider-history workers, groupings, and arms match name. Supportables show service type and suburb, workers show provider hours, and groupings show recursively resolved contents in the same language as Supportables. Selecting a result enters its node or an existing worker profile. Empty query shows no surface; no matches show one named empty state. Marketplace-only workers never enter the query because they have no provider node. Location Workers search and the request-booking marketplace fallback remain separate controls over different populations.

### Navigation model at scale — fifth slice live

**A breadcrumb dropdown on each eligible crumb** opens that crumb’s siblings only: the direct children of its parent. Not the tree, not descendants, not the organisation. The current node participates and is marked in its own sibling list. A crumb with no siblings has no chevron. The organisation name navigates to the child list; only the sibling dropdown never opens, and there is no chevron. Menus show the first twenty siblings and then say how many more there are; they contain no search and do not fall through to hidden header search. The truncation ellipsis opens the ancestors it replaced, keeping a narrow path navigable.

This is a scoped return of the location switcher that was removed. The original was removed for its reach — it listed everything in the organisation, modelling access rather than work. Siblings only is the whole difference: Sofia can move sideways among direct supportables in her caseload, while Rachel can move between the direct caseloads in her area, without either seeing an organisation tree. A working set object was considered and dropped because the sibling dropdown gives a Roster Coordinator the same lateral movement without a new object anyone has to curate. It would come back only if someone’s real working set cuts across groupings.

Control rules:

| Need | Control |
| --- | --- |
| Destinations at the node you are standing on | Second tier (live at grouping and location) |
| Where you are, and moving back up your own path | Breadcrumb (live) |
| Lateral movement to a sibling | Breadcrumb dropdown (live) |
| Low frequency, wide reach | Header search (built and tested; hidden by default for the next research sessions) |
| Views of the same records within one section | Rail, owned by the page (live on Bookings status views and Settings) |

---

## Still target — not how the prototype works

Do not treat these as live. Do not implement them unless a task names them.

- **Jobs** has no node in the prototype. Dorothy describes creating a job for an ongoing shift (49:38) and says she has never posted one herself; Sufi opens the booking request when asked to show how she posts a job. The gap is real but the surface is not defined, and it should not sit in the tier until it is.
- **Notification preferences content** under Your account (per manager, per type, frequency). Wanting fewer region-wide items lands here, not in a different Notifications scope.
- **Search and marketplace reach on grouping Workers.** Built: grouping Workers is a read-only comparison table (`GroupingWorkersTable.tsx`) over all-time provider history (`groupingWorkers`), with no search and no marketplace rows. **Hidden for this round** — `GROUPING_WORKERS_CONTENT_ENABLED` is `false`, so `#/workers` at a grouping shows the in-progress card. Location Workers, Bookings, Messages, and settings are live (`LANDING_CONTENT_ENABLED` is `true`). Flip `GROUPING_WORKERS_CONTENT_ENABLED` to `true` in `LandingPlaceholder.tsx` to restore the table in one line without affecting location tabs. The Overview **View all** heading link routes to grouping Workers and currently lands on the in-progress card until that flag is on. Nearby search stays on location Workers and the request-booking fallback.
- **Location Dashboard.** Live: removed. Bookings is the location landing page; most-booked ordering folded into Workers tier 1.
- **Messages count rolling up** the grouping tree. Live: unread is the current location; Notifications is person-scoped instead.
- **Acting on several locations in one pass.** Parked.
- **Changed since you last looked.** Dorothy checks in periodically rather than monitoring, and talks at 22:01 about managers who check daily against managers who want Monday, Wednesday, Friday. A view of what has moved since her last visit needs a last-seen state that is not modelled.
- **House character** as the one piece of consequence a provider could realistically supply. At 31:45 she describes managers knowing "this is a, like a, you know, manual handling support house, this is a behavior house, this has a bit of both". It is a property of a house rather than of a shift, so it needs no rostering connection. It is deliberately not in this round because it would confound the session.

---

## Known limits of this IA

These are agreed gaps, not bugs to “fix” in the prototype.

- **Assumption we are carrying, not a finding:** for MVP, everyone at a provider can access and edit anything within their own provider's tree. The one exception already built is organisation settings, which are read-only. This is based on current understanding. It would change as more organisations come into view. Research so far covers three providers, and the one with the most detailed account of its own governance described incident and performance processes that end in restrictions, so an appetite for controls exists somewhere in these structures even though nobody has asked for them in the platform.
- Bulk filling across several locations in one pass is not supported. Parked: the product has no pass that creates or fills shifts at more than one location at a time. That research has happened; what remains missing is the capability, not a person to ask.
- The grouping Overview calendar shows only shifts that need a decision (requested and upcoming cancelled). Card tones match the location week: requested stays pending tan even when workers have declined; outreach state lives in full-width centred status pills (same layout as `StatusPill`, inverted fills via `attention-grid-status-pill--*` — not global `Tag`s). See **Booking card in a week grid** in `PROJECT.md`. Cancelled shifts use the attention card tone. Empty day columns centre **Nothing waiting** horizontally at the card first-line height; column borders run the full grid height. **Recently booked workers** in the aside is for recall under time pressure — who is around and where they last worked, with profile links, a house-row subtitle (`Last worked … at/for {location}`), and text-only Message/Book secondary buttons (label only, no icons) to the busiest house — location Workers rows keep 32px icon-only actions instead. Pending-toned assessment exception tags are built but hidden by default (`GROUPING_OVERVIEW_WORKER_EXCEPTION_TAGS_VISIBLE` is `false` in `WorkersPanel.tsx`); while off the row carries no vetting surface — not a ranking or performance view. The **Workers tab** holds the complete all-time population in a sortable comparison table (houses, shifts, hours, exceptions); names stay static because that surface is read-only reference, not action. The platform cannot see the provider's own roster. This page answers whether a shift needs a decision and who is working now. Calendar ordering (unacted requests first, then soonest start, then longest unanswered) is an order, not a risk ranking. Do not invent required staffing, vacancies, ratios, or any roster data.
- A manager's judgement about a worker has no home in the product.
- At this provider, a worker being courted is **induction**: per site and binary — inducted to a site, or they cannot work there. It is held in the provider's own rostering system, so the platform cannot see it. Do not invent it as a blocker in the product. On platform, an inductee is indistinguishable from tier 3.
- No funding balances or dollar amounts are attached to participants. Invoicing runs through a separate system entirely; a fabricated balance would mislead a participant in research. The prototype seeds invoice approval state only.
- Worker history can be partitioned by **funding source**, not only by location, and this model does not express that. At a second provider, one client held two separate accounts because their supports were funded from two lines: a shared accommodation account, and a separate account for individually funded supports. They lived in the same house either way and were supported by overlapping people. In one account the client's team showed more than ten workers; in the other only two, because only workers who had already worked a shift under that funding line appeared. The coordinator could not offer the shift to anyone else and had to email the platform's own rostering team to reach them. She asked, unprompted, whether search could find a worker who was not in the account. Where this happens, the tier of people known to a location fragments, and it reads as far smaller than the pool of people who actually know the client. Wanting that boundary crossed is independent support for the tier of people who have worked elsewhere at the provider. A booking's **participants** and its **funding source** are not the same question. This model handles participants. It does not handle a funding line that splits the worker pool.
- The arm level now exists, so service lines no longer sit flat beside geographic groupings. The remaining model gap is sector ownership: sector stays where it was on personas, locations, and operational groupings, while arms carry no sector. A provider with both disability and aged-care arms therefore remains unsupported as a sector model even though the hierarchy can now draw both arms.

### What the research says about scale

The navigation model recorded this morning rests on the premise that supportables and groupings are what grow, not workload per supportable. That premise was unevidenced in these files. These two statements are the evidence:

- **Suman** (Life Without Barriers, aged care; Life Without Barriers session · 19:59) puts Victoria at more than 300 clients, at least 350. Every client is a location, so an aged care region is two orders of magnitude larger than a SIL region.
- **Suman** (same session · 11:35) describes South Australia, Victoria and the Northern Territory as one region. The prototype seeds Life Without Barriers regions as Northern Sydney and Western Sydney with four clients each. The grouping face is therefore currently being tested far below the real scale. That is a **seeding gap**, not a model gap.

Already recorded: a SIL region is roughly seven houses across 13 regions, and a caseload is 8 to 12. The same grouping face has to hold both ends of that range.

---

## How to use this

1. Read **`PROJECT.md`** first for how the prototype currently functions (screens, routes, chrome, data, tests).
2. Read **this file** for the live node tree, node rules, naming (`Workers` not `Team`), remaining target items, and parked limits.
3. Implement only the slice named in the current task.
4. If the task contradicts the live tree or asks to restore a reverted structure (scope rail, location Dashboard, location-scoped Notifications), raise it instead of resolving it yourself.
