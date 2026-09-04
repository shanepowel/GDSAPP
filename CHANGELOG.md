# Changelog

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
