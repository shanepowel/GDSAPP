'use client';

import { useDatumShell } from '@/components/shell/datum-shell-context';
import { useEngagementPlate } from '@/components/product/TitleBlock';

export function AppShell({
  title,
  children,
  hideTitle,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  standardId?: 'wales' | 'gds' | string;
  orgLabel?: string;
  hideTitle?: boolean;
}) {
  const plate = useEngagementPlate();
  const datum = useDatumShell();

  if (plate || datum) {
    return (
      <>
        {!hideTitle && !datum ? (
          <h1 className="font-display text-2xl font-semibold text-[color:var(--ink)]">{title}</h1>
        ) : null}
        {datum && !hideTitle ? (
          <h1 className="mb-4 font-[family-name:var(--font-cond)] text-[30px] font-bold leading-tight">
            {title}
          </h1>
        ) : null}
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--stock)]">
      <main className="mx-auto max-w-container px-6 py-8">
        {!hideTitle && (
          <h1 className="font-display text-2xl font-semibold text-[color:var(--ink)]">{title}</h1>
        )}
        {children}
      </main>
    </div>
  );
}

