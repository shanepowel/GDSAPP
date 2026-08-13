'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

export default function AssurePage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const packs = trpc.crosswalk.listPacks.useQuery({ engagementId: id });

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

      {packs.isLoading ? (
        <p className="text-[15px] text-ink-1">Loading gate packs…</p>
      ) : !packs.data?.length ? (
        <p className="rounded-[2px] border border-rule bg-stock-0 px-4 py-6 text-[15px] text-ink-1">
          {m.engagement.assureEmpty.replace('{name}', 'this engagement')}
        </p>
      ) : (
        <ul className="divide-y divide-rule-soft border-y border-rule">
          {packs.data.map((pack) => {
            const coverage =
              pack.itemCount === 0
                ? 0
                : Math.round((pack.mappedCount / pack.itemCount) * 100);
            return (
              <li key={pack.packRef}>
                <Link
                  href={`/engagements/${id}/assure/${encodeURIComponent(pack.packRef)}`}
                  className="flex flex-wrap items-baseline justify-between gap-3 py-4 transition-colors hover:bg-stock-1"
                >
                  <div>
                    <p className="text-[15px] font-medium text-ink-0">{pack.title}</p>
                    <p className="mt-1 font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
                      {pack.frameworkName} · {pack.publisher}
                    </p>
                  </div>
                  <p className="font-data text-[13px] text-ink-1">
                    {pack.mappedCount}/{pack.itemCount} mapped · {coverage}%
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
