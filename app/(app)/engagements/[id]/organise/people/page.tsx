'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { DesignWorkspace } from '@/components/org-design/DesignWorkspace';
import { useI18n } from '@/components/app/LocaleProvider';

export default function OrganisePeoplePage() {
  const params = useParams();
  const id = params.id as string;
  const { messages: m } = useI18n();

  return (
    <AppShell title={m.engagement.organisePeopleTitle} hideTitle>
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href={`/engagements/${id}/organise`} className="text-ink-1 hover:text-ink-0">
          Table
        </Link>
        <Link href={`/engagements/${id}/organise/graph`} className="text-ink-1 hover:text-ink-0">
          View as graph
        </Link>
        <Link href={`/engagements/${id}/organise/people`} className="font-medium text-signal-ink">
          People
        </Link>
        <Link href={`/engagements/${id}/organise/scenarios`} className="text-ink-1 hover:text-ink-0">
          Scenarios
        </Link>
      </div>
      <DesignWorkspace
        engagementId={id}
        title={m.engagement.organisePeopleTitle}
        hideMainTabs
        initialMainView="people"
      />
    </AppShell>
  );
}
