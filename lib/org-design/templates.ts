export type TemplateCategory = 'GDS' | 'Wales' | 'Assessment' | 'Other';

export interface OrgTemplateEntity {
  tempId: string;
  name: string;
  type: 'circle' | 'role' | 'product';
  purpose?: string;
  domain?: string;
  accountabilities?: string[];
  policies?: string[];
  parentTempId?: string;
  ddatRoleId?: string;
}

export interface OrgTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  size: string;
  entities: OrgTemplateEntity[];
  relationships: Array<{
    sourceTempId: string;
    targetTempId: string;
    type: 'includes' | 'reports-to' | 'collaborates-with';
  }>;
  people?: Array<{
    name: string;
    email?: string;
    fte?: number;
    skills?: string[];
    assignTempIds?: string[];
  }>;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = ['GDS', 'Wales', 'Assessment', 'Other'];

export const ORG_TEMPLATES: OrgTemplate[] = [
  {
    id: 'gds-service-team',
    name: 'GDS service team',
    description:
      'Multidisciplinary digital service team aligned to the GDS Service Standard — product, delivery, design, research, content, and technology.',
    category: 'GDS',
    size: '~10–14 people',
    entities: [
      {
        tempId: 'service',
        name: 'Service',
        type: 'circle',
        purpose: 'Deliver a public service that meets user needs',
        domain: 'End-to-end service',
        accountabilities: ['Service outcomes', 'Standard compliance', 'Continuous improvement'],
      },
      {
        tempId: 'service-owner',
        name: 'Service Owner',
        type: 'role',
        purpose: 'Own service outcomes and prioritisation',
        domain: 'Service leadership',
        accountabilities: ['Vision', 'Priorities', 'Stakeholder alignment'],
        parentTempId: 'service',
        ddatRoleId: 'service-owner',
      },
      {
        tempId: 'product',
        name: 'Product & delivery',
        type: 'circle',
        purpose: 'Shape and ship iterations',
        domain: 'Product management & agile delivery',
        accountabilities: ['Roadmap', 'Delivery cadence', 'Risks'],
        parentTempId: 'service',
      },
      {
        tempId: 'pm',
        name: 'Product Manager',
        type: 'role',
        purpose: 'Define what to build next based on user needs and policy intent',
        domain: 'Product',
        accountabilities: ['Backlog', 'Outcomes', 'Experimentation'],
        parentTempId: 'product',
        ddatRoleId: 'product-manager',
      },
      {
        tempId: 'dm',
        name: 'Delivery Manager',
        type: 'role',
        purpose: 'Create the environment for the team to deliver',
        domain: 'Delivery',
        accountabilities: ['Ceremonies', 'Blockers', 'Team health'],
        parentTempId: 'product',
        ddatRoleId: 'delivery-manager',
      },
      {
        tempId: 'design',
        name: 'Design & research',
        type: 'circle',
        purpose: 'Understand users and design inclusive journeys',
        domain: 'UR, service design, content',
        accountabilities: ['Evidence', 'Accessibility', 'Content'],
        parentTempId: 'service',
      },
      {
        tempId: 'ur',
        name: 'User Researcher',
        type: 'role',
        purpose: 'Generate evidence about user needs',
        domain: 'Research',
        accountabilities: ['Research plan', 'Insights', 'Assumptions'],
        parentTempId: 'design',
        ddatRoleId: 'user-researcher',
      },
      {
        tempId: 'sd',
        name: 'Service Designer',
        type: 'role',
        purpose: 'Design end-to-end service journeys',
        domain: 'Service design',
        accountabilities: ['Journeys', 'Blueprints', 'Prototypes'],
        parentTempId: 'design',
        ddatRoleId: 'service-designer',
      },
      {
        tempId: 'cd',
        name: 'Content Designer',
        type: 'role',
        purpose: 'Make content clear and usable',
        domain: 'Content',
        accountabilities: ['Content design', 'Style', 'Plain language'],
        parentTempId: 'design',
        ddatRoleId: 'content-designer',
      },
      {
        tempId: 'tech',
        name: 'Technology',
        type: 'circle',
        purpose: 'Build secure, reliable software',
        domain: 'Engineering',
        accountabilities: ['Quality', 'Security', 'Operability'],
        parentTempId: 'service',
      },
      {
        tempId: 'tl',
        name: 'Technical Lead',
        type: 'role',
        purpose: 'Lead technical direction and quality',
        domain: 'Architecture',
        accountabilities: ['Architecture', 'Standards', 'Mentoring'],
        parentTempId: 'tech',
        ddatRoleId: 'technical-architect',
      },
      {
        tempId: 'dev',
        name: 'Software Developer',
        type: 'role',
        purpose: 'Implement and operate the service',
        domain: 'Engineering',
        accountabilities: ['Code', 'Tests', 'Support'],
        parentTempId: 'tech',
        ddatRoleId: 'software-developer',
      },
      {
        tempId: 'pa',
        name: 'Performance Analyst',
        type: 'role',
        purpose: 'Measure whether the service is working',
        domain: 'Performance',
        accountabilities: ['KPIs', 'Dashboards', 'Insights'],
        parentTempId: 'service',
        ddatRoleId: 'performance-analyst',
      },
      {
        tempId: 'product-svc',
        name: 'Digital service',
        type: 'product',
        purpose: 'The live public-facing service',
        domain: 'Users & channels',
        accountabilities: ['Availability', 'Accessibility', 'Iteration'],
      },
    ],
    relationships: [
      { sourceTempId: 'service', targetTempId: 'service-owner', type: 'includes' },
      { sourceTempId: 'service', targetTempId: 'product', type: 'includes' },
      { sourceTempId: 'service', targetTempId: 'design', type: 'includes' },
      { sourceTempId: 'service', targetTempId: 'tech', type: 'includes' },
      { sourceTempId: 'product', targetTempId: 'pm', type: 'includes' },
      { sourceTempId: 'product', targetTempId: 'dm', type: 'includes' },
      { sourceTempId: 'design', targetTempId: 'ur', type: 'includes' },
      { sourceTempId: 'design', targetTempId: 'sd', type: 'includes' },
      { sourceTempId: 'design', targetTempId: 'cd', type: 'includes' },
      { sourceTempId: 'tech', targetTempId: 'tl', type: 'includes' },
      { sourceTempId: 'tech', targetTempId: 'dev', type: 'includes' },
      { sourceTempId: 'pm', targetTempId: 'service-owner', type: 'reports-to' },
      { sourceTempId: 'dm', targetTempId: 'service-owner', type: 'reports-to' },
      { sourceTempId: 'design', targetTempId: 'product', type: 'collaborates-with' },
      { sourceTempId: 'tech', targetTempId: 'product', type: 'collaborates-with' },
      { sourceTempId: 'pa', targetTempId: 'pm', type: 'collaborates-with' },
      { sourceTempId: 'tech', targetTempId: 'product-svc', type: 'collaborates-with' },
    ],
  },
  {
    id: 'gds-programme',
    name: 'GDS programme / multi-service',
    description:
      'Programme structure with a shared platform circle and two service teams reporting into programme leadership.',
    category: 'GDS',
    size: '~20–30 people',
    entities: [
      {
        tempId: 'programme',
        name: 'Programme',
        type: 'circle',
        purpose: 'Coordinate multiple digital services',
        domain: 'Programme',
        accountabilities: ['Outcomes', 'Dependencies', 'Funding'],
      },
      {
        tempId: 'prog-dir',
        name: 'Programme Director',
        type: 'role',
        purpose: 'Lead the programme',
        domain: 'Leadership',
        accountabilities: ['Strategy', 'Governance'],
        parentTempId: 'programme',
        ddatRoleId: 'service-owner',
      },
      {
        tempId: 'platform',
        name: 'Shared platform',
        type: 'circle',
        purpose: 'Provide common capabilities',
        domain: 'Platform',
        accountabilities: ['APIs', 'Identity', 'Design system'],
        parentTempId: 'programme',
      },
      {
        tempId: 'svc-a',
        name: 'Service A',
        type: 'circle',
        purpose: 'Deliver service A',
        domain: 'Service',
        accountabilities: ['User needs', 'Iteration'],
        parentTempId: 'programme',
      },
      {
        tempId: 'svc-b',
        name: 'Service B',
        type: 'circle',
        purpose: 'Deliver service B',
        domain: 'Service',
        accountabilities: ['User needs', 'Iteration'],
        parentTempId: 'programme',
      },
      {
        tempId: 'pm-a',
        name: 'Product Manager A',
        type: 'role',
        purpose: 'Own service A product',
        domain: 'Product',
        accountabilities: ['Backlog'],
        parentTempId: 'svc-a',
        ddatRoleId: 'product-manager',
      },
      {
        tempId: 'pm-b',
        name: 'Product Manager B',
        type: 'role',
        purpose: 'Own service B product',
        domain: 'Product',
        accountabilities: ['Backlog'],
        parentTempId: 'svc-b',
        ddatRoleId: 'product-manager',
      },
      {
        tempId: 'plat-tl',
        name: 'Platform Tech Lead',
        type: 'role',
        purpose: 'Lead platform engineering',
        domain: 'Technology',
        accountabilities: ['Architecture'],
        parentTempId: 'platform',
        ddatRoleId: 'technical-architect',
      },
    ],
    relationships: [
      { sourceTempId: 'programme', targetTempId: 'prog-dir', type: 'includes' },
      { sourceTempId: 'programme', targetTempId: 'platform', type: 'includes' },
      { sourceTempId: 'programme', targetTempId: 'svc-a', type: 'includes' },
      { sourceTempId: 'programme', targetTempId: 'svc-b', type: 'includes' },
      { sourceTempId: 'pm-a', targetTempId: 'prog-dir', type: 'reports-to' },
      { sourceTempId: 'pm-b', targetTempId: 'prog-dir', type: 'reports-to' },
      { sourceTempId: 'svc-a', targetTempId: 'platform', type: 'collaborates-with' },
      { sourceTempId: 'svc-b', targetTempId: 'platform', type: 'collaborates-with' },
    ],
  },
  {
    id: 'wales-dss-team',
    name: 'Wales DSS service team',
    description:
      'Digital Service Standard for Wales team with bilingual content and wellbeing / future generations accountabilities.',
    category: 'Wales',
    size: '~10–14 people',
    entities: [
      {
        tempId: 'service',
        name: 'Welsh public service',
        type: 'circle',
        purpose: 'Deliver a bilingual public service meeting the Wales standard',
        domain: 'Service',
        accountabilities: [
          'User needs',
          'Welsh language',
          'Wellbeing of Future Generations',
          'Accessibility',
        ],
        policies: ['Welsh Language Standards', 'Equality duties'],
      },
      {
        tempId: 'service-owner',
        name: 'Service Owner',
        type: 'role',
        purpose: 'Own outcomes including Welsh language and wellbeing duties',
        domain: 'Leadership',
        accountabilities: ['Outcomes', 'Statutory duties', 'Priorities'],
        parentTempId: 'service',
        ddatRoleId: 'service-owner',
      },
      {
        tempId: 'pm',
        name: 'Product Manager',
        type: 'role',
        purpose: 'Shape the bilingual service',
        domain: 'Product',
        accountabilities: ['Roadmap', 'Discovery'],
        parentTempId: 'service',
        ddatRoleId: 'product-manager',
      },
      {
        tempId: 'dm',
        name: 'Delivery Manager',
        type: 'role',
        purpose: 'Enable agile delivery',
        domain: 'Delivery',
        accountabilities: ['Cadence', 'Risks'],
        parentTempId: 'service',
        ddatRoleId: 'delivery-manager',
      },
      {
        tempId: 'ur',
        name: 'User Researcher',
        type: 'role',
        purpose: 'Research with Welsh-speaking and English-speaking users',
        domain: 'Research',
        accountabilities: ['Bilingual research', 'Insights'],
        parentTempId: 'service',
        ddatRoleId: 'user-researcher',
      },
      {
        tempId: 'cd',
        name: 'Content Designer',
        type: 'role',
        purpose: 'Design clear bilingual content',
        domain: 'Content',
        accountabilities: ['Welsh & English content', 'Plain language'],
        parentTempId: 'service',
        ddatRoleId: 'content-designer',
      },
      {
        tempId: 'sd',
        name: 'Service Designer',
        type: 'role',
        purpose: 'Design inclusive end-to-end journeys',
        domain: 'Design',
        accountabilities: ['Journeys', 'Accessibility'],
        parentTempId: 'service',
        ddatRoleId: 'service-designer',
      },
      {
        tempId: 'dev',
        name: 'Software Developer',
        type: 'role',
        purpose: 'Build and operate the service',
        domain: 'Engineering',
        accountabilities: ['Code', 'Security'],
        parentTempId: 'service',
        ddatRoleId: 'software-developer',
      },
    ],
    relationships: [
      { sourceTempId: 'service', targetTempId: 'service-owner', type: 'includes' },
      { sourceTempId: 'pm', targetTempId: 'service-owner', type: 'reports-to' },
      { sourceTempId: 'dm', targetTempId: 'service-owner', type: 'reports-to' },
      { sourceTempId: 'ur', targetTempId: 'pm', type: 'collaborates-with' },
      { sourceTempId: 'cd', targetTempId: 'sd', type: 'collaborates-with' },
      { sourceTempId: 'dev', targetTempId: 'pm', type: 'collaborates-with' },
    ],
  },
  {
    id: 'assessment-skeleton',
    name: 'Assessment readiness skeleton',
    description:
      'Minimal roles for a single service assessment engagement — enough to sync into Team and score readiness.',
    category: 'Assessment',
    size: '~5 roles',
    entities: [
      {
        tempId: 'team',
        name: 'Assessment team',
        type: 'circle',
        purpose: 'Prepare for service standard assessment',
        domain: 'Engagement',
        accountabilities: ['Evidence', 'Team fit', 'Gaps'],
      },
      {
        tempId: 'so',
        name: 'Service Owner',
        type: 'role',
        purpose: 'Accountable for the service under assessment',
        domain: 'Leadership',
        accountabilities: ['Sponsorship'],
        parentTempId: 'team',
        ddatRoleId: 'service-owner',
      },
      {
        tempId: 'pm',
        name: 'Product Manager',
        type: 'role',
        purpose: 'Own product decisions',
        domain: 'Product',
        accountabilities: ['Backlog'],
        parentTempId: 'team',
        ddatRoleId: 'product-manager',
      },
      {
        tempId: 'ur',
        name: 'User Researcher',
        type: 'role',
        purpose: 'Provide user evidence',
        domain: 'Research',
        accountabilities: ['Research'],
        parentTempId: 'team',
        ddatRoleId: 'user-researcher',
      },
      {
        tempId: 'dm',
        name: 'Delivery Manager',
        type: 'role',
        purpose: 'Evidence agile delivery',
        domain: 'Delivery',
        accountabilities: ['Ways of working'],
        parentTempId: 'team',
        ddatRoleId: 'delivery-manager',
      },
    ],
    relationships: [
      { sourceTempId: 'team', targetTempId: 'so', type: 'includes' },
      { sourceTempId: 'pm', targetTempId: 'so', type: 'reports-to' },
      { sourceTempId: 'ur', targetTempId: 'pm', type: 'collaborates-with' },
      { sourceTempId: 'dm', targetTempId: 'pm', type: 'collaborates-with' },
    ],
  },
  {
    id: 'functional-hierarchy',
    name: 'Functional hierarchy',
    description: 'Simple departmental hierarchy for non-service org redesign work.',
    category: 'Other',
    size: '~8 entities',
    entities: [
      {
        tempId: 'exec',
        name: 'Executive',
        type: 'circle',
        purpose: 'Set direction',
        domain: 'Leadership',
        accountabilities: ['Strategy'],
      },
      {
        tempId: 'ceo',
        name: 'Director',
        type: 'role',
        purpose: 'Lead the organisation',
        domain: 'Executive',
        accountabilities: ['Decisions'],
        parentTempId: 'exec',
      },
      {
        tempId: 'ops',
        name: 'Operations',
        type: 'circle',
        purpose: 'Run day-to-day',
        domain: 'Ops',
        accountabilities: ['Delivery'],
      },
      {
        tempId: 'ops-lead',
        name: 'Ops Lead',
        type: 'role',
        purpose: 'Lead operations',
        domain: 'Ops',
        accountabilities: ['Performance'],
        parentTempId: 'ops',
      },
    ],
    relationships: [
      { sourceTempId: 'ops', targetTempId: 'ceo', type: 'reports-to' },
      { sourceTempId: 'ops-lead', targetTempId: 'ceo', type: 'reports-to' },
    ],
  },
];

/** Deterministic alias map from role entity names to DDaT role ids. */
export const DDAT_ROLE_ALIASES: Array<{ pattern: RegExp; ddatRoleId: string }> = [
  { pattern: /service\s*owner|service\s*manager/i, ddatRoleId: 'service-owner' },
  { pattern: /product\s*manager|product\s*owner/i, ddatRoleId: 'product-manager' },
  { pattern: /delivery\s*manager|scrum\s*master/i, ddatRoleId: 'delivery-manager' },
  { pattern: /user\s*research/i, ddatRoleId: 'user-researcher' },
  { pattern: /service\s*design/i, ddatRoleId: 'service-designer' },
  { pattern: /interaction\s*design/i, ddatRoleId: 'interaction-designer' },
  { pattern: /content\s*design/i, ddatRoleId: 'content-designer' },
  { pattern: /performance\s*analyst/i, ddatRoleId: 'performance-analyst' },
  { pattern: /technical\s*(lead|architect)|tech\s*lead/i, ddatRoleId: 'technical-architect' },
  { pattern: /software\s*develop|developer|engineer/i, ddatRoleId: 'software-developer' },
  { pattern: /business\s*analyst/i, ddatRoleId: 'business-analyst' },
];

export function suggestDdatRoleId(name: string): string | null {
  for (const a of DDAT_ROLE_ALIASES) {
    if (a.pattern.test(name)) return a.ddatRoleId;
  }
  return null;
}
