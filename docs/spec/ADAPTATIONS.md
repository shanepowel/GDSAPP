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
| Monorepo scaffold (Phase 0.1) | Skipped — stay single-app until a dedicated migration PR |
| Axe CI gate (Phase 0.4) | Existing Playwright + axe smoke; tighten baseline in a dedicated PR |

Phases 0–6 still apply. Prefer PR-sized tasks from `06-build-plan.md`, adapted to paths above.

## Phase 0 status (this repo)

| Task | Status |
|---|---|
| 0.1 Monorepo | Deferred (see above) |
| 0.2 Design tokens | Done — new tokens + Tailwind semantic maps; legacy aliases keep screens stable |
| 0.3 Fonts | Done — Instrument Sans + IBM Plex Mono via `next/font` |
| 0.4 A11y CI | Deferred baseline hardening |
| 0.5 Cursor rules | Done — `.cursor/rules/*.mdc` |
| 0.6 Scoring skeleton | Done — `lib/scoring` exports `score()` → `index: null` |
