import type { ElementType, ReactNode } from 'react';
import { MEASURE, type MeasureWidth, space, type SpaceStep } from '@/components/library/sizing';

type StackTag = 'div' | 'section' | 'ul' | 'ol' | 'header';

export function Stack({
  gap = 4,
  as = 'div',
  children,
  className,
  lang,
}: {
  gap?: SpaceStep;
  as?: StackTag;
  children: ReactNode;
  className?: string;
  lang?: string;
}) {
  const Tag: ElementType = as;
  return (
    <Tag
      className={className}
      lang={lang}
      style={{ display: 'flex', flexDirection: 'column', gap: space(gap) }}
    >
      {children}
    </Tag>
  );
}

export function Cluster({
  gap = 2,
  align = 'center',
  children,
  className,
}: {
  gap?: SpaceStep;
  align?: 'start' | 'center' | 'end' | 'baseline';
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', alignItems: align, gap: space(gap) }}
    >
      {children}
    </div>
  );
}

const TRACK_MIN: Record<1 | 2 | 3 | 4, string> = {
  1: '100%',
  2: '16rem',
  3: '12rem',
  4: '10rem',
};

export function Grid({
  columns = 2,
  gap = 4,
  children,
  className,
}: {
  columns?: 1 | 2 | 3 | 4;
  gap?: SpaceStep;
  children: ReactNode;
  className?: string;
}) {
  const min = TRACK_MIN[columns];
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns:
          columns === 1 ? 'minmax(0, 1fr)' : `repeat(auto-fit, minmax(min(100%, ${min}), 1fr))`,
        gap: space(gap),
      }}
    >
      {children}
    </div>
  );
}

export function Inset({
  padding = 4,
  children,
  className,
}: {
  padding?: SpaceStep;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={{ padding: space(padding) }}>
      {children}
    </div>
  );
}

export function Measure({
  width = 'reading',
  children,
  className,
}: {
  width?: MeasureWidth;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={{ maxWidth: MEASURE[width] }}>
      {children}
    </div>
  );
}
