import Link from 'next/link';
import { BRAND } from '@/lib/brand';

/** Header lockup: Turner & Townsend + Assemble badge (matches showcase prototype). */
export function BrandMark({
  href = '/',
  variant = 'light',
}: {
  href?: string;
  variant?: 'light' | 'dark';
}) {
  const onDark = variant === 'dark';

  const content = (
    <div className="flex items-center gap-2.5">
      <span
        className={`font-display text-[17px] font-extrabold tracking-tight ${onDark ? 'text-white' : 'text-text'}`}
      >
        {BRAND.company}
      </span>
      <span
        className="rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white"
        style={{ background: 'var(--tt-blue)' }}
      >
        {BRAND.product}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
