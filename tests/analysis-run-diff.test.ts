import { describe, expect, it } from 'vitest';
import { diffAnalysisRuns } from '@/lib/analysis-run-diff';
import type { AnalysisResult } from '@/lib/types/analysis';

function minimalResult(readiness: number, composition: number, gapCount: number): AnalysisResult {
  const points = Array.from({ length: gapCount }, (_, i) => ({
    pointId: `p${i}`,
    number: i + 1,
    title: `Point ${i}`,
    category: 'General',
    score: 0.3,
    status: 'gap' as const,
    evidenceGaps: [],
    rationale: [],
    statutoryNote: null,
  }));
  return {
    overallReadiness: readiness,
    readinessBand: 'At risk',
    fit: [],
    composition: {
      overallPercent: composition,
      roles: [],
    },
    readiness: { points },
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
