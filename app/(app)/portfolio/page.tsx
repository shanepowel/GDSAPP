'use client';

import Link from 'next/link';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';

export default function PortfolioPage() {
  const { data, isLoading } = trpc.portfolio.summary.useQuery();
  const { locale } = useI18n();
  const copy = getCopy(locale);

  return (
    <>
      <p className="eyebrow mb-2 text-[color:var(--graphite)]">{copy.portfolio.eyebrow}</p>
      <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold">{copy.portfolio.title}</h1>
      <p className="mt-2 mb-6 max-w-[62ch] text-[color:var(--graphite)]">{copy.portfolio.lede}</p>

      {isLoading ? <p className="text-[color:var(--graphite)]">Loading…</p> : null}

      {data ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-px bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4">
            <Stat k={copy.portfolio.engagements} v={String(data.engagementCount)} n={`${data.analysedCount} with analysis`} />
            <Stat
              k="Mean preparedness"
              v={data.averageReadiness != null ? (data.averageReadiness / 100).toFixed(2) : '—'}
              n="across analysed engagements"
            />
            <Stat
              k="Mean rigour"
              v={data.averageRigour != null ? `${data.averageRigour}%` : '—'}
              n="delivery discipline"
            />
            <Stat
              k="Open gaps"
              v={String(data.totalGapPoints)}
              n={`${data.totalStatutoryGaps} statutory`}
            />
          </div>

          <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
            {copy.portfolio.engagements}
          </h2>
          <div className="sheet overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Engagement</th>
                  <th>Phase</th>
                  <th>Preparedness</th>
                  <th>Rigour</th>
                  <th>Gaps</th>
                </tr>
              </thead>
              <tbody>
                {data.engagements.map((row) => (
                  <tr key={row.id} className="clickable">
                    <td>
                      <Link href={`/squads/${row.id}`} className="font-semibold">
                        {row.name}
                      </Link>
                    </td>
                    <td className="num">{row.phase ?? '—'}</td>
                    <td className="num">
                      {row.readinessPercent != null ? (row.readinessPercent / 100).toFixed(2) : '—'}
                    </td>
                    <td className="num">{row.rigourPercent != null ? `${row.rigourPercent}%` : '—'}</td>
                    <td className="num">
                      {row.gapPointCount}
                      {row.statutoryGapCount > 0 ? (
                        <span className="ml-2 font-data text-[10px] uppercase tracking-wide text-[color:var(--survey)]">
                          {row.statutoryGapCount} statutory
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.engagements.length === 0 ? (
              <p className="px-4 py-6 text-[color:var(--graphite)]">{copy.empty.noEngagements}</p>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}

function Stat({ k, v, n }: { k: string; v: string; n: string }) {
  return (
    <div className="bg-[var(--raised)] p-4">
      <div className="font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">{k}</div>
      <div className="mt-1 font-data text-[26px] tabular-nums">{v}</div>
      <div className="text-[12px] text-[color:var(--graphite)]">{n}</div>
    </div>
  );
}
