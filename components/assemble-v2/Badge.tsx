import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/assemble-v2/cn';

/** Small label. Status tones (ok, warn, risk) are for status only and need text that names the state. */
export const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap', {
  variants: {
    tone: {
      neutral: 'bg-asm-sunk text-asm-ink-2',
      brand: 'bg-asm-brand-wash text-asm-brand',
      ok: 'bg-asm-ok-wash text-asm-ok-ink',
      warn: 'bg-asm-warn-wash text-asm-warn-ink',
      risk: 'bg-asm-risk-wash text-asm-risk-ink',
      inverse: 'border border-asm-on-brand-line text-asm-on-brand',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export function Badge({ className, tone, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
