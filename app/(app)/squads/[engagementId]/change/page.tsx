'use client';

import { useParams } from 'next/navigation';
import { ChangeScreen, SpineFrame } from '@/components/engagement/screens';

export default function ChangePage() {
  const id = String(useParams().engagementId);
  return (
    <SpineFrame id={id}>
      <ChangeScreen id={id} />
    </SpineFrame>
  );
}