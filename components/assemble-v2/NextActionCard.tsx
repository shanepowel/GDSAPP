import type { NextAction } from '@/lib/assemble-v2/types';
import { cn } from '@/lib/assemble-v2/cn';
import { ButtonLink } from './Button';

/**
 * The single most important thing to do on an engagement, from lib/assemble-v2/next-action.ts.
 * `emphasis="hero"` is the dark panel on the engagement overview; `"soft"` is the card version.
 */
export function NextActionCard({ action, emphasis = 'hero', secondary, className }: { action: NextAction; emphasis?: 'hero' | 'soft'; secondary?: React.ReactNode; className?: string }) {
  if (emphasis === 'soft') {
    return (
      <div className={cn('flex flex-col gap-1 rounded-asm bg-asm-canvas px-3.5 py-3', className)}>
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-asm-brand">Next action</span>
        <span className="text-sm text-asm-ink">{action.text}</span>
      </div>
    );
  }
  return (
    <section aria-label="Next action" className={cn('flex flex-wrap items-center justify-between gap-5 rounded-asm-lg bg-asm-brand px-7 py-6', className)}>
      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-asm-brand-tint">Next action</span>
        <p className="text-xl font-semibold leading-snug text-asm-on-brand">{action.text}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <ButtonLink href={action.href} variant="inverse">
          {action.cta}
        </ButtonLink>
        {secondary}
      </div>
    </section>
  );
}
