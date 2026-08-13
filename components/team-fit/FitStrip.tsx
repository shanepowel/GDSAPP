'use client';

/**
 * Signature element. A candidate's fit as a segmented band against a fixed
 * datum rule, with delivery evidence drawn beneath as a tolerance bracket.
 *
 * CSS only. Server renderable. No chart library, canvas, or layout JS.
 */

import {
  VIABILITY_THRESHOLD,
  type FitResult,
  type SkillContribution,
} from '@/lib/scoring/fit';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

interface FitStripProps {
  fit: FitResult;
  width?: number;
  candidateName?: string;
}

export function FitStrip({ fit, width = 230, candidateName }: FitStripProps) {
  const { skillContributions, notes } = fit.breakdown;
  const unevidenced = notes.includes('no_rigour_signals');
  const weightTotal = skillContributions.reduce((a, c) => a + c.weight, 0) || 1;

  return (
    <div className="fit-strip-wrap" style={{ width }}>
      <div
        className="fit-strip"
        role="img"
        aria-label={describe(fit, candidateName)}
        style={{ ['--viability' as string]: `${VIABILITY_THRESHOLD * 100}%` }}
      >
        <div className="fit-strip-fill" aria-hidden="true">
          {skillContributions.map((c) => (
            <Segment key={c.skillId} contribution={c} share={c.weight / weightTotal} />
          ))}
        </div>
        <div
          aria-hidden="true"
          className={`fit-bracket${unevidenced ? ' is-unevidenced' : ''}`}
          style={{ width: `${Math.min(100, fit.compositeScore * 100)}%` }}
        />
      </div>
      <span className="fit-strip-text">{describe(fit, candidateName)}</span>
    </div>
  );
}

function Segment({ contribution, share }: { contribution: SkillContribution; share: number }) {
  const state =
    contribution.contribution >= 1 ? 'held' : contribution.contribution > 0 ? 'partial' : 'absent';

  return (
    <div className="fit-seg-slot" style={{ width: `${share * 100}%` }}>
      {state !== 'absent' && (
        <div className={`fit-seg is-${state}`} style={{ width: `${contribution.contribution * 100}%` }} />
      )}
    </div>
  );
}

function describe(fit: FitResult, name?: string): string {
  const who = name ? `${name}: ` : '';
  const rigour = fit.breakdown.notes.includes('no_rigour_signals')
    ? 'no rigour evidence recorded, so the multiplier stays at 1.00'
    : `rigour multiplier ${fit.rigourMultiplier.toFixed(2)}`;
  const relation =
    fit.compositeScore >= VIABILITY_THRESHOLD ? 'above the datum' : 'below the datum';
  const missing = fit.breakdown.skillContributions.filter((c) => !c.heldLevel).length;
  const shortfall =
    missing > 0 ? `, ${missing} required skill${missing === 1 ? '' : 's'} not held` : '';

  return `${who}fit ${fit.compositeScore.toFixed(2)}, ${fit.band}, ${relation}. Skill ${fit.skillScore.toFixed(2)}, ${rigour}${shortfall}.`;
}

export function FitBandCell({ fit }: { fit: FitResult }) {
  return (
    <div>
      <div className="font-data text-[15px] font-medium tabular-nums">{fit.compositeScore.toFixed(2)}</div>
      <div
        className="mt-0.5 font-data text-[9.5px] uppercase tracking-[0.1em]"
        style={{ color: fit.band === 'gap' ? 'var(--survey)' : 'var(--graphite)' }}
      >
        {fit.band}
      </div>
    </div>
  );
}

export function FitBreakdownPanel({ fit }: { fit: FitResult }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const { breakdown } = fit;
  return (
    <div className="mt-3 space-y-3 border-t border-[color:var(--rule)] pt-3 text-sm">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--graphite)]">
          {copy.people.skills}
        </h4>
        <ul className="mt-1 space-y-1">
          {breakdown.skillContributions.map((s) => (
            <li key={s.skillId} className="flex flex-wrap justify-between gap-2">
              <span>
                {s.skillId}{' '}
                <span className="text-[color:var(--graphite)]">
                  ({s.heldLevel ?? 'not held'} / {s.requiredLevel})
                </span>
              </span>
              <span className="font-data">{s.contribution.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--graphite)]">
          {copy.people.rigourSignals}
        </h4>
        {breakdown.notes.includes('no_rigour_signals') ? (
          <p className="mt-1 text-[color:var(--graphite)]">{copy.teach.nothingRecorded}</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {breakdown.rigourContributions.map((r, i) => (
              <li key={`${r.type}-${i}`} className="flex flex-wrap justify-between gap-2">
                <span>
                  {r.type}{' '}
                  <span className="text-[color:var(--graphite)]">
                    ({r.provenance === 'derived' ? copy.teach.derived : copy.teach.asserted})
                  </span>
                </span>
                <span className="font-data">{r.rawValue.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {breakdown.capacityShortfall != null ? (
        <p className="text-[color:var(--graphite)]">{copy.squads.capacityFlag}</p>
      ) : null}
    </div>
  );
}
