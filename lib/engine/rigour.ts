import { RIGOUR_DIMENSIONS } from '@/lib/engine/rigour-config';
import type { RigourDimensionInput } from '@/lib/types/extension';

export interface RigourResult {
  overallPercent: number;
  dimensions: {
    key: string;
    label: string;
    score: number;
    descriptor: string;
    evidenceNote?: string | null;
    weakness?: string;
    goodLooksLike: string;
  }[];
  topWeaknesses: string[];
  rationale: string[];
}

export function computeRigour(scores: RigourDimensionInput[]): RigourResult {
  const byKey = new Map(scores.map((s) => [s.dimension, s.score]));
  const dimensions = RIGOUR_DIMENSIONS.map((d) => {
    const score = Math.min(4, Math.max(0, byKey.get(d.key) ?? 0));
    const weakness = score <= 1 ? d.descriptors[1] : score === 2 ? d.descriptors[2] : undefined;
    return {
      key: d.key,
      label: d.label,
      score,
      descriptor: d.descriptors[score],
      evidenceNote: scores.find((s) => s.dimension === d.key)?.evidenceNote,
      weakness,
      goodLooksLike: d.descriptors[4],
    };
  });

  const overallPercent = Math.round(
    (dimensions.reduce((s, d) => s + d.score, 0) / (dimensions.length * 4)) * 100,
  );

  const topWeaknesses = dimensions
    .filter((d) => d.score <= 2)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((d) => `${d.label}: ${d.weakness ?? d.descriptor}`);

  return {
    overallPercent,
    dimensions,
    topWeaknesses,
    rationale: [
      `Overall rigour score ${overallPercent}% (mean of seven dimensions, 0 to 4 each).`,
      ...topWeaknesses.map((w) => `Weakness: ${w}`),
    ],
  };
}

/** Boost for GDS/Wales point 7 when rigour is strong */
export function rigourBoostForPoint7(rigourPercent: number): number {
  if (rigourPercent >= 75) return 0.15;
  if (rigourPercent >= 50) return 0.08;
  return 0;
}
