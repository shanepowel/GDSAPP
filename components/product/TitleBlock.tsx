'use client';

import { createContext, useContext } from 'react';

export type TitleBlockData = {
  reference: string;
  standardLabel: string;
  phase: string;
  revision: string;
  preparedBy: string;
  dateLabel: string;
  serviceName?: string | null;
};

const EngagementPlateContext = createContext<{ engagementId: string } | null>(null);

export function EngagementPlateProvider({
  engagementId,
  children,
}: {
  engagementId: string;
  children: React.ReactNode;
}) {
  return (
    <EngagementPlateContext.Provider value={{ engagementId }}>
      {children}
    </EngagementPlateContext.Provider>
  );
}

export function useEngagementPlate() {
  return useContext(EngagementPlateContext);
}

/** Shared title block — same component for screen and (later) PDF cover. */
export function TitleBlock({ data }: { data: TitleBlockData }) {
  return (
    <header
      className="border border-rule bg-stock-0 px-4 py-3"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="font-data text-[13px] font-medium tracking-[0.02em] text-ink-0">
          {data.reference}
        </p>
        <p className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
          {data.standardLabel}
        </p>
      </div>
      {data.serviceName && (
        <p className="mt-1 text-[15px] font-medium text-ink-0">{data.serviceName}</p>
      )}
      <p className="mt-2 font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
        {data.phase} · Rev {data.revision} · Prepared by {data.preparedBy} · {data.dateLabel}
      </p>
    </header>
  );
}
