'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { useI18n } from '@/components/app/LocaleProvider';
import { useEvidenceChain } from '@/components/chain/EvidenceChainRail';
import { ENGAGEMENT_PHASES } from '@/lib/standards/catalog';
import { trpc } from '@/lib/trpc/client';

export default function AssessPage() {
  const { messages: m, locale } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const utils = trpc.useUtils();
  const chain = useEvidenceChain();

  const { data: engagement } = trpc.engagement.byId.useQuery({ id });
  const ensureBound = trpc.standards.ensureBound.useMutation({
    onSuccess: () => {
      void utils.standards.assessList.invalidate({ engagementId: id });
    },
  });
  const { data, isLoading } = trpc.standards.assessList.useQuery(
    { engagementId: id, locale: locale === 'cy' ? 'cy' : 'en' },
    { enabled: !!engagement },
  );
  const setPhase = trpc.standards.setPhase.useMutation({
    onSuccess: () => {
      void utils.standards.assessList.invalidate({ engagementId: id });
      void utils.engagement.byId.invalidate({ id });
    },
  });

  useEffect(() => {
    if (engagement) ensureBound.mutate({ engagementId: id });
    // Bind once when engagement loads; mutation is stable enough for this gate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engagement?.id]);

  const phase = data?.phase ?? engagement?.phase ?? 'discovery';
  const applicable = data?.criteria.length ?? 0;

  return (
    <AppShell title={m.engagement.assessTitle}>

      <header className="mb-6 border-b-2 border-ink-0 pb-4">
        <p className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
          {data?.reference ?? engagement?.reference ?? '—'} · {m.engagement.assessTitle}
        </p>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink-0">
          {m.engagement.assessTitle}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-[1.55] text-ink-1">
          {m.engagement.assessIntro}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-[13px] font-medium text-ink-1">
          <span>{m.engagement.phaseLabel}</span>
          <select
            className="rounded-[2px] border border-rule bg-stock-0 px-3 py-2 text-sm text-ink-0"
            value={phase}
            disabled={setPhase.isPending}
            onChange={(e) =>
              setPhase.mutate({
                engagementId: id,
                phase: e.target.value as (typeof ENGAGEMENT_PHASES)[number],
              })
            }
          >
            {ENGAGEMENT_PHASES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <p className="font-data text-sm tabular-nums text-ink-2">
          {isLoading
            ? m.engagement.loading
            : m.engagement.assessApplicableCount
                .replace('{count}', String(applicable))
                .replace('{phase}', phase)}
        </p>
      </div>

      {!isLoading && applicable === 0 && (
        <p className="rounded-[2px] border border-rule bg-stock-1 px-4 py-6 text-[15px] text-ink-1">
          {m.engagement.assessEmpty}
        </p>
      )}

      <ul className="divide-y divide-rule-soft border-y border-rule">
        {data?.criteria.map((c) => (
          <li key={c.id}>
            <Link
              href={`/engagements/${id}/assess/${encodeURIComponent(c.ref)}`}
              className="flex flex-col gap-1 px-1 py-4 transition-colors hover:bg-stock-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus)]"
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <button
                  type="button"
                  className="font-data text-[12px] font-medium text-signal-ink underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus)]"
                  onClick={(e) => {
                    e.preventDefault();
                    chain.open(id, c.id);
                  }}
                >
                  {c.ref}
                </button>
                <span className="text-[15px] font-medium text-ink-0">{c.title}</span>
                {c.statutory && (
                  <span className="font-data text-[11px] uppercase tracking-[0.04em] text-verdict-not-met">
                    {m.engagement.assessStatutory}
                  </span>
                )}
                {c.translationReviewStatus === 'machine' && locale === 'cy' && (
                  <span className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
                    {m.engagement.assessMachineTranslation}
                  </span>
                )}
              </div>
              <p className="max-w-3xl text-[15px] leading-[1.55] text-ink-1">{c.statement}</p>
              <p className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
                {c.standardName} v{c.standardVersion}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {data?.criteria[0] && (
        <p className="mt-6 text-[12px] text-ink-2">{data.criteria[0].attribution}</p>
      )}
    </AppShell>
  );
}
