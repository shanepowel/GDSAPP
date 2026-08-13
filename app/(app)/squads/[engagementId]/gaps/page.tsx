'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PageHeader, TextLink } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy, gapMoveLabel } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
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
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const id = params.engagementId as string;
  const archetypeId = search.get('archetype') ?? undefined;
  const { data: gaps } = trpc.teamFit.listGaps.useQuery({ engagementId: id, archetypeId });

  return (
    <>
      <p className="mb-4">
        <TextLink href={`/squads/${id}`}>← {copy.squads.title}</TextLink>
      </p>
      <PageHeader eyebrow={copy.squads.eyebrow} title={copy.squads.gapsTitle} />
      {(gaps ?? []).length === 0 ? (
        <p className="text-[color:var(--graphite)]">{copy.empty.noGaps}</p>
      ) : (
        <div className="sheet overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{copy.squads.role}</th>
                <th>{copy.squads.finding}</th>
                <th>{copy.squads.move}</th>
                <th>{copy.squads.standardAtRisk}</th>
              </tr>
            </thead>
            <tbody>
              {(gaps ?? []).map((g) => {
                const finding =
                  g.kind in copy.gaps ? copy.gaps[g.kind as keyof typeof copy.gaps] : copy.squads.unfilled;
                const scoreNote =
                  g.bestAvailableScore != null
                    ? fillCopy(copy.squads.bestAvailable, { score: g.bestAvailableScore.toFixed(2) })
                    : null;
                return (
                  <tr key={g.id}>
                    <td className="font-semibold">{g.archetypeRole.displayTitle}</td>
                    <td>
                      <div>{finding}</div>
                      {scoreNote ? (
                        <div className="font-data text-[10px] text-[color:var(--graphite)]">{scoreNote}</div>
                      ) : null}
                    </td>
                    <td>{gapMoveLabel(copy, g.recommendation)}</td>
                    <td>
                      {Array.isArray(g.standardRefs) && g.standardRefs.length
                        ? (g.standardRefs as string[]).join(', ')
                        : '—'}
                    </td>
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
