'use client';

import { useRouter } from 'next/navigation';
import { EmptyState, PageHeader, StatStrip } from '@/components/datum/PageChrome';
import { TeachPanel } from '@/components/teach/TeachPanel';
import { DemandFigure, FigureFrame } from '@/components/teach/figures';
import { lifecycleLabels } from '@/components/engagement/shared';
import { phaseDisplay } from '@/lib/labels';
import { WALKTHROUGH_DEMAND } from '@/lib/teach/walkthrough';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';

export default function PortfolioPage() {
  const { data, isLoading, isError } = trpc.portfolio.summary.useQuery();
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const router = useRouter();
  const demandRows = WALKTHROUGH_DEMAND;
  const demandShortfall = demandRows.reduce((sum, row) => sum + Math.max(0, row.need - row.hold), 0);

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
            <b>{fillCopy(copy.figures.label, { n: 6 })}</b>{' '}
            {data
              ? fillCopy(copy.figures.demandCounted, { count: data.engagementCount })
              : copy.figures.demand}
          </>
        }
      >
        <DemandFigure label={copy.figures.demandAria} rows={demandRows} />
      </FigureFrame>

      {isLoading ? <p className="text-asm-ink-3">{copy.ui.loading}</p> : null}
      {isError ? <EmptyState title={copy.ui.loadFailed} why={copy.ui.loadFailedWhy} /> : null}

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
                value: demandShortfall.toFixed(1),
                note: fillCopy(copy.portfolio.statutoryCount, { count: data.totalStatutoryGaps }),
              },
            ]}
          />

          <h2 className="mb-3 mt-10 text-lg font-bold text-asm-brand">
            {copy.portfolio.liveHeading}
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
                  {data.engagements.map((row) => {
                    const href = `/squads/${row.id}`;
                    return (
                    <tr
                      key={row.id}
                      className="clickable"
                      tabIndex={0}
                      role="link"
                      onClick={() => router.push(href)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(href);
                        }
                      }}
                    >
                      <td className="font-semibold">{row.name}</td>
                      <td className="num">{phaseDisplay(row.phase, lifecycleLabels(copy), copy.spine.missing)}</td>
                      <td className="num">
                        {row.readinessPercent != null ? (row.readinessPercent / 100).toFixed(2) : '—'}
                      </td>
                      <td className="num">{row.rigourPercent != null ? `${row.rigourPercent}%` : '—'}</td>
                      <td className="num">
                        {row.gapPointCount}
                        {row.statutoryGapCount > 0 ? (
                          <div className="font-data text-[10px] uppercase tracking-wide text-asm-ink-3">
                            {fillCopy(copy.portfolio.statutoryCount, { count: row.statutoryGapCount })}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </>
  );
}
