'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { DesignWorkspace } from '@/components/org-design/DesignWorkspace';
import { useI18n } from '@/components/app/LocaleProvider';

export default function EngagementStructurePage() {
  const params = useParams();
  const id = params.id as string;
  const { messages: m } = useI18n();

  return (
    <AppShell title={m.engagement.structureTitle}>
      <AppNav />
      <EngagementSubNav engagementId={id} />
      <DesignWorkspace
        engagementId={id}
        title={m.engagement.structureTitle}
      />
    </AppShell>
  );
}
