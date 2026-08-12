'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/app/AppShell';
import { DesignWorkspace } from '@/components/org-design/DesignWorkspace';
import { useI18n } from '@/components/app/LocaleProvider';

/** Opt-in graph view — D3 loads only on this route (doc 08 §3.1). */
export default function OrganiseGraphPage() {
  const params = useParams();
  const id = params.id as string;
  const { messages: m } = useI18n();

  return (
    <AppShell title={m.engagement.organiseTitle} hideTitle>
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href={`/engagements/${id}/organise`} className="text-ink-1 hover:text-ink-0">
          Table
        </Link>
        <Link href={`/engagements/${id}/organise/graph`} className="font-medium text-signal-ink">
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
        initialViewMode="chart"
      />
    </AppShell>
  );
}
