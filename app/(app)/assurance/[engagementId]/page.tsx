'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { copy } from '@/lib/copy';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

export default function AssurancePage() {
  const params = useParams();
  const id = params.engagementId as string;
  const { locale } = useI18n();
  const { data: engagement } = trpc.engagement.byId.useQuery({ id });
  const { data } = trpc.standards.assessList.useQuery(
    { engagementId: id, locale: locale === 'cy' ? 'cy' : 'en' },
    { enabled: Boolean(engagement) },
  );

  const req = engagement?.requirements[0];
  const lastRun = req?.runs[0];
  const result = lastRun?.result as ExtendedAnalysisResult | undefined;
  const points = result?.readiness?.points ?? [];
  const index = result?.readiness?.overallPercent;
  const atRiskCount = points.filter((p) => p.status === 'partial' || p.status === 'gap').length;

  return (
    <>
      <p className="eyebrow mb-2 text-[color:var(--graphite)]">{copy.assurance.eyebrow}</p>
      <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold">{copy.assurance.title}</h1>
      <p className="mt-2 mb-6 max-w-[62ch] text-[color:var(--graphite)]">{copy.assurance.lede}</p>

      <div className="mb-6 grid grid-cols-1 gap-px bg-[var(--rule)] sm:grid-cols-3">
        <div className="bg-[var(--raised)] p-4">
          <div className="font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
            {copy.assurance.preparedness}
          </div>
          <div className="mt-1 font-data text-[26px] tabular-nums">
            {typeof index === 'number' ? (index / 100).toFixed(2) : '—'}
          </div>
        </div>
        <div className="bg-[var(--raised)] p-4">
          <div className="font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
            {copy.assurance.pointsAtRisk}
          </div>
          <div className="mt-1 font-data text-[26px] tabular-nums">{atRiskCount}</div>
        </div>
        <div className="bg-[var(--raised)] p-4">
          <div className="font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">Criteria</div>
          <div className="mt-1 font-data text-[26px] tabular-nums">{data?.criteria.length ?? '—'}</div>
        </div>
      </div>

      <div className="sheet overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>{copy.assurance.point}</th>
              <th>{copy.assurance.requirement}</th>
              <th>{copy.assurance.status}</th>
            </tr>
          </thead>
          <tbody>
            {(data?.criteria ?? []).map((c) => {
              const point = points.find((p) => p.title === c.title || String(p.number) === c.ref);
              const status =
                point?.status === 'gap' || point?.status === 'partial'
                  ? 'at risk'
                  : point?.status === 'met' || point?.status === 'strong'
                    ? 'on track'
                    : 'not assessed';
              return (
                <tr key={c.id}>
                  <td className="num">
                    <Link href={`/engagements/${id}/assess/${encodeURIComponent(c.ref)}`} className="underline-offset-2 hover:underline">
                      {c.ref}
                    </Link>
                  </td>
                  <td>{c.title}</td>
                  <td>
                    <span className={`flag ${status === 'at risk' ? 'flag-risk' : status === 'on track' ? 'flag-ok' : ''}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
