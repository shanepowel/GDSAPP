'use client';

import { useEvidenceChain } from '@/components/chain/EvidenceChainRail';

export function IndexValue({
  value,
  engagementId,
  criterionIdForChain,
  previous,
}: {
  value: number | null;
  engagementId: string;
  /** Opens chain for a representative criterion when provided */
  criterionIdForChain?: string | null;
  previous?: number | null;
}) {
  const chain = useEvidenceChain();
  const display = value === null ? '—' : String(value);
  const delta =
    value != null && previous != null ? value - previous : null;

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <button
      type="button"
      className="text-left focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus)]"
      onClick={() => {
        if (criterionIdForChain) chain.open(engagementId, criterionIdForChain);
      }}
      disabled={!criterionIdForChain}
      aria-label={
        value === null
          ? 'Preparedness index insufficient data'
          : `Preparedness index ${value}`
      }
    >
      <span
        className="font-data block text-[40px] font-medium tabular-nums leading-none text-ink-0"
        style={{
          transition: reduced ? undefined : 'opacity 200ms ease',
        }}
      >
        {display}
      </span>
      {delta != null && delta !== 0 && (
        <span className="font-data mt-1 block text-[12px] tabular-nums text-ink-2">
          {delta > 0 ? `+${delta}` : delta} since last snapshot
        </span>
      )}
      {value === null && (
        <span className="mt-2 block text-[13px] text-ink-2">
          Insufficient data — confirm at least three judgements
        </span>
      )}
    </button>
  );
}
