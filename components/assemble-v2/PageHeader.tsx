import { cn } from '@/lib/assemble-v2/cn';

/** Page title, one-line subtitle and up to two actions. One per screen. */
export function PageHeader({ title, subtitle, actions, eyebrow, className }: { title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; eyebrow?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="flex flex-col gap-1.5">
        {eyebrow}
        <h1 className="text-[30px] font-bold leading-tight text-asm-brand">{title}</h1>
        {subtitle ? <p className="text-base text-asm-ink-3">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
    </div>
  );
}
