import { cn } from '@/lib/cn';
import { Sparkline } from '@/components/library/Sparkline';

/**
 * One Delivery Compass measure: value, state against target, trend, and how it is measured.
 * `onTarget` false switches the tile to the warn treatment (wash + text), never colour alone.
 */
export function MeasureTile({
  label,
  value,
  onTarget,
  stateLabel,
  trend,
  trendLabel,
  footnote,
  lowerIsBetter = false,
  className,
}: {
  label: string;
  value: string;
  /** null when there is no reading yet: the tile shows neutrally. */
  onTarget: boolean | null;
  /** Bilingual state text from copy, for example "On target". */
  stateLabel?: string;
  trend: number[];
  trendLabel: string;
  footnote?: string;
  lowerIsBetter?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2.5 rounded-asm-lg border p-5', onTarget !== false ? 'border-asm-line bg-asm-surface' : 'border-asm-warn-line bg-asm-warn-wash-2', className)}>
      <span className="text-sm text-asm-ink-3">{label}</span>
      <div className="flex items-baseline gap-2.5">
        <span className="text-[32px] font-bold leading-none text-asm-brand tabular-nums">{value}</span>
        {stateLabel && onTarget !== null ? <span className={cn('text-[13px] font-semibold', onTarget ? 'text-asm-ok-ink' : 'text-asm-warn-ink')}>{stateLabel}</span> : null}
      </div>
      {trend.length > 1 ? <Sparkline values={trend} label={trendLabel} tone={onTarget === false ? 'warn' : 'brand'} invert={lowerIsBetter} /> : null}
      {footnote ? <span className="text-xs text-asm-ink-3">{footnote}</span> : null}
    </div>
  );
}
