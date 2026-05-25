'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { DeploymentBanner } from '@/components/app/DeploymentBanner';
import { EngagementAssuranceHub } from '@/components/app/EngagementAssuranceHub';
import { RequirementSelector } from '@/components/app/RequirementSelector';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';
import { useRequirementId } from '@/lib/hooks/use-requirement-id';
import { engagementEntityLabel } from '@/lib/labels';
import { ScoreBar } from '@/components/app/ScoreBar';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

export default function EngagementOverviewPage() {
  const params = useParams();
  const id = params.id as string;
  const features = getClientDeploymentFeatures();
  const { messages: m } = useI18n();
  const entityLabel = engagementEntityLabel(features);
  const { data, isLoading, refetch } = trpc.engagement.byId.useQuery({ id });
  const { requirementId, setRequirementId } = useRequirementId(id, data?.requirements);
  const updateMeta = trpc.engagement.updateMeta.useMutation({ onSuccess: () => refetch() });
  const addRequirement = trpc.engagement.addRequirement.useMutation({ onSuccess: () => refetch() });
  const run = trpc.engagement.runAnalysis.useMutation({
    onSuccess: () => {
      window.location.href = `/engagements/${id}/analysis`;
    },
  });

  const [editingMeta, setEditingMeta] = useState(false);
  const [supplierTag, setSupplierTag] = useState('');
  const [lotTag, setLotTag] = useState('');

  const req = data?.requirements.find((r) => r.id === requirementId) ?? data?.requirements[0];
  const lastRun = req?.runs[0];
  const result = lastRun?.result as ExtendedAnalysisResult | undefined;

  const standardLabel =
    data?.standardId === 'wales'
      ? 'Digital Service Standard for Wales'
      : 'GDS Service Standard';

  return (
    <AppShell
      title={data?.name ?? entityLabel}
      standardId={data?.standardId}
      orgLabel={entityLabel}
    >
      {isLoading && <p className="mt-4 text-text-muted">Loading…</p>}
      {data && (
        <>
          <DeploymentBanner />
          <AppNav />
          <p className="mb-2 text-sm text-text-muted">
            {standardLabel} · {req?.phase ?? 'discovery'} phase
          </p>
          {(data.supplierTag || data.lotTag) && (
            <p className="mb-4 text-sm text-text-muted">
              {data.supplierTag && <>Supplier: {data.supplierTag}</>}
              {data.supplierTag && data.lotTag && ' · '}
              {data.lotTag && <>Lot: {data.lotTag}</>}
            </p>
          )}

          {editingMeta ? (
            <form
              className="mb-6 flex flex-wrap gap-2 rounded-lg border border-border bg-surface p-4"
              onSubmit={(e) => {
                e.preventDefault();
                updateMeta.mutate({
                  engagementId: id,
                  supplierTag: supplierTag.trim() || null,
                  lotTag: lotTag.trim() || null,
                });
                setEditingMeta(false);
              }}
            >
              <input
                placeholder="Supplier tag"
                value={supplierTag}
                onChange={(e) => setSupplierTag(e.target.value)}
                className="rounded-md border border-border px-3 py-2 text-sm"
              />
              <input
                placeholder="Lot / workstream"
                value={lotTag}
                onChange={(e) => setLotTag(e.target.value)}
                className="rounded-md border border-border px-3 py-2 text-sm"
              />
              <Button type="submit" disabled={updateMeta.isPending}>
                Save tags
              </Button>
              <Button type="button" variant="tertiary" onClick={() => setEditingMeta(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <button
              type="button"
              className="mb-4 text-sm text-brand hover:underline"
              onClick={() => {
                setSupplierTag(data.supplierTag ?? '');
                setLotTag(data.lotTag ?? '');
                setEditingMeta(true);
              }}
            >
              Edit supplier and lot tags (portfolio grouping)
            </button>
          )}

          {data.requirements.length > 0 && (
            <RequirementSelector
              requirements={data.requirements}
              value={requirementId}
              onChange={setRequirementId}
            />
          )}

          <h2 className="mb-4 font-semibold">Assurance dashboard</h2>
          <EngagementAssuranceHub
            engagementId={id}
            result={result}
            evidenceCount={data._count.evidence}
            judgementCount={data._count.judgements}
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="font-semibold">Requirement</h2>
              <p className="mt-2 text-sm text-text-muted">{req?.title ?? 'None'}</p>
              <p className="text-sm">Phase: {req?.phase}</p>
              <Link
                href={`/engagements/${id}/requirement`}
                className="mt-3 inline-block text-sm text-brand hover:underline"
              >
                Edit requirement
              </Link>
            </section>
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="font-semibold">Team</h2>
              <p className="mt-2 text-sm text-text-muted">{data.people.length} people</p>
              <Link
                href={`/engagements/${id}/team`}
                className="mt-3 inline-block text-sm text-brand hover:underline"
              >
                Edit team
              </Link>
            </section>
          </div>

          {lastRun && (
            <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="font-semibold">Latest readiness</h2>
              <div className="mt-3">
                <ScoreBar value={lastRun.overallReadiness} />
              </div>
            </div>
          )}

          <nav className="no-print mt-8 flex flex-wrap gap-3">
            {req && (
              <Button onClick={() => run.mutate({ requirementId: req.id })} disabled={run.isPending}>
                {m.common.runAnalysis}
              </Button>
            )}
            <Link href={`/engagements/${id}/analysis`}>
              <Button variant="secondary">View analysis</Button>
            </Link>
            <Link href={`/engagements/${id}/evidence`}>
              <Button variant="secondary">Evidence</Button>
            </Link>
            <Link href={`/engagements/${id}/rigour`}>
              <Button variant="secondary">Rigour</Button>
            </Link>
            <Link href={`/engagements/${id}/tender`}>
              <Button variant="secondary">
                {features.clientAssuranceLabels ? 'Assurance criteria' : 'Call-off'}
              </Button>
            </Link>
            <Link href={`/engagements/${id}/judgements`}>
              <Button variant="secondary">Judgements</Button>
            </Link>
            <Link href={`/engagements/${id}/report`}>
              <Button variant="secondary">Report</Button>
            </Link>
            <Link href={`/engagements/${id}/history`}>
              <Button variant="tertiary">History</Button>
            </Link>
            <Button
              variant="tertiary"
              onClick={() =>
                addRequirement.mutate({
                  engagementId: id,
                  title: `Requirement ${(data.requirements.length + 1).toString()}`,
                  phase: 'alpha',
                })
              }
            >
              Add requirement
            </Button>
          </nav>
        </>
      )}
    </AppShell>
  );
}
