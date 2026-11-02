import type {
  Assignment,
  ChecklistItem,
  Engagement,
  FitCandidate,
  Measures,
  Person,
  StandardPoint,
} from './types';

/**
 * Demo data for the v2 screens. Every client and person here is fictional.
 * The story follows the worked example in the DAA Delivery Handbook: a 20-week data platform for
 * "Example County Council", currently in beta week 12 and at risk because team health dropped
 * after a Keel exception was given no end date.
 *
 * Replace with tRPC queries when wiring (docs/redesign/WIRING.md). Keep this file for the public
 * demo and for component previews.
 */

export const DEMO_TODAY = '2 Nov 2026';

export const people: Person[] = [
  { id: 'p-tom', name: 'Tom Reid', initials: 'TR', role: 'Squad Lead', ddatRole: 'Delivery manager', ddatLevel: 4, tfcCertified: true },
  { id: 'p-aisha', name: 'Aisha Khan', initials: 'AK', role: 'Product Lead', ddatRole: 'Product manager', ddatLevel: 4, tfcCertified: true },
  { id: 'p-priya', name: 'Priya Shah', initials: 'PS', role: 'Data engineer', ddatRole: 'Data engineer', ddatLevel: 3, tfcCertified: false },
  { id: 'p-daniel', name: 'Daniel Okafor', initials: 'DO', role: 'Technical Lead', ddatRole: 'Technical architect', ddatLevel: 5, tfcCertified: true },
  { id: 'p-grace', name: 'Grace Lin', initials: 'GL', role: 'Power BI developer', ddatRole: 'Data analyst', ddatLevel: 3, tfcCertified: true },
  { id: 'p-marcus', name: 'Marcus Bell', initials: 'MB', role: 'Data engineer', ddatRole: 'Data engineer', ddatLevel: 4, tfcCertified: false },
  { id: 'p-shane', name: 'Shane Powell', initials: 'SP', role: 'Director', ddatRole: 'Head of delivery', ddatLevel: 6, tfcCertified: true },
];

export const personById = (id: string) => people.find((p) => p.id === id);

export const RESOURCE_MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

export const assignments: Assignment[] = [
  { personId: 'p-tom', engagementId: 'finance-data-platform', label: 'Finance data platform', role: 'Squad Lead', fromMonth: 0, toMonth: 1, allocation: 80, kind: 'assigned' },
  { personId: 'p-tom', engagementId: null, label: 'Available from 13 Dec', role: '', fromMonth: 2, toMonth: 5, allocation: 0, kind: 'available' },
  { personId: 'p-aisha', engagementId: 'finance-data-platform', label: 'Finance data platform', role: 'Product Lead', fromMonth: 0, toMonth: 1, allocation: 80, kind: 'assigned' },
  { personId: 'p-aisha', engagementId: 'customer-portal', label: 'Customer portal beta (proposed)', role: 'Product Lead', fromMonth: 2, toMonth: 5, allocation: 80, kind: 'proposed' },
  { personId: 'p-priya', engagementId: 'finance-data-platform', label: 'Finance data platform', role: 'Data engineer', fromMonth: 0, toMonth: 1, allocation: 60, kind: 'assigned' },
  { personId: 'p-priya', engagementId: null, label: 'Bid support, no end date', role: 'Bid support', fromMonth: 0, toMonth: 1, allocation: 35, kind: 'exception', exceptionEndDate: null },
  { personId: 'p-priya', engagementId: null, label: 'Available from 13 Dec', role: '', fromMonth: 2, toMonth: 5, allocation: 0, kind: 'available' },
  { personId: 'p-daniel', engagementId: 'asset-reporting', label: 'Asset reporting refresh and aftercare', role: 'Technical Lead', fromMonth: 0, toMonth: 3, allocation: 80, kind: 'assigned' },
  { personId: 'p-daniel', engagementId: null, label: 'Available from 1 Mar', role: '', fromMonth: 4, toMonth: 5, allocation: 0, kind: 'available' },
  { personId: 'p-grace', engagementId: 'customer-portal', label: 'Customer portal discovery, then beta', role: 'Power BI developer', fromMonth: 0, toMonth: 5, allocation: 80, kind: 'assigned' },
  { personId: 'p-marcus', engagementId: 'asset-reporting', label: 'Aftercare', role: 'Data engineer', fromMonth: 0, toMonth: 0, allocation: 40, kind: 'assigned' },
  { personId: 'p-marcus', engagementId: null, label: 'Available from 1 Dec', role: '', fromMonth: 1, toMonth: 5, allocation: 0, kind: 'available' },
];

const steady = (p: number, q: number | null, h: number, c: number): Measures => ({
  predictability: p,
  quality: q,
  teamHealth: h,
  clientSatisfaction: c,
  trend: {
    predictability: [p - 2, p - 1, p],
    quality: q === null ? [] : [q + 0.1, q, q],
    teamHealth: [h, h, h],
    clientSatisfaction: [c - 0.1, c, c],
  },
});

const sprintZeroDone = (): ChecklistItem[] =>
  [
    'Squad charter signed off',
    'Client Product Owner and steering committee confirmed',
    'Development, test and production environments ready with a first deployment',
    'Pipeline running build, tests and security scan',
    'Wiki set up with the standard structure',
    'Outcomes agreed with the Product Owner',
    'Backlog ready for two sprints',
    'Highest-risk spikes complete and recorded',
    'Delivery Plan baselined and 30-day plan shared',
    'RAID log opened',
    'Change control route agreed',
  ].map((title, i) => ({ id: `sz-${i}`, stage: 'sprint-zero' as const, title, done: true, doneOn: '18 Jul' }));

const standardsFor = (): StandardPoint[] => [
  { framework: 'GDS Service Standard', ref: '5', title: 'Make sure everyone can use the service', stage: 'beta', status: 'evidenced', evidence: ['Accessibility audit, WCAG 2.2 AA', 'Assisted digital route agreed'], alsoSupports: [{ framework: 'Technology Code of Practice', title: 'Make things accessible and inclusive' }] },
  { framework: 'GDS Service Standard', ref: '8', title: 'Iterate and improve frequently', stage: 'beta', status: 'evidenced', evidence: ['Release history, 11 releases', 'Show and tell notes'], alsoSupports: [{ framework: 'NISTA gateway', title: 'Delivery approach' }] },
  { framework: 'GDS Service Standard', ref: '9', title: "Create a secure service which protects users' privacy", stage: 'beta', status: 'in-progress', evidence: ['Data protection impact assessment (draft)'], alsoSupports: [{ framework: 'Technology Code of Practice', title: 'Make things secure' }, { framework: 'Technology Code of Practice', title: 'Make privacy integral' }] },
  { framework: 'GDS Service Standard', ref: '10', title: 'Define what success looks like and publish performance data', stage: 'beta', status: 'evidenced', evidence: ['Outcome measures agreed in Sprint Zero', 'Delivery Compass monthly reports', 'Data lineage from source to report'], alsoSupports: [{ framework: 'Technology Code of Practice', title: 'Make better use of data' }, { framework: 'NISTA gateway', title: 'Benefits defined and tracked' }, { framework: 'ISO 19650', title: 'Information requirements and delivery' }] },
  { framework: 'GDS Service Standard', ref: '11', title: 'Choose the right tools and technology', stage: 'beta', status: 'evidenced', evidence: ['Architecture Decision Records 1 to 7'], alsoSupports: [{ framework: 'Technology Code of Practice', title: 'Integrate and adapt technology' }] },
  { framework: 'GDS Service Standard', ref: '14', title: 'Operate a reliable service', stage: 'beta', status: 'not-started', evidence: [], alsoSupports: [{ framework: 'ISO 19650', title: 'Operational information' }] },
  { framework: 'GDS Service Standard', ref: '1', title: 'Understand users and their needs', stage: 'discovery', status: 'evidenced', evidence: ['User research report, 18 interviews'], alsoSupports: [{ framework: 'Technology Code of Practice', title: 'Define user needs' }] },
  { framework: 'GDS Service Standard', ref: '2', title: 'Solve a whole problem for users', stage: 'discovery', status: 'evidenced', evidence: ['Journey map, finance close'], alsoSupports: [] },
  { framework: 'GDS Service Standard', ref: '6', title: 'Have a multidisciplinary team', stage: 'sprint-zero', status: 'evidenced', evidence: ['Squad charter'], alsoSupports: [{ framework: 'NISTA gateway', title: 'Capability and resourcing' }] },
];

const base = (o: Partial<Engagement> & Pick<Engagement, 'id' | 'name' | 'client'>): Engagement => ({
  sector: 'Public sector',
  shape: 'data-platform',
  commercialModel: 'fixed-price',
  stage: 'beta',
  stageProgressLabel: '',
  status: 'on-track',
  statusReason: '',
  squadLead: 'Tom Reid',
  accountManager: 'Shane Powell',
  productOwner: 'Client Product Owner',
  productOwnerDaysPerWeek: 2,
  startDate: '7 Jul 2026',
  endDate: '18 Dec 2026',
  goLiveDate: null,
  measures: steady(85, 0.5, 4.3, 4.4),
  hasRecoveryPlan: false,
  lastRiskLockWithinWindow: false,
  aftercareAgreed: true,
  monthlyReportDueInDays: 12,
  surveysSentThisMonth: { health: true, pulse: true },
  charterReviewOverdue: false,
  nextMilestone: null,
  nextSteering: null,
  checklist: [],
  raid: [],
  milestones: [],
  changeRequests: [],
  decisions: [],
  standards: [],
  squad: [],
  ...o,
});

export const engagements: Engagement[] = [
  base({
    id: 'finance-data-platform',
    name: 'Finance and projects data platform',
    client: 'Example County Council',
    stage: 'beta',
    stageProgressLabel: 'Beta, week 12 of 20',
    status: 'at-risk',
    statusReason: 'Team health fell to 3.4 this month.',
    productOwner: 'Helen Price (finance manager)',
    goLiveDate: '12 Dec',
    aftercareAgreed: false,
    measures: {
      predictability: 83,
      quality: 0.6,
      teamHealth: 3.4,
      clientSatisfaction: 4.3,
      trend: { predictability: [76, 80, 83], quality: [1.1, 0.8, 0.6], teamHealth: [4.2, 4.0, 3.4], clientSatisfaction: [4.2, 4.2, 4.3] },
    },
    nextMilestone: { name: 'Milestone 2: public beta', date: '28 Nov' },
    nextSteering: { date: '12 Nov', packReady: true, held: false },
    checklist: [
      ...sprintZeroDone(),
      { id: 'b1', stage: 'beta', title: 'Private beta released to finance team', done: true, doneOn: '14 Oct' },
      { id: 'b2', stage: 'beta', title: 'Data quality rules tested at every layer', done: true, doneOn: '21 Oct' },
      { id: 'b3', stage: 'beta', title: 'Row-level security signed off by the client', done: false, owner: 'Aisha Khan', due: '8 Nov' },
      { id: 'b4', stage: 'beta', title: 'Handover Pack drafted', done: false, owner: 'Tom Reid', due: '20 Nov' },
      { id: 'b5', stage: 'beta', title: 'Aftercare SLA agreed before go-live', done: false, owner: 'Shane Powell', due: '12 Dec' },
    ],
    raid: [
      { id: 'r1', type: 'dependency', title: 'Firewall change for HR source not scheduled by client IT supplier', owner: 'Tom Reid', rating: 'high', action: 'Raise at risk lock on 5 Nov', due: '5 Nov', status: 'open' },
      { id: 'r2', type: 'risk', title: 'Engineer capacity reduced by bid support exception', owner: 'Shane Powell', rating: 'medium', action: 'Set exception end date at resourcing meeting', due: '6 Nov', status: 'open' },
      { id: 'r3', type: 'risk', title: 'Aftercare model not yet agreed with the council', owner: 'Shane Powell', rating: 'medium', action: 'Propose retained support at steering committee', due: '12 Nov', status: 'open' },
      { id: 'r4', type: 'assumption', title: 'Council provides anonymised HR test data by week 14', owner: 'Helen Price', rating: 'low', action: 'Confirm at next refinement', due: '9 Nov', status: 'open' },
      { id: 'r5', type: 'issue', title: 'Product Owner on leave for one week in November', owner: 'Aisha Khan', rating: 'low', action: 'Delegate named for decisions', due: '16 Nov', status: 'open' },
    ],
    milestones: [
      { id: 'm1', name: 'Milestone 1: private beta', due: '14 Oct', status: 'on-time', paymentLinked: true },
      { id: 'm2', name: 'Milestone 2: public beta', due: '28 Nov', status: 'at-risk', paymentLinked: true },
      { id: 'm3', name: 'Milestone 3: go-live and handover', due: '12 Dec', status: 'on-time', paymentLinked: true },
    ],
    changeRequests: [
      { ref: 'CR-004', title: 'Add HR and procurement data sources', requestedBy: 'Helen Price', stage: 'decided', triage: 'change', estimateDays: 15, decision: 'approved', raisedOn: '22 Sep', daysInStage: 30 },
      { ref: 'CR-006', title: 'Regional filter on finance overview', requestedBy: 'Helen Price', stage: 'assessed', triage: 'change', estimateDays: 2, raisedOn: '24 Oct', daysInStage: 3 },
      { ref: 'CR-008', title: 'Variance figure excludes VAT incorrectly', requestedBy: 'Finance team', stage: 'triaged', triage: 'defect', raisedOn: '30 Oct', daysInStage: 1 },
    ],
    decisions: [
      { id: 'd1', forum: 'steering', date: '8 Oct', text: 'Fund HR source through CR-004; move procurement source to phase two.', owner: 'Council sponsor', confirmedInWriting: true },
      { id: 'd2', forum: 'steering', date: '8 Oct', text: 'Product Owner availability increased to two days a week for beta.', owner: 'Council sponsor', confirmedInWriting: true },
    ],
    standards: standardsFor(),
    squad: [
      { personId: 'p-tom', role: 'Squad Lead', allocation: 80, keel: { kind: 'ok' } },
      { personId: 'p-aisha', role: 'Product Lead', allocation: 80, keel: { kind: 'ok' } },
      { personId: 'p-priya', role: 'Data engineer', allocation: 95, keel: { kind: 'exception-no-end' } },
      { personId: 'p-marcus', role: 'Data engineer', allocation: 40, keel: { kind: 'ok' } },
      { personId: 'p-grace', role: 'Power BI developer', allocation: 20, keel: { kind: 'exception', until: '15 Nov' } },
    ],
  }),
  base({
    id: 'customer-portal',
    name: 'Customer portal discovery',
    client: 'Example Water Authority',
    sector: 'Utilities',
    shape: 'discovery',
    commercialModel: 'time-and-materials',
    stage: 'discovery',
    stageProgressLabel: 'Discovery, week 3 of 6',
    measures: { ...steady(100, null, 4.5, 4.6) },
    squadLead: 'Aisha Khan',
    nextSteering: { date: 'Thursday', packReady: false, held: false },
    nextMilestone: { name: 'Discovery playback', date: '20 Nov' },
    standards: standardsFor().filter((s) => s.stage === 'discovery'),
  }),
  base({
    id: 'asset-reporting',
    name: 'Asset reporting refresh',
    client: 'Example Rail Infrastructure',
    sector: 'Infrastructure',
    shape: 'reporting',
    stage: 'operate',
    stageProgressLabel: 'Operate, aftercare month 2',
    measures: steady(88, 0.3, 4.4, 4.5),
    changeRequests: [{ ref: 'CR-007', title: 'Add depot-level drill-down', requestedBy: 'Asset manager', stage: 'triaged', triage: 'change', raisedOn: '27 Oct', daysInStage: 6 }],
  }),
  base({
    id: 'highways-reporting',
    name: 'Highways scheme reporting',
    client: 'Example Highways Authority',
    stage: 'beta',
    stageProgressLabel: 'Beta, week 9 of 16',
    status: 'off-track',
    statusReason: 'Predictability and quality are both below target.',
    measures: { predictability: 58, quality: 2.1, teamHealth: 3.9, clientSatisfaction: 3.6, trend: { predictability: [74, 66, 58], quality: [0.9, 1.4, 2.1], teamHealth: [4.1, 4.0, 3.9], clientSatisfaction: [4.1, 3.8, 3.6] } },
    lastRiskLockWithinWindow: true,
  }),
  base({
    id: 'planning-portal',
    name: 'Planning portal automation',
    client: 'Example Borough Council',
    shape: 'automation',
    stage: 'alpha',
    stageProgressLabel: 'Alpha, week 4 of 6',
    status: 'at-risk',
    statusReason: 'Predictability fell to 72%.',
    measures: { predictability: 72, quality: 0.4, teamHealth: 4.1, clientSatisfaction: 4.0, trend: { predictability: [84, 78, 72], quality: [0.4, 0.4, 0.4], teamHealth: [4.2, 4.1, 4.1], clientSatisfaction: [4.1, 4.0, 4.0] } },
    monthlyReportDueInDays: 2,
  }),
  base({
    id: 'programme-controls',
    name: 'Programme controls dashboard',
    client: 'Example Energy Network',
    sector: 'Energy',
    shape: 'reporting',
    stage: 'live',
    stageProgressLabel: 'Live, month 1',
    measures: steady(85, 0.8, 4.2, 4.4),
  }),
];

export const engagementById = (id: string) => engagements.find((e) => e.id === id);

/** The signed-in demo user's own engagements, shown on Home. */
export const myEngagementIds = ['finance-data-platform', 'customer-portal', 'asset-reporting'];

export const fitCandidates: { role: string; engagement: string; starts: string; candidates: FitCandidate[] } = {
  role: 'Technical Lead',
  engagement: 'Customer portal beta',
  starts: '5 Jan',
  candidates: [
    { personId: 'p-daniel', score: 92, summary: 'Strong match on solution architecture and Azure. Led a data platform squad before.', availableFrom: '1 Mar', keelWarning: 'Starts after the role does. Assigning now would put Daniel on two engagements, which breaks a Keel rule.' },
    { personId: 'p-tom', score: 78, summary: 'Strong on delivery rigour and client governance. Gap: API design, covered by the engineering pathway.', availableFrom: '13 Dec' },
    { personId: 'p-marcus', score: 71, summary: 'Good match on data engineering and Fabric. A stretch role that fits his development plan.', availableFrom: '1 Dec' },
  ],
};

export const forgeModules = [
  { no: 1, title: 'Agile WOW: the five pillars', task: 'Map a past engagement against the pillars' },
  { no: 2, title: 'Products, not projects', task: 'Rewrite a project objective as an outcome' },
  { no: 3, title: 'Our delivery lifecycle', task: 'Map a current engagement to the lifecycle' },
  { no: 4, title: 'Squad Blueprint in practice', task: 'Draft a squad charter' },
  { no: 5, title: 'The DevOps Spec', task: 'Check three stories against the Definition of Ready' },
  { no: 6, title: 'Sprint Zero and spikes', task: 'Write two spike questions' },
  { no: 7, title: 'Delivery Compass', task: 'Write a one-page monthly report' },
  { no: 8, title: 'Working with clients', task: 'Prepare options for a scope change' },
  { no: 9, title: 'Aftercare and change control', task: 'Triage five sample requests' },
];

export const skillHeatmap = {
  skills: ['Data engineering', 'Power BI', 'Solution architecture', 'User research', 'Delivery management', 'Accessibility'],
  squads: [
    { name: 'Finance data platform', levels: [3, 3, 2, 1, 4, 2] },
    { name: 'Customer portal', levels: [2, 3, 3, 4, 3, 3] },
    { name: 'Asset reporting', levels: [4, 4, 4, 1, 3, 1] },
  ],
};

export const playbookTemplates = [
  { name: 'Squad charter', chapter: 'Squad Blueprint', use: 'Sprint Zero' },
  { name: 'Delivery Plan', chapter: 'DevOps Spec', use: 'Bid and Sprint Zero' },
  { name: '30-day plan', chapter: 'Squad Blueprint', use: 'Every sprint' },
  { name: 'RAID log', chapter: 'Governance', use: 'Sprint Zero onwards' },
  { name: 'Spike card', chapter: 'Sprint Zero and spikes', use: 'Whenever there is uncertainty' },
  { name: 'Steering committee pack', chapter: 'Governance', use: 'Each steering committee' },
  { name: 'Risk lock record', chapter: 'Governance', use: 'Within 48 hours of a blocker' },
  { name: 'Change request form', chapter: 'Aftercare and change control', use: 'Any change' },
  { name: 'Handover Pack', chapter: 'DevOps Spec', use: 'Before go-live' },
  { name: 'Aftercare SLA', chapter: 'Aftercare and change control', use: 'Before go-live' },
];

export const handbookChapters = [
  'Agile WOW: How Delivery Works in DAA',
  'The Forge',
  'Squad Blueprint',
  'T&T DevOps Spec',
  'Delivery Compass',
  'The Keel',
  'Sprint Zero and Spikes',
  'Governance: Steering Committees and Risk Lock',
  'Aftercare and Change Control',
];

export const frameworks = [
  { name: 'GDS Service Standard', on: true, summary: 'The 14 points UK government services are assessed against.' },
  { name: 'Technology Code of Practice', on: true, summary: 'Government criteria for designing, building and buying technology.' },
  { name: 'NISTA gateway', on: true, summary: 'Independent assurance reviews at key decision points.' },
  { name: 'ISO 19650', on: true, summary: 'Managing information across the life of a built asset.' },
  { name: 'Construction Playbook', on: false, summary: 'Government guidance on sourcing and contracting public works.' },
  { name: 'Golden thread', on: false, summary: 'Building Safety Act requirements for accurate, current building information.' },
  { name: 'DSSfW', on: false, summary: 'The Digital Service Standard for Wales.' },
];
