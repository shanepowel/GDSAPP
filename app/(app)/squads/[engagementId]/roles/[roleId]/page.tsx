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
  const assign = trpc.teamFit.saveDraftAssignment.useMutation();
  const [openId, setOpenId] = useState<string | null>(search.get('tour') === '4' ? 'first' : null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [assignedPersonId, setAssignedPersonId] = useState<string | null>(null);

  const firstId = data?.candidates[0]?.id;
  const expandedId = openId === 'first' ? firstId : openId;

  return (
    <>
      <p className="mb-4">
        <TextLink href={`/squads/${id}`}>← {copy.walkthrough.eyebrow}</TextLink>
      </p>
      <PageHeader
        eyebrow={copy.walkthrough.roleEyebrow}
        title={data?.role.displayTitle ?? copy.squads.role}
        lede={
          data
            ? fillCopy(copy.walkthrough.roleMeta, {
                fte: data.role.fteRequired.toFixed(1),
                level: data.role.minLevel,
                crit:
                  data.role.criticality === 'core' ||
                  data.role.criticality === 'supporting' ||
                  data.role.criticality === 'optional'
                    ? copy.squads.criticalityLabels[data.role.criticality]
                    : data.role.criticality,
              })
            : undefined
        }
      />

      <FitLegend copy={copy.legend} />

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.walkthrough.rankedHeading}
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
            const needsOverride = c.band === 'stretch' || c.band === 'gap';
            const override = overrides[c.id] ?? '';
            const canAssign = !needsOverride || override.trim().length > 0;
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
                {needsOverride ? (
                  <label className="mt-3 block text-sm">
                    <span className="mb-1 block font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
                      {c.band === 'gap' ? copy.bands.gap : copy.bands.stretch}
                    </span>
                    <textarea
                      className="w-full border border-[color:var(--rule)] bg-[var(--raised)] px-3 py-2 text-sm"
                      style={{ borderRadius: 'var(--radius)' }}
                      rows={2}
                      value={override}
                      onChange={(e) => setOverrides((current) => ({ ...current, [c.id]: e.target.value }))}
                    />
                  </label>
                ) : null}
                <button
                  type="button"
                  className="btn-teach pri mt-3"
                  disabled={assign.isPending || !canAssign || !data}
                  onClick={async () => {
                    if (!data) return;
                    await assign.mutateAsync({
                      engagementId: id,
                      archetypeId: data.role.archetypeId,
                      archetypeRoleId: roleId,
                      personId: c.personId,
                      fteAllocated: data.role.fteRequired,
                      fitScoreId: c.id,
                      overrideReason: needsOverride ? override : undefined,
                    });
                    setAssignedPersonId(c.personId);
                  }}
                >
                  {assignedPersonId === c.personId
                    ? copy.walkthrough.confirmedHeading
                    : copy.walkthrough.assignToRole}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
