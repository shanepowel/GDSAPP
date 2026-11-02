import { AlertTriangle, CalendarDays, ArrowRight, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ButtonLink } from '@/components/library/Button';

const ICONS = { warning: AlertTriangle, calendar: CalendarDays, change: ArrowRight, people: Users };

/** One row in "Needs attention": icon, sentence, context line, one action. */
export function AttentionRow({ icon, tone = 'normal', text, context, cta, href }: { icon: keyof typeof ICONS; tone?: 'urgent' | 'normal'; text: string; context?: string; cta: string; href: string }) {
  const Icon = ICONS[icon];
  return (
    <li className="flex flex-wrap items-center gap-4 border-b border-asm-line-soft px-6 py-4 last:border-b-0">
      <span className={cn('flex size-10 flex-none items-center justify-center rounded-asm', tone === 'urgent' ? 'bg-asm-warn-wash text-asm-warn-ink' : 'bg-asm-brand-wash text-asm-brand')} aria-hidden="true">
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
        <span className="text-[15px] font-semibold text-asm-ink">{text}</span>
        {context ? <span className="text-[13px] text-asm-ink-3">{context}</span> : null}
      </div>
      <ButtonLink href={href} variant="secondary" size="sm">
        {cta}
      </ButtonLink>
    </li>
  );
}
