import Link from 'next/link';
import { lifecycleIndex, LIFECYCLE_STAGES, type LifecycleStage } from '@/lib/attention/lifecycle';
import { cn } from '@/lib/cn';

/**
 * The lifecycle spine. Completed stages are filled and ticked, the current stage is labelled,
 * future stages are outlined. `full` sits above engagement tabs; `compact` is for cards.
 * All text comes from copy so it is bilingual.
 */
export function LifecycleBar({
  current,
  labels,
  doneLabel,
  currentLabel,
  ariaLabel,
  links,
  progressLabel,
  variant = 'full',
  className,
}: {
  current: LifecycleStage | null;
  labels: Record<LifecycleStage, string>;
  doneLabel: string;
  currentLabel: string;
  ariaLabel: string;
  links?: Partial<Record<LifecycleStage, string>>;
  progressLabel?: string;
  variant?: 'full' | 'compact';
  className?: string;
}) {
  const currentIndex = current ? lifecycleIndex(current) : -1;

  if (variant === 'compact') {
    const name = current ? labels[current] : '';
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <div className="grid grid-cols-7 gap-[3px]" role="img" aria-label={`${ariaLabel}: ${name}${progressLabel ? `, ${progressLabel}` : ''}`}>
          {LIFECYCLE_STAGES.map((stage, index) => (
            <div key={stage} className={cn('h-[5px] rounded-full', index < currentIndex ? 'bg-asm-brand' : index === currentIndex ? 'bg-asm-brand-soft' : 'bg-asm-line')} />
          ))}
        </div>
        <span className="text-[13px] text-asm-ink-2">{progressLabel ? `${name}, ${progressLabel}` : name}</span>
      </div>
    );
  }

  return (
    <ol aria-label={ariaLabel} className={cn('flex flex-wrap gap-2 rounded-asm-lg border border-asm-line bg-asm-surface px-6 py-5', className)}>
      {LIFECYCLE_STAGES.map((stage, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'future';
        const body = (
          <span className="flex flex-col gap-2">
            <span className={cn('h-1.5 rounded-full', state === 'done' ? 'bg-asm-brand' : state === 'current' ? 'bg-gradient-to-r from-asm-brand from-60% to-asm-brand-wash-2 to-60%' : 'bg-asm-line')} />
            <span className={cn('flex items-center gap-1.5 text-[13px]', state === 'current' ? 'font-bold text-asm-brand' : state === 'done' ? 'text-asm-ink-2' : 'text-asm-ink-3')}>
              {state === 'done' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-asm-brand">
                  <path d="M5 12l5 5 9-10" />
                </svg>
              ) : null}
              {labels[stage]}
              {state === 'current' && progressLabel ? <span className="font-normal text-asm-ink-3">· {progressLabel}</span> : null}
              {state === 'done' ? <span className="sr-only"> {doneLabel}</span> : null}
              {state === 'current' ? <span className="sr-only"> {currentLabel}</span> : null}
            </span>
          </span>
        );
        const href = links?.[stage];
        return (
          <li key={stage} aria-current={state === 'current' ? 'step' : undefined} className="min-w-[96px] flex-1">
            {href ? (
              <Link href={href} className="block rounded-asm no-underline hover:opacity-80" style={{ minHeight: 'var(--target-min)' }}>
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ol>
  );
}
