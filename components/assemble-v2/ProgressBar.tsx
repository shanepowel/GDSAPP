import { cn } from '@/lib/assemble-v2/cn';

/** Horizontal progress. Always pass a label that states the value in words. */
export function ProgressBar({ value, label, className }: { value: number; label: string; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-1.5 overflow-hidden rounded-full bg-asm-line', className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={label}>
      <div className="h-full bg-asm-brand" style={{ width: `${v}%` }} />
    </div>
  );
}
