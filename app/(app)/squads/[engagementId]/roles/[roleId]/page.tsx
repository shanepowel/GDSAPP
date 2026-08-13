'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FitBandCell, FitBreakdownPanel, FitStrip } from '@/components/team-fit/FitStrip';
import { copy } from '@/lib/copy';
import { fitFromStored, type FitBreakdown } from '@/lib/scoring/fit';
import { trpc } from '@/lib/trpc/client';

export default function SquadRolePage() {
  const params = useParams();
  const search = useSearchParams();
  const id = params.engagementId as string;
  const roleId = params.roleId as string;
  const { data } = trpc.teamFit.roleCandidates.useQuery({
    engagementId: id,
    archetypeRoleId: roleId,
  });
  const [openId, setOpenId] = useState<string | null>(search.get('tour') === '4' ? 'first' : null);

  const firstId = data?.candidates[0]?.id;
  const expandedId = openId === 'first' ? firstId : openId;

  return (
    <>
      <p className="mb-4">
        <Link href={`/squads/${id}`} className="text-sm underline-offset-2 hover:underline">
          ← {copy.squads.title}
        </Link>
      </p>
      <p className="eyebrow mb-2 text-[color:var(--graphite)]">Archetype role</p>
      <h1 className="font-[family-name:var(--font-cond)] text-[22px] font-bold">
        {data?.role.displayTitle ?? 'Role'}
      </h1>
      {data ? (
        <p className="mb-6 font-data text-[11px] text-[color:var(--graphite)]">
          {data.role.minLevel} · {data.role.fteRequired.toFixed(1)} FTE · {data.role.criticality}
        </p>
      ) : null}

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        Every candidate, ranked
      </h2>
      <ul className="space-y-3">
        {(data?.candidates ?? []).map((c) => {
          const fit = fitFromStored({
            skillScore: c.skillScore,
            rigourMultiplier: c.rigourMultiplier,
            compositeScore: c.compositeScore,
            band: c.band,
            breakdown: c.breakdown as unknown as FitBreakdown,
          });
          const open = expandedId === c.id;
          return (
            <li key={c.id} className="border border-[color:var(--rule)] bg-[var(--raised)] p-4" style={{ borderRadius: 'var(--radius)' }}>
              <button
                type="button"
                className="flex w-full flex-wrap items-start justify-between gap-3 text-left"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : c.id)}
              >
                <div>
                  <div className="font-semibold">{c.personName}</div>
                  <div className="font-data text-[10.5px] text-[color:var(--graphite)]">
                    skill {fit.skillScore.toFixed(2)} · rigour ×{fit.rigourMultiplier.toFixed(2)}
                    {fit.breakdown.notes.includes('no_rigour_signals') ? ' (unevidenced)' : ''}
                  </div>
                </div>
                <FitBandCell fit={fit} />
              </button>
              <FitStrip fit={fit} candidateName={c.personName} />
              {open ? <FitBreakdownPanel fit={fit} /> : null}
            </li>
          );
        })}
        {data && data.candidates.length === 0 ? (
          <li className="text-sm text-[color:var(--graphite)]">{copy.empty.noSquad}</li>
        ) : null}
      </ul>
    </>
  );
}
