const BANDS = [
  { min: 85, label: 'Strong', kind: 'strong' as const },
  { min: 65, label: 'On track', kind: 'met' as const },
  { min: 40, label: 'At risk', kind: 'partial' as const },
  { min: 0, label: 'Not ready', kind: 'gap' as const },
];
const COLOUR: Record<string, string> = {
  strong: 'var(--status-strong)',
  met: 'var(--status-met)',
  partial: 'var(--status-partial)',
  gap: 'var(--status-gap)',
};

export function ScoreBar({ value, label }: { value: number; label?: string }) {
  const band = BANDS.find((b) => value >= b.min)!;
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-2.5 flex-1 rounded-full bg-surface-alt"
        role="img"
        aria-label={`${label ?? 'Readiness'} ${Math.round(value)} percent, ${band.label}`}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: COLOUR[band.kind] }}
        />
      </div>
      <span className="tabular-nums text-sm font-semibold">{Math.round(value)}%</span>
      <span className="text-sm text-text-muted">{band.label}</span>
    </div>
  );
}
