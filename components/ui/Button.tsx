import { cva, type VariantProps } from 'class-variance-authority';

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-focus-ring)] focus-visible:ring-offset-2 disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-text-inverse hover:bg-brand-hover',
        secondary: 'bg-surface border border-border text-text hover:bg-surface-alt',
        tertiary: 'text-brand hover:underline',
        destructive:
          'border border-status-gap text-status-gap hover:bg-[color:var(--status-gap)]/10',
      },
      size: { md: 'h-11 px-5 text-sm', sm: 'h-9 px-3 text-sm' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>) {
  return <button type="button" className={button({ variant, size, className })} {...props} />;
}
