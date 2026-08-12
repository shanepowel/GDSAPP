# 02 — Information Architecture and Flows

The merge is mostly an IA problem. Two apps currently have two container concepts (Assemble
*engagements*, org tool *workspaces*) and two navigation models (Assemble's marketing-to-engagement
funnel, the org tool's Design / People / Insights / History tabs). Collapsing them correctly is 80%
of the work.

---

## The collapse

| Org tool concept | Becomes | Note |
|---|---|---|
| Workspace | **Engagement** | D2. Rename the table, extend it. One tenancy concept. |
| Workspace member / role | Engagement member / role | Roles stay `owner \| admin \| editor \| viewer`, plus new `assessor` (read + comment, no edit). |
| Design tab | `/organise` | The graph. |
| People tab | `/organise/people` | |
| Insights tab | Split | Org-health insights stay under `/organise`. Standard-facing insight moves to `/assess` and `/`. |
| History tab | `/activity` | |
| `/admin` deployment dashboard | `/admin` | Internal only, gated to T&T tenant. Not customer-facing. |
| Templates gallery | `/engagements/new` step 3 | Team templates become an engagement-creation input, not a standalone dialog. |
| Share links | Unchanged | Extend to scope which modules a token exposes. |

---

## Route map

```
/                                          marketing (existing, keep)
/sign-in                                   Entra ID
/engagements                               portfolio list + roll-up
/engagements/new                           creation wizard
/engagements/[eng]                         Overview — index, movement, top gaps
/engagements/[eng]/assess                  criteria list for selected standard version(s)
/engagements/[eng]/assess/[criterionRef]   criterion detail — judgement, evidence, capability
/engagements/[eng]/organise                org graph (Graph | Table toggle)
/engagements/[eng]/organise/people         people, skills, FTE, allocations
/engagements/[eng]/organise/scenarios      scenario list
/engagements/[eng]/organise/scenarios/[id] scenario editing
/engagements/[eng]/organise/scenarios/[id]/diff   diff vs live, promote
/engagements/[eng]/evidence                the ledger
/engagements/[eng]/evidence/[id]           evidence detail + criterion links
/engagements/[eng]/assure                  gate pack list
/engagements/[eng]/assure/[packRef]        crosswalk view for one target
/engagements/[eng]/report                  export builder
/engagements/[eng]/activity                audit trail
/engagements/[eng]/settings                members, standards, integrations, danger zone
/share/[token]                             read-only, module-scoped
/admin                                     T&T internal ops
/accessibility                             accessibility statement (D8 — publish it)
```

Route group layout: `app/(engagement)/engagements/[eng]/layout.tsx` owns the left rail, the
`<TitleBlock/>`, and the engagement context provider. Every child is a server component by default;
only the graph, the chain rail and forms are client components.

---

## Modes

`engagement.mode` ∈ `bid | mobilise | assure`. Modes change defaults, never capability.

| Mode | Lands on | Prominent | Muted |
|---|---|---|---|
| **Bid** | `/organise` | Scenarios, what-if, report export | Evidence decay, activity |
| **Mobilise** | `/organise/people` | Vacancies, accountability gaps, evidence owner assignment | Crosswalk |
| **Assure** | `/engagements/[eng]` | Index movement, expiring evidence, gate packs | Scenarios |

Switching mode is a settings action, logged to activity. It never hides data — a muted module is one
rail click away.

---

## Navigation rules

- Left rail: Overview, Assess, Organise, Evidence, Assure, Report — then a rule, then Activity,
  Settings. Six primary destinations is the ceiling; a seventh means something is mis-scoped.
- The engagement switcher lives in the top bar, not the rail. It is a command-palette-style
  search over engagements, not a dropdown — a T&T portfolio will have hundreds.
- `⌘K` command palette (exists in the org tool) is extended to jump to criteria by ref ("6",
  "point 6"), evidence by title, and people by name.
- **The Evidence Chain rail is available from every route.** It is not navigation state; it overlays.
- Breadcrumbs only below `/assess/[criterionRef]` and `/evidence/[id]`.

---

## Flow A — Bid: blank page to panel-ready

The existing marketing promise. Target: under 90 minutes.

**A1. Create engagement** (`/engagements/new`)
Four steps, one screen each, progress shown as a numbered sequence (genuinely sequential, so
numbering carries information).

1. *Client and service.* Client organisation, service name, sector (`digital service` /
   `capital programme` / `hybrid`), a short service description.
2. *Standard and phase.* Pick one or more standard versions (GDS Service Standard v2019.1, Wales
   Digital Service Standard, TCoP) and the phase (discovery / alpha / beta / live / gate). Phase
   filters which criteria apply.
3. *Team.* Three entry paths, all landing in the same graph:
   - Start from a template (existing `templates.ts`, reworked — see below)
   - Import CSV/JSON (existing `/api/import`)
   - Pull from Entra directory (new — search people, read title and skills)
4. *Mode.* Bid / Mobilise / Assure. Defaults to Bid from this entry point.

**Templates must be rewritten.** The current set — "Startup Team", "SaaS Company (~100)" — is wrong
for this market and actively undermines credibility in a bid. Replace with:
`GDS discovery team`, `GDS alpha team`, `GDS beta team`, `Digital service — local authority`,
`Capital programme — information management (ISO 19650)`, `Enterprise implementation — asset management`,
`Data platform / digital twin`. Each template's roles map to DDaT / Digital and Data Profession
capability framework role names, and to ISO 19650 information management roles where relevant.

**A2. First index.** Landing on Overview, the index renders with a full gap list. Every gap is a
`<GapCard/>` naming the reasoning **and the move that closes it**. Statutory gaps sort first.

**A3. What-if.** From any gap, `Model a fix` branches a scenario (existing `/api/scenarios`), applies
the suggested move, and shows the projected index delta side by side with live. The diff view already
exists — restyle it, don't rebuild it.

**A4. Export the pack** (`/report`). Select sections, generate a branded PDF via the same
`<TitleBlock/>` and scoring function as the screen. Includes an appendix listing every judgement with
its rationale, confirmer and date — that appendix *is* the panel-defensibility artefact.

**Empty and edge states**
- No team yet: Overview shows `—`, not 0, with a single action `Add your team`.
- Standard version superseded mid-engagement: banner offering migration, showing which criteria
  changed. Never auto-migrate.
- Fewer than 3 criteria judged: index shows `Insufficient data` with the count needed.

---

## Flow B — Mobilise: winning to running

**B1. Promote the scenario.** The bid scenario becomes live (`/api/scenarios/:id/promote`, exists).
Activity records who promoted what.

**B2. Real people in.** `/organise/people`. Assign actual holders to roles. Vacancy detection exists;
surface it as a ranked plan — vacancies sorted by how many criteria they break, not alphabetically.
That ranking is a direct read of the criterion↔accountability join.

**B3. Assign evidence owners.** For each applicable criterion, name the person accountable for
producing the evidence. This is the step that converts a scorecard into a working instrument. Bulk
action: assign all criteria owned by a circle to that circle's lead.

**B4. Set the cadence.** Choose a review rhythm (fortnightly default). Generates the digest schedule
in Flow C.

---

## Flow C — Continuous assurance: the client's day-to-day

The subscription. Optimise for a five-minute weekly visit.

**C1. Overview answers three questions in one screen:** where are we, what moved, what's rotting.
- Index with 12-week trend sparkline (from `index_snapshots`)
- `What changed since your last visit` — judgements confirmed, evidence added, evidence expired,
  team changes. Per-user last-seen timestamp.
- `Expiring within 30 days` — evidence rows with owners, one-click nudge.

**C2. Decay is visible and automatic.** A nightly job re-evaluates freshness. When evidence expires,
the criterion's verdict does **not** silently flip — it moves to `at risk` with a system-generated
note and the owner is notified. A verdict change always has a named cause.

**C3. Digest.** Email on the chosen cadence: index, movement, expiring items, top three gaps. Links
deep into the criterion, not the homepage.

---

## Flow D — Evidence capture (the keystone)

Everything else is scaffolding around this. It must be fast enough to do in a stand-up.

**D1. Add evidence.** One dialog, reachable from `/evidence`, from any criterion, and from `⌘K`.

```
Title            [                                    ]
Type             ( ) Document  ( ) Research finding  ( ) Test result
                 ( ) Decision record  ( ) Code/repo  ( ) Metric  ( ) Other
Source           ( ) Link  ( ) Upload  ( ) From integration
                 [ https://…                          ]
Owner            [ search people ▾ ]
Produced         [ 30 Jul 2026 ]   Valid until [ 30 Jan 2027 ]
Confidentiality  ( ) Internal  ( ) Client  ( ) Publishable
Answers          [ + link criteria ]   6 · 9 · 11 selected
                 ─────────────────────────────────────
                 ⓘ Also answers NISTA Gate 3 Q2.4 and
                   ISO 19650 4.1 via the crosswalk
```

- **Linking to at least one criterion is required.** Unlinked evidence is a document store, and
  that's a non-goal.
- The crosswalk hint is the moment the product's differentiator becomes visible to a user. Make it
  prominent, not a footnote.
- Default `Valid until` by evidence type: research findings 6 months, test results 3 months,
  decision records no expiry, metrics 1 month. Overridable.
- Upload goes to Vercel Blob or S3 with the storage key recorded; the file itself is never the
  record of truth, the row is.

**D2. Bulk link.** From a criterion, select multiple existing evidence items. From an evidence item,
select multiple criteria. Both directions, same picker component.

**D3. Integration pull.** Azure DevOps / Jira / GitHub. Pulls signals — deployment frequency, test
pass rate, open accessibility defects, repo visibility — and creates evidence rows tagged
`Pulled from …`. These are signals, never judgements, and they carry an automatic 30-day expiry.

---

## Flow E — Judgement

The integrity-critical flow. See `05-ai-governance.md`.

**E1.** On a criterion, a user with `editor`+ sets a verdict, writes a rationale, and confirms.
**E2.** Rationale is **required** and minimum 40 characters. A verdict without reasoning cannot be
defended in a room, so the product refuses to record one.
**E3.** Confirming supersedes the prior judgement rather than overwriting it. Full history in the
chain rail under a disclosure.
**E4.** AI may pre-fill the rationale draft. When it does, the record stores `proposedBy: 'ai'` plus
model and prompt hash, and the `<ProvenanceChip/>` says so — on screen and in the exported PDF.
**E5.** `assessor` role can comment on a judgement but not change it. This lets a client's own
assurance function or an external reviewer work inside the tool.

---

## Flow F — Crosswalk and gate packs

Where the construction focus pays for itself.

**F1.** `/assure` lists available targets: GDS alpha assessment, GDS beta, GDS live, Wales assessment,
TCoP review, NISTA Gate 0–5, RIBA stage deliverables, Construction Playbook / Constructing the Gold
Standard checkpoints, ISO 19650 information requirements.

**F2.** Selecting a target renders `<CrosswalkMatrix/>`: the target's questions down the side, and for
each one, which existing criteria and evidence already answer it, and how completely
(`satisfies` / `partially` / `informs`). Coverage percentage at the top.

**F3.** The gap list for that target, distinguishing:
- *Answerable now* — evidence exists, just needs assembling into the pack
- *Evidence gap* — criterion judged but no artefact
- *Out of scope* — the target asks something the standard doesn't cover, needs original work

**F4.** Export the target-shaped pack. Same evidence, different document. This is the demo that sells
the product to a construction client, so it needs to be genuinely good, not a CSV dump.

---

## Sharing and read-only

Existing share links extend with a module scope: a token can expose Overview only, or Overview +
Assess, never Settings. A shared view renders the same `<TitleBlock/>` with a `Read-only · shared by
X on Y` band. Snapshot-bound tokens (already supported) are the right default for anything sent to a
panel, since a live link could move under the reviewer's feet.
