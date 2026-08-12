# Assemble — Build Spec

Merging the **Assemble** GDS/Wales standards app (Next.js on Vercel) and the **org design tool**
(React + Vite + Express + Drizzle/Neon) into one assurance platform for public sector digital and
capital delivery.

This spec is written to be executed by an agent (Cursor) in PR-sized increments. Read it in order.

| File | What it decides |
|---|---|
| `01-design-system.md` | Visual identity, tokens, components, accessibility floor. **Read before writing any UI.** |
| `02-ia-and-flows.md` | Route map, navigation, the six core workflows screen-by-screen |
| `03-data-model.md` | Drizzle schema, migrations, the scoring function contract |
| `04-content-and-bilingual.md` | Voice, vocabulary lock, microcopy, Welsh/English content model |
| `05-ai-governance.md` | What AI may and may not touch, provenance surfaces |
| `06-build-plan.md` | Phases 0–6 as PR-sized tasks with acceptance criteria |
| `cursor-rules/*.mdc` | Copy to `.cursor/rules/` in the repo root |

---

## How to drive this with Cursor

1. Copy `cursor-rules/*.mdc` into `.cursor/rules/` at the repo root. These are always-on constraints;
   they stop the agent drifting back to shadcn defaults and generic copy.
2. Work one task from `06-build-plan.md` per branch. Each task names its acceptance criteria — paste
   those into the prompt and require the agent to prove each one before opening the PR.
3. Never let a phase start before the previous phase's acceptance criteria pass. Phase 1 (schema) in
   particular is load-bearing for everything after it.
4. When the agent proposes a component, ask it to name the token it used. If it can't, it invented a
   value and the diff gets rejected.

---

## The product in one paragraph

Assemble is the assurance layer for public sector delivery. A delivery team models its service, its
team and its evidence against a versioned standard (GDS Service Standard, Wales Digital Service
Standard, Technology Code of Practice), gets a live Preparedness Index where every number opens to
its reasoning, and exports a pack that satisfies a service assessment panel **or** a NISTA gate
review from the same evidence base. Turner & Townsend uses it to win and mobilise work; clients keep
it to run continuous assurance themselves.

## Why the merge is strategic, not cosmetic

Assemble's core claim is that the index moves when the team changes. That claim is only defensible if
there is a real accountability graph underneath it. The org design tool is that graph: entities
(circles / roles / products) with purpose, domain, accountabilities and policies; typed
relationships; people with skills and FTE; allocations; span-of-control and coverage analytics;
scenario branch / diff / promote.

**The join that makes the whole product work:**

```
criterion → capability requirement → accountability → role → person → evidence
```

Every other decision in this spec serves that chain.

---

## Locked decisions

These are settled. Do not relitigate them in a PR.

| # | Decision | Rationale |
|---|---|---|
| D1 | **One stack: Next.js App Router on Vercel.** Drizzle + Neon stays as the shared data layer. The Express server is retired; its routes become Next route handlers. | Two runtimes, two auth models and two deploy targets is the single biggest tax on this merge. |
| D2 | **`workspace` ≡ `engagement`.** The org tool's `workspaces` table is renamed and extended. There is exactly one tenancy concept. | Two container concepts would force a mapping table and confuse every permission check. |
| D3 | **Standards are versioned data, never code.** Criteria are rows with effective dates. | GDS published its intent to move from a static standard to an evolving framework of standards (2 July 2026). Hardcoded points are debt with a publication date. |
| D4 | **Replit Auth is removed. Microsoft Entra ID with B2B guest access.** | Public sector procurement will not accept Replit Auth. T&T is a Microsoft estate; client teams join as guests. |
| D5 | **Bid / Mobilise / Assure are modes on an engagement, not separate products.** | One engine, different default views and RBAC. Prevents the codebase forking. |
| D6 | **AI may propose. Only a named human may judge.** No AI output can move the index without human confirmation. | An assurance instrument whose numbers are partly synthetic is worthless in front of a panel. |
| D7 | **Scoring is a pure function in `packages/scoring`.** Server, client and PDF all call the same code. | Divergent scores between the screen and the exported report is a credibility-ending bug. |
| D8 | **Assemble must be able to pass a Service Standard assessment on itself.** WCAG 2.2 AA, published accessibility statement, real Welsh, performance data. | An assurance tool that fails its own standard is unsellable. Treated as a release gate, not a backlog item. |
| D9 | **Read from delivery tools; never replace them.** Azure DevOps / Jira / GitHub are signal sources. | Reaching feature parity with a backlog tool is a two-year detour to a market nobody is leaving. |
| D10 | **Evidence decays.** Every evidence item has an expiry; expired evidence degrades the index automatically. | This is the mechanism that converts a bid artefact into a subscription. |

## Non-goals for v1

| Not building | Why |
|---|---|
| Backlog, sprint board, test management | D9. Clients have Azure DevOps. |
| Document management / CDE | Clients have SharePoint, Asite, ACC. Assemble links to artefacts, it does not store the estate. |
| RAID / risk register | Programme tools own this. Assemble surfaces assurance gaps only. |
| Timesheets, resourcing, cost | T&T has systems. The org graph models *accountability*, not utilisation. |
| Public self-serve signup | Sold and onboarded. Signup would force a billing and trust surface v1 doesn't need. |
| Native mobile | Responsive web to 375px is the requirement. |

## Success measures

**Leading (first 30 days of a pilot)**
- ≥ 80% of criteria in a pilot engagement carry at least one linked evidence item
- Median time from "new engagement" to "first exportable pack" under 90 minutes
- ≥ 60% of judgements have a rationale over 40 words (the panel-defensibility proxy)

**Lagging (one quarter)**
- ≥ 1 client renews the instrument after contract award (D10 working)
- ≥ 2 engagements export both a GDS pack and a gate pack from one evidence base (the crosswalk earning its keep)
- Zero accessibility defects at WCAG 2.2 AA in an independent audit
