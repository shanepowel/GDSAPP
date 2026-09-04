# Datum

**Turner & Townsend** instrument for assembling delivery teams and proving they are the right ones. Government Digital and Data Profession Capability Framework scoring and service standard readiness (GDS, Wales) are lenses, not the product.

Brand palette: drafting stock, survey pink `#E5006D`, datum teal `#1F4B4A`. See `styles/tokens.css`. Product name, strapline, meta description and the datum line (`0.60`) live in `lib/product.config.ts`.

## Advisory and legal

- **Advisory only.** Person-to-role matching is explainable guidance, not hiring or sift decisions. No protected characteristics are collected or scored.
- **Public frameworks.** Government Digital and Data Profession Capability Framework (Open Government Licence v3.0; DDaT remains a spoken alias), GDS Service Standard (OGL via GOV.UK), Wales standard (Centre for Digital Public Services). Dependency mapping is Amplified's work and should be reviewed by a qualified service assessor before client use.
- **Data protection.** Pseudonymisation is available. Tenant-scoped engagement data. A DPIA is recommended when storing named individuals.

See `BUILD.md` for the full build specification and `docs/spec/` for product decisions. Framework ingest and quarterly reconciliation: [docs/FRAMEWORK-RECONCILIATION.md](docs/FRAMEWORK-RECONCILIATION.md).

Commercial positioning for NRW and framework bids: [docs/NRW-FRAMEWORK-STRATEGY.md](docs/NRW-FRAMEWORK-STRATEGY.md), WPSQ templates: [docs/WPSQ-DRAFTS.md](docs/WPSQ-DRAFTS.md).

## Stack

Next.js (App Router), TypeScript, Tailwind, tRPC, Prisma, PostgreSQL, Auth.js (credentials for local dev; Microsoft Entra ID ready), Vitest, Playwright, @axe-core/playwright.

## Local development

```bash
docker compose up -d
cp .env.example .env
# Set AUTH_SECRET and NEXTAUTH_SECRET (e.g. openssl rand -base64 32)
# Local credentials login is on when Entra is off. Set AUTH_ALLOW_CREDENTIALS=true if Entra is also on.
npm install
npm run db:migrate
npm run seed
npm run dev
```

If Docker is not available, a local PostgreSQL 16 instance works with the same `DATABASE_URL` / `DIRECT_URL` as `.env.example` (`postgresql://app:app@localhost:5432/assemble`). Export both URLs before Prisma commands if `prisma-env.sh` leaves `DIRECT_URL` empty.

Sign in: `admin@demo.local` / `demo-password`

Or open `/demo` with no account. That mints a shared read-only `demo-reader` session on the seeded NRW Permitting Service. Writes are refused at the API. The banner states: representative data only, nothing here is a hiring decision.

The demo pool is 18 people with mixed Government Digital and Data skillsets (strong, stretch, unevidenced, bilingual, part-time) across four engagements, so People, Squads and Portfolio have something to score. Harper Cole has no delivery evidence and keeps a multiplier of exactly 1.00.

Place official capability-framework CSVs in `data/source/` as `roles.csv`, `skills.csv` (gitignored). Without them, fixture CSVs are generated on seed. Pin the ingest to a dated version (`data/source/VERSION` or the CSV mtime).

## Journey and bridge data

The five stages (Define, Hold, Assemble, Assure, Run) are declared in `lib/explain/stages.ts`. User-facing sentences, including Explain as I go, live in `lib/copy.ts` and `lib/copy.cy.ts`.

GDS / DDaT bridge labels for pillars and rigour signals are in `lib/bridge/gds.ts`. Edit that file to change which Service Standard points, DDaT family or panel question appears on a card. Ceremonies that emit a signal are named there (`ceremonyForSignal`) and written onto seed rows.

Crosswalk seed (GDS, NISTA, ISO 19650, Construction Playbook, Building Safety Act golden thread) is `data/frameworks/seed/frameworks.json`, loaded by `npm run seed:frameworks`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run ingest` | Ingest capability-framework CSVs and record a version pin |
| `npm run seed:standards` | Seed standards and dependency map |
| `npm run seed:frameworks` | Seed assurance frameworks and reviewed mappings |
| `npm run seed:demo` | Demo org, admin, demo-reader, four engagements, mixed-skill pool |
| `npm run seed` | Ingest plus all seed steps (idempotent) |
| `npm test` | Scoring engine unit tests |
| `npm run test:e2e` | Playwright + axe |

## Deployment (Vercel + Neon Postgres)

1. Create a [Neon](https://neon.tech) project and set **two** URLs in Vercel: pooled `DATABASE_URL` and direct `DIRECT_URL`. Details: [docs/NEON.md](docs/NEON.md).
2. Set `AUTH_SECRET` / `NEXTAUTH_SECRET` and `AUTH_URL` / `NEXTAUTH_URL`.
3. Deploy (region `lhr1` in `vercel.json`).
4. Once: `npm run db:provision` from your machine with the same `.env`.

See [DEPLOY.md](DEPLOY.md) for the full checklist.
