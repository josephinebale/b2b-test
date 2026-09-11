# Information architecture — live plus remaining target

**STATUS: LIVE as of 10 September 2026, with remaining research items called out below.**

This file is the information architecture the prototype follows today, plus the agreed research items that are still unbuilt. Use it with **`PROJECT.md`**:

- **`PROJECT.md`** — how screens, routes, chrome, data and tests work today. Give that file to another agent as the current-behaviour handoff.
- **This file** — the node tree, node rules, naming, and what is still target-only.

If a later task appears to contradict the live tree, **stop and raise the conflict**. Do not silently restore an older target (location-scoped Notifications, a location Dashboard, grouping Workers as a destination) as if it were still the plan.

---

## Live IA (what the prototype does now)

Two sections resolve at whichever node the user is standing on, rather than having a fixed level. Everything else declares one level and a hard or soft boundary.

```
Organisation
├─ Organisation settings                  (org, hard, read-only)
├─ Notifications                          (person; resolves at the
│                                          entry node; header utility
│                                          at grouping and location)
├─ Grouping  [region or caseload; a location may have more than one parent]
│   └─ Dashboard                          node-relative; only grouping
│        houses and centres, then clients   destination. No second header
│        (omit a section if empty);         tier. Workers used regularly
│        requests ordered by urgency;       is a read-only section here,
│        usage frequency;                   not a Workers destination.
│        workers used regularly
│        (ranked by shifts, then sites;
│        no search, no marketplace,
│        no profile or message/book)
└─ Location                               bookable entity; SIL house,
    │                                     centre / day program, or
    │                                     home and community
    ├─ Bookings                           (location, hard; default page)
    │    week schedule first; View by
    │    status is secondary. Request,
    │    worker selection step = Workers
    │    with a time window applied.
    │    Fatigue: see the Fatigue rule.
    │    The booking is against the
    │    location and also carries which
    │    participants it covers. Finance
    │    reference is for a centre only.
    │    Tier 3 appears only when tiers
    │    1 and 2 return nobody available.
    ├─ Workers                            (location, hard)
    │    tier 1: known at this location
    │    tier 2: worked elsewhere in the
    │            grouping, + site coverage
    │    tier 3: available nearby, no
    │            history, + search
    ├─ Messages                           (location, hard, owned by the
    │                                      location rather than the person;
    │                                      unread count is this location)
    └─ Location settings / profile        (location, hard)
└─ Your account                           (person)
     └─ Notification preferences          STILL TARGET: per manager,
                                          per type, frequency — not built
```

A location may belong to more than one parent grouping at once: a **region** and a **caseload**. Those are the same kind of object at similar granularity, drawn by different service lines, not a stack. The tree above still shows Location under Grouping; it does not mean a location has only one parent. A grouping’s children are locations of any service type.

Chrome: two-tier header. Identity row (logo, breadcrumb, Notifications, account) at every node. Section row (Bookings / Workers / Messages / Location settings) at a location only. A grouping has no second tier, so the page heading sits 48px higher — a known open problem, not a settled decision. A left scope rail was tried and reverted: rendering the whole organisation tree showed a house manager twenty-five things they would never open, and putting sections in that rail left it empty at a grouping.

### Notifications (live)

A notification is about **work assigned to a person**, not about a place. It resolves at the node that person entered at, not the node they later stand on, and not by rolling location counts up a tree. A house manager who enters at one supportable sees that supportable’s notifications. A central rostering coordinator who enters at a caseload sees notifications across every supportable in it, each naming which one it concerns. A regional manager who enters at a region sees them across that region on the same rule. Research does not ask for this at a region: asked about region-wide message traffic, the participant said probably not for her, because that traffic is house managers to the central rostering team and casuals. Wanting fewer is a **preference**, which is where per-type notification preferences land, not a different scope. Those preferences are not built.

The list is grouped by urgency, not by type or location: **Needs attention now** (cancellations, then waiting requests), **Checks and approvals** (booking approvals, invoices, lapsed assessments, support-plan reviews), then **Messages**. The header badge counts only the first group. The earlier model treated Notifications as location-hard with a count rollup; that rollup is no longer what the model does.

### Location, service type, and participants

A location is the **bookable entity** in every case. Providers fill shifts for a place. Who is present in shared accommodation is not what decides the shift.

There are three service types. All three are locations. Worker tiers, site coverage, fatigue, messages, and the grouping faces behave identically on any of them:

- **SIL house**
- **Centre or day program**
- **Home and community** (the individual’s home is the location). On lists, the **person** is the name and the suburb is the place beneath: “Maya Nguyen” with “Home and community · Forestville”, not “Forestville (Maya Nguyen)”. In a grouping, a home and community location is a **client**, listed after houses and centres, because a house roster gap and a person with nobody are not comparable in one flat list. Aged-care clients display **Support at Home**; that is a label change only.

A location has **participants**. A booking is still booked against the location; it also carries which participants that shift covers:

- **SIL house** — every resident. Nobody is named per shift. The ratio is set upstream in the roster of care.
- **Centre or day program** — who is attending that session. It changes session to session.
- **Home and community** — the one named person.

Under the NDIS the **participant** is always the claimed entity, including for SIL, where the provider claims shared support against each participant’s funds by a ratio set upstream in the roster of care. The location is the rostering unit and the participant is the claiming unit. That is why a finance reference is redundant for accommodation and meaningful for a centre, where the amount claimed per participant depends on how many attended.

Fatigue is a worker signal with **no node**. It is computed at render time against the worker's current calendar, not stamped at booking time, and appears at the worker selection step and on the booking card and detail. It must not disclose the worker's other bookings, only a derived rest signal.

Three kinds of content behave differently:

- **Records** belong to exactly one node. Content never aggregates upward.
- **Rollups** are counts computed at a node from the records beneath it (grouping Dashboard request/usage counts; Notifications is not a rollup).
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

A caseload is 8 to 12 houses, allocated geographically. There are 13 regions across roughly 90 to 100 group homes, so a caseload and a region are comparable in size. A Roster Coordinator is not above a regional manager. Their caseload is a grouping **beside** a region, not a level above it. The caseload is a **default, not a boundary**: coordinators specialise in the services they hold but are expected to be across all houses. The prototype seeds representative caseloads, not the full 8–12.

Mid-session persona switching is a **moderator** control in the bottom-right dock, not a participant one. Signed-in identity follows the persona: name, photo, role, organisation, and entry node. Restart clears it.

A caseload uses the same grouping face as a region; it is not a fourth kind of node. Careforce area nests two caseloads and still uses that face, resolving locations recursively.

---

## Still target — not how the prototype works

Do not treat these as live. Do not implement them unless a task names them.

- **Notification preferences** under Your account (per manager, per type, frequency). Wanting fewer region-wide items lands here, not in a different Notifications scope.
- **Grouping Workers as its own destination**, with search that reaches beyond the provider’s history. Live: that population is a read-only Dashboard section with no search and no marketplace rows. Nearby search stays on location Workers and the request-booking fallback.
- **Location Dashboard.** Live: removed. Bookings is the location landing page; most-booked ordering folded into Workers tier 1.
- **Messages count rolling up** the grouping tree. Live: unread is the current location; Notifications is person-scoped instead.
- **Acting on several locations in one pass.** Parked.

### Navigation model at scale

Agreed direction, not built. This is the reasoning for how navigation would work once the tree is deeper and wider than twenty-five seeded locations. Do not treat any of it as live.

- **An arm level between organisation and grouping.** SIL, Lifestyles and Careforce at the provider we know best; a disability arm and an aged care arm at another. The gap this fills is already recorded under [Known limits](#known-limits-of-this-ia); the target model adds that level rather than leaving it as an unasked gap.
- **A node lists its children, not its descendants.** Counts roll up; rows do not. Today `descendantLocationIds` resolves recursively and the grouping Dashboard renders those resolved locations. That works at Careforce area over two caseloads. It stops working at an arm over 13 regions, where the manager would see leaves instead of their own structure.
- **Three sections at a grouping instead of one:** Dashboard (urgency only, fixed length), Supportables (the node’s children, searchable), and Workers (already a target item above; grouping Workers remains its own destination, not a Dashboard section). This is what fills the second tier at a grouping and removes the 48px page-heading shift without inventing sections.
- **Search in the header identity row at every node**, reaching supportables, clients and workers across the organisation. Low frequency, wide reach.
- **A breadcrumb dropdown on each crumb**, opening that crumb’s siblings only. Not the tree, not the organisation. One level, capped at roughly twenty rows with a search field, falling through to search beyond that. This is a scoped return of the location switcher that was removed. The original was removed for its reach — it listed everything in the organisation, modelling access rather than work — not for the dropdown pattern.
- **A working set object was considered and dropped.** The sibling dropdown gives a Roster Coordinator the same lateral movement without a new object anyone has to curate. It would come back if someone’s real working set cuts across groupings.

Control rules (which need is live today, which is target):

| Need | Control |
| --- | --- |
| Destinations at the node you are standing on | Second tier (live at a location; target at a grouping once it has three sections) |
| Where you are, and moving back up your own path | Breadcrumb (live) |
| Lateral movement to a sibling | Breadcrumb dropdown (target) |
| Low frequency, wide reach | Search (target) |
| Views of the same records within one section | Rail, owned by the page (live on Bookings status views and Settings) |

---

## Known limits of this IA

These are agreed gaps, not bugs to “fix” in the prototype.

- **Assumption we are carrying, not a finding:** for MVP, everyone at a provider can access and edit anything within their own provider's tree. The one exception already built is organisation settings, which are read-only. This is based on current understanding. It would change as more organisations come into view. Research so far covers three providers, and the one with the most detailed account of its own governance described incident and performance processes that end in restrictions, so an appetite for controls exists somewhere in these structures even though nobody has asked for them in the platform.
- Bulk filling across several locations in one pass is not supported. Parked: the product has no pass that creates or fills shifts at more than one location at a time. That research has happened; what remains missing is the capability, not a person to ask.
- Risk on the grouping dashboard is urgency (time to shift start, age of unanswered request), not consequence (vacancies against required staffing). The platform cannot see the provider's own roster.
- A manager's judgement about a worker has no home in the product.
- At this provider, a worker being courted is **induction**: per site and binary — inducted to a site, or they cannot work there. It is held in the provider's own rostering system, so the platform cannot see it. Do not invent it as a blocker in the product. On platform, an inductee is indistinguishable from tier 3.
- No funding balances or dollar amounts are attached to participants. Invoicing runs through a separate system entirely; a fabricated balance would mislead a participant in research. The prototype seeds invoice approval state only.
- Worker history can be partitioned by **funding source**, not only by location, and this model does not express that. At a second provider, one client held two separate accounts because their supports were funded from two lines: a shared accommodation account, and a separate account for individually funded supports. They lived in the same house either way and were supported by overlapping people. In one account the client's team showed more than ten workers; in the other only two, because only workers who had already worked a shift under that funding line appeared. The coordinator could not offer the shift to anyone else and had to email the platform's own rostering team to reach them. She asked, unprompted, whether search could find a worker who was not in the account. Where this happens, the tier of people known to a location fragments, and it reads as far smaller than the pool of people who actually know the client. Wanting that boundary crossed is independent support for the tier of people who have worked elsewhere at the provider. A booking's **participants** and its **funding source** are not the same question. This model handles participants. It does not handle a funding line that splits the worker pool.
- The live model has no level between organisation and grouping, and at least two providers need one. One provider runs a disability arm and an aged care arm within the same organisation. Sector is currently an attribute of a persona and of a location's type label, so two arms of one organisation cannot be represented. The same shape already exists at the provider we know best, where SIL, Lifestyles and the central rostering team are separate arms with their own regional structures. The prototype currently models them as sibling groupings, which loses the distinction that they are different kinds of service rather than different areas of one. This remains a gap in the live tree. The target model now addresses it with an **arm** level; see [Navigation model at scale](#navigation-model-at-scale).
- The breadcrumb has no truncation rule. It has never needed one at three levels. The target model takes it to four and adds a dropdown affordance to each crumb, inside a 56px identity row that also holds the logo, a divider, search, notifications and account within 1376px. This is a layout rule that does not exist yet, not a token gap.

---

## How to use this

1. Read **`PROJECT.md`** first for how the prototype currently functions (screens, routes, chrome, data, tests).
2. Read **this file** for the live node tree, node rules, naming (`Workers` not `Team`), remaining target items, and parked limits.
3. Implement only the slice named in the current task.
4. If the task contradicts the live tree or asks to restore a reverted structure (scope rail, location Dashboard, location-scoped Notifications), raise it instead of resolving it yourself.
