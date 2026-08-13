'use client';

import Link from 'next/link';
import { EmptyState, PageHeader, StatStrip } from '@/components/datum/PageChrome';
import { TeachPanel } from '@/components/teach/TeachPanel';
import { DemandFigure, FigureFrame } from '@/components/teach/figures';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';

export default function PortfolioPage() {
  const { data, isLoading } = trpc.portfolio.summary.useQuery();
  const { locale } = useI18n();
  const copy = getCopy(locale);

  return (
    <>
      <PageHeader eyebrow={copy.portfolio.eyebrow} title={copy.portfolio.title} lede={copy.portfolio.lede} />

      <TeachPanel tag={copy.teach.portfolioUse.tag} title={copy.teach.portfolioUse.title}>
        {copy.teach.portfolioUse.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </TeachPanel>

      <FigureFrame
        id="figure-demand"
        caption={
          <>
            <b>{fillCopy(copy.figures.label, { n: 6 })}</b> {copy.figures.demand}
          </>
        }
      >
        <DemandFigure label={copy.figures.demandAria} />
      </FigureFrame>

      {isLoading ? <p className="text-[color:var(--graphite)]">{copy.ui.loading}</p> : null}

      {data ? (
        <>
          <StatStrip
            items={[
              {
                label: copy.portfolio.engagements,
                value: String(data.engagementCount),
                note: fillCopy(copy.portfolio.withAnalysis, { count: data.analysedCount }),
              },
              {
                label: copy.portfolio.meanPreparedness,
                value: data.averageReadiness != null ? (data.averageReadiness / 100).toFixed(2) : '—',
                note: copy.portfolio.acrossAnalysed,
              },
              {
                label: copy.portfolio.meanRigour,
                value: data.averageRigour != null ? `${data.averageRigour}%` : '—',
                note: copy.portfolio.deliveryDiscipline,
              },
              {
                label: copy.portfolio.openGaps,
                value: String(data.totalGapPoints),
                note: fillCopy(copy.portfolio.statutoryCount, { count: data.totalStatutoryGaps }),
              },
            ]}
          />

          <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
            {copy.portfolio.engagements}
          </h2>
          {data.engagements.length === 0 ? (
            <EmptyState
              title={copy.empty.noEngagements}
              why={copy.empty.noEngagementsWhy}
              actionHref="/engagements/new"
              actionLabel={copy.ui.createEngagement}
            />
          ) : (
            <div className="sheet overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>{copy.context.engagement}</th>
                    <th>{copy.squads.phase}</th>
                    <th>{copy.assurance.preparedness}</th>
                    <th>{copy.portfolio.meanRigour}</th>
                    <th>{copy.portfolio.openGaps}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.engagements.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Link href={`/squads/${row.id}`} className="font-semibold underline-offset-2 hover:underline">
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
                          <div className="font-data text-[10px] uppercase tracking-wide text-[color:var(--graphite)]">
                            {fillCopy(copy.portfolio.statutoryCount, { count: row.statutoryGapCount })}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </>
  );
}
