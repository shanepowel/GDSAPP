import { cn } from '@/lib/cn';

export function Avatar({ initials, size = 36, className }: { initials: string; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex flex-none items-center justify-center rounded-full bg-asm-brand-soft font-bold text-asm-brand-deep', className)} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials}
    </span>
  );
}
