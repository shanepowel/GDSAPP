'use client';

import { ShieldCheck } from 'lucide-react';
import { useI18n } from '@/components/app/LocaleProvider';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

function bandLabel(percent: number, m: { bandReady: string; bandOnTrack: string; bandAtRisk: string; bandNotReady: string }) {
  if (percent >= 85) return m.bandReady;
  if (percent >= 65) return m.bandOnTrack;
  if (percent >= 40) return m.bandAtRisk;
  return m.bandNotReady;
}

function bandColor(percent: number): string {
  if (percent >= 85) return 'var(--status-strong-hero)';
  if (percent >= 65) return 'var(--status-strong-hero)';
  if (percent >= 40) return 'var(--status-partial-hero)';
  return 'var(--status-gap-hero)';
}

export function PreparednessIndexCard({
  result,
  standardLabel,
  phase,
}: {
  result: ExtendedAnalysisResult;
  standardLabel: string;
  phase: string;
}) {
  const { messages: m } = useI18n();
  const index = Math.round(result.overallReadiness);
  const metCount = result.readiness.points.filter(
    (p) => p.status === 'met' || p.status === 'strong',
  ).length;
  const attention = result.readiness.points.filter(
    (p) => p.status === 'gap' || p.status === 'partial',
  ).length;
  const statutoryAtRisk = result.readiness.points.filter(
    (p) => p.statutoryNote && (p.status === 'gap' || p.status === 'partial'),
  ).length;

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {m.engagement.preparednessIndex}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: 'var(--tt-blue-hero)' }}>
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          {m.engagement.live}
        </span>
      </div>
      <div className="mt-2 flex items-end gap-3">
        <div className="font-display text-5xl font-extrabold leading-none tabular-nums text-white">
          {index}
        </div>
        <div className="pb-2">
          <div className="text-[15px] font-semibold" style={{ color: bandColor(index) }}>
            {bandLabel(index, m.engagement)}
          </div>
          <div className="text-[12px] text-slate-400">
            {standardLabel} · {phase} {m.engagement.phaseLabel}
          </div>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${index}%`,
            background: 'linear-gradient(90deg, var(--tt-blue-hero), var(--status-strong-hero))',
          }}
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="font-display text-xl font-bold tabular-nums text-white">{metCount}</div>
          <div className="text-[11px] text-slate-400">{m.engagement.pointsMet}</div>
        </div>
        <div className="rounded-lg py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="font-display text-xl font-bold tabular-nums text-white">{attention}</div>
          <div className="text-[11px] text-slate-400">{m.engagement.toClose}</div>
        </div>
        <div className="rounded-lg py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="font-display text-xl font-bold tabular-nums"
            style={{ color: statutoryAtRisk > 0 ? 'var(--status-partial-hero)' : 'inherit' }}
          >
            {statutoryAtRisk}
          </div>
          <div className="text-[11px] text-slate-400">{m.engagement.statutoryAtRisk}</div>
        </div>
      </div>
    </div>
  );
}
