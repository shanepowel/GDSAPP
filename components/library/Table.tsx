import { cn } from '@/lib/cn';

/** Table primitives. Wrap in <TableScroll> so wide tables scroll inside their card on small screens. */
export function TableScroll({ children, minWidth = 720 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}
export function Table({ className, ...p }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-sm', className)} {...p} />;
}
export function Th({ className, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={cn('bg-asm-canvas px-3 py-3 text-left text-[13px] font-semibold text-asm-ink-2 first:pl-6 last:pr-6', className)} {...p} />;
}
export function Td({ className, ...p }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('border-t border-asm-line-soft px-3 py-3.5 align-top text-asm-ink first:pl-6 last:pr-6 tabular-nums', className)} {...p} />;
}
