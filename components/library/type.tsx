import type { CSSProperties, ReactNode } from 'react';
import { TYPE_STYLE, type TypeRole } from '@/components/library/sizing';

const HEADING_TAG = { 1: 'h1', 2: 'h2', 3: 'h3' } as const;
const HEADING_ROLE: Record<1 | 2 | 3, TypeRole> = { 1: 'plate', 2: 'section', 3: 'section' };

export function roleStyle(role: TypeRole, color: string): CSSProperties {
  const token = TYPE_STYLE[role];
  return {
    margin: 0,
    color,
    fontSize: token.size,
    fontWeight: token.weight,
    letterSpacing: token.tracking,
    lineHeight: token.leading,
    fontFamily: role === 'index' || role === 'ref' || role === 'meta' ? 'var(--font-data)' : 'var(--font-ui)',
    fontVariantNumeric: role === 'index' || role === 'ref' || role === 'meta' ? 'tabular-nums' : undefined,
  };
}

export function Heading({
  level = 2,
  id,
  children,
  className,
}: {
  level?: 1 | 2 | 3;
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const Tag = HEADING_TAG[level];
  return (
    <Tag id={id} className={className} style={roleStyle(HEADING_ROLE[level], 'var(--heading)')}>
      {children}
    </Tag>
  );
}

export function Text({
  role = 'body',
  id,
  children,
  className,
}: {
  role?: TypeRole;
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const color = role === 'meta' || role === 'label' ? 'var(--graphite)' : 'var(--ink)';
  return (
    <p id={id} className={className} style={roleStyle(role, role === 'body' ? 'var(--ink)' : color)}>
      {children}
    </p>
  );
}
