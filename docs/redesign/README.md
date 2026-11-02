# Assemble redesign: how the UI is built

The redesign is merged into the live app. There is one component library, one theme and one set of
routes. The earlier `/v2` prototype has been removed; it is in git history at commit `20d46ea` if you
need to look at a screen that has not been rebuilt yet.

Product and copy direction is in [SPEC.md](SPEC.md).

## Theme

- Brand: Turner & Townsend. Primary `#1e4479`, white `#ffffff`, dark `#000006`.
- Every colour lives in `styles/tokens.css`. The `--asm-*` block at the end is the redesign palette.
- `styles/library-theme.css` maps those variables to Tailwind utilities (`bg-asm-brand`,
  `text-asm-ink-3`, `rounded-asm-lg`, `shadow-asm-pop` and so on). It contains no hex values.
- Wrap a screen in `asm-root` so legacy global heading styles do not override library headings.

## Library: `components/library`

Import from `@/components/library` or the file directly. The live catalogue is at
`/practice/components`, with a user need, sizing rule and accessibility note for each component
(`components/library/guides.ts`). `tests/component-library.test.ts` checks every component has a guide.

| Component | Use it for |
|---|---|
| Button, ButtonLink | Actions. Variants: primary, secondary, tertiary, ghost, destructive, inverse, inverse-outline, accent. Sizes sm, md, lg. |
| Field, TextInput, TextArea, SelectInput | Every form control. Field wires the label, hint and error. |
| Card, CardHeader, CardBody, CardFooter | Any titled section. Forms put their submit in CardFooter. |
| PageHeader | The h1 and main actions on list and form screens. |
| DeliveryStatus | Engagement status. Glyph, label and wash, never colour alone. |
| Badge | Types and short states (RAID type, milestone state, payment linked). |
| LifecycleBar | The seven-stage lifecycle. `full` above engagement tabs, `compact` in cards. |
| NextActionCard | The one next action. `hero` on the overview, `soft` in cards. |
| MeasureTile, Sparkline | Delivery Compass measures with trend and target. |
| StatTile | Headline counts. |
| AttentionRow | A row in Needs attention: icon, sentence, context, one action. |
| Table, TableScroll, Th, Td | Lists of records. |
| Checklist | Controlled stage checklist. The caller saves each toggle. |
| Stepper | Wizard progress. |
| EmptyState, ProgressBar, Avatar | As named. |
| AssembleMark, AssembleLockup, TurnerTownsendLogo | Brand marks. |
| Stack, Cluster, Grid, Inset, Measure, Heading, Text, Panel | The original layout and type primitives. Still supported. |

Rules that still hold: tokens only, status is glyph plus label plus wash, every string comes from
`lib/copy.ts` and `lib/copy.cy.ts`, scoring stays in `lib/scoring`, AI proposes and people decide.

## Screens rebuilt on the library

| Route | File |
|---|---|
| `/` signed out | `components/practice/HomeLanding.tsx` (marketing) |
| `/` signed in | `components/home/AttentionHome.tsx` |
| `/squads` | `app/(app)/squads/page.tsx` |
| `/engagements/new` | `app/(app)/engagements/new/page.tsx` |
| `/squads/[id]/overview`, `plan`, `compass`, `decisions`, `change`, `stage/[stage]` | `components/engagement/screens.tsx` |
| Shell (sidebar, context bar) | `components/shell/AppShell.tsx` |
| `/practice/components` | `components/library/Catalogue.tsx` |

Every other screen (People, Capability, Playbook, Portfolio, Standards, Settings, profile,
benchmarking, handover and the rest) is brought into the same look in two places, so it does not
need its own rebuild to match:

- `components/datum/PageChrome.tsx`: PageHeader, StatStrip, EmptyState and TextLink use the library styles.
- `app/globals.css`, "Redesign overrides for legacy classes": `.sheet` tables, `.flag` pills,
  teaching panels and figures, role cards, the tour bar and teaching buttons.

The Squad and Standards tabs (`/squads/[id]`, `/assurance/[id]`) sit inside `SpineFrame`, so they
share the engagement header, lifecycle and tabs. When you next touch one of these screens, move its
markup onto library components rather than adding more global CSS.

The locked rules were updated for this direction: see `.cursor/rules/00-assemble-core.mdc` and
`10-ui-and-a11y.mdc` (radius, pills, no signal pink, RAID log in scope, delivery vocabulary).

## Data

All engagement screens read `trpc.spine.get` and write through the `spine.*` mutations in
`lib/trpc/routers/spine.ts`. Compass readings are stored in `EngagementMeasure` (one row per
engagement per month) and written by `spine.recordMeasures`. Readings below target feed
`measuresBelowTarget` in the attention facts.

## Demo

Every deploy runs `npm run seed:spine` (in the build command). It loads the delivery spine demo
data (`scripts/seed-spine-demo.ts`) into the two NRW demo engagements: checklist, milestones, RAID,
decisions, change requests, status and six months of Compass readings. It only runs when those
engagements exist and have no spine data yet, so it never overwrites what someone has entered,
and it never fails the build.

- `npm run seed:demo` creates the demo organisation and engagements from scratch (and the spine data).
- `npm run seed:spine:reset` reloads the spine data and rolls its dates forward to today.

Dates are relative to the day you seed. Sign in with `/api/auth/demo` or `admin@demo.local` / `demo-password`.
