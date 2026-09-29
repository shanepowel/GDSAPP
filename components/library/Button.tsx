import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { space, TARGET } from '@/components/library/sizing';

const button = cva(
  'inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-text-inverse hover:bg-brand-hover',
        secondary: 'bg-surface border border-border text-text hover:bg-surface-alt',
        tertiary: 'text-brand hover:underline',
        destructive:
          'border border-status-gap text-status-gap hover:bg-[color:var(--status-gap)]/10',
      },
      size: {
        md: '',
        sm: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonSize = 'md' | 'sm';
export type ButtonVariant = NonNullable<VariantProps<typeof button>['variant']>;

export function buttonMetrics(size: ButtonSize): CSSProperties {
  const shared: CSSProperties = {
    gap: space(2),
    borderRadius: 'var(--radius)',
    fontSize: 'var(--type-label-size)',
    fontWeight: 'var(--type-label-weight)',
    lineHeight: 'var(--type-label-leading)',
  };
  if (size === 'sm') {
    return {
      ...shared,
      minHeight: space(6),
      paddingInline: space(3),
      paddingBlock: space(1),
    };
  }
  return {
    ...shared,
    minHeight: TARGET.control,
    paddingInline: space(4),
    paddingBlock: space(2),
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
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: CSSProperties;
}) {
  const resolved = size ?? 'md';
  return (
    <Link
      href={href}
      className={button({ variant, size: resolved, className })}
      style={{ ...buttonMetrics(resolved), ...style }}
    >
      {children}
    </Link>
  );
}
