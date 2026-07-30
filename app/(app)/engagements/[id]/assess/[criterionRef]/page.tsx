'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { useI18n } from '@/components/app/LocaleProvider';
import { ProvenanceChip } from '@/components/product/ProvenanceChip';
import { Verdict } from '@/components/product/Verdict';
import { useEvidenceChain } from '@/components/chain/EvidenceChainRail';
import { trpc } from '@/lib/trpc/client';

const VERDICTS = ['met', 'at-risk', 'not-met', 'not-assessed'] as const;

export default function CriterionDetailPage() {
  const { messages: m, locale } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const criterionRef = decodeURIComponent(params.criterionRef as string);
  const chain = useEvidenceChain();
  const utils = trpc.useUtils();

  const { data } = trpc.standards.assessList.useQuery({
    engagementId: id,
    locale: locale === 'cy' ? 'cy' : 'en',
    ignorePhaseFilter: true,
  });
  const criterion = data?.criteria.find((c) => c.ref === criterionRef);

  const judgementQ = trpc.assurance.currentJudgement.useQuery(
    { engagementId: id, criterionId: criterion?.id ?? '' },
    { enabled: !!criterion?.id },
  );
  const historyQ = trpc.assurance.judgementHistory.useQuery(
    { engagementId: id, criterionId: criterion?.id ?? '' },
    { enabled: !!criterion?.id },
  );
  const evidenceQ = trpc.assurance.listEvidence.useQuery({ engagementId: id });
  const linkedEvidence =
    evidenceQ.data?.filter((e) => e.criteria.some((c) => c.criterionId === criterion?.id)) ?? [];
  const ownerQ = trpc.assurance.getEvidenceOwner.useQuery(
    { engagementId: id, criterionId: criterion?.id ?? '' },
    { enabled: !!criterion?.id },
  );
  const structureQ = trpc.orgDesign.engagementStructure.useQuery({ engagementId: id });
  const setOwner = trpc.assurance.setEvidenceOwner.useMutation({
    onSuccess: () => void utils.assurance.getEvidenceOwner.invalidate(),
  });
  const nudge = trpc.assurance.nudgeEvidenceOwner.useMutation();

  const confirm = trpc.assurance.confirmJudgement.useMutation({
    onSuccess: () => {
      void utils.assurance.currentJudgement.invalidate();
      void utils.assurance.judgementHistory.invalidate();
      void utils.assurance.preparednessIndex.invalidate({ engagementId: id });
    },
  });

  const [verdict, setVerdict] = useState<(typeof VERDICTS)[number]>('not-assessed');
  const [rationale, setRationale] = useState('');

  return (
    <AppShell title={m.engagement.assessTitle}>
      <AppNav />
      <EngagementSubNav engagementId={id} />

      <nav className="mb-4 text-sm text-ink-2" aria-label="Breadcrumb">
        <Link
          href={`/engagements/${id}/assess`}
          className="text-signal-ink underline-offset-2 hover:underline"
        >
          {m.engagement.assessTitle}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-data text-ink-0">{criterionRef}</span>
      </nav>

      {!criterion && (
        <p className="rounded-[2px] border border-rule bg-stock-1 px-4 py-6 text-[15px] text-ink-1">
          {m.engagement.assessCriterionMissing}
        </p>
      )}

      {criterion && (
        <article className="space-y-8">
          <header className="border-b-2 border-ink-0 pb-4">
            <p className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
              {criterion.standardName} v{criterion.standardVersion}
              {criterion.statutory ? ` · ${m.engagement.assessStatutory}` : ''}
            </p>
            <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink-0">
              <button
                type="button"
                className="font-data mr-3 text-[20px] text-signal-ink underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus)]"
                onClick={() => chain.open(id, criterion.id)}
              >
                {criterion.ref}
              </button>
              {criterion.title}
            </h1>
            <div className="mt-3">
              <Verdict
                value={judgementQ.data?.verdict ?? 'not-assessed'}
                onOpenChain={() => chain.open(id, criterion.id)}
              />
            </div>
          </header>

          <p className="max-w-3xl text-[15px] leading-[1.55] text-ink-0">{criterion.statement}</p>

          <section>
            <h2 className="text-[17px] font-semibold text-ink-0">Evidence</h2>
            {linkedEvidence.length === 0 ? (
              <p className="mt-2 text-[15px] text-ink-1">
                No evidence linked.{' '}
                <Link href={`/engagements/${id}/evidence`} className="text-signal-ink underline">
                  Add evidence
                </Link>
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-rule-soft border-y border-rule">
                {linkedEvidence.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span className="text-[15px] text-ink-0">{e.title}</span>
                    <span className="flex items-center gap-2">
                      <ProvenanceChip kind={e.provenance} />
                      <span className="font-data text-[11px] uppercase text-ink-2">
                        {e.freshness}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink-0">Evidence owner</h2>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="block text-[13px] font-medium text-ink-1">
                Owner
                <select
                  className="mt-1 block rounded-[2px] border border-rule px-3 py-2 text-sm"
                  value={ownerQ.data?.personId ?? ''}
                  onChange={(e) => {
                    if (!criterion || !e.target.value) return;
                    setOwner.mutate({
                      engagementId: id,
                      criterionId: criterion.id,
                      personId: e.target.value,
                    });
                  }}
                >
                  <option value="">Assign…</option>
                  {(structureQ.data?.graph.people ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.email ? ` · ${p.email}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="rounded-[2px] border border-rule px-3 py-2 text-sm text-ink-0 disabled:opacity-50"
                disabled={!ownerQ.data || nudge.isPending}
                onClick={() =>
                  criterion &&
                  nudge.mutate({ engagementId: id, criterionId: criterion.id })
                }
              >
                Nudge owner
              </button>
              {nudge.data && (
                <p className="text-sm text-verdict-met" role="status">
                  Nudge sent to {nudge.data.recipient}
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-[17px] font-semibold text-ink-0">Confirm judgement</h2>
            <form
              className="mt-3 max-w-xl space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                confirm.mutate({
                  engagementId: id,
                  criterionId: criterion.id,
                  verdict,
                  rationale,
                  proposedBy: 'human',
                });
              }}
            >
              <label className="block text-[13px] font-medium text-ink-1">
                Verdict
                <select
                  className="mt-1 block w-full rounded-[2px] border border-rule px-3 py-2 text-sm"
                  value={verdict}
                  onChange={(e) => setVerdict(e.target.value as (typeof VERDICTS)[number])}
                >
                  {VERDICTS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[13px] font-medium text-ink-1">
                Rationale (min 40 characters)
                <textarea
                  className="mt-1 block w-full rounded-[2px] border border-rule px-3 py-2 text-sm"
                  rows={4}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  required
                  minLength={40}
                />
              </label>
              <button
                type="submit"
                disabled={confirm.isPending || rationale.trim().length < 40}
                className="rounded-[2px] bg-brand px-4 py-2 text-sm font-medium text-text-inverse disabled:opacity-50"
              >
                Confirm judgement
              </button>
              {confirm.isSuccess && (
                <p className="text-sm text-verdict-met" role="status">
                  Judgement confirmed
                </p>
              )}
            </form>
          </section>

          {(historyQ.data?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-[17px] font-semibold text-ink-0">Judgement history</h2>
              <ul className="mt-2 space-y-3">
                {historyQ.data?.map((j) => (
                  <li key={j.id} className="rounded-[2px] border border-rule px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Verdict value={j.verdict} />
                      <ProvenanceChip kind={j.proposedBy === 'ai' ? 'ai' : 'human'} />
                      <span className="font-data text-[11px] text-ink-2">
                        {j.confirmedAt.toLocaleString('en-GB')}
                        {j.supersededById ? ' · superseded' : ' · current'}
                      </span>
                    </div>
                    <p className="mt-2 text-[15px] text-ink-1">{j.rationale}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="text-[12px] text-ink-2">{criterion.attribution}</p>
        </article>
      )}
    </AppShell>
  );
}
