import { cn } from '@/lib/cn';

/** Wizard progress: numbered steps, current step labelled for screen readers. */
export function Stepper({ steps, current, label = 'Progress' }: { steps: readonly string[]; current: number; label?: string }) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label={label}>
      {steps.map((s, i) => (
        <li key={s} aria-current={i === current ? 'step' : undefined} className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold', i === current ? 'bg-asm-brand text-asm-on-brand' : i < current ? 'bg-asm-brand-wash text-asm-brand' : 'bg-asm-sunk text-asm-ink-3')}>
          <span className="tabular-nums">{i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}
