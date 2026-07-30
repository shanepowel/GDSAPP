export type TemplateCategory =
  | 'GDS'
  | 'Wales'
  | 'Local authority'
  | 'Capital'
  | 'Enterprise'
  | 'Data'
  | 'Assessment';

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

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'GDS',
  'Wales',
  'Local authority',
  'Capital',
  'Enterprise',
  'Data',
  'Assessment',
];

const gdsCoreEntities: OrgTemplateEntity[] = [
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
    purpose: 'Enable the team to deliver iteratively',
    domain: 'Delivery',
    accountabilities: ['Ways of working', 'Risks and blockers', 'Cadence'],
    parentTempId: 'product',
    ddatRoleId: 'delivery-manager',
  },
  {
    tempId: 'design',
    name: 'Design & research',
    type: 'circle',
    purpose: 'Understand users and design the service',
    domain: 'User-centred design',
    accountabilities: ['Research', 'Service design', 'Content'],
    parentTempId: 'service',
  },
  {
    tempId: 'ur',
    name: 'User Researcher',
    type: 'role',
    purpose: 'Plan and run continuous user research',
    domain: 'Research',
    accountabilities: ['Research plan', 'Findings', 'Synthesis'],
    parentTempId: 'design',
    ddatRoleId: 'user-researcher',
  },
  {
    tempId: 'sd',
    name: 'Service Designer',
    type: 'role',
    purpose: 'Design the end-to-end service',
    domain: 'Service design',
    accountabilities: ['Service blueprint', 'Journey maps'],
    parentTempId: 'design',
    ddatRoleId: 'service-designer',
  },
  {
    tempId: 'cd',
    name: 'Content Designer',
    type: 'role',
    purpose: 'Design clear content across channels',
    domain: 'Content',
    accountabilities: ['Content style', 'Channel consistency'],
    parentTempId: 'design',
    ddatRoleId: 'content-designer',
  },
  {
    tempId: 'tech',
    name: 'Technology',
    type: 'circle',
    purpose: 'Build and operate the digital service',
    domain: 'Engineering',
    accountabilities: ['Architecture', 'Delivery', 'Reliability'],
    parentTempId: 'service',
  },
  {
    tempId: 'tl',
    name: 'Technical Lead',
    type: 'role',
    purpose: 'Lead technical decisions',
    domain: 'Architecture',
    accountabilities: ['Architecture', 'Standards', 'Quality'],
    parentTempId: 'tech',
    ddatRoleId: 'technical-architect',
  },
  {
    tempId: 'dev',
    name: 'Software Developer',
    type: 'role',
    purpose: 'Build and iterate the service',
    domain: 'Development',
    accountabilities: ['Code', 'Tests', 'Releases'],
    parentTempId: 'tech',
    ddatRoleId: 'software-developer',
  },
  {
    tempId: 'pa',
    name: 'Performance Analyst',
    type: 'role',
    purpose: 'Define success and publish performance data',
    domain: 'Performance',
    accountabilities: ['KPIs', 'Performance data', 'Insights'],
    parentTempId: 'service',
    ddatRoleId: 'performance-analyst',
  },
];

const gdsCoreRelationships: OrgTemplate['relationships'] = [
  { sourceTempId: 'service', targetTempId: 'service-owner', type: 'includes' },
  { sourceTempId: 'service', targetTempId: 'product', type: 'includes' },
  { sourceTempId: 'service', targetTempId: 'design', type: 'includes' },
  { sourceTempId: 'service', targetTempId: 'tech', type: 'includes' },
  { sourceTempId: 'pm', targetTempId: 'service-owner', type: 'reports-to' },
  { sourceTempId: 'dm', targetTempId: 'service-owner', type: 'reports-to' },
  { sourceTempId: 'ur', targetTempId: 'pm', type: 'collaborates-with' },
  { sourceTempId: 'sd', targetTempId: 'pm', type: 'collaborates-with' },
  { sourceTempId: 'cd', targetTempId: 'sd', type: 'collaborates-with' },
  { sourceTempId: 'tl', targetTempId: 'pm', type: 'collaborates-with' },
  { sourceTempId: 'dev', targetTempId: 'tl', type: 'reports-to' },
  { sourceTempId: 'pa', targetTempId: 'service-owner', type: 'reports-to' },
];

function gdsPhaseTemplate(
  id: string,
  name: string,
  description: string,
  size: string,
): OrgTemplate {
  return {
    id,
    name,
    description,
    category: 'GDS',
    size,
    entities: gdsCoreEntities,
    relationships: gdsCoreRelationships,
  };
}

export const ORG_TEMPLATES: OrgTemplate[] = [
  gdsPhaseTemplate(
    'gds-discovery-team',
    'GDS discovery team',
    'Lean multidisciplinary team for discovery — research-heavy, with product and delivery leadership.',
    '~8–10 people',
  ),
  gdsPhaseTemplate(
    'gds-service-team',
    'GDS service team',
    'Multidisciplinary digital service team aligned to the GDS Service Standard.',
    '~10–14 people',
  ),
  gdsPhaseTemplate(
    'gds-alpha-team',
    'GDS alpha team',
    'Alpha team to prototype and test solutions — design, research, product and engineering.',
    '~10–12 people',
  ),
  gdsPhaseTemplate(
    'gds-beta-team',
    'GDS beta team',
    'Beta team to build a live service — full delivery, accessibility, performance and operations.',
    '~12–16 people',
  ),
  {
    id: 'digital-service-local-authority',
    name: 'Digital service — local authority',
    description:
      'Council digital service team with bilingual content capability and joined-up channels in mind.',
    category: 'Local authority',
    size: '~10–14 people',
    entities: [
      ...gdsCoreEntities,
      {
        tempId: 'comms',
        name: 'Channel lead',
        type: 'role',
        purpose: 'Join up online, phone and face-to-face channels',
        domain: 'Channels',
        accountabilities: ['Channel consistency', 'Assisted digital'],
        parentTempId: 'service',
        ddatRoleId: 'business-analyst',
      },
    ],
    relationships: [
      ...gdsCoreRelationships,
      { sourceTempId: 'comms', targetTempId: 'service-owner', type: 'reports-to' },
    ],
  },
  {
    id: 'capital-iso-19650',
    name: 'Capital programme — information management (ISO 19650)',
    description:
      'Information management roles for a capital programme — appointing party, lead appointed party and task teams.',
    category: 'Capital',
    size: '~12 entities',
    entities: [
      {
        tempId: 'programme',
        name: 'Programme',
        type: 'circle',
        purpose: 'Deliver the capital programme',
        domain: 'Programme',
        accountabilities: ['Outcomes', 'Information management'],
      },
      {
        tempId: 'ap',
        name: 'Appointing party information manager',
        type: 'role',
        purpose: 'Set information requirements (ISO 19650)',
        domain: 'Information management',
        accountabilities: ['EIR', 'CDE requirements', 'Assurance'],
        parentTempId: 'programme',
      },
      {
        tempId: 'lap',
        name: 'Lead appointed party information manager',
        type: 'role',
        purpose: 'Coordinate information delivery',
        domain: 'Information management',
        accountabilities: ['BEP', 'CDE operation', 'Delivery team coordination'],
        parentTempId: 'programme',
      },
      {
        tempId: 'task',
        name: 'Task team information manager',
        type: 'role',
        purpose: 'Produce information in line with the BEP',
        domain: 'Task team',
        accountabilities: ['Task information', 'Quality checks'],
        parentTempId: 'programme',
      },
      {
        tempId: 'pm-cap',
        name: 'Product Manager',
        type: 'role',
        purpose: 'Digital products supporting the programme',
        domain: 'Digital',
        accountabilities: ['Digital backlog', 'User needs'],
        parentTempId: 'programme',
        ddatRoleId: 'product-manager',
      },
      {
        tempId: 'dm-cap',
        name: 'Delivery Manager',
        type: 'role',
        purpose: 'Delivery cadence across digital and information work',
        domain: 'Delivery',
        accountabilities: ['Cadence', 'Risks'],
        parentTempId: 'programme',
        ddatRoleId: 'delivery-manager',
      },
    ],
    relationships: [
      { sourceTempId: 'programme', targetTempId: 'ap', type: 'includes' },
      { sourceTempId: 'lap', targetTempId: 'ap', type: 'reports-to' },
      { sourceTempId: 'task', targetTempId: 'lap', type: 'reports-to' },
      { sourceTempId: 'pm-cap', targetTempId: 'ap', type: 'collaborates-with' },
      { sourceTempId: 'dm-cap', targetTempId: 'pm-cap', type: 'collaborates-with' },
    ],
  },
  {
    id: 'enterprise-asset-management',
    name: 'Enterprise implementation — asset management',
    description:
      'Enterprise asset-management digital implementation with product, data and change leadership.',
    category: 'Enterprise',
    size: '~10–12 people',
    entities: [
      {
        tempId: 'service',
        name: 'Asset management product',
        type: 'circle',
        purpose: 'Implement and operate the asset management service',
        domain: 'Enterprise systems',
        accountabilities: ['Outcomes', 'Adoption', 'Data quality'],
      },
      {
        tempId: 'so',
        name: 'Service Owner',
        type: 'role',
        purpose: 'Own business outcomes',
        domain: 'Leadership',
        accountabilities: ['Priorities', 'Benefits'],
        parentTempId: 'service',
        ddatRoleId: 'service-owner',
      },
      {
        tempId: 'pm',
        name: 'Product Manager',
        type: 'role',
        purpose: 'Shape the product roadmap',
        domain: 'Product',
        accountabilities: ['Backlog', 'Outcomes'],
        parentTempId: 'service',
        ddatRoleId: 'product-manager',
      },
      {
        tempId: 'ba',
        name: 'Business Analyst',
        type: 'role',
        purpose: 'Clarify process and data needs',
        domain: 'Analysis',
        accountabilities: ['Requirements', 'Process maps'],
        parentTempId: 'service',
        ddatRoleId: 'business-analyst',
      },
      {
        tempId: 'dm',
        name: 'Delivery Manager',
        type: 'role',
        purpose: 'Run iterative delivery',
        domain: 'Delivery',
        accountabilities: ['Cadence', 'Risks'],
        parentTempId: 'service',
        ddatRoleId: 'delivery-manager',
      },
      {
        tempId: 'dev',
        name: 'Software Developer',
        type: 'role',
        purpose: 'Configure and extend the platform',
        domain: 'Technology',
        accountabilities: ['Build', 'Integrations'],
        parentTempId: 'service',
        ddatRoleId: 'software-developer',
      },
    ],
    relationships: [
      { sourceTempId: 'service', targetTempId: 'so', type: 'includes' },
      { sourceTempId: 'pm', targetTempId: 'so', type: 'reports-to' },
      { sourceTempId: 'ba', targetTempId: 'pm', type: 'collaborates-with' },
      { sourceTempId: 'dm', targetTempId: 'pm', type: 'collaborates-with' },
      { sourceTempId: 'dev', targetTempId: 'pm', type: 'collaborates-with' },
    ],
  },
  {
    id: 'data-platform-digital-twin',
    name: 'Data platform / digital twin',
    description:
      'Data platform team for a digital twin or shared data product — architecture, engineering and analysis.',
    category: 'Data',
    size: '~8–10 people',
    entities: [
      {
        tempId: 'platform',
        name: 'Data platform',
        type: 'circle',
        purpose: 'Provide trusted data products',
        domain: 'Data & digital twin',
        accountabilities: ['Data products', 'Quality', 'Access'],
      },
      {
        tempId: 'po',
        name: 'Product Manager',
        type: 'role',
        purpose: 'Own data product outcomes',
        domain: 'Product',
        accountabilities: ['Roadmap', 'Users'],
        parentTempId: 'platform',
        ddatRoleId: 'product-manager',
      },
      {
        tempId: 'ta',
        name: 'Technical Lead',
        type: 'role',
        purpose: 'Lead platform architecture',
        domain: 'Architecture',
        accountabilities: ['Architecture', 'Standards'],
        parentTempId: 'platform',
        ddatRoleId: 'technical-architect',
      },
      {
        tempId: 'de',
        name: 'Software Developer',
        type: 'role',
        purpose: 'Build pipelines and APIs',
        domain: 'Engineering',
        accountabilities: ['Pipelines', 'APIs'],
        parentTempId: 'platform',
        ddatRoleId: 'software-developer',
      },
      {
        tempId: 'pa',
        name: 'Performance Analyst',
        type: 'role',
        purpose: 'Measure use and quality of data products',
        domain: 'Analysis',
        accountabilities: ['Metrics', 'Insights'],
        parentTempId: 'platform',
        ddatRoleId: 'performance-analyst',
      },
      {
        tempId: 'dm',
        name: 'Delivery Manager',
        type: 'role',
        purpose: 'Coordinate delivery across platform teams',
        domain: 'Delivery',
        accountabilities: ['Cadence', 'Dependencies'],
        parentTempId: 'platform',
        ddatRoleId: 'delivery-manager',
      },
    ],
    relationships: [
      { sourceTempId: 'platform', targetTempId: 'po', type: 'includes' },
      { sourceTempId: 'ta', targetTempId: 'po', type: 'collaborates-with' },
      { sourceTempId: 'de', targetTempId: 'ta', type: 'reports-to' },
      { sourceTempId: 'pa', targetTempId: 'po', type: 'collaborates-with' },
      { sourceTempId: 'dm', targetTempId: 'po', type: 'collaborates-with' },
    ],
  },
  {
    id: 'wales-dss-team',
    name: 'Wales DSS service team',
    description:
      'Service team sized for the Digital Service Standard for Wales, including bilingual design capability.',
    category: 'Wales',
    size: '~10–12 people',
    entities: [
      {
        tempId: 'service',
        name: 'Welsh public service',
        type: 'circle',
        purpose: 'Deliver a bilingual public service',
        domain: 'End-to-end service',
        accountabilities: ['Wellbeing outcomes', 'Bilingual design', 'Standard compliance'],
      },
      {
        tempId: 'so',
        name: 'Service Owner',
        type: 'role',
        purpose: 'Own service outcomes',
        domain: 'Leadership',
        accountabilities: ['Priorities', 'Wellbeing duty'],
        parentTempId: 'service',
        ddatRoleId: 'service-owner',
      },
      {
        tempId: 'pm',
        name: 'Product Manager',
        type: 'role',
        purpose: 'Shape the product',
        domain: 'Product',
        accountabilities: ['Backlog', 'Outcomes'],
        parentTempId: 'service',
        ddatRoleId: 'product-manager',
      },
      {
        tempId: 'dm',
        name: 'Delivery Manager',
        type: 'role',
        purpose: 'Enable iterative delivery',
        domain: 'Delivery',
        accountabilities: ['Cadence', 'Risks'],
        parentTempId: 'service',
        ddatRoleId: 'delivery-manager',
      },
      {
        tempId: 'ur',
        name: 'User Researcher',
        type: 'role',
        purpose: 'Research with Welsh and English speaking users',
        domain: 'Research',
        accountabilities: ['Research', 'Synthesis'],
        parentTempId: 'service',
        ddatRoleId: 'user-researcher',
      },
      {
        tempId: 'cd',
        name: 'Content Designer',
        type: 'role',
        purpose: 'Design services in Welsh and English',
        domain: 'Content',
        accountabilities: ['Bilingual content', 'Style'],
        parentTempId: 'service',
        ddatRoleId: 'content-designer',
      },
      {
        tempId: 'sd',
        name: 'Service Designer',
        type: 'role',
        purpose: 'Design the end-to-end service',
        domain: 'Service design',
        accountabilities: ['Journeys', 'Blueprint'],
        parentTempId: 'service',
        ddatRoleId: 'service-designer',
      },
      {
        tempId: 'dev',
        name: 'Software Developer',
        type: 'role',
        purpose: 'Build the service',
        domain: 'Technology',
        accountabilities: ['Code', 'Tests'],
        parentTempId: 'service',
        ddatRoleId: 'software-developer',
      },
    ],
    relationships: [
      { sourceTempId: 'service', targetTempId: 'so', type: 'includes' },
      { sourceTempId: 'pm', targetTempId: 'so', type: 'reports-to' },
      { sourceTempId: 'dm', targetTempId: 'so', type: 'reports-to' },
      { sourceTempId: 'ur', targetTempId: 'pm', type: 'collaborates-with' },
      { sourceTempId: 'cd', targetTempId: 'sd', type: 'collaborates-with' },
      { sourceTempId: 'sd', targetTempId: 'pm', type: 'collaborates-with' },
      { sourceTempId: 'dev', targetTempId: 'pm', type: 'collaborates-with' },
    ],
  },
  {
    id: 'assessment-skeleton',
    name: 'Assessment readiness skeleton',
    description: 'Minimal roles to start an assessment conversation before the full team is known.',
    category: 'Assessment',
    size: '~4 roles',
    entities: [
      {
        tempId: 'team',
        name: 'Assessment team',
        type: 'circle',
        purpose: 'Prepare for assessment',
        domain: 'Assurance',
        accountabilities: ['Evidence', 'Judgements'],
      },
      {
        tempId: 'so',
        name: 'Service Owner',
        type: 'role',
        purpose: 'Own the service under assessment',
        domain: 'Leadership',
        accountabilities: ['Outcomes'],
        parentTempId: 'team',
        ddatRoleId: 'service-owner',
      },
      {
        tempId: 'pm',
        name: 'Product Manager',
        type: 'role',
        purpose: 'Represent product decisions',
        domain: 'Product',
        accountabilities: ['Backlog'],
        parentTempId: 'team',
        ddatRoleId: 'product-manager',
      },
      {
        tempId: 'ur',
        name: 'User Researcher',
        type: 'role',
        purpose: 'Evidence user needs',
        domain: 'Research',
        accountabilities: ['Research evidence'],
        parentTempId: 'team',
        ddatRoleId: 'user-researcher',
      },
      {
        tempId: 'dm',
        name: 'Delivery Manager',
        type: 'role',
        purpose: 'Evidence ways of working',
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
  { pattern: /information\s*manager/i, ddatRoleId: 'business-analyst' },
];

export function suggestDdatRoleId(name: string): string | null {
  for (const a of DDAT_ROLE_ALIASES) {
    if (a.pattern.test(name)) return a.ddatRoleId;
  }
  return null;
}
