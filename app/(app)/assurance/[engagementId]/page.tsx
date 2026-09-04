'use client';

import { useParams, useRouter } from 'next/navigation';
import { EmptyState, StatStrip, TextLink } from '@/components/datum/PageChrome';
import { AssuranceTeaching } from '@/components/teach/AssuranceTeaching';
import { Verdict, type VerdictValue } from '@/components/product/Verdict';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';
import { pillarsForGdsPoint } from '@/lib/bridge/gds';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

function pointVerdict(status: string | undefined): VerdictValue {
  if (status === 'gap') return 'not-met';
  if (status === 'partial') return 'at-risk';
  if (status === 'met' || status === 'strong') return 'met';
  return 'not-assessed';
}

function pillarLabel(ref: string): string {
  const n = Number.parseInt(ref, 10);
  if (!Number.isFinite(n)) return '';
  return pillarsForGdsPoint(n).join(', ');
}

export default function AssurancePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.engagementId as string;
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const { data: engagement, isError, isLoading } = trpc.engagement.byId.useQuery({ id });
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
  const criteriaCount = data?.criteria.length;
  const hasAnalysis = typeof index === 'number';
  const standardLabel =
    engagement?.standardId === 'gds' ? copy.squads.standardGds : copy.squads.standardWales;

  return (
    <>
      <AssuranceTeaching />

      <h2 className="mb-3 mt-10 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {standardLabel}
      </h2>
      <p className="mb-4">
        <TextLink href={`/engagements/${id}/assess`}>{copy.assurance.openAssess}</TextLink>
      </p>

      {isLoading ? <p className="text-[color:var(--graphite)]">{copy.ui.loading}</p> : null}
      {isError ? <EmptyState title={copy.ui.loadFailed} why={copy.ui.loadFailedWhy} /> : null}

      {!isLoading && !isError ? (
        <StatStrip
          items={[
            {
              label: copy.assurance.preparedness,
              value: hasAnalysis ? (index / 100).toFixed(2) : '—',
            },
            { label: copy.assurance.pointsAtRisk, value: hasAnalysis ? String(atRiskCount) : '—' },
            {
              label: copy.assurance.inThisPhase,
              value: criteriaCount != null ? String(criteriaCount) : '—',
            },
          ]}
        />
      ) : null}

      {!isLoading && !isError && !hasAnalysis ? (
        <EmptyState
          title={copy.empty.noAnalysis}
          why={copy.empty.noAnalysisWhy}
          actionHref={`/engagements/${id}/assess`}
          actionLabel={copy.assurance.openAssess}
        />
      ) : null}

      {!isLoading && !isError && hasAnalysis ? (
        <div className="sheet overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{copy.assurance.point}</th>
                <th>{copy.assurance.requirement}</th>
                <th>{copy.assurance.pillar}</th>
                <th>{copy.assurance.status}</th>
                <th>{copy.assurance.why}</th>
              </tr>
            </thead>
            <tbody>
              {(data?.criteria ?? []).map((c) => {
                const point = points.find((p) => p.title === c.title || String(p.number) === c.ref);
                const href = `/engagements/${id}/assess/${encodeURIComponent(c.ref)}`;
                const pillars = pillarLabel(c.ref);
                return (
                  <tr
                    key={c.id}
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
                    <td className="num">{c.ref}</td>
                    <td>{c.title}</td>
                    <td className="text-[color:var(--graphite)]">{pillars || '—'}</td>
                    <td>
                      <Verdict value={pointVerdict(point?.status)} />
                    </td>
                    <td className="font-data text-[10.5px] text-[color:var(--graphite)]">
                      {point?.rationale[0] ?? point?.evidenceGaps[0] ?? '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
