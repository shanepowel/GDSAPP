import { FileText } from 'lucide-react';
import type { StandardPoint } from '@/lib/assemble-v2/types';

/** Shows one standard point, its evidence, and which other frameworks the same evidence supports. */
export function CrosswalkPanel({ point }: { point: StandardPoint }) {
  return (
    <section aria-labelledby="xw-title" className="overflow-hidden rounded-asm-lg border border-asm-line bg-asm-surface">
      <div className="flex flex-col gap-1.5 bg-asm-brand px-6 py-5">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-asm-brand-tint">
          {point.framework}, point {point.ref}
        </span>
        <h2 id="xw-title" className="text-lg font-bold leading-snug text-asm-on-brand">
          {point.title}
        </h2>
      </div>
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex flex-col gap-2">
          <h3 className="text-[13px] font-semibold text-asm-ink-2">Evidence</h3>
          {point.evidence.length ? (
            <ul className="flex flex-col gap-2">
              {point.evidence.map((e) => (
                <li key={e} className="flex items-center gap-2.5 text-sm text-asm-ink">
                  <FileText size={16} className="text-asm-brand" aria-hidden="true" />
                  {e}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-asm-ink-3">No evidence yet. Add it where the work happens and it appears here.</p>
          )}
        </div>
        {point.alsoSupports.length ? (
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[13px] font-semibold text-asm-ink-2">The same evidence also supports</h3>
            {point.alsoSupports.map((s) => (
              <div key={s.framework + s.title} className="flex flex-col gap-0.5 rounded-asm border border-asm-line px-3.5 py-3">
                <span className="text-xs font-bold text-asm-brand">{s.framework}</span>
                <span className="text-sm text-asm-ink">{s.title}</span>
              </div>
            ))}
          </div>
        ) : null}
        <p className="rounded-[8px] bg-asm-canvas p-3 text-[13px] text-asm-ink-2">Evidence once, use it for every framework that needs it.</p>
      </div>
    </section>
  );
}
