# 11 - Datum buildsheet

For Cursor. Ordered, with acceptance criteria per task. Reference code sits in `code/` alongside this
file and is meant to be dropped in and adapted, not admired.

Read first: doc 09 (the playbook, source of truth), doc 07 (Team Fit scoring), doc 10 (repositioning
and IA), doc 08 (performance). This sheet turns those into work.

---

## 0. The pivot in one paragraph

Datum stops being a tool for passing GDS assessments and becomes the instrument that carries Turner &
Townsend's delivery practice. It states what good delivery is, measures the capability the firm and
its clients actually hold against that definition, assembles the squad that can do a specific job,
and then reads that squad through whichever standard governs the client. Government Digital and Data
capability scoring and service standard readiness stay at full depth, as lenses rather than as the
product.

The audience widens with it. Today: bid teams chasing public sector digital work. After: T&T delivery
leadership resourcing engagements, clients buying a team, and assurance functions that need to see
the reasoning. The same build serves all three, which is why the practice content has to be public.

**What this means for existing work.** Nothing in the scoring engine changes. The schema in doc 07 is
unaffected. This is a shell, routing, content and messaging job, plus one genuine deletion.

---

## 1. Messaging

The current site sells a moment: winning the room. Replace it with a claim about delivery.

**Headline: "The team is the delivery plan."**

Everything else follows from it. The method is not the plan, the Gantt chart is not the plan, the
people who show up every day are the plan. It is true, it is arguable in a room, and it is the one
sentence that makes both the GDS buyer and the capital programme buyer lean in for the same reason.

Voice rules, applied everywhere including the app:

- Say what the product does, not what the client will feel. "Score every candidate against the role"
  beats "win with confidence."
- Never use "resource" to mean a person. Banned in copy, code and commit messages (doc 07 vocabulary).
- Name the framework correctly: Government Digital and Data Profession Capability Framework, with
  DDaT as a parenthetical on first use only.
- No claim the product cannot show on screen within two clicks.
- Sentence case throughout. Buttons say what happens: "Walk the demo", not "Get started".

All strings live in `code/copy.ts`. One source, so the site and the app cannot drift apart.

**Retire these:** "Win the room before you win the work", "Stop defending a slide deck", "sell rigour,
not promises", and the footer's "representative DDaT roles and skills". The last one dates the product
to anyone who knows the framework was renamed in December 2023.

---

## 2. Route map

```
/                         Practice overview        public
/practice/pillars         The five pillars          public
/practice/ceremonies      Ceremonies and evidence   public
/practice/standards       Definitions of ready/done public
/practice/maturity        The maturity ladder       public
/people                   Capability pool           auth
/people/[personId]        Person detail             auth
/squads                   Engagement squads index   auth
/squads/[engagementId]    Roles and best fit        auth
/squads/[engagementId]/roles/[roleId]   Candidates  auth
/squads/[engagementId]/gaps             Gaps        auth
/assurance/[engagementId]               Readiness   auth
/portfolio                Roll-up                   auth
/settings/archetypes      Archetype library         auth
```

Two deliberate changes. `/` is now the practice, not a sales page, because the practice *is* the
argument. And the engagement stops being the top-level container: it moves into a context switcher in
the top bar, so moving between Squads and Assurance no longer loses your place.

**Delete `/engagements/*` and redirect to `/squads/*`.** Keep the redirect for one release.

---

## 3. Task list

### T11.1 Design tokens
Drop in `code/globals.css`. Cool drafting stock, single accent, 2px radius, one type family across
three widths.

- [ ] No hardcoded hex outside the token block
- [ ] Contrast passes AA for every text token on every surface token
- [ ] `prefers-reduced-motion` respected globally

### T11.2 App shell
Drop in `code/app-shell.tsx`. Five-item rail, engagement context bar, no nesting deeper than two.

- [ ] Exactly five primary nav items, no dropdowns
- [ ] Engagement switcher persists selection across sections
- [ ] Full keyboard path, visible focus, correct `aria-current`
- [ ] Renders at 380px with the rail collapsed to a horizontal strip

### T11.3 Marketing to practice conversion
Drop in `code/marketing-page.tsx` and `code/copy.ts`.

- [ ] `/` renders the practice content with no auth
- [ ] Every claim on the page is reachable in the product within two clicks
- [ ] Zero instances of the retired phrases, checked by a repo grep in CI
- [ ] Welsh translations present for all new strings

### T11.4 Scoring engine
Drop in `code/fit.ts`. This is the full implementation of the contract in doc 07 section 4.

- [ ] Lint rule forbids imports from `@datum/db`, `next`, or any network library in this file
- [ ] Zero rigour signals returns multiplier exactly 1.0 plus a `no_rigour_signals` note
- [ ] Over-qualification never lifts skill score above 1.0
- [ ] Property test: composite stays within `skill × [0.75, 1.15]`
- [ ] 1,000 identical runs produce identical output

### T11.5 Fit strip
Drop in `code/fit-strip.tsx`. The signature element. CSS only, server renderable.

- [ ] No chart library, no canvas, no layout-affecting JS
- [ ] Datum rule renders at exactly the viability threshold, read from the same constant as scoring
- [ ] Below-level skills render hatched, absent skills render empty, and the two are distinguishable
- [ ] Unevidenced brackets render dashed and are announced differently to screen readers
- [ ] Every strip has a text equivalent, so the table is usable with images and CSS off

### T11.6 Table-first views
Rebuild Squads, People, Assurance and Portfolio as tables with expandable rows and a detail drawer.

- [ ] The force graph appears nowhere in the default path
- [ ] Graph survives only as an explicit action on `/people`, dynamically imported
- [ ] `next/dynamic` chunk analysis confirms D3 is absent from the initial bundle
- [ ] Every composite score has its breakdown one interaction away

### T11.7 Guided demo
Six steps, persistent bar, dismissible, sections navigable underneath.

- [ ] Order matches doc 10 section 6
- [ ] Step 4 explicitly shows the unevidenced rule in words as well as visually
- [ ] Dismissing the tour leaves a fully usable product, not a dead end
- [ ] Deep link `?tour=3` opens at a given step, for presenting

### T11.8 Framework version pinning
The maintenance obligation from doc 10 section 7.

- [ ] `frameworkVersion` column added alongside `scoringVersion` on `fit_scores`
- [ ] Seed import reads the published CSVs and records the source date
- [ ] A score referencing a renamed or removed skill still resolves and explains itself
- [ ] A documented quarterly reconciliation task with a named owner

---

## 4. Sequence

1. T11.1 and T11.2 together. Everything else renders inside them.
2. T11.4. Pure, testable, no UI dependency, unblocks the rest.
3. T11.5, then T11.6. The strip is the atom the tables are made of.
4. T11.3. Copy last, once the screens it points at exist, so no claim outruns the product.
5. T11.7 and T11.8 in parallel.

Items 2 and 3 are portable across the remaining performance work in doc 08, so they are safe to build
before any of it lands.

---

## 5. What to delete

Deletion is most of the value here, so it gets its own list.

- The engagement-scoped top-level navigation
- The force graph from every default path
- Every marketing string in section 1's retire list
- Any code path where AI writes a fit score, an assignment, or an asserted rigour signal (doc 07
  section 7). If one exists, it goes before anything on this sheet ships.
