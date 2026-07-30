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
| Monorepo scaffold (Phase 0.1) | Skipped — stay single-app until a dedicated migration PR |
| Axe CI gate (Phase 0.4) | Existing Playwright + axe smoke; tighten baseline in a dedicated PR |
| next-intl for all UI (1.4) | UI stays on `lib/i18n`; **criterion** EN/CY live in `criterion_translations` |

## Phase status summary

| Phase | Status |
|---|---|
| 0 Foundations | Done (monorepo/axe deferred) |
| 1 Schema & standards | Done (Entra-only when configured; credentials optional for demo) |
| 2 Shell & organise | Done including dark theme tokens + toggle |
| 3 Evidence & chain | Done including freshness job + owner nudge |
| 4 Live index | Done — `lib/scoring`, IndexValue, GapCard, snapshots, auto-match |
| 5 Crosswalk & gate packs | Done — frameworks seed, CrosswalkMatrix, gap list, evidence hints, pack export |
| 6 Report & compliance | Not started |

### Deferred remnants

- Full axe CI baseline hardening (0.4)
- Blob upload for evidence files (URI field used; storage key optional)
- Outbound email provider for nudges (activity trail + deep link recorded)
- Phase 6 report pack / integrations / compliance pages
