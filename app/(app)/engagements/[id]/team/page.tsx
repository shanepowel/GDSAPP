'use client';

import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { Button } from '@/components/ui/Button';
import { FitStrip } from '@/components/team-fit/FitStrip';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';
import type { FitBand, FitBreakdown } from '@/lib/scoring/fit';

export default function TeamFitOverviewPage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: archetypes } = trpc.teamFit.listArchetypes.useQuery();
  const archetypeId = search.get('archetype') ?? archetypes?.[0]?.id ?? '';
  const { data, refetch, isFetching } = trpc.teamFit.overview.useQuery(
    { engagementId: id, archetypeId },
    { enabled: Boolean(archetypeId) },
  );
  const recompute = trpc.teamFit.recompute.useMutation({
    onSuccess: () => refetch(),
  });
  const [busy, setBusy] = useState(false);

  return (
    <AppShell title={m.teamFit.title}>
      <AppNav />
      <EngagementSubNav engagementId={id} />

      <p className="mb-4 max-w-2xl text-sm text-text-muted">{m.teamFit.intro}</p>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="mb-1 block text-text-muted">{m.teamFit.archetype}</span>
          <select
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
            value={archetypeId}
            onChange={(e) => {
              const next = e.target.value;
              router.replace(`/engagements/${id}/team?archetype=${encodeURIComponent(next)}`);
            }}
          >
            {(archetypes ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
                {a.isSystem ? ' (system)' : ''} · v{a.version}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          variant="secondary"
          disabled={!archetypeId || recompute.isPending || busy}
          onClick={async () => {
            if (!archetypeId) return;
            setBusy(true);
            try {
              await recompute.mutateAsync({ engagementId: id, archetypeId });
            } finally {
              setBusy(false);
            }
          }}
        >
          {m.teamFit.computeScores}
        </Button>
        <Link
          href={`/engagements/${id}/team/people`}
          className="text-sm text-brand underline-offset-2 hover:underline"
        >
          {m.teamFit.managePeople}
        </Link>
        <Link
          href={`/engagements/${id}/team/proposal${archetypeId ? `?archetype=${archetypeId}` : ''}`}
          className="text-sm text-brand underline-offset-2 hover:underline"
        >
          {m.teamFit.proposalLink}
        </Link>
        <Link
          href={`/engagements/${id}/team/gaps${archetypeId ? `?archetype=${archetypeId}` : ''}`}
          className="text-sm text-brand underline-offset-2 hover:underline"
        >
          {m.teamFit.gapsLink}
        </Link>
      </div>

      {data?.computedAt ? (
        <p className="mb-3 text-xs text-text-muted">
          {m.teamFit.computedAt}: {new Date(data.computedAt).toLocaleString()}
          {isFetching ? ' · …' : ''}
        </p>
      ) : (
        <p className="mb-3 text-sm text-text-muted">{m.teamFit.noScoresYet}</p>
      )}

      <ul className="space-y-3">
        {data?.rows.map(({ role, bestScore, gap }) => {
          const breakdown = bestScore?.breakdown as unknown as FitBreakdown | undefined;
          const unevidenced = breakdown?.notes.includes('no_rigour_signals');
          const isGapRow = !bestScore || bestScore.band === 'gap' || Boolean(gap);
          return (
            <li
              key={role.id}
              className="rounded-lg border border-border bg-surface p-4"
              style={isGapRow && !bestScore ? { borderColor: 'var(--status-gap, #a32020)' } : undefined}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-text">{role.displayTitle}</p>
                  <p className="text-xs text-text-muted">
                    {role.ddatRoleId} · {role.minLevel} · {role.fteRequired} FTE · {role.criticality}
                  </p>
                </div>
                <Link
                  href={`/engagements/${id}/team/roles/${role.id}`}
                  className="text-sm text-brand underline-offset-2 hover:underline"
                >
                  {m.teamFit.viewCandidates}
                </Link>
              </div>
              {bestScore ? (
                <div className="mt-3">
                  <p className="text-sm text-text">
                    {m.teamFit.bestCandidate}: {bestScore.personName}
                  </p>
                  <div className="mt-1">
                    <FitStrip
                      band={bestScore.band as FitBand}
                      compositeScore={bestScore.compositeScore}
                      rigourMultiplier={bestScore.rigourMultiplier}
                      breakdown={breakdown}
                      unevidenced={unevidenced}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm font-medium text-status-gap">{m.teamFit.gapRow}</p>
              )}
              {gap ? (
                <p className="mt-2 text-xs text-text-muted">
                  {gap.kind} → {gap.recommendation}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
