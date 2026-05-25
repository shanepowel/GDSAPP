import { describe, expect, it } from 'vitest';
import { diffAnalysisRuns } from '@/lib/analysis-run-diff';
import type { AnalysisResult, ReadinessPointResult } from '@/lib/types/analysis';

function readinessPoint(i: number): ReadinessPointResult {
  return {
    pointId: `p${i}`,
    number: i + 1,
    title: `Point ${i}`,
    category: 'General',
    score: 0.3,
    status: 'gap',
    capabilityScore: 30,
    evidenceStrength: 0,
    phaseWeight: 1,
    evidenceGaps: [],
    rationale: [],
    statutoryNote: null,
  };
}

function minimalResult(readiness: number, composition: number, gapCount: number): AnalysisResult {
  const points = Array.from({ length: gapCount }, (_, i) => readinessPoint(i));
  return {
    overallReadiness: readiness,
    readinessBand: 'At risk',
    fit: [],
    composition: {
      overallPercent: composition,
      roles: [],
      singlePointsOfFailure: [],
      rationale: [],
    },
    readiness: {
      points,
      overallPercent: readiness,
      bandLabel: 'At risk',
      bandKey: 'partial',
    },
    adaptation: { actions: [] },
  };
}

describe('diffAnalysisRuns', () => {
  it('computes readiness delta between runs', () => {
    const prev = {
      overallReadiness: 40,
      result: minimalResult(40, 50, 5),
    };
    const next = {
      overallReadiness: 55,
      result: minimalResult(55, 60, 3),
    };
    const rows = diffAnalysisRuns(prev, next);
    expect(rows[0].delta).toBe(15);
    expect(rows.find((r) => r.label === 'Open readiness points')?.delta).toBe(-2);
  });
});
