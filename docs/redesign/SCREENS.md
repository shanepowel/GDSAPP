# Assemble v2 screens

One section per route. Each lists its purpose, what it shows, the components it uses, what is
interactive, and how to check it works. Full copy for every screen is in SPEC.md section 5.

## Global

- **Shell:** every signed-in screen sits in `AppShell` via `app/v2/(app)/layout.tsx`.
- **Navigation:** Home, Engagements, People, Capability, Playbook, Portfolio, Standards, Settings.
- **Ask Assemble:** button at the bottom of the sidebar opens the co-pilot drawer.
- **Engagement chrome:** `app/v2/(app)/engagements/[id]/layout.tsx` renders breadcrumb, title, status,
  lifecycle bar and the seven tabs for every engagement route.

## Rules engine (`lib/assemble-v2/next-action.ts`)

Evaluated in priority order. The first match is the engagement's next action; all non-calm matches
feed Home's "Needs attention".

| Priority | Rule | Next action |
| --- | --- | --- |
| 1 | Off track and no risk lock in the last 48 hours | Book a risk lock. This engagement is off track. |
| 2 | At risk and no recovery plan | Add a recovery plan this week. {reason} |
| 3 | Steering committee due and pack not ready | Draft the steering committee pack for {date}. |
| 4 | Decision not confirmed in writing | Confirm {n} decisions in writing. |
| 5 | Sprint Zero and checklist incomplete | Finish {n} Sprint Zero items before your first delivery sprint. |
| 6 | Change request submitted over 2 days ago | Triage change request {ref}. |
| 7 | Change request triaged over 5 days ago | Assess change request {ref}. |
| 8 | Keel exception without end date | Set an end date for one Keel exception. |
| 9 | Go-live set, beta or live, no aftercare SLA | Set up aftercare before go-live on {date}. |
| 10 | Monthly report due within 3 days | Draft this month's report. |
| 11 | Health check or client pulse not sent | Send this month's team health check / client pulse. |
| 12 | Charter review overdue | Review the squad charter at your next retrospective. |
| 13 | Nothing else | You are on track. Next milestone: {name} on {date}. |

`suggestedStatus()` suggests Off track for two or more measures below target or a missed milestone,
At risk for one, otherwise On track. Tests: `lib/assemble-v2/next-action.test.ts`.

---

## `/v2` Landing page
**Purpose:** show prospects what Assemble is in one scroll.
**Sections:** header with Assemble and T&T logo, hero with a live preview card (real demo data and
real next action), three benefits, five-step lifecycle, eight modules, standards crosswalk, Agile WOW
foundations, call to action, footer.
**Check:** "See the demo" opens Home; anchor links scroll; hero text is white on brand blue.

## `/v2/sign-in` Sign in
**Purpose:** sign in with Microsoft or open the demo.
**Wiring:** Microsoft button to next-auth Entra ID; demo button to `/api/auth/demo`.

## `/v2/welcome` First-run welcome (client)
Three steps with Next and Skip. Last step offers "Create your first engagement" or the demo.
**Wiring:** store "welcome seen" on the user; show once.

## `/v2/home` Home
**Purpose:** what needs my attention today?
**Shows:** greeting with count, "Needs attention" (top five non-calm actions across my engagements,
most urgent first), "My engagements" cards with lifecycle and next action.
**Components:** PageHeader, Input, ButtonLink, Card, CardHeader, AttentionRow, EngagementCard.
**Check:** five rows; each button links to the right engagement tab.

## `/v2/engagements` Engagements list
Filter by search, stage and status (GET form, works without JavaScript). Table with stage, status,
Squad Lead, next milestone and next action. Empty result message.
**Check:** `?status=at-risk` shows two rows.

## `/v2/engagements/new` New engagement wizard (client)
Steps: About, Commercials, Squad, Governance.
- Commercials: fixed price shows the governance helper; "scope not clear" suggests pricing a discovery.
- Squad: five squad shapes; roles list; "Find people" on the third role shows the Keel rule alert.
- Governance: Product Owner availability under 2 days shows the RAID warning.
**Wiring:** `trpc.engagement.create`, then seed checklist, charter and ceremonies from the shape.

## `/v2/engagements/[id]` Overview
**Shows:** Next action hero, four Compass tiles with trends, current stage checklist with "x of y
complete" and standards count, key dates, top three open risks.
**Components:** NextActionCard, MeasureTile, Card, Checklist, Badge.
**Check:** finance-data-platform shows "Add a recovery plan" and Team health below target.

## `/v2/engagements/[id]/squad` Squad
Members table with allocation, TFC badge and Keel status; "Find people" Team Fit panel; squad charter
(agreed badge, Draft with Assemble); ceremonies table from Squad Blueprint.

## `/v2/engagements/[id]/plan` Plan
Delivery Plan milestones with status and payment-linked marker (empty state when none); 30-day plan
in four blocks; spikes list.

## `/v2/engagements/[id]/compass` Delivery Compass (StatusControl is client)
Four measures; status chooser with Assemble's suggestion; At risk opens the recovery plan form;
Off track shows the risk lock prompt; surveys; monthly report; the six health check questions with
any average below 3 flagged.

## `/v2/engagements/[id]/decisions` Decisions
RAID log (type explained on hover), steering committees with pack status, risk lock booking, decisions
log with "confirmed in writing".

## `/v2/engagements/[id]/change` Change
Change requests in four columns (Submitted, Triaged, Assessed, Decided), "absorbed without
agreement" counter, support or change definitions, aftercare: SLA set-up with standard P1 to P4
service levels when not agreed.

## `/v2/engagements/[id]/standards` Standards
Framework toggles, three stats, points due at the current stage (select with `?point=`), crosswalk
panel for the selected point.

## `/v2/people` People (The Keel)
Four stats, sub-tabs, six-month resource plan (assigned, proposed, exception, available, over-85%
flag), Team Fit panel with Keel warning, priority order when demand exceeds supply.

## `/v2/capability` Capability (The Forge)
My pathway with progress and next module, skills-by-squad heatmap (levels named in words), the nine
foundation modules.

## `/v2/playbook` Playbook
Search, the nine handbook chapters, ten templates with "Use in an engagement", checklists.

## `/v2/portfolio` Portfolio
Counts by status, engagements table (worst first, below-target figures in bold amber), patterns
across squads, reports submitted this month.

## `/v2/standards` Standards library
Frameworks with "In use" and the crosswalk explorer.

## `/v2/settings` Settings
Delivery rules from the handbook (utilisation, tenure, targets, risk lock window, thresholds) and
integrations (Jira, Azure DevOps, Microsoft 365, Teams, EmberNest).

## `/v2/components` Component catalogue
Every component with its usage line, rendered with demo data.

---

## Acceptance tests (usable without instruction)

Run with three to five people who have not seen Assemble. Pass if four of five finish unaided.

1. Create a new engagement and choose a squad shape.
2. Assign a person, and request an exception when The Keel blocks it.
3. Find and tick the next checklist item.
4. Set an engagement to At risk and add a recovery plan.
5. Draft and submit a monthly report.
6. Log a client request and decide whether it is a change or a defect.
7. Find which standards apply at the current stage.

Automated: add Playwright + axe specs for each route under `tests/` (the repo already has
`@axe-core/playwright`). All v2 routes currently return 200 with no console errors.
