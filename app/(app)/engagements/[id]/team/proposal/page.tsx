'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { FitStrip } from '@/components/team-fit/FitStrip';
import { ArchetypeSelect } from '@/components/team-fit/ArchetypeSelect';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';
import { fitFromStored, type FitBand, type FitBreakdown } from '@/lib/scoring/fit';

export default function TeamFitProposalPage() {
  return (
    <Suspense fallback={null}>
      <TeamFitProposalPageInner />
    </Suspense>
  );
}

function TeamFitProposalPageInner() {
  const { messages: m, locale } = useI18n();
  const copy = getCopy(locale);
  const routeParams = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const id = routeParams.id as string;
  const { data: engagement } = trpc.engagement.byId.useQuery({ id });
  const { data: archetypes, isLoading: archetypesLoading } = trpc.teamFit.listArchetypes.useQuery();
  const [pickedArchetype, setPickedArchetype] = useState<string | null>(null);
  const archetypeId =
    pickedArchetype ?? search.get('archetype') ?? archetypes?.[0]?.id ?? '';
  const { data: overview, refetch: refetchOverview } = trpc.teamFit.overview.useQuery(
    { engagementId: id, archetypeId },
    { enabled: Boolean(archetypeId) },
  );
  const { data: proposal, refetch } = trpc.teamFit.getProposal.useQuery(
    { engagementId: id, archetypeId },
    { enabled: Boolean(archetypeId) },
  );
  const save = trpc.teamFit.saveDraftAssignment.useMutation({
    onSuccess: () => {
      void refetch();
      void refetchOverview();
    },
  });
  const confirm = trpc.teamFit.confirmProposal.useMutation({ onSuccess: () => refetch() });
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [picks, setPicks] = useState<Record<string, string>>({});

  const people = (engagement?.people ?? []).filter((p) => !p.isVacancy);

  const assignmentByRole = useMemo(() => {
    const map = new Map<string, NonNullable<typeof proposal>['assignments'][number]>();
    for (const a of proposal?.assignments ?? []) map.set(a.archetypeRoleId, a);
    return map;
  }, [proposal]);

  return (
    <AppShell title={m.teamFit.proposalTitle}>
      <p className="mb-4">
        <Link href={`/squads/${id}`} className="text-sm text-brand hover:underline">
          ← {m.teamFit.title}
        </Link>
      </p>
      <p className="mb-4 text-sm text-text-muted">{m.teamFit.proposalIntro}</p>

      <div className="mb-6">
        <ArchetypeSelect
          label={copy.squads.chooseArchetype}
          value={archetypeId}
          options={archetypes ?? []}
          loading={archetypesLoading}
          loadingLabel={copy.squads.loadingArchetypes}
          onChange={(next) => {
            setPickedArchetype(next);
            const query = new URLSearchParams(search.toString());
            query.set('archetype', next);
            router.replace(`/engagements/${id}/team/proposal?${query.toString()}`);
          }}
        />
      </div>

      {proposal?.status === 'confirmed' ? (
        <p className="mb-4 rounded border border-border bg-brand-tint px-3 py-2 text-sm">
          {m.teamFit.confirmedBanner}
        </p>
      ) : null}

      <ul className="space-y-4">
        {overview?.rows.map(({ role, bestScore }) => {
          const assigned = assignmentByRole.get(role.id);
          const personId = picks[role.id] ?? assigned?.personId ?? bestScore?.personId ?? '';
          const band = (bestScore?.band ?? 'gap') as FitBand;
          const needsOverride = band === 'stretch' || band === 'gap';
          const override = overrides[role.id] ?? assigned?.overrideReason ?? '';
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
          return (
            <li key={role.id} className="rounded-lg border border-border bg-surface p-4">
              <p className="font-medium">{role.displayTitle}</p>
                  {fit ? (
                    <FitStrip fit={fit} candidateName={bestScore?.personName} />
                  ) : (
                    <p className="mt-1 text-sm text-status-gap">{m.teamFit.gapRow}</p>
                  )}
              <label className="mt-3 block text-sm">
                <span className="text-text-muted">{m.teamFit.assignCandidate}</span>
                <select
                  className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
                  value={personId}
                  onChange={(e) => setPicks({ ...picks, [role.id]: e.target.value })}
                  disabled={proposal?.status === 'confirmed'}
                >
                  <option value="">—</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName}
                    </option>
                  ))}
                </select>
              </label>
              {needsOverride ? (
                <label className="mt-2 block text-sm">
                  <span className="text-text-muted">{m.teamFit.overrideReason}</span>
                  <textarea
                    className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
                    rows={2}
                    value={override}
                    onChange={(e) => setOverrides({ ...overrides, [role.id]: e.target.value })}
                    disabled={proposal?.status === 'confirmed'}
                  />
                </label>
              ) : null}
              {proposal?.status !== 'confirmed' ? (
                <Button
                  className="mt-3"
                  type="button"
                  variant="secondary"
                  disabled={
                    !personId ||
                    !archetypeId ||
                    (needsOverride && !override.trim()) ||
                    save.isPending
                  }
                  onClick={() =>
                    save.mutate({
                      engagementId: id,
                      archetypeId,
                      archetypeRoleId: role.id,
                      personId,
                      fteAllocated: role.fteRequired,
                      fitScoreId: bestScore?.id,
                      overrideReason: needsOverride ? override : undefined,
                    })
                  }
                >
                  {m.teamFit.saveAssignment}
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>

      {proposal && proposal.status === 'draft' ? (
        <Button
          className="mt-6"
          type="button"
          disabled={proposal.assignments.length === 0 || confirm.isPending}
          onClick={() => confirm.mutate({ proposalId: proposal.id })}
        >
          {m.teamFit.confirmProposal}
        </Button>
      ) : null}
    </AppShell>
  );
}
