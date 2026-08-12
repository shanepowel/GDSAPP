# 05 — AI Governance

The org tool ships a capable AI co-pilot: chat with inline patch suggestions, org generation from a
prompt, accountability suggestions, purpose refinement, overlap detection, and `apply-patch` which
writes entities and relationships with topological sorting and cycle breaking. It is good work.

In an assurance product it is also the largest single risk to the thing being sold. One panel
discovering that a score was partly machine-generated and unlabelled ends the product's credibility,
and probably the client relationship. So the co-pilot survives, with a hard boundary.

---

## The boundary (D6)

**AI may propose. Only a named human may judge.**

| AI may | AI may never |
|---|---|
| Draft a judgement rationale for a human to edit and confirm | Set or change a verdict |
| Suggest `capability_links` between criteria and accountabilities | Confirm a suggested link |
| Propose org patches (entities, relationships) into a **scenario** | Write to the live org graph |
| Suggest remedies for a gap | Mark a gap closed |
| Summarise evidence, extract dates, propose a `kind` and expiry | Create evidence that counts toward an index |
| Explain a criterion in plain English, in either language | Produce Welsh content for export |
| Detect overlapping accountabilities | Delete or merge anything |

Enforcement is structural, not procedural:

- `judgements.confirmedByUserId` is `NOT NULL`. There is no code path that can record a judgement
  without a human.
- The AI service account has no write access to `judgements`, `entities`, `relationships`, or
  `evidence`. It writes only to `ai_suggestions`.
- `apply-patch` is repointed at scenarios. Applying to live requires `promote`, which requires a human
  and is logged to `activity`.

---

## Provenance is visible everywhere

`<ProvenanceChip/>` is mandatory on every judgement row, every evidence row and every capability link.
Four states:

| Chip | Meaning |
|---|---|
| `Human` | Authored and confirmed by a person |
| `AI drafted · confirmed by [name]` | AI wrote the rationale, a person confirmed it |
| `Auto-matched · unconfirmed` | System-seeded capability link nobody has reviewed |
| `Pulled from Azure DevOps` | Integration signal |

Rules:
- The chip appears **in the exported PDF**, not just on screen. The judgement register appendix in
  `04-content-and-bilingual.md` carries the same information per row.
- `Auto-matched · unconfirmed` links render with a dashed connector in the Evidence Chain rail, and
  they **cannot raise a verdict to `met`**. An unreviewed machine guess must not be load-bearing.
- Any AI-drafted rationale a human edits before confirming becomes `Human` — editing is the act of
  taking ownership. Confirming unchanged keeps the AI-drafted label. This distinction is the whole
  point, so make the two buttons unambiguous: `Confirm as written` and `Edit and confirm`.

---

## Suggestion lifecycle

```
AI generates → ai_suggestions (status: pending)
             → surfaced in context with reasoning
             → human accepts (status: accepted, target record written)
               or rejects (status: rejected, reason optional)
               or ignores (status: expired after 14 days)
```

Never auto-apply. Never surface a suggestion without the reasoning that produced it — a suggestion the
user can't evaluate is noise, and in this product it's a liability. Suggestions expire so a stale
recommendation against an older team shape doesn't sit around looking current.

Record `model` and `promptHash` on every suggestion. When a client asks "how was this produced" — and
in this market they will — the answer needs to be retrievable per item, not a general statement about
the vendor.

---

## Model and data handling

The current setup is a blocker for client work and must change in Phase 1:

- **Replit AI Integrations must go.** `AI_INTEGRATIONS_OPENAI_API_KEY` / `..._BASE_URL` with a
  hardcoded `gpt-5.4` cannot be taken to a public sector client — there's no contractual chain, no
  data processing terms you control, and no way to answer a DPIA question about sub-processors.
  Replace with a direct provider contract with UK/EU data residency and zero-retention terms.
- **Model is configuration, not a literal.** `AI_MODEL` env var plus a per-engagement override, and
  the model recorded on every suggestion so historical records stay interpretable after an upgrade.
- **Redact by default.** Prompts must not carry client-identifiable data unless the engagement opts
  in. Before any call, replace: client organisation name, person names, email addresses, and any
  evidence URI. Pass structural facts (role archetypes, counts, verdicts, skill tags) instead. Most of
  what the co-pilot needs is structural. Log the redaction map, never the raw prompt.
- **Per-engagement kill switch.** `engagements.aiEnabled`. Some clients will require AI off entirely
  as a contract condition; that must be a setting, not a code branch.
- **Rate limits stay.** The existing `/api/ai/*` limit of 10/min keyed by user is right. Keep the
  Postgres-backed store — it survives restarts and works across autoscaled instances, which is why it
  was built that way.
- **32k prompt cap stays.** Also cap evidence text extraction so a 400-page PDF can't be pushed into a
  prompt whole.

---

## What to tell a client, in writing

Draft this once and keep it current — it will be asked for in every procurement and every DPIA. It
belongs on `/accessibility`'s sibling page, `/ai-use`, published.

- What the AI does: drafts rationales, suggests links and remedies, generates candidate team
  structures into scenarios.
- What it cannot do: set a verdict, move the index, write to the live team, or produce Welsh for
  publication.
- What data leaves the platform: structural facts by default; identifiable data only on explicit
  engagement opt-in, with the redaction list published.
- Retention: zero-retention provider terms, prompt hashes only.
- How to turn it off: one setting, per engagement, effective immediately.
- How a human stays accountable: every judgement carries a named confirmer, and the exported judgement
  register shows provenance per row.

If that page is uncomfortable to publish, the design is wrong — fix the design, not the page.
