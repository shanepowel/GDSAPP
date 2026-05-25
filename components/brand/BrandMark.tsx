import Image from 'next/image';
import Link from 'next/link';
import { AssembleLogo } from '@/components/brand/AssembleLogo';
import { BRAND } from '@/lib/brand';

const LOCKUP = {
  dark: '/brand/assemble-lockup-on-dark.svg',
  light: '/brand/assemble-lockup-on-light.svg',
} as const;

/**
 * Product lockup for headers. Uses inline vector mark by default; static SVGs in
 * /public/brand/ are available for exports, email, or swapping in final artwork.
 */
export function BrandMark({
  href = '/',
  variant = 'light',
  useRasterLockup = false,
}: {
  href?: string;
  variant?: 'light' | 'dark';
  /** Set true when replacing with the official placeholder PNG/SVG export */
  useRasterLockup?: boolean;
}) {
  const content = useRasterLockup ? (
    <Image
      src={LOCKUP[variant]}
      alt={BRAND.product}
      width={200}
      height={32}
      className="h-7 w-auto"
      priority
    />
  ) : (
    <AssembleLogo variant={variant} />
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
