'use client';

const LABELS = {
  human: 'Human',
  ai: 'AI suggested',
  integration: 'Pulled from integration',
  import: 'Imported',
  manual: 'Human',
  system: 'System',
} as const;

export type ProvenanceKind = keyof typeof LABELS;

/** Four provenance states — mandatory on judgements and evidence rows. */
export function ProvenanceChip({ kind }: { kind: ProvenanceKind | string }) {
  const label = LABELS[kind as ProvenanceKind] ?? kind;
  return (
    <span className="font-data inline-block rounded-[2px] border border-rule bg-stock-1 px-2 py-0.5 text-[11px] uppercase tracking-[0.04em] text-ink-1">
      {label}
    </span>
  );
}
