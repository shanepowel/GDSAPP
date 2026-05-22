import type { AnalysisInput, AnalysisResult } from '@/lib/types/analysis';
import type { Proficiency } from '@/lib/engine/standards-dependency-map';
import type { RigourResult } from '@/lib/engine/rigour';

export interface EngineEvidenceItem {
  id: string;
  title: string;
  strength: string;
  pointIds: string[];
  questionIds: string[];
}

export interface EngineQuestionDep {
  questionId: string;
  ref: string;
  text: string;
  weight: number;
  passThreshold: number | null;
  isPassFail: boolean;
  category: string | null;
  roleDeps: { roleId: string; weight: number; minSeniorityRank: number }[];
  skillDeps: { skillId: string; minLevel: Proficiency; weight: number }[];
}

export interface BidScoringInput {
  team: AnalysisInput;
  questions: EngineQuestionDep[];
  scoringScaleMax: number;
  qualityWeight: number;
  evidenceByPoint: Map<string, EngineEvidenceItem[]>;
  evidenceByQuestion: Map<string, EngineEvidenceItem[]>;
}

export interface BidQuestionResult {
  questionId: string;
  ref: string;
  capabilityCoverage: number;
  evidenceStrength: number;
  combinedScore: number;
  predictedBand: number;
  confidenceNote: string;
  passFailRisk: boolean;
  rationale: string[];
  pointMovers: string[];
}

export interface BidOutlookResult {
  questions: BidQuestionResult[];
  overallQualityOutlook: number;
  topPointMovers: { text: string; impact: number }[];
}

export interface RigourDimensionInput {
  dimension: string;
  score: number;
  evidenceNote?: string | null;
}

export interface AdaptationConstraints {
  budgetCap?: number | null;
  startBy?: Date | null;
  endBy?: Date | null;
  internalRatePerDay?: number | null;
  partnerRatePerDay?: number | null;
}

export interface PersonAvailabilityInput {
  personId: string;
  daysPerWeek: number;
  dayRate?: number | null;
}

export type ExtendedAnalysisResult = AnalysisResult & {
  rigour?: RigourResult;
  bidOutlook?: BidOutlookResult;
};
