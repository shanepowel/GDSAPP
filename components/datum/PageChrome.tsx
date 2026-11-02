import Link from 'next/link';
import type { Copy } from '@/lib/copy';
import { ButtonLink } from '@/components/library/Button';

export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="asm-root mb-8 flex flex-col gap-2">
      <p className="eyebrow m-0">{eyebrow}</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 text-[30px] font-bold leading-tight text-asm-brand">{title}</h1>
        {actions ? <div className="mb-1 flex flex-wrap items-center gap-2.5">{actions}</div> : null}
      </div>
      {lede ? <p className="m-0 max-w-[68ch] text-base text-asm-ink-3">{lede}</p> : null}
    </header>
  );
}

export function InkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return <ButtonLink href={href}>{children}</ButtonLink>;
}

export function EmptyState({
  title,
  why,
  actionHref,
  actionLabel,
}: {
  title: string;
  why: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex max-w-[60ch] flex-col items-start gap-2 rounded-asm-lg border border-dashed border-asm-line-strong bg-asm-surface px-6 py-8">
      <p className="m-0 text-base font-bold text-asm-brand">{title}</p>
      <p className="m-0 text-sm text-asm-ink-2">{why}</p>
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref} className="mt-2">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </div>
  );
}

export function StatStrip({ items }: { items: { label: string; value: string; note?: string }[] }) {
  const cols = items.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3';
  return (
    <div className={`mb-8 grid grid-cols-1 gap-4 ${cols}`}>
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1 rounded-asm-lg border border-asm-line bg-asm-surface px-5 py-4">
          <span className="text-sm text-asm-ink-3">{item.label}</span>
          <span className="text-[28px] font-bold leading-tight text-asm-brand tabular-nums">{item.value}</span>
          {item.note ? <span className="text-xs text-asm-ink-3">{item.note}</span> : null}
        </div>
      ))}
    </div>
  );
}

export function FitLegend({ copy }: { copy: Copy['legend'] }) {
  return (
    <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2 font-data text-[10px] text-asm-ink-3">
      <li className="flex items-center gap-2">
        <span className="legend-swatch is-held" aria-hidden />
        {copy.held}
      </li>
      <li className="flex items-center gap-2">
        <span className="legend-swatch is-partial" aria-hidden />
        {copy.partial}
      </li>
      <li className="flex items-center gap-2">
        <span className="legend-swatch is-absent" aria-hidden />
        {copy.absent}
      </li>
      <li className="flex items-center gap-2">
        <span className="legend-swatch is-datum" aria-hidden />
        {copy.datum}
      </li>
      <li className="flex items-center gap-2">
        <span className="legend-swatch is-bracket" aria-hidden />
        {copy.bracket}
      </li>
    </ul>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-9 items-center rounded-asm border border-asm-line-strong bg-asm-surface px-3.5 text-sm font-semibold text-asm-brand no-underline hover:border-asm-brand-soft hover:bg-asm-brand-wash"
    >
      {children}
    </Link>
  );
}
