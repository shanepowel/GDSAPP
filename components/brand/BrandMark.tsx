import Link from 'next/link';

/** Assemble by Turner & Townsend lockup. */
export function BrandMark({
  href = '/',
  size = 'md',
}: {
  href?: string;
  size?: 'sm' | 'md';
}) {
  const markSize = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-10 w-10 text-sm';
  const productClass = size === 'sm' ? 'text-[15px]' : 'text-lg';

  const content = (
    <>
      <div
        className={`grid ${markSize} place-items-center rounded-lg font-bold tracking-tight`}
        style={{
          background: 'var(--tt-charcoal)',
          color: 'var(--tt-cyan)',
          borderBottom: '2px solid var(--tt-cyan)',
        }}
        aria-hidden
      >
        A
      </div>
      <div>
        <div className={`${productClass} font-semibold leading-none text-text`}>Assemble</div>
        <div className="mt-0.5 text-[11px] text-text-muted">by Turner & Townsend</div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-3">
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-3">{content}</div>;
}
