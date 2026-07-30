'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

export default function CriterionDetailPage() {
  const { messages: m, locale } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const criterionRef = decodeURIComponent(params.criterionRef as string);

  const { data } = trpc.standards.assessList.useQuery({
    engagementId: id,
    locale: locale === 'cy' ? 'cy' : 'en',
    ignorePhaseFilter: true,
  });

  const criterion = data?.criteria.find((c) => c.ref === criterionRef);

  return (
    <AppShell title={m.engagement.assessTitle}>
      <AppNav />
      <EngagementSubNav engagementId={id} />

      <nav className="mb-4 text-sm text-ink-2" aria-label="Breadcrumb">
        <Link href={`/engagements/${id}/assess`} className="text-signal-ink underline-offset-2 hover:underline">
          {m.engagement.assessTitle}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-data text-ink-0">{criterionRef}</span>
      </nav>

      {!criterion && (
        <p className="rounded-[2px] border border-rule bg-stock-1 px-4 py-6 text-[15px] text-ink-1">
          {m.engagement.assessCriterionMissing}
        </p>
      )}

      {criterion && (
        <article>
          <header className="mb-6 border-b-2 border-ink-0 pb-4">
            <p className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
              {criterion.standardName} v{criterion.standardVersion}
              {criterion.statutory ? ` · ${m.engagement.assessStatutory}` : ''}
            </p>
            <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink-0">
              <span className="font-data mr-3 text-[20px]">{criterion.ref}</span>
              {criterion.title}
            </h1>
          </header>
          <p className="max-w-3xl text-[15px] leading-[1.55] text-ink-0">{criterion.statement}</p>
          <p className="mt-8 text-[15px] text-ink-1">{m.engagement.assessJudgementComing}</p>
          <p className="mt-6 text-[12px] text-ink-2">{criterion.attribution}</p>
        </article>
      )}
    </AppShell>
  );
}
