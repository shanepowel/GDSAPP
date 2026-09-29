import type { CSSProperties, ReactNode } from 'react';
import { space, type SpaceStep } from '@/components/library/sizing';

export function Panel({
  children,
  padding,
  className,
  style,
}: {
  children: ReactNode;
  padding?: SpaceStep;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--raised)',
        border: 'var(--rule-w) solid var(--rule)',
        borderRadius: 'var(--radius)',
        ...(padding !== undefined ? { padding: space(padding) } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
