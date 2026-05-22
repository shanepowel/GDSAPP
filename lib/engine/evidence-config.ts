export const EVIDENCE_STRENGTHS = [
  'none',
  'asserted',
  'documented',
  'demonstrated',
  'independently_verified',
] as const;

export type EvidenceStrength = (typeof EVIDENCE_STRENGTHS)[number];

export const EVIDENCE_STRENGTH_SCORE: Record<EvidenceStrength, number> = {
  none: 0,
  asserted: 0.25,
  documented: 0.5,
  demonstrated: 0.75,
  independently_verified: 1,
};

export function evidenceStrengthScore(strength: string): number {
  return EVIDENCE_STRENGTH_SCORE[strength as EvidenceStrength] ?? 0;
}

export function maxEvidenceStrengthForPoint(
  links: { strength: string }[],
): number {
  if (!links.length) return 0;
  return Math.max(...links.map((l) => evidenceStrengthScore(l.strength)));
}
