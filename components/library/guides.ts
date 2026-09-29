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
