# Assemble v2: Agile WOW redesign

Branch: `redesign/agile-wow-ui` · Owner: Shane Powell · November 2026

This folder is the handover for the redesigned Assemble. The redesign re-centres the product on the
**engagement and its lifecycle**, and encodes the DAA Delivery Handbook (Agile WOW). It runs today
on demo data at `/v2`, alongside the existing app, so nothing live changes until each screen is wired
and switched over.

| Read this | For |
| --- | --- |
| [SPEC.md](./SPEC.md) | Product brief, information architecture, every screen's copy, rules, co-pilot and design system |
| [COMPONENTS.md](./COMPONENTS.md) | The component library: what each component is for, props, rules |
| [SCREENS.md](./SCREENS.md) | Every route, what it shows, components used, interactions, acceptance checks |
| [WIRING.md](./WIRING.md) | How to move each screen from demo data to tRPC and Prisma, in order |
| `.cursor/rules/50-assemble-v2.mdc` | The rules Cursor and Claude Code follow when editing v2 |

## Run it

```bash
npm install
cp .env.example .env          # set AUTH_SECRET / NEXTAUTH_SECRET
npm run dev                   # http://localhost:3000/v2
```

`/v2` does not need the database or a sign-in. It is excluded from the auth matcher in `proxy.ts`
because it is a demo. Add `/v2/:path*` to the matcher when the screens are wired to real data.

## Where things are

| Path | What |
| --- | --- |
| `styles/assemble-v2.css` | Brand tokens (`--asm-*`) and the Tailwind theme mapping (`bg-asm-brand`, `text-asm-ink`...) |
| `components/assemble-v2/` | The component library. Import from `@/components/assemble-v2` |
| `lib/assemble-v2/types.ts` | UI-shaped domain types every v2 screen renders |
| `lib/assemble-v2/demo-data.ts` | Fictional demo data (Example County Council story) |
| `lib/assemble-v2/next-action.ts` | Next-action rules engine (pure, tested) |
| `lib/assemble-v2/measures.ts` | Delivery Compass targets and tile helpers |
| `lib/assemble-v2/get-engagement.ts` | Data access seam for engagement screens |
| `app/v2/` | Every screen. `(app)` wraps signed-in screens in the AppShell |
| `public/turner-townsend-logo.svg` | Official Turner & Townsend logo |

## Screens

| Route | Screen |
| --- | --- |
| `/v2` | Landing page |
| `/v2/sign-in` | Sign in |
| `/v2/welcome` | First-run welcome (three steps) |
| `/v2/home` | Home: needs attention, my engagements |
| `/v2/engagements` | Engagements list with filters |
| `/v2/engagements/new` | New engagement wizard (four steps) |
| `/v2/engagements/[id]` | Overview: next action, Compass, stage checklist, dates, risks |
| `/v2/engagements/[id]/squad` | Members, Keel status, Team Fit, charter, ceremonies |
| `/v2/engagements/[id]/plan` | Delivery Plan, 30-day plan, spikes |
| `/v2/engagements/[id]/compass` | Measures, status and recovery plan, surveys, monthly report |
| `/v2/engagements/[id]/decisions` | RAID log, steering committees, risk locks, decisions log |
| `/v2/engagements/[id]/change` | Change requests, support or change definitions, aftercare SLA |
| `/v2/engagements/[id]/standards` | Standards by stage with crosswalk |
| `/v2/people` | The Keel: resource plan, Team Fit, priorities |
| `/v2/capability` | The Forge: my pathway, skills by squad, modules |
| `/v2/playbook` | Handbook, templates, checklists |
| `/v2/portfolio` | Compass across all engagements, patterns |
| `/v2/standards` | Frameworks and crosswalk explorer |
| `/v2/settings` | Delivery rules (config) and integrations |
| `/v2/components` | Live component catalogue |

Demo engagement ids: `finance-data-platform`, `customer-portal`, `asset-reporting`,
`highways-reporting`, `planning-portal`, `programme-controls`.

## Decisions for Shane before wiring

The redesign deliberately departs from some locked rules in `.cursor/rules/00-assemble-core.mdc` and
`10-ui-and-a11y.mdc`. They are isolated to `/v2` for now. Each needs a yes or no before v2 replaces
the live screens:

| Existing rule | What v2 does | Why |
| --- | --- | --- |
| "Do not build a risk register" | RAID log on the Decisions tab | The handbook's Governance chapter makes the RAID log the backbone of steering committees and risk locks. Alternative: read RAID items from Jira or Azure DevOps and keep v2 as the view |
| `--radius: 2px`, no `rounded-lg` | 10px and 14px radii (`rounded-asm`, `rounded-asm-lg`) | The client-facing redesign is softer and more product-like |
| Vocabulary bans "RAG", "issue", "rating", "project" | UI says On track / At risk / Off track (never "RAG"); RAID uses "issue" and "rating" because that is the handbook's language | Matches how delivery teams talk |
| Product name Datum (doc 10) | Product name Assemble | Your latest direction |
| Signal colour survey pink | No pink; T&T corporate blue #1E4479 | T&T brand colours |
| Navigation Practice / People / Squads / Assurance / Portfolio | Home / Engagements / People / Capability / Playbook / Portfolio / Standards / Settings, engagement-led | The redesign's lifecycle spine |

Rules v2 keeps: tokens only (no hex in components), verdict and status as glyph + label + wash,
WCAG 2.2 AA, scoring stays in `lib/scoring`, AI proposes and humans decide, read from delivery tools.

## What is not done yet

- Wiring to tRPC and Prisma (see WIRING.md). All data is demo data.
- Welsh translations. Copy is inline English; move strings to `next-intl` messages when wiring.
- The People sub-tabs (Demand, Exceptions, Scenarios) are placeholders that show the resource plan.
- Ask Assemble is UI only; it needs connecting to the AI service.
- Mobile layouts stack correctly but have not had a dedicated design pass.
