import type { RigourSignalType, SkillLevel } from '@/lib/scoring/fit';

export const DEMO_SIGNAL_NOTE = 'Demo seed — representative delivery evidence.';

export type DemoSkill = {
  skillId: string;
  level: SkillLevel;
};

export type DemoRigour = {
  type: RigourSignalType;
  value: number;
  note: string;
};

export type DemoPersonDef = {
  /** Stable mailbox used to upsert DesignPerson. */
  email: string;
  name: string;
  fte: number;
  skills: DemoSkill[];
  /** Org-design role to assign, by DDaT role id. */
  assignDdatRoleId?: string;
  allocation?: number;
  /**
   * Days per week available on engagements. Omit for a full 1.0 FTE
   * (Team Fit treats missing availability as fully free).
   */
  daysPerWeek?: number;
  /** Asserted rigour. Omit entirely for the unevidenced case. */
  rigour?: DemoRigour[];
};

/** Human-readable flag for the People table. Sentence case. */
export function demoSkillLabel(skillId: string): string {
  const words = skillId.split('-');
  if (words.length === 0) return skillId;
  return [words[0]![0]!.toUpperCase() + words[0]!.slice(1), ...words.slice(1)].join(' ');
}

/**
 * Representative pool for the demo account. Profiles are deliberate:
 * strong fills, stretch/gap skillsets, bilingual vs English-only content,
 * unevidenced (no rigour), part-time, and over-allocated.
 */
export const DEMO_POOL: readonly DemoPersonDef[] = [
  {
    email: 'alex.morgan@demo.local',
    name: 'Alex Morgan (Service owner)',
    fte: 100,
    assignDdatRoleId: 'service-owner',
    allocation: 100,
    skills: [
      { skillId: 'strategic-ownership', level: 'practitioner' },
      { skillId: 'stakeholder-relationship-management', level: 'working' },
      { skillId: 'life-cycle-management', level: 'working' },
    ],
    rigour: [
      { type: 'assurance_participation', value: 0.82, note: 'Sat on two service assessments this year.' },
      { type: 'handover_quality', value: 0.7, note: 'Phase close packs assembled, not authored.' },
    ],
  },
  {
    email: 'jordan.blake@demo.local',
    name: 'Jordan Blake',
    fte: 100,
    assignDdatRoleId: 'product-manager',
    allocation: 80,
    skills: [
      { skillId: 'strategic-ownership', level: 'practitioner' },
      { skillId: 'agile-working', level: 'working' },
    ],
    rigour: [{ type: 'nfr_planning', value: 0.55, note: 'NFRs named on the last two discoveries.' }],
  },
  {
    email: 'nia.rees@demo.local',
    name: 'Nia Rees',
    fte: 100,
    assignDdatRoleId: 'delivery-manager',
    allocation: 100,
    skills: [
      { skillId: 'agile-working', level: 'expert' },
      { skillId: 'stakeholder-relationship-management', level: 'working' },
    ],
    rigour: [
      { type: 'spike_discipline', value: 0.75, note: 'Spikes close with a decision record.' },
      { type: 'nfr_planning', value: 0.6, note: 'Capacity is visible at planning.' },
    ],
  },
  {
    email: 'sam.jones@demo.local',
    name: 'Sam Jones (User researcher)',
    fte: 100,
    assignDdatRoleId: 'user-researcher',
    allocation: 100,
    skills: [
      { skillId: 'user-research', level: 'practitioner' },
      { skillId: 'user-centred-practice-and-advocacy', level: 'working' },
    ],
    rigour: [{ type: 'assurance_participation', value: 0.68, note: 'Research playbacks at show and tell.' }],
  },
  {
    email: 'eleri.vaughan@demo.local',
    name: 'Eleri Vaughan',
    fte: 100,
    skills: [
      { skillId: 'user-research', level: 'working' },
      { skillId: 'welsh-language-service-capability', level: 'practitioner' },
      { skillId: 'user-centred-practice-and-advocacy', level: 'working' },
    ],
    rigour: [{ type: 'assurance_participation', value: 0.5, note: 'Welsh-language research sessions recorded.' }],
  },
  {
    email: 'rhys.okonkwo@demo.local',
    name: 'Rhys Okonkwo',
    fte: 100,
    assignDdatRoleId: 'service-designer',
    allocation: 100,
    skills: [
      { skillId: 'iterative-design', level: 'practitioner' },
      { skillId: 'designing-for-everyone', level: 'working' },
      { skillId: 'user-centred-practice-and-advocacy', level: 'working' },
    ],
    rigour: [{ type: 'handover_quality', value: 0.64, note: 'Service blueprints reused at phase close.' }],
  },
  {
    email: 'priya.shah@demo.local',
    name: 'Priya Shah (Interaction designer)',
    fte: 100,
    assignDdatRoleId: 'service-designer',
    allocation: 30,
    skills: [
      { skillId: 'iterative-design', level: 'working' },
      { skillId: 'designing-for-everyone', level: 'awareness' },
      { skillId: 'user-centred-practice-and-advocacy', level: 'awareness' },
    ],
    rigour: [{ type: 'spike_discipline', value: 0.2, note: 'Design spikes rarely close with a decision.' }],
  },
  {
    email: 'mei.chen@demo.local',
    name: 'Mei Chen',
    fte: 100,
    assignDdatRoleId: 'content-designer',
    allocation: 100,
    skills: [
      { skillId: 'content-design', level: 'practitioner' },
      { skillId: 'welsh-language-service-capability', level: 'practitioner' },
    ],
    rigour: [{ type: 'handover_quality', value: 0.72, note: 'Bilingual content signed off with the style guide.' }],
  },
  {
    email: 'tom.hughes@demo.local',
    name: 'Tom Hughes',
    fte: 100,
    skills: [{ skillId: 'content-design', level: 'working' }],
    rigour: [{ type: 'nfr_planning', value: 0.3, note: 'English-only content; Welsh impact not recorded.' }],
  },
  {
    email: 'imani.adeyemi@demo.local',
    name: 'Imani Adeyemi',
    fte: 100,
    assignDdatRoleId: 'technical-architect',
    allocation: 100,
    daysPerWeek: 1,
    skills: [
      { skillId: 'architecture', level: 'practitioner' },
      { skillId: 'programming-and-build', level: 'working' },
    ],
    rigour: [
      { type: 'handover_quality', value: 0.8, note: 'ADRs attached to every architecture decision.' },
      { type: 'spike_discipline', value: 0.55, note: 'Technical spikes time-boxed.' },
    ],
  },
  {
    email: 'luca.bianchi@demo.local',
    name: 'Luca Bianchi',
    fte: 100,
    assignDdatRoleId: 'software-developer',
    allocation: 100,
    skills: [
      { skillId: 'programming-and-build', level: 'expert' },
      { skillId: 'agile-working', level: 'working' },
    ],
    rigour: [{ type: 'nfr_planning', value: 0.88, note: 'Performance and accessibility tested in the pipeline.' }],
  },
  {
    email: 'aisha.rahman@demo.local',
    name: 'Aisha Rahman',
    fte: 50,
    assignDdatRoleId: 'software-developer',
    allocation: 50,
    daysPerWeek: 2,
    skills: [
      { skillId: 'programming-and-build', level: 'awareness' },
      { skillId: 'agile-working', level: 'awareness' },
    ],
  },
  {
    email: 'gareth.price@demo.local',
    name: 'Gareth Price',
    fte: 100,
    assignDdatRoleId: 'performance-analyst',
    allocation: 80,
    skills: [
      { skillId: 'data-analysis-and-synthesis', level: 'practitioner' },
      { skillId: 'user-research', level: 'awareness' },
    ],
    rigour: [{ type: 'assurance_participation', value: 0.6, note: 'KPI pack used at the last assessment.' }],
  },
  {
    email: 'sian.powell@demo.local',
    name: 'Sian Powell',
    fte: 80,
    skills: [
      { skillId: 'designing-for-everyone', level: 'expert' },
      { skillId: 'iterative-design', level: 'working' },
    ],
    rigour: [{ type: 'assurance_participation', value: 0.9, note: 'Accessibility specialist on three live assessments.' }],
  },
  {
    email: 'chris.novak@demo.local',
    name: 'Chris Novak',
    fte: 100,
    skills: [
      { skillId: 'infrastructure', level: 'practitioner' },
      { skillId: 'programming-and-build', level: 'working' },
    ],
    rigour: [{ type: 'spike_discipline', value: 0.65, note: 'Reliability spikes close with an operations note.' }],
  },
  {
    email: 'ffion.davies@demo.local',
    name: 'Ffion Davies',
    fte: 100,
    skills: [
      { skillId: 'business-analysis', level: 'practitioner' },
      { skillId: 'agile-working', level: 'working' },
    ],
    rigour: [{ type: 'nfr_planning', value: 0.58, note: 'Requirements trace to named NFRs.' }],
  },
  {
    email: 'harper.cole@demo.local',
    name: 'Harper Cole',
    fte: 100,
    skills: [
      { skillId: 'strategic-ownership', level: 'working' },
      { skillId: 'user-research', level: 'awareness' },
      { skillId: 'agile-working', level: 'working' },
    ],
  },
  {
    email: 'devon.walsh@demo.local',
    name: 'Devon Walsh',
    fte: 50,
    assignDdatRoleId: 'delivery-manager',
    allocation: 100,
    daysPerWeek: 2,
    skills: [{ skillId: 'agile-working', level: 'practitioner' }],
    rigour: [{ type: 'capacity_discipline', value: -0.4, note: 'Committed above available FTE on two jobs.' }],
  },
];

export const DEMO_VACANCY_NAME = 'Vacancy — Developer';

export const DEMO_EXTRA_ENGAGEMENTS = [
  {
    id: 'gds-demo',
    name: 'DVLA driving licence renewal (alpha)',
    reference: 'DVLA-ALPHA-01',
    standardId: 'gds' as const,
    catalogCode: 'gds-service-standard',
    clientOrg: 'Driver and Vehicle Licensing Agency',
    sector: 'digital-service',
    serviceName: 'Driving licence renewal',
    phase: 'alpha',
    mode: 'mobilise',
    maturityLevel: 'assured',
    supplierTag: 'Turner & Townsend Demo',
    lotTag: 'Lot 1 Digital delivery',
    requirementId: 'gds-req-1',
    requirementTitle: 'Alpha requirement',
    requirementOutcome: 'Prototype a renewal journey that meets the GDS Service Standard.',
  },
  {
    id: 'hs2-demo',
    name: 'HS2 station information management (gate)',
    reference: 'HS2-GATE-01',
    standardId: 'gds' as const,
    catalogCode: 'gds-service-standard',
    clientOrg: 'HS2 Ltd',
    sector: 'capital-programme',
    serviceName: 'Station information management',
    phase: 'gate',
    mode: 'assure',
    maturityLevel: 'practising',
    supplierTag: 'Turner & Townsend Demo',
    lotTag: 'Lot 3 Capital digital',
    requirementId: 'hs2-req-1',
    requirementTitle: 'Gate requirement',
    requirementOutcome: 'Information management duties ready for gateway review.',
  },
] as const;
