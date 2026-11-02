import type { DeliveryStatus as DeliveryStatusValue } from '@/lib/attention/next-action';
import { cn } from '@/lib/cn';

const TONE: Record<DeliveryStatusValue, { cls: string; glyph: React.ReactNode }> = {
  'on-track': { cls: 'bg-asm-ok-wash text-asm-ok-ink', glyph: <path d="M5 12l5 5 9-10" /> },
  'at-risk': {
    cls: 'bg-asm-warn-wash text-asm-warn-ink',
    glyph: (
      <>
        <path d="M12 4l9 16H3z" />
        <path d="M12 10v4M12 17h.01" />
      </>
    ),
  },
  'off-track': {
    cls: 'bg-asm-risk-wash text-asm-risk-ink',
    glyph: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </>
    ),
  },
};

/**
 * Engagement status: glyph + label + wash, never colour alone.
 * `label` comes from copy (statusLabel in components/engagement/shared.tsx) so it is bilingual.
 */
export function DeliveryStatus({
  status,
  label,
  size = 'md',
  className,
}: {
  status: DeliveryStatusValue;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const tone = TONE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-[13px]',
        tone.cls,
        className,
      )}
      style={{ minHeight: 'var(--target-min)' }}
    >
      <svg width={size === 'sm' ? 12 : 14} height={size === 'sm' ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {tone.glyph}
      </svg>
      {label}
    </span>
  );
}
