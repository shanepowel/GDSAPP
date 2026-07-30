'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

export default function AssurePage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const { data } = trpc.engagement.byId.useQuery({ id });

  return (
    <AppShell title={m.engagement.assureTitle}>
      <header className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink-0">
          {m.engagement.assureTitle}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-[1.55] text-ink-1">
          {m.engagement.assureIntro}
        </p>
      </header>
      <p className="rounded-[2px] border border-rule bg-stock-0 px-4 py-6 text-[15px] text-ink-1">
        {m.engagement.assureEmpty.replace('{name}', data?.name ?? '—')}
      </p>
    </AppShell>
  );
}
