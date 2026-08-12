# 08 — Performance and Redesign

The build spec argues from a Vite SPA + Express + Neon shape. **This repository is already
Next.js App Router** (see `ADAPTATIONS.md`). Item 5 in the sequenced plan is largely complete;
items 1–4 and 6 remain the portable work.

## Baseline (lab + architecture — capture date 12 Aug 2026)

Real-user Vercel Speed Insights was not yet enabled in production at capture time. Lab and
code-path measurements below are the before state; update the After column as fixes land.

| Metric | Route / surface | Before | After | Notes |
|---|---|---|---|---|
| Stack shape | App-wide | Next 16 App Router + tRPC + Prisma | same | Not a Vite SPA; empty-shell waterfall (§2.1) already mitigated by RSC shell |
| Analytics | App-wide | `@vercel/analytics` only | + Speed Insights | Enable RUM LCP/INP/TTFB in Vercel dashboard after deploy |
| Cold vs warm | Neon + serverless | Not measured in this VM (no prod traffic) | TBD | Re-check after Speed Insights: idle ≥10 min then reload |
| Graph load queries | `orgDesign.graph` / `engagementStructure` | 4 parallel `findMany` (entities, relationships, people, assignments) — **not N+1** | Same 4, **column-slimmed** + optional detail | Classic N+1 was not present; payload size was |
| Insights | `orgDesign.insights` | Recomputed on every read; **second full graph fetch** when Insights tab open | Hash-cached; recompute on write | Same purity pattern as Team Fit §8 |
| Client fan-out | `DesignWorkspace` mount | graph + activity + templates + scenarios + snapshots + ai (+ insights/share) | Graph + deferred secondary queries | Templates/scenarios/AI load when panels open |
| Default Organise view | `/engagements/[id]/organise` | Chart (OrgChart → full `d3` on critical path) | **Table-first**; graph lazy / secondary route | Removes D3 from initial Organise paint |
| Bundle (lab) | `d3` install | ~880KB package / ~100ms cold `require` | Lazy-loaded with graph view only | `recharts` ~8.8MB still on rigour/history only |
| Fit strip | Team Fit | Simple filled bar | Segmented skill band + rigour bracket (CSS) | Unevidenced = dashed bracket |

### How to refresh RUM numbers

1. Deploy with `@vercel/speed-insights` (wired in root layout).
2. Exercise: engagement overview, Organise (table + graph), Assess criteria list.
3. Paste LCP / INP / TTFB p75 into the table above.

### Neon query logging

Enable `pg_stat_statements` on the Neon project; log routes for any statement >100ms and query
count per tRPC procedure. Target: ≤4 queries for Organise list payload.

---

## Sequenced plan (this repo)

| # | Action | Status |
|---|---|---|
| 1 | Capture baseline | Done (lab + architecture); RUM pending prod |
| 2 | Collapse / slim graph payload | Done — select list fields; `entityDetail` for inspector |
| 3 | Cache insights by inputs hash | Done — `OrgInsightsCache` + recompute on write |
| 4 | Table-first default; lazy graph | Done |
| 5 | Next.js App Router + streaming | Already the stack |
| 6 | Persist force layout / worker / canvas | Held — graph is opt-in |

---

## Design rules carried forward

- Controlled-document aesthetic unchanged (tokens, 2px radius, survey pink signal).
- Skeletons match final geometry; no spinners on streaming surfaces.
- Stale cached values show `computedAt` rather than blocking.
- Fit strip is the signature instrument for Team Fit (CSS only).
