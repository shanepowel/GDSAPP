'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { ScoreBar } from '@/components/app/ScoreBar';
import { StatusPill, type StatusKind } from '@/components/app/StatusPill';
import { RationaleDisclosure } from '@/components/app/RationaleDisclosure';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

const TABS = ['Fit', 'Composition', 'Readiness', 'Adaptation', 'Bid'] as const;

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const { data } = trpc.engagement.byId.useQuery({ id });
  const [tab, setTab] = useState<(typeof TABS)[number]>('Readiness');
  const req = data?.requirements[0];
  const result = req?.runs[0]?.result as ExtendedAnalysisResult | undefined;

  if (!result) {
    return (
      <AppShell title="Analysis">
        <p className="text-text-muted">No analysis yet.</p>
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

  return (
    <AppShell title="Analysis">
      <ScoreBar value={result.overallReadiness} label="Overall readiness" />
      <div className="no-print mt-6 flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-brand text-brand' : 'text-text-muted'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'Fit' &&
          result.fit.map((f) => (
            <div key={`${f.personId}-${f.roleLevelId}`} className="mb-4 rounded-lg border border-border bg-surface p-4">
              <p className="font-medium">
                {f.personName} → {f.roleName}: {f.fitPercent}%
              </p>
              <RationaleDisclosure
                rows={f.skills.map((s) => ({
                  requirement: `${s.skillName} (${s.required})`,
                  held: s.held ?? 'None',
                  match: s.match,
                }))}
              />
            </div>
          ))}
        {tab === 'Composition' && (
          <>
            <p className="mb-4 text-sm">Overall composition: {result.composition.overallPercent}%</p>
            {result.composition.roles.map((r) => (
              <div key={r.roleLevelId} className="mb-3 rounded-lg border border-border bg-surface p-3 text-sm">
                <span className="font-medium">{r.roleName}</span>
                {' · '}
                {r.covered ? `Covered (best fit ${r.bestFitPercent}%)` : 'Gap'}
                {r.thinCoverage && ' · Thin coverage'}
              </div>
            ))}
          </>
        )}
        {tab === 'Readiness' &&
          Object.entries(byCategory).map(([cat, points]) => (
            <section key={cat} className="mb-6">
              <h2 className="mb-2 font-semibold text-accent">{cat}</h2>
              {points.map((p) => (
                <div key={p.pointId} className="mb-3 rounded-lg border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {p.number}. {p.title}
                    </span>
                    <StatusPill kind={p.status as StatusKind} />
                    {p.statutoryNote && (
                      <span className="text-xs text-text-muted">Statutory</span>
                    )}
                  </div>
                  <p className="mt-1 tabular-nums text-sm">
                    {p.score}% (capability {p.capabilityScore ?? p.score}% · evidence{' '}
                    {p.evidenceStrength ?? 0}%)
                  </p>
                  {p.evidenceGaps.length > 0 && (
                    <p className="mt-1 text-sm text-text-muted">Gaps: {p.evidenceGaps.join('; ')}</p>
                  )}
                  <RationaleDisclosure
                    rows={p.rationale.map((r) => ({
                      requirement: p.title,
                      held: r,
                      match: 'partial' as const,
                    }))}
                  />
                </div>
              ))}
            </section>
          ))}
        {tab === 'Bid' && result.bidOutlook && (
          <>
            <p className="mb-4 text-sm">
              Quality outlook (weighted): {result.bidOutlook.overallQualityOutlook}%
            </p>
            {result.bidOutlook.questions.map((q) => (
              <div key={q.questionId} className="mb-3 rounded-lg border border-border bg-surface p-4 text-sm">
                <span className="font-medium">{q.ref}</span>
                {q.passFailRisk && <span className="ml-2 text-danger">Pass/fail risk</span>}
                <p>
                  Band {q.predictedBand} · Capability {q.capabilityCoverage}% · Evidence {q.evidenceStrength}%
                </p>
                <p className="text-xs text-text-muted">{q.confidenceNote}</p>
              </div>
            ))}
            <Link href={`/engagements/${id}/tender`} className="text-sm text-brand hover:underline">
              Manage tender and drafts
            </Link>
          </>
        )}
        {tab === 'Bid' && !result.bidOutlook && (
          <p className="text-sm text-text-muted">Set up a tender under Bid to see outlook here.</p>
        )}
        {tab === 'Adaptation' &&
          result.adaptation.actions.map((a) => (
            <div key={a.id} className="mb-3 rounded-lg border border-border bg-surface p-4">
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-text-muted">{a.description}</p>
              <p className="mt-1 text-xs">
                Impact: {a.impact} · Effort: {a.effort}
                {a.estimatedCost != null && ` · ~£${a.estimatedCost}`}
                {a.weeksToCompetence != null && ` · ${a.weeksToCompetence}w`}
                {a.feasible === false && ' · Over budget'}
              </p>
            </div>
          ))}
      </div>
      <Link href={`/engagements/${id}/report`} className="mt-6 inline-block">
        <Button variant="secondary">View report</Button>
      </Link>
    </AppShell>
  );
}
