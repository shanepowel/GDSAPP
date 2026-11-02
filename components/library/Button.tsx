import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { space, TARGET } from '@/components/library/sizing';

const button = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-asm-brand text-asm-on-brand hover:bg-asm-brand-hover',
        secondary: 'border border-asm-line-strong bg-asm-surface text-asm-brand hover:bg-asm-brand-wash',
        tertiary: 'text-asm-brand underline-offset-4 hover:underline',
        ghost: 'text-asm-brand underline-offset-4 hover:underline',
        destructive: 'border border-asm-risk text-asm-risk-ink hover:bg-asm-risk-wash',
        inverse: 'bg-asm-white text-asm-brand hover:bg-asm-brand-wash',
        'inverse-outline': 'border border-asm-on-brand-line text-asm-on-brand hover:bg-asm-brand-hover',
        accent: 'bg-asm-brand-mid text-asm-on-brand hover:bg-asm-brand',
      },
      size: {
        md: '',
        sm: '',
        lg: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonSize = 'md' | 'sm' | 'lg';
export type ButtonVariant = NonNullable<VariantProps<typeof button>['variant']>;

export function buttonMetrics(size: ButtonSize): CSSProperties {
  const shared: CSSProperties = {
    gap: space(2),
    borderRadius: 'var(--radius)',
    fontSize: 'var(--type-label-size)',
    fontWeight: 600,
    lineHeight: 'var(--type-label-leading)',
  };
  if (size === 'sm') {
    return {
      ...shared,
      minHeight: space(6),
      paddingInline: space(3),
      paddingBlock: space(1),
      fontSize: 'var(--type-label-size)',
    };
  }
  if (size === 'lg') {
    return {
      ...shared,
      minHeight: space(8),
      paddingInline: space(5),
      paddingBlock: space(2),
      fontSize: 'var(--type-body-size)',
    };
  }
  return {
    ...shared,
    minHeight: TARGET.control,
    paddingInline: space(4),
    paddingBlock: space(2),
    fontSize: 'var(--type-body-size)',
  };
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>;

export function Button({ className, variant, size, style, ...props }: ButtonProps) {
  const resolved = size ?? 'md';
  return (
    <button
      type="button"
      className={button({ variant, size: resolved, className })}
      style={{ ...buttonMetrics(resolved), ...style }}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  children,
  className,
  variant,
  size,
  style,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  const resolved = size ?? 'md';
  return (
    <Link
      href={href}
      onClick={onClick}
      className={button({ variant, size: resolved, className })}
      style={{ ...buttonMetrics(resolved), ...style }}
    >
      {children}
    </Link>
  );
}
