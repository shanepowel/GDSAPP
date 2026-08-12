'use client';

import type { FitBand, FitBreakdown } from '@/lib/scoring/fit';

const BAND_LABEL: Record<FitBand, string> = {
  strong: 'Strong',
  viable: 'Viable',
  stretch: 'Stretch',
  gap: 'Gap',
};

/**
 * Signature Team Fit instrument (doc 08 §3.4): segmented skill band with a rigour
 * tolerance bracket. CSS only — no chart library. Unevidenced = dashed bracket.
 */
export function FitStrip({
  band,
  compositeScore,
  rigourMultiplier = 1,
  breakdown,
  unevidenced,
}: {
  band: FitBand;
  compositeScore: number;
  rigourMultiplier?: number;
  breakdown?: FitBreakdown;
  unevidenced?: boolean;
}) {
  const pct = Math.round(compositeScore * 100);
  const skills = breakdown?.skillContributions ?? [];
  const weightSum = skills.reduce((s, c) => s + c.weight, 0) || 1;
  const skillWidth = Math.round(Math.min(100, (compositeScore / Math.max(rigourMultiplier, 0.01)) * 100));
  const bracketPad = Math.round(Math.abs(rigourMultiplier - 1) * 40);

  return (
    <div className="min-w-[11rem] max-w-xs flex-1" aria-label={`Fit score ${pct}, band ${band}`}>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
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
        {unevidenced ? (
          <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Unevidenced
          </span>
        ) : (
          <span className="font-data text-[11px] text-text-muted">×{rigourMultiplier.toFixed(2)}</span>
        )}
      </div>
      <div className="relative py-1.5">
        {/* Rigour bracket — engineering tolerance mark */}
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{
            left: `${Math.max(0, 2 - bracketPad / 4)}%`,
            right: `${Math.max(0, 100 - skillWidth - bracketPad / 2)}%`,
            borderTop: unevidenced ? '1px dashed var(--ink-1)' : '1.5px solid var(--ink-0)',
            borderBottom: unevidenced ? '1px dashed var(--ink-1)' : '1.5px solid var(--ink-0)',
            borderLeft: unevidenced ? '1px dashed var(--ink-1)' : '1.5px solid var(--ink-0)',
            borderRight: unevidenced ? '1px dashed var(--ink-1)' : '1.5px solid var(--ink-0)',
          }}
          aria-hidden
        />
        <div
          className="relative grid h-3 w-full overflow-hidden border border-rule bg-stock-0"
          style={{
            borderRadius: 2,
            gridTemplateColumns:
              skills.length > 0
                ? skills.map((s) => `${(s.weight / weightSum) * 100}fr`).join(' ')
                : `${skillWidth}fr ${100 - skillWidth}fr`,
          }}
        >
          {skills.length > 0
            ? skills.map((s) => (
                <span
                  key={s.skillId}
                  title={`${s.skillId}: ${Math.round(s.contribution * 100)}`}
                  style={{
                    background:
                      s.contribution >= 1
                        ? 'var(--signal)'
                        : s.contribution >= 0.6
                          ? 'color-mix(in srgb, var(--signal) 55%, transparent)'
                          : s.contribution > 0
                            ? 'color-mix(in srgb, var(--signal) 25%, transparent)'
                            : 'transparent',
                    borderRight: '1px solid var(--rule)',
                  }}
                />
              ))
            : (
                <>
                  <span style={{ background: 'var(--signal)' }} />
                  <span />
                </>
              )}
        </div>
      </div>
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
