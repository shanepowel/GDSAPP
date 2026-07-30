'use client';

import { relationLabel } from '@/lib/crosswalk/gap-list';

type MatrixCriterion = { id: string; ref: string; title: string };

type MatrixRow = {
  itemId: string;
  ref: string;
  title: string;
  question: string | null;
  cells: Record<
    string,
    { relation: string; note: string | null; evidenceCount: number }
  >;
};

function cellLabel(relation: string | undefined): string {
  if (!relation) return '—';
  if (relation === 'satisfies') return 'S';
  if (relation === 'partially') return 'P';
  if (relation === 'informs') return 'I';
  return relation.slice(0, 1).toUpperCase();
}

export function CrosswalkMatrix({
  criteria,
  rows,
  coveragePercent,
}: {
  criteria: MatrixCriterion[];
  rows: MatrixRow[];
  coveragePercent: number;
}) {
  return (
    <section aria-labelledby="crosswalk-matrix-heading" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="crosswalk-matrix-heading" className="text-[17px] font-semibold text-ink-0">
          Crosswalk matrix
        </h2>
        <p className="font-data text-[13px] text-ink-1">
          Coverage{' '}
          <span className="text-[18px] font-semibold text-ink-0">{coveragePercent}%</span>
        </p>
      </div>
      <p className="text-[13px] text-ink-2">
        S = satisfies · P = partially · I = informs. Keyboard: tab through cells.
      </p>

      {/* Desktop / wide: true table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
          <caption className="sr-only">
            Framework items by row, engagement criteria by column, mapping relation in each cell
          </caption>
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className="sticky left-0 bg-stock-0 px-2 py-2 font-medium text-ink-1">
                Framework item
              </th>
              {criteria.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className="px-2 py-2 font-data font-medium text-ink-1"
                  title={c.title}
                >
                  {c.ref}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.itemId} className="border-b border-rule-soft">
                <th
                  scope="row"
                  className="sticky left-0 bg-stock-0 px-2 py-2 text-left font-medium text-ink-0"
                >
                  <span className="font-data text-[11px] text-ink-2">{row.ref}</span>
                  <span className="mt-0.5 block">{row.title}</span>
                </th>
                {criteria.map((c) => {
                  const cell = row.cells[c.id];
                  return (
                    <td key={c.id} className="px-1 py-1 text-center">
                      <button
                        type="button"
                        tabIndex={0}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[2px] border border-transparent font-data text-[12px] font-semibold text-ink-0 hover:border-rule focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--signal)]"
                        style={{
                          background: cell ? 'var(--signal-wash)' : 'transparent',
                          color: cell ? 'var(--signal-ink)' : 'var(--ink-3)',
                        }}
                        title={
                          cell
                            ? `${relationLabel(cell.relation)}${cell.note ? ` — ${cell.note}` : ''}`
                            : 'No mapping'
                        }
                        aria-label={
                          cell
                            ? `${row.ref} × criterion ${c.ref}: ${relationLabel(cell.relation)}`
                            : `${row.ref} × criterion ${c.ref}: no mapping`
                        }
                      >
                        {cellLabel(cell?.relation)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked variant */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => {
          const mapped = criteria
            .map((c) => ({ criterion: c, cell: row.cells[c.id] }))
            .filter((x) => x.cell);
          return (
            <li
              key={row.itemId}
              className="border border-rule bg-stock-0 px-3 py-3"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <p className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
                {row.ref}
              </p>
              <p className="mt-1 text-[15px] font-medium text-ink-0">{row.title}</p>
              {row.question && (
                <p className="mt-1 text-[13px] leading-[1.45] text-ink-1">{row.question}</p>
              )}
              {mapped.length === 0 ? (
                <p className="mt-2 text-[13px] text-ink-2">No mapped criteria</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {mapped.map(({ criterion, cell }) => (
                    <li key={criterion.id} className="flex flex-wrap items-baseline gap-2 text-[13px]">
                      <span className="font-data font-medium text-signal-ink">{criterion.ref}</span>
                      <span className="text-ink-0">{criterion.title}</span>
                      <span className="font-data text-[11px] uppercase text-ink-2">
                        {relationLabel(cell!.relation)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
