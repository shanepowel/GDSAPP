'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FileText, ShieldAlert } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { AnalysisTabs, type AnalysisTabId } from '@/components/app/AnalysisTabs';
import { Card } from '@/components/app/Card';
import { Eyebrow } from '@/components/app/Eyebrow';
import { ScoreBar } from '@/components/app/ScoreBar';
import { StatusPill, type StatusKind } from '@/components/app/StatusPill';
import { RationaleDisclosure } from '@/components/app/RationaleDisclosure';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

function compositionStatus(
  covered: boolean,
  thinCoverage: boolean,
): StatusKind {
  if (!covered) return 'gap';
  if (thinCoverage) return 'partial';
  return 'met';
}

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const { data } = trpc.engagement.byId.useQuery({ id });
  const [tab, setTab] = useState<AnalysisTabId>('readiness');
  const req = data?.requirements[0];
  const result = req?.runs[0]?.result as ExtendedAnalysisResult | undefined;

  const topBidRisk = useMemo(() => {
    if (!result?.bidOutlook) return null;
    const risky = result.bidOutlook.questions.filter((q) => q.passFailRisk);
    if (risky.length) return risky[0];
    const weakest = [...result.bidOutlook.questions].sort(
      (a, b) => a.combinedScore - b.combinedScore,
    )[0];
    return weakest;
  }, [result]);

  const readinessSummary = useMemo(() => {
    if (!result) return '';
    const statutoryGaps = result.readiness.points.filter(
      (p) => p.statutoryNote && (p.status === 'gap' || p.status === 'partial'),
    );
    if (statutoryGaps.length >= 2) {
      return `${statutoryGaps.length} statutory points are not yet met. This service is not assessment ready.`;
    }
    if (result.overallReadiness < 65) {
      return 'Overall readiness is below on-track. Address top gaps before assessment.';
    }
    return 'Readiness is progressing. Review evidence strength on partial points.';
  }, [result]);

  if (!result) {
    return (
      <AppShell title="Analysis" standardId={data?.standardId}>
        <p className="mt-4 text-text-muted">No analysis yet.</p>
        <Link href={`/engagements/${id}`}>
          <Button className="mt-4">Back to run analysis</Button>
        </Link>
      </AppShell>
    );
  }

  const byCategory = result.readiness.points.reduce<Record<string, typeof result.readiness.points>>(
    (acc, p) => {
      const key = p.category ?? 'General';
      (acc[key] ??= []).push(p);
      return acc;
    },
    {},
  );

  const standardLabel =
    data?.standardId === 'wales'
      ? 'Digital Service Standard for Wales'
      : 'GDS Service Standard';

  return (
    <AppShell
      title={data?.name ?? 'Engagement'}
      standardId={data?.standardId}
      orgLabel="Engagement"
      hideTitle
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>{data?.name}</Eyebrow>
          <h1 className="font-display text-[34px] font-semibold leading-tight text-text">
            {req?.title ?? data?.name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {standardLabel} · {req?.phase ?? 'discovery'} phase
          </p>
        </div>
        <Link href={`/engagements/${id}/report`}>
          <Button>Export report</Button>
        </Link>
      </div>

      <div className="no-print mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <Eyebrow>Overall readiness</Eyebrow>
          <div className="mt-2">
            <ScoreBar value={result.overallReadiness} label="Readiness" />
          </div>
          <p className="mt-3 text-[13px] text-text-muted">{readinessSummary}</p>
        </Card>
        <Card className="p-5">
          <Eyebrow>Team composition</Eyebrow>
          <div className="mt-2">
            <ScoreBar value={result.composition.overallPercent} label="Composition" />
          </div>
          <p className="mt-3 text-[13px] text-text-muted">
            {result.composition.roles.filter((r) => !r.covered).length > 0
              ? `${result.composition.roles.filter((r) => !r.covered).length} role(s) missing from the team.`
              : 'All required roles have coverage.'}
          </p>
        </Card>
        <Card
          className="p-5"
          style={
            topBidRisk?.passFailRisk
              ? { borderColor: 'color-mix(in srgb, var(--status-gap) 33%, var(--color-border))' }
              : undefined
          }
        >
          <Eyebrow>{result.bidOutlook ? 'Top bid risk' : 'Bid outlook'}</Eyebrow>
          {result.bidOutlook && topBidRisk ? (
            <>
              <div className="mt-2 flex items-center gap-2">
                {topBidRisk.passFailRisk && (
                  <ShieldAlert className="h-5 w-5 shrink-0 text-status-gap" aria-hidden />
                )}
                <span className="text-[15px] font-semibold">
                  {topBidRisk.ref}: band {topBidRisk.predictedBand}
                </span>
              </div>
              <p className="mt-3 text-[13px] text-text-muted">
                {topBidRisk.passFailRisk
                  ? 'Mandatory pass/fail threshold may not be met. Review before submission.'
                  : topBidRisk.pointMovers[0] ?? topBidRisk.confidenceNote}
              </p>
            </>
          ) : (
            <p className="mt-2 text-[13px] text-text-muted">
              <Link href={`/engagements/${id}/tender`} className="text-brand-hover hover:underline">
                Set up a tender
              </Link>{' '}
              to see quality outlook and point-movers.
            </p>
          )}
        </Card>
      </div>

      <AnalysisTabs active={tab} onChange={setTab} showBid={!!result.bidOutlook} />

      <div>
        {tab === 'fit' && (
          <div className="grid gap-4 md:grid-cols-2">
            {result.fit.map((f) => (
              <Card key={`${f.personId}-${f.roleLevelId}`} className="p-5">
                <div className="text-[15px] font-semibold">{f.personName}</div>
                <div className="text-[13px] text-text-muted">{f.roleName}</div>
                <div className="mt-3">
                  <ScoreBar value={f.fitPercent} label="Fit" />
                </div>
                <RationaleDisclosure
                  rows={f.skills.map((s) => ({
                    requirement: `${s.skillName} · ${s.required}`,
                    held: s.held ?? 'None',
                    match: s.match,
                  }))}
                />
              </Card>
            ))}
          </div>
        )}

        {tab === 'composition' && (
          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt text-left text-text-muted">
                  <th className="px-5 py-3 font-medium">Role needed</th>
                  <th className="px-5 py-3 font-medium">Coverage</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.composition.roles.map((r) => (
                  <tr key={r.roleLevelId} className="border-t border-border">
                    <td className="px-5 py-3 font-medium">{r.roleName}</td>
                    <td className="px-5 py-3 text-text-muted">
                      {r.covered
                        ? `Best fit ${r.bestFitPercent ?? 0}%`
                        : 'Not on team'}
                      {r.thinCoverage && r.covered ? ' · Thin coverage' : ''}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill kind={compositionStatus(r.covered, r.thinCoverage)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'readiness' && (
          <div className="space-y-7">
            {Object.entries(byCategory).map(([cat, points]) => (
              <div key={cat}>
                <h2 className="font-display mb-3 text-[19px] font-semibold text-text">{cat}</h2>
                <div className="space-y-3">
                  {points.map((p) => (
                    <Card key={p.pointId} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-semibold text-text-muted">
                              Point {p.number}
                            </span>
                            {p.statutoryNote && (
                              <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-inverse">
                                Statutory
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-[15px] font-semibold">{p.title}</div>
                          {p.evidenceGaps.length > 0 && (
                            <p className="mt-1.5 text-[13px] text-text-muted">
                              {p.evidenceGaps[0]}
                            </p>
                          )}
                          <p className="mt-2 text-[12px] text-text-muted">
                            Capability {p.capabilityScore ?? p.score}% · evidence{' '}
                            {p.evidenceStrength ?? 0}%
                          </p>
                        </div>
                        <StatusPill kind={p.status as StatusKind} />
                      </div>
                      {p.rationale.length > 0 && (
                        <RationaleDisclosure
                          rows={p.rationale.map((r) => ({
                            requirement: p.title,
                            held: r,
                            match: 'partial' as const,
                          }))}
                        />
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'adaptation' && (
          <div className="space-y-3">
            {result.adaptation.actions.map((a) => (
              <Card key={a.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-[15px] font-semibold">{a.title}</div>
                    <p className="mt-1.5 text-[13px] text-text-muted">{a.description}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-hover">
                      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Improves {a.improves.join(', ')}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <span className="rounded-md bg-surface-alt px-2.5 py-1 text-[12px] font-medium capitalize text-text">
                      Impact {a.impact}
                    </span>
                    <span className="rounded-md bg-surface-alt px-2.5 py-1 text-[12px] font-medium capitalize text-text">
                      Effort {a.effort}
                    </span>
                    {a.estimatedCost != null && (
                      <span className="rounded-md bg-surface-alt px-2.5 py-1 text-[12px] font-medium text-text">
                        ~£{a.estimatedCost.toLocaleString('en-GB')}
                      </span>
                    )}
                    {a.feasible === false && (
                      <span className="rounded-md bg-brand-tint px-2.5 py-1 text-[12px] font-medium text-status-gap">
                        Over budget
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'bid' && result.bidOutlook && (
          <div className="space-y-3">
            <Card className="p-5">
              <Eyebrow>Quality outlook (weighted)</Eyebrow>
              <p className="mt-1 text-2xl font-bold text-brand">
                {result.bidOutlook.overallQualityOutlook}%
              </p>
            </Card>
            {result.bidOutlook.questions.map((q) => (
              <Card key={q.questionId} className="p-5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold">{q.ref}</span>
                  {q.passFailRisk && <StatusPill kind="gap">Pass/fail risk</StatusPill>}
                </div>
                <p className="mt-1 text-text-muted">
                  Predicted band {q.predictedBand} · Capability {q.capabilityCoverage}% · Evidence{' '}
                  {q.evidenceStrength}%
                </p>
                <p className="mt-1 text-xs text-text-muted">{q.confidenceNote}</p>
                <RationaleDisclosure
                  rows={q.rationale.map((r) => ({
                    requirement: 'Rationale',
                    held: r,
                    match: 'partial' as const,
                  }))}
                />
              </Card>
            ))}
            <Link href={`/engagements/${id}/tender`} className="text-sm text-brand-hover hover:underline">
              Manage tender and drafts
            </Link>
          </div>
        )}

        {tab === 'bid' && !result.bidOutlook && (
          <p className="text-sm text-text-muted">
            Set up a tender under{' '}
            <Link href={`/engagements/${id}/tender`} className="text-brand-hover hover:underline">
              Bid
            </Link>{' '}
            to see outlook here.
          </p>
        )}
      </div>

      <div className="no-print mt-8 flex flex-wrap gap-3">
        <Link href={`/engagements/${id}`}>
          <Button variant="secondary">Back to engagement</Button>
        </Link>
      </div>
    </AppShell>
  );
}
