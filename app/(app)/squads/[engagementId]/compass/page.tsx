'use client';

import { useParams } from 'next/navigation';
import { CompassScreen, SpineFrame } from '@/components/engagement/screens';

export default function CompassPage() {
  const id = String(useParams().engagementId);
  return (
    <SpineFrame id={id}>
      <CompassScreen id={id} />
    </SpineFrame>
  );
}
