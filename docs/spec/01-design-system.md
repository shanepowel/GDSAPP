# 01 — Design System

Read this before writing any UI. Every colour and type decision in the app derives from this file.

---

## The direction: a controlled document, not a dashboard

Assemble's job is to make a judgement **traceable**. The two audiences — a GDS service assessment
panel and a NISTA gate reviewer — share exactly one visual vernacular: the controlled document. A
drawing title block. A revision table. A suitability code. A document reference you can quote in a
meeting.

So Assemble is designed as an instrument that issues controlled outputs, not as a BI dashboard. This
is a substantive choice, not styling:

- A **title block** on every screen (engagement ref, standard + version, phase, revision, date,
  prepared by) is the first thing a reviewer wants and it makes screen/PDF parity trivial.
- **Revision, not autosave-anonymity.** Judgements supersede rather than overwrite, and the UI shows
  which revision you're looking at.
- **Verdicts are typed, not coloured.** Colour is a reinforcement, never the carrier.

### What this direction is deliberately not

The default for a "professional data tool" is Inter, a blue primary, `rounded-xl` cards on a grey
background, and RAG pills. The current org tool is exactly that — shadcn defaults, `--primary` at
`hsl(203 88% 53%)`, `--radius: 1.3rem`. It reads as a template and it undersells a product whose
whole pitch is rigour. It is being replaced.

Equally avoided: cream-and-serif editorial, near-black with an acid accent, and hairline broadsheet
columns. The 2px radius plus solid rules and a single saturated signal colour reads as engineering
drawing rather than newspaper.

### The one risk, and the justification

**The accent colour is survey pink** — the fluorescent magenta of setting-out marks and surveyors'
spray on a construction site, and of redline markup. It appears only where a human decision is
required and on the active link in the evidence chain. It is specific to the subject's world, it is
unmistakably not a corporate blue, and it carries meaning: *this is a mark someone made on purpose.*

Used at more than roughly 2% of any screen it will look like a toy. Police this in review.

---

## Tokens

Define once in `apps/web/app/globals.css`. No component invents a value.

```css
:root {
  /* ---- Surface: cool drafting stock, not warm cream ---- */
  --stock-0:  #FFFFFF;   /* sheet */
  --stock-1:  #F4F6F7;   /* app background */
  --stock-2:  #E8ECEE;   /* inset panels, table stripes */
  --rule:     #C6CDD2;   /* 1px plate rules, borders */
  --rule-soft:#DDE2E5;

  /* ---- Ink: near-black with a cold cast ---- */
  --ink-0:    #14181C;   /* primary text, plate lines */
  --ink-1:    #3B444C;   /* secondary text */
  --ink-2:    #6B7480;   /* captions, metadata, "not assessed" */

  /* ---- Signal: setting-out mark. Decisions only. ---- */
  --signal:      #D6006E;
  --signal-ink:  #A30054;  /* text on light — passes AA at 14px */
  --signal-wash: #FDE8F1;

  /* ---- Verdicts. Always paired with label + glyph. ---- */
  --met:          #1F6F4E;
  --met-wash:     #E6F2EC;
  --at-risk:      #8A5A00;
  --at-risk-wash: #FBF0DC;
  --not-met:      #A32020;
  --not-met-wash: #FAE9E9;
  --unassessed:   #6B7480;
  --unassessed-wash: #EDEFF1;

  /* ---- Brand. Substitute real T&T values from brand guidelines. ---- */
  --brand:      /* T&T primary */;
  --brand-ink:  /* T&T primary, contrast-safe on --stock-0 */;

  /* ---- Type ---- */
  --font-ui:   "Instrument Sans", system-ui, sans-serif;
  --font-data: "IBM Plex Mono", ui-monospace, monospace;
  --font-doc:  "Source Serif 4", Georgia, serif;  /* exported PDF only */

  /* ---- Geometry ---- */
  --radius:    2px;
  --radius-lg: 3px;
  --rule-w:    1px;
  --plate-w:   2px;   /* title block underline, active tab */

  /* ---- Focus: thick, high-contrast, never removed ---- */
  --focus:        #FFD400;
  --focus-shadow: #14181C;
}
```

**Dark mode:** invert to `--ink-0: #EAEDEF` on `--stock-1: #16191C`, keep the verdict hues but lift
lightness ~12% to hold 4.5:1. Survey pink becomes `#FF4D9D` on dark. Ship dark mode in Phase 2, not
Phase 0 — get one theme right first.

### Tailwind mapping

Map tokens in `tailwind.config.ts` as semantic names only: `bg-stock-1`, `text-ink-1`,
`border-rule`, `text-verdict-met`. **Do not expose raw palette names.** If a developer can write
`bg-pink-500` the system has already failed.

---

## Typography

| Role | Face | Size / weight / tracking |
|---|---|---|
| Plate title | Instrument Sans | 24px / 600 / -0.02em |
| Section heading | Instrument Sans | 17px / 600 / -0.01em |
| Body, criterion statements | Instrument Sans | 15px / 400 / 0, line-height 1.55 |
| UI label | Instrument Sans | 13px / 500 / 0.01em |
| Title-block metadata | IBM Plex Mono | 11px / 400 / 0.04em, uppercase |
| Index value | IBM Plex Mono | 40px / 500, `font-variant-numeric: tabular-nums` |
| Criterion refs, doc refs, revision codes | IBM Plex Mono | 12px / 500 |
| Report body (PDF only) | Source Serif 4 | 10.5pt / 400, line-height 1.5 |

Rules:
- **Every numeral in the product is tabular.** Set `font-variant-numeric: tabular-nums` globally on
  `--font-data` and on any element displaying a score, count or date. A score that jitters as it
  animates destroys the instrument feeling.
- Sentence case everywhere except title-block metadata. No title case, no ALL CAPS body.
- Criterion statements are quoted verbatim from source. They render in body style with no editorial
  emphasis added — bolding part of a standard is misrepresentation.
- Screen is grotesque + mono. Print is serif. That split is deliberate: the screen is an instrument,
  the PDF is a report of record.

---

## Layout: the plate

Every primary screen is a **plate** with three fixed zones.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ASSEMBLE   ⌘K            Engagement switcher            EN|CY   Account  │  56px
├──────────┬───────────────────────────────────────────────────────────────┤
│          │ ┌─── TITLE BLOCK ────────────────────────────────────────┐    │
│ Overview │ │ NRW-DISC-01        GDS Service Standard v2019.1        │    │
│ Assess   │ │ Discovery · Rev C   Prepared by S Powell · 30 Jul 26   │    │  72px
│ Organise │ └────────────────────────────────────────────────────────┘    │
│ Evidence │ ══════════════════════════════════════════════════════════    │ 2px plate rule
│ Assure   │                                                               │
│ Report   │              WORKING AREA                                     │
│          │                                                               │
│ ──────── │                                                               │
│ Activity │                                                               │
│ Settings │                                                               │
└──────────┴───────────────────────────────────────────────────────────────┘
                                                        ▲ Evidence Chain rail
                                                          slides in from right, 480px
```

- Left rail 224px, collapses to 64px icons below 1280px, becomes a sheet below 768px.
- The title block is a component (`<TitleBlock/>`), reads from the engagement, and is the same
  component that renders the PDF cover. One source of truth.
- Working area max-width 1200px for reading views, full-bleed for the org graph.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48. Nothing else.

---

## The signature component: the Evidence Chain rail

**This is the thing the product is remembered for. Build it in Phase 3 and give it real attention.**

Assemble's promise is that every number opens to its reasoning. Most tools honour that with a
tooltip. Assemble honours it with a physical gesture: **any number, verdict or index anywhere in the
app is a control, and activating it slides open a right-hand rail rendering the full traceability
chain as linked segments.**

```
  ╭─ EVIDENCE CHAIN ───────────────────────────── ✕ ─╮
  │                                                  │
  │  ⬥ CRITERION 6                                   │
  │  │ Have a multidisciplinary team                 │
  │  │ GDS Service Standard v2019.1 · statutory: no  │
  │  ├──────────────────────────────────────────     │
  │  ⬥ CAPABILITY REQUIRED                           │
  │  │ User researcher, 0.6 FTE minimum, phase-      │
  │  │ persistent through beta                        │
  │  ├──────────────────────────────────────────     │
  │  ⬥ ACCOUNTABILITY                                │
  │  │ "Continuous user research" — held by          │
  │  │ Discovery Circle                               │
  │  ├──────────────────────────────────────────     │
  │  ⬥ ROLE            ⚠ VACANT                      │
  │  │ Senior User Researcher                         │
  │  │ no person assigned · flagged 12 days           │
  │  ├──────────────────────────────────────────     │
  │  ⬥ EVIDENCE  2 items · 1 expiring                │
  │  │ Discovery research report      exp. 14 Sep    │
  │  │ Round 3 usability findings     EXPIRED        │
  │  ├──────────────────────────────────────────     │
  │  ⬥ JUDGEMENT                                     │
  │  │ At risk — confirmed by A Graves, 28 Jul       │
  │  │ Proposed by AI · rationale 84 words     [▾]   │
  │  ╰──────────────────────────────────────────     │
  │                                                  │
  │  [ Open criterion ]  [ Fix the vacancy ]         │
  ╰──────────────────────────────────────────────────╯
```

Requirements:
- Each `⬥` segment is a link to the underlying record. The rail is navigation, not a read-only popup.
- The connecting rule is `--signal` where the chain is **complete**, `--rule` where a link exists but
  is unevidenced, and **broken (dashed)** where the chain has a gap. A reviewer can see a broken
  chain from across a room. This is the product's core diagnostic.
- Opens on click and on `Enter`/`Space` from any keyboard-focusable number. `Esc` closes and returns
  focus to the trigger. Focus is trapped while open.
- On viewports under 1024px it becomes a full-screen sheet.
- Slides 200ms `cubic-bezier(0.2, 0, 0, 1)`. Under `prefers-reduced-motion: reduce` it appears
  without transform.

---

## Component inventory

Keep Radix primitives (already vendored from the org tool). Restyle to tokens; delete the shadcn
default theme. Then build these product components:

| Component | Notes |
|---|---|
| `<TitleBlock/>` | Screen header + PDF cover. Props: engagement, standardVersion, phase, revision, preparedBy. |
| `<IndexValue/>` | Tabular mono numeral, animated delta, opens the chain. Shows `—` when insufficient evidence — **never 0**. Zero implies a measurement; a dash implies an absence. |
| `<Verdict/>` | `met` / `at-risk` / `not-met` / `not-assessed`. Renders glyph + label + wash. Colour never alone. |
| `<ProvenanceChip/>` | `Human` / `AI suggested` / `Pulled from Azure DevOps` / `Imported`. Mandatory on every judgement and evidence row. |
| `<CriterionRow/>` | Ref (mono) · title · verdict · evidence count · chain affordance. |
| `<EvidenceRow/>` | Title · type · owner · produced · expiry with freshness state · linked criteria count. |
| `<FreshnessMeter/>` | Fresh / expiring within 30 days / expired. Text + glyph, not a colour bar. |
| `<GapCard/>` | Named gap, reasoning, statutory flag, and **the specific move that closes it** — never a gap without a remedy. |
| `<ScenarioDiff/>` | Two-column added/removed/changed, from the org tool's existing diff endpoint. |
| `<OrgGraph/>` | D3 force / tree / radial. See constraints below. |
| `<OrgTable/>` | The accessible equivalent of the graph. First-class, not a fallback. |
| `<CrosswalkMatrix/>` | Criteria × framework items, cells show mapping relation. |
| `<StatutoryFlag/>` | Distinct from verdicts. A statutory gap is a different category of risk and must not look like an amber. |

### Org graph constraints

The D3 views port from `client/src/components/visualization/org-chart.tsx`. Non-negotiables:

1. **`'use client'` + dynamic import with `ssr: false`.** The force simulation touches layout on mount.
2. **Tear down the simulation on unmount** (`sim.stop()`), and cancel any `requestAnimationFrame`.
   The existing component leaks if the route changes mid-settle.
3. **Under `prefers-reduced-motion: reduce`, run the simulation headlessly to a settled state and
   render the final positions.** No visible jitter.
4. **A force-directed SVG is not accessible.** `<OrgTable/>` is the equivalent experience: a nested
   tree with roles, accountabilities, holders and vacancies, fully keyboard-navigable and readable
   by a screen reader. Expose it as a peer toggle — `Graph | Table` — with the choice persisted per
   user. An assessor will test this, and Point 5 of the Service Standard is explicit about it.
5. The SVG gets `role="img"` and an `aria-label` summarising the structure ("Organisation chart, 24
   roles, 6 circles, 3 vacancies"), with the table as the accessible alternative.

---

## Accessibility floor — WCAG 2.2 AA, treated as a release gate

D8 makes this existential: an assurance product that fails its own standard cannot be sold.

- **Contrast:** 4.5:1 body, 3:1 large text and UI boundaries. Verify every verdict wash/ink pair.
  `--at-risk: #8A5A00` is deliberately dark for this reason — the obvious amber fails.
- **Never colour alone** (1.4.1). Every verdict carries a glyph and a text label. Every chart series
  carries a direct label or pattern, not a legend swatch.
- **Focus visible** (2.4.7, 2.4.11): 3px `--focus` outline with a 1px `--focus-shadow` inner ring so
  it survives on both light and dark surfaces. Never `outline: none`.
- **Target size** 24×24px minimum (2.5.8). The chain affordance on a table row is the one most likely
  to fail — check it.
- **Keyboard:** every flow completable without a pointer, including the org graph via `<OrgTable/>`.
- **Reduced motion** respected by the rail, the index delta and the force simulation.
- **Zoom** to 400% without loss of content (1.4.10). The plate layout must reflow, not scroll
  horizontally.
- **Forms:** visible persistent labels, never placeholder-as-label. Errors identify the field and say
  how to fix it (3.3.1, 3.3.3).
- **Language:** `lang` attribute switches with the EN/CY toggle; mixed-language passages get inline
  `lang` (3.1.2). Welsh place and body names inside English text need marking up.

**CI gate:** `axe-core` via Playwright on every route at 1440px, 768px and 375px. Any violation fails
the build. Add this in Phase 0 so debt never accumulates.

---

## Motion

One orchestrated moment, everything else still.

- **The index delta.** When a change moves the Preparedness Index, the numeral counts to its new
  value over 420ms with tabular numerals, and the contributing criterion rows pulse their left edge
  in sequence (30ms stagger, 3 rows maximum). This directly serves the core claim — you *see* which
  judgements moved. Under reduced motion the value simply updates and the rows show a static marker.
- The chain rail slide (200ms).
- Nothing else animates. No card hover lifts, no page transitions, no skeleton shimmer — use a static
  `--stock-2` block. Ambient motion in an assurance tool reads as unserious.
