# Assemble (GDSAPP)

Multi-tenant web app for assessing digital service team readiness against the **GDS Service Standard** and the **Digital Service Standard for Wales**, using the **DDaT Capability Framework** for roles and skills.

Built by Amplified Ltd. Turner & Townsend brand tokens are placeholders in `styles/tokens.css` until verified values are applied.

## Advisory and legal

- **Advisory only.** Person-to-role matching is explainable guidance, not hiring or sift decisions. No protected characteristics are collected or scored.
- **Public frameworks.** DDaT content (Open Government Licence v3.0), GDS Service Standard (OGL via GOV.UK), Wales standard (Centre for Digital Public Services). Dependency mapping is Amplified's work and should be reviewed by a qualified service assessor before client use.
- **Data protection.** Pseudonymisation is available. Tenant-scoped engagement data. A DPIA is recommended when storing named individuals.

See `BUILD.md` for the full build specification.

## Stack

Next.js (App Router), TypeScript, Tailwind, tRPC, Prisma, PostgreSQL, Auth.js (credentials for local dev; Microsoft Entra ID ready), Vitest, Playwright, @axe-core/playwright.

## Local development

```bash
docker compose up -d
cp .env.example .env
# Set AUTH_SECRET (e.g. openssl rand -base64 32)
npm install
npm run db:migrate
npm run seed
npm run dev
```

Sign in: `admin@demo.local` / `demo-password`

Place official DDaT CSVs in `data/source/` as `roles.csv`, `skills.csv` (gitignored). Without them, fixture CSVs are generated on seed.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run ingest` | Ingest DDaT CSVs |
| `npm run seed:standards` | Seed standards and dependency map |
| `npm run seed:demo` | Demo org, admin, NRW engagement |
| `npm test` | Scoring engine unit tests |
| `npm run test:e2e` | Playwright + axe |

## Deployment (Vercel + Supabase Postgres)

1. Create a Supabase project and set **two** URLs in Vercel: pooled `DATABASE_URL` (port 6543, `pgbouncer=true`) and direct `DIRECT_URL` (port 5432). Details: [docs/SUPABASE.md](docs/SUPABASE.md).
2. Set `AUTH_SECRET` / `NEXTAUTH_SECRET` and `AUTH_URL` / `NEXTAUTH_URL`.
3. Deploy (region `lhr1` in `vercel.json`).
4. Once: `npm run db:provision` from your machine with the same `.env`.

See [DEPLOY.md](DEPLOY.md) for the full checklist.
