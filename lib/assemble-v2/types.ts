/**
 * Assemble v2 domain types (Agile WOW redesign).
 *
 * These describe what the v2 screens render. They are deliberately UI-shaped so the screens can
 * run on demo data today and on tRPC data later. When wiring to the database, write adapters in
 * `lib/assemble-v2/adapters/` that map Prisma models to these types, rather than changing the
 * components. See docs/redesign/WIRING.md.
 */

export type LifecycleStage =
  | 'shape'
  | 'sprint-zero'
  | 'discovery'
  | 'alpha'
  | 'beta'
  | 'live'
  | 'operate';

export const LIFECYCLE: { key: LifecycleStage; label: string; summary: string }[] = [
  { key: 'shape', label: 'Shape', summary: 'Get the bid right so the engagement is governable from day one.' },
  { key: 'sprint-zero', label: 'Sprint Zero', summary: 'Set up the team, tools and plan before delivery starts.' },
  { key: 'discovery', label: 'Discovery', summary: 'Understand users and the problem before committing money.' },
  { key: 'alpha', label: 'Alpha', summary: 'Test the riskiest ideas with prototypes.' },
  { key: 'beta', label: 'Beta', summary: 'Build the real product and release it in stages.' },
  { key: 'live', label: 'Live', summary: 'The product is fully released and still improving.' },
  { key: 'operate', label: 'Operate', summary: 'Aftercare, support and managed change.' },
];

/** Engagement status. Rendered as On track / At risk / Off track, always with a glyph. */
export type EngagementStatus = 'on-track' | 'at-risk' | 'off-track';

export type CommercialModel = 'fixed-price' | 'time-and-materials' | 'outcome-based' | 'retained';

export type SquadShape =
  | 'software-product'
  | 'data-platform'
  | 'reporting'
  | 'automation'
  | 'discovery';

export interface Person {
  id: string;
  name: string;
  initials: string;
  role: string;
  ddatRole: string;
  ddatLevel: number;
  tfcCertified: boolean;
}

export interface Assignment {
  personId: string;
  engagementId: string | null;
  label: string;
  role: string;
  /** Month index from the start of the resource plan window (0-based, inclusive). */
  fromMonth: number;
  toMonth: number;
  allocation: number;
  kind: 'assigned' | 'exception' | 'proposed' | 'available';
  exceptionEndDate?: string | null;
}

export interface Measures {
  /** Sprint goals met over the last six sprints, 0 to 100. */
  predictability: number;
  /** Bug escape rate as a percentage, null before any stories are accepted. */
  quality: number | null;
  /** Monthly squad health check average, 1 to 5. */
  teamHealth: number;
  /** Monthly client pulse average, 1 to 5. */
  clientSatisfaction: number;
  /** Three-month trend, oldest first, for each measure. */
  trend: {
    predictability: number[];
    quality: number[];
    teamHealth: number[];
    clientSatisfaction: number[];
  };
}

export interface ChecklistItem {
  id: string;
  stage: LifecycleStage;
  title: string;
  done: boolean;
  owner?: string;
  due?: string;
  doneOn?: string;
}

export type RaidType = 'risk' | 'assumption' | 'issue' | 'dependency';

export interface RaidItem {
  id: string;
  type: RaidType;
  title: string;
  owner: string;
  rating: 'high' | 'medium' | 'low';
  action: string;
  due: string;
  status: 'open' | 'closed';
}

export interface Milestone {
  id: string;
  name: string;
  due: string;
  status: 'on-time' | 'at-risk' | 'late' | 're-planned';
  paymentLinked: boolean;
}

export interface ChangeRequest {
  ref: string;
  title: string;
  requestedBy: string;
  stage: 'submitted' | 'triaged' | 'assessed' | 'decided';
  triage?: 'change' | 'defect' | 'support';
  estimateDays?: number;
  decision?: 'approved' | 'deferred' | 'rejected';
  raisedOn: string;
  daysInStage: number;
}

export interface Decision {
  id: string;
  forum: 'steering' | 'risk-lock';
  date: string;
  text: string;
  owner: string;
  confirmedInWriting: boolean;
}

export interface SteeringCommittee {
  date: string;
  packReady: boolean;
  held: boolean;
}

export interface StandardPoint {
  framework: string;
  ref: string;
  title: string;
  stage: LifecycleStage;
  status: 'not-started' | 'in-progress' | 'evidenced' | 'not-applicable';
  evidence: string[];
  alsoSupports: { framework: string; title: string }[];
}

export interface Engagement {
  id: string;
  name: string;
  client: string;
  sector: string;
  shape: SquadShape;
  commercialModel: CommercialModel;
  stage: LifecycleStage;
  stageProgressLabel: string;
  status: EngagementStatus;
  statusReason: string;
  squadLead: string;
  accountManager: string;
  productOwner: string;
  productOwnerDaysPerWeek: number;
  startDate: string;
  endDate: string;
  goLiveDate: string | null;
  measures: Measures;
  hasRecoveryPlan: boolean;
  lastRiskLockWithinWindow: boolean;
  aftercareAgreed: boolean;
  monthlyReportDueInDays: number;
  surveysSentThisMonth: { health: boolean; pulse: boolean };
  charterReviewOverdue: boolean;
  nextMilestone: { name: string; date: string } | null;
  nextSteering: SteeringCommittee | null;
  checklist: ChecklistItem[];
  raid: RaidItem[];
  milestones: Milestone[];
  changeRequests: ChangeRequest[];
  decisions: Decision[];
  standards: StandardPoint[];
  squad: { personId: string; role: string; allocation: number; keel: KeelStatus }[];
}

export type KeelStatus =
  | { kind: 'ok' }
  | { kind: 'exception'; until: string }
  | { kind: 'exception-no-end' }
  | { kind: 'over-capacity'; allocation: number };

export interface NextAction {
  /** Lower is more urgent. Matches the rule table in docs/redesign/SCREENS.md. */
  priority: number;
  text: string;
  cta: string;
  href: string;
  tone: 'urgent' | 'normal' | 'calm';
}

export interface FitCandidate {
  personId: string;
  score: number;
  summary: string;
  availableFrom: string;
  keelWarning?: string;
}
