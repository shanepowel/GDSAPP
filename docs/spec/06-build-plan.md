# 06 — Build Plan

Seven phases. Each task is one branch, one PR. Acceptance criteria are the definition of done — paste
them into the Cursor prompt and require proof of each before the PR opens.

**Phase gate rule:** a phase does not start until the previous phase's criteria all pass. Phase 1 in
particular is load-bearing; building UI on the old schema will cost more than the wait.

---

## Target repository shape

```
/
├── apps/
│   └── web/                        Next.js App Router (the only app)
│       ├── app/
│       │   ├── (marketing)/        existing landing, sign-in
│       │   ├── (engagement)/engagements/[eng]/...
│       │   ├── api/                route handlers (ported from server/routes.ts)
│       │   └── globals.css         tokens (01-design-system.md)
│       ├── components/
│       │   ├── ui/                 Radix primitives, retokenised
│       │   ├── product/            TitleBlock, IndexValue, Verdict, ProvenanceChip, GapCard…
│       │   ├── chain/              the Evidence Chain rail
│       │   └── org/                OrgGraph (D3), OrgTable
│       └── messages/{en,cy}.json
├── packages/
│   ├── db/                         Drizzle schema, migrations, client
│   ├── scoring/                    pure scoring function (D7)
│   ├── standards/                  seed data + crosswalk, version-controlled JSON
│   └── shared/                     Zod schemas, types, constants
├── .cursor/rules/*.mdc
└── docs/spec/                      this spec
```

Use pnpm workspaces + Turborepo. The org tool's `client/` and `server/` directories do not survive as
directories — their contents are ported file by file.

---

## Phase 0 — Foundations (no behaviour change)

| Task | Acceptance criteria |
|---|---|
| **0.1** Monorepo scaffold | `pnpm install` at root works; `pnpm dev` starts the Next app; existing Assemble routes render unchanged; org tool code moved into `apps/web` untouched but not yet routed |
| **0.2** Install design tokens | All tokens from `01-design-system.md` in `globals.css`; Tailwind maps semantic names only; `bg-blue-500`-style raw palette classes fail lint; shadcn default theme deleted |
| **0.3** Fonts | Instrument Sans + IBM Plex Mono self-hosted via `next/font`, subset, `display: swap`; Source Serif 4 loaded only in the PDF route; no layout shift measurable on the engagement list |
| **0.4** Accessibility CI gate | Playwright + `axe-core` runs on every route at 1440/768/375px; a seeded violation fails the build; passing baseline committed |
| **0.5** Cursor rules | `.cursor/rules/*.mdc` in place from `cursor-rules/`; an agent asked to add a component references a token by name |
| **0.6** `packages/scoring` skeleton | Types from `03-data-model.md` exported; `score()` returns `index: null`; Vitest configured with one passing test |

**Do not** restyle any screen in Phase 0. Tokens land, nothing moves. This keeps the diff reviewable.

---

## Phase 1 — Schema and standards as data

| Task | Acceptance criteria |
|---|---|
| **1.1** M1 + M2: `workspaces` → `engagements`, rescope every `workspace_id` | All existing org tool functionality works against renamed tables; no data loss verified against a restored backup; every index renamed consistently |
| **1.2** Extend `engagements` | New columns present with safe defaults; existing rows get generated `reference` values (`{CLIENT}-{SEQ}`); `mode` defaults to `bid` |
| **1.3** M3: standards tables + seed | GDS Service Standard v2019.1 (14 criteria), Wales DSS, TCoP seeded from `packages/standards/seed/*.json`; each carries publisher, OGL licence and attribution string; `phases` populated per criterion; seed is idempotent |
| **1.4** `criterion_translations` + `next-intl` | EN and CY rows exist for every seeded criterion; Welsh rows marked `machine` where not yet human-reviewed; the EN/CY toggle switches document `lang`; ICU plurals used, no string concatenation |
| **1.5** `engagement_standards` join + phase filtering | An engagement selects one or more standard versions; `/assess` lists only criteria applicable to the engagement's phase; changing phase changes the list without losing judgements |
| **1.6** Retire the Express server | Every route in `server/routes.ts` exists as a Next route handler with identical contract; `server/` deleted; existing client calls unchanged; rate limiting and request-ID logging preserved |
| **1.7** Entra ID auth (D4) | Sign-in via Entra; T&T users land in their tenant; client users invitable as B2B guests; `assessor` role added to the RBAC matrix; Replit auth code and tables removed; every existing permission check still enforced |

**1.6 and 1.7 are the riskiest tasks in the whole plan.** Do them separately, behind a feature flag,
with the old path removable in one commit. Do not combine them.

---

## Phase 2 — Port the org tool into the shell

| Task | Acceptance criteria |
|---|---|
| **2.1** Engagement layout shell | Left rail with six destinations; `<TitleBlock/>` reads live engagement data; engagement switcher is a searchable palette; responsive to 375px; keyboard-navigable |
| **2.2** Port `<OrgGraph/>` | Force, tree and radial layouts work as client components with `ssr: false`; simulation stops on unmount with no leaked rAF; under `prefers-reduced-motion` renders settled positions with no visible motion; PNG and SVG export still work |
| **2.3** Build `<OrgTable/>` | Nested accessible tree showing role, accountabilities, holder, vacancy; full keyboard navigation; screen-reader tested; `Graph \| Table` toggle persisted per user; axe clean |
| **2.4** Port People, Scenarios, Activity | `/organise/people`, `/organise/scenarios`, `/activity` at parity; scenario branch, diff and promote all work; retokenised to the new design system |
| **2.5** Rewrite templates | Startup/SaaS templates deleted; the seven engagement templates from `02-ia-and-flows.md` implemented with DDaT role archetypes and ISO 19650 information management roles where relevant |
| **2.6** Engagement creation wizard | Four steps; all three team entry paths work (template, CSV/JSON import, Entra directory pull); a new engagement reaches a rendered org graph in under 5 minutes of user time |
| **2.7** Dark mode | Full token set inverted; every verdict pair re-verified for 4.5:1; persisted; no component hardcodes a light-mode value |

---

## Phase 3 — Evidence, judgement, and the chain

The keystone phase. If only one phase ships well, make it this one.

| Task | Acceptance criteria |
|---|---|
| **3.1** M4: evidence and judgement tables | Migration applied; `judgements.confirmedByUserId` is `NOT NULL`; Zod enforces 40-character minimum rationale; superseding works and history is queryable |
| **3.2** Evidence ledger | `/evidence` lists with owner, dates, freshness, linked-criteria count; add/edit/delete; upload to blob storage with key recorded; link to ≥1 criterion enforced at API level, not just in the form |
| **3.3** Criterion detail | `/assess/[criterionRef]` shows verbatim statement, current verdict, evidence, capability requirements, judgement history; setting a verdict requires rationale; `Confirm as written` vs `Edit and confirm` behave per `05-ai-governance.md` |
| **3.4** `<ProvenanceChip/>` everywhere | Present on every judgement, evidence row and capability link; four states render correctly; appears in the PDF export |
| **3.5** **The Evidence Chain rail** | Opens from any index value, verdict or criterion ref, by click and by keyboard; renders all six segments; connector is solid / plain / dashed per chain state; focus trapped, `Esc` returns focus to trigger; full-screen sheet under 1024px; respects reduced motion; every segment links to its record |
| **3.6** Freshness and decay | Nightly job re-evaluates expiry; expiring-within-30-days surfaced on Overview; expiry moves a verdict to `at risk` with a system note naming the cause and notifies the owner; a verdict never changes without a recorded cause |
| **3.7** Evidence owner nudge | Owner assignment per criterion; bulk-assign by circle; nudge sends an email deep-linking to the criterion |

---

## Phase 4 — The live index

| Task | Acceptance criteria |
|---|---|
| **4.1** `capability_requirements` seeded | Every GDS and Wales criterion has at least one capability requirement with a DDaT role archetype; reviewed by a named person, recorded in the seed file |
| **4.2** `capability_links` + auto-match | Auto-seeding matches `roleArchetype`/`skillTags` against roles and people; auto-matched links marked `unconfirmed`; a human can confirm, correct or delete; unconfirmed links cannot raise a verdict to `met` |
| **4.3** `packages/scoring` complete | All six rules from `03-data-model.md` implemented; property test proves adding fresh evidence never lowers the index; golden-file test against an NRW-shaped fixture; `now` injected, no `Date.now()` inside; 100% branch coverage on the rule logic |
| **4.4** `<IndexValue/>` + Overview | Index renders from `packages/scoring` only; shows `—` not `0` on insufficient data; delta animation with tabular numerals and staggered row pulse; reduced-motion variant; opens the chain |
| **4.5** `index_snapshots` + trend | Snapshot written on every index-moving event with a `cause`; 12-week sparkline on Overview; `What changed since your last visit` reads from snapshots and activity against a per-user last-seen |
| **4.6** `<GapCard/>` | Every gap carries reasoning **and** a named move; statutory gaps sort first and render as `<StatutoryFlag/>`, visually distinct from `at risk`; `Model a fix` branches a scenario with the move pre-applied and shows the projected delta against live |

---

## Phase 5 — Crosswalk and gate packs

The differentiator. Content work as much as engineering — resource it accordingly.

| Task | Acceptance criteria |
|---|---|
| **5.1** M5 + framework seeds | `frameworks` and `framework_items` seeded for NISTA gateway (Gates 0–5), ISO 19650, RIBA Plan of Work 2020 stages, TCoP, Construction Playbook / Constructing the Gold Standard; each with publisher, version, licence and attribution |
| **5.2** Crosswalk authoring | `crosswalk_mappings` populated for GDS ↔ TCoP ↔ NISTA ↔ ISO 19650 at minimum; every mapping has `relation`, a note explaining the reasoning, an author **and a second-person reviewer** — this is the IP, it does not ship unreviewed |
| **5.3** `<CrosswalkMatrix/>` | Criteria × framework items with relation per cell; coverage percentage; keyboard-navigable grid with proper table semantics; readable at 375px via a stacked variant |
| **5.4** Gate pack gap list | Three categories rendered distinctly: answerable now, evidence gap, out of scope; counts accurate against the mappings |
| **5.5** Crosswalk hint in evidence capture | Linking evidence to a criterion surfaces which framework items it also answers, prominently, before save |
| **5.6** Target-shaped export | A NISTA Gate 3 pack and a GDS beta pack generate from the same evidence base with different structures; both cite the same evidence rows; both carry attribution for every framework referenced |

---

## Phase 6 — Report, integrations, and the compliance gate (D8)

| Task | Acceptance criteria |
|---|---|
| **6.1** Report builder | `/report` section selection; PDF via the same `<TitleBlock/>` and `packages/scoring` as the screen (no recomputation); Source Serif body; version stamp and generation date in every footer; confidentiality marking from the highest-classified evidence included |
| **6.2** Judgement register appendix | Every judgement with author, confirmer, date, provenance and AI-drafted flag; not configurable off |
| **6.3** Delivery signal integrations | Azure DevOps first, then GitHub, then Jira; pulls deployment frequency, test pass rate, open accessibility defects, repo visibility; creates evidence tagged `Pulled from …` with 30-day expiry; connection failure surfaces a reconnect action, never a silent stale value |
| **6.4** Welsh human translation | Every UI string and every seeded criterion has `human-reviewed` Welsh; machine-translated Welsh cannot reach an export; `Machine translation` chip renders in Welsh where status is lower; named translator recorded |
| **6.5** Accessibility audit | Independent WCAG 2.2 AA audit passed; `/accessibility` statement published with scope, known issues and contact; axe CI clean at all three breakpoints |
| **6.6** Security and data | Cyber Essentials Plus evidence assembled; ISO 27001 controls mapped; UK data residency confirmed for Neon, blob storage and the AI provider; DPIA drafted; `/ai-use` page published per `05-ai-governance.md` |
| **6.7** Performance data | Published index of the product's own uptime and response times — Point 10 of the standard applied to Assemble itself. The dogfooding claim in D8 is only credible if this exists. |
| **6.8** Backup and restore proven | `scripts/backup-db.sh` scheduled; a full restore into a scratch database performed and documented, with the time it took |

---

## Sequencing note

Phases 0–4 are a coherent, sellable product: a live, defensible GDS/Wales readiness instrument with
real evidence and a traceable chain. Phase 5 is what makes it uniquely Turner & Townsend's. Phase 6 is
what makes it purchasable.

If time compresses, cut **scope inside phases** — fewer templates, one integration instead of three,
GDS only and Wales later. Do not cut phases, and do not cut 3.5 (the chain), 4.3 (the scoring
function) or 6.5 (accessibility). Those three are load-bearing for the product's entire claim.

## Parking lot

Good ideas that are explicitly not in this plan. Record them here rather than smuggling them into a PR:
portfolio benchmarking across clients, capability heat-mapping against the T&T bench, automated
evidence extraction from a CDE, Power BI export, a public "standards library" as lead generation,
white-labelling for client-branded instances.
