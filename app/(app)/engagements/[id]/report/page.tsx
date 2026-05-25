'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/app/AppShell';
import { ScoreBar } from '@/components/app/ScoreBar';
import { StatusPill, type StatusKind } from '@/components/app/StatusPill';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

export default function ReportPage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const { data } = trpc.engagement.byId.useQuery({ id });
  const createShare = trpc.extension.share.create.useMutation();
  const { data: shares, refetch: refetchShares } = trpc.extension.share.list.useQuery({ engagementId: id });
  const req = data?.requirements[0];
  const result = req?.runs[0]?.result as ExtendedAnalysisResult | undefined;

  const topGaps = result?.readiness.points
    .filter((p) => p.status === 'gap' || p.status === 'partial')
    .slice(0, 5);
  const topActions = result?.adaptation.actions.slice(0, 5);

  return (
    <div className="min-h-screen bg-white text-black print:bg-white">
      <div className="no-print">
        <AppShell title="Report">
          <p className="text-text-muted">Use Print to PDF for a client-ready export.</p>
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 rounded-md bg-brand px-4 py-2 text-sm text-text-inverse"
          >
            Print report
          </button>
          {req && (
            <a
              href={`/api/export/report?engagementId=${id}&requirementId=${req.id}`}
              className="ml-3 mt-4 inline-block rounded-md border border-border px-4 py-2 text-sm"
            >
              {m.common.exportPdf}
            </a>
          )}
          <button
            type="button"
            className="ml-3 rounded-md border border-border px-4 py-2 text-sm"
            onClick={() =>
              createShare.mutate(
                { engagementId: id },
                {
                  onSuccess: (link) => {
                    refetchShares();
                    void navigator.clipboard?.writeText(
                      `${window.location.origin}/share/${link.token}`,
                    );
                  },
                },
              )
            }
          >
            Create share link
          </button>
          {shares?.[0] && (
            <p className="mt-2 text-xs text-text-muted">
              Latest link expires {new Date(shares[0].expiresAt).toLocaleDateString('en-GB')}
            </p>
          )}
          <Link href={`/engagements/${id}/analysis`} className="ml-3 text-sm text-brand">
            Back to analysis
          </Link>
        </AppShell>
      </div>
      <article className="mx-auto max-w-[210mm] px-8 py-10 print:px-12">
        <header className="border-b-2 border-[color:var(--color-brand)] pb-4">
          <p className="text-sm font-medium text-[color:var(--color-brand)]">Amplified Ltd · Assemble</p>
          <h1 className="mt-2 font-display text-2xl font-bold">{data?.name}</h1>
          <p className="text-sm">
            {data?.standardId === 'wales' ? 'Digital Service Standard for Wales' : 'GDS Service Standard'}
          </p>
        </header>
        {result ? (
          <>
            <section className="mt-8 print:break-inside-avoid">
              <h2 className="text-lg font-semibold">Executive one-pager</h2>
              <div className="mt-3 grid gap-4 text-sm md:grid-cols-3">
                <div>
                  <p className="font-medium">Readiness</p>
                  <p>{result.overallReadiness}% ({result.readinessBand})</p>
                </div>
                {result.bidOutlook && (
                  <div>
                    <p className="font-medium">Bid quality outlook</p>
                    <p>{result.bidOutlook.overallQualityOutlook}%</p>
                  </div>
                )}
                {result.rigour && (
                  <div>
                    <p className="font-medium">Agile rigour</p>
                    <p>{result.rigour.overallPercent}%</p>
                  </div>
                )}
              </div>
              {result.bidOutlook && (
                <p className="mt-2 text-xs">
                  Top mover: {result.bidOutlook.topPointMovers[0]?.text ?? 'None'}
                </p>
              )}
            </section>
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Summary</h2>
              <div className="mt-3">
                <ScoreBar value={result.overallReadiness} />
              </div>
              <h3 className="mt-6 font-medium">Top gaps</h3>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {topGaps?.map((g) => (
                  <li key={g.pointId}>
                    {g.number}. {g.title} ({g.status})
                  </li>
                ))}
              </ul>
              <h3 className="mt-4 font-medium">Headline adaptation actions</h3>
              <ol className="mt-2 list-decimal pl-5 text-sm">
                {topActions?.map((a) => (
                  <li key={a.id}>{a.title}</li>
                ))}
              </ol>
            </section>
            <section className="mt-10 break-before-page">
              <h2 className="text-lg font-semibold">Readiness detail</h2>
              {result.readiness.points.map((p) => (
                <div key={p.pointId} className="mt-4 border-t border-gray-200 pt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <strong>
                      {p.number}. {p.title}
                    </strong>
                    <StatusPill kind={p.status as StatusKind} />
                  </div>
                  {p.evidenceGaps.length > 0 && <p className="mt-1">Evidence gaps: {p.evidenceGaps.join('; ')}</p>}
                </div>
              ))}
            </section>
          </>
        ) : (
          <p className="mt-8 text-sm">No analysis available. Run analysis first.</p>
        )}
        <footer className="mt-12 border-t pt-4 text-xs text-gray-600">
          DDaT Capability Framework: Open Government Licence v3.0. GDS Service Standard: Open Government Licence via
          GOV.UK. Digital Service Standard for Wales: Centre for Digital Public Services. Dependency mapping: Amplified
          Ltd (advisory; review by a qualified service assessor before client use).
        </footer>
      </article>
    </div>
  );
}
