'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { copy } from '@/lib/copy';
import { trpc } from '@/lib/trpc/client';

export default function SquadGapsPage() {
  return (
    <Suspense fallback={null}>
      <SquadGapsPageInner />
    </Suspense>
  );
}

function SquadGapsPageInner() {
  const params = useParams();
  const search = useSearchParams();
  const id = params.engagementId as string;
  const archetypeId = search.get('archetype') ?? undefined;
  const { data: gaps } = trpc.teamFit.listGaps.useQuery({ engagementId: id, archetypeId });

  return (
    <>
      <p className="mb-4">
        <Link href={`/squads/${id}`} className="text-sm underline-offset-2 hover:underline">
          ← {copy.squads.title}
        </Link>
      </p>
      <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold">{copy.squads.gapsTitle}</h1>
      <p className="mt-2 mb-6 max-w-[62ch] text-[color:var(--graphite)]">{copy.gaps.skills_gap}</p>
      {(gaps ?? []).length === 0 ? (
        <p>{copy.empty.noGaps}</p>
      ) : (
        <div className="sheet overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{copy.squads.role}</th>
                <th>{copy.squads.finding}</th>
                <th>{copy.squads.recommendation}</th>
                <th>{copy.squads.standardAtRisk}</th>
              </tr>
            </thead>
            <tbody>
              {(gaps ?? []).map((g) => (
                <tr key={g.id}>
                  <td className="font-semibold">{g.archetypeRole.displayTitle}</td>
                  <td>
                    {g.kind.replaceAll('_', ' ')}
                    {g.bestAvailableScore != null ? `, best available ${g.bestAvailableScore.toFixed(2)}` : ''}
                  </td>
                  <td>{g.recommendation}</td>
                  <td>
                    {Array.isArray(g.standardRefs) && g.standardRefs.length
                      ? (g.standardRefs as string[]).join(', ')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
