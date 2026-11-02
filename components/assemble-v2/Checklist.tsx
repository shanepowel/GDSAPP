'use client';

import { useState } from 'react';
import type { ChecklistItem } from '@/lib/assemble-v2/types';
import { cn } from '@/lib/assemble-v2/cn';

/**
 * Stage checklist. Local state only in v2; wire the toggle to a tRPC mutation that records
 * who completed the item and when (docs/redesign/WIRING.md).
 */
export function Checklist({ items }: { items: ChecklistItem[] }) {
  const [state, setState] = useState(items);
  return (
    <ul className="flex flex-col">
      {state.map((c) => (
        <li key={c.id} className="border-b border-asm-line-soft last:border-b-0">
          <label className="flex cursor-pointer items-center gap-3.5 px-6 py-3.5 text-[15px]">
            <input
              type="checkbox"
              checked={c.done}
              onChange={() => setState((s) => s.map((x) => (x.id === c.id ? { ...x, done: !x.done, doneOn: x.done ? undefined : 'Today' } : x)))}
              className="size-[18px] accent-asm-brand"
            />
            <span className={cn('flex-1', c.done ? 'text-asm-ink-3 line-through' : 'text-asm-ink')}>{c.title}</span>
            <span className={cn('text-[13px]', !c.done && c.due ? 'text-asm-ink-3' : 'text-asm-ink-3')}>
              {c.done ? `Done ${c.doneOn ?? ''}` : [c.owner, c.due].filter(Boolean).join(' · ')}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
