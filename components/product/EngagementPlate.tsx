'use client';

import { EngagementPlateProvider } from '@/components/product/TitleBlock';
import { EvidenceChainProvider } from '@/components/chain/EvidenceChainRail';

export function EngagementPlate({
  engagementId,
  children,
}: {
  engagementId: string;
  children: React.ReactNode;
}) {
  return (
    <EngagementPlateProvider engagementId={engagementId}>
      <EvidenceChainProvider>{children}</EvidenceChainProvider>
    </EngagementPlateProvider>
  );
}
