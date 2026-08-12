'use client';

import type { FitBand, FitBreakdown } from '@/lib/scoring/fit';

const BAND_LABEL: Record<FitBand, string> = {
  strong: 'Strong',
  viable: 'Viable',
  stretch: 'Stretch',
  gap: 'Gap',
};

export function FitStrip({
  band,
  compositeScore,
  unevidenced,
}: {
  band: FitBand;
  compositeScore: number;
  unevidenced?: boolean;
}) {
  const pct = Math.round(compositeScore * 100);
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={`Fit score ${pct}, band ${band}`}>
      <span
        className="font-data text-[12px] font-medium"
        style={{
          color:
            band === 'strong'
              ? 'var(--status-met, #0b6e4f)'
              : band === 'viable'
                ? 'var(--signal-ink)'
                : band === 'stretch'
                  ? 'var(--status-partial, #9a6700)'
                  : 'var(--status-gap, #a32020)',
        }}
      >
        {BAND_LABEL[band]} · {pct}
      </span>
      <span
        className="inline-block h-1.5 w-24 overflow-hidden bg-surface-alt"
        style={{ borderRadius: 2 }}
        aria-hidden
      >
        <span
          className="block h-full bg-brand"
          style={{ width: `${pct}%` }}
        />
      </span>
      {unevidenced ? (
        <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
          Unevidenced
        </span>
      ) : null}
    </div>
  );
}

export function FitBreakdownPanel({ breakdown }: { breakdown: FitBreakdown }) {
  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3 text-sm">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Skill contributions
        </h4>
        <ul className="mt-1 space-y-1">
          {breakdown.skillContributions.map((s) => (
            <li key={s.skillId} className="flex flex-wrap justify-between gap-2">
              <span>
                {s.skillId}{' '}
                <span className="text-text-muted">
                  ({s.heldLevel ?? 'missing'} / {s.requiredLevel})
                </span>
              </span>
              <span className="font-data">{Math.round(s.contribution * 100)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Rigour signals
        </h4>
        {breakdown.rigourSignalCount === 0 ? (
          <p className="mt-1 text-text-muted">
            No rigour signals — candidate is unevidenced, not judged low-rigour.
          </p>
        ) : (
          <ul className="mt-1 space-y-1">
            {breakdown.rigourContributions.map((r, i) => (
              <li key={`${r.type}-${i}`} className="flex flex-wrap justify-between gap-2">
                <span>
                  {r.type}{' '}
                  <span className="text-text-muted">({r.provenance})</span>
                </span>
                <span className="font-data">{r.rawValue.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {breakdown.capacityShortfall != null ? (
        <p className="text-text-muted">
          Capacity shortfall: {breakdown.capacityShortfall.toFixed(2)} FTE (not folded into fit
          score).
        </p>
      ) : null}
      {breakdown.notes.length > 0 ? (
        <p className="text-xs text-text-muted">Notes: {breakdown.notes.join(', ')}</p>
      ) : null}
    </div>
  );
}
