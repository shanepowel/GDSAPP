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

**Deferred:** Automated tender PDF parsing, server-side branded PDF generation, collaboration workflow, benchmarking views, framework drift job, client tenancy deployment, full Welsh UI, dark theme.

Hard rule: scoring stays deterministic; bid layer never fabricates evidence or capability.

Full narrative sections 18–27 are in the originating BUILD extension sheet provided to Cursor for this implementation.
