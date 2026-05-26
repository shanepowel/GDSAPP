'use client';

import Link from 'next/link';
import { Card } from '@/components/app/Card';
import { Eyebrow } from '@/components/app/Eyebrow';
import { ScoreBar } from '@/components/app/ScoreBar';
import { useI18n } from '@/components/app/LocaleProvider';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

export function EngagementAssuranceHub({
  engagementId,
  result,
  evidenceCount,
  judgementCount,
}: {
  engagementId: string;
  result: ExtendedAnalysisResult | undefined;
  evidenceCount: number;
  judgementCount: number;
}) {
  const features = getClientDeploymentFeatures();
  const { messages: m } = useI18n();

  if (!result) {
    return (
      <Card className="p-5">
        <p className="text-sm text-text-muted">{m.engagement.hubNoAnalysis}</p>
      </Card>
    );
  }

  const gapCount = result.readiness.points.filter(
    (p) => p.status === 'gap' || p.status === 'partial',
  ).length;
  const statutoryGaps = result.readiness.points.filter(
    (p) => p.statutoryNote && (p.status === 'gap' || p.status === 'partial'),
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-5">
        <Eyebrow>Readiness</Eyebrow>
        <div className="mt-2">
          <ScoreBar value={result.overallReadiness} />
        </div>
        <p className="mt-2 text-xs text-text-muted">
          {gapCount} open points · {statutoryGaps} statutory
        </p>
        <Link href={`/engagements/${engagementId}/analysis`} className="mt-2 inline-block text-xs text-brand hover:underline">
          View analysis
        </Link>
      </Card>
      <Card className="p-5">
        <Eyebrow>Agile rigour</Eyebrow>
        <p className="mt-2 text-2xl font-bold tabular-nums">
          {result.rigour ? `${result.rigour.overallPercent}%` : '-'}
        </p>
        <Link href={`/engagements/${engagementId}/rigour`} className="mt-2 inline-block text-xs text-brand hover:underline">
          {result.rigour ? 'Review rigour' : 'Assess rigour'}
        </Link>
      </Card>
      <Card className="p-5">
        <Eyebrow>Evidence</Eyebrow>
        <p className="mt-2 text-2xl font-bold tabular-nums">{evidenceCount}</p>
        <p className="text-xs text-text-muted">Items in register</p>
        <Link href={`/engagements/${engagementId}/evidence`} className="mt-2 inline-block text-xs text-brand hover:underline">
          Evidence register
        </Link>
      </Card>
      <Card className="p-5">
        <Eyebrow>
          {features.clientAssuranceLabels ? 'Criteria outlook' : 'Call-off outlook'}
        </Eyebrow>
        {result.bidOutlook ? (
          <>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {result.bidOutlook.overallQualityOutlook}%
            </p>
            <p className="text-xs text-text-muted">
              {result.bidOutlook.questions.filter((q) => q.passFailRisk).length} pass/fail risks
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-text-muted">No criteria mapped yet</p>
        )}
        <Link href={`/engagements/${engagementId}/tender`} className="mt-2 inline-block text-xs text-brand hover:underline">
          {features.clientAssuranceLabels ? 'Assurance criteria' : 'Call-off spec'}
        </Link>
      </Card>
      <Card className="p-5 sm:col-span-2 lg:col-span-4">
        <Eyebrow>Human judgements</Eyebrow>
        <p className="mt-2 text-sm text-text-muted">
          {judgementCount} recorded decision{judgementCount === 1 ? '' : 's'}. Overrides and assessor sign-off
          sit alongside deterministic scores.
        </p>
        <Link
          href={`/engagements/${engagementId}/judgements`}
          className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
        >
          Record or review judgements
        </Link>
      </Card>
    </div>
  );
}
