import type { Assignment, Person } from '@/lib/assemble-v2/types';
import { cn } from '@/lib/assemble-v2/cn';

const KIND = {
  assigned: 'bg-asm-brand text-asm-on-brand',
  proposed: 'bg-asm-brand-wash-2 text-asm-brand',
  exception: 'bg-asm-warn text-asm-on-brand',
  available: 'border-[1.5px] border-dashed border-asm-ink-3 text-asm-ink-2',
} as const;

/** Six-month resource plan for The Keel. Each bar spans its months on a 6-column grid. */
export function ResourceTimeline({ months, people, assignments }: { months: string[]; people: Person[]; assignments: Assignment[] }) {
  const cols = `200px repeat(${months.length}, minmax(0, 1fr))`;
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px] px-6 pb-5 pt-2">
        <div className="grid border-b border-asm-line-soft py-2.5 text-xs font-semibold text-asm-ink-3" style={{ gridTemplateColumns: cols }}>
          <span>Person</span>
          {months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        {people.map((p) => {
          const rows = assignments.filter((a) => a.personId === p.id);
          if (!rows.length) return null;
          const load = rows.filter((r) => r.kind === 'assigned' || r.kind === 'exception').reduce((n, r) => (r.fromMonth === 0 ? n + r.allocation : n), 0);
          return (
            <div key={p.id} className="grid items-center gap-y-1 border-b border-asm-line-soft py-3 last:border-b-0" style={{ gridTemplateColumns: cols }}>
              <span className="row-span-2 flex flex-col text-sm">
                <span className="font-semibold text-asm-ink">{p.name}</span>
                <span className={cn('text-xs', load > 85 ? 'font-semibold text-asm-warn-ink' : 'text-asm-ink-3')}>
                  {p.role} · {load}%{load > 85 ? ' (over 85%)' : ''}
                </span>
              </span>
              {rows.map((r, i) => (
                <span key={i} className={cn('mx-0.5 truncate rounded-[6px] px-2.5 py-1.5 text-xs font-semibold', KIND[r.kind])} style={{ gridColumn: `${r.fromMonth + 2} / ${r.toMonth + 3}` }} title={r.label}>
                  {r.label}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ResourceLegend() {
  return (
    <div className="flex flex-wrap gap-3.5 text-xs text-asm-ink-2">
      <span className="flex items-center gap-1.5"><span className="h-2 w-3.5 rounded-sm bg-asm-brand" />Assigned</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-3.5 rounded-sm bg-asm-brand-wash-2" />Proposed</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-3.5 rounded-sm bg-asm-warn" />Exception</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-3.5 rounded-sm border-[1.5px] border-dashed border-asm-ink-3" />Available</span>
    </div>
  );
}
