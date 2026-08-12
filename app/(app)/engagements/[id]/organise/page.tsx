'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/app/AppShell';
import { DesignWorkspace } from '@/components/org-design/DesignWorkspace';
import { useI18n } from '@/components/app/LocaleProvider';

export default function OrganisePage() {
  const params = useParams();
  const id = params.id as string;
  const { messages: m } = useI18n();

  return (
    <AppShell title={m.engagement.organiseTitle} hideTitle>
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href={`/engagements/${id}/organise`} className="font-medium text-signal-ink">
          Table
        </Link>
        <Link href={`/engagements/${id}/organise/graph`} className="text-ink-1 hover:text-ink-0">
          View as graph
        </Link>
        <Link href={`/engagements/${id}/organise/people`} className="text-ink-1 hover:text-ink-0">
          People
        </Link>
        <Link href={`/engagements/${id}/organise/scenarios`} className="text-ink-1 hover:text-ink-0">
          Scenarios
        </Link>
      </div>
      <DesignWorkspace
        engagementId={id}
        title={m.engagement.organiseTitle}
        hideMainTabs
        initialMainView="design"
        initialViewMode="table"
      />
    </AppShell>
  );
}
