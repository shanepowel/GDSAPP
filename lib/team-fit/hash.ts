import { createHash } from 'node:crypto';
import { FIT_SCORING_VERSION, type FitInput } from '@/lib/scoring/fit';

/** Stable cache key for a computeFit input shape. */
export function fitInputsHash(input: FitInput): string {
  const payload = JSON.stringify({
    v: FIT_SCORING_VERSION,
    requirement: input.requirement,
    candidate: {
      personId: input.candidate.personId,
      skills: [...input.candidate.skills].sort((a, b) => a.skillId.localeCompare(b.skillId)),
      availableFte: input.candidate.availableFte,
    },
    rigourSignals: [...input.rigourSignals].sort((a, b) =>
      `${a.type}:${a.observedAtDaysAgo}`.localeCompare(`${b.type}:${b.observedAtDaysAgo}`),
    ),
  });
  return createHash('sha256').update(payload).digest('hex');
}
