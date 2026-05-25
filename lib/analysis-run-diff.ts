import type { AnalysisResult } from '@/lib/types/analysis';

export interface RunDiffRow {
  label: string;
  before: number;
  after: number;
  delta: number;
}

export function diffAnalysisRuns(
  previous: { overallReadiness: number; result: unknown } | undefined,
  latest: { overallReadiness: number; result: unknown },
): RunDiffRow[] {
  const prev = previous?.result as AnalysisResult | undefined;
  const next = latest.result as AnalysisResult | undefined;

  const rows: RunDiffRow[] = [
    {
      label: 'Overall readiness',
      before: Math.round(previous?.overallReadiness ?? 0),
      after: Math.round(latest.overallReadiness),
      delta: Math.round(latest.overallReadiness - (previous?.overallReadiness ?? 0)),
    },
  ];

  if (prev && next) {
    rows.push({
      label: 'Composition',
      before: Math.round(prev.composition.overallPercent),
      after: Math.round(next.composition.overallPercent),
      delta: Math.round(next.composition.overallPercent - prev.composition.overallPercent),
    });
    const prevGaps = prev.readiness.points.filter(
      (p) => p.status === 'gap' || p.status === 'partial',
    ).length;
    const nextGaps = next.readiness.points.filter(
      (p) => p.status === 'gap' || p.status === 'partial',
    ).length;
    rows.push({
      label: 'Open readiness points',
      before: prevGaps,
      after: nextGaps,
      delta: nextGaps - prevGaps,
    });
  }

  return rows;
}
