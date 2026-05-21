import { computeAdaptation } from '@/lib/engine/adaptation';
import { computeComposition } from '@/lib/engine/composition';
import { computeAllPersonFit } from '@/lib/engine/person-fit';
import { computeReadiness } from '@/lib/engine/readiness';
import type { AnalysisInput, AnalysisResult } from '@/lib/types/analysis';

export function runAnalysis(input: AnalysisInput): AnalysisResult {
  const fit = computeAllPersonFit(input);
  const composition = computeComposition(input);
  const readiness = computeReadiness(input);
  const adaptation = computeAdaptation(readiness, composition);

  return {
    fit,
    composition,
    readiness,
    adaptation,
    overallReadiness: readiness.overallPercent,
    readinessBand: readiness.bandLabel,
  };
}

export * from '@/lib/engine/skill-match';
export * from '@/lib/engine/standards-dependency-map';
