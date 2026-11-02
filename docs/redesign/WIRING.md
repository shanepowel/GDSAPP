# Wiring v2 to real data

The v2 screens render UI-shaped types from `lib/assemble-v2/types.ts`. Wiring means producing those
types from the database, not changing the components.

## Pattern

1. Add a tRPC procedure (or extend an existing router) that returns data in the v2 type.
2. Put the Prisma-to-v2 mapping in `lib/assemble-v2/adapters/<thing>.ts`, with a unit test.
3. Swap the demo call in the page, or in `lib/assemble-v2/get-engagement.ts`, for the server-side
   tRPC caller. Keep `demo-data.ts` for the public demo and `/v2/components`.
4. Add `/v2/:path*` to the matcher in `proxy.ts` once a screen shows real data. Keep `/v2` (landing)
   public.
5. Keep the existing core rules: scoring in `lib/scoring`, AI writes suggestions only, `now` is
   injected, standards are data.

## Existing pieces to reuse

| v2 need | Existing code |
| --- | --- |
| Engagement list and detail | `lib/trpc/routers/engagement.ts` (`list`, `byId`, `create`, `updateMeta`) |
| People, assignments, availability | `engagement.upsertPerson`, `setAssignment`; Prisma `Person`, `Assignment`, `PersonAvailability` |
| Team Fit scores | `lib/trpc/routers/teamFit.ts`, `lib/scoring/fit.ts`, `lib/engine/person-fit.ts` |
| Keel rules | `lib/playbook/keel.ts` |
| Rigour weighting | `lib/engine/rigour.ts`, `lib/team-fit/derive-rigour.ts` |
| Standards and crosswalk | `lib/trpc/routers/standards.ts`, `crosswalk.ts`, `lib/crosswalk/*`, `lib/standards/catalog.ts` |
| Evidence and judgements | `lib/trpc/routers/assurance.ts`, Prisma `AssuranceEvidence`, `CriterionJudgement` |
| Portfolio roll-up | `lib/trpc/routers/portfolio.ts`, `lib/portfolio/rollup.ts` |
| Scenarios | `lib/trpc/routers/orgDesign.ts`, `lib/demo/what-if-moves.ts` |
| AI co-pilot | `lib/org-design/ai.ts` |
| Demo sign-in | `app/api/auth/demo/route.ts`, `lib/demo/*` |
| Export to PDF | `lib/export/*` |

## New data the redesign needs

Add as Prisma models with migrations. Names are suggestions; keep the repo's vocabulary where it
already has a word.

| Model | Key fields | Feeds |
| --- | --- | --- |
| `EngagementLifecycle` (or fields on `Engagement`) | stage, stageStartedAt, status, statusReason, statusSetBy, commercialModel, goLiveDate, squadShape | Lifecycle bar, status, rules engine |
| `StageChecklistItem` | engagementId, stage, itemKey, doneAt, doneBy, owner, due, evidenceUrl | Stage checklists |
| `Milestone` | engagementId, name, due, status, paymentLinked | Plan, Compass |
| `MeasureSnapshot` | engagementId, period, predictability, quality, teamHealth, clientSatisfaction | Compass tiles and trends |
| `SurveyResponse` | engagementId, kind (health, pulse), period, answers (json), anonymous | Health check and client pulse |
| `RecoveryPlan` | engagementId, offTrack, cause, actions (json), backBy, createdBy | Compass |
| `RaidItem` | engagementId, type, title, owner, rating, action, due, status | Decisions. See the decision in README about the "no risk register" rule |
| `SteeringCommittee` | engagementId, date, packJson, held | Decisions |
| `Decision` | engagementId, forum, date, text, owner, confirmedAt | Decisions log, rule 4 |
| `RiskLock` | engagementId, blocker, calledBy, date, cause, options, decision, owner, escalated | Decisions, rule 1 |
| `Spike` | engagementId, question, why, timeboxDays, doneLooksLike, owner, answer, followOn | Plan |
| `ChangeRequest` | engagementId, ref, title, requestedBy, stage, triage, estimateDays, decision, approver, stageEnteredAt | Change, rules 6 and 7 |
| `AftercareSla` | engagementId, model, hours, serviceLevels (json), start, end, reviewDate | Change, rule 9 |
| `KeelException` | assignmentId, rule, reason, endDate, approvedBy | People, rule 8 |
| `DeliveryConfig` | organisationId, key, value | Settings: every handbook threshold |

## Order of work

| Phase | Screens | Done when |
| --- | --- | --- |
| 1. Spine | Home, Engagements list, Overview, wizard | An engagement created in the wizard appears on Home with a real next action |
| 2. Team and Sprint Zero | Squad, People, stage checklists | Assignments respect Keel rules from `lib/playbook/keel.ts`; checklist ticks persist |
| 3. Compass | Compass, Portfolio | Surveys collected; snapshots computed monthly; status saved with who set it |
| 4. Decisions and Change | Decisions, Change | Full lifecycle runs end to end |
| 5. Standards and Capability | Standards, Capability, Playbook | Evidence and crosswalk from real data |
| 6. Switch over | Redirect old routes to v2 equivalents | Old screens retired; `/v2` prefix removed |

## Prompts for Cursor or Claude Code

Use one at a time, in order. Each assumes the agent has read `docs/redesign/` and the Cursor rules.

1. "Read docs/redesign/WIRING.md. Add the Prisma models for phase 1 (lifecycle fields on Engagement,
   StageChecklistItem, Milestone, DeliveryConfig) with a migration and seed them from
   lib/assemble-v2/demo-data.ts for the demo organisation."
2. "Add a tRPC procedure `engagement.v2Summary` returning `Engagement` from lib/assemble-v2/types.ts.
   Put the mapping in lib/assemble-v2/adapters/engagement.ts with tests. Use it in
   lib/assemble-v2/get-engagement.ts and on /v2/home. Keep demo-data for the public demo."
3. "Wire the new engagement wizard to trpc.engagement.create. On create, seed the Sprint Zero
   checklist, charter and ceremonies for the chosen squad shape."
4. "Wire Checklist ticks to a mutation that records doneBy and doneAt. Optimistic update, toast
   'Saved.'"
5. Continue phase by phase using the table above.
