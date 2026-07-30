# Spec adaptations for this repository

The build spec in this folder is authoritative for product IA, design system, workflows,
vocabulary, AI governance and phasing. The following stack realities of the current Assemble
repo override locked decisions **D1** and the monorepo shape in `06-build-plan.md` until a
dedicated migration PR is scheduled.

| Spec says | This repo does |
|---|---|
| Drizzle + Neon as the ORM | **Prisma** + PostgreSQL (Neon in production) |
| pnpm + Turborepo `apps/web` + `packages/*` | Single Next.js App Router app at repo root |
| Express org-tool routes → Next handlers | Already ported as **tRPC** `orgDesign` router |
| `workspace` ≡ `engagement` | Org design is org-scoped; engagements **bind** to live/scenario graphs |
| Auth is Entra-only | Entra when configured; credentials only if `AUTH_ALLOW_CREDENTIALS=true` |
| Scoring in `packages/scoring` | `lib/scoring/` (pure function contract) |
| Tokens in `apps/web/app/globals.css` | `styles/tokens.css` + `app/globals.css` |
| Standards seed in `packages/standards/seed` | `data/standards/seed/*.json` + `npm run seed:catalog` |
| Source Serif in PDF body | pdfkit Times-Roman stand-in (see `lib/export/assurance-report-pdf.ts`) |
| Monorepo scaffold (Phase 0.1) | Skipped — stay single-app until a dedicated migration PR |
| Axe CI gate (Phase 0.4) | Existing Playwright + axe smoke; tighten baseline in a dedicated PR |
| next-intl for all UI (1.4) | UI stays on `lib/i18n`; **criterion** EN/CY live in `criterion_translations` |
| Delivery integrations ADO→GH→Jira | **GitHub first** (`integrations.githubSync`); others parked |
| Perf samples store | Local `.data/perf-samples.json` (dogfood); swap for durable store in production |

## Phase status summary

| Phase | Status |
|---|---|
| 0 Foundations | Done (monorepo/axe deferred) |
| 1 Schema & standards | Done (Entra-only when configured; credentials optional for demo) |
| 2 Shell & organise | Done including dark theme tokens + toggle |
| 3 Evidence & chain | Done including freshness job + owner nudge |
| 4 Live index | Done — `lib/scoring`, IndexValue, GapCard, snapshots, auto-match |
| 5 Crosswalk & gate packs | Done — frameworks seed, CrosswalkMatrix, gap list, evidence hints, pack export |
| 6 Report & compliance | Done (compressed) — assurance PDF + judgement appendix, CY export gate, `/accessibility` `/ai-use` `/performance`, GitHub sync, backup/restore scripts |

### Deferred remnants

- Full axe CI baseline hardening (multi-breakpoint clean) — statement published; sign-in contrast still tracked
- Blob upload for evidence files (URI field used; storage key optional)
- Outbound email provider for nudges (activity trail + deep link recorded)
- Azure DevOps / Jira connectors (GitHub ships first)
- Independent WCAG audit attestation (process, not code)
- Named Welsh translator column on translations (status promoted to human on seed)
