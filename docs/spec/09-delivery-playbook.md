# 09 — T&T Delivery Playbook (Public Sector Edition)

**Status:** the operating model Assemble encodes. Doc 07 (Team Fit) scores against this playbook.
Where the two disagree, **this document is the source of truth** and doc 07 is amended.

Stack adaptations for this repo: archetypes live in `data/archetypes/seed/`; scoring in
`lib/scoring/`; Organise allocations are Prisma `DesignAssignment` / engagement `Person` +
`PersonAvailability` (see `ADAPTATIONS.md`).

---

## 1. The problem this solves

Public sector digital delivery fails in two predictable directions, and both failures are expensive.

**Agile theatre.** The squad runs standups, sprints and retros. Velocity looks fine. Then the gateway
review arrives and asks why a decision was made in month three, and nobody can produce the reasoning.

**Waterfall in agile clothing.** A Gantt chart with sprint labels. Discovery outputs written before
discovery starts because the business case needed them.

The playbook is the reconciliation. Iterate at delivery cadence. Assure at governance cadence. Make
the first automatically produce the evidence the second requires.

This is not SAFe. It is deliberately lighter on process ceremony and considerably heavier on evidence
discipline.

---

## 2. The pillars

| Pillar | Owns | Public sector extension |
|---|---|---|
| **The Forge** | Capability and certification | Statutory modules: accessibility, Welsh Language Standards, information management, assurance literacy |
| **Squad Blueprint** | Team structure, roles, ceremonies | Archetypes mapped to GDS phases and gateway expectations |
| **T&T DevOps Spec** | Templates, pipelines, Definition of Done | Extended DoR and DoD carrying statutory and assurance criteria |
| **Delivery Compass** | Metrics and governance | Rigour metric set and assurance first-pass rate |
| **The Keel** | Assignment, capacity, tenure | Minimum tenure and assignment rules that make evidence continuous |

The Keel is load-bearing: assurance evidence is a narrative that requires someone present for the
whole phase. Team stability is an assurance control.

---

## 3. Two clocks

**Delivery clock** — two-week sprints, continuous flow. Sets what the squad builds.

**Assurance clock** — phase gates, business case stages, governance boards. Sets what the programme
can commit to.

1. The assurance clock never sets sprint scope.
2. The delivery clock never waits for the assurance clock.
3. They meet at defined synchronisation points (§4). Between those points they are independent.

---

## 4. Phase crosswalk

Authoritative mappings also live in the frameworks/crosswalk seed. Confirm against each client's
governance model before use.

| GDS phase | Indicative duration | Gateway series | Business case | Squad archetype | Sync point |
|---|---|---|---|---|---|
| Discovery | 6–10 weeks | Gate 0 / 1 | SOC | Discovery squad | Phase close, evidence pack |
| Alpha | 8–12 weeks | Gate 2 | OBC | Alpha squad | Phase close + service assessment |
| Private beta | 3–6 months | Gate 3 | FBC | Beta/Live squad | Assessment + investment decision |
| Public beta | 3–9 months | Gate 3 / 4 | FBC drawdown | Beta/Live squad | Readiness for service |
| Live | continuous | Gate 4 / 5 | Benefits realisation | Service team | Quarterly operations review |

Capital / ISO 19650 / Building Safety Act golden thread run alongside this. The capital programme
digital workstream archetype (doc 07 §5) covers engagements where both spines apply.

Machine-readable copy: `data/playbook/phase-crosswalk.json`.

---

## 5. The Keel: assignment rules

Rules, not guidelines.

**Tenure.** A squad member stays for a minimum of one complete phase. Two is the target. Anyone
joining mid-phase is a supplement, not a replacement.

**Assignment depth.** Core roles are assigned at **0.8 FTE minimum** to a single engagement. Below
0.8, the person is a specialist consult. Nobody is assigned to more than **two engagements**.

**Capacity split.** Default **70 / 20 / 10**:

- **70% committed** — sprint-committed delivery
- **20% discretionary** — spikes, NFRs, tech debt, assurance preparation
- **10% slack** — genuinely uncommitted

The discretionary band is wider than a commercial 15% because public sector assurance overhead is
real. Delivery Compass tracks utilisation as a band with an upper limit, not a number to maximise.

Constants in code: `lib/playbook/keel.ts` (`CORE_ROLE_MIN_FTE`, `CAPACITY_SPLIT`).

---

## 6. Ceremonies and emissions

No ceremony survives unless it emits something the squad uses next week or assurance requires later.

| Ceremony | Cadence | Emits | Rigour signal |
|---|---|---|---|
| Backlog refinement | Weekly | Ready items + named NFRs | `nfr_planning` |
| Sprint planning | Fortnightly | Sprint goal, capacity position | `capacity_discipline` |
| Daily standup | Daily | Blocker log | none |
| Spike close-out | On completion | Decision record | `spike_discipline` |
| ADR | On decision | ADR | `handover_quality` |
| Show and tell | Fortnightly | Working software, attendee record | weak `assurance_participation` |
| Retrospective | Fortnightly | Actions with owners | none |
| Phase close | Per phase | Evidence pack | `handover_quality` |
| Delivery Compass review | Quarterly | Metric trend | none |

---

## 7–8. DoR / DoD and NFRs / spikes

Extended DoR includes WCAG 2.2 AA, Welsh language impact, DPIA trigger, named NFRs, security
classification. Extended DoD includes accessibility testing, performance vs NFR, decision trail,
content/Welsh review, ISO 19650 hand-in where capital.

NFRs are planned at Alpha. Spikes are question-first, timeboxed, and fail without a decision record.

---

## 9. Delivery Compass: rigour metric set

| Metric | Target |
|---|---|
| Evidence completeness | > 85% |
| Decision traceability | > 90% |
| Assignment stability | > 75% |
| NFR coverage | 100% by end of Alpha |
| Assurance first-pass rate | > 70% |

First-pass rate is the outcome; the others are leading indicators.

---

## 10. Maturity levels

Engagement attribute (not person). Contextualises the Preparedness Index. **Does not enter the fit
score.**

1. **Practising** — ceremonies run; evidence produced when asked
2. **Evidenced** — ceremonies emit artefacts; phase close is assembly
3. **Assured** — gates pass first time
4. **Compounding** — evidence accelerates the next engagement

Stored as `Engagement.maturityLevel` (`practising` | `evidenced` | `assured` | `compounding`).

---

## 11. Binding to Assemble

| Rigour signal | Playbook source | Derivation | Provenance |
|---|---|---|---|
| `sustained_assignment` | §5 tenure | Present for a complete phase at ≥0.8 FTE | Derived |
| `capacity_discipline` | §5 70/20/10 | Allocations against the split; overload is negative | Derived |
| `nfr_planning` | §8 | NFRs named at refinement | Derived where tooling allows, else asserted |
| `spike_discipline` | §8 | Spike closed with decision + evidence | Asserted + evidence link |
| `assurance_participation` | §4–6 | Named participation in gate/assessment | Asserted + evidence link |
| `handover_quality` | §6 phase close | Evidence completeness for the phase | Derived from Evidence module |

**Archetypes** are Squad Blueprint instances (`data/archetypes/seed/`). Version on edit.

**Maturity** sits on the engagement only.

### Amendments to doc 07 (playbook wins)

1. `sustained_assignment` threshold is **phase-complete at ≥0.8 FTE**, not merely “weeks present”.
2. `capacity_discipline` scores against the **70/20/10** split (committed ~70%, overload when
   committed ≫ 80% of FTE).
3. Engagement **maturity level** is required as context for readiness views; never folded into
   `computeFit`.
4. Vocabulary: do not call unallocated capacity a “bench” in product UI (playbook prose may use the
   metaphor; product copy says “unallocated capacity”).

---

## 12. The risk

If capturing a rigour signal is a separate administrative act, scoring becomes biased toward
well-resourced squads. Mitigations already in design:

1. Derive everything derivable.
2. Never penalise absence (doc 07 §4.2 — unevidenced ≠ low-rigour).
