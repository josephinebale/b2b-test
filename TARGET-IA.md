# TARGET information architecture — not built

**STATUS: TARGET ONLY. None of this is implemented.**

This file is the agreed **future** information architecture from research. It is **not** a description of the prototype that exists today.

- Do **not** treat anything below as current behaviour.
- Do **not** use this file to explain how screens, routes, or labels work now.
- For how the prototype actually works today, read **`PROJECT.md` only**.

If a later task appears to contradict this spec, **stop and raise the conflict**. Do not silently “fix” the spec or invent a compromise.

Subsequent implementation tasks will name the slice they cover. Read this file first for scope and naming.

---

## Target IA (agreed from research, not yet built)

Two sections resolve at whichever node the user is standing on, rather than having a fixed level. Everything else declares one level and a hard or soft boundary.

```
Organisation
├─ Organisation settings                  (org, hard, read-only)
├─ Grouping  [region or caseload; a location may have more than one parent]
│   ├─ Dashboard                          node-relative
│   │    houses and centres, then clients
│   │    (omit clients if the grouping has none);
│   │    requests ordered by urgency as one list;
│   │    usage frequency
│   ├─ Workers                            node-relative
│   │    grouping face: the provider's own workforce, ranked by
│   │    volume of shifts and number of sites worked
│   │    search reaches beyond the provider's history
│   └─ Location                           bookable entity; SIL house,
│                                         centre / day program, or
│                                         home and community
│       ├─ Dashboard                      node-relative
│       ├─ Workers                        node-relative
│       │    tier 1: known at this location
│       │    tier 2: worked elsewhere in the grouping, + site coverage
│       │    tier 3: available nearby, no history, + search
│       ├─ Bookings                       (location, hard)
│       │    └─ Request, worker selection step = Workers with a time
│       │       window applied. Fatigue: see the Fatigue rule below.
│       │       The booking is against the location and also carries
│       │       which participants it covers. Finance reference is for
│       │       a centre only. See Location, service type, and
│       │       participants below.
│       │       Tier 3 appears only when tiers 1 and 2
│       │       return nobody available. Tier 3 workers are bookable and
│       │       contactable, with blockers named.
│       ├─ Messages                       (location, hard, owned by the
│       │                                  location rather than the person;
│       │                                  count rolls up)
│       ├─ Notifications                  (location, hard; count rolls up)
│       └─ Location settings / profile    (location, hard)
└─ Your account                           (person)
     └─ Notification preferences          per manager, per type, frequency
```

A location may belong to more than one parent grouping at once: a **region** and a **caseload**. Those are the same kind of object at similar granularity, drawn by different service lines, not a stack. The tree above still shows Location under Grouping; it does not mean a location has only one parent. A grouping’s children are locations of any service type.

### Location, service type, and participants

A location is the **bookable entity** in every case. Providers fill shifts for a place. Who is present in shared accommodation is not what decides the shift.

There are three service types. All three are locations. Worker tiers, site coverage, fatigue, messages, and the grouping faces behave identically on any of them:

- **SIL house**
- **Centre or day program**
- **Home and community** (the individual’s home is the location). On lists, the **person** is the name and the suburb is the place beneath: “Maya Nguyen” with “Home and community · Forestville”, not “Forestville (Maya Nguyen)”. In a grouping, a home and community location is a **client**, listed after houses and centres, because a house roster gap and a person with nobody are not comparable in one flat list.

A location has **participants**. A booking is still booked against the location; it also carries which participants that shift covers:

- **SIL house** — every resident. Nobody is named per shift. The ratio is set upstream in the roster of care.
- **Centre or day program** — who is attending that session. It changes session to session.
- **Home and community** — the one named person.

Under the NDIS the **participant** is always the claimed entity, including for SIL, where the provider claims shared support against each participant’s funds by a ratio set upstream in the roster of care. The location is the rostering unit and the participant is the claiming unit. That is why a finance reference is redundant for accommodation and meaningful for a centre, where the amount claimed per participant depends on how many attended.

Fatigue is a worker signal with **no node**. It is computed at render time against the worker's current calendar, not stamped at booking time, and appears at the worker selection step and on the booking card and detail. It must not disclose the worker's other bookings, only a derived rest signal.

Three kinds of content behave differently:

- **Records** belong to exactly one node. Content never aggregates upward.
- **Rollups** are counts computed at a node from the records beneath it.
- **Worker attributes** are computed relative to the node you are standing on, so the same worker reads differently at different nodes.

Role sets the **entry node only**. Nothing is hidden by role. Research established that access is not the constraint at this provider: everyone from house managers up can already see all sites.

**Naming:** “Team” becomes “Workers” throughout. “Team” survives only as wording inside tier 1, if at all.

---

## Role and entry node (not yet built)

There is no per-role IA. A house manager sees what anyone standing at a location sees. A regional manager or a Roster Coordinator sees what anyone standing at a grouping sees. No navigation, section, or control is hidden by role.

What differs is the **entry node**: a house manager enters at a location; a regional manager enters at a region; a **Roster Coordinator** (in **Careforce**) enters at their caseload.

**Assumption we are carrying, not a finding:** the mapping from role to entry node is configured per provider. It is not derived from the role. A house manager lands at their house and a regional manager at their region because someone has set that up, not because the model works it out. Nobody has been asked how they would want this configured, or whether a person might need to land somewhere other than their default.

A caseload is 8 to 12 houses, allocated geographically. There are 13 regions across roughly 90 to 100 group homes, so a caseload and a region are comparable in size. A Roster Coordinator is not above a regional manager. Their caseload is a grouping **beside** a region, not a level above it. The caseload is a **default, not a boundary**: coordinators specialise in the services they hold but are expected to be across all houses.

The prototype needs a way to switch entry node mid-session without logging out. That is a **moderator** control, not a participant one. Follow the existing mid-session moderator pattern (the bottom-left page-variant toggle): away from participant chrome, nothing on the page hints at it, state survives moving between screens, and restart clears it. Do not invent a second mechanism.

Signed-in identity must follow the entry node. The current hardcoded persona is a location manager, so a regional manager entry point and a Roster Coordinator entry point each need their own name, photo, and role in the header. Three personas, not one persona standing at three nodes.

This depends on the **grouping node** existing. Sequence it after the grouping node and its dashboard. A caseload uses that same grouping face; it is not a fourth kind of node.

---

## Known limits of this IA

These are agreed gaps in the **target**, not bugs in the current prototype.

- **Assumption we are carrying, not a finding:** for MVP, everyone at a provider can access and edit anything within their own provider's tree. The one exception already built is organisation settings, which are read-only. This is based on current understanding. It would change as more organisations come into view. Research so far covers three providers, and the one with the most detailed account of its own governance described incident and performance processes that end in restrictions, so an appetite for controls exists somewhere in these structures even though nobody has asked for them in the platform.
- Bulk filling across several locations in one pass is not supported. Parked: the product has no pass that creates or fills shifts at more than one location at a time. That research has happened; what remains missing is the capability, not a person to ask.
- Risk on the grouping dashboard is urgency (time to shift start, age of unanswered request), not consequence (vacancies against required staffing). The platform cannot see the provider's own roster.
- A manager's judgement about a worker has no home in the product.
- At this provider, a worker being courted is **induction**: per site and binary — inducted to a site, or they cannot work there. It is held in the provider's own rostering system, so the platform cannot see it. Do not invent it as a blocker in the product. On platform, an inductee is indistinguishable from tier 3.
- No funding balances or dollar amounts are attached to participants. Invoicing runs through a separate system entirely; a fabricated balance would mislead a participant in research.
- Worker history can be partitioned by **funding source**, not only by location, and this model does not express that. At a second provider, one client held two separate accounts because their supports were funded from two lines: a shared accommodation account, and a separate account for individually funded supports. They lived in the same house either way and were supported by overlapping people. In one account the client's team showed more than ten workers; in the other only two, because only workers who had already worked a shift under that funding line appeared. The coordinator could not offer the shift to anyone else and had to email the platform's own rostering team to reach them. She asked, unprompted, whether search could find a worker who was not in the account. Where this happens, the tier of people known to a location fragments, and it reads as far smaller than the pool of people who actually know the client. Wanting that boundary crossed is independent support for the tier of people who have worked elsewhere at the provider. A booking's **participants** and its **funding source** are not the same question. This model handles participants. It does not handle a funding line that splits the worker pool.
- The model has no level between organisation and grouping, and at least two providers need one. One provider runs a disability arm and an aged care arm within the same organisation. Sector is currently an attribute of a persona and of a location's type label, so two arms of one organisation cannot be represented. The same shape already exists at the provider we know best, where SIL, Lifestyles and the central rostering team are separate arms with their own regional structures. The prototype currently models them as sibling groupings, which loses the distinction that they are different kinds of service rather than different areas of one. This is a gap, not a design. Nobody has been asked how they would want arms represented, and no persona in the prototype currently needs it.

---

## How to use this

1. Read **this file** for target scope, naming (`Workers` not `Team`), node rules, and parked limits.
2. Read **`PROJECT.md`** for what is already on screen.
3. Implement only the slice named in the current task.
4. If the task contradicts this document, raise it instead of resolving it yourself.
