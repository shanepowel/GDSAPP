'use client';

import { useTeach } from '@/components/teach/TeachProvider';

export function TeachPanel({
  tag,
  title,
  children,
}: {
  tag: string;
  title: string;
  children: React.ReactNode;
}) {
  const { explain } = useTeach();
  if (!explain) return null;

  return (
    <aside className="teach-panel" aria-label={title}>
      <span className="teach-tag">{tag}</span>
      <h3>{title}</h3>
      {children}
    </aside>
  );
}
