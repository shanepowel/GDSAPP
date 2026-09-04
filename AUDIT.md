# Datum audit

Record of the 4 September 2026 audit of the then-named Datum build. The product name is now Assemble. The 0.60 fit line is still called the datum.

Recorded against a clean local run on 4 September 2026: PostgreSQL 16, `npm run seed`, Next.js `npm run dev`, Playwright Chromium, axe-core 4.11. Signed in as `admin@demo.local` / `demo-password`.

House rules applied: UK spelling, no em dashes in this file.

---

## Part 1.1 Environment

| Check | Result |
|---|---|
| Documented env vars | `.env.example` covers database, Auth.js, Entra, deployment mode. `AUTH_ALLOW_CREDENTIALS` is documented only by comment; README does not say that Entra-off local login already uses credentials. `CRON_SECRET` (freshness cron) is not in `.env.example`. |
| Seed | `npm run seed` is idempotent and produces four engagements including NRW discovery (`nrw-demo`), a mixed pool of 18 people, archetypes, Wales DSS judgements, and 1440 fit scores. |
| Test user | `admin@demo.local` / `demo-password`, documented in README. |
| Demo engagement copy vs seed | Marketing strip says "NRW Permitting Service, Discovery week 4 of 8, Wales DSS Gate 1, Level 2 Evidenced". Seeded name is "NRW regulatory permitting service (discovery)", phase is `discovery` (no week), maturity is `practising` until assurance seed sets index 71. The public strip is hard-coded via `showDemoContext`, not the live row. |
| Clean clone | Docker Compose is the documented database path. This Cloud Agent image has no Docker; Postgres was installed locally. README should mention a native Postgres fallback. |

---

## Part 1.2 Route audit

Legend: SO = signed out, SI = signed in. Console and network are from Playwright (navigation aborts of in-flight tRPC/session calls are noted but not treated as application 4xx/5xx).

| Route | Signed-out | Signed-in | Console | Network | Notes |
|---|---|---|---|---|---|
| `/` | 200 | 200 | none (abort noise on SI nav) | abort noise | Public practice essay. Hard-coded engagement strip. No primary CTA above the fold. `primaryCta` copy is unused. |
| `/roles` | 200 | 200 | none | none | Teaching role cards (WALKTHROUGH_ROLES), not live archetypes. |
| `/practice/pillars` | 200 | 200 | none | none | Pillars table only. |
| `/practice/ceremonies` | 200 | 200 | none | none | Exists. Home still duplicates the table. Stage pages do not link here. |
| `/practice/maturity` | 200 | 200 | none | none | Ladder with hard-coded "you are here" at level 2. |
| `/practice/standards` | 200 | 200 | none | none | Ready / done / Keel. |
| `/sign-in` | 200 | 200 | none | none | Client component behind Suspense fallback "Loading...". Demo fill overrides `callbackUrl`. |
| `/demo` | 307 to `/?tour=1` | same | none | none | Not a demo mode. Tour only, still public home. |
| `/accessibility` | 200 | 200 | none | abort on leaving `/sign-in` | Statement page. |
| `/ai-use` | 200 | 200 | none | none | |
| `/performance` | 200 | 200 | none | none | |
| `/people` | 307 `/sign-in?callbackUrl=%2Fpeople` | 200 | none | none | **P0.** Stats and table are `WALKTHROUGH_PEOPLE` (Carys Hughes and friends), not the seeded pool. Live `Add person` writes to org design beside a fake table. |
| `/people/graph` | 307 callback | 200 | none | none | D3 chart, dynamically imported. Hard-coded hex colours in `OrgChart`. |
| `/squads` | 307 callback | 200 | none | none | Index of engagements. |
| `/squads/nrw-demo` | 307 callback | 200 | none | none | Live fit table plus a forced teaching walkthrough (`WalkthroughSlot force`). Row click opens `/roles/:id` working. |
| `/squads/nrw-demo/gaps` | 307 callback | 200 | none | none | Live gaps. |
| `/assurance` | 307 callback | 200 | none | none | **P0.** Always renders a hard-coded Wales DSS teaching table (preparedness 0.64) above the live engagement list. |
| `/assurance/nrw-demo` | 307 callback | 200 | none | none | Same teaching block, then a live criteria table. Wales table appears even if the selected engagement is GDS. |
| `/portfolio` | 307 callback | 200 | none | none | Live rollup plus a teaching engagements table (`teachingRows`). |
| `/profile` | 307 callback | 200 | none | none | Sign-out lives here, not in the primary nav. |
| `/settings` | 307 callback | 200 | none | none | |
| `/settings/archetypes` | 307 callback | 200 | none | none | System archetypes present after seed. |
| `/framework` | 307 callback | 200 | none | none | Not in primary nav. |
| `/handover` | 307 callback | 200 | none | none | Not in primary nav. |
| `/benchmarking` | 307 callback | 200 | none | none | Not in primary nav. |
| `/engagements/new` | 307 callback | 200 | none | none | Create wizard. |
| `/engagements/nrw-demo/assess` | 307 callback | 200 | none | none | Live assess. Redirect from `/engagements/:id` goes to `/squads/:id`. |
| `/engagements/nrw-demo/assure` | 307 callback | 200 | none | none | Crosswalk packs. |
| `/engagements/nrw-demo/team/people` | 307 callback | 200 | none | none | Live people for the engagement. |
| `/engagements/nrw-demo/organise` | 307 callback | 200 | none | none | |
| `/engagements/nrw-demo/tender` | 307 callback | 200 | none | none | |
| `/engagements/nrw-demo/requirement` | 307 callback | 200 | none | none | |
| `/engagements/nrw-demo/judgements` | 307 callback | 200 | none | none | |
| `/engagements/nrw-demo/evidence` | 307 callback | 200 | none | none | |
| `/engagements/nrw-demo/structure` | 307 callback | 200 `/organise` | none | none | Redirects to organise. |
| `/engagements/nrw-demo/analysis` | 307 callback | 200 | none | none | |
| `/engagements/nrw-demo/rigour` | 307 callback | 200 | Recharts width/height -1 warning | none | Chart container has no size on first paint. |
| `/engagements/nrw-demo/history` | 307 callback | 200 | Recharts width/height -1 | none | Same. `/activity` redirects here. |
| `/engagements/nrw-demo/settings` | 307 callback | 200 | none | none | |
| `/engagements/nrw-demo/report` | 307 callback | 200 | none | none | |
| `/engagements/nrw-demo/reviews` | 307 callback | 200 | none | none | |
| `/share/[token]` | not hit (no token) | | | | Public share routes exist. |

Deep-link / hard refresh: protected routes redirect to sign-in with `callbackUrl` preserved in the URL. Public routes render. Back button: browser history is standard Next; no traps found.

Empty states: People, Squads, Assurance and Portfolio have copy in `lib/copy.ts`. People never shows `noPeople` because the teaching table is always filled. Error states when the API is down: most authenticated pages are client tRPC with a "Loading..." string and no timeout/error panel (P1).

---

## Part 1.3 Auth audit

| Check | Result | Severity |
|---|---|---|
| Signed-out protected route | Middleware (`proxy.ts`) 307 to `/sign-in?callbackUrl=...`. Confirmed for every protected route above. | Pass |
| Callback after sign-in | **Fails if the user clicks Launch demo.** `AuthTabs` sets `redirectOverride` to `/squads/nrw-demo`, ignoring `callbackUrl`. Playwright: `/sign-in?callbackUrl=/portfolio` landed on `/squads/nrw-demo`. | P0 |
| Sign-out | Profile page `signOut({ callbackUrl: '/' })`. No sign-out in the shell. | P1 (discoverability) |
| `/sign-in` without JS / slow JS | Client page wrapped in `<Suspense fallback="Loading...">` because of `useSearchParams`. Form is not server-rendered. | P1 |
| Session expiry | No dedicated expired-session message. NextAuth client fetch error is a console error; the page does not explain it. | P1 |
| Demo credentials on `/sign-in` | Email and password are printed in the page. Fine for a local demo, not a substitute for a read-only `/demo` identity. | P1 vs 3.3 |

---

## Part 1.4 Data integrity

| Check | Result | Severity |
|---|---|---|
| Squad composite opens | Squad table row goes to `/squads/:id/roles/:roleId`, which expands `FitBreakdownPanel` (skills held vs required, rigour multiplier). The number on the index row is not itself a control, but the working is one click away. | Pass for open-the-working; incomplete chain is 3.8 |
| Ceremony of origin | `FitBreakdownPanel` lists signal `type` only. `RigourSignal` has no `ceremony` field. Seed notes mention ceremonies in prose, not as data. | P1 (Part 3.8) |
| Assurance numbers | Teaching strip shows 0.64 / 3 at risk / Wales DSS regardless of engagement. Live analysis for NRW seed is index 71 with 7 judgements. Two conflicting numbers on the same page. | P0 |
| Datum line 0.60 | `VIABILITY_THRESHOLD = 0.6` in `lib/scoring/fit.ts` and `--viability` in root layout. Copy repeats the literal "0.60" in four English strings and the Welsh file. CSS default `--viability: 60%` in tokens. Not a per-component hard-code of the rule, but not a single product config either. | P2 until 3.1 |
| Unevidenced multiplier | Scoring: zero signals => `rigourMultiplier = 1.0` and `no_rigour_signals`. Seed person **Harper Cole** has no `rigour` array. Teaching person **Carys Hughes** is unevidenced in the walkthrough, not in the live pool. The People page shows Carys, not Harper. | P0 (wrong person on the signed-in People table) / Pass in `lib/scoring/fit.ts` |
| DDaT skill levels | `LEVEL_LABEL`: Awareness, Working, Practitioner, Expert. Matches the published Government Digital and Data Profession Capability Framework. No drift. | Pass |
| Ceremony signal identifiers | `lib/practice.ts` ceremonies emit `"nfr planning"`, `"capacity discipline"`, `"spike discipline"`, `"handover quality"`, `"assurance participation"` (spaces). Code enum is snake_case: `nfr_planning`, `capacity_discipline`, `spike_discipline`, `handover_quality`, `assurance_participation`, plus `sustained_assignment` which the table never names. | P1 |

---

## Part 1.5 Standards and crosswalk

| Check | Result |
|---|---|
| Frameworks loaded | nista-gateway, iso-19650, riba-2020, tcop, construction-playbook, cgs, gds-assessment. 48 reviewed mappings. Queryable via `crosswalk` tRPC router. |
| Building Safety Act golden thread | **Missing.** Mentioned in `docs/spec/09-delivery-playbook.md` only. No framework code, no mappings. |
| GDS points 1 to 14 mapped | Present in `data/frameworks/seed/frameworks.json` for all 14 criterion refs (NISTA, TCoP, ISO 19650, Construction Playbook, and GDS assessment packs between them). Point 8 is mapped to GDS assessment packs, not to NISTA. |
| Switch standard changes the result | Engagement `standardId` is wales vs gds. Assurance teaching table does **not** switch: it is always Wales DSS copy. Live `assessList` follows the bound catalog. Switching engagement in the strip on `/assurance/:id` does change the live table; the teaching block above it does not. | P0 for the teaching block / Pass for live assess |
| Catalog standards | gds-service-standard (14), wales-dss (12), tcop (10). NISTA / ISO / Playbook / BSA are frameworks, not catalog standards. |

---

## Part 1.6 Language, accessibility, responsiveness

### Welsh

Toggle works via `lib/copy.cy.ts` for Datum copy. Strings that stayed in English on `/` and `/people`:

- Product name "DATUM" (acceptable)
- "TURNER & TOWNSEND" (acceptable)
- Theme control **"DARK"** / **"LIGHT"** (`ThemeToggle` is not in the copy dictionary)
- Maturity **"Evidenced"** / **"Practising"** (`MATURITY_LABELS` is English-only)
- Live engagement titles (user data, expected)
- "GDS" as a standard chip
- Nav `uppercase` tracking on the wordmark

Layout at 1280px did not break with Welsh. "EGLURO WRTH I MI FYND" is long but wraps in the sidebar.

### Dark mode

`OrgChart` uses hard-coded `#003cb4`, `#1e7a46`, `#b26a00`. Recharts pages inherit tokens only if CSS variables are passed; default strokes may vanish or clash. Graphite on stock is the axe contrast failure (below).

### Axe (serious or critical)

Critical: none recorded.

Serious `color-contrast` on: `/` (4), `/roles` (6), `/practice/*` (1 to 2), `/people` (5), `/squads/nrw-demo` (19), `/assurance/nrw-demo` (5), `/portfolio` (4). Almost certainly `--graphite` (#5c6360) on `--stock` (#edefea) for small caps labels.

### Keyboard

Tab from `/squads/nrw-demo` landed on the Next.js portal marker in this environment before page controls. In-app, squad rows are clickable `<tr>` without `tabIndex`/`role="link"` on the live table (assurance live table does have keyboard handlers). Squad builder teaching walkthrough uses buttons. Assurance standard switcher is the engagement `<select>` in the strip, not a dedicated switcher.

### Viewports (375 / 768 / 1280)

No horizontal overflow detected on `/`, `/squads/nrw-demo`, `/assurance/nrw-demo`, `/people`. Sidebar becomes a wrapping horizontal nav at `md` breakpoint; numbered journey is not yet a stepper.

---

## Part 1.7 Performance

Lighthouse CLI was not run in this pass (no lighthouse binary; will record after figures in Part 4). Static notes:

- `d3` is dynamically imported from `/people/graph` and `DesignWorkspace`.
- `recharts` is a static import on history and rigour pages (not code-split).
- Root layout loads three IBM Plex faces (sans, condensed, mono).
- Teaching walkthrough is forced on every Squad page (`force`), so signed-in `/squads/:id` always hydrates the teaching squad as well as live fit.

---

## Part 2 Triage

### P0

| ID | Finding |
|---|---|
| P0-1 | Signed-in People table and stats use teaching fixtures, not the seeded pool. Unevidenced person on screen is Carys Hughes, not Harper Cole. |
| P0-2 | Assurance always shows a hard-coded Wales DSS teaching result (0.64). Live NRW index is 71. Two numbers. Wales table appears on GDS engagements. |
| P0-3 | Sign-in "Launch demo" ignores `callbackUrl`. |

### P1

| ID | Finding |
|---|---|
| P1-1 | `/demo` is a tour redirect, not a read-only demo without an account. |
| P1-2 | Ceremony signal copy uses spaces; code uses snake_case. `sustained_assignment` is missing from the ceremonies table. |
| P1-3 | Score working does not name the ceremony that emitted the evidence. |
| P1-4 | `/sign-in` Suspense "Loading..." instead of a server-rendered form shell. |
| P1-5 | No session-expiry message. |
| P1-6 | Client pages show "Loading..." with no error panel if tRPC fails. |
| P1-7 | Axe serious colour-contrast on every primary route (graphite on stock). |
| P1-8 | Welsh: Dark/Light and maturity labels stay English. |
| P1-9 | Building Safety Act golden thread not in the crosswalk seed. |
| P1-10 | Recharts "width(-1) height(-1)" warnings on history/rigour. |
| P1-11 | Primary nav does not include sign-out. |
| P1-12 | Portfolio and People mix teaching numbers with live numbers. |
| P1-13 | Package name, some docs, and comments still say Assemble / gdsapp. Meta description is T&T-internal. |

### P2

| ID | Finding |
|---|---|
| P2-1 | `/` is a long essay; unused `primaryCta`. |
| P2-2 | Six equal nav doors; no numbered journey. |
| P2-3 | Engagement strip on public pages is fake; on app pages it is live but missing week/gate. |
| P2-4 | Datum line explained only in passing. |
| P2-5 | Pillars and signals have no GDS/DDaT bridge labels. |
| P2-6 | OrgChart hard-coded hex. |
| P2-7 | Em dashes in comments, copy (`layout.tsx` title), and `DEMO_VACANCY_NAME`. |
| P2-8 | recharts not code-split; three webfonts. |
| P2-9 | Docker-only README despite native Postgres working. |

---

## Part 3 status (before work)

All of 3.1 to 3.8 are unimplemented at audit time. `/practice/ceremonies` already exists and should be the home of the ceremonies table.

---

## Part 4 after figures

Re-run 4 September 2026 after the fixes. Same machine, seed, Playwright, axe-core 4.11. `afterCallback` is now `http://localhost:3000/portfolio`. Unit tests: 94 passed. `/demo` sets a `demo-reader` session and lands on `/squads/nrw-demo`. Mutation as that identity returns 403 FORBIDDEN.

### Route re-run (selected)

| Route | Before | After |
|---|---|---|
| `/` | Public essay, no primary CTA | Strapline, Try the demo, datum line figure. 200 |
| `/demo` | 307 to `/?tour=1` | 307 `/api/auth/demo` then `/squads/nrw-demo` with session cookie |
| `/practice` | Did not exist as chapters | 200, practice chapters |
| `/people` SI | Teaching table (Carys Hughes) | Live pool. Harper Cole. 200 |
| `/assurance` SI | Teaching 0.64 | Live engagements only. 200 |
| `/assurance/nrw-demo` SI | Teaching 0.64 then live | Live index, grouped by point, pillar as secondary. No 0.64 |
| `/sign-in` | Client Suspense Loading | Server-rendered email/password form |
| callback `/sign-in?callbackUrl=/portfolio` | Landed `/squads/nrw-demo` | Lands `/portfolio` |

Signed-out protected routes still 307 to `/sign-in?callbackUrl=...` (confirmed with a cookie-less curl). An audit pass that hits `/demo` first will appear signed in afterwards: that is the demonstration identity, not a missing redirect.

### Auth

| Check | Before | After |
|---|---|---|
| Launch demo vs callbackUrl | P0 fail | Pass |
| `/sign-in` form without waiting on JS searchParams | Loading fallback | Form in the HTML |
| Sign-out | Profile only | Sign out in the shell |
| Session expiry copy | Missing | `copy.ui.sessionExpired` on `/sign-in?error=...` and load-failed empty states |
| Demo without account | Missing | `/demo` |

### Data integrity

| Check | After |
|---|---|
| Datum line | `DATUM_LINE` in `lib/product.config.ts`, `VIABILITY_THRESHOLD` imports it, CSS `--viability` from layout |
| Unevidenced | Harper Cole, `no_rigour_signals`, multiplier 1.00, labelled |
| Ceremony identifiers | snake_case, matches enum |
| Ceremony of origin | `RigourSignal.ceremony` seeded via `ceremonyForSignal` |
| BSA golden thread | Framework `bsa-golden-thread`, 3 items, 3 GDS mappings. Seed reports 8 frameworks, 51 mappings |

### Welsh / axe / viewport

| Check | Before | After |
|---|---|---|
| Theme Dark/Light | English DARK/LIGHT | TYWYLL / GOLAU |
| Maturity labels | English only | copy.maturityLevels (Yn ymarfer, Wedi’i dystio, …) |
| Axe `/` colour-contrast | 4 serious | 1 serious |
| Axe `/people` | 5 serious | 3 serious |
| Axe `/assurance/nrw-demo` | 5 serious | 2 serious |
| Axe `/squads/nrw-demo` | 19 serious | 20 serious (open) |
| Overflow 375/768/1280 | none | none |
| Keyboard squads | Next.js portal first | Unchanged, still P2 |

### P0 / P1 status

| ID | Status |
|---|---|
| P0-1 People teaching table | Fixed |
| P0-2 Assurance 0.64 | Fixed |
| P0-3 callbackUrl | Fixed |
| P1-1 `/demo` | Fixed |
| P1-2 ceremony identifiers | Fixed |
| P1-3 ceremony of origin | Fixed |
| P1-4 sign-in Loading | Fixed |
| P1-5 session expiry message | Fixed (copy + sign-in error) |
| P1-6 tRPC error panel | Fixed on People, Squads, Assurance, Portfolio |
| P1-7 axe contrast | Partial: graphite darkened; Squads still serious |
| P1-8 Welsh Dark/Light and maturity | Fixed |
| P1-9 BSA seed | Fixed |
| P1-10 Recharts -1 | Open (P2) |
| P1-11 sign-out in nav | Fixed |
| P1-12 teaching mixed with live | Fixed on People, Assurance, Portfolio |
| P1-13 Assemble identity | User-facing pages, package name, meta: Datum. `docs/spec/` still says Assemble |

### Part 3 status

| Item | Status |
|---|---|
| 3.1 product.config and Datum identity | Done |
| 3.2 numbered journey nav | Done |
| 3.3 demo mode without sign-in | Done |
| 3.4 engagement strip and explain copy | Done |
| 3.5 GDS/DDaT bridge | Done |
| 3.6 landing vs `/practice` | Done |
| 3.7 datum line on `/` and squad hover | Done |
| 3.8 ceremony in the working | Done |
