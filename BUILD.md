# BUILD SHEET: Assemble (Standard Readiness and Team Fit)

**Owner:** Amplified Ltd · Turner & Townsend themed palette (verify hex in `styles/tokens.css` before client demo)

This repository implements the build defined in the Amplified build sheet. **Build strictly in section 14 order.**

## Product summary

Multi-tenant app: organisation → engagement → requirement (phase) → team → **deterministic analysis** (fit, composition, readiness, adaptation) → saved runs → printable report. Reference data from official DDaT CSVs; standards from `lib/engine/standards-dependency-map.ts`.

## Build order (section 14)

1. Scaffold (Next.js, Tailwind tokens, Vitest, Playwright, docker-compose, vercel.json)
2. `prisma/schema.prisma` + migrate
3. `scripts/ingest-ddat.ts` (section 7 mappings)
4. `lib/engine/standards-dependency-map.ts` + `seed-standards.ts` + `seed-demo.ts` + reconciliation
5. Pure `/lib/engine` + Vitest (prove before UI)
6. tRPC + Auth.js + org scoping
7. Screens (section 11)
8. Design system (section 12)
9. Accessibility + axe in CI
10. Polish + README legal notice
11. Vercel deploy (section 13)

## Key paths

| Path | Role |
|------|------|
| `lib/engine/` | Pure scoring (no DB) |
| `lib/engine/standards-dependency-map.ts` | Dependency IP |
| `lib/db/analysis.ts` | DB → engine → persist `AnalysisRun` |
| `scripts/` | ingest, seed-standards, seed-demo |
| `styles/tokens.css` | Brand tokens (no raw hex in components) |

## Definition of done (section 15)

- Local: `docker compose up`, `npm run seed`, `npm run dev`
- Demo: NRW Wales engagement, deliberate gaps, `admin@demo.local`
- Engine tests green; explainable scores with "Show working"
- UK English UI; pseudonymise toggle; tenant-scoped data

Full narrative sections (reframe, demo scenario, schema detail, deployment env vars, post-MVP) are in the originating build sheet provided to Cursor for this implementation.
