'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { DeploymentBanner } from '@/components/app/DeploymentBanner';
import { EngagementAssuranceHub } from '@/components/app/EngagementAssuranceHub';
import {
  EngagementWorkflowGuide,
  type WorkflowStepId,
} from '@/components/app/EngagementWorkflowGuide';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { ConstraintsCard } from '@/components/app/ConstraintsCard';
import { PageIntro } from '@/components/app/PageIntro';
import { PreparednessIndexCard } from '@/components/app/PreparednessIndexCard';
import { RequirementFlexCard } from '@/components/app/RequirementFlexCard';
import { RequirementSelector } from '@/components/app/RequirementSelector';
import { WhatIfMovesCard } from '@/components/app/WhatIfMovesCard';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';
import { useRequirementId } from '@/lib/hooks/use-requirement-id';
import { engagementEntityLabel } from '@/lib/labels';
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
  const utils = trpc.useUtils();
  const { data, isLoading, refetch } = trpc.engagement.byId.useQuery({ id });
  const { requirementId, setRequirementId } = useRequirementId(id, data?.requirements);
  const updateMeta = trpc.engagement.updateMeta.useMutation({ onSuccess: () => refetch() });
  const addRequirement = trpc.engagement.addRequirement.useMutation({ onSuccess: () => refetch() });
  const deleteEngagement = trpc.engagement.delete.useMutation({
    onSuccess: () => {
      window.location.href = '/engagements';
    },
  });
  const run = trpc.engagement.runAnalysis.useMutation({
    onSuccess: async () => {
      await utils.engagement.byId.invalidate({ id });
      await utils.engagement.whatIfMoves.invalidate({ engagementId: id });
    },
  });

  const [editingMeta, setEditingMeta] = useState(false);
  const [supplierTag, setSupplierTag] = useState('');
  const [lotTag, setLotTag] = useState('');

  const req = data?.requirements.find((r) => r.id === requirementId) ?? data?.requirements[0];
  const lastRun = req?.runs[0];
  const result = lastRun?.result as ExtendedAnalysisResult | undefined;

  const standardLabel =
    data?.standardId === 'wales' ? m.engagement.standardWales : m.engagement.standardGds;

  const onWhatIfUpdated = () => {
    void refetch();
    void utils.engagement.byId.invalidate({ id });
  };

  const workflowSteps: { id: WorkflowStepId; done: boolean; optional?: boolean }[] = [
    {
      id: 'requirement',
      done: Boolean(req?.title?.trim() && req?.outcome?.trim()),
    },
    { id: 'team', done: (data?.people.length ?? 0) > 0 },
    { id: 'evidence', done: (data?._count.evidence ?? 0) > 0, optional: true },
    { id: 'analysis', done: Boolean(result) },
    { id: 'report', done: Boolean(result) },
  ];

  return (
    <AppShell
      title={data?.name ?? entityLabel}
      standardId={data?.standardId}
      orgLabel={entityLabel}
      hideTitle
    >
      {isLoading && <p className="mt-4 text-text-muted">{m.engagement.loading}</p>}
      {data && (
        <>
          <DeploymentBanner />
          <AppNav />
          <EngagementSubNav engagementId={id} />

          <PageIntro
            className="mb-6"
            title={m.engagement.subOverview}
            description={m.engagement.overviewIntro}
          />

          <EngagementWorkflowGuide engagementId={id} steps={workflowSteps} />

          {data.requirements.length > 0 && (
            <RequirementSelector
              requirements={data.requirements}
              value={requirementId}
              onChange={setRequirementId}
            />
          )}

          <section
            className="-mx-6 mb-8 mt-6 rounded-none px-6 py-8 md:rounded-2xl"
            style={{ background: 'var(--tt-navy)' }}
          >
            <h1 className="font-display text-2xl font-semibold text-white md:text-[34px] md:leading-tight">
              {data.name}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {standardLabel} · {req?.phase ?? 'discovery'} {m.engagement.phaseLabel}
            </p>
            {(data.supplierTag || data.lotTag) && (
              <p className="mt-1 text-sm text-slate-400">
                {data.supplierTag && (
                  <>
                    {m.engagement.supplierLabel}: {data.supplierTag}
                  </>
                )}
                {data.supplierTag && data.lotTag && ' · '}
                {data.lotTag && (
                  <>
                    {m.engagement.lotLabel}: {data.lotTag}
                  </>
                )}
              </p>
            )}

            {result && req ? (
              <div className="mt-6">
                <PreparednessIndexCard
                  result={result}
                  standardLabel={standardLabel}
                  phase={req.phase}
                />
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/20 px-6 py-8">
                <h2 className="text-base font-semibold text-white">{m.engagement.noAnalysisTitle}</h2>
                <p className="mt-2 text-sm text-slate-300">{m.engagement.noAnalysisBody}</p>
                {req && (
                  <Button
                    className="mt-4"
                    onClick={() => run.mutate({ requirementId: req.id })}
                    disabled={run.isPending}
                  >
                    {m.common.runAnalysis}
                  </Button>
                )}
              </div>
            )}
          </section>

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
                placeholder={m.engagement.supplierPlaceholder}
                value={supplierTag}
                onChange={(e) => setSupplierTag(e.target.value)}
                className="rounded-md border border-border px-3 py-2 text-sm"
              />
              <input
                placeholder={m.engagement.lotPlaceholder}
                value={lotTag}
                onChange={(e) => setLotTag(e.target.value)}
                className="rounded-md border border-border px-3 py-2 text-sm"
              />
              <Button type="submit" disabled={updateMeta.isPending}>
                {m.engagement.saveTags}
              </Button>
              <Button type="button" variant="tertiary" onClick={() => setEditingMeta(false)}>
                {m.common.cancel}
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
              {m.engagement.editSupplierTags}
            </button>
          )}

          {req && (
            <section className="mt-8">
              <PageIntro title={m.engagement.sectionMoves} description={m.engagement.whatIfIntro} />
              <div className="mt-4">
                <WhatIfMovesCard
                  engagementId={id}
                  requirementId={req.id}
                  onUpdated={onWhatIfUpdated}
                />
              </div>
            </section>
          )}

          <PageIntro
            className="mb-4 mt-10"
            title={m.engagement.sectionDashboard}
            description={result ? undefined : m.engagement.hubNoAnalysis}
          />
          <EngagementAssuranceHub
            engagementId={id}
            result={result}
            evidenceCount={data._count.evidence}
            judgementCount={data._count.judgements}
          />

          {req && (
            <div className="mt-8 space-y-6">
              <ConstraintsCard requirementId={req.id} engagementId={id} />
              {result?.requirementFlex && (
                <RequirementFlexCard flex={result.requirementFlex} />
              )}
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="font-semibold">{m.engagement.cardRequirement}</h2>
              <p className="mt-2 text-sm text-text-muted">{req?.title ?? '-'}</p>
              <p className="text-sm text-text-muted">
                {m.engagement.reqPhase}: {req?.phase ?? '-'}
              </p>
              <Link
                href={`/engagements/${id}/requirement`}
                className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
              >
                {m.engagement.editRequirement}
              </Link>
            </section>
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="font-semibold">{m.engagement.cardTeam}</h2>
              <p className="mt-2 text-sm text-text-muted">
                {m.engagement.peopleCount.replace('{n}', String(data.people.length))}
              </p>
              <Link
                href={`/engagements/${id}/team`}
                className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
              >
                {m.engagement.editTeam}
              </Link>
            </section>
          </div>

          <div className="no-print mt-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {m.engagement.primaryActions}
            </p>
            <nav className="flex flex-wrap gap-3">
              {req && (
                <Button
                  onClick={() => run.mutate({ requirementId: req.id })}
                  disabled={run.isPending}
                >
                  {m.common.runAnalysis}
                </Button>
              )}
              <Link href={`/engagements/${id}/analysis`}>
                <Button variant="secondary">{m.engagement.viewAnalysis}</Button>
              </Link>
              <Link href={`/engagements/${id}/report`}>
                <Button variant="secondary">{m.engagement.subReport}</Button>
              </Link>
              <Link href={`/engagements/${id}/evidence`}>
                <Button variant="tertiary">{m.engagement.subEvidence}</Button>
              </Link>
              <Link href={`/engagements/${id}/team`}>
                <Button variant="tertiary">{m.engagement.subTeam}</Button>
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
              <Button
                variant="tertiary"
                onClick={() => {
                  if (confirm(m.engagement.deleteConfirm)) {
                    deleteEngagement.mutate({ engagementId: id });
                  }
                }}
              >
                {m.engagement.deleteEngagement}
              </Button>
            </nav>
          </div>
        </>
      )}
    </AppShell>
  );
}
