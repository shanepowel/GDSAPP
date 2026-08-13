# 10 — Repositioning, naming and information architecture

Supersedes the product framing on the current marketing site. Docs 07, 08 and 09 stand; this changes
what the product is *about* and how it is navigated, not how it scores.

## 1. The diagnosis

The live site sold one job: win a GDS bid. That is too narrow in three ways.

**The noun is wrong.** Organising around an engagement assessed against a standard is a compliance
activity. Compliance products are harder to explain than capability products.

**The addressable market is a subset of a subset.** UK public sector digital services subject to a
service assessment excludes capital programme work and every private client who needs delivery
rigour without a GDS panel.

**The standard is doing work the team should be doing.** The defensible claim is not “we can score
you against the points.” It is “we can tell you whether the people you have can actually deliver
this, and prove the answer.” The standard is a lens on that question, not the question.

## 2. The repositioning

**Datum is an instrument for assembling delivery teams and proving they are the right ones.**
Government Digital and Data capability scoring and service standard readiness are two of the lenses
it applies, not the reason it exists.

The argument runs: here is what good delivery is, here is the capability you hold, here is the squad
for this job, and here is what that squad means for whichever standard governs you.

- **GDS becomes a module, not the product.** It keeps its full depth. It stops being the framing.
- **The playbook becomes public and browsable.** Practice is open access. Nobody has to take the
  scoring on trust.
- **The capital programme audience becomes reachable.** Same instrument, different archetype and
  different crosswalk.

## 3. Naming

The product is **Datum**. The Keel stays as the fifth playbook pillar.

Datum is the instrument; Keel is a practice inside the playbook the instrument measures. A datum is
the fixed reference from which every measurement is taken. That is what the product is for, it is
native to T&T's surveying and construction world, and it survives growing beyond GDS. It also gives
the interface its organising visual idea: the fit strip read against a viability line at 0.60.

Do a trademark check before it goes on anything client-facing.

## 4. Navigation

Five sections. Each is a plain noun.

| Section | The question it answers |
|---|---|
| **Practice** | What does good delivery mean here? |
| **People** | What capability do we actually hold? |
| **Squads** | Who should do this job? |
| **Assurance** | Are we ready for the standard that governs us? |
| **Portfolio** | Where are we thin across the book of work? |

The order is the argument, general to specific. Practice is open access. The engagement is context
in the top bar, not the top-level container. Org design is People.

## 5. The interface

Table-first everywhere. The force-directed graph does not appear in the default path. It survives as
an explicit “view as graph” action on People, lazy loaded.

The signature element is the fit strip read against a datum line. Skill segments hatch when held
below the required level. The rigour bracket dashes when unevidenced — visually and verbally
distinct from poor evidence.

Type is one family across three widths: condensed for headings, regular for prose, monospaced for
every number and label.

## 6. The demo

A six-step guided walk with a persistent control bar, dismissible, sections navigable underneath.
Deep link `?tour=N`. Order: Practice → People → Squads → Squads reasoning → Assurance → Portfolio.

## 7. Framework accuracy

Formal name: **Government Digital and Data Profession Capability Framework**. DDaT stays as a spoken
alias only. Import from published CSVs and pin to a dated version. Every stored fit score carries
`frameworkVersion` alongside `scoringVersion`. Quarterly reconciliation is a named job — see
`docs/FRAMEWORK-RECONCILIATION.md`.
