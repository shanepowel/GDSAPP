/**
 * standards-dependency-map.ts
 * Amplified dependency mapping between standard points and DDaT roles/skills.
 */

export type Proficiency = 'awareness' | 'working' | 'practitioner' | 'expert';
export type Phase = 'discovery' | 'alpha' | 'beta' | 'live';
export type StandardId = 'gds' | 'wales';
export type Seniority = 'any' | 'mid' | 'senior' | 'lead';

export interface RoleDep {
  role: string;
  weight: number;
  minSeniority?: Seniority;
}

export interface SkillDep {
  skill: string;
  minLevel: Proficiency;
  weight: number;
}

export interface PointDependency {
  key: string;
  standardId: StandardId;
  number: number;
  title: string;
  category?: string;
  roles: RoleDep[];
  skills: SkillDep[];
  evidenceTypes: string[];
  phaseEmphasis: Phase[];
  compositionDriven?: boolean;
  statutoryNote?: string;
  rationale: string;
}

const understandUsersRoles: RoleDep[] = [
  { role: 'user-researcher', weight: 1.0 },
  { role: 'service-designer', weight: 0.5 },
  { role: 'interaction-designer', weight: 0.5 },
  { role: 'product-manager', weight: 0.5 },
  { role: 'business-analyst', weight: 0.5 },
];
const understandUsersSkills: SkillDep[] = [
  { skill: 'user-research', minLevel: 'practitioner', weight: 1.0 },
  { skill: 'user-centred-practice-and-advocacy', minLevel: 'working', weight: 0.5 },
  { skill: 'defining-and-managing-user-and-business-needs', minLevel: 'working', weight: 0.5 },
  { skill: 'applying-user-centred-insights', minLevel: 'working', weight: 0.5 },
];

const joinedUpRoles: RoleDep[] = [
  { role: 'service-designer', weight: 1.0 },
  { role: 'content-designer', weight: 0.5 },
  { role: 'interaction-designer', weight: 0.5 },
  { role: 'it-service-manager', weight: 0.5 },
];
const joinedUpSkills: SkillDep[] = [
  { skill: 'designing-strategically', minLevel: 'working', weight: 1.0 },
  { skill: 'design-communication', minLevel: 'working', weight: 0.5 },
  { skill: 'content-design', minLevel: 'working', weight: 0.5 },
];

const everyoneCanUseRoles: RoleDep[] = [
  { role: 'accessibility-specialist', weight: 1.0 },
  { role: 'content-designer', weight: 0.5 },
  { role: 'interaction-designer', weight: 0.5 },
  { role: 'user-researcher', weight: 0.5 },
];
const everyoneCanUseSkills: SkillDep[] = [
  { skill: 'designing-for-everyone', minLevel: 'practitioner', weight: 1.0 },
  { skill: 'content-design', minLevel: 'working', weight: 0.5 },
  { skill: 'user-research', minLevel: 'working', weight: 0.5 },
];
const everyoneCanUseEvidence = [
  'WCAG 2.2 AA audit',
  'assistive technology testing',
  'accessibility statement',
  'research with disabled users',
  'assisted digital support route',
];

const multidisciplinaryTeamRoles: RoleDep[] = [
  { role: 'delivery-manager', weight: 1.0 },
  { role: 'product-manager', weight: 1.0 },
  { role: 'service-owner', weight: 0.5 },
];
const multidisciplinaryTeamSkills: SkillDep[] = [
  { skill: 'agile-and-lean-practices', minLevel: 'working', weight: 1.0 },
  { skill: 'stakeholder-relationship-management', minLevel: 'working', weight: 0.5 },
];

const iterateRoles: RoleDep[] = [
  { role: 'delivery-manager', weight: 1.0 },
  { role: 'product-manager', weight: 1.0 },
  { role: 'user-researcher', weight: 0.5 },
  { role: 'software-developer', weight: 0.5 },
  { role: 'development-operations-devops-engineer', weight: 0.5 },
];
const iterateSkills: SkillDep[] = [
  { skill: 'agile-and-lean-practices', minLevel: 'working', weight: 1.0 },
  { skill: 'iterative-design', minLevel: 'working', weight: 0.5 },
  { skill: 'modern-development-standards', minLevel: 'working', weight: 0.5 },
  { skill: 'product-and-service-monitoring', minLevel: 'working', weight: 0.5 },
];

export const gdsDependencies: PointDependency[] = [
  {
    key: 'gds-1',
    standardId: 'gds',
    number: 1,
    title: 'Understand users and their needs',
    roles: understandUsersRoles,
    skills: understandUsersSkills,
    evidenceTypes: [
      'research plan and recruitment',
      'research findings and synthesis',
      'user needs and personas',
      'assisted digital and access needs research',
    ],
    phaseEmphasis: ['discovery', 'alpha', 'beta', 'live'],
    rationale: 'Depth and continuity of user research and the synthesis of needs.',
  },
  {
    key: 'gds-2',
    standardId: 'gds',
    number: 2,
    title: 'Solve a whole problem for users',
    roles: [
      { role: 'service-designer', weight: 1.0 },
      { role: 'product-manager', weight: 1.0 },
      { role: 'business-analyst', weight: 0.5 },
      { role: 'content-designer', weight: 0.5 },
    ],
    skills: [
      { skill: 'designing-strategically', minLevel: 'working', weight: 1.0 },
      { skill: 'product-management', minLevel: 'working', weight: 0.5 },
      { skill: 'context-problem-and-option-analysis', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: ['end to end service map', 'cross-organisation touchpoints', 'evidence the whole problem was framed'],
    phaseEmphasis: ['discovery', 'alpha', 'beta'],
    rationale: 'Service framed end to end across organisational boundaries, not a single screen.',
  },
  {
    key: 'gds-3',
    standardId: 'gds',
    number: 3,
    title: 'Provide a joined up experience across all channels',
    roles: joinedUpRoles,
    skills: joinedUpSkills,
    evidenceTypes: ['omnichannel journey map', 'offline and assisted routes', 'consistency across channels'],
    phaseEmphasis: ['alpha', 'beta', 'live'],
    rationale: 'Consistent experience across online, phone, paper and face to face.',
  },
  {
    key: 'gds-4',
    standardId: 'gds',
    number: 4,
    title: 'Make the service simple to use',
    roles: [
      { role: 'interaction-designer', weight: 1.0 },
      { role: 'content-designer', weight: 1.0 },
      { role: 'user-researcher', weight: 0.5 },
      { role: 'service-designer', weight: 0.5 },
    ],
    skills: [
      { skill: 'iterative-design', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'evidence-based-design', minLevel: 'working', weight: 0.5 },
      { skill: 'content-design', minLevel: 'working', weight: 0.5 },
      { skill: 'user-research', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: ['usability testing rounds', 'prototype iteration history', 'task completion data'],
    phaseEmphasis: ['alpha', 'beta', 'live'],
    rationale: 'Simplicity proven through iterative testing, not assertion.',
  },
  {
    key: 'gds-5',
    standardId: 'gds',
    number: 5,
    title: 'Make sure everyone can use the service',
    roles: everyoneCanUseRoles,
    skills: everyoneCanUseSkills,
    evidenceTypes: everyoneCanUseEvidence,
    phaseEmphasis: ['alpha', 'beta', 'live'],
    rationale: 'Accessibility and inclusion built in and tested, including assisted digital.',
  },
  {
    key: 'gds-6',
    standardId: 'gds',
    number: 6,
    title: 'Have a multidisciplinary team',
    roles: multidisciplinaryTeamRoles,
    skills: multidisciplinaryTeamSkills,
    evidenceTypes: ['team structure and roles filled', 'sustainable resourcing', 'civil servant and supplier balance'],
    phaseEmphasis: ['discovery', 'alpha', 'beta', 'live'],
    compositionDriven: true,
    rationale: 'Breadth of disciplines present and sustainably resourced. Mainly computed from composition coverage.',
  },
  {
    key: 'gds-7',
    standardId: 'gds',
    number: 7,
    title: 'Use agile ways of working',
    roles: [
      { role: 'delivery-manager', weight: 1.0 },
      { role: 'product-manager', weight: 0.5 },
      { role: 'service-owner', weight: 0.5 },
    ],
    skills: [
      { skill: 'agile-and-lean-practices', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'life-cycle-management', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: [
      'cadence artefacts',
      'prioritised backlog',
      'show and tells',
      'retros that change behaviour',
      'proportionate governance',
    ],
    phaseEmphasis: ['discovery', 'alpha', 'beta', 'live'],
    rationale: 'Real agile practice with proportionate governance, not agile theatre.',
  },
  {
    key: 'gds-8',
    standardId: 'gds',
    number: 8,
    title: 'Iterate and improve frequently',
    roles: iterateRoles,
    skills: iterateSkills,
    evidenceTypes: ['release frequency', 'change log', 'examples of learning leading to change'],
    phaseEmphasis: ['alpha', 'beta', 'live'],
    rationale: 'Frequent, evidenced change driven by learning.',
  },
  {
    key: 'gds-9',
    standardId: 'gds',
    number: 9,
    title: "Create a secure service which protects users' privacy",
    roles: [
      { role: 'security-architect', weight: 1.0 },
      { role: 'technical-architect', weight: 0.5 },
      { role: 'development-operations-devops-engineer', weight: 0.5 },
      { role: 'data-governance-manager', weight: 0.5 },
      { role: 'data-ethicist', weight: 0.5 },
    ],
    skills: [
      { skill: 'information-security', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'security-technology', minLevel: 'working', weight: 0.5 },
      { skill: 'data-ethics-and-privacy', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: ['threat model', 'DPIA', 'penetration test', 'secure by design', 'data minimisation'],
    phaseEmphasis: ['alpha', 'beta', 'live'],
    rationale: 'Security and privacy designed in and independently tested.',
  },
  {
    key: 'gds-10',
    standardId: 'gds',
    number: 10,
    title: 'Define what success looks like and publish performance data',
    roles: [
      { role: 'performance-analyst', weight: 1.0 },
      { role: 'product-manager', weight: 0.5 },
      { role: 'service-owner', weight: 0.5 },
    ],
    skills: [
      { skill: 'performance-analysis', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'communicating-analysis-and-insight', minLevel: 'working', weight: 0.5 },
      { skill: 'data-visualisation', minLevel: 'working', weight: 0.5 },
      { skill: 'product-and-service-monitoring', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: ['defined KPIs', 'mandatory metrics where applicable', 'performance dashboard', 'benefits tracking'],
    phaseEmphasis: ['beta', 'live'],
    rationale: 'Success defined up front and performance published and acted on.',
  },
  {
    key: 'gds-11',
    standardId: 'gds',
    number: 11,
    title: 'Choose the right tools and technology',
    roles: [
      { role: 'technical-architect', weight: 1.0 },
      { role: 'solution-architect', weight: 0.5 },
      { role: 'development-operations-devops-engineer', weight: 0.5 },
      { role: 'software-developer', weight: 0.5 },
    ],
    skills: [
      { skill: 'making-architectural-decisions', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'technical-design-throughout-the-life-cycle', minLevel: 'working', weight: 0.5 },
      { skill: 'modern-development-standards', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: ['technology selection rationale', 'avoidance of lock in', 'total cost of ownership'],
    phaseEmphasis: ['alpha', 'beta'],
    rationale: 'Technology choices justified, proportionate and free of unnecessary lock in.',
  },
  {
    key: 'gds-12',
    standardId: 'gds',
    number: 12,
    title: 'Make new source code open',
    roles: [
      { role: 'software-developer', weight: 1.0 },
      { role: 'development-operations-devops-engineer', weight: 0.5 },
      { role: 'technical-architect', weight: 0.5 },
    ],
    skills: [
      { skill: 'modern-development-standards', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'programming-and-build', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: ['public repositories', 'open licence', 'coding in the open', 'justified exceptions'],
    phaseEmphasis: ['alpha', 'beta', 'live'],
    rationale: 'New source code open by default, with documented exceptions.',
  },
  {
    key: 'gds-13',
    standardId: 'gds',
    number: 13,
    title: 'Use and contribute to open standards, common components and patterns',
    roles: [
      { role: 'technical-architect', weight: 1.0 },
      { role: 'frontend-developer', weight: 0.5 },
      { role: 'interaction-designer', weight: 0.5 },
      { role: 'content-designer', weight: 0.5 },
    ],
    skills: [
      { skill: 'modern-development-standards', minLevel: 'working', weight: 1.0 },
      { skill: 'making-architectural-decisions', minLevel: 'working', weight: 0.5 },
      { skill: 'design-communication', minLevel: 'awareness', weight: 0.5 },
    ],
    evidenceTypes: [
      'use of GOV.UK and design system patterns',
      'common components reused',
      'contributions back to the commons',
    ],
    phaseEmphasis: ['alpha', 'beta'],
    rationale: 'Reuse of open standards and common components, and contribution back.',
  },
  {
    key: 'gds-14',
    standardId: 'gds',
    number: 14,
    title: 'Operate a reliable service',
    roles: [
      { role: 'it-service-manager', weight: 1.0 },
      { role: 'development-operations-devops-engineer', weight: 1.0 },
      { role: 'infrastructure-operations-engineer', weight: 0.5 },
      { role: 'incident-manager', weight: 0.5 },
      { role: 'problem-manager', weight: 0.5 },
      { role: 'application-operations-engineer', weight: 0.5 },
    ],
    skills: [
      { skill: 'availability-and-capacity-management', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'service-management-framework-knowledge', minLevel: 'working', weight: 0.5 },
      { skill: 'continuity-management', minLevel: 'working', weight: 0.5 },
      { skill: 'modern-development-standards', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: [
      'service level objectives and uptime',
      'monitoring and alerting',
      'incident process',
      'support model',
      'continuity and disaster recovery',
    ],
    phaseEmphasis: ['beta', 'live'],
    rationale: 'Reliable operation with monitoring, support and continuity in place.',
  },
];

export const walesDependencies: PointDependency[] = [
  {
    key: 'wales-1',
    standardId: 'wales',
    number: 1,
    category: 'Meet user needs',
    title: 'Focus on the current and future wellbeing of people in Wales',
    roles: [
      { role: 'service-owner', weight: 1.0 },
      { role: 'service-designer', weight: 0.5 },
      { role: 'product-manager', weight: 0.5 },
    ],
    skills: [
      { skill: 'designing-strategically', minLevel: 'working', weight: 1.0 },
      { skill: 'strategic-thinking', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: [
      'alignment to the seven wellbeing goals',
      'use of the five ways of working',
      'long term impact and sustainability',
    ],
    phaseEmphasis: ['discovery', 'alpha', 'beta', 'live'],
    statutoryNote:
      'Reflects the Well-being of Future Generations (Wales) Act 2015. No direct GDS equivalent.',
    rationale: 'Long term, preventative, sustainable thinking aligned to the Welsh wellbeing duty.',
  },
  {
    key: 'wales-2',
    standardId: 'wales',
    number: 2,
    category: 'Meet user needs',
    title: 'Design services in Welsh and English',
    roles: [
      { role: 'content-designer', weight: 1.0 },
      { role: 'content-strategist', weight: 0.5 },
      { role: 'service-designer', weight: 0.5 },
      { role: 'user-researcher', weight: 0.5 },
    ],
    skills: [
      { skill: 'welsh-language-service-capability', minLevel: 'working', weight: 1.0 },
      { skill: 'content-design', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'designing-for-everyone', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: [
      'bilingual content designed from the start',
      'Welsh Language Standards compliance',
      'active offer',
      'research with Welsh speaking users',
    ],
    phaseEmphasis: ['discovery', 'alpha', 'beta', 'live'],
    statutoryNote:
      'Reflects the Welsh Language (Wales) Measure 2011 and the Welsh Language Standards. Welsh is not an afterthought or a translation step.',
    rationale: 'Genuine bilingual design capability, treated as statutory not optional.',
  },
  {
    key: 'wales-3',
    standardId: 'wales',
    number: 3,
    category: 'Meet user needs',
    title: 'Understand users and their needs',
    roles: understandUsersRoles,
    skills: understandUsersSkills,
    evidenceTypes: [
      'research plan and recruitment',
      'research findings and synthesis',
      'user needs',
      'research including Welsh speakers and access needs',
    ],
    phaseEmphasis: ['discovery', 'alpha', 'beta', 'live'],
    rationale: 'Mirrors GDS point 1, with explicit attention to Welsh speaking users.',
  },
  {
    key: 'wales-4',
    standardId: 'wales',
    number: 4,
    category: 'Meet user needs',
    title: 'Provide a joined up experience',
    roles: joinedUpRoles,
    skills: joinedUpSkills,
    evidenceTypes: ['journey map across channels and organisations', 'offline and assisted routes'],
    phaseEmphasis: ['alpha', 'beta', 'live'],
    rationale: 'Mirrors GDS point 3, joined up across channels and bodies.',
  },
  {
    key: 'wales-5',
    standardId: 'wales',
    number: 5,
    category: 'Meet user needs',
    title: 'Make sure everyone can use the service',
    roles: everyoneCanUseRoles,
    skills: everyoneCanUseSkills,
    evidenceTypes: everyoneCanUseEvidence,
    phaseEmphasis: ['alpha', 'beta', 'live'],
    rationale: 'Mirrors GDS point 5.',
  },
  {
    key: 'wales-6',
    standardId: 'wales',
    number: 6,
    category: 'Create digital teams',
    title: 'Have an empowered service owner',
    roles: [{ role: 'service-owner', weight: 1.0, minSeniority: 'senior' }],
    skills: [
      { skill: 'strategic-ownership', minLevel: 'working', weight: 1.0 },
      { skill: 'stakeholder-relationship-management', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'life-cycle-management', minLevel: 'working', weight: 0.5 },
      { skill: 'agile-and-lean-practices', minLevel: 'awareness', weight: 0.5 },
    ],
    evidenceTypes: [
      'named accountable service owner',
      'decision rights and budget authority',
      'single point of accountability',
    ],
    phaseEmphasis: ['discovery', 'alpha', 'beta', 'live'],
    statutoryNote:
      'Wales makes this an explicit point. GDS folds ownership into the team and agile points. The engine should check the service owner is present AND senior enough to be genuinely empowered.',
    rationale:
      'A present but under-levelled service owner should not pass this point. Seniority is checked, not just presence.',
  },
  {
    key: 'wales-7',
    standardId: 'wales',
    number: 7,
    category: 'Create digital teams',
    title: 'Have a multidisciplinary team',
    roles: multidisciplinaryTeamRoles,
    skills: multidisciplinaryTeamSkills,
    evidenceTypes: ['team structure and roles filled', 'sustainable resourcing'],
    phaseEmphasis: ['discovery', 'alpha', 'beta', 'live'],
    compositionDriven: true,
    rationale: 'Mirrors GDS point 6. Mainly computed from composition coverage.',
  },
  {
    key: 'wales-8',
    standardId: 'wales',
    number: 8,
    category: 'Create digital teams',
    title: 'Iterate and improve frequently',
    roles: iterateRoles,
    skills: iterateSkills,
    evidenceTypes: ['release frequency', 'examples of learning leading to change'],
    phaseEmphasis: ['alpha', 'beta', 'live'],
    rationale: 'Mirrors GDS point 8.',
  },
  {
    key: 'wales-9',
    standardId: 'wales',
    number: 9,
    category: 'Create digital teams',
    title: 'Work in the open',
    roles: [
      { role: 'delivery-manager', weight: 1.0 },
      { role: 'software-developer', weight: 0.5 },
      { role: 'content-designer', weight: 0.5 },
    ],
    skills: [
      { skill: 'agile-and-lean-practices', minLevel: 'working', weight: 1.0 },
      { skill: 'modern-development-standards', minLevel: 'working', weight: 0.5 },
      { skill: 'design-communication', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: [
      'weeknotes or blogging',
      'open code where possible',
      'sharing learning across the public sector',
    ],
    phaseEmphasis: ['discovery', 'alpha', 'beta', 'live'],
    rationale: 'Broader than GDS open code. Includes a culture of working and sharing in the open.',
  },
  {
    key: 'wales-10',
    standardId: 'wales',
    number: 10,
    category: 'Use the right technology',
    title: 'Use scalable technology',
    roles: [
      { role: 'technical-architect', weight: 1.0 },
      { role: 'solution-architect', weight: 0.5 },
      { role: 'development-operations-devops-engineer', weight: 0.5 },
    ],
    skills: [
      { skill: 'making-architectural-decisions', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'technical-design-throughout-the-life-cycle', minLevel: 'working', weight: 0.5 },
      { skill: 'modern-development-standards', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: ['scalable and proportionate architecture', 'cloud and common platforms', 'avoidance of lock in'],
    phaseEmphasis: ['alpha', 'beta'],
    rationale: 'Combines GDS points 11 and 13 around scalable, proportionate technology choices.',
  },
  {
    key: 'wales-11',
    standardId: 'wales',
    number: 11,
    category: 'Use the right technology',
    title: 'Consider ethics, privacy and security throughout',
    roles: [
      { role: 'security-architect', weight: 1.0 },
      { role: 'data-ethicist', weight: 1.0 },
      { role: 'data-governance-manager', weight: 0.5 },
      { role: 'technical-architect', weight: 0.5 },
    ],
    skills: [
      { skill: 'information-security', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'data-ethics-and-privacy', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'security-technology', minLevel: 'working', weight: 0.5 },
    ],
    evidenceTypes: ['DPIA', 'ethics review', 'security by design throughout the life cycle'],
    phaseEmphasis: ['discovery', 'alpha', 'beta', 'live'],
    rationale: 'Combines GDS point 9 with an explicit ethics dimension, applied throughout.',
  },
  {
    key: 'wales-12',
    standardId: 'wales',
    number: 12,
    category: 'Use the right technology',
    title: 'Use data to make decisions',
    roles: [
      { role: 'performance-analyst', weight: 1.0 },
      { role: 'data-analyst', weight: 0.5 },
      { role: 'product-manager', weight: 0.5 },
    ],
    skills: [
      { skill: 'performance-analysis', minLevel: 'practitioner', weight: 1.0 },
      { skill: 'communicating-analysis-and-insight', minLevel: 'working', weight: 0.5 },
      { skill: 'data-visualisation', minLevel: 'working', weight: 0.5 },
      { skill: 'data-management', minLevel: 'awareness', weight: 0.5 },
    ],
    evidenceTypes: ['metrics defined', 'data informing iteration', 'performance dashboard'],
    phaseEmphasis: ['beta', 'live'],
    rationale: 'Mirrors GDS point 10 with a decision making emphasis.',
  },
];

export const allDependencies: PointDependency[] = [...gdsDependencies, ...walesDependencies];

export interface ReconciliationReport {
  missingRoles: { pointKey: string; role: string }[];
  missingSkills: { pointKey: string; skill: string }[];
  customSkillsUsed: string[];
}

export const CUSTOM_SKILLS = ['welsh-language-service-capability'];

export function reconcileDependencies(
  ingestedRoleIds: Set<string>,
  ingestedSkillIds: Set<string>,
  deps: PointDependency[] = allDependencies,
): ReconciliationReport {
  const report: ReconciliationReport = { missingRoles: [], missingSkills: [], customSkillsUsed: [] };
  for (const point of deps) {
    for (const r of point.roles) {
      if (!ingestedRoleIds.has(r.role)) report.missingRoles.push({ pointKey: point.key, role: r.role });
    }
    for (const s of point.skills) {
      if (CUSTOM_SKILLS.includes(s.skill)) {
        if (!report.customSkillsUsed.includes(s.skill)) report.customSkillsUsed.push(s.skill);
        continue;
      }
      if (!ingestedSkillIds.has(s.skill)) report.missingSkills.push({ pointKey: point.key, skill: s.skill });
    }
  }
  return report;
}
