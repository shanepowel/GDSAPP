import { CheckCircle2, CircleAlert, CircleCheck, Info, XCircle } from 'lucide-react';

export type StatusKind = 'strong' | 'met' | 'partial' | 'gap' | 'info';

const MAP: Record<StatusKind, { label: string; cls: string; Icon: typeof Info }> = {
  strong: {
    label: 'Strong',
    cls: 'text-status-strong bg-[color:var(--status-strong)]/10',
    Icon: CheckCircle2,
  },
  met: {
    label: 'Met',
    cls: 'text-status-met bg-[color:var(--status-met)]/10',
    Icon: CircleCheck,
  },
  partial: {
    label: 'Partial',
    cls: 'text-status-partial bg-[color:var(--status-partial)]/10',
    Icon: CircleAlert,
  },
  gap: {
    label: 'Not met',
    cls: 'text-status-gap bg-[color:var(--status-gap)]/10',
    Icon: XCircle,
  },
  info: {
    label: 'Info',
    cls: 'text-status-info bg-[color:var(--status-info)]/10',
    Icon: Info,
  },
};

export function StatusPill({ kind, children }: { kind: StatusKind; children?: React.ReactNode }) {
  const { label, cls, Icon } = MAP[kind];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium ${cls}`}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{children ?? label}</span>
    </span>
  );
}
