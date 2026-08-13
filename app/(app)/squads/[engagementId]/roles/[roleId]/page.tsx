'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { FitBandCell, FitBreakdownPanel, FitStrip } from '@/components/team-fit/FitStrip';
import { EmptyState, FitLegend, PageHeader, TextLink } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { fitFromStored, type FitBreakdown } from '@/lib/scoring/fit';
import { trpc } from '@/lib/trpc/client';

export default function SquadRolePage() {
  return (
    <Suspense fallback={null}>
      <SquadRolePageInner />
    </Suspense>
  );
}

function SquadRolePageInner() {
  const params = useParams();
  const search = useSearchParams();
  const { locale } = useI18n();
  const copy = getCopy(locale);
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
        <TextLink href={`/squads/${id}`}>← {copy.squads.title}</TextLink>
      </p>
      <PageHeader
        eyebrow={copy.squads.roleEyebrow}
        title={data?.role.displayTitle ?? copy.squads.role}
        lede={
          data
            ? `${data.role.minLevel} · ${data.role.fteRequired.toFixed(1)} FTE · ${data.role.criticality}`
            : undefined
        }
      />

      <FitLegend copy={copy.legend} />

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.squads.rankedCandidates}
      </h2>
      {(data?.candidates ?? []).length === 0 ? (
        <EmptyState title={copy.empty.noSquad} why={copy.empty.noSquadWhy} />
      ) : (
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
              <li
                key={c.id}
                className="border border-[color:var(--rule)] bg-[var(--raised)] p-4"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <button
                  type="button"
                  className="flex w-full min-h-11 flex-wrap items-start justify-between gap-3 text-left"
                  aria-expanded={open}
                  aria-label={open ? copy.ui.hideWorking : copy.ui.showWorking}
                  onClick={() => setOpenId(open ? null : c.id)}
                >
                  <div>
                    <div className="font-semibold">{c.personName}</div>
                    <div className="font-data text-[10.5px] text-[color:var(--graphite)]">
                      {fillCopy(copy.squads.candidateMeta, {
                        skill: fit.skillScore.toFixed(2),
                        rigour: fit.rigourMultiplier.toFixed(2),
                      })}
                    </div>
                  </div>
                  <FitBandCell fit={fit} />
                </button>
                {fit.breakdown.notes.includes('no_rigour_signals') ? (
                  <span className="flag">{copy.people.unevidenced}</span>
                ) : null}
                <FitStrip fit={fit} candidateName={c.personName} />
                {open ? <FitBreakdownPanel fit={fit} /> : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
