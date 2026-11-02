import type { EngagementStatus } from '@/lib/assemble-v2/types';
import { cn } from '@/lib/assemble-v2/cn';

const MAP: Record<EngagementStatus, { label: string; cls: string; glyph: React.ReactNode }> = {
  'on-track': {
    label: 'On track',
    cls: 'bg-asm-ok-wash text-asm-ok-ink',
    glyph: <path d="M5 12l5 5 9-10" />,
  },
  'at-risk': {
    label: 'At risk',
    cls: 'bg-asm-warn-wash text-asm-warn-ink',
    glyph: (
      <>
        <path d="M12 4l9 16H3z" />
        <path d="M12 10v4M12 17h.01" />
      </>
    ),
  },
  'off-track': {
    label: 'Off track',
    cls: 'bg-asm-risk-wash text-asm-risk-ink',
    glyph: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </>
    ),
  },
};

export const statusLabel = (s: EngagementStatus) => MAP[s].label;

/** Engagement status pill: glyph + label + wash. Never colour alone. */
export function StatusPill({ status, size = 'md', className }: { status: EngagementStatus; size?: 'sm' | 'md'; className?: string }) {
  const m = MAP[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap', size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-[13px]', m.cls, className)}>
      <svg width={size === 'sm' ? 12 : 14} height={size === 'sm' ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {m.glyph}
      </svg>
      {m.label}
    </span>
  );
}
