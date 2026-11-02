import Link from 'next/link';
import { Button, LifecycleBar, StatusPill, TabNav } from '@/components/assemble-v2';
import { getEngagement } from '@/lib/assemble-v2/get-engagement';

const MODEL: Record<string, string> = { 'fixed-price': 'Fixed price', 'time-and-materials': 'Time and materials', 'outcome-based': 'Outcome-based', retained: 'Retained' };

/** Engagement chrome: breadcrumb, title, status, lifecycle spine and section tabs. */
export default async function EngagementLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await getEngagement(id);
  const base = `/v2/engagements/${e.id}`;
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="text-sm text-asm-ink-3">
        <Link href="/v2/engagements" className="text-asm-brand hover:underline">Engagements</Link> <span aria-hidden="true">/</span> {e.name}
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] font-bold text-asm-brand">{e.name}</h1>
            <StatusPill status={e.status} />
          </div>
          <p className="text-[15px] text-asm-ink-3">
            {e.client} · {MODEL[e.commercialModel]} · Squad Lead: {e.squadLead}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="secondary" size="sm">Share read-only link</Button>
          <Button size="sm">Draft monthly report</Button>
        </div>
      </div>
      <LifecycleBar stage={e.stage} progressLabel={e.stageProgressLabel.split(', ')[1]} />
      <TabNav
        label="Engagement sections"
        items={[
          { href: base, label: 'Overview' },
          { href: `${base}/squad`, label: 'Squad' },
          { href: `${base}/plan`, label: 'Plan' },
          { href: `${base}/compass`, label: 'Compass' },
          { href: `${base}/decisions`, label: 'Decisions' },
          { href: `${base}/change`, label: 'Change' },
          { href: `${base}/standards`, label: 'Standards' },
        ]}
      />
      {children}
    </div>
  );
}
