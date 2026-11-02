import type { ReactNode } from 'react';

export function SkipLink({
  href = '#main-content',
  children,
}: {
  href?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className="skip-link">
      {children}
    </a>
  );
}
