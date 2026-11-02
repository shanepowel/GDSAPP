import type { DeliveryStatus as DeliveryStatusValue } from '@/lib/attention/next-action';
import { space } from '@/components/library/sizing';

const TONE: Record<DeliveryStatusValue, { glyph: string; color: string; wash: string }> = {
  'on-track': { glyph: '✓', color: 'var(--ok)', wash: 'var(--ok-tint)' },
  'at-risk': { glyph: '!', color: 'var(--warn)', wash: 'var(--warn-tint)' },
  'off-track': { glyph: '✕', color: 'var(--risk)', wash: 'var(--risk-tint)' },
};

export function DeliveryStatus({
  status,
  label,
}: {
  status: DeliveryStatusValue;
  label: string;
}) {
  const tone = TONE[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: space(1),
        minHeight: 'var(--target-min)',
        paddingInline: space(2),
        paddingBlock: space(1),
        borderRadius: 'var(--radius)',
        background: tone.wash,
        color: tone.color,
        fontSize: 'var(--type-label-size)',
        fontWeight: 600,
        lineHeight: 'var(--type-label-leading)',
      }}
    >
      <span aria-hidden="true">{tone.glyph}</span>
      {label}
    </span>
  );
}
