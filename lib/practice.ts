import {
  CAPACITY_SPLIT,
  CORE_ROLE_MIN_FTE,
  MATURITY_LABELS,
  RIGOUR_METRIC_TARGETS,
} from '@/lib/playbook/keel';

export const PILLARS = [
  {
    name: 'The Forge',
    owns: 'Capability and certification',
    produces: 'Evidenced skill levels per person',
  },
  {
    name: 'Squad Blueprint',
    owns: 'Team structure, roles, ceremonies',
    produces: 'Archetypes used to assemble squads',
  },
  {
    name: 'The Keel',
    owns: 'Assignment, capacity, tenure',
    produces: 'Continuity that makes evidence explainable',
  },
  {
    name: 'DevOps Spec',
    owns: 'Templates, pipelines, definition of done',
    produces: 'Statutory criteria met at ticket level',
  },
  {
    name: 'Delivery Compass',
    owns: 'Metrics and governance',
    produces: 'Rigour signals and first-pass rate',
  },
] as const;

export const CEREMONIES = [
  { name: 'Backlog refinement', cadence: 'Weekly', emits: 'Ready items with named NFRs', signal: 'nfr planning' },
  { name: 'Sprint planning', cadence: 'Fortnightly', emits: 'Goal, scope, capacity position', signal: 'capacity discipline' },
  { name: 'Daily standup', cadence: 'Daily', emits: 'Blocker log', signal: null },
  { name: 'Spike close-out', cadence: 'On completion', emits: 'Decision record', signal: 'spike discipline' },
  { name: 'Architecture decision', cadence: 'On decision', emits: 'ADR', signal: 'handover quality' },
  { name: 'Show and tell', cadence: 'Fortnightly', emits: 'Working software, attendance', signal: 'assurance participation' },
  { name: 'Retrospective', cadence: 'Fortnightly', emits: 'Actions with owners', signal: null },
  { name: 'Phase close', cadence: 'Per phase', emits: 'Evidence pack, assembled not authored', signal: 'handover quality' },
  { name: 'Delivery Compass review', cadence: 'Quarterly', emits: 'Metric trend', signal: null },
] as const;

export const MATURITY = [
  {
    level: 1,
    key: 'practising',
    name: MATURITY_LABELS.practising,
    body: 'The ceremonies run. Evidence is produced when somebody asks for it.',
  },
  {
    level: 2,
    key: 'evidenced',
    name: MATURITY_LABELS.evidenced,
    body: 'Ceremonies emit artefacts as a by-product. Phase close is assembly, not authorship.',
  },
  {
    level: 3,
    key: 'assured',
    name: MATURITY_LABELS.assured,
    body: 'Gates and assessments pass first time. Evidence is trusted without rework.',
  },
  {
    level: 4,
    key: 'compounding',
    name: MATURITY_LABELS.compounding,
    body: 'Evidence from one engagement measurably accelerates the next.',
  },
] as const;

export const READY_ITEMS = [
  'User need named, with the research that supports it',
  'WCAG 2.2 AA considered, with a test path',
  'Welsh language impact recorded where the duty applies',
  'DPIA trigger checked',
  'Named non-functional requirements',
  'Security classification set',
] as const;

export const DONE_ITEMS = [
  'Accessibility testing recorded against the ticket',
  'Performance against the named NFRs',
  'Decision trail attached or linked',
  'Content and Welsh review where required',
  'ISO 19650 hand-in where the engagement is capital',
] as const;

export const KEEL_SUMMARY = {
  coreRoleMinFte: CORE_ROLE_MIN_FTE,
  capacitySplit: CAPACITY_SPLIT,
  compassTargets: RIGOUR_METRIC_TARGETS,
} as const;
