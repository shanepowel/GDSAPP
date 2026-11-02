/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/assemble-v2/cn';

/** The Assemble mark: four squares, two in light brand blue. Placeholder until a final mark is designed. */
export function AssembleMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="12" height="12" rx="3" className="fill-asm-brand-soft" />
      <rect x="18" y="2" width="12" height="12" rx="3" className="fill-asm-white" />
      <rect x="2" y="18" width="12" height="12" rx="3" className="fill-asm-white" />
      <rect x="18" y="18" width="12" height="12" rx="3" className="fill-asm-brand-soft" />
    </svg>
  );
}

/** Mark plus wordmark, for dark (brand) backgrounds. */
export function AssembleLockup({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5 text-asm-on-brand', className)}>
      <AssembleMark />
      <span className="text-lg font-bold tracking-tight">Assemble</span>
    </span>
  );
}

/**
 * Official Turner & Townsend logo (public/turner-townsend-logo.svg).
 * Its blue panel matches --asm-brand, so it reads on white and on brand-blue surfaces.
 */
export function TurnerTownsendLogo({ height = 24, className }: { height?: number; className?: string }) {
  return <img src="/turner-townsend-logo.svg" alt="Turner & Townsend" style={{ height, width: 'auto' }} className={cn('block', className)} />;
}
