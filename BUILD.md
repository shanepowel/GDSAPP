# BUILD SHEET: Assemble (Standard Readiness and Team Fit)

**Owner:** Amplified Ltd · Turner & Townsend themed palette (verify hex in `styles/tokens.css` before client demo)

This repository implements the build defined in the Amplified build sheet. **Build strictly in section 14 order, then extension steps in section 25.**

## Product summary

Multi-tenant app: organisation → engagement → requirement (phase) → team → **deterministic analysis** (fit, composition, readiness, adaptation) → saved runs → printable report. Reference data from official DDaT CSVs; standards from `lib/engine/standards-dependency-map.ts`.

Extension (sections 18–27): bid evaluation, agile rigour, evidence layer, adaptation economics, audit judgements, reporting share/export, outcome schema for deferred benchmarking.

## Build order (section 14 + 25)

1. Scaffold (Next.js, Tailwind tokens, Vitest, Playwright, docker-compose, vercel.json)
2. `prisma/schema.prisma` + migrate
3. `scripts/ingest-ddat.ts` (section 7 mappings)
4. `lib/engine/standards-dependency-map.ts` + `seed-standards.ts` + `seed-demo.ts` + reconciliation
5. Pure `/lib/engine` + Vitest (prove before UI)
6. tRPC + Auth.js + org scoping
7. Screens (section 11)
8a. Evidence layer (18.C): schema, engine, evidence register screen
8b. Agile rigour (18.B): schema, rigour screen, point 7 boost
8c. Bid evaluation (18.A): tender schema, `lib/engine/bid.ts`, tender/bid screens
8d. Adaptation economics (19) + judgements (20)
8e. Reporting extensions (21): Word export, share link, executive one-pager; Outcome + FrameworkVersion schema (22)
8. Design system (section 12)
9. Accessibility + axe in CI
10. Polish + README legal notice
11. Vercel deploy (section 13)

## Key paths

| Path | Role |
|------|------|
| `lib/engine/` | Pure scoring (readiness, bid, rigour, adaptation economics) |
| `lib/engine/bid.ts` | Deterministic bid outlook and point-movers |
| `lib/engine/evidence-config.ts` | Evidence strength scale |
| `lib/engine/rigour-config.ts` | Seven-dimension rubric (Amplified IP) |
| `lib/db/extension.ts` | Extended analysis pipeline |
| `lib/trpc/routers/extension.ts` | Evidence, rigour, tender, share, judgements |
| `app/share/[token]` | Read-only shared report |
| `app/api/export/drafts` | Word export of bid drafts (MVP) |

## Definition of done (section 15 + 26)

- Local: `docker compose up`, `npm run seed`, `npm run dev`
- Demo: NRW Wales engagement, deliberate gaps, `admin@demo.local`
- Engine tests green; explainable scores with "Show working"
- Tender setup, bid outlook, evidence register, rigour assessment, adaptation cost ranking
- Draft scaffolds advisory only; human approval field on `QuestionDraft`
- Print-PDF report, Word draft export, revocable tenant-scoped share link
- UK English UI; pseudonymise toggle; tenant-scoped data

## MVP vs deferred (section 24)

**MVP:** Base build + 18.A (manual tender ingestion), 18.B, 18.C, 19, 20, parts of 21, schema for 22 without benchmarking UI.

**Shipped (Tier 4):** Automated tender PDF parsing (`/api/tender/parse-pdf`), branded PDF report (`/api/export/report`), benchmarking UI (`/benchmarking`), framework drift (`/framework`), bilingual EN/CY UI (language switcher).

**Still deferred:** Multi-reviewer collaboration workflow, client tenancy enforcement in code, dark theme.

Hard rule: scoring stays deterministic; bid layer never fabricates evidence or capability.

Full narrative sections 18–27 are in the originating BUILD extension sheet provided to Cursor for this implementation.

## Commercial positioning (NRW DDaT framework)

See [docs/NRW-FRAMEWORK-STRATEGY.md](docs/NRW-FRAMEWORK-STRATEGY.md) and [docs/WPSQ-DRAFTS.md](docs/WPSQ-DRAFTS.md).

| Play | Use of Assemble | Product note |
|------|-----------------|--------------|
| **A Call-off accelerator** | Internal: call-off spec, team, Wales readiness, rigour, approach drafts | **Build focus:** bid/call-off UI language, demo scenario |
| **B Capability uplift** | Client-owned assurance; NRW operates, no competitor data | Handover, explainability, separate deployment |
| **C Multi-authority** | Generalise after evidence | Portfolio rollup (schema-ready, UI deferred) |

**Not for:** framework Stage 1 WPSQ as primary demo (cost 50%, no squad assessment). **Conflict firewall:** never run client instance over competitor submissions.

### Build priorities from strategy (section 5)

1. Retarget **call-off** layer copy and demo (not framework WPSQ).
2. Design for **portfolio rollup** (engagement model first).
3. **Client handover** path for Play B (training, NRW-operated instance).
4. **Separate deployments** via `DEPLOYMENT_MODE` / `NEXT_PUBLIC_DEPLOYMENT_MODE` ([docs/DEPLOYMENT-MODES.md](docs/DEPLOYMENT-MODES.md)).
5. **Portfolio rollup UI** at `/portfolio` ([lib/portfolio/rollup.ts](lib/portfolio/rollup.ts)).
6. **Handover pack** at `/handover` ([lib/handover/sections.ts](lib/handover/sections.ts)).
7. Lead demos with **Welsh language** and **wellbeing duty** gaps on NRW scenario.

## Completion status (product tiers)

| Tier | Scope | Status |
|------|--------|--------|
| **1 Core** | Engines, screens, demo, auth, deploy | Code complete; set `AUTH_SECRET` on Vercel |
| **2 Play A** | Call-off, evidence, rigour, judgements UI, history diff, share/export | Complete in repo |
| **3 Play B** | Portfolio by supplier, handover, `DEPLOYMENT_MODE=client`, assurance hub | Complete in repo; provision separate Vercel + Neon for NRW |
| **4 Platform** | PDF parse, branded PDF, benchmarking, drift, Welsh UI | Complete in repo |

### Routes

| Route | Purpose |
|-------|---------|
| `/engagements` | List call-offs / services |
| `/engagements/[id]` | Assurance dashboard |
| `/engagements/[id]/judgements` | Human sign-off |
| `/portfolio` | Org rollup + supplier groups |
| `/handover` | Play B training pack |
| `/benchmarking` | Outcomes and benchmarks |
| `/framework` | Framework drift detection |
| `/api/tender/parse-pdf` | PDF question extraction |
| `/api/export/report` | Branded PDF report |
