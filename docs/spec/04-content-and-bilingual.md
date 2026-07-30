# 04 — Content Design and Bilingual Model

Content is where an assurance product earns or loses credibility fastest. A panel member who spots
marketing language in a judgement stops trusting the numbers.

---

## Voice: assessor-plain

Write the way a good service assessor writes a report. Specific, unhurried, no persuasion. The
product's opinion is never in the interface — the interface reports what the evidence shows and names
what is missing.

**Do**
- Name the thing that is missing and what would fix it: *"No accessibility audit linked. A WCAG 2.2 AA
  audit report against the beta service would answer this."*
- Use the standard's own vocabulary. If the standard says "met", the product says "met".
- State facts with their basis: *"At risk — the only linked research finding expired on 14 June."*

**Don't**
- Sell inside the product. `Win the room` is landing-page voice and must not appear past sign-in.
- Use "just", "simply", "easily", "seamlessly", "powerful", "robust", "leverage".
- Congratulate. No confetti, no "Great job!". An index of 82 is a fact, not an achievement.
- Apologise in errors. State what happened and the next action.
- Hedge a system fact: *"This may indicate…"* → *"Evidence for point 6 expired 12 days ago."*

Reading target: sentences under 25 words, active voice, one idea each. Any term from either domain
(DDaT, EIR, gate, suitability code, alpha) gets a definition on first use in a view, via an inline
disclosure rather than a tooltip — tooltips are unreachable on touch and unreliable for screen readers.

---

## Vocabulary lock

One word per concept, everywhere: UI, API, database, docs, PDF. Deviation is a review blocker.

| Use | Never | Why |
|---|---|---|
| **Engagement** | project, workspace, org, account | D2. One tenancy word. |
| **Criterion** / **point** | question, requirement, check, item | "Point 6" is how the market talks. |
| **Judgement** | score, rating, assessment (as a noun for one criterion) | A judgement has an author. A score doesn't. |
| **Verdict** (`met` / `at risk` / `not met` / `not assessed`) | pass, fail, RAG, green/amber/red | Matches assessment language and avoids colour-as-meaning. |
| **Preparedness Index** | score, health score, readiness score | Existing brand term. Composite only — never used for one criterion. |
| **Evidence** | document, artefact, attachment, file | Evidence is a claim with provenance; a file is not. |
| **Gap** | issue, problem, risk, finding | Gaps have remedies. Issues have owners and become a backlog — non-goal. |
| **Move** | recommendation, action, suggestion | "The move that closes this gap" is the product's promise. |
| **Chain** | trace, lineage, path | Names the signature component. |
| **Accountability** | responsibility, duty, RACI | Matches the org tool's existing model and Holacracy-adjacent language already in the schema. |
| **Circle / role / product** | team / job / system | Keep the org tool's entity types verbatim. |
| **Vacant** | unstaffed, open, unfilled, TBC | One word for the condition that breaks a chain. |
| **Framework** | standard (for non-standards) | GDS/Wales/TCoP are standards. NISTA/ISO/RIBA are frameworks. The distinction is load-bearing in the crosswalk. |
| **Superseded** | archived, old, deleted, previous | Judgements and standard versions supersede. |

---

## Microcopy rules

**Buttons state what happens; the toast echoes the same verb.**

| Control | Toast on success |
|---|---|
| `Confirm judgement` | `Judgement confirmed` |
| `Add evidence` | `Evidence added — linked to 3 criteria` |
| `Link criteria` | `Linked to points 6, 9, 11` |
| `Promote scenario` | `Scenario promoted to live` |
| `Export pack` | `Pack exported — 24 pages` |
| `Nudge owner` | `Nudge sent to Ashleigh Donaldson` |

Never `Submit`, `OK`, `Done` as a primary action. Destructive actions name the object and the
consequence: `Delete engagement and all its evidence`.

**Empty states are the next action, plus why it matters.**

| Screen | Empty state |
|---|---|
| Overview, no team | **No team yet.** The index needs a team to measure. `Add your team` |
| Assess, no judgements | **Nothing judged yet.** Start with the points your phase makes mandatory — 6 of 14 apply at discovery. `Open point 1` |
| Evidence, empty | **No evidence yet.** Evidence is what turns a judgement into something a panel can check. `Add evidence` |
| Assure, no crosswalk coverage | **No mapped coverage for this gate.** 11 of your 14 points map to Gate 3 — link evidence to see coverage build. `Open the matrix` |
| Scenarios, empty | **No scenarios.** Branch the live team to model a fix without touching it. `Branch live team` |
| Activity, empty | **Nothing has happened yet.** |

**Errors identify the field and the fix.**

- `Rationale needs at least 40 characters. A panel will ask why — write the reason here.`
- `Evidence must link to at least one criterion. Search points above, or pick from the crosswalk.`
- `This standard version was superseded on 1 April 2026. Migrate the engagement, or keep working against v2019.1.`
- `Couldn't reach Azure DevOps. The connection may have expired — reconnect in Settings.`

**Numbers.** Index has no decimal. Percentages have no decimal. Dates render `30 Jul 2026` (`30
Gorffennaf 2026` in Welsh). Relative time only within 7 days, then absolute — "3 months ago" is
useless in an audit trail.

---

## Bilingual content model

Welsh is not a feature toggle. Assemble already offers EN/CY and targets Welsh public bodies, so
Welsh Language Standards apply to anything the client's users see. Getting this wrong is a
reputational risk with exactly the buyer you're targeting.

### Three layers, three mechanisms

| Layer | Content | Mechanism |
|---|---|---|
| **UI strings** | Labels, buttons, errors, empty states | `next-intl` with `messages/en.json`, `messages/cy.json`. Keys namespaced by route. |
| **Standard content** | Criterion titles, statements, guidance | Database: `criterion_translations`. Never in code. |
| **User content** | Judgement rationales, evidence titles, notes | Stored as authored, with a `locale` column. Never machine-translated. |

```ts
export const criterionTranslations = pgTable("criterion_translations", {
  criterionId: varchar("criterion_id").notNull().references(() => criteria.id, { onDelete: "cascade" }),
  locale: text("locale").notNull(),                 // 'en' | 'cy'
  title: text("title").notNull(),
  statement: text("statement").notNull(),
  translationStatus: text("translation_status").notNull().default("machine"),
  // machine | human-translated | human-reviewed
  translatedBy: varchar("translated_by"),
  reviewedAt: timestamp("reviewed_at"),
}, (t) => [primaryKey({ columns: [t.criterionId, t.locale] })]);
```

### Hard rules

1. **Machine-translated Welsh never appears in an exported report.** If a criterion's Welsh
   translation is `machine`, the export either uses the human-reviewed English with a note, or the
   export is blocked — the engagement owner chooses in Settings. Publishing machine Welsh to a Welsh
   public body is the single most avoidable own goal available here.
2. **The Wales Digital Service Standard is sourced in Welsh from the Welsh Government publication**,
   not translated from English. Both language versions are authoritative source text.
3. **`translationStatus` is visible in the UI** when viewing Welsh content that isn't human-reviewed:
   a small `Machine translation` chip, in Welsh. Honesty about translation quality is itself a Welsh
   Language Standards good practice.
4. **`lang` attributes are correct** — the document `lang` follows the toggle, and any passage in the
   other language gets an inline `lang`. Screen readers switch voice on this. An English rationale
   inside a Welsh report needs `lang="en"`.
5. **No concatenated strings.** `next-intl` ICU messages with named arguments, because Welsh
   pluralisation and mutation don't survive English sentence assembly. `{count, plural, ...}` with
   Welsh's `zero`/`one`/`two`/`few`/`many`/`other` forms.
6. **Language is per-user, per-engagement default.** A user's UI language and the engagement's report
   language are separate settings. A T&T consultant may work in English on a Welsh-language
   deliverable.
7. Dates, numbers and lists format via `Intl` with the active locale. Never hand-rolled.

### Translation workflow

Welsh content is human-translated by a qualified translator and reviewed. Budget for it — for a
14-criterion standard plus UI strings this is a real but bounded cost, and it is a hard prerequisite
for selling into Wales. Track it as a Phase 6 dependency with a named owner, not as "translation TBC".

---

## Content for the exported pack

The PDF is the artefact that goes in the room. It is not a screenshot of the app.

**Structure**
1. Cover — `<TitleBlock/>` content: engagement reference, client, service, standard and version,
   phase, revision, date, prepared by, and the standard's OGL attribution string.
2. Summary — index, confidence, statutory position, top gaps. One page, no charts that need a legend.
3. Criterion-by-criterion — ref, verbatim statement, verdict, rationale, evidence list with dates and
   freshness, chain status.
4. Team — org table (not the force graph; a force layout does not print), roles, holders, vacancies.
5. Gaps and moves — each gap with its remedy and owner.
6. **Appendix: judgement register** — every judgement with author, confirmer, date, provenance, and
   whether AI drafted the rationale. This appendix is the panel-defensibility artefact and the reason
   the product wins arguments. It is not optional and it is not configurable off.
7. Method note — how the index is computed, in plain English, with the weights used.

**Rules**
- Source Serif 4 body, IBM Plex Mono for refs and dates. Not the screen faces.
- Every number in the PDF comes from `packages/scoring`. No recomputation in the PDF layer (D7).
- The generation date and the standard version appear on every page footer. A pack without a version
  stamp is unciteable.
- Confidentiality marking from the highest-classified evidence included.
