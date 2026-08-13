import Link from 'next/link';
import type { Copy } from '@/lib/copy';

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
    <header className="mb-6">
      <p className="eyebrow mb-2 text-[color:var(--graphite)]">{eyebrow}</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold leading-tight">{title}</h1>
        {actions ? <div className="mb-1 flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {lede ? <p className="mt-2 max-w-[62ch] text-[color:var(--graphite)]">{lede}</p> : null}
    </header>
  );
}

const inkButtonClass =
  'inline-flex min-h-11 items-center rounded-[var(--radius)] bg-[var(--ink)] px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] text-[var(--stock)]';

export function InkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={inkButtonClass}>
      {children}
    </Link>
  );
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
    <div
      className="max-w-[54ch] border border-[color:var(--rule)] bg-[var(--raised)] px-5 py-6"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <p className="font-[family-name:var(--font-cond)] text-[17px] font-semibold">{title}</p>
      <p className="mt-2 text-[15px] text-[color:var(--graphite)]">{why}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={`mt-4 ${inkButtonClass}`}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function StatStrip({ items }: { items: { label: string; value: string; note?: string }[] }) {
  const cols = items.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3';
  return (
    <div className={`mb-6 grid grid-cols-1 gap-px bg-[var(--rule)] ${cols}`}>
      {items.map((item) => (
        <div key={item.label} className="bg-[var(--raised)] p-4">
          <div className="font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
            {item.label}
          </div>
          <div className="mt-1 font-data text-[26px] tabular-nums">{item.value}</div>
          {item.note ? <div className="text-[12px] text-[color:var(--graphite)]">{item.note}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function FitLegend({ copy }: { copy: Copy['legend'] }) {
  return (
    <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2 font-data text-[10px] text-[color:var(--graphite)]">
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
    <Link href={href} className="text-sm underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}
