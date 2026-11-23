# Changelog

## 2026-11-23 (demo portfolio, phone layout, Welsh on demand)

- The demo now holds five engagements at different stages, each with its own client, method, squad shape, confirmed squad and status: Network Rail asset reporting (Sprint Zero, hybrid, reporting), NRW permitting service (Discovery, at risk), NRW biodiversity data platform (Alpha), DVLA driving licence renewal (Beta, on track) and HS2 station information management (Live, waterfall, off track with a recovery plan). The duplicate "NRW Discovery" placeholder becomes the Network Rail engagement. The refresh runs once per version from the deploy seed, so later edits in the demo are kept.
- Phones: the context bar keeps only the engagement switcher, the stage bar is compact, the tabs fade at the edge to show they scroll and bring the current tab into view. The next action now starts about 170px higher.
- Welsh on demand: the browser tab title and meta description follow the chosen language, server-rendered text refreshes on switch, and any page opened with `?lang=cy` (or `/lang/cy?next=/path`) switches straight to Welsh.
- The squad builder heading names the squad the stage calls for (for example Beta / Live squad) rather than always Discovery squad.

## 2026-11-23 (engagement UX)

### Changed

- The status badge says why: for example "4 essential roles still open" or "one Compass measure below target".
- The next action names the count ("Fill the 4 essential roles still open.") and its button is a verb ("Open the squad") instead of repeating the sentence.
- The stage bar is grouped under Strategy, Set-up and Delivery, so the T&T phase no longer needs its own label in the header.
- The top bar says Stage instead of Phase, so it no longer clashes with the T&T phase.
- The evidence card is shorter and the method saves as soon as it is changed, with a "Method saved." message. No disabled Save button.
- Data product checks fold to one progress line until opened.
- Empty key dates read "Not set yet" instead of a dash.

### Fixed

- Focus rings on the navy side navigation and next action panel are white (9.7:1); they were navy on navy (1:1, WCAG 1.4.11).
- Buttons, selects and disclosure summaries show a pointer cursor.
- "Open Compass" and "View all in Decisions" links are at least 24px tall (WCAG 2.5.8).

## 2026-11-23

### Added

- Delivery method on every engagement: Agile, Waterfall or Hybrid, chosen in the new-engagement wizard and changeable on the overview. The evidence is the same for every method; the method sets when it is captured, where it is reviewed and where the decision is made. Engagements with no method recorded show as Agile with a prompt to record it.
- The engagement header shows the method and the T&T phase (Strategy, Set-up or Delivery) that the lifecycle stage sits in.
- Data product checks from the DAA Data & Analytics Playbook technical delivery checklist. Data and reporting squads get them automatically, existing ones are backfilled unticked, and any other engagement can add them from the overview. They never block a stage move.

## 2026-09-04

### Changed

- Product name is Assemble. Strapline: Assemble the team, then prove it will pass. The word datum is kept only for the 0.60 fit line.
- Colour tokens are Turner & Townsend navy and electric blue. Survey pink and drafting-stock teal are gone. Public Sans is the UI face. The fit strip is a navy (or risk-red) fill with a 2px blue datum line.

### Fixed


- People signed-in table reads the live pool. Unevidenced person is Harper Cole, multiplier stays at 1.00.
- Assurance no longer shows a hard-coded Wales DSS 0.64 teaching result above live analysis.
- Sign-in Launch demo honours `callbackUrl`.
- Ceremony identifiers in the practice table match the rigour enum (`nfr_planning`, and the rest).
- `/sign-in` server-renders the form shell instead of a Suspense "Loading…" fallback.
- Theme and maturity labels are in the copy dictionaries, including Welsh.
- Graphite token darkened so body labels pass a stronger contrast check. Some small-caps on Squads still fail axe (open).

### Added

- `lib/product.config.ts`: name, strapline, meta description, datum line `0.60`.
- Numbered journey nav: 1 Define, 2 Hold, 3 Assemble, 4 Assure, 5 Run. Stage handover, next/previous, mobile stepper.
- `/demo`: shared read-only identity, no password. Writes blocked at tRPC and REST.
- Persistent engagement strip on stage pages. Explain as I go copy in `lib/copy.ts`.
- GDS / DDaT bridge labels on pillars, signals and ceremony rows (`lib/bridge/gds.ts`).
- Landing page shortened. Practice chapters on `/practice`. Datum line figure and hover on the fit strip.
- Ceremony of origin on `RigourSignal` and in score working.
- Building Safety Act golden thread in the crosswalk seed.

### Open

- Recharts width/height -1 on history and rigour (P2).
- OrgChart still uses hard-coded hex (P2).
- Axe serious colour-contrast remains on Squads (about 20 nodes of small caps and flags).
- Lighthouse CLI was not available in this environment; LCP/CLS/bundle size still unmeasured.
- Tab order on Squads still lands on the Next.js portal marker before page controls.
- Historical comments and `docs/spec/` still describe an earlier Datum identity. User-facing product name is Assemble.
