'use client';

import { useMemo, useState } from 'react';
import type {
  DesignGraphAssignment,
  DesignGraphEntity,
  DesignGraphPerson,
} from '@/lib/org-design/types';

type Props = {
  entities: DesignGraphEntity[];
  people: DesignGraphPerson[];
  assignments: DesignGraphAssignment[];
  onSelect?: (entity: DesignGraphEntity) => void;
  selectedId?: string | null;
};

type Row = {
  entity: DesignGraphEntity;
  depth: number;
  holders: DesignGraphPerson[];
  vacant: boolean;
};

function buildRows(
  entities: DesignGraphEntity[],
  people: DesignGraphPerson[],
  assignments: DesignGraphAssignment[],
): Row[] {
  const byParent = new Map<string | null, DesignGraphEntity[]>();
  for (const e of entities) {
    const key = e.parentId ?? null;
    const list = byParent.get(key) ?? [];
    list.push(e);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const rows: Row[] = [];
  function walk(parentId: string | null, depth: number) {
    for (const entity of byParent.get(parentId) ?? []) {
      const assignedIds = assignments.filter((a) => a.entityId === entity.id).map((a) => a.personId);
      const holders = people.filter((p) => assignedIds.includes(p.id));
      const vacant = entity.type === 'role' && holders.length === 0;
      rows.push({ entity, depth, holders, vacant });
      walk(entity.id, depth + 1);
    }
  }
  walk(null, 0);

  // Orphans (parent missing)
  const placed = new Set(rows.map((r) => r.entity.id));
  for (const entity of entities) {
    if (placed.has(entity.id)) continue;
    const assignedIds = assignments.filter((a) => a.entityId === entity.id).map((a) => a.personId);
    const holders = people.filter((p) => assignedIds.includes(p.id));
    rows.push({
      entity,
      depth: 0,
      holders,
      vacant: entity.type === 'role' && holders.length === 0,
    });
  }
  return rows;
}

/** Accessible nested tree peer to the org graph (spec 2.3). */
export function OrgTable({ entities, people, assignments, onSelect, selectedId }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const rows = useMemo(
    () => buildRows(entities, people, assignments),
    [entities, people, assignments],
  );

  const childIds = useMemo(() => {
    const set = new Set<string>();
    for (const e of entities) {
      if (e.parentId) set.add(e.parentId);
    }
    return set;
  }, [entities]);

  const visible = rows.filter((row) => {
    let parentId = row.entity.parentId;
    while (parentId) {
      if (expanded[parentId] === false) return false;
      const parent = entities.find((e) => e.id === parentId);
      parentId = parent?.parentId ?? null;
    }
    return true;
  });

  return (
    <div className="overflow-x-auto rounded-[2px] border border-rule bg-stock-0">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">
          Organisation structure as a table. {entities.length} entities,{' '}
          {rows.filter((r) => r.vacant).length} vacant roles.
        </caption>
        <thead className="border-b border-rule bg-stock-1">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium text-ink-1">
              Role / circle
            </th>
            <th scope="col" className="px-3 py-2 font-medium text-ink-1">
              Accountabilities
            </th>
            <th scope="col" className="px-3 py-2 font-medium text-ink-1">
              Holder
            </th>
            <th scope="col" className="px-3 py-2 font-medium text-ink-1">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => {
            const hasChildren = childIds.has(row.entity.id);
            const isOpen = expanded[row.entity.id] !== false;
            return (
              <tr
                key={row.entity.id}
                className="border-b border-rule-soft"
                style={{
                  background:
                    selectedId === row.entity.id ? 'var(--signal-wash)' : undefined,
                }}
              >
                <th scope="row" className="px-3 py-2 font-normal text-ink-0">
                  <div
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${row.depth * 16}px` }}
                  >
                    {hasChildren ? (
                      <button
                        type="button"
                        className="font-data grid h-6 w-6 place-items-center rounded-[2px] border border-rule text-ink-1"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [row.entity.id]: !isOpen,
                          }))
                        }
                      >
                        {isOpen ? '−' : '+'}
                      </button>
                    ) : (
                      <span className="inline-block w-6" aria-hidden />
                    )}
                    <button
                      type="button"
                      className="text-left font-medium underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus)]"
                      onClick={() => onSelect?.(row.entity)}
                    >
                      {row.entity.name}
                    </button>
                    <span className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
                      {row.entity.type}
                    </span>
                  </div>
                </th>
                <td className="px-3 py-2 text-ink-1">
                  {row.entity.accountabilities.length
                    ? row.entity.accountabilities.join('; ')
                    : '—'}
                </td>
                <td className="px-3 py-2 text-ink-0">
                  {row.holders.length
                    ? row.holders.map((h) => h.name).join(', ')
                    : row.entity.type === 'role'
                      ? '—'
                      : '—'}
                </td>
                <td className="px-3 py-2">
                  {row.vacant ? (
                    <span className="font-data text-[11px] uppercase tracking-[0.04em] text-verdict-not-met">
                      Vacant
                    </span>
                  ) : row.entity.type === 'role' ? (
                    <span className="font-data text-[11px] uppercase tracking-[0.04em] text-verdict-met">
                      Assigned
                    </span>
                  ) : (
                    <span className="text-ink-2">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
