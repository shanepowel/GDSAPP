'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SquadWalkthrough } from '@/components/teach/SquadWalkthrough';
import { isWalkthroughTourStep } from '@/lib/teach/walkthrough';

export function WalkthroughSlot({ force = false }: { force?: boolean }) {
  return (
    <Suspense fallback={null}>
      <WalkthroughSlotInner force={force} />
    </Suspense>
  );
}

function WalkthroughSlotInner({ force }: { force: boolean }) {
  const search = useSearchParams();
  const step = Number.parseInt(search.get('tour') ?? '', 10);
  const tourStep = Number.isFinite(step) ? step : 0;
  if (!force && !isWalkthroughTourStep(tourStep)) return null;
  return <SquadWalkthrough key={tourStep || 5} tourStep={tourStep || 5} />;
}
