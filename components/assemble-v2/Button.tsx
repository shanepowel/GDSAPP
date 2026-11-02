import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/assemble-v2/cn';

/**
 * Button and ButtonLink.
 * - primary: the one main action on a screen or card.
 * - secondary: supporting actions.
 * - ghost: low-emphasis text action.
 * - inverse / inverse-outline: on brand-blue surfaces (hero, Next action card, sidebar).
 * Minimum height 44px (md) or 40px (sm) for touch targets.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-asm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-asm-brand text-asm-on-brand hover:bg-asm-brand-hover',
        secondary: 'bg-asm-surface text-asm-brand border border-asm-line-strong hover:bg-asm-brand-wash',
        ghost: 'text-asm-brand hover:underline underline-offset-4',
        inverse: 'bg-asm-white text-asm-brand hover:bg-asm-brand-wash',
        'inverse-outline': 'border border-asm-on-brand-line text-asm-on-brand hover:bg-asm-brand-hover',
        accent: 'bg-asm-brand-mid text-asm-on-brand hover:bg-asm-brand',
      },
      size: {
        md: 'h-11 px-4 text-[15px]',
        sm: 'h-10 px-3.5 text-sm',
        lg: 'h-12 px-5 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
