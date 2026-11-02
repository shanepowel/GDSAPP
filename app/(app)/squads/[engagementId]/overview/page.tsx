'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { OverviewScreen, SpineFrame } from '@/components/engagement/screens';

export default function OverviewPage() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.engagementId);
  return (
    <SpineFrame id={id}>
      <OverviewScreen id={id} created={search.get('created') === '1'} />
    </SpineFrame>
  );
}
