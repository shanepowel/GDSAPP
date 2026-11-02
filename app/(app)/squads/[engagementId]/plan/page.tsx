'use client';

import { useParams } from 'next/navigation';
import { PlanScreen, SpineFrame } from '@/components/engagement/screens';

export default function PlanPage() {
  const id = String(useParams().engagementId);
  return (
    <SpineFrame id={id}>
      <PlanScreen id={id} />
    </SpineFrame>
  );
}
