'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { CrosswalkMatrix } from '@/components/product/CrosswalkMatrix';
import { GatePackGapList } from '@/components/product/GatePackGapList';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

export default function AssurePackPage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const packRef = decodeURIComponent(params.packRef as string);

  const detail = trpc.crosswalk.packDetail.useQuery({ engagementId: id, packRef });
  const exportQ = trpc.crosswalk.exportPack.useQuery(
    { engagementId: id, packRef },
    { enabled: false },
  );

  async function downloadExport() {
    const doc = await exportQ.refetch();
    if (!doc.data) return;
    const blob = new Blob([JSON.stringify(doc.data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${packRef}-${id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell title={detail.data?.title ?? m.engagement.assureTitle}>

      <p className="mb-4">
        <Link
          href={`/engagements/${id}/assure`}
          className="text-[13px] font-medium text-signal-ink underline-offset-2 hover:underline"
        >
          ← All gate packs
        </Link>
      </p>

      {detail.isLoading ? (
        <p className="text-[15px] text-ink-1">Loading crosswalk…</p>
      ) : detail.error ? (
        <p className="text-[15px] text-ink-1">Pack not found.</p>
      ) : detail.data ? (
        <div className="space-y-10">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink-0">
                {detail.data.title}
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-[1.55] text-ink-1">
                {detail.data.frameworks.map((f) => f.name).join(' · ')} —{' '}
                {detail.data.gap.counts.answerableNow} answerable now,{' '}
                {detail.data.gap.counts.evidenceGap} evidence gaps,{' '}
                {detail.data.gap.counts.outOfScope} out of scope.
              </p>
              {detail.data.review && (
                <p className="mt-2 font-data text-[11px] text-ink-2">
                  Crosswalk authored by {detail.data.review.authoredBy}, reviewed by{' '}
                  {detail.data.review.reviewedBy}
                </p>
              )}
            </div>
            <Button type="button" onClick={() => void downloadExport()} disabled={exportQ.isFetching}>
              Export pack
            </Button>
          </header>

          <CrosswalkMatrix
            criteria={detail.data.criteria}
            rows={detail.data.matrix}
            coveragePercent={detail.data.gap.coveragePercent}
          />

          <GatePackGapList
            engagementId={id}
            answerableNow={detail.data.gap.answerableNow}
            evidenceGap={detail.data.gap.evidenceGap}
            outOfScope={detail.data.gap.outOfScope}
          />

          {detail.data.frameworks.some((f) => f.attribution) && (
            <footer className="border-t border-rule pt-4 text-[12px] leading-[1.5] text-ink-2">
              {detail.data.frameworks.map((f) =>
                f.attribution ? (
                  <p key={f.code} className="mb-1">
                    {f.name}
                    {f.licence ? ` (${f.licence})` : ''}: {f.attribution}
                  </p>
                ) : null,
              )}
            </footer>
          )}
        </div>
      ) : null}
    </AppShell>
  );
}
