'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EmptyState, PageHeader, StatStrip, TextLink } from '@/components/datum/PageChrome';
import { TeachPanel } from '@/components/teach/TeachPanel';
import { Verdict, type VerdictValue } from '@/components/product/Verdict';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

function pointVerdict(status: string | undefined): VerdictValue {
  if (status === 'gap') return 'not-met';
  if (status === 'partial') return 'at-risk';
  if (status === 'met' || status === 'strong') return 'met';
  return 'not-assessed';
}

export default function AssurancePage() {
  const params = useParams();
  const id = params.engagementId as string;
  const { locale } = useI18n();
  const copy = getCopy(locale);
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
  const criteriaCount = data?.criteria.length;
  const hasAnalysis = typeof index === 'number';

  return (
    <>
      <PageHeader
        eyebrow={copy.assurance.eyebrow}
        title={copy.assurance.title}
        lede={copy.assurance.lede}
        actions={<TextLink href={`/engagements/${id}/assess`}>{copy.assurance.openAssess}</TextLink>}
      />

      <TeachPanel tag={copy.teach.assessment.tag} title={copy.teach.assessment.title}>
        {copy.teach.assessment.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </TeachPanel>

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

      {!hasAnalysis ? (
        <EmptyState
          title={copy.empty.noAnalysis}
          why={copy.empty.noAnalysisWhy}
          actionHref={`/engagements/${id}/assess`}
          actionLabel={copy.assurance.openAssess}
        />
      ) : (
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
                return (
                  <tr key={c.id}>
                    <td className="num">
                      <Link
                        href={`/engagements/${id}/assess/${encodeURIComponent(c.ref)}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {c.ref}
                      </Link>
                    </td>
                    <td>{c.title}</td>
                    <td>
                      <Verdict value={pointVerdict(point?.status)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
