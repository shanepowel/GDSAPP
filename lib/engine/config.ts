export const PROFICIENCY_VALUES = {
  awareness: 1,
  working: 2,
  practitioner: 3,
  expert: 4,
} as const;

export const READINESS_BANDS = [
  { min: 85, label: 'Strong', key: 'strong' as const },
  { min: 65, label: 'On track', key: 'met' as const },
  { min: 40, label: 'At risk', key: 'partial' as const },
  { min: 0, label: 'Not ready', key: 'gap' as const },
];

export const SENIORITY_RANK = {
  any: 0,
  mid: 1,
  senior: 2,
  lead: 3,
} as const;

export function readinessBandForScore(score: number): (typeof READINESS_BANDS)[number] {
  return READINESS_BANDS.find((b) => score >= b.min) ?? READINESS_BANDS[READINESS_BANDS.length - 1];
}
