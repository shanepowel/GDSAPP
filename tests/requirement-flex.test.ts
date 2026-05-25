import { describe, expect, it } from 'vitest';
import { computeRequirementFlex } from '@/lib/engine/requirement-flex';
import type { CompositionResult, ReadinessResult } from '@/lib/types/analysis';

const baseReadiness: ReadinessResult = {
  overallPercent: 50,
  bandLabel: 'at-risk',
  bandKey: 'partial',
  points: [
    {
      pointId: 'p1',
      number: 1,
      title: 'Point 1',
      status: 'gap',
      score: 0,
      capabilityScore: 0,
      evidenceStrength: 0,
      phaseWeight: 1,
      rationale: [],
      evidenceGaps: ['missing'],
    },
    {
      pointId: 'p2',
      number: 2,
      title: 'Point 2',
      status: 'partial',
      score: 50,
      capabilityScore: 50,
      evidenceStrength: 40,
      phaseWeight: 1,
      rationale: [],
      evidenceGaps: [],
    },
  ],
};

const baseComposition: CompositionResult = {
  overallPercent: 40,
  roles: [
    {
      roleLevelId: 'rl1',
      roleName: 'Lead',
      covered: false,
      thinCoverage: false,
      assignedPersonIds: [],
      bestFitPercent: 0,
      rationale: [],
    },
  ],
  singlePointsOfFailure: [],
  rationale: [],
};

describe('requirement-flex reasoning', () => {
  it('proposes flex options when gaps and missing roles exist', () => {
    const result = computeRequirementFlex({
      phase: 'discovery',
      outcome: 'Short',
      sensitivity: 'official',
      flexPriority: 'balanced',
      readiness: baseReadiness,
      composition: baseComposition,
      adaptation: { actions: [] },
    });
    expect(result.options.length).toBeGreaterThan(0);
    expect(result.summary).toContain('gap');
  });

  it('respects budget locked constraint', () => {
    const result = computeRequirementFlex({
      phase: 'alpha',
      outcome: 'A longer outcome narrative with measurable goals for the service.',
      sensitivity: 'official',
      flexPriority: 'cost',
      readiness: baseReadiness,
      composition: baseComposition,
      adaptation: {
        actions: [
          {
            id: 'a1',
            title: 'x',
            description: 'y',
            impact: 'high',
            effort: 'low',
            improves: [],
            rationale: [],
          },
        ],
      },
      constraint: { budgetCap: 100000, startBy: null, endBy: null },
    });
    expect(result.lockedConstraints.some((c) => c.includes('Budget'))).toBe(true);
  });
});
