import type { ScoringInput, ScoringResult } from './types';

export type {
  Assignment,
  CapabilityLink,
  ChainBreak,
  Confidence,
  Criterion,
  CriterionScore,
  Entity,
  EvidenceWithLinks,
  Gap,
  Judgement,
  Person,
  ScoringInput,
  ScoringResult,
  Verdict,
} from './types';

/**
 * Pure preparedness index. Phase 0 skeleton: always returns `index: null`
 * until Phase 4 implements the six scoring rules.
 *
 * Synchronous, no I/O. Callers must inject `now`.
 */
export function score(_input: ScoringInput): ScoringResult {
  return {
    index: null,
    confidence: 'low',
    byCriterion: [],
    gaps: [],
    statutoryGaps: [],
  };
}
