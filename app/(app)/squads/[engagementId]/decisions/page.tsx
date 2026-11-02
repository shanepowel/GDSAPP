'use client';

import { useParams } from 'next/navigation';
import { DecisionsScreen, SpineFrame } from '@/components/engagement/screens';

export default function DecisionsPage() {
  const id = String(useParams().engagementId);
  return (
    <SpineFrame id={id}>
      <DecisionsScreen id={id} />
    </SpineFrame>
  );
}
