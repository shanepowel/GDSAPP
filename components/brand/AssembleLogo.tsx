import { BRAND } from '@/lib/brand';

/** Hex mark + ASSEMBLE wordmark (placeholder lockup; replace SVG assets when final art lands). */
export function AssembleHexIcon({
  className,
  color = 'currentColor',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill={color}
        d="M16 1.75 28.25 8.5v15L16 30.25 3.75 23.5v-15L16 1.75Zm0 3.35L7.35 10.15v11.7L16 27.1l8.65-5.25v-11.7L16 5.1Z"
      />
      <path
        fill={color}
        d="M16 9.35 20.65 21.5h-2.1l-1.05-2.55h-6.5L9.45 21.5H7.35L16 9.35Zm0 3.4-4.15 6.75h8.3L16 12.75Z"
      />
    </svg>
  );
}

export function AssembleLogo({
  variant = 'light',
  className,
  iconClassName = 'h-8 w-8 shrink-0',
}: {
  /** `dark` = light mark on navy hero; `light` = navy mark on pale surfaces */
  variant?: 'light' | 'dark';
  className?: string;
  iconClassName?: string;
}) {
  const fg = variant === 'dark' ? BRAND.colors.white : BRAND.colors.navy;

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`} aria-label={BRAND.product}>
      <AssembleHexIcon className={iconClassName} color={fg} />
      <span
        className="font-display text-[15px] font-extrabold uppercase tracking-[0.14em]"
        style={{ color: fg }}
      >
        {BRAND.product.toUpperCase()}
      </span>
    </div>
  );
}
