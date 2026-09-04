import Link from 'next/link';
import { AssembleLogo } from '@/components/brand/AssembleLogo';

/** Product lockup for headers. Inline Assemble wordmark. */
export function BrandMark({
  href = '/',
  variant = 'light',
}: {
  href?: string;
  variant?: 'light' | 'dark';
}) {
  const content = <AssembleLogo variant={variant} />;

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
