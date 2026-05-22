import { CheckCircle2, CircleAlert, CircleCheck, Info, XCircle } from 'lucide-react';

export type StatusKind = 'strong' | 'met' | 'partial' | 'gap' | 'info';

const MAP: Record<StatusKind, { label: string; Icon: typeof Info }> = {
  strong: { label: 'Strong', Icon: CheckCircle2 },
  met: { label: 'Met', Icon: CircleCheck },
  partial: { label: 'Partial', Icon: CircleAlert },
  gap: { label: 'Not met', Icon: XCircle },
  info: { label: 'Info', Icon: Info },
};

const STATUS_COLOUR: Record<StatusKind, string> = {
  strong: 'var(--status-strong)',
  met: 'var(--status-met)',
  partial: 'var(--status-partial)',
  gap: 'var(--status-gap)',
  info: 'var(--status-info)',
};

export function StatusPill({ kind, children }: { kind: StatusKind; children?: React.ReactNode }) {
  const { label, Icon } = MAP[kind];
  const colour = STATUS_COLOUR[kind];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium"
      style={{ color: colour, background: `color-mix(in srgb, ${colour} 8%, transparent)` }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{children ?? label}</span>
    </span>
  );
}
