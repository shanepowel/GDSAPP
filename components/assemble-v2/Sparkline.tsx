import { cn } from '@/lib/assemble-v2/cn';

/** Tiny trend line. Pass a sentence describing the trend as `label` for screen readers. */
export function Sparkline({ values, label, tone = 'brand', invert = false, className }: { values: number[]; label: string; tone?: 'brand' | 'warn' | 'risk'; invert?: boolean; className?: string }) {
  if (values.length < 2) return <p className="text-xs text-asm-ink-3">Not enough data for a trend yet.</p>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 200;
      const norm = (v - min) / span;
      const y = 34 - (invert ? 1 - norm : norm) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const stroke = tone === 'warn' ? 'stroke-asm-warn' : tone === 'risk' ? 'stroke-asm-risk' : 'stroke-asm-brand';
  return (
    <svg className={cn('h-10 w-full', className)} viewBox="0 0 200 40" preserveAspectRatio="none" role="img" aria-label={label}>
      <polyline points={pts} fill="none" className={stroke} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
