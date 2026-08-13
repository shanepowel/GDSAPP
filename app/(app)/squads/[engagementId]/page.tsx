'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { FitBandCell, FitStrip } from '@/components/team-fit/FitStrip';
import { EmptyState, FitLegend, PageHeader, TextLink } from '@/components/datum/PageChrome';
import { TeachPanel } from '@/components/teach/TeachPanel';
import { WalkthroughSlot } from '@/components/teach/WalkthroughSlot';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy, gapMoveLabel } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { fitFromStored, type FitBreakdown } from '@/lib/scoring/fit';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/Button';

export default function SquadFitPage() {
  return (
    <Suspense fallback={null}>
      <SquadFitPageInner />
    </Suspense>
  );
}

function SquadFitPageInner() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const id = params.engagementId as string;
  const { data: archetypes } = trpc.teamFit.listArchetypes.useQuery();
  const archetypeId = search.get('archetype') ?? archetypes?.[0]?.id ?? '';
  const { data, refetch } = trpc.teamFit.overview.useQuery(
    { engagementId: id, archetypeId },
    { enabled: Boolean(archetypeId) },
  );
  const recompute = trpc.teamFit.recompute.useMutation({ onSuccess: () => refetch() });
  const [busy, setBusy] = useState(false);

  const gaps = (data?.rows ?? []).filter(
    (row) => row.gap || !row.bestScore || row.bestScore.band === 'gap' || row.bestScore.band === 'stretch',
  );
  const hasRows = (data?.rows ?? []).length > 0;

  return (
    <>
      <PageHeader
        eyebrow={copy.walkthrough.eyebrow}
        title={copy.walkthrough.archetypeName}
        lede={copy.walkthrough.lede}
      />

      <TeachPanel tag={copy.teach.whatYouAreDoing.tag} title={copy.teach.whatYouAreDoing.title}>
        {copy.teach.whatYouAreDoing.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </TeachPanel>
      <WalkthroughSlot force />

      <h2 className="mb-3 mt-10 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.walkthrough.thisEngagement}
      </h2>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <label className="text-sm">
          <span className="mb-1 block font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
            {copy.squads.archetype}
          </span>
          <select
            className="border border-[color:var(--rule)] bg-[var(--raised)] px-3 py-2 text-sm"
            style={{ borderRadius: 'var(--radius)' }}
            value={archetypeId}
            onChange={(e) =>
              router.replace(`/squads/${id}?archetype=${encodeURIComponent(e.target.value)}`)
            }
          >
            {(archetypes ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · v{a.version}
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
          {copy.squads.compute}
        </Button>
      </div>

      <p className="mb-4 flex flex-wrap gap-4">
        <TextLink href={`/engagements/${id}/team/people`}>{copy.ui.managePeople}</TextLink>
        <TextLink
          href={`/engagements/${id}/team/proposal${archetypeId ? `?archetype=${encodeURIComponent(archetypeId)}` : ''}`}
        >
          {copy.squads.confirmProposal}
        </TextLink>
      </p>

      <FitLegend copy={copy.legend} />

      {!hasRows ? (
        <EmptyState title={copy.empty.noScores} why={copy.empty.noScoresWhy} />
      ) : (
        <div className="sheet overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{copy.squads.role}</th>
                <th>{copy.squads.criticality}</th>
                <th>{copy.squads.bestCandidate}</th>
                <th>{copy.squads.fitAgainstDatum}</th>
                <th className="text-right">{copy.walkthrough.score}</th>
              </tr>
            </thead>
            <tbody>
              {(data?.rows ?? []).map(({ role, bestScore, gap }) => {
                const breakdown = bestScore?.breakdown as unknown as FitBreakdown | undefined;
                const fit = bestScore
                  ? fitFromStored({
                      skillScore: bestScore.skillScore,
                      rigourMultiplier: bestScore.rigourMultiplier,
                      compositeScore: bestScore.compositeScore,
                      band: bestScore.band,
                      breakdown,
                    })
                  : null;
                const capacityRisk = fit?.breakdown.capacityShortfall != null;
                const finding =
                  gap?.kind && gap.kind in copy.gaps
                    ? copy.gaps[gap.kind as keyof typeof copy.gaps]
                    : null;
                const href = `/squads/${id}/roles/${role.id}`;
                return (
                    <tr
                      key={role.id}
                      className="clickable"
                      onClick={() => router.push(href)}
                    >
                      <td>
                        <div className="font-semibold">{role.displayTitle}</div>
                        <div className="font-data text-[10.5px] text-[color:var(--graphite)]">
                          {role.minLevel} · {role.fteRequired.toFixed(1)} FTE
                        </div>
                      </td>
                      <td>
                        <span className={`flag ${role.criticality === 'core' ? 'flag-risk' : ''}`}>
                          {role.criticality === 'core' ||
                          role.criticality === 'supporting' ||
                          role.criticality === 'optional'
                            ? copy.squads.criticalityLabels[role.criticality]
                            : role.criticality}
                        </span>
                      </td>
                      <td>
                        {bestScore?.personName ?? '—'}
                        {capacityRisk ? (
                          <span className="flag flag-risk ml-2">{copy.squads.capacityFlag}</span>
                        ) : null}
                        {finding ? (
                          <div className="mt-1 font-data text-[10px] text-[color:var(--graphite)]">
                            {finding}
                          </div>
                        ) : null}
                      </td>
                      <td>{fit ? <FitStrip fit={fit} candidateName={bestScore?.personName} /> : '—'}</td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        {fit ? (
                          <div className="inline-block text-right">
                            <FitBandCell fit={fit} />
                          </div>
                        ) : (
                          '—'
                        )}
                        <div>
                          <Link href={href} className="btn-teach mt-2 inline-block">
                            {copy.walkthrough.seeAll}
                          </Link>
                        </div>
                      </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[12.5px] text-[color:var(--graphite)]">{copy.squads.selectHint}</p>

      <h2 className="mt-10 mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.squads.gapsTitle}
      </h2>
      {gaps.length === 0 ? (
        <p className="text-[color:var(--graphite)]">{copy.empty.noGaps}</p>
      ) : (
        <div className="sheet overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{copy.squads.role}</th>
                <th>{copy.squads.finding}</th>
                <th>{copy.squads.move}</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map(({ role, bestScore, gap }) => {
                const finding =
                  gap?.kind && gap.kind in copy.gaps
                    ? copy.gaps[gap.kind as keyof typeof copy.gaps]
                    : copy.squads.unfilled;
                const scoreNote = bestScore
                  ? fillCopy(copy.squads.bestAvailable, { score: bestScore.compositeScore.toFixed(2) })
                  : null;
                return (
                  <tr
                    key={role.id}
                    className="clickable"
                    onClick={() => router.push(`/squads/${id}/roles/${role.id}`)}
                  >
                    <td className="font-semibold">{role.displayTitle}</td>
                    <td>
                      <div>{finding}</div>
                      {scoreNote ? (
                        <div className="font-data text-[10px] text-[color:var(--graphite)]">{scoreNote}</div>
                      ) : null}
                    </td>
                    <td>{gapMoveLabel(copy, gap?.recommendation)}</td>
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
