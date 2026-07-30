'use client';

const VERDICTS = {
  met: { label: 'Met', glyph: '●', wash: 'var(--verdict-met-wash)', ink: 'var(--verdict-met)' },
  'at-risk': {
    label: 'At risk',
    glyph: '▲',
    wash: 'var(--verdict-at-risk-wash)',
    ink: 'var(--verdict-at-risk)',
  },
  'not-met': {
    label: 'Not met',
    glyph: '■',
    wash: 'var(--verdict-not-met-wash)',
    ink: 'var(--verdict-not-met)',
  },
  'not-assessed': {
    label: 'Not assessed',
    glyph: '○',
    wash: 'var(--verdict-unassessed-wash)',
    ink: 'var(--verdict-unassessed)',
  },
} as const;

export type VerdictValue = keyof typeof VERDICTS;

export function Verdict({
  value,
  onOpenChain,
}: {
  value: VerdictValue | string;
  onOpenChain?: () => void;
}) {
  const v = VERDICTS[value as VerdictValue] ?? VERDICTS['not-assessed'];
  const content = (
    <span
      className="inline-flex items-center gap-1.5 rounded-[2px] px-2 py-1 text-[13px] font-medium"
      style={{ background: v.wash, color: v.ink }}
    >
      <span aria-hidden>{v.glyph}</span>
      <span>{v.label}</span>
    </span>
  );

  if (!onOpenChain) return content;

  return (
    <button
      type="button"
      className="rounded-[2px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus)]"
      onClick={onOpenChain}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenChain();
        }
      }}
    >
      {content}
    </button>
  );
}
