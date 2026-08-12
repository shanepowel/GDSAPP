/** Verdict vocabulary — never RAG / pass-fail / rating. */
export type Verdict = 'met' | 'at-risk' | 'not-met' | 'not-assessed';

export type Confidence = 'low' | 'medium' | 'high';

export type ChainBreak =
  | 'no-capability-link'
  | 'vacant-role'
  | 'no-evidence'
  | 'evidence-expired';

export interface Criterion {
  id: string;
  ref: string;
  title: string;
  statement: string;
  weight: number;
  statutory: boolean;
  phases: string[];
}

export interface Judgement {
  id: string;
  criterionId: string;
  verdict: Verdict;
  rationale: string;
  confirmedByUserId: string;
  supersededById: string | null;
  createdAt: Date;
}

export interface EvidenceWithLinks {
  id: string;
  title: string;
  expiresAt: Date | null;
  criterionIds: string[];
}

export interface CapabilityLink {
  id: string;
  engagementId: string;
  capabilityRequirementId: string;
  entityId: string;
  accountabilityIndex: number | null;
  strength: 'satisfies' | 'partially' | 'informs';
  confirmed: boolean;
}

export interface Entity {
  id: string;
  name: string;
  type: 'circle' | 'role' | 'product';
  accountabilities: string[];
}

export interface Assignment {
  id: string;
  entityId: string;
  personId: string | null;
  fteBasisPoints: number | null;
}

export interface Person {
  id: string;
  name: string;
  email: string | null;
}

export interface Gap {
  criterionId: string;
  criterionRef: string;
  title: string;
  reason: string;
  /** Named remedy — a gap without a move is incomplete. */
  move: string;
  statutory: boolean;
}

export interface CriterionScore {
  criterionId: string;
  verdict: Verdict;
  evidenceCount: number;
  freshEvidenceCount: number;
  chainComplete: boolean;
  chainBreak?: ChainBreak;
  contribution: number;
}

export interface ScoringInput {
  criteria: Criterion[];
  judgements: Judgement[];
  evidence: EvidenceWithLinks[];
  capabilityLinks: CapabilityLink[];
  entities: Entity[];
  assignments: Assignment[];
  people: Person[];
  /** Injected — never read Date.now() inside scoring. */
  now: Date;
}

export interface ScoringResult {
  /** null when insufficient data — never 0. Render as —. */
  index: number | null;
  confidence: Confidence;
  byCriterion: CriterionScore[];
  gaps: Gap[];
  statutoryGaps: Gap[];
}
