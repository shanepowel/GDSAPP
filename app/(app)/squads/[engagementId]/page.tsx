'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FitBandCell, FitStrip } from '@/components/team-fit/FitStrip';
import { copy } from '@/lib/copy';
import { fitFromStored, type FitBreakdown } from '@/lib/scoring/fit';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/Button';

export default function SquadFitPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const id = params.engagementId as string;
  const tourStep = search.get('tour');
  const { data: archetypes } = trpc.teamFit.listArchetypes.useQuery();
  const archetypeId = search.get('archetype') ?? archetypes?.[0]?.id ?? '';
  const { data, refetch } = trpc.teamFit.overview.useQuery(
    { engagementId: id, archetypeId },
    { enabled: Boolean(archetypeId) },
  );
  const recompute = trpc.teamFit.recompute.useMutation({ onSuccess: () => refetch() });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (tourStep === '4' && data?.rows[0]) {
      router.replace(`/squads/${id}/roles/${data.rows[0].role.id}?tour=4`);
    }
  }, [tourStep, data, id, router]);

  const gaps = (data?.rows ?? []).filter(
    (row) => row.gap || !row.bestScore || row.bestScore.band === 'gap' || row.bestScore.band === 'stretch',
  );

  return (
    <>
      <p className="eyebrow mb-2 text-[color:var(--graphite)]">{copy.squads.eyebrow}</p>
      <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold">
        {data?.archetype.name ?? copy.squads.title}
      </h1>
      <p className="mt-2 mb-4 max-w-[62ch] text-[color:var(--graphite)]">{copy.squads.lede}</p>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-[color:var(--graphite)]">{copy.squads.archetype}</span>
          <select
            className="border border-[color:var(--rule)] bg-[var(--raised)] px-3 py-2 text-sm"
            style={{ borderRadius: 'var(--radius)' }}
            value={archetypeId}
            onChange={(e) => router.replace(`/squads/${id}?archetype=${encodeURIComponent(e.target.value)}`)}
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
        <Link href={`/squads/${id}/gaps`} className="text-sm underline-offset-2 hover:underline">
          {copy.squads.gapsTitle}
        </Link>
        <Link href={`/engagements/${id}/team/people`} className="text-sm underline-offset-2 hover:underline">
          {copy.people.pool}
        </Link>
        <Link
          href={`/engagements/${id}/team/proposal${archetypeId ? `?archetype=${encodeURIComponent(archetypeId)}` : ''}`}
          className="text-sm underline-offset-2 hover:underline"
        >
          Confirm proposal
        </Link>
      </div>

      <div className="legend mb-4 flex flex-wrap gap-5 font-data text-[10px] text-[color:var(--graphite)]">
        <span>{copy.legend.held}</span>
        <span>{copy.legend.partial}</span>
        <span>{copy.legend.datum}</span>
        <span>{copy.legend.bracket}</span>
      </div>

      <div className="sheet overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>{copy.squads.role}</th>
              <th>{copy.squads.criticality}</th>
              <th>{copy.squads.bestCandidate}</th>
              <th>{copy.squads.fitAgainstDatum}</th>
              <th>{copy.squads.composite}</th>
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
              return (
                <tr
                  key={role.id}
                  className="clickable"
                  onClick={() => router.push(`/squads/${id}/roles/${role.id}`)}
                >
                  <td>
                    <div className="font-semibold">{role.displayTitle}</div>
                    <div className="font-data text-[10.5px] text-[color:var(--graphite)]">
                      {role.minLevel} · {role.fteRequired.toFixed(1)} FTE
                    </div>
                  </td>
                  <td>
                    <span className={`flag ${role.criticality === 'core' ? 'flag-core' : ''}`}>
                      {role.criticality}
                    </span>
                  </td>
                  <td>
                    {bestScore?.personName ?? '—'}
                    {capacityRisk ? <span className="flag flag-risk ml-2">{copy.squads.capacityFlag}</span> : null}
                    {gap ? <div className="font-data text-[10px] text-[color:var(--survey)]">{gap.kind}</div> : null}
                  </td>
                  <td>{fit ? <FitStrip fit={fit} candidateName={bestScore?.personName} /> : '—'}</td>
                  <td>{fit ? <FitBandCell fit={fit} /> : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
                <th>{copy.squads.recommendation}</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map(({ role, bestScore, gap }) => (
                <tr key={role.id}>
                  <td className="font-semibold">{role.displayTitle}</td>
                  <td>
                    {gap?.kind?.replaceAll('_', ' ') ?? bestScore?.band ?? 'unfilled'}
                    {bestScore ? `, best available ${bestScore.compositeScore.toFixed(2)}` : ''}
                  </td>
                  <td>{gap?.recommendation ?? 'Recruit'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
