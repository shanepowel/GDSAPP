import Link from 'next/link';

/** Turner & Townsend logo lockup: charcoal mark + cyan accent. */
export function BrandMark({
  href = '/',
  size = 'md',
  showProduct = true,
}: {
  href?: string;
  size?: 'sm' | 'md';
  showProduct?: boolean;
}) {
  const markSize = size === 'sm' ? 'h-9 w-9 text-sm' : 'h-10 w-10 text-base';
  const companyClass = size === 'sm' ? 'text-[15px]' : 'text-base';

  const content = (
    <>
      <div
        className={`grid ${markSize} place-items-center rounded-lg font-semibold tracking-tight`}
        style={{
          background: 'var(--tt-charcoal)',
          color: 'var(--tt-cyan)',
          borderBottom: '2px solid var(--tt-cyan)',
        }}
        aria-hidden
      >
        T&T
      </div>
      <div>
        <div className={`${companyClass} font-semibold leading-none text-text`}>
          Turner & Townsend
        </div>
        {showProduct && (
          <div className="mt-0.5 text-[11px] font-medium text-brand">Standard Readiness</div>
        )}
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
