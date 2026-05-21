import { PROFICIENCY_VALUES } from '@/lib/engine/config';
import type { Proficiency } from '@/lib/engine/standards-dependency-map';
import type { MatchLevel } from '@/lib/types/analysis';

export function proficiencyValue(level: Proficiency): number {
  return PROFICIENCY_VALUES[level];
}

export function compareSkillMatch(
  required: Proficiency,
  held: Proficiency | null | undefined,
): { score: number; match: MatchLevel; rationale: string[] } {
  if (!held) {
    return {
      score: 0,
      match: 'unmet',
      rationale: [`No proficiency recorded for skill requiring ${required}.`],
    };
  }
  const req = proficiencyValue(required);
  const h = proficiencyValue(held);
  const gap = req - h;
  if (gap <= 0) {
    return {
      score: 1,
      match: 'met',
      rationale: [`Held ${held} meets or exceeds required ${required}.`],
    };
  }
  if (gap === 1) {
    return {
      score: 0.5,
      match: 'partial',
      rationale: [`Held ${held} is one level below required ${required}.`],
    };
  }
  return {
    score: 0,
    match: 'unmet',
    rationale: [`Held ${held} is two or more levels below required ${required}.`],
  };
}
