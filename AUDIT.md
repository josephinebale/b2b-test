# Front-end visual consistency audit

**Date:** 15 September 2026  
**Runtime audited:** `http://localhost:3021/`  
**Method:** rendered DOM, computed styles, element geometry, and matched browser CSS declarations. Class names were not used as proof of rendered values. Source was consulted only for the requested duplication check and to locate documented rules/exceptions after browser measurements.

## Scope and limits

Audited at desktop widths from 1024px to 1745px:

- Pre-session: Start a session, Choose a persona, Jobs to be done, Information architecture.
- Grouping: Northern Sydney Overview, `/supportables`, grouping Workers, grouping-only Overview/in-progress state.
- Location: Bookings and all six status routes (Requested, Confirmed, Waiting for submission, Ready to approve, Next invoice, Invoiced), Messages, Workers, Location settings.
- Ungated location flows: all three request-booking steps, booking detail, worker profile.
- Settings routes: Location settings, Organisation settings, Your account and their route scopes.
- Shared chrome: both header tiers, breadcrumb and sibling dropdowns, account menu, Notifications, footer, moderator dock.

`LANDING_CONTENT_ENABLED` is currently false. Grouping Workers, location Bookings/status views, Messages, location Workers, and all three settings scopes therefore render the same **This screen is in progress.** card. Their placeholder output was measured on every route; their hidden bodies have no computed values and are not presented here as browser-audited. `GROUPING_WORKERS_CONTENT_ENABLED` is also false, so the comparison table was not rendered. This limitation is documented in `PROJECT.md:469`.

Some delegated measurements were made while the Cursor browser was zoomed to about 110%, producing values such as 31.9957px, 35.9943px, 0.909091px, and 2.72727px. Rechecks in the active tab returned 32px, 36px, 1px, and 3px. Both are the same CSS values; this audit records the clean CSS-pixel value and notes the fractional observation where relevant.

## Finding count

- Type scale: **2**
- Spacing: **4**
- Control heights: **4**
- Alignment: **2 open** (A1–A3 resolved; A4 and A5 recorded, not acted on)
- Colour: **0**
- Duplication: **3**
- Borders and radii: **2**
- Within-context control consistency: **1** (I1)
- Documentation contradictions: **8** (counted separately)

**Total visual/system findings: 21.**

## 1. Type scale

### Rendered inventory

Distinct font sizes: **12px, 14px, 16px, 20px, 24px**.  
Distinct weights: **400, 500, 700**.  
Distinct line heights: **12px, 16px, 20px, 24px, 28px, 32px**.

The product scale used everywhere else is:

- 12px / 16px
- 14px / 20px
- 16px / 24px
- 20px / 28px
- 24px / 32px
- weights 400 / 500 / 700

All five sizes, the three weights, and the 16/20/24/28/32px line heights resolve from the typography tokens listed in `PROJECT.md:437-445`.

Distinct rendered semantic text colours:

- `--color-text` → rgb(22, 24, 29)
- `--color-text-strong` → rgb(43, 48, 59)
- `--color-text-secondary` → rgb(85, 93, 109)
- `--color-text-tertiary` → rgb(101, 109, 124)
- `--color-brand` → rgb(20, 36, 224)
- `--color-surface` → rgb(255, 255, 255)
- status foregrounds: success, pending, attention/badge, neutral, info, and location foreground tokens

### T1 — Direct-location rows change type treatment between Overview and `/supportables`

Computed values:

- Grouping Overview row: name **14/700/20, brand**; type/suburb **12/400/16, tertiary**.
- `/supportables` row: name **14/700/20, strong**; type/suburb **14/400/20, secondary**.

Places: every direct house, centre, and client row on grouping Overview and `/supportables`. Northern Sydney was measured directly.

Rest of product: compact entity metadata in Overview, Notifications, booking cards, and worker metadata uses **12/400/16 tertiary**; navigational list rows use **14/400/20 secondary**.

Why flagged: `PROJECT.md:134` says `/supportables` rows “match Overview”, but the rendered hierarchy changes when moving between the two views. No reason for that typography change is documented.

### T2 — Location initials introduce a 12/12 tuple outside the type scale

Computed value: **12px / 700 / 12px**, location foreground rgb(33, 107, 45).

Places: location-marker initials on the Information architecture tree and any rendered compact/full `LocationMarker`.

Rest of product: 12px text uses **16px line-height**. The badge also uses 12px line-height, but that is separately documented as intentional in `PROJECT.md:366`.

Why flagged: the marker uses a literal `line-height: 1` result without a matching documented exception.

## 2. Spacing

Token scale observed: **4, 8, 12, 16, 24, 32, 40, 48px** (`--space-1` through `--space-8`).

### S1 — Shared page headings leave 20px, while the documented shell uses 24px

Computed value: **margin-bottom: 20px** on the shared heading wrapper.

Places measured: Start a session, Choose a persona, Jobs to be done, Information architecture, grouping Overview, `/supportables`, and Notifications. The same rendered shared heading is used by other visible detail/profile routes.

Rest of product/documented value: **24px (`--space-5`)** between `PageHeading` and the first content block (`PROJECT.md:403`).

Impact: this is the broadest spacing drift because it moves the first block on most full pages.

### S2 — Information architecture assumption-list indentation uses an unnamed 20px step

Computed value: **padding-left: 20px** on the assumptions list.

Place: Information architecture, Assumptions.

Rest of product: named spacing jumps from **16px (`--space-4`)** to **24px (`--space-5`)**. `PROJECT.md:380` says to use named steps only.

### S3 — The shared in-progress card uses a 24px prose inset

Computed value: **24px on all sides**; card size measured at 1032×70px on grouping Workers.

Places: grouping Workers; grouping-only Overview; location Bookings and all status routes; Messages; location Workers; every hidden settings scope.

Rest of product/documented value: a card holding prose uses **16px (`.ui-inset-card`)**; 24px is reserved for larger standalone settings sections (`PROJECT.md:402`).

Uncertainty: the extra air may be intended for placeholders, but no exception says so.

### S4 — The same direct-location row changes vertical inset between its two views

Computed values:

- Overview: **16px all sides**, first row 96px high with pending links.
- `/supportables`: **12px vertical / 16px horizontal**, rows 68–69px high without pending links under the current flag.

Places: all direct-location rows on grouping Overview and `/supportables`.

Rest of product: list rows use **12px vertical / 16px horizontal**; stacked multi-block cards use **16px** (`PROJECT.md:402`).

Why flagged: either density can be reasonable, but the docs say these rows match and do not record the context-driven inset difference.

Not a finding: the Overview content-section gap was remeasured at **32px**, matching `--space-6`; an earlier 20px report was the page-heading margin, not the section gap.

## 3. Control heights

### Rendered height inventory

Fixed controls:

- **32px:** Today, week arrows, grouping sort select, grouping worker Message/Book.
- **36px:** primary/secondary Buttons, header utility, account trigger, dock buttons, account-menu rows.
- **40px:** stacked labelled text/date/time/select fields.

These match the allowed 32/36/40px set. No fixed button row mixed heights: request actions were 36/36; grouping controls were 32/32; header utilities were 36/36.

Other interactive elements measured:

- **16px:** native radio and checkbox inputs; footer text links.
- **18px:** footer logo link.
- **20px:** breadcrumb buttons, request-flow Back text button, Source disclosure label.
- **24px:** header logo link.
- **45px:** week-grid “N more bookings” expander.
- **48px:** second-tier navigation links.
- **54px:** Start a session action cards.
- **60px:** Choose a persona rows.
- **68–69px:** `/supportables` location rows.
- **84–136px:** request worker-selection rows, content-dependent.
- **90–106px:** linked booking cards, content-dependent.
- **126px:** request-booking support-details textarea.

Structural navigation, text links, whole-row targets, multiline fields, and linked cards are content-sized rather than fixed-height Buttons. They are still recorded because the audit brief asks for every interactive height.

### C1 — Week-grid expander is a 45px button

Computed value: **45px** (44.9006px in the zoomed pass).

Places: “2 more bookings” on Northern Sydney Overview; the same expander in a location week when a day exceeds the collapsed cap.

Rest of product: fixed controls use 32, 36, or 40px. No 45px control exception is documented; `PROJECT.md:410` documents only its inset focus ring.

### C2 — Pre-session action-card controls are 54px

Computed value: **54px**.

Places: Play the prototype, Jobs to be done, Information architecture.

Rest of product: whole-row list targets are at least 44px and content-driven; fixed controls use 32/36/40px.

Uncertainty: these are intentionally cards, not standard buttons (`PROJECT.md:86`), but their height exception is not documented.

### C3 — Choose-a-persona row controls are 60px

Computed value: **60px**.

Places: Helen Dawson, Marcus Lee, Sofia Patel persona choices.

Rest of product: comparable two-line selection rows range from 60px to 69px depending on inset/content; fixed controls use 32/36/40px.

Uncertainty: this is probably content-driven row height, but the brief requires it to be flagged and the exception is not documented.

### C4 — Native choice controls and multiline controls sit outside the three-height rule

Computed values:

- Radios and checkboxes: **16×16px**.
- Support-details textarea: **126px**.

Places: request-booking steps 1–3; check/radio settings bodies when re-enabled.

Rest of product: single-line form fields are 40px. These controls have different functions, so forcing them to 40px would be inappropriate; the documentation should narrow the 32/36/40 rule to single-line controls rather than imply it covers every interactive element.

Intentional and not counted: second-tier links are 48px because `--header-nav-height` is 48px; booking cards and whole-row targets are content-sized; breadcrumb and Back controls are inline text controls at 20px. Their roles and geometry are documented even though they fall outside the three fixed control heights.

## 4. Alignment

### A1 — `SectionHeadingRow` top-aligns mixed text/control rows — **resolved**

Original computed value: **align-items: flex-start**.

Places:

- Unfilled shifts: 48px title/support block beside 32px week controls.
- Direct-location list: 48px title/support block beside 32px sort control.
- Recently booked workers: 24px title box beside a 20px View all link.

Original optical offsets (from row top):

- A 24px section-title line has centre y=12px; a top-aligned 32px control has centre y=16px: **4px lower than the title**.
- A 20px View all link has centre y=10px: **2px above the 24px title centre**.

**Recomputed 15 Sep 2026, 100% zoom (`devicePixelRatio` 2), Illawarra Overview.** Row stays `items-start`; aside is `LineAlignedControl` at `--text-md--line-height` (24px). Title-line centre and control centre now match. Row heights unchanged (48 / 48 / 24px).

| Section | Title line centre | Control centre | Delta | Control height | Row height |
|---|---|---|---|---|---|
| Unfilled shifts | 202px | 202px | 0 | 32px | 48px |
| Houses | 631px | 631px | 0 | 32px | 48px |
| Recently booked workers | 202px | 202px | 0 | 20px (View all) | 24px |

### A2 — `PageHeading` top-aligns 32px titles with 36px actions — **resolved**

Original computed value: **align-items: flex-start**.

Places: Choose a persona Back; Jobs to be done Back; Information architecture Back; Bookings View by status/Request booking when enabled; worker profile Message/Request booking; other PageHeading action rows.

Original optical offset: title centre y=16px; button centre y=18px: **button is 2px lower**. With a description, the action remains aligned to the first line rather than the full heading block.

**Recomputed 15 Sep 2026, 100% zoom.** Action sits in `LineAlignedControl` at `--text-xl--line-height` (32px). First-line centre and action centre now match. A heading without a description is 32px tall (was 36px) — the 4px shrink is the rule working, not a regression. A heading with a description stays 60px.

| Page | Description | Title first-line centre | Action centre | Delta | Action height | Row height |
|---|---|---|---|---|---|---|
| Information architecture | no | 105px | 105px | 0 | 36px | 32px |
| Jobs to be done | yes | 105px | 105px | 0 | 36px | 60px |

Removing the wrapper live reproduced the old +2px offset.

### A3 — Worker-selection rows top-align the checkbox, avatar, and multiline text — **resolved**

Original computed value: **align-items: flex-start**; row heights **84–136px**.

Places: request-booking step 3 rows built by `workerRow` — **Your location team** and **Worked elsewhere**. Not the **Available nearby** rows, which stay `items-center` and were not in this change.

Original optical positions from row top: checkbox centre **28px**, 36px avatar centre **30px**, text-block centre varies **42–68px**. Checkbox and avatar differ by **2px**.

**Recomputed 15 Sep 2026, 100% zoom, Shellharbour 1 step 3 — alignment.** Row stays `items-start`. Checkbox and 36px avatar each sit in `LineAlignedControl` at `--text-sm--line-height` (20px). First-line, checkbox, and avatar centres match.

**Final geometry after raising top padding to `--space-4` (`pt-4 pb-3`, 16px / 12px).** Avatar top from the boundary above is **8px** on every row (card border on the first row of each list, divider on the rest). Name-line / checkbox / avatar centres remain aligned. Bottom padding is still 12px; last evidence line sits 12–13px above the row bottom.

| Worker | Boundary above | Avatar top | Centres vs name line | Row height before → after |
|---|---|---|---|---|
| Geoffrey L | card border | 8px | 0 | 117px → 121px |
| Brian R | divider | 8px | 0 | 117px → 121px |
| John M | divider | 8px | 0 | 84px → 88px |
| Pete C | card border | 8px | 0 | 105px → 109px |
| Beth C | divider | 8px | 0 | 137px → 141px |
| Luke A | divider | 8px | 0 | 136px → 140px |

Your location team list: 320px → 332px. Worked elsewhere: 380px → 392px. Both lists: 700px → 724px.

Rows checked and aligned correctly:

- grouping worker avatar/name: centre;
- sort label/select: centre;
- request Continue/Cancel: centre, equal 36px controls;
- footer logo/links: centre;
- account trigger: centre;
- radio label rows: centre (the 44px/45px difference was subpixel/content rounding, not a separate alignment rule).

### A4 — 36px avatar on a 20px name line — **open, do not act**

A 36px `md` avatar centred on a 20px (`text-sm`) name line has now caused two separate problems on the same row type:

1. The original A3 2px checkbox / avatar offset (controls were not sharing a line).
2. After line-alignment, 8px of upward overflow into 12px padding, putting the avatar 4px under the divider until top padding was raised to 16px.

The avatar-to-line-height ratio on these rows is worth revisiting. The alternative to asymmetric padding is a **smaller avatar** on this row type, which reduces the overflow at source. Do not act on it in this pass.

Places: request-booking step 3 `workerRow` only. Other 36px avatar rows stay `items-center` against a two-line block and were not in this change.

### A5 — Summary step-marker tick and numeral share a box but not a glyph — **open, do not act**

Measured 15 Sep 2026, 100% zoom, Shellharbour 1 request-booking Summary. One inline `<span>` in `BookingRequestSummary` (`h-6 w-6 rounded-full text-xs`); completed steps swap the child to `<Check className="h-5 w-5" />`. Not a shared component. The same markup is copied in `StatusSteps` on booking detail — not re-measured.

Box size is the same in every state: **24×24px**. Radius is Tailwind `rounded-full`, computed **16777216px** (this is B2 on this surface; earlier B2 notes recorded 9999px from Tailwind v3). Backgrounds resolve from tokens.

| State | When | Background | Glyph colour | Glyph |
|---|---|---|---|---|
| Numbered, unvisited | later steps | `#F7F8FA` `--color-surface-subtle` | `#555D6D` `--color-text-secondary` | numeral 12px (`--text-xs`) |
| Numbered, current | the active step | `#EEF0F4` `--color-surface-selected` | `#16181d` `--color-text` | numeral 12px (`--text-xs`) |
| Ticked, complete | earlier steps | `#e2f0fa` `--color-info-surface` | `#1424E0` `--color-brand` | Lucide Check **20×20px** |

The two variants differ in glyph, not box: a 20px tick in a 24px circle versus 12px type on a 16px line. Box utilities `h-6` / `w-6` come from the spacing scale (6 × `--space-1`). Radius is a literal (`rounded-full`). The tick size is the product icon utility `h-5 w-5`, not a marker-specific token.

Do not fix in this pass.

## 5. Colour

**No undocumented rendered colour inconsistency found.**

Matched browser declarations confirm the computed RGB values resolve from existing custom properties. In particular, primary/strong/secondary/tertiary text, page/surface backgrounds, borders, brand, status tones, and location greens are token-backed. Resolved RGB output alone was not treated as evidence of a literal colour.

No rendered inline hex/rgb declaration belonging to the app was found. The only literal rgba values returned by the page-wide scan belonged to the Cursor browser’s URL/status overlay, not the prototype.

## 6. Duplication

### D1 — Direct-location rows implement the same entity with different markup

Places:

- Overview `LocationRow`.
- `/supportables` `GroupingLocationRow`.

Differences confirmed in rendered output:

- Overview is a non-interactive row with a linked name, 16px inset, 12/16 tertiary type line, optional independent pending links, no chevron.
- `/supportables` is a whole-row button with a non-link name label, 12px/16px inset, 14/20 secondary type line, and chevron.

Rest of product: the row’s destination determines whole-row versus nested-link behaviour, but shared entity typography normally remains stable. `PROJECT.md:134` says the rows match Overview, so the unexplained visual differences are drift candidates.

### D2 — Attention booking cards have separate grid and list implementations

Places:

- `AttentionBookingCard` in the grouping week grid.
- `AttentionBookingListRow` in the >20-direct-location fallback.

Shared job: linked toned card with location, time, and `AttentionCardStatus`.

Markup difference: the grid version supplies an accessible booking label; the list fallback adds block layout but omits that label. The fallback could not be rendered with current seeded nodes, so this is a markup finding rather than a computed-style claim.

### D3 — Section-heading geometry has four implementations

Places:

- grouping Overview `SectionHeadingRow`;
- location week heading inside `BookingsWeek`;
- local `/supportables` section heading;
- grouping Workers table heading (hidden).

All perform title/support/control geometry, but use different wrappers and alignment. The Overview and location-week versions are visually the closest duplicates. The docs deliberately restrict `SectionHeadingRow` to Overview (`PROJECT.md:377`), but do not explain why the same geometry needs separate implementations.

Documented duplicates not flagged:

- grouping versus location status pills;
- grouping versus location worker actions;
- grouping versus location empty-day alignment;
- standard entity links versus the Messages selection-link exception;
- Badge versus Tag;
- rail layout versus Messages master-detail.

## 7. Borders and radii

### B1 — Border and outline widths have no width tokens

Computed values and places:

- **1px:** cards, controls, header/footer separators, list dividers, fields.
- **2px:** focus outlines and header-badge separation ring.
- **3px:** active second-tier underline.
- **4px:** active rail marker when gated rails are enabled.

Rest of product: 1px is the overwhelming border standard. There is no border-width token, so this is a system-token gap rather than a visible mismatch.

The 3px navigation underline and 4px rail marker are intentional (`PROJECT.md:355`, `PROJECT.md:417`). The 1px/2px literals are consistent but fail the brief’s “drawn from tokens” criterion.

### B2 — Full-circle radius is a literal 9999px

Computed value: **9999px** on avatars, badges, and the pinned-question trigger; **16777216px** on request-booking Summary step markers (`rounded-full` in Tailwind v4). Same intent, two literals.

Places: avatars; badges; circular status/step markers; pinned-question trigger when annotations are visible.

Rest of product: controls use **4px (`--radius-sm`)** and surfaces use **8px (`--radius-lg`)**.

The badge shape is documented (`PROJECT.md:366`), and circles clearly require a full radius, but there is no full-radius token and the remaining circular uses are not documented exceptions.

Not findings:

- controls computed at 4px from `--radius-sm`;
- cards/markers computed at 8px from `--radius-lg`;
- divided-card corner rows computed at 7px from `calc(var(--radius-lg) - 1px)`.

## Intentional, confirmed against PROJECT.md

1. Jobs to be done provenance colours reverse the signed-in colour rule — `PROJECT.md:108,406,412`.
2. Tinted-card status pills invert to dark fill/light text — `PROJECT.md:381,393-397`.
3. Grouping cancelled cards use outreach pills while location cancelled cards use bold canceller text — `PROJECT.md:398-400`.
4. Grouping outreach pills are not global Tags — `PROJECT.md:203,400`.
5. Fatigue is plain wrapping text in week grids but a Tag on wider surfaces — `PROJECT.md:296-297`.
6. Booking prices use neutral, not success, tags — `PROJECT.md:412`.
7. Grouping empty-day text is centred; location empty-day text is left-aligned — `PROJECT.md:201,290`.
8. Badge horizontal padding is 6px — `PROJECT.md:366`.
9. Grouping Dashboard omits `width-main-column` beside its 320px aside — `PROJECT.md:149,428`.
10. Grouping Workers numeric columns are right-aligned with tabular figures — `PROJECT.md:209`.
11. Insets vary by density — `PROJECT.md:402`.
12. Labelled stacked fields are 40px; fields beside buttons are 36px — `PROJECT.md:363`.
13. 16px glyphs in 32px controls and 20px glyphs in 36px controls — `PROJECT.md:367`.
14. Grouping worker actions are text-only; location worker actions are 32px icon-only — `PROJECT.md:414`.
15. Direct-child location rows use plain Building2/User glyphs — `PROJECT.md:211`.
16. Breadcrumb locations omit markers — `PROJECT.md:368`.
17. Pre-session action cards use plain 20px glyphs — `PROJECT.md:86`.
18. Week-card links carry the cue on the surface, not on inner text — `PROJECT.md:408-409`.
19. Messages names use a plain selection-link treatment — `PROJECT.md:407`.
20. Footer links remain muted but use standard underline behaviour — `PROJECT.md:410`.
21. Week-grid show-more uses an inset focus ring — `PROJECT.md:410`.
22. Messages is not a rail — `PROJECT.md:423-424`.
23. Worker profile/location preview reuse rail geometry without being nav rails — `PROJECT.md:417,422`.
24. Moderator dock tooltips open above — `PROJECT.md:415`.
25. Divided cards use visible overflow and calculated 7px row corners — `PROJECT.md:415`.
26. Organisation breadcrumb has no chevron/dropdown — `PROJECT.md:342,451`.
27. Breadcrumb overflow removes ancestors rather than truncating the current label — `PROJECT.md:345-348`.
28. Pre-session screens omit the signed-in footer — `PROJECT.md:102,112,357`.
29. Jobs titles use the separate 84rem measure — `PROJECT.md:102`.
30. Grouping locations are merged for this research round — `PROJECT.md:211`.
31. IA organisation/grouping branches start collapsed — `PROJECT.md:116`.
32. Main-nav links are 48px with a 3px underline and 3px optical top nudge — `PROJECT.md:341,355`.
33. Landing bodies and their badges/counts are hidden for this round — `PROJECT.md:469`.

## Contradictions in the docs

### DC1 — Section mixed-row alignment

- `PROJECT.md:363`: any row mixing controls needs `items-center`.
- `PROJECT.md:377`: `SectionHeadingRow` must use `items-start`, including rows with week and sort controls.

Rendered implementation follows `items-start` and produces the offsets recorded in A1.

### DC2 — `/supportables` omitted versus retained

- `TARGET-IA.md:40-45`: child list is “omitted when Overview is defined.”
- `TARGET-IA.md:138`: `/supportables` owns the complete direct-child list everywhere and remains reachable from See all N.

Likely intended resolution: the tab is omitted, not the route/list.

### DC3 — Organisation breadcrumb navigates versus never opens

- `TARGET-IA.md:74`: organisation name walks to its child list.
- `TARGET-IA.md:150`: organisation “never opens.”
- `PROJECT.md:342,451`: supports navigation on the name but no dropdown/chevron.

Likely intended resolution: the name navigates; only the sibling menu never opens.

### DC4 — Grouping persona landing

- `PROJECT.md:86`: a grouping persona lands on its child list.
- `PROJECT.md:149` and `TARGET-IA.md:130,138`: a grouping with direct locations lands on Overview.

Marcus and Sofia enter groupings with direct locations, so the first statement is stale.

### DC5 — Child-grouping destination

- `PROJECT.md:193`: selecting a child grouping enters its Overview.
- `PROJECT.md:149` and `TARGET-IA.md:134`: grouping-only children enter their child list.

### DC6 — Which Dashboard block is the aside

- `PROJECT.md:149` and `TARGET-IA.md:138`: locations are in the left content column; workers are the right aside.
- `PROJECT.md:250`: says workers appear beside the “houses and centres aside.”

### DC7 — Twelve switchable personas versus three reachable personas

- `PROJECT.md:15,451`: describes twelve switchable personas/all twelve in the picker.
- `PROJECT.md:86,465-466` and `TARGET-IA.md:128`: only Helen, Marcus, and Sofia are currently listed.

All twelve data records exist, but “switchable” is inaccurate for the current rendered scope.

### DC8 — README.md describes a superseded build

- `README.md` still titles the work as a House Manager dashboard prototype and describes a location Dashboard, a location switcher, and `http://localhost:3021/` as the way to run it.
- Current product docs live in `PROJECT.md`, `TARGET-IA.md`, and this audit. The live app includes later work such as `LineAlignedControl` and `groupingHasDefinedOverview`.

This already caused one tool to misidentify the project as the old location Dashboard prototype. `README.md` should either be rewritten to point at `PROJECT.md` or deleted. Do not rewrite it as part of this audit.

Explicitly superseded historical statements were not counted as unresolved contradictions: clients-after-places, the removed location Dashboard, and location-scoped Notifications. `README.md` is counted because it still presents those superseded surfaces as the current product.

## 8. Within-context control consistency

**Date of this pass:** 15 September 2026. **Zoom:** 100% (`devicePixelRatio` 2) unless noted. Global 32/36/40 is already accepted; this pass only asks whether controls doing the **same job in the same region** match. Deliberate cross-context rules were not flagged: stacked labelled fields 40px; a field beside a button 36px; heading-row controls 32px; native radios/checkboxes 16px; multiline fields content-sized.

Padding is recorded top/right/bottom/left. Radius **4px** is `--radius-sm`. Border colour `#C5CAD4` is `--color-border`. Font **14px** is `--text-sm` unless noted.

### Request-booking step 1 — measured live, Shellharbour 1

Two cards plus a shared footer.

**Location card — one select**

| Control | Height | Padding | Font | Border | Radius |
|---|---|---|---|---|---|
| Location select | 40px | 0/40/0/12 | 14px / 400 | 1px `--color-border` | 4px |

Right padding 40px is `pr-10` for the custom chevron, not a second height.

**Date and time card**

| Control | Height | Padding | Font | Border | Radius |
|---|---|---|---|---|---|
| Date | 40px | 0/12/0/12 | 14px / **500** (inherits `font-medium` from the label) | 1px `--color-border` | 4px |
| Start time | 40px | 0/12/0/12 | 14px / **500** | 1px `--color-border` | 4px |
| End time | 40px | 0/12/0/12 | 14px / **500** | 1px `--color-border` | 4px |
| Frequency radio (native) | 16px | 0 | 14px | 0 | 0 |
| Frequency row | 45px | 12/16/12/16 | 14px / 400 | 0 | 0 |

The three labelled fields match each other on height, padding, border, and radius. The three radio rows share one class and match each other. Radios are a different job from the date fields (documented native 16px).

**Footer (same cluster on steps 1–3)**

| Control | Height | Padding | Font | Border | Radius | Fill |
|---|---|---|---|---|---|---|
| Continue / Submit | 36px | 0/16/0/16 | 14px / 500 | 1px `--color-brand` | 4px | `--color-brand` |
| Cancel | 36px | 0/16/0/16 | 14px / 500 | 1px transparent | 4px | transparent |

Same box. Primary vs ghost is the action weight, not a size mismatch.

**Mismatch — I1.** Location select is **400** weight; date and time inputs are **500**. Same step, same job (a value the person is filling in). Settings `Field` and the Jobs filter selects set `font-normal` so they stay 400 inside a medium label. Request-booking `FIELD_CLASS` does not.

### Request-booking step 2 — measured live

| Control | Height | Padding | Font | Border | Radius |
|---|---|---|---|---|---|
| Support textarea | 126px | 12/12/12/12 | 14px | 1px `--color-border` | 4px |
| Support-plan checkbox | 16px | 0 | 14px | 0 | 0 |
| Support-plan row | 52px | 16/16/16/16 | 14px | 0 | 4px (`--radius-sm` on the callout) |
| Driving radio | 16px | 0 | 14px | 0 | 0 |
| Driving radio row | 45px | 12/16/12/16 | 14px | 0 | 0 |
| Continue / Cancel | 36 / 36 | as step 1 | | | |

No equivalent-control mismatch. Textarea is multiline. Checkbox vs radio are both native 16px. The 52px confirmation row and the 45px driving rows are different panels (callout vs option list), not two versions of the same control. Footer matches step 1.

Step 2 Back is a 20px `.ui-link`, not a 36px button — navigation, not the footer pair.

### Request-booking step 3 — live earlier this session; footer is the same cluster

| Control | Height | Notes |
|---|---|---|
| Worker checkbox | 16px | native, all six rows |
| Worker row | 88–141px after the padding fix | content-sized; top-aligned |
| Submit / Cancel | 36 / 36 | same footer as steps 1–2 |
| Nearby **Message** (when that list shows) | 32px `ui-button--small` | different list, compact row action |

No equivalent-control mismatch in the known-here / worked-elsewhere list. Nearby **Message** is a different row type (`items-center`, small button) and was not mixed into `workerRow`.

### Grouping Overview heading rows — measured live, Illawarra

| Region | Control | Height | Padding | Font | Border | Radius |
|---|---|---|---|---|---|---|
| Unfilled shifts aside | Today | 32px `--control-height-small` | 0/12/0/12 | 14px / 500 | 1px `--color-border` | 4px |
| | Previous / Next | 32×32 | 0 | 14px / 400 | 1px `--color-border` | 4px |
| Houses aside | Sort select | 32px | 0/32/0/8 | 14px / 400 | 1px `--color-border` | 4px |
| Workers aside | View all | 20px | 0 | 14px / 400 | 0 | 0 |

Week controls match each other (32px, same border and radius). Sort matches that 32px heading-row rule. **View all** is a `.ui-link` (documented), not a 32px control.

**Weight, not a mismatch:** View all is correct as a text link and reads lighter than Today / Sort beside the other headings. Neighbour worker-row **Message** / **Book** are 32px, same as the week controls, and match each other (0/12 padding, 1px border, 4px radius, 14px / 500).

### Location Bookings heading — not live (`LANDING_CONTENT_ENABLED` is false)

From source: **View by status** (`Button` secondary default) and **Request booking** (`Button` primary default) sit together in `PageHeading` actions — both 36px, 0/16 padding, 14px / 500, `--radius-sm`. Status-view links in the description are `.ui-link` (20px), a different job. No source mismatch of equivalent heading actions.

### Messages — not live (same flag)

From source + CSS, not computed this pass:

- Heading: **Archived** and **Mark all as read** are both `size="small"` → 32px. Match.
- Search row: input `h-9` → 36px, **Search** default `Button` → 36px, 1px `--color-border`, `--radius-sm`, 14px. This is the documented “field beside a button comes down to 36px”. Match.
- Thread toolbar: **Book** `size="small"` 32px beside **More** `IconButton` `size="small"` 32px. Match.
- Composer: textarea `min-height: var(--avatar-lg)` (44px) + **Send** default 36px. Multiline field beside a 36px button; not two equivalent controls.

### Settings, each scope — not live (same flag)

From source. `Field` is `h-10` + `font-normal` → 40px / 400, 1px `--color-border`, `--radius-sm`. **Save** is default `Button` → 36px. That is stacked field vs button, documented.

Within one section, buttons that share a job match: Documents **Upload** is `size="small"` on every row (32px). People **More** is default `IconButton` on every row (36px). Account **Choose file** is `size="small"` (32px) beside the avatar; **Save** in the same card is default 36px — different jobs (pick a file vs commit the section). Not flagged as equivalent.

### Header — measured live on Overview

**Identity utilities**

| Control | Height | Padding | Font | Border | Radius |
|---|---|---|---|---|---|
| Notifications | 36×36 | 0 | 14px / 400 | 1px `--color-border` | 4px |
| Account trigger | 36px | 0/8/0/8 | 14px / 500 | 1px `--color-border` | 4px |

Same height, border, radius. Padding differs because one is icon-only and the other holds an avatar and chevron. Not a mismatch.

**Breadcrumb controls** — all 20px, 14px, no fill, 4px focus radius. Current crumb is weight 700; ancestors 500. Intended.

**Second-tier nav** — Overview and Workers both 48px (`--header-nav-height`), 14px, padding 3/12. Active is 700, idle 500. Intended. Different region from the identity utilities.

Logo link is 24px identity, not a utility.

### Account menu — measured live

Your account, Organisation settings, Log out: all **36px**, padding 8/12, 14px / 400, no border, transparent. Match. (Links vs the Log out `button` do not change the box.)

### Moderator dock — measured live

Two 36×36 icon buttons, 1px `--color-border`, 4px radius. Match.

### Pre-session — measured live after Restart

**Start a session** action cards: Play, Jobs to be done, Information architecture — all **54px**, same linked-card treatment. Match.

**Choose a persona:** Back 36px (default `Button`, 0/16, 1px `--color-border`, 4px). Persona rows all **60px**, padding 8/12. Heading action vs list rows are different jobs. Rows match each other.

**Jobs to be done — Filter jobs:** five selects (Organisation, Sector, Theme, Origin, Status) all **40px**, padding 0/40/0/12, 14px / 400, 1px `--color-border`, 4px. Match. Back in the heading is 36px, a different region.

**Information architecture:** Back 36px; persona filter select 40px. Heading vs filter, documented.

### I1 — Request-booking labelled fields inherit bold from the label — **open, do not act**

Date and time inputs compute **font-weight 500** because `FIELD_CLASS` sits inside `label.font-medium` and does not set `font-normal`. The location select on the same step is **400**. Settings fields and Jobs filter selects set `font-normal` and stay 400. Height, border, and radius already match.

Do not fix in this pass.

## Five fixes to do first

1. ~~**Resolve the SectionHeadingRow alignment rule and implementation (A1/DC1).**~~ Done: rule in `PROJECT.md`, `LineAlignedControl` in code, A1/A2/A3 recomputed to 0px delta.
2. **Replace the shared 20px PageHeading gap with the documented 24px step, or change the rule (S1).** One shared decision corrects the rhythm across most pages.
3. **Unify the direct-location row contract (T1/S4/D1).** Switching from Overview to `/supportables` currently changes hierarchy, density, colour, and click model for the same entity despite the docs saying the rows match.
4. **Decide and document the in-progress-card inset (S3).** The placeholder is currently the most common rendered body because the landing flag is off, so its unexplained 24px treatment appears across many routes.
5. **Bring the week-grid expander into the control-height system or document it (C1).** It is the only visible standalone button at 45px and appears inside the product’s most prominent calendar.

## Drift versus intention: unresolved

- **Variable-height row/card controls:** 54px pre-session cards, 60px persona rows, 68–69px supportable rows, and multiline booking/worker cards are likely intentionally content-sized. The brief says to flag every interactive height outside 32/36/40, but applying fixed heights to these surfaces would be harmful.
- **Native 16px radio/checkboxes and 126px textarea:** these should not use the single-line field heights. The documentation needs a narrower definition of “control height.”
- **Request worker rows:** A3 closed — centres match; 16px / 12px padding documented. Remaining question is A4 (36px avatar on a 20px line), not a 4px divider gap.
- **Full-circle 9999px radius:** almost certainly intentional, but only the badge is explicitly documented and there is no radius token.
- **In-progress 24px inset:** may be intentional breathing room for a placeholder, but the only documented 24px card exception is for larger settings sections.
- **Hidden content:** no honest computed audit can be made of bodies that are not in the rendered DOM. Their route placeholders were audited; the hidden implementations were considered only for duplication and documentation contradictions.

## Pre-existing test failure (not this work)

`tests/workers-node.test.ts:106` — `assert.equal(northern[0]?.id, 'farah-t')` fails with actual `'brian-r'`. Same failure on an untouched checkout of `a00618a`. Cause is seeded-date drift in `groupingDashboardWorkers` ranking, not alignment. Do not fix it in this pass.
