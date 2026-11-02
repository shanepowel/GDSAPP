import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/library/Button';
import { cn } from '@/lib/cn';

/**
 * The single most important thing to do on an engagement.
 * `sentence` comes from nextActionSentence() in lib/attention/sentence.ts.
 * `emphasis="hero"` is the brand panel on the engagement overview; `"soft"` sits inside cards.
 */
export function NextActionCard({
  sentence,
  action,
  href,
  label,
  emphasis = 'hero',
  secondary,
  className,
}: {
  sentence: string;
  action: string;
  href: string;
  label?: string;
  emphasis?: 'hero' | 'soft';
  secondary?: ReactNode;
  className?: string;
}) {
  if (emphasis === 'soft') {
    return (
      <div className={cn('flex flex-col gap-1 rounded-asm bg-asm-canvas px-3.5 py-3', className)}>
        {label ? <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-asm-brand">{label}</span> : null}
        <span className="text-sm text-asm-ink">{sentence}</span>
      </div>
    );
  }
  return (
    <section aria-label={label} className={cn('flex flex-wrap items-center justify-between gap-5 rounded-asm-lg bg-asm-brand px-7 py-6', className)}>
      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-1.5">
        {label ? <span className="text-xs font-bold uppercase tracking-[0.08em] text-asm-brand-tint">{label}</span> : null}
        <p className="m-0 text-xl font-semibold leading-snug text-asm-on-brand">{sentence}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <ButtonLink href={href} variant="inverse">
          {action}
        </ButtonLink>
        {secondary}
      </div>
    </section>
  );
}
