/**
 * Implementation guide for the component library.
 *
 * Principle names follow the Government Digital Service design principles.
 * Explanatory prose is written for this codebase. It is English, the same
 * language as the build specification, and the catalogue marks it lang="en"
 * when the interface is Welsh.
 *
 * Service Standard point numbers are references, stored here as data.
 * Do not hardcode a point count in a component.
 */

import type { GdsPointRef } from '@/lib/bridge/gds';

export const PRINCIPLE_IDS = [
  'user-needs',
  'do-less',
  'design-with-data',
  'make-simple',
  'iterate',
  'everyone',
  'context',
  'services-not-websites',
  'consistent',
  'open',
] as const;

export type PrincipleId = (typeof PRINCIPLE_IDS)[number];

export interface DesignPrinciple {
  id: PrincipleId;
  name: string;
  nameCy: string;
  statement: string;
  assemble: string;
  serviceStandard: readonly GdsPointRef[];
}

export const GDS_PRINCIPLES: readonly DesignPrinciple[] = [
  {
    id: 'user-needs',
    name: 'Start with user needs',
    nameCy: 'Dechrau gydag anghenion defnyddwyr',
    statement:
      'A component starts from the job a person is trying to do: a reviewer tracing a judgement, a delivery lead assembling a squad, or someone completing a form.',
    assemble:
      'Every component guide opens with that need. A control with no named user is not ready to ship.',
    serviceStandard: [1],
  },
  {
    id: 'do-less',
    name: 'Do less',
    nameCy: 'Gwneud llai',
    statement:
      'Build only the interface this service needs. Do not recreate a backlog, a document store, or a second design system beside this one.',
    assemble:
      'The library standardises sizing and the controls screens share. Scoring stays in lib/scoring. Standards stay in the database.',
    serviceStandard: [2, 11],
  },
  {
    id: 'design-with-data',
    name: 'Design with data',
    nameCy: 'Dylunio gyda data',
    statement:
      'Sizes, type roles and standards are data. A screen does not invent a spacing value, a type size, or a criterion count.',
    assemble:
      'Gap and padding accept the spacing scale only. An index with insufficient evidence renders as a dash, never as zero.',
    serviceStandard: [10],
  },
  {
    id: 'make-simple',
    name: 'Do the hard work to make it simple',
    nameCy: 'Gwneud y gwaith caled i’w wneud yn syml',
    statement:
      'The underlying model is a chain of criterion, evidence and judgement. The interface asks for one decision at a time and names the fix when something is wrong.',
    assemble:
      'Field keeps a visible label. An error names the field and the correction. Off-scale spacing fails the type checker.',
    serviceStandard: [4],
  },
  {
    id: 'iterate',
    name: 'Iterate. Then iterate again.',
    nameCy: 'Ailadrodd. Yna ailadrodd eto',
    statement:
      'Ship the smallest control that meets the need, watch it in a real task, then change the guide when the rule changes.',
    assemble:
      'The catalogue is the record of the current rule. A build step says what must be true before the next step starts.',
    serviceStandard: [7, 8],
  },
  {
    id: 'everyone',
    name: 'This is for everyone',
    nameCy: 'Mae hyn i bawb',
    statement:
      'Accessible design is the floor, not a later pass. Contrast, focus, target size and text labels ship with the component.',
    assemble:
      'Colour is never the only carrier of a verdict. Focus styling is never removed. Primary actions use the control target height.',
    serviceStandard: [5],
  },
  {
    id: 'context',
    name: 'Understand context',
    nameCy: 'Deall y cyd-destun',
    statement:
      'The same person may be in a gate review on a laptop or on a phone between meetings. The layout has to reflow, including at large zoom.',
    assemble:
      'Grid tracks collapse when the viewport cannot hold them. Reading copy sits in a measure. The shell becomes a single column on a narrow screen.',
    serviceStandard: [1, 3],
  },
  {
    id: 'services-not-websites',
    name: 'Build digital services, not websites',
    nameCy: 'Adeiladu gwasanaethau digidol, nid gwefannau',
    statement:
      'A screen exists to help someone complete the assurance task. Decoration that does not help that task does not belong in the library.',
    assemble:
      'Button names the action. Panel is a ruled surface for a group of related facts, not a card for its own sake.',
    serviceStandard: [2],
  },
  {
    id: 'consistent',
    name: 'Be consistent, not uniform',
    nameCy: 'Bod yn gyson, nid yn unffurf',
    statement:
      'Shared jobs use the same control and the same spacing. A verdict, a gap and a title block stay specific, because they are the product.',
    assemble:
      'New layout uses Stack, Cluster, Grid and Panel. Product components in components/product keep their own meaning on top of that scale.',
    serviceStandard: [3, 13],
  },
  {
    id: 'open',
    name: 'Make things open: it makes things better',
    nameCy: 'Gwneud pethau’n agored: mae’n gwneud pethau’n well',
    statement:
      'The rule for a component is public, next to the component, so a later change can be checked against it.',
    assemble:
      'This guide is on /practice/components. It cites the build sheet step a component belongs to.',
    serviceStandard: [12, 13],
  },
];

export const LIBRARY_COMPONENT_IDS = [
  'stack',
  'cluster',
  'grid',
  'inset',
  'measure',
  'heading',
  'text',
  'button',
  'field',
  'panel',
  'skip-link',
  'card',
  'badge',
  'delivery-status',
  'lifecycle-bar',
  'next-action',
  'measure-tile',
  'attention-row',
  'table',
  'tab-nav',
  'stepper',
  'checklist',
  'empty-state',
  'page-header',
] as const;

export type LibraryComponentId = (typeof LIBRARY_COMPONENT_IDS)[number];

export interface ComponentGuide {
  id: LibraryComponentId;
  name: string;
  userNeed: string;
  whenToUse: string;
  whenNotToUse: string;
  howItWorks: string;
  sizing: string;
  accessibility: string;
  principleIds: readonly PrincipleId[];
  serviceStandard: readonly GdsPointRef[];
}

export const COMPONENT_GUIDES: readonly ComponentGuide[] = [
  {
    id: 'stack',
    name: 'Stack',
    userNeed: 'A person scanning a page needs related blocks to sit in a predictable vertical rhythm.',
    whenToUse: 'Use Stack for sections, form fields and any vertical sequence.',
    whenNotToUse: 'Do not use Stack for a horizontal group of actions. Use Cluster.',
    howItWorks: 'Stack is a column with a gap taken from the spacing scale. It does not add margins of its own.',
    sizing: 'The gap prop accepts a spacing step. The default is 16px.',
    accessibility: 'Set the element to section, ul or ol when that is the right semantics. Do not skip heading levels inside it.',
    principleIds: ['consistent', 'make-simple'],
    serviceStandard: [4, 13],
  },
  {
    id: 'cluster',
    name: 'Cluster',
    userNeed: 'A person choosing an action needs the actions grouped, and the group has to wrap on a narrow screen.',
    whenToUse: 'Use Cluster for buttons, links and short metadata that sit on one line until they cannot.',
    whenNotToUse: 'Do not use Cluster for a form. Labels and controls stack.',
    howItWorks: 'Cluster is a wrapping row. Alignment is start, center, end or baseline.',
    sizing: 'The gap prop accepts a spacing step. The default is 8px.',
    accessibility: 'If the cluster is a list of navigation links, use a list element around it. Each control keeps its own accessible name.',
    principleIds: ['context', 'consistent'],
    serviceStandard: [3, 4],
  },
  {
    id: 'grid',
    name: 'Grid',
    userNeed: 'A person comparing a few peer facts needs them in columns on a wide screen and in a single column when space runs out.',
    whenToUse: 'Use Grid for peer panels and summary facts.',
    whenNotToUse: 'Do not use Grid for a data table. Use a table.',
    howItWorks: 'Tracks use auto-fit. The columns prop sets how narrow a track may get before it wraps, so the grid reflows at large zoom.',
    sizing: 'The gap prop accepts a spacing step. The default is 16px.',
    accessibility: 'Reading order is the DOM order. Do not rely on column position to convey meaning.',
    principleIds: ['context', 'everyone'],
    serviceStandard: [4, 5],
  },
  {
    id: 'inset',
    name: 'Inset',
    userNeed: 'A person reading inside a ruled region needs the text to clear the rule by a known amount.',
    whenToUse: 'Use Inset for padding inside Panel or any ruled region.',
    whenNotToUse: 'Do not use Inset to create a gap between siblings. Use Stack or Cluster.',
    howItWorks: 'Inset sets padding on all sides from one spacing step.',
    sizing: 'The padding prop accepts a spacing step. The default is 16px.',
    accessibility: 'Inset does not change semantics. The parent element carries the role.',
    principleIds: ['consistent'],
    serviceStandard: [13],
  },
  {
    id: 'measure',
    name: 'Measure',
    userNeed: 'A person reading a paragraph needs a line length they can track. A plate needs a maximum width.',
    whenToUse: 'Use Measure around body copy. Use the plate width for a full working area that should not run edge to edge on a very wide monitor.',
    whenNotToUse: 'Do not use Measure around tables or the org graph. Those are full-bleed on purpose.',
    howItWorks: 'Measure sets max-width to the reading measure or the container token.',
    sizing: 'Reading width is 66ch. Plate width is the container token.',
    accessibility: 'The limit is a max-width, so the text still reflows when the viewport is narrower or zoomed.',
    principleIds: ['context', 'everyone'],
    serviceStandard: [4, 5],
  },
  {
    id: 'heading',
    name: 'Heading',
    userNeed: 'A person using headings to move through a page needs one outline, with sizes that mean the same thing on every screen.',
    whenToUse: 'Use Heading for the page title and for section titles.',
    whenNotToUse: 'Do not use a larger Heading to add emphasis inside a paragraph. Use Text.',
    howItWorks: 'Level 1 uses the plate role. Levels 2 and 3 use the section role. The level is the outline, not a new size.',
    sizing: 'Plate is 24px at weight 600. Section is 17px at weight 600. Browser margins are cleared so Stack controls the gap.',
    accessibility: 'Do not skip a level. The accessible name is the heading text.',
    principleIds: ['everyone', 'consistent'],
    serviceStandard: [4, 5],
  },
  {
    id: 'text',
    name: 'Text',
    userNeed: 'A person reading a fact, a label or a reference needs the type role to say what kind of fact it is.',
    whenToUse: 'Use Text for body, labels, title-block metadata, references and the index numeral.',
    whenNotToUse: 'Do not use Text to compute or format an index. Pass the value that scoring already produced.',
    howItWorks: 'The role selects a type token. Index, reference and metadata use tabular numerals.',
    sizing: 'Body is 15px. Label is 13px. Metadata is 11px. Reference is 12px. Index is 40px.',
    accessibility: 'Metadata is not forced into capitals. Sentence case stays intact except where a title block already uses the meta style.',
    principleIds: ['design-with-data', 'consistent'],
    serviceStandard: [4, 5],
  },
  {
    id: 'button',
    name: 'Button',
    userNeed: 'A person committing an action needs a control that says what will happen, at a size they can hit.',
    whenToUse: 'Use Button for actions on the page. Use ButtonLink when the action is navigation that should look like the primary action.',
    whenNotToUse: 'Do not use Button for a judgement. A verdict is a product component with a glyph and a label.',
    howItWorks: 'Variants are primary, secondary, tertiary and destructive. The existing components/ui/Button entry re-exports this control.',
    sizing: 'Medium uses the 44px control target, with 16px inline padding. Small uses the 32px step, still above the 24px minimum, for a dense row.',
    accessibility: 'The accessible name is the button text. Focus uses the global outline and is never removed. Disabled buttons stay in the tab order only when the attribute is set by the caller.',
    principleIds: ['user-needs', 'everyone', 'services-not-websites'],
    serviceStandard: [4, 5],
  },
  {
    id: 'field',
    name: 'Field',
    userNeed: 'A person entering a value needs to know what is asked, what format is expected, and how to fix an error.',
    whenToUse: 'Use Field around TextInput, or around one control that accepts id and aria attributes.',
    whenNotToUse: 'Do not use a placeholder as the label. Do not group two inputs in one Field.',
    howItWorks: 'Field renders a persistent label, an optional hint, the control, and an error. It wires aria-describedby and aria-invalid.',
    sizing: 'The label uses the label role. The control is the 44px target. The stack gap is 4px.',
    accessibility: 'The error has role alert and names the field and the correction. The hint stays visible. Nothing in the field removes the focus outline.',
    principleIds: ['user-needs', 'make-simple', 'everyone'],
    serviceStandard: [4, 5],
  },
  {
    id: 'panel',
    name: 'Panel',
    userNeed: 'A person reading a group of related facts needs a boundary that is a rule, not a shadow or a large radius.',
    whenToUse: 'Use Panel to group a heading and the facts that belong with it. Card now delegates here so existing screens share the radius and the rule.',
    whenNotToUse: 'Do not use Panel as a button. If the region is actionable, put a link or button inside it.',
    howItWorks: 'Panel paints the raised surface, a 1px rule and the radius token. Padding is optional so existing padded screens keep their own spacing classes.',
    sizing: 'When padding is set, it is a spacing step. The default is no extra padding.',
    accessibility: 'Panel is a div. Give it a heading if it starts a section, or an accessible name if it is a region.',
    principleIds: ['consistent', 'services-not-websites'],
    serviceStandard: [4, 13],
  },
  {
    id: 'skip-link',
    name: 'Skip link',
    userNeed: 'A person on a keyboard needs to bypass the navigation and land in the working area.',
    whenToUse: 'Use one Skip link as the first focusable control in a shell.',
    whenNotToUse: 'Do not add a second skip link inside page content. One target, the main element, is enough.',
    howItWorks: 'The link is visually hidden until it receives focus, then it sits at the top of the viewport. The shell main element is the target.',
    sizing: 'On focus, padding is 8px by 16px. The text uses the label role.',
    accessibility: 'The link stays in the tab order. Focus styling is the global outline. The main target is focusable so the skip moves keyboard focus, not only scroll position.',
    principleIds: ['everyone', 'user-needs'],
    serviceStandard: [5],
  },
  {
    id: 'card',
    name: 'Card',
    userNeed: 'A person scanning a screen needs related content grouped under one title so they can find it and skip it.',
    whenToUse: 'Use Card with CardHeader for any titled section: a list, a form, a set of facts. Put the primary action for a form in CardFooter.',
    whenNotToUse: 'Do not nest cards. Do not use a card around a single line of text.',
    howItWorks: 'Card is a white surface with a 1px line and the large radius. CardHeader holds the title, an optional description and one action. CardBody and CardFooter hold content and actions.',
    sizing: 'Header and body padding is 24px by 20px. Footer padding is 24px by 14px.',
    accessibility: 'CardHeader renders an h2. Pass an id and set aria-labelledby on the Card when it is a landmark section.',
    principleIds: ['consistent', 'make-simple'],
    serviceStandard: [4, 5],
  },
  {
    id: 'badge',
    name: 'Badge',
    userNeed: 'A person needs a short label, such as a type or a state, they can read at a glance.',
    whenToUse: 'Use Badge for types (Risk, Issue), payment links and short states.',
    whenNotToUse: 'Do not use a status tone without words that name the state. Do not use Badge as a button.',
    howItWorks: 'Badge is a rounded pill with a tone: neutral, brand, ok, warn, risk or inverse.',
    sizing: '12px text, 10px by 4px padding.',
    accessibility: 'The text is the label. Colour is never the only signal.',
    principleIds: ['consistent', 'everyone'],
    serviceStandard: [4, 5],
  },
  {
    id: 'delivery-status',
    name: 'Delivery status',
    userNeed: 'A person checking an engagement needs to know at once whether it is on track.',
    whenToUse: 'Use DeliveryStatus wherever an engagement status appears.',
    whenNotToUse: 'Do not use it for milestone or change states. Use Badge.',
    howItWorks: 'A glyph, a label from copy and a tinted wash. Three states: on track, at risk, off track.',
    sizing: 'Two sizes. md is the default, sm sits inside tables and cards.',
    accessibility: 'The glyph is hidden from assistive technology. The label carries the meaning. The pill meets the 24px minimum target.',
    principleIds: ['everyone', 'consistent'],
    serviceStandard: [3, 5],
  },
  {
    id: 'lifecycle-bar',
    name: 'Lifecycle bar',
    userNeed: 'A person needs to see where an engagement is in its life and what comes next.',
    whenToUse: 'Use the full bar above engagement tabs. Use the compact variant inside cards.',
    whenNotToUse: 'Do not use it for a form wizard. Use Stepper.',
    howItWorks: 'Seven stages. Done stages are filled and ticked, the current stage is labelled, future stages are outlined. Stages can link to their checklist.',
    sizing: 'Full bar has 96px minimum per stage and wraps. Compact bar is 5px high.',
    accessibility: 'It is an ordered list with aria-current on the current stage. Done and current are announced in words.',
    principleIds: ['context', 'services-not-websites'],
    serviceStandard: [2, 3],
  },
  {
    id: 'next-action',
    name: 'Next action',
    userNeed: 'A person opening an engagement needs one clear thing to do next.',
    whenToUse: 'Use the hero emphasis once at the top of the engagement overview. Use soft emphasis inside cards.',
    whenNotToUse: 'Do not show more than one hero next action on a screen.',
    howItWorks: 'The sentence comes from nextActionSentence(). The action goes to the screen where the person can do it.',
    sizing: 'Hero padding is 28px by 24px.',
    accessibility: 'The hero is a labelled section. The action is a real link with a visible name.',
    principleIds: ['do-less', 'user-needs'],
    serviceStandard: [1, 2],
  },
  {
    id: 'measure-tile',
    name: 'Measure tile',
    userNeed: 'A person needs to see a Compass measure, whether it is on target and which way it is moving.',
    whenToUse: 'Use one tile per Delivery Compass measure.',
    whenNotToUse: 'Do not use it for counts. Use StatTile.',
    howItWorks: 'Value, a state in words, a sparkline when there are two or more readings and a footnote with the target. No reading shows a dash.',
    sizing: 'Tiles sit in a four-column grid that drops to two and one.',
    accessibility: 'The state is text. The sparkline has an accessible label that names the measure and period.',
    principleIds: ['design-with-data', 'everyone'],
    serviceStandard: [10, 11],
  },
  {
    id: 'attention-row',
    name: 'Attention row',
    userNeed: 'A person starting their day needs the items that need them, with one action each.',
    whenToUse: 'Use in the Needs attention list on the home screen.',
    whenNotToUse: 'Do not use it for history or notifications that need no action.',
    howItWorks: 'An icon, a sentence, a context line and one secondary action.',
    sizing: 'Rows are at least 72px high with 24px side padding.',
    accessibility: 'It is a list item. The icon is decorative. The action is a link with a visible name.',
    principleIds: ['do-less', 'user-needs'],
    serviceStandard: [1, 2],
  },
  {
    id: 'table',
    name: 'Table',
    userNeed: 'A person comparing many records needs them in rows and columns.',
    whenToUse: 'Use for engagement lists, milestones and the RAID log. Wrap in TableScroll.',
    whenNotToUse: 'Do not use a table for layout.',
    howItWorks: 'Th and Td primitives on a collapsed table. TableScroll gives a minimum width and scrolls inside the card on narrow screens.',
    sizing: 'Cells are 12px by 14px with 24px at the edges.',
    accessibility: 'Th has scope col. Keep one header row. Use real links in cells.',
    principleIds: ['make-simple', 'everyone'],
    serviceStandard: [4, 5],
  },
  {
    id: 'tab-nav',
    name: 'Tab navigation',
    userNeed: 'A person moving around an engagement needs to see the sections and which one they are on.',
    whenToUse: 'Use EngagementTabs, which follows this pattern, below the engagement header.',
    whenNotToUse: 'Do not use tabs for steps in a process.',
    howItWorks: 'Link tabs. The active tab has a brand underline and aria-current="page".',
    sizing: 'Tabs are at least 44px high and scroll sideways on narrow screens.',
    accessibility: 'It is a nav landmark with a label from copy.',
    principleIds: ['context', 'consistent'],
    serviceStandard: [3, 4],
  },
  {
    id: 'stepper',
    name: 'Stepper',
    userNeed: 'A person filling in a long form needs to know how far through they are.',
    whenToUse: 'Use at the top of the new engagement wizard.',
    whenNotToUse: 'Do not use it for the delivery lifecycle. Use Lifecycle bar.',
    howItWorks: 'Numbered pills. Done steps are tinted, the current step is filled.',
    sizing: 'Pills are 12px by 6px with 8px between.',
    accessibility: 'It is an ordered list with aria-current="step".',
    principleIds: ['context', 'make-simple'],
    serviceStandard: [2, 4],
  },
  {
    id: 'checklist',
    name: 'Checklist',
    userNeed: 'A person running a stage needs to tick items off and see who owns what is left.',
    whenToUse: 'Use for stage checklists.',
    whenNotToUse: 'Do not keep state inside it. The caller saves each toggle.',
    howItWorks: 'Controlled. Pass items and onToggle. Done items are struck through. The meta line shows owner and due date.',
    sizing: 'Rows are at least the control target height.',
    accessibility: 'Each row is a label around a native checkbox.',
    principleIds: ['iterate', 'everyone'],
    serviceStandard: [5, 13],
  },
  {
    id: 'empty-state',
    name: 'Empty state',
    userNeed: 'A person seeing an empty screen needs to know why it is empty and what to do.',
    whenToUse: 'Use when a list has nothing in it yet.',
    whenNotToUse: 'Do not use it for errors.',
    howItWorks: 'A title, a sentence and one action.',
    sizing: '24px by 32px padding with a dashed line.',
    accessibility: 'The title is an h3. The action is a real button or link.',
    principleIds: ['user-needs', 'do-less'],
    serviceStandard: [1, 4],
  },
  {
    id: 'page-header',
    name: 'Page header',
    userNeed: 'A person landing on a screen needs to know where they are and the main thing they can do.',
    whenToUse: 'Use once at the top of every list and form screen.',
    whenNotToUse: 'Do not use it inside a card.',
    howItWorks: 'Title, optional subtitle and up to two actions.',
    sizing: 'Title is 30px.',
    accessibility: 'The title is the page h1.',
    principleIds: ['context', 'consistent'],
    serviceStandard: [3, 4],
  },
];

export interface BuildStep {
  order: number;
  id: string;
  title: string;
  source: string;
  componentIds: readonly LibraryComponentId[];
  principleIds: readonly PrincipleId[];
  doneWhen: string;
}

/** Build sheet order from BUILD.md section 14, with the library pieces each step depends on. */
export const BUILD_STEPS: readonly BuildStep[] = [
  {
    order: 1,
    id: 'scaffold',
    title: 'Scaffold',
    source: 'BUILD.md section 14, step 1',
    componentIds: ['stack', 'measure'],
    principleIds: ['consistent', 'design-with-data'],
    doneWhen: 'Tokens exist, and library spacing rejects every step outside 4, 8, 12, 16, 24, 32 and 48.',
  },
  {
    order: 2,
    id: 'schema',
    title: 'Schema and migration',
    source: 'BUILD.md section 14, step 2',
    componentIds: [],
    principleIds: ['design-with-data'],
    doneWhen: 'The schema is migrated. No component stores a criterion count.',
  },
  {
    order: 3,
    id: 'ingest',
    title: 'Capability framework ingest',
    source: 'BUILD.md section 14, step 3',
    componentIds: [],
    principleIds: ['design-with-data', 'open'],
    doneWhen: 'Role and skill names come from the ingested framework, not from a component.',
  },
  {
    order: 4,
    id: 'standards',
    title: 'Standards seed',
    source: 'BUILD.md section 14, step 4',
    componentIds: [],
    principleIds: ['design-with-data'],
    doneWhen: 'Standards are rows. The library stores Service Standard point references as data on a guide, not as a count in a component.',
  },
  {
    order: 5,
    id: 'engine',
    title: 'Scoring engine',
    source: 'BUILD.md section 14, step 5',
    componentIds: ['text'],
    principleIds: ['do-less', 'design-with-data'],
    doneWhen: 'An index, verdict or gap is computed in lib/scoring. Text only displays that result.',
  },
  {
    order: 6,
    id: 'auth',
    title: 'Auth and organisation scope',
    source: 'BUILD.md section 14, step 6',
    componentIds: ['button', 'field'],
    principleIds: ['user-needs', 'everyone'],
    doneWhen: 'Sign-in uses a visible label and a button at the control height.',
  },
  {
    order: 7,
    id: 'screens',
    title: 'Screens',
    source: 'BUILD.md section 14, step 7',
    componentIds: ['stack', 'cluster', 'grid', 'inset', 'measure', 'heading', 'panel', 'button'],
    principleIds: ['consistent', 'context', 'services-not-websites'],
    doneWhen: 'New screens are composed from the library. Reading views sit in Measure.',
  },
  {
    order: 8,
    id: 'design-system',
    title: 'Design system',
    source: 'BUILD.md section 14, step 8',
    componentIds: [
      'stack',
      'cluster',
      'grid',
      'inset',
      'measure',
      'heading',
      'text',
      'button',
      'field',
      'panel',
      'skip-link',
      'card',
      'badge',
      'delivery-status',
      'lifecycle-bar',
      'next-action',
      'measure-tile',
      'attention-row',
      'table',
      'tab-nav',
      'stepper',
      'checklist',
      'empty-state',
      'page-header',
    ],
    principleIds: ['consistent', 'open', 'make-simple'],
    doneWhen: 'The catalogue shows a user need, a sizing rule and a build step for every component.',
  },
  {
    order: 9,
    id: 'accessibility',
    title: 'Accessibility',
    source: 'BUILD.md section 14, step 9',
    componentIds: ['skip-link', 'field', 'button', 'heading'],
    principleIds: ['everyone'],
    doneWhen: 'The skip link is first in the tab order, fields name their errors, and primary controls meet the control target.',
  },
  {
    order: 10,
    id: 'polish',
    title: 'Polish',
    source: 'BUILD.md section 14, step 10',
    componentIds: ['text', 'heading'],
    principleIds: ['make-simple', 'open'],
    doneWhen: 'Interface sentences live in the copy catalogue in English and in Welsh.',
  },
  {
    order: 11,
    id: 'deploy',
    title: 'Deploy',
    source: 'BUILD.md section 14, step 11',
    componentIds: [],
    principleIds: ['iterate'],
    doneWhen: 'The running service serves the same components as this catalogue.',
  },
];

export function principleById(id: PrincipleId): DesignPrinciple {
  const principle = GDS_PRINCIPLES.find((item) => item.id === id);
  if (!principle) {
    throw new Error(`Missing design principle ${id}`);
  }
  return principle;
}

export function componentGuide(id: LibraryComponentId): ComponentGuide {
  const guide = COMPONENT_GUIDES.find((item) => item.id === id);
  if (!guide) {
    throw new Error(`Missing component guide ${id}`);
  }
  return guide;
}

export function buildStepsFor(id: LibraryComponentId): readonly BuildStep[] {
  return BUILD_STEPS.filter((step) => step.componentIds.includes(id));
}
