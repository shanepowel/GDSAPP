import { cn } from '@/lib/assemble-v2/cn';

/** A headline number with a note. `tone="warn"` when it needs attention (with words that say why). */
export function StatTile({ label, value, note, tone = 'neutral', className }: { label: string; value: string; note?: string; tone?: 'neutral' | 'ok' | 'warn'; className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-1 basis-[200px] flex-col gap-1 rounded-asm-lg border px-5 py-4', tone === 'warn' ? 'border-asm-warn-line bg-asm-warn-wash-2' : 'border-asm-line bg-asm-surface', className)}>
      <span className="text-sm text-asm-ink-3">{label}</span>
      <span className="text-[28px] font-bold text-asm-brand tabular-nums">{value}</span>
      {note ? <span className={cn('text-xs font-semibold', tone === 'ok' ? 'text-asm-ok-ink' : tone === 'warn' ? 'text-asm-warn-ink' : 'text-asm-ink-3')}>{note}</span> : null}
    </div>
  );
}
