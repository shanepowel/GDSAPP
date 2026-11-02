# Assemble v2 component library

Import everything from `@/components/assemble-v2`. Live examples: `/v2/components`.
Built on Tailwind v4 with `class-variance-authority` (same conventions as shadcn/ui), React 19
server components by default. Client components are marked below.

## Tokens

All colours live in `styles/assemble-v2.css` as `--asm-*` variables and are exposed as Tailwind
utilities with the `asm` prefix. Never write a hex value in a component.

| Utility | Value | Use |
| --- | --- | --- |
| `bg-asm-brand` / `text-asm-brand` | #1E4479 | T&T corporate blue: sidebar, hero, headings, primary buttons |
| `asm-brand-hover` | #16335C | Hover and active states on brand |
| `asm-brand-deep` | #0F2647 | Deep panels that need to stand apart from brand |
| `asm-brand-mid` | #3D6AA8 | Accent buttons on brand backgrounds |
| `asm-brand-soft` / `asm-brand-tint` | #8FAAD1 / #B7CBE8 | Marks, eyebrows and secondary text on brand |
| `asm-brand-wash` / `asm-brand-wash-2` | #EEF3F9 / #E3EBF5 | Soft fills, selected rows |
| `asm-black` | #000006 | T&T near-black: footer |
| `asm-canvas`, `asm-surface`, `asm-sunk` | Page, card, inset surfaces | |
| `asm-line`, `asm-line-soft`, `asm-line-strong` | Borders and dividers | |
| `asm-ink`, `asm-ink-2`, `asm-ink-3` | Body, secondary, muted text (all 4.5:1 or better on white) | |
| `asm-ok*`, `asm-warn*`, `asm-risk*` | Status only, always with a glyph and a label | |
| `rounded-asm`, `rounded-asm-lg` | 10px, 14px | |
| `shadow-asm-pop` | Floating panels only | |

Wrap any v2 surface in `.asm-root` (the v2 layout already does). It hands heading and table-header
styling back to Tailwind utilities, because the legacy global heading rules are unlayered.

## Primitives

| Component | Props | Use it for | Rules |
| --- | --- | --- | --- |
| `Button` | `variant`: primary, secondary, ghost, inverse, inverse-outline, accent · `size`: sm, md, lg | Actions | One primary per card or screen. `inverse*` and `accent` only on brand surfaces |
| `ButtonLink` | Same as Button plus Next `Link` props | Navigation that looks like a button | |
| `Card`, `CardHeader`, `CardBody`, `CardFooter` | `CardHeader`: `title`, `description`, `action`, `id` | Every boxed section | Give the Card `aria-labelledby` matching the header `id` |
| `Badge` | `tone`: neutral, brand, ok, warn, risk, inverse | Small labels | Status tones need words that name the state |
| `Field` | `id`, `label`, `hint` | Wraps every form control | Persistent visible label; link the hint with `aria-describedby="{id}-hint"` |
| `Input`, `Textarea`, `Select` | Native props | Form controls | 44px minimum height |
| `Table`, `TableScroll`, `Th`, `Td` | `TableScroll.minWidth` | Data tables | Always wrap in `TableScroll` so wide tables scroll inside the card |
| `ProgressBar` | `value`, `label` | Progress | `label` states the value in words |
| `Avatar` | `initials`, `size` | People | Decorative; the name is always shown beside it |
| `EmptyState` | `title`, `body`, `action` | Empty lists | An invitation, why it matters, one action |
| `PageHeader` | `title`, `subtitle`, `actions`, `eyebrow` | Top of every top-level screen | One per screen, up to two actions |
| `StatTile` | `label`, `value`, `note`, `tone` | Headline numbers | `tone="warn"` only with a note that says why |
| `Stepper` | `steps`, `current` | Wizards | |

## Assemble components

| Component | Props | Use it for | Notes |
| --- | --- | --- | --- |
| `AppShell` | `children`, `user` | Signed-in layout | Sidebar stacks above content on small screens. Includes skip link |
| `SidebarNav` (client) | none | Primary navigation | Active item from the URL. Edit `NAV` to change the menu |
| `TabNav` (client) | `items`, `label` | Section tabs | Active tab is the longest matching href |
| `AskAssemble` (client) | `variant` | Co-pilot drawer | UI only. Outputs labelled "Draft". Wire per WIRING.md |
| `StatusPill` | `status`: on-track, at-risk, off-track · `size` | Engagement status | Glyph + label + wash. Never colour alone |
| `LifecycleBar` | `stage`, `progressLabel`, `variant`: full, compact | The lifecycle spine | Full above engagement tabs; compact on cards |
| `NextActionCard` | `action`, `emphasis`: hero, soft, `secondary` | The one thing to do next | `action` always comes from `nextActionFor()` |
| `AttentionRow` | `icon`, `tone`, `text`, `context`, `cta`, `href` | Home "Needs attention" | Render inside a `<ul>` |
| `EngagementCard` | `engagement` | Home and lists | |
| `MeasureTile` | `label`, `value`, `onTarget`, `trend`, `trendLabel`, `footnote`, `lowerIsBetter` | Delivery Compass measures | Use `measureTiles()` from `lib/assemble-v2/measures.ts` to build props |
| `Sparkline` | `values`, `label`, `tone`, `invert` | Trends | `label` is a sentence for screen readers |
| `Checklist` (client) | `items` | Stage checklists | Local state now; wire to a mutation |
| `KeelBadge` | `status` | Keel rule status per assignment | |
| `ResourceTimeline`, `ResourceLegend` | `months`, `people`, `assignments` | The Keel resource plan | Six-column month grid, scrolls on small screens |
| `FitCandidateCard` | `candidate`, `person`, `primary` | Team Fit results | Score comes from `lib/scoring`; never compute in a component |
| `CrosswalkPanel` | `point` | A standard point, its evidence and crosswalk | |
| `StatusControl` (client) | `initial`, `suggested` | Squad Lead sets status; recovery plan; risk lock prompt | Assemble suggests, the person decides |
| `AssembleMark`, `AssembleLockup`, `TurnerTownsendLogo` | `size` / `height` | Brand | The Assemble mark is a placeholder until a final mark is designed |

## Writing new components

1. Server component unless it needs state or browser APIs.
2. Tokens only. If you need a colour that does not exist, add a token to `styles/assemble-v2.css`.
3. Every interactive element is a real `<button>`, `<a href>` or form control, with a visible focus state.
4. Status always pairs colour with a glyph and words.
5. Add it to `index.ts`, this file, and `/v2/components`.
6. Copy follows SPEC.md section 12: sentence case, UK spelling, no em dashes, say what happens.
