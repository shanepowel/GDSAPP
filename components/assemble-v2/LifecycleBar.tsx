import { LIFECYCLE, type LifecycleStage } from '@/lib/assemble-v2/types';
import { cn } from '@/lib/assemble-v2/cn';

/**
 * The lifecycle spine. Completed stages are filled with a tick, the current stage is labelled,
 * future stages are outlined. `compact` is for cards; `full` sits above engagement tabs.
 */
export function LifecycleBar({ stage, progressLabel, variant = 'full', className }: { stage: LifecycleStage; progressLabel?: string; variant?: 'full' | 'compact'; className?: string }) {
  const current = LIFECYCLE.findIndex((s) => s.key === stage);
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <div className="grid grid-cols-7 gap-[3px]" role="img" aria-label={`Lifecycle: ${LIFECYCLE[current].label}${progressLabel ? `, ${progressLabel}` : ''}`}>
          {LIFECYCLE.map((s, i) => (
            <div key={s.key} className={cn('h-[5px] rounded-full', i < current ? 'bg-asm-brand' : i === current ? 'bg-asm-brand-soft' : 'bg-asm-line')} />
          ))}
        </div>
        {progressLabel ? <span className="text-[13px] text-asm-ink-2">{progressLabel}</span> : null}
      </div>
    );
  }
  return (
    <ol className={cn('flex flex-wrap gap-2 rounded-asm-lg border border-asm-line bg-asm-surface px-6 py-5', className)} aria-label="Lifecycle">
      {LIFECYCLE.map((s, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li key={s.key} className="flex min-w-[110px] flex-1 flex-col gap-2" aria-current={now ? 'step' : undefined}>
            <div className={cn('h-1.5 rounded-full', done ? 'bg-asm-brand' : now ? 'bg-gradient-to-r from-asm-brand from-60% to-asm-brand-wash-2 to-60%' : 'bg-asm-line')} />
            <span className={cn('flex items-center gap-1.5 text-[13px]', now ? 'font-bold text-asm-brand' : done ? 'text-asm-ink-2' : 'text-asm-ink-3')}>
              {done ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-asm-brand">
                  <path d="M5 12l5 5 9-10" />
                </svg>
              ) : null}
              {s.label}
              {now && progressLabel ? <span className="font-normal text-asm-ink-3">· {progressLabel}</span> : null}
              {done ? <span className="sr-only">(complete)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
