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
| Auth is Entra-only | Entra when configured; credentials remain for local/demo |
| Scoring in `packages/scoring` | Starts as `lib/scoring/` (same pure-function contract); may move to a package later |
| Tokens in `apps/web/app/globals.css` | `styles/tokens.css` + `app/globals.css` |
| Standards seed in `packages/standards/seed` | `data/standards/seed/*.json` + `npm run seed:catalog` |
| Monorepo scaffold (Phase 0.1) | Skipped — stay single-app until a dedicated migration PR |
| Axe CI gate (Phase 0.4) | Existing Playwright + axe smoke; tighten baseline in a dedicated PR |
| next-intl for all UI (1.4) | UI stays on `lib/i18n`; **criterion** EN/CY live in `criterion_translations` |

Phases 0–6 still apply. Prefer PR-sized tasks from `06-build-plan.md`, adapted to paths above.

## Phase 0 status

| Task | Status |
|---|---|
| 0.1 Monorepo | Deferred |
| 0.2 Design tokens | Done |
| 0.3 Fonts | Done |
| 0.4 A11y CI | Deferred |
| 0.5 Cursor rules | Done |
| 0.6 Scoring skeleton | Done |

## Phase 1 status

| Task | Status |
|---|---|
| 1.1 workspaces → engagements | N/A — engagements already exist; org-design stays org-scoped |
| 1.2 Extend engagements | Done — reference, mode, phase, client/service fields, owner, revision |
| 1.3 Catalog standards + seed | Done — `CatalogStandard` / versions / `Criterion`; GDS, Wales, TCoP JSON seeds |
| 1.4 Criterion translations | Done — EN human + CY machine rows; UI locale selects translation |
| 1.5 engagement_standards + `/assess` | Done — join table, phase filter, assess list + criterion detail |
| 1.6 Retire Express | Already complete (tRPC) |
| 1.7 Entra-only + assessor | Partial — `assessor` role added to invite enum; Entra cutover deferred |
