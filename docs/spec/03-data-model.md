# 03 — Data Model

Drizzle + Neon Postgres. The existing org tool schema (`shared/schema.ts`) is the starting point and
most of it survives — it is better built than it needs to be, which is a gift.

---

## What survives unchanged (rescoped only)

`entities`, `relationships`, `people`, `assignments`, `comments`, `snapshots`, `share_links`,
`activity`, `scenarios`, `rate_limit_hits`.

Every `workspaceId` column becomes `engagementId`. Keep all existing indexes; add none speculatively.

## What is removed

- `shared/models/auth.ts` Replit sessions/users → replaced by Entra-backed `users` (D4)
- The Express-specific rate-limit store stays useful; move it behind a Next route handler

---

## New tables

### Standards as versioned data (D3)

```ts
export const standards = pgTable("standards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),        // 'gds-service-standard' | 'wales-dss' | 'tcop'
  name: text("name").notNull(),
  publisher: text("publisher").notNull(),        // 'GDS / DSIT', 'Welsh Government'
  licence: text("licence").notNull(),            // 'OGL-3.0'
  attribution: text("attribution").notNull(),    // rendered in every export
  sourceUrl: text("source_url"),
});

export const standardVersions = pgTable("standard_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  standardId: varchar("standard_id").notNull().references(() => standards.id, { onDelete: "cascade" }),
  version: text("version").notNull(),            // '2019.1'
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),         // null = current
  status: text("status").notNull().default("current"), // draft | current | superseded
  changeNote: text("change_note"),
}, (t) => [index("idx_sv_standard").on(t.standardId)]);

export const criteria = pgTable("criteria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  standardVersionId: varchar("standard_version_id").notNull()
    .references(() => standardVersions.id, { onDelete: "cascade" }),
  ref: text("ref").notNull(),                    // '6'
  title: text("title").notNull(),
  statement: text("statement").notNull(),        // verbatim, under OGL
  guidanceUrl: text("guidance_url"),
  phases: jsonb("phases").$type<string[]>().default([]),   // ['alpha','beta','live']
  statutory: boolean("statutory").notNull().default(false),
  weight: integer("weight").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [
  index("idx_criteria_version").on(t.standardVersionId),
  uniqueIndex("uq_criteria_version_ref").on(t.standardVersionId, t.ref),
]);
```

**Migration mechanics that matter.** A new standard version is a new set of `criteria` rows. Existing
engagements keep pointing at their old version. Migration is opt-in per engagement, produces a
mapping report (`criterion X in v1 → criterion Y in v2`, plus added and removed), and carries
judgements across only where the mapping is `equivalent`. Never silently re-map — a judgement made
against different words is not the same judgement.

### The join that makes the product work

```ts
export const capabilityRequirements = pgTable("capability_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  criterionId: varchar("criterion_id").notNull().references(() => criteria.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  roleArchetype: text("role_archetype"),         // DDaT role name, e.g. 'User researcher'
  minFte: integer("min_fte"),                    // basis points of an FTE, 60 = 0.6
  skillTags: jsonb("skill_tags").$type<string[]>().default([]),
  phasePersistent: boolean("phase_persistent").notNull().default(false),
}, (t) => [index("idx_capreq_criterion").on(t.criterionId)]);

// Engagement-specific: which accountability in THIS org graph answers this requirement
export const capabilityLinks = pgTable("capability_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  engagementId: varchar("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
  capabilityRequirementId: varchar("capability_requirement_id").notNull()
    .references(() => capabilityRequirements.id, { onDelete: "cascade" }),
  entityId: varchar("entity_id").notNull(),      // → entities.id (a role or circle)
  accountabilityIndex: integer("accountability_index"), // position in entities.accountabilities[]
  strength: text("strength").notNull().default("satisfies"), // satisfies | partially | informs
  note: text("note"),
}, (t) => [
  index("idx_caplink_engagement").on(t.engagementId),
  index("idx_caplink_entity").on(t.entityId),
]);
```

`capabilityLinks` is the single most important new table. It is the edge between the standard and the
org graph, and it is what makes "the index moves when the team changes" a traceable fact rather than
a UI flourish. Seed it automatically by matching `roleArchetype` and `skillTags` against
`entities.type='role'` names and `people.skills`, then let a human correct it — auto-matched links get
`provenance: 'auto'` and appear as unconfirmed in the chain rail until reviewed.

### Evidence and judgement

```ts
export const evidence = pgTable("evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  engagementId: varchar("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  kind: text("kind").notNull(),                  // document | research | test | decision | code | metric | other
  uri: text("uri"),
  storageKey: text("storage_key"),
  ownerPersonId: varchar("owner_person_id"),     // → people.id
  producedAt: timestamp("produced_at"),
  expiresAt: timestamp("expires_at"),
  confidentiality: text("confidentiality").notNull().default("client"), // internal | client | publishable
  provenance: text("provenance").notNull().default("manual"),           // manual | integration | import
  sourceSystem: text("source_system"),           // 'azure-devops' | 'jira' | 'github'
  externalId: text("external_id"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_evidence_engagement").on(t.engagementId),
  index("idx_evidence_expiry").on(t.engagementId, t.expiresAt),
]);

export const evidenceCriteria = pgTable("evidence_criteria", {
  evidenceId: varchar("evidence_id").notNull().references(() => evidence.id, { onDelete: "cascade" }),
  criterionId: varchar("criterion_id").notNull().references(() => criteria.id, { onDelete: "cascade" }),
  strength: text("strength").notNull().default("supports"), // supports | partially | contextual
}, (t) => [primaryKey({ columns: [t.evidenceId, t.criterionId] })]);

export const judgements = pgTable("judgements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  engagementId: varchar("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
  criterionId: varchar("criterion_id").notNull().references(() => criteria.id, { onDelete: "cascade" }),
  verdict: text("verdict").notNull(),            // met | at-risk | not-met | not-assessed
  rationale: text("rationale").notNull(),        // min 40 chars, enforced in Zod
  proposedBy: text("proposed_by").notNull().default("human"), // human | ai | system
  proposedByUserId: varchar("proposed_by_user_id"),
  aiModel: text("ai_model"),
  aiPromptHash: text("ai_prompt_hash"),
  confirmedByUserId: varchar("confirmed_by_user_id").notNull(),  // never null — D6
  confirmedAt: timestamp("confirmed_at").defaultNow().notNull(),
  supersededById: varchar("superseded_by_id"),
}, (t) => [
  index("idx_judgement_current").on(t.engagementId, t.criterionId, t.supersededById),
]);
```

`confirmedByUserId` is `notNull`. That single constraint is how D6 is enforced at the database level
rather than in a code path someone can bypass. There is no valid judgement without a named human.

### Crosswalk (the IP)

```ts
export const frameworks = pgTable("frameworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),   // 'nista-gateway' | 'iso-19650' | 'riba-2020' | 'construction-playbook' | 'cgs'
  name: text("name").notNull(),
  publisher: text("publisher").notNull(),
  version: text("version"),
  licence: text("licence"),
  attribution: text("attribution"),
});

export const frameworkItems = pgTable("framework_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  frameworkId: varchar("framework_id").notNull().references(() => frameworks.id, { onDelete: "cascade" }),
  ref: text("ref").notNull(),              // 'Gate 3 / Q2.4'
  title: text("title").notNull(),
  question: text("question"),
  parentRef: text("parent_ref"),
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [uniqueIndex("uq_fi_framework_ref").on(t.frameworkId, t.ref)]);

export const crosswalkMappings = pgTable("crosswalk_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  criterionId: varchar("criterion_id").notNull().references(() => criteria.id, { onDelete: "cascade" }),
  frameworkItemId: varchar("framework_item_id").notNull().references(() => frameworkItems.id, { onDelete: "cascade" }),
  relation: text("relation").notNull(),    // satisfies | partially | informs
  note: text("note"),
  authoredBy: varchar("authored_by"),
  reviewedBy: varchar("reviewed_by"),      // two-person rule — this is the IP, it gets reviewed
  reviewedAt: timestamp("reviewed_at"),
}, (t) => [
  index("idx_cw_criterion").on(t.criterionId),
  index("idx_cw_item").on(t.frameworkItemId),
]);
```

Crosswalk rows are **global, not per-engagement** — they're the reusable asset. An engagement may add
a local override, stored as an `crosswalk_overrides` row with the same shape plus `engagementId`;
build that in Phase 5 only if a pilot actually needs it.

### Signals, trend, AI

```ts
export const deliverySignals = pgTable("delivery_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  engagementId: varchar("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
  sourceSystem: text("source_system").notNull(),
  kind: text("kind").notNull(),            // deploy-frequency | test-pass-rate | a11y-defects | repo-visibility
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  observedAt: timestamp("observed_at").notNull(),
}, (t) => [index("idx_signal_engagement_kind").on(t.engagementId, t.kind, t.observedAt)]);

export const indexSnapshots = pgTable("index_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  engagementId: varchar("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
  computedAt: timestamp("computed_at").defaultNow().notNull(),
  value: integer("value"),                 // 0–100, null = insufficient data
  breakdown: jsonb("breakdown").$type<Record<string, unknown>>().notNull(),
  cause: text("cause"),                    // 'judgement-confirmed' | 'evidence-expired' | 'team-changed'
}, (t) => [index("idx_snapshot_engagement_time").on(t.engagementId, t.computedAt)]);

export const aiSuggestions = pgTable("ai_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  engagementId: varchar("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),            // rationale-draft | capability-link | gap-remedy | org-patch
  targetType: text("target_type"),
  targetId: varchar("target_id"),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  model: text("model").notNull(),
  promptHash: text("prompt_hash").notNull(),
  status: text("status").notNull().default("pending"), // pending | accepted | rejected | expired
  reviewedByUserId: varchar("reviewed_by_user_id"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("idx_ai_engagement_status").on(t.engagementId, t.status)]);
```

### Engagements

```ts
export const engagements = pgTable("engagements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  reference: text("reference").notNull(),         // 'NRW-DISC-01' — shown in the title block
  clientOrg: text("client_org"),
  sector: text("sector"),                        // digital-service | capital-programme | hybrid
  serviceName: text("service_name"),
  serviceDescription: text("service_description"),
  phase: text("phase"),                          // discovery | alpha | beta | live | gate
  mode: text("mode").notNull().default("bid"),   // bid | mobilise | assure
  locale: text("locale").notNull().default("en"),// default report language
  revision: text("revision").notNull().default("A"),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  aiEnabled: boolean("ai_enabled").notNull().default(true),  // per-engagement kill switch
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const engagementStandards = pgTable("engagement_standards", {
  engagementId: varchar("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
  standardVersionId: varchar("standard_version_id").notNull().references(() => standardVersions.id),
  isPrimary: boolean("is_primary").notNull().default(false),
}, (t) => [primaryKey({ columns: [t.engagementId, t.standardVersionId] })]);
```

---

## Migration path

Six ordered migrations. Each is independently deployable and reversible.

| # | Migration | Notes |
|---|---|---|
| M1 | `workspaces` → `engagements`, add new columns with defaults | Rename, don't recreate. Keep the id values so nothing else breaks. |
| M2 | Rename `workspace_id` → `engagement_id` across all tenant tables; rename indexes | Mechanical. One migration, one PR, no logic changes. |
| M3 | Create `standards`, `standard_versions`, `criteria`, `criterion_translations` and seed GDS v2019.1, Wales DSS, TCoP | Seeds live in `packages/standards/seed/*.json`, version-controlled, with OGL attribution. |
| M4 | Create `capability_requirements`, `capability_links`, `evidence`, `evidence_criteria`, `judgements` | The core of the product. |
| M5 | Create `frameworks`, `framework_items`, `crosswalk_mappings` | Seeded from the authored crosswalk. |
| M6 | Create `delivery_signals`, `index_snapshots`, `ai_suggestions`; drop Replit auth tables | Auth cutover happens in the same release as M6. |

`scripts/backup-db.sh` already exists and works. Take a verified backup before M1 and M6 specifically,
and prove the restore path once before M1 rather than discovering it during M6.

---

## The scoring contract (D7)

`packages/scoring/src/index.ts`. Pure, synchronous, no I/O, fully unit-tested.

```ts
export interface ScoringInput {
  criteria: Criterion[];                  // filtered to applicable phase
  judgements: Judgement[];                // current only (supersededById === null)
  evidence: EvidenceWithLinks[];
  capabilityLinks: CapabilityLink[];
  entities: Entity[];
  assignments: Assignment[];
  people: Person[];
  now: Date;                              // injected — never Date.now() inside
}

export interface ScoringResult {
  index: number | null;                   // null when insufficient data — never 0
  confidence: 'low' | 'medium' | 'high';
  byCriterion: Array<{
    criterionId: string;
    verdict: Verdict;
    evidenceCount: number;
    freshEvidenceCount: number;
    chainComplete: boolean;               // criterion→capability→role→person→evidence intact
    chainBreak?: 'no-capability-link' | 'vacant-role' | 'no-evidence' | 'evidence-expired';
    contribution: number;
  }>;
  gaps: Gap[];                            // every gap carries a remedy
  statutoryGaps: Gap[];
}

export function score(input: ScoringInput): ScoringResult;
```

Rules the implementation must honour:

1. **`index: null` when fewer than three criteria have a confirmed judgement.** Render `—`.
2. **Expired evidence does not count as evidence.** It contributes to `evidenceCount` but not
   `freshEvidenceCount`, and a criterion whose only evidence has expired cannot be `met`.
3. **A broken chain caps the verdict at `at-risk`,** regardless of what a human recorded. If the role
   is vacant, "met" is not available. Surface this in the UI as an explanation, not a silent override
   — the human's judgement is shown alongside the cap and the reason.
4. **Statutory criteria are never averaged away.** A `not-met` statutory criterion sets
   `confidence: 'low'` and is reported separately, whatever the composite index says.
5. **Weights are data** (`criteria.weight`), not constants in code.
6. Determinism: same input, same output, always. `now` is injected so freshness is testable.

Test floor: property-based tests for monotonicity (adding fresh evidence never lowers the index) and
golden-file tests for a full NRW-shaped fixture. Both in Phase 4's acceptance criteria.
