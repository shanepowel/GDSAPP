import { cn } from '@/lib/cn';

export interface ChecklistRow {
  id: string;
  title: string;
  done: boolean;
  /** Shown on the right: owner and due date when open, completion text when done. */
  meta?: string;
}

/**
 * Controlled checklist. The caller owns state and persists the toggle (for example
 * trpc.spine.setChecklist), so who completed an item and when is recorded server-side.
 */
export function Checklist({
  items,
  onToggle,
  disabled,
  className,
}: {
  items: ChecklistRow[];
  onToggle?: (id: string, done: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <ul className={cn('m-0 flex list-none flex-col p-0', className)}>
      {items.map((c) => (
        <li key={c.id} className="border-b border-asm-line-soft last:border-b-0">
          <label className={cn('flex items-center gap-3.5 px-6 py-3.5 text-[15px]', onToggle && !disabled ? 'cursor-pointer' : '')} style={{ minHeight: 'var(--target-control)' }}>
            <input
              type="checkbox"
              checked={c.done}
              disabled={disabled || !onToggle}
              onChange={() => onToggle?.(c.id, !c.done)}
              className="size-[18px] flex-none accent-asm-brand"
            />
            <span className={cn('flex-1', c.done ? 'text-asm-ink-3 line-through' : 'text-asm-ink')}>{c.title}</span>
            {c.meta ? <span className="text-[13px] text-asm-ink-3">{c.meta}</span> : null}
          </label>
        </li>
      ))}
    </ul>
  );
}
