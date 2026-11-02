import type { FitCandidate, Person } from '@/lib/assemble-v2/types';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';

/**
 * Team Fit result. Score comes from lib/scoring (never computed in the component).
 * When `keelWarning` is set, the Assign button is replaced by the warning.
 */
export function FitCandidateCard({ candidate, person, primary = false }: { candidate: FitCandidate; person: Person; primary?: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-asm-line-soft px-5 py-4 last:border-b-0">
      <div className="flex items-center justify-between gap-2.5">
        <span className="flex flex-col">
          <span className="text-[15px] font-semibold text-asm-ink">{person.name}</span>
          <span className="text-xs text-asm-ink-3">
            {person.ddatRole}, level {person.ddatLevel}
          </span>
        </span>
        <span className="text-xl font-bold text-asm-brand tabular-nums" aria-label={`Fit score ${candidate.score} out of 100`}>
          {candidate.score}
        </span>
      </div>
      <ProgressBar value={candidate.score} label={`Fit ${candidate.score} out of 100`} />
      <p className="text-[13px] leading-relaxed text-asm-ink-2">
        {candidate.summary} Available from {candidate.availableFrom}.
      </p>
      {candidate.keelWarning ? (
        <p className="rounded-asm bg-asm-warn-wash px-3 py-2.5 text-[13px] leading-snug text-asm-warn-ink">
          <strong>Keel rule:</strong> {candidate.keelWarning}
        </p>
      ) : (
        <Button size="sm" variant={primary ? 'primary' : 'secondary'} className="w-fit">
          Assign<span className="sr-only"> {person.name}</span>
        </Button>
      )}
    </div>
  );
}
