import { cn } from '@/lib/assemble-v2/cn';
import { Sparkline } from './Sparkline';

/**
 * One Delivery Compass measure: value, state against target, trend, and how it is measured.
 * `onTarget` false switches the tile to the warn treatment (wash + text), never colour alone.
 */
export function MeasureTile({
  label,
  value,
  onTarget,
  trend,
  trendLabel,
  footnote,
  lowerIsBetter = false,
  className,
}: {
  label: string;
  value: string;
  onTarget: boolean;
  trend: number[];
  trendLabel: string;
  footnote: string;
  lowerIsBetter?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2.5 rounded-asm-lg border p-5', onTarget ? 'border-asm-line bg-asm-surface' : 'border-asm-warn-line bg-asm-warn-wash-2', className)}>
      <span className="text-sm text-asm-ink-3">{label}</span>
      <div className="flex items-baseline gap-2.5">
        <span className="text-[32px] font-bold leading-none text-asm-brand tabular-nums">{value}</span>
        <span className={cn('text-[13px] font-semibold', onTarget ? 'text-asm-ok-ink' : 'text-asm-warn-ink')}>{onTarget ? 'On target' : 'Below target'}</span>
      </div>
      <Sparkline values={trend} label={trendLabel} tone={onTarget ? 'brand' : 'warn'} invert={lowerIsBetter} />
      <span className="text-xs text-asm-ink-3">{footnote}</span>
    </div>
  );
}
