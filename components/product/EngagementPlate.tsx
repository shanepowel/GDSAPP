'use client';

import { useSession } from 'next-auth/react';
import { EngagementPlateProvider, TitleBlock } from '@/components/product/TitleBlock';
import { useDatumShell } from '@/components/shell/datum-shell-context';
import { EvidenceChainProvider } from '@/components/chain/EvidenceChainRail';
import { trpc } from '@/lib/trpc/client';

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

export function EngagementPlate({
  engagementId,
  children,
}: {
  engagementId: string;
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const datum = useDatumShell();
  const { data } = trpc.engagement.byId.useQuery(
    { id: engagementId },
    { staleTime: 30_000 },
  );

  const primary = data?.catalogStandards?.[0]?.standardVersion;
  const standardLabel = primary
    ? `${primary.standard.name} v${primary.version}`
    : data?.standardId === 'wales'
      ? 'Wales DSS'
      : data?.standardId === 'gds'
        ? 'GDS Service Standard'
        : '—';

  const titleData = {
    reference: data?.reference ?? '—',
    standardLabel,
    phase: (data?.phase ?? 'discovery').replace(/^./, (c: string) => c.toUpperCase()),
    revision: data?.revision ?? 'A',
    preparedBy: session?.user?.name?.trim() || session?.user?.email || '—',
    dateLabel: formatDate(new Date()),
    serviceName: data?.serviceName ?? data?.name,
  };

  return (
    <EngagementPlateProvider engagementId={engagementId}>
      <EvidenceChainProvider>
        {datum ? (
          children
        ) : (
          <div className="min-h-screen bg-[var(--stock)] text-[color:var(--ink)]">
            <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8">
              <div className="mb-4">
                <TitleBlock data={titleData} />
              </div>
              <div className="max-w-[1200px]">{children}</div>
            </div>
          </div>
        )}
      </EvidenceChainProvider>
    </EngagementPlateProvider>
  );
}
