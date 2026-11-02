# Assemble: Redesign and Copy Refresh Spec

Version 1.0 | November 2026 | Owner: Shane Powell, Director, Digital Automation and AI, Turner & Townsend

This document is the single brief for redesigning Assemble. It covers positioning, information architecture, every screen, all interface copy, the data model, AI co-pilot behaviour, the design system and the build plan. It is written to be handed to a coding agent (Cursor) or a designer as-is.

Writing rules for everything in this document and in the app: UK spelling, plain English, no em dashes, sentence case for headings and buttons.

---

## 1. What Assemble is now

### 1.1 One-line definition

**Assemble is how Turner & Townsend sets up, runs and assures delivery teams.**

### 1.2 The shift

| Before | After |
| --- | --- |
| A GDS standards assessment tool with an org design tool attached | The operational home of Agile WOW, with standards as one lens |
| Organised around frameworks (GDS, DDaT, org design) | Organised around engagements and their lifecycle |
| Users must know which tool to open | Users open an engagement and see what needs doing next |
| Hard to explain in a demo | Explained in one sentence and one ten-minute story |

### 1.3 Source of truth

The DAA Delivery Handbook (Agile WOW) is the rulebook. Assemble encodes it. Every rule, threshold, template and checklist in the app comes from the handbook. When the handbook changes, the app's configuration changes, not its code.

| Handbook | Assemble |
| --- | --- |
| 1. Agile WOW overview | Lifecycle spine and home page |
| 2. The Forge | Capability module |
| 3. Squad Blueprint | Squad module |
| 4. T&T DevOps Spec | Playbook module |
| 5. Delivery Compass | Compass module |
| 6. The Keel | Team module |
| 7. Sprint Zero and spikes | Sprint Zero stage and Spikes in Playbook |
| 8. Governance | Decisions module |
| 9. Aftercare and change control | Change module |
| GDS Service Standard and crosswalk | Standards lens |

### 1.4 Who it is for

| User | What they come to do | How often |
| --- | --- | --- |
| Squad Lead | Run an engagement: checklists, RAID, reports, steering packs | Daily |
| Delivery Lead | See every engagement's health and act on ambers and reds | Weekly |
| Resourcing and Head of Delivery | Assign people, manage capacity and exceptions | Weekly |
| Bid lead and Account Manager | Check staffing before committing, set up governance | Per bid |
| Squad member | Check the charter, plan, own capability and pathway | Weekly |
| Client (later, read-only) | See status, decisions and change requests | Fortnightly |

External delivery teams (client teams and partners) use the same app with their own organisation. Nothing in the copy should assume the user works for Turner & Townsend unless they are in the T&T organisation.

### 1.5 What Assemble is not

- Not a code quality or AI assurance tool. That is EmberNest. Assemble never shows code metrics.
- Not a replacement for Jira or Azure DevOps. It reads from them later; it does not hold the backlog.
- Not a timesheet or finance system.

---

## 2. Design principles

1. **One spine.** Everything hangs off an engagement and its lifecycle stage.
2. **One question per screen.** If a screen needs explaining, it is doing too much. Split it.
3. **Next action first.** Every engagement shows the single most important thing to do next.
4. **Start from a template, never a blank page.** Picking a squad shape pre-fills the charter, checklist and ceremonies.
5. **Standards in context.** Show the relevant Service Standard points at the stage they matter, not as a separate form.
6. **Status colour only means status.** Red, amber and green appear only for RAG. Everything else uses the blue palette.
7. **Usable without instruction.** A Squad Lead who has never seen Assemble can create an engagement and finish Sprint Zero setup without help.
8. **Write like a colleague.** Short, direct, specific copy. No jargon without an explanation one hover away.

---

## 3. Information architecture

### 3.1 Global navigation (left sidebar)

| Label | Icon idea | Goes to | Visible to |
| --- | --- | --- | --- |
| Home | house | My engagements and what needs attention | Everyone |
| Engagements | layers | All engagements, filterable | Everyone |
| People | users | The Keel: resource plan, capacity, exceptions | Leads, resourcing |
| Capability | graduation cap | The Forge: skills, pathways, certification | Everyone |
| Playbook | book | Templates, checklists, the handbook | Everyone |
| Portfolio | compass | Delivery Compass across all engagements | Delivery Lead, leadership |
| Standards | shield check | Standards lens and crosswalk library | Everyone |
| Settings | cog | Organisation, roles, integrations, configuration | Admins |

Bottom of sidebar: organisation switcher, user menu, "Ask Assemble" (co-pilot).

### 3.2 Inside an engagement (top tabs)

| Tab | Purpose | Handbook source |
| --- | --- | --- |
| Overview | Status, next action, lifecycle position, key dates | 1 |
| Squad | Shape, members, charter, ceremonies | 3, 6 |
| Plan | Delivery Plan, 30-day plan, milestones | 3, 4 |
| Compass | Four measures, surveys, monthly report | 5 |
| Decisions | RAID, steering committees, risk locks, decisions log | 8 |
| Change | Change requests, aftercare SLA, support log | 9 |
| Standards | Standards lens for this engagement | GDS and crosswalk |

The lifecycle bar sits above the tabs on every engagement page:

`Shape · Sprint Zero · Discovery · Alpha · Beta · Live · Operate`

The current stage is filled; completed stages show a tick; future stages are outlined. Clicking a stage shows its checklist and exit criteria.

### 3.3 Retire, merge, keep

Apply this to the current app before building.

| Current feature | Action | Where it goes |
| --- | --- | --- |
| GDS Service Standard assessment | Keep, reframe | Standards lens (engagement tab and Standards library) |
| DDaT capability scoring | Keep | Capability module and Team Fit |
| Crosswalk (TCoP, NISTA, ISO 19650, Construction Playbook, golden thread) | Keep, promote | Standards library; surfaced by stage |
| Org design tool: circles, roles, products | Merge | Squad module (squad shapes and roles) |
| Org design: people, assignments | Merge | People module (The Keel) |
| Org design: scenarios, snapshots | Keep | People module, "Plan a scenario" |
| Org design: insights | Merge | Portfolio and Home "Needs attention" |
| Share links | Keep | Engagement share (read-only client view) |
| Team Fit | Keep, promote | Squad module, "Find people" |
| Standalone dashboards that duplicate the above | Remove | |

---

## 4. Core objects and data model

These extend the existing Drizzle schema. Existing org design entities map in where noted.

| Object | Key fields | Notes |
| --- | --- | --- |
| Organisation | id, name, type (T&T, client, partner), settings | Existing |
| Person | id, name, email, role family, DDaT role, level, line manager, TFC status | Existing people, extended |
| Engagement | id, name, client, sector, commercial model, start, end, stage, RAG, next action, owner (Squad Lead), account manager | New core object |
| Squad | id, engagement id, shape, charter (json), ceremonies (json) | Maps from circles |
| Assignment | person id, squad id, role, start, end, allocation %, is exception, exception end, approved by | Existing, extended |
| Stage checklist item | engagement id, stage, item key, status, owner, evidence link | Items configured from handbook |
| Milestone | engagement id, name, due, status (on time, at risk, late, re-planned), payment linked | |
| Measure snapshot | engagement id, period, predictability, quality, team health, client satisfaction, commercial fields | Monthly |
| Survey response | engagement id, type (health, pulse), period, answers, anonymised | |
| RAID item | engagement id, type, title, owner, likelihood, impact, action, due, status | |
| Decision | engagement id, forum (steering, risk lock), date, decision, owner, confirmed date | |
| Steering committee | engagement id, date, pack (generated), attendees, decisions | |
| Risk lock | engagement id, blocker, called by, date, cause, options, decision, owner, escalated | |
| Spike | engagement id, question, why, time box, done looks like, owner, answer, follow-on | |
| Change request | engagement id, ref, requested by, description, triage (change, defect, support), estimate, impact, options, decision, approver, dates | |
| Aftercare SLA | engagement id, model, hours, service levels (json), start, end, review date | |
| Support ticket | engagement id, priority, raised, responded, resolved, note | |
| Standard assessment | engagement id, framework, point, stage, status, evidence | Existing GDS assessment, extended to crosswalk |
| Pathway progress | person id, pathway, module, status, completed date | |
| Config | key, value | Handbook thresholds: 80% capacity, 3-month tenure, targets, SLA defaults |

All thresholds live in Config, so the handbook can change without a code change.

---

## 5. Screen-by-screen spec with copy

Copy is final unless marked [placeholder]. Variables are in `{curly brackets}`.

### 5.1 Sign in

- **Heading:** Sign in to Assemble
- **Subheading:** Set up, run and assure your delivery teams.
- **Button:** Continue with Microsoft
- **Secondary link:** Use a demo account
- **Footer:** Turner & Townsend | Privacy | Accessibility

### 5.2 First-run welcome (shown once)

Three short steps, each a single card with an illustration and a button.

1. **Heading:** Everything starts with an engagement
   **Body:** An engagement is a piece of work for a client. Assemble helps you staff it, set it up and keep it healthy, from bid to aftercare.
   **Button:** Next
2. **Heading:** Follow the lifecycle
   **Body:** Each engagement moves through Shape, Sprint Zero, Discovery, Alpha, Beta, Live and Operate. Assemble shows you what needs doing at each stage.
   **Button:** Next
3. **Heading:** We will tell you what needs attention
   **Body:** Your home page shows anything amber or red, anything overdue and the next action on each engagement.
   **Button:** Create your first engagement
   **Secondary:** Explore the demo engagement

### 5.3 Home

**Purpose:** answer "what needs my attention today?"

**Layout:** greeting, a "Needs attention" list, then "My engagements" as cards.

- **Greeting:** Good morning, {first name}
- **Subline (if items need attention):** {count} things need your attention.
- **Subline (if nothing):** Nothing needs your attention right now.

**Needs attention** (list, most urgent first). Each row: icon, sentence, engagement name, action button.

| Trigger | Row copy | Button |
| --- | --- | --- |
| Engagement turned red | {Engagement} is red. A risk lock is due within 48 hours. | Book risk lock |
| Engagement turned amber | {Engagement} is amber. Add a recovery plan this week. | Add recovery plan |
| Sprint Zero item overdue | {Engagement}: {item} is overdue for Sprint Zero. | Open checklist |
| Monthly report due | Monthly report for {Engagement} is due in {n} days. | Draft report |
| Keel exception has no end date | {Person}'s exception on {Engagement} has no end date. | Set end date |
| Change request awaiting assessment | Change request {ref} on {Engagement} needs an assessment. | Assess |
| Steering committee in 2 days, no pack | Steering committee for {Engagement} is on {date}. The pack is not ready. | Draft pack |
| Survey not run | Team health check for {Engagement} has not been run this month. | Send survey |

**My engagements** card:

- Engagement name, client
- Lifecycle bar (mini)
- RAG pill: `On track` (green), `At risk` (amber), `Off track` (red)
- **Next action:** {next action sentence}
- Button: Open

**Empty state:**
- **Heading:** No engagements yet
- **Body:** Create one to start staffing your squad and setting up Sprint Zero.
- **Button:** New engagement
- **Secondary:** Explore the demo engagement

### 5.4 Engagements list

- **Page title:** Engagements
- **Subtitle:** Every engagement you can see, with its stage and status.
- **Filters:** Stage, Status, Client, Squad Lead, Sector
- **Search placeholder:** Search engagements
- **Primary button:** New engagement
- **Table columns:** Engagement, Client, Stage, Status, Squad Lead, Next milestone, Next action

### 5.5 New engagement (wizard, four steps)

Progress indicator: `About · Commercials · Squad · Governance`

**Step 1. About**
- **Heading:** What is this engagement?
- Fields: Engagement name (hint: "For example, Finance data platform"), Client, Sector (Public sector, Infrastructure, Real estate, Energy and utilities, Other), Start date, Expected end date, Outcomes (hint: "Two to four outcomes, each with a measure. For example, 'Finance managers see actuals within one day of month end.'")
- **Button:** Next

**Step 2. Commercials**
- **Heading:** How is it contracted?
- Fields: Commercial model (Fixed price, Time and materials, Outcome-based, Retained), Payment milestones (add rows: name, date, what proves it is met), Is scope clear enough to fix the price? (Yes / No, price a discovery first)
- **Helper (if fixed price):** Fixed-price engagements need a steering committee and an agreed change route. We will set both up in step 4.
- **Helper (if scope unclear):** Consider pricing a discovery first and fixing the delivery price afterwards.
- **Button:** Next

**Step 3. Squad**
- **Heading:** Choose a squad shape
- **Body:** Pick the closest shape. You can adjust roles after.
- Shape cards (from Squad Blueprint):
  - **Software product squad.** Web apps, portals and integrations.
  - **Data platform squad.** Lakehouses, pipelines, Fabric or Databricks.
  - **Reporting squad.** Power BI and dashboards on an existing platform.
  - **Automation squad.** Power Platform, workflow and AI automation.
  - **Discovery squad.** A short discovery or alpha before a larger build.
- After selection: role list with "Find people" next to each role (opens Team Fit, see 5.8).
- **Keel check banner (if a rule would break):** This assignment would put {person} on {n} engagements. The Keel allows one. Choose someone else or request an exception.
- **Button:** Next

**Step 4. Governance**
- **Heading:** Set up governance
- Fields: Steering committee chair (client), Frequency (Monthly, Fortnightly), Client Product Owner, Product Owner availability (days a week), Account Manager, Change approval threshold (£)
- **Helper (if Product Owner availability under 2 days):** Less than two days a week is a delivery risk. We will add it to the RAID log so you can raise it at the first steering committee.
- **Button:** Create engagement
- **Success toast:** {Engagement} created. Sprint Zero is ready to start.

### 5.6 Engagement: Overview tab

**Header:** engagement name, client, RAG pill, Squad Lead avatar, share button.

**Lifecycle bar** (full width).

**Next action card** (top, prominent):
- **Label:** Next action
- **Sentence:** generated from rules, for example "Finish 3 Sprint Zero items before your first delivery sprint on {date}."
- **Button:** context-specific

**Four Compass tiles:** Predictability, Quality, Team health, Client satisfaction. Each shows the value, the target and a three-month trend arrow. Tooltip copy:
- Predictability: Sprint goals met over the last six sprints. Target 80%.
- Quality: Defects found after acceptance, as a share of stories accepted. Target under 1%.
- Team health: Average of the monthly squad health check. Target 4 out of 5.
- Client satisfaction: Average of the monthly client pulse. Target 4 out of 5.

**Key dates:** next milestone, next steering committee, next sprint review.

**Top risks:** top three RAID items with owners. Link: View all in Decisions.

### 5.7 Stage view (clicking a lifecycle stage)

- **Heading:** {Stage}
- **Subheading by stage:**
  - Shape: Get the bid right so the engagement is governable from day one.
  - Sprint Zero: Set up the team, tools and plan before delivery starts.
  - Discovery: Understand users and the problem before committing money.
  - Alpha: Test the riskiest ideas with prototypes.
  - Beta: Build the real product and release it in stages.
  - Live: The product is fully released and still improving.
  - Operate: Aftercare, support and managed change.
- **Checklist:** items from the handbook for that stage. Each item: checkbox, title, owner, due date, "Add evidence" link.
- **Standards for this stage:** relevant Service Standard points and crosswalk items, collapsed by default. Label: "Standards that apply at this stage ({count})".
- **Exit criteria:** short list. Button when all met: **Move to {next stage}**. If not met: **{n} items left before you can move on.**

**Sprint Zero checklist items** (configured from handbook chapter 7):
1. Squad charter signed off
2. Client Product Owner and steering committee confirmed
3. Development, test and production environments ready with a first deployment
4. Pipeline running build, tests and security scan
5. Wiki set up with the standard structure
6. Outcomes agreed with the Product Owner
7. Backlog ready for two sprints
8. Highest-risk spikes complete and recorded
9. Delivery Plan baselined and 30-day plan shared
10. RAID log opened
11. Change control route agreed

**Moving on with gaps:** secondary link "Move on anyway". Modal:
- **Heading:** Move on with open items?
- **Body:** The open items will be added to the RAID log so you can raise them at the next steering committee.
- **Buttons:** Move on and log risks / Cancel

### 5.8 Engagement: Squad tab

Sections: Shape and roles, Members, Charter, Ceremonies.

**Members table:** Name, Role, Allocation, Start, Roll-off, Tenure, Keel status.
Keel status values: `OK`, `Exception until {date}`, `Exception, no end date` (amber), `Over capacity` (amber).

**Find people (Team Fit) panel:**
- **Heading:** Find people for {role}
- **Subheading:** Ranked by skills fit, delivery rigour and availability.
- Each result: name, DDaT role and level, fit score (0 to 100), availability date, current engagements, "Why this person" expandable.
- "Why this person" copy pattern: Strong match on {skill 1} and {skill 2}. Available from {date}. Has worked in a {shape} before. Gap: {skill}, covered by the {pathway} pathway.
- **Button:** Assign
- **Keel warning modal (if rule broken):**
  - **Heading:** This breaks a Keel rule
  - **Body:** {Rule sentence}. You can request an exception. It needs approval from the Head of Delivery and an end date.
  - Fields: Reason, End date
  - **Buttons:** Request exception / Choose someone else

**Charter** (structured form, generated document):
- **Heading:** Squad charter
- **Subheading:** One page the whole squad agrees in Sprint Zero. Review it every third retrospective.
- Sections: Purpose, People, Ways of working, Ceremonies, Definitions, Decisions, Agreements, Deviations
- **Button:** Draft with Assemble (co-pilot)
- **Button:** Mark as agreed
- **Badge after agreement:** Agreed on {date}. Next review {date}.

**Ceremonies:** pre-filled from Squad Blueprint (stand-up, planning, refinement, technical call, show and tell, retrospective, 15 minutes of fame) with day, time and length. Toggle to include or exclude. Button: **Add to calendars** [later integration].

### 5.9 Engagement: Plan tab

- **Delivery Plan:** phases on a horizontal timeline, milestones as markers, payment-linked milestones with a £ icon.
- **Milestone status values:** On time, At risk, Late, Re-planned (agreed {date}).
- **30-day plan card:** Next two sprint goals, Milestones in the next 30 days with confidence (High, Medium, Low), Dependencies, Top three risks, Decisions needed.
- **Button:** Share 30-day plan (creates read-only link)
- **Empty state:** "No milestones yet. Add the milestones from your contract or statement of work."

### 5.10 Engagement: Compass tab

- **Heading:** Delivery Compass
- **Subheading:** Four measures, one status, updated monthly.
- **Status selector** (Squad Lead only): On track, At risk, Off track. Required note: "Why?"
- **If At risk selected:** prompt "Add a recovery plan within a week." Opens recovery plan form: What is off track, Cause, Actions (owner, date), What we need from others, Back to green by.
- **If Off track selected:** prompt "Book a risk lock within 48 hours and tell the steering committee." Buttons: Book risk lock, Notify Delivery Lead.
- **Measure cards** with trend charts (three to six months).
- **Surveys:**
  - Team health check. Button: Send this month's check. Status: {n} of {m} responses.
  - Client pulse. Button: Send this month's pulse. Status: Sent {date}, response received {date}.
- **Monthly report:** Button **Draft monthly report**. Produces the one-page report (Status, Measures, Progress, Risks and issues, Decisions needed, Commercials, Highlight). Editable, then **Submit to Delivery Lead**.

**Team health check survey copy** (sent to squad, anonymous):
- **Intro:** This takes two minutes and is anonymous. It helps us spot problems early.
- Questions (1 to 5, Strongly disagree to Strongly agree):
  1. I understand what we are trying to achieve and why
  2. Our workload is sustainable
  3. I can raise problems without worrying about how it will land
  4. I have the skills and support I need
  5. We work well together as a squad
  6. I am proud of the quality of what we deliver
- Optional: Anything else we should know?
- **Thank you:** Thanks. Your answers are combined with your squad's and never shown individually.

**Client pulse copy:**
- **Intro:** Four quick questions about how we are doing this month.
- Questions (1 to 5):
  1. How satisfied are you with what the team delivered this month?
  2. How well do we communicate and keep you informed?
  3. How confident are you that we will deliver what was agreed?
  4. How likely are you to recommend us to a colleague?
- Optional: What should we do differently?
- **Thank you:** Thank you. Your Account Manager will follow up on any comments.

### 5.11 Engagement: Decisions tab

Sub-tabs: RAID, Steering committees, Risk locks, Decisions log.

**RAID**
- **Heading:** RAID log
- **Subheading:** Risks, assumptions, issues and dependencies. Review it weekly with the squad.
- Columns: Type, Title, Owner, Rating, Action, Due, Status
- Type helper text on hover:
  - Risk: Something that might happen and would hurt delivery.
  - Assumption: Something we are treating as true without proof.
  - Issue: Something that has happened and is hurting delivery.
  - Dependency: Something we need from someone else.
- **Button:** Add item
- **Nudge on assumptions older than 4 weeks:** "Test this assumption. If it is false, turn it into an issue."

**Steering committees**
- **Heading:** Steering committees
- **Subheading:** For decisions, not updates.
- List of meetings with date, status (Pack ready, Pack not ready, Held), decisions count.
- **Button:** Draft pack (co-pilot). Generates the five-page pack: Summary and decisions needed, Measures and progress, Risks and issues, Change requests with options, Commercials.
- **After meeting:** "Record decisions". Each decision: decision text, owner, date. Button: **Send confirmation email**. Helper: "Confirm every decision in writing within one working day."

**Risk locks**
- **Heading:** Risk locks
- **Subheading:** Thirty minutes, one blocker, one decision.
- **Button:** Call a risk lock
- Form: What is blocked and the impact, Since when, Attendees (max six), Cause, Options (at least two), Decision, Owner, Date, Escalate to steering committee? (Yes, No)
- **Helper:** Book it within 48 hours. If it cannot be resolved, escalate with a recommended option.

**Decisions log:** read-only list of every decision from steering committees and risk locks.

### 5.12 Engagement: Change tab

Sub-tabs: Change requests, Aftercare, Support.

**Change requests**
- **Heading:** Change requests
- **Subheading:** Change is welcome. It is traded or agreed, never absorbed.
- Pipeline columns: Submitted, Triaged, Assessed, Decided
- **Button:** New change request
- Form fields: What is being requested, and why; Who it affects; How urgent
- **Triage step:** "Is this a change, a defect or a support request?" Options with help:
  - Change: Adds, alters or removes how the product behaves, its structure or what it produces.
  - Defect: Does not match what was agreed. Fixed under warranty or aftercare.
  - Support: Routine operation within agreed tolerances.
- **Button:** Suggest with Assemble (co-pilot triage with reasons)
- **Assess step:** Effort, Cost, Impact on dates and milestones, Technical risks, Options (Now, Later phase, Reduced version)
- **Approval routing** shown automatically based on Config: "This change is above the £{threshold} threshold and affects a milestone. It needs a steering committee decision."
- **Decided:** Approved, Deferred, Rejected; Approved by; Date. Banner: "Approved. Added to the Delivery Plan and change log."
- **Absorbed changes counter** (Compass): "Changes absorbed without agreement: {n}". Target 0.

**Aftercare**
- **Heading:** Aftercare
- **Subheading:** Agree it before go-live, not at go-live.
- **If none:** "No aftercare agreed yet. Go-live is on {date}." Button: **Set up aftercare**
- SLA builder: Model (Warranty, Retained support, Pay as you go, Managed service), Hours, Service levels table pre-filled with P1 to P4 defaults, Included change hours, Start, End, Review date.
- **Keel check on SLA:** "You have committed to a 1-hour P1 response. Make sure the aftercare team can staff it."
- **Button:** Generate SLA document

**Support**
- Ticket list: Ref, Priority, Raised, Responded, Resolved, Within SLA (Yes, No).
- **Monthly aftercare report** button: Draft aftercare report.

### 5.13 Engagement: Standards tab

- **Heading:** Standards
- **Subheading:** The standards that apply to this engagement, mapped to where they matter in the lifecycle.
- **Framework chips** (toggle which apply): GDS Service Standard, DSSfW, Technology Code of Practice, NISTA gateway, ISO 19650, Construction Playbook, Building Safety Act golden thread
- **View options:** By stage (default), By framework
- Each point: title, plain-English summary, status (Not started, In progress, Evidenced, Not applicable), evidence links, linked crosswalk items.
- **Crosswalk panel:** "This point also supports: {list}". Helper: "Evidence once, use it for every framework that needs it."
- **Button:** Prepare for assessment (generates a readiness summary for the next service assessment or gateway)

### 5.14 People (The Keel)

- **Page title:** People
- **Subtitle:** Who is where, how much they carry and for how long.
- Sub-tabs: Resource plan, Demand, Exceptions, Scenarios

**Resource plan:** timeline (six months) with one row per person and bars for assignments. Utilisation column with colour bands: under 75% (blue outline), 75 to 85% (blue), over 85% (amber).

**Demand:** list of unfilled roles from bids and engagements. Columns: Role, Engagement or bid, Start, Duration, Confidence, Suggested people.
- **Button:** Log demand
- **Priority order helper:** "When demand exceeds supply we prioritise: live engagements at risk, aftercare under SLA, signed engagements, likely bids, internal work."

**Exceptions:** list with Person, Rule broken, Engagement, Approved by, End date, Status.
- Row warning when no end date: "An exception without an end date is a new assignment. Set an end date or reassign."

**Scenarios** (from org design tool): "Plan a scenario" to test moves before committing. Copy: "Try out moves without changing the real plan. Compare scenarios side by side."

**Weekly resourcing view:** Button **Prepare resourcing meeting** generates the agenda: new demand, roll-offs in eight weeks, decisions needed, open exceptions, learning time at risk.

### 5.15 Capability (The Forge)

- **Page title:** Capability
- **Subtitle:** Skills, pathways and certification across your teams.
- Sub-tabs: My pathway, Teams, Modules, Communities

**My pathway:** progress through foundation modules and role pathway. Status pill: TFC certified (date), In progress, Not started.
- **Next step card:** "Next: {module}. Practical task due {date}."

**Teams:** heatmap of DDaT skills by squad. Gaps highlighted. Each gap row: "Gap in {skill} on {squad}. Suggested: {pathway module} for {person}."

**Modules:** library of Forge modules with objectives and practical tasks.

**Communities:** list of Communities of Practice, lead, next session, notes link.

### 5.16 Playbook

- **Page title:** Playbook
- **Subtitle:** Every template, checklist and standard we use, in one place.
- Sections: Handbook (the nine chapters, readable in-app), Templates (charter, Delivery Plan, 30-day plan, RAID, spike card, steering pack, risk lock record, change request, Handover Pack, aftercare SLA), Checklists (Sprint Zero exit, Definition of Ready, Definition of Done, Compliance, Governance), Cheat sheet (product language in plain English).
- **Search placeholder:** Search the playbook
- Each template: **Use in an engagement** button.

**Spikes** (also available inside engagements, under Plan):
- **Button:** New spike
- Spike card fields: Question, Why it matters, Time box (days), Done looks like, Owner, Answer, Follow-on work
- **Helper on Question field:** "Write one specific question. 'Can we read P6 data through the API at nightly volumes?' not 'Look into P6'."
- **On close:** "Add the answer and follow-on work before closing. Findings that stay in someone's head are lost."

### 5.17 Portfolio (Delivery Compass across engagements)

- **Page title:** Portfolio
- **Subtitle:** Every engagement's health at a glance.
- Summary strip: {n} on track, {n} at risk, {n} off track.
- Table: Engagement, Stage, Status, four measures with arrows, Squad Lead, Last report.
- **Trends panel:** "Patterns across squads". Examples of generated insight copy:
  - "Three squads have team health below 4 in the last month. Common factor: Keel exceptions without end dates."
  - "Definition of Done adherence has fallen on two data platform squads. Consider a data Community of Practice session."
- **Button:** Prepare monthly review (agenda: portfolio by status, recovery plans, trends, capacity issues, actions for Forge or Playbook)
- **Button:** Draft quarterly practice report

### 5.18 Standards library

- **Page title:** Standards
- **Subtitle:** The frameworks we work to, and how they connect.
- Framework list with descriptions.
- **Crosswalk explorer:** pick a point in one framework and see where it maps in the others.
- Helper: "Assemble maps the GDS Service Standard to TCoP, NISTA, ISO 19650, the Construction Playbook and the Building Safety Act golden thread, so you can evidence once and reuse."

### 5.19 Ask Assemble (co-pilot panel)

- **Panel title:** Ask Assemble
- **Placeholder:** Ask about this engagement, or ask Assemble to draft something
- **Suggested prompts** (context-aware chips):
  - Draft the squad charter
  - Draft this month's report
  - Draft the steering committee pack
  - Is this a change or a defect?
  - Suggest people for the Technical Lead role
  - What is blocking Sprint Zero?
  - Which standards apply at this stage?
- **Disclaimer under input:** Assemble drafts; you decide. Check anything before you share it.

### 5.20 Settings

Sections: Organisation, Members and roles, Configuration (handbook thresholds), Integrations, Branding.

**Configuration** copy:
- **Heading:** Delivery rules
- **Subheading:** These come from your delivery handbook. Change them here when the handbook changes.
- Fields with defaults: Planned utilisation (80%), Minimum tenure (3 months), Max concurrent engagements per role, Sprint length (2 weeks), Compass targets, Risk lock window (48 hours), Change approval threshold, SLA defaults.

**Integrations** (later): Jira, Azure DevOps, Microsoft 365 calendar, Teams, EmberNest.
- EmberNest card copy: "Bring code quality and AI delivery evidence from EmberNest into Delivery Compass."

### 5.21 Global empty, error and system states

| State | Copy |
| --- | --- |
| Generic empty list | Nothing here yet. |
| No search results | No results for "{query}". Try a different word. |
| Permission denied | You do not have access to this. Ask your Delivery Lead or an admin. |
| Network error | Something went wrong. Your changes are saved. Try again in a moment. |
| Save success | Saved. |
| Unsaved changes | You have unsaved changes. Leave anyway? |
| Delete confirmation | Delete {item}? This cannot be undone. |
| Co-pilot failure | Assemble could not draft this right now. Try again, or start from the template. |

---

## 6. Rules engine (next action and nudges)

The "Next action" and "Needs attention" items come from simple rules over the data. Evaluate in this priority order and show the first match as the engagement's next action.

| Priority | Rule | Next action copy |
| --- | --- | --- |
| 1 | Status is Off track and no risk lock in last 48 hours | Book a risk lock. This engagement is off track. |
| 2 | Status is At risk and no recovery plan | Add a recovery plan this week. |
| 3 | Steering committee within 2 days and pack not ready | Draft the steering committee pack for {date}. |
| 4 | Decision recorded and not confirmed within 1 day | Confirm {n} decisions in writing. |
| 5 | Stage is Sprint Zero and checklist incomplete | Finish {n} Sprint Zero items before {date}. |
| 6 | Change request in Submitted for over 2 days | Triage change request {ref}. |
| 7 | Change request in Triaged for over 5 days | Assess change request {ref}. |
| 8 | Keel exception without end date | Set an end date for {person}'s exception. |
| 9 | Go-live within 30 days and no aftercare SLA | Set up aftercare before go-live on {date}. |
| 10 | Monthly report due within 3 days | Draft this month's report. |
| 11 | Health check or pulse not sent this month | Send this month's {survey}. |
| 12 | Charter review date passed | Review the squad charter at your next retrospective. |
| 13 | Nothing else | You are on track. Next milestone: {milestone} on {date}. |

RAG suggestion (Squad Lead confirms): Off track if two or more measures below target or a milestone will be missed; At risk if one measure below target; otherwise On track.

---

## 7. AI co-pilot specification

Use the existing OpenAI-backed co-pilot. Every generation must be grounded in engagement data and handbook templates, editable before saving, and labelled "Draft".

### 7.1 System prompt (shared)

```
You are Assemble, a delivery assistant for Turner & Townsend squads.
Follow the DAA Delivery Handbook (Agile WOW). Use UK spelling and plain English.
Do not use em dashes. Keep sentences under 25 words.
Only use facts from the engagement data provided. If something is missing, say what is missing instead of inventing it.
Write as the Squad Lead, in the first person plural ("we").
```

### 7.2 Generation tasks

| Task | Inputs | Output format |
| --- | --- | --- |
| Draft squad charter | Engagement, outcomes, squad, ceremonies, client roles | Charter sections (Purpose, People, Ways of working, Ceremonies, Definitions, Decisions, Agreements, Deviations) |
| Draft monthly report | Measure snapshots, milestones, RAID top 3, change requests, commercials | One page: Status, Measures, Progress, Risks and issues, Decisions needed, Commercials, Highlight. First line says whether to worry |
| Draft steering pack | As above plus open change requests with options | Five sections, decisions needed on page one |
| Triage request | Request text, scope, SLA definitions | Change, Defect or Support, with a two-sentence reason and confidence |
| Suggest people | Role, required DDaT skills, rigour weighting, availability, Keel rules | Ranked list with "Why this person" sentences; never suggest someone who breaks a Keel rule without saying so |
| Spike to backlog | Spike answer | List of stories and technical tasks, plus any new RAID items |
| Standards readiness | Standards assessments and evidence | Readiness summary by point: ready, gaps, suggested evidence |
| Portfolio patterns | All measure snapshots and exceptions | Up to three pattern sentences, each with a suggested action |

### 7.3 Guardrails

- Never send personal survey answers to the model; send only aggregated scores.
- Never include client confidential data in prompts unless the organisation has enabled it in Settings.
- Show "Draft" until a person saves it.

---

## 8. Design system

### 8.1 Colour

Use the blues from turnerandtownsend.com. Confirm exact hex values from the live site before build; the values below are working tokens.

| Token | Use | Working value |
| --- | --- | --- |
| `--brand-navy` | Sidebar, headings | #0B2341 [confirm] |
| `--brand-blue` | Primary buttons, links, active states | #0057B8 [confirm] |
| `--brand-sky` | Highlights, selected rows, lifecycle current stage | #DCEBFA [confirm] |
| `--neutral-900` | Body text | #1B1F24 |
| `--neutral-600` | Secondary text | #5B6570 |
| `--neutral-100` | Page background | #F6F8FA |
| `--status-green` | On track only | #1E7B4C |
| `--status-amber` | At risk only | #B26B00 |
| `--status-red` | Off track only | #B42318 |

Status colours must always appear with a text label, never colour alone.

### 8.2 Typography

- Headings and body: Inter (or the T&T web font if licensed).
- Scale: 28 page title, 20 section heading, 16 card title, 14 body, 12 meta.
- Sentence case everywhere.

### 8.3 Components (shadcn/ui based)

| Component | Notes |
| --- | --- |
| Lifecycle bar | Seven steps, current filled, completed ticked, clickable |
| RAG pill | Label plus colour: On track, At risk, Off track |
| Next action card | Navy left border, one sentence, one button |
| Measure tile | Value, target, trend arrow, tooltip |
| Checklist item | Checkbox, title, owner avatar, due date, evidence link |
| Attention row | Icon, sentence, engagement chip, action button |
| Keel status badge | OK, Exception until date, Exception no end date, Over capacity |
| Co-pilot panel | Right-side drawer, suggested prompt chips, "Draft" label on outputs |

### 8.4 Layout

- Left sidebar 240px, collapsible.
- Content max width 1200px.
- Engagement pages: header, lifecycle bar, tabs, content.
- Mobile: sidebar becomes bottom navigation with Home, Engagements, People, Ask.

### 8.5 Accessibility

- WCAG 2.2 AA throughout.
- Keyboard access to every action, visible focus states.
- Charts have a table alternative.
- Plain-English labels; no meaning carried by colour alone.

---

## 9. Marketing and landing copy refresh

For the Assemble landing page (public or internal launch page).

### 9.1 Hero

- **Headline:** Assemble great delivery teams, then keep them great.
- **Subheadline:** Assemble helps you staff, set up and assure delivery teams, from bid to aftercare, with public sector rigour built in.
- **Primary button:** See the demo
- **Secondary button:** Book a walkthrough

### 9.2 Three-part value strip

1. **Build the right team.** Match people to roles on skills, rigour and availability, without overloading anyone.
2. **Start every engagement well.** Squad shapes, charters and a Sprint Zero checklist mean no more slow, messy starts.
3. **See trouble early.** Four measures, one status and a clear next action on every engagement.

### 9.3 How it works

- **Shape.** Check you can staff the work and set up governance before you sign.
- **Set up.** Pick a squad shape. Assemble drafts the charter, plan and checklist.
- **Deliver.** Track predictability, quality, team health and client satisfaction every month.
- **Decide.** Run steering committees and risk locks that end in decisions, not updates.
- **Support.** Agree aftercare before go-live and handle change without absorbing it.

### 9.4 Standards section

- **Heading:** Evidence once, satisfy every framework
- **Body:** Assemble maps the GDS Service Standard to the Technology Code of Practice, NISTA gateway reviews, ISO 19650, the Construction Playbook and the Building Safety Act golden thread. Record evidence where the work happens and reuse it wherever it is needed.

### 9.5 Built on real delivery practice

- **Heading:** Built on how we actually deliver
- **Body:** Assemble encodes Agile WOW, Turner & Townsend's delivery playbook for teams that need agility and rigour at the same time. The rules, templates and checklists come from live engagements, not theory.

### 9.6 Closing call to action

- **Heading:** See an engagement from bid to aftercare in ten minutes
- **Button:** See the demo

### 9.7 Short descriptions

- **One line:** Assemble is how Turner & Townsend sets up, runs and assures delivery teams.
- **25 words:** Assemble helps delivery leaders staff the right teams, start engagements well and spot trouble early, with GDS and construction standards built into every stage.
- **50 words:** Assemble brings team building, delivery governance and standards assurance into one place. It matches people to roles without overloading them, sets up every engagement from proven templates, tracks four simple health measures, and maps evidence across GDS, TCoP, NISTA, ISO 19650 and the golden thread. Built on Turner & Townsend's Agile WOW playbook.

---

## 10. Demo engagement (seed data)

Seed one demo engagement in the Turner & Townsend Demo organisation, following the handbook's worked example. Label it clearly as illustrative.

| Field | Value |
| --- | --- |
| Name | Finance and projects data platform (demo) |
| Client | Example County Council (fictional) |
| Shape | Data platform squad |
| Commercial | Fixed price, three payment milestones |
| Length | 20 weeks |
| Current stage | Beta, week 12 |
| Status | At risk |

Story beats to seed so the demo shows every module:

1. Shape: The Keel shows an existing squad rolling off in three weeks; assigned whole.
2. Sprint Zero: checklist complete; spike on the finance API found rate limits; Architecture Decision Record linked.
3. Week 10: change request CR-004 for two new data sources; steering committee chose to fund one and defer one.
4. Week 12: team health dropped to 3.4 ("Our workload is sustainable" at 2.6); Keel exception for one engineer has no end date; status At risk; recovery plan drafted.
5. Week 14 (future, scripted in demo): risk lock on a firewall dependency.
6. Standards: Service Standard points 1 to 7 evidenced; crosswalk shows ISO 19650 and golden thread links for the data lineage evidence.
7. Aftercare: SLA not yet set up; Home shows "Set up aftercare before go-live".

Demo script (ten minutes): Home → Needs attention → open engagement → lifecycle and next action → Compass (health dip) → People (exception, set end date) → Decisions (draft steering pack) → Change (CR-004 history) → Standards (crosswalk) → Aftercare (set up SLA).

---

## 11. Build plan

### 11.1 Phases

| Phase | Scope | Done when |
| --- | --- | --- |
| 0. Audit and clean-up (1 week) | Apply the retire, merge, keep table; remove dead routes | Old navigation removed; every remaining screen maps to a module |
| 1. Spine (2 weeks) | Engagement object, lifecycle bar, Home, Engagements list, New engagement wizard, Overview tab, rules engine | A Squad Lead can create an engagement and see a next action |
| 2. Team and Sprint Zero (2 weeks) | Squad tab, Team Fit integration, Keel rules and exceptions, People module, stage checklists | A squad can be staffed within Keel rules and Sprint Zero tracked to exit |
| 3. Compass (2 weeks) | Measure tiles, surveys, RAG, recovery plans, monthly report draft, Portfolio | Monthly report submitted from the app |
| 4. Decisions and Change (2 weeks) | RAID, steering committees with pack drafts, risk locks, change requests, aftercare SLA, support | Full engagement lifecycle runs end to end |
| 5. Standards and Capability (2 weeks) | Standards tab by stage, crosswalk explorer, Capability module, Playbook | Standards evidenced in context; pathways tracked |
| 6. Polish and demo (1 week) | Seed demo, accessibility pass, copy pass, landing page | Ten-minute demo runs without help |
| Later | Jira and Azure DevOps sync, calendar, Teams notifications, client read-only portal, EmberNest integration | |

### 11.2 Acceptance tests (usable without instruction)

Run each with three to five people who have never used Assemble. Pass if four out of five complete without help.

1. Create a new engagement and choose a squad shape.
2. Assign a person to a role, and request an exception when The Keel blocks it.
3. Find and complete the next Sprint Zero item.
4. Change an engagement's status to At risk and add a recovery plan.
5. Draft and submit a monthly report.
6. Log a client request and triage it as change or defect.
7. Find which standards apply at the current stage.

### 11.3 Engineering notes

- Keep the existing stack: React 18, Vite, shadcn/ui, Express, Drizzle, Neon Postgres, Sentry.
- Replace Replit Auth with Microsoft Entra ID sign-in for T&T users; keep a demo account route.
- All handbook thresholds and checklist items in Config or seed tables, not hard-coded.
- Every co-pilot output stored with its inputs for audit.
- Role-based access: Admin, Delivery Lead, Squad Lead, Member, Client viewer.

---

## 12. Copy style guide (for anyone adding new screens)

| Do | Do not |
| --- | --- |
| "Book a risk lock" | "Initiate risk mitigation workflow" |
| "This breaks a Keel rule" | "Constraint violation detected" |
| "Nothing needs your attention right now" | "No actionable items found" |
| "Draft monthly report" | "Generate report artefact" |
| "On track / At risk / Off track" | "Green / Amber / Red" on its own |
| Explain the why in one short sentence | Long paragraphs of help text |
| Use "we" for the team and "you" for the reader | Passive voice |

Word list:

| Use | Avoid |
| --- | --- |
| Engagement | Project (except when quoting a client) |
| Squad | Resource pool, team unit |
| People | Resources, FTE |
| Change request | Variation, CR form |
| Next action | Task, to-do |
| Draft | Generate, AI output |
