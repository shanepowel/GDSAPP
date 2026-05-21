'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';

export default function TeamPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, refetch } = trpc.engagement.byId.useQuery({ id });
  const { data: skills } = trpc.engagement.skills.useQuery();
  const { data: roleLevels } = trpc.engagement.roleLevels.useQuery();
  const upsert = trpc.engagement.upsertPerson.useMutation({ onSuccess: () => refetch() });
  const setAssignment = trpc.engagement.setAssignment.useMutation({ onSuccess: () => refetch() });
  const [pseudonymise, setPseudonymise] = useState(false);

  const req = data?.requirements[0];
  const displayName = (name: string, roleLabel?: string) =>
    pseudonymise && roleLabel ? roleLabel : name;

  return (
    <AppShell title="Team">
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={pseudonymise} onChange={(e) => setPseudonymise(e.target.checked)} />
        Pseudonymise names (show role labels only)
      </label>
      <ul className="space-y-4">
        {data?.people.map((p) => {
          const assignment = req?.assignments.find((a) => a.personId === p.id);
          const rl = roleLevels?.find((r) => r.id === assignment?.roleLevelId);
          const roleLabel = rl ? `${rl.role.name}` : undefined;
          return (
            <li key={p.id} className="rounded-lg border border-border bg-surface p-4">
              <p className="font-medium">{displayName(p.displayName, roleLabel)}</p>
              {p.isVacancy && <span className="text-xs text-text-muted">Vacancy</span>}
              <div className="mt-2 flex flex-wrap gap-1">
                {p.skills.map((s) => (
                  <span key={s.id} className="rounded-full bg-surface-alt px-2 py-0.5 text-xs">
                    {s.skillId}: {s.level}
                  </span>
                ))}
              </div>
              {req && roleLevels && (
                <select
                  className="mt-2 rounded-md border border-border text-sm"
                  value={assignment?.roleLevelId ?? ''}
                  onChange={(e) => {
                    if (e.target.value)
                      setAssignment.mutate({
                        requirementId: req.id,
                        personId: p.id,
                        roleLevelId: e.target.value,
                      });
                  }}
                >
                  <option value="">Assign role…</option>
                  {roleLevels.map((rl) => (
                    <option key={rl.id} value={rl.id}>
                      {rl.role.name} ({rl.name})
                    </option>
                  ))}
                </select>
              )}
            </li>
          );
        })}
      </ul>
      <Button
        className="mt-4"
        variant="secondary"
        onClick={() => {
          if (!data) return;
          upsert.mutate({
            engagementId: data.id,
            displayName: 'New team member',
            isVacancy: false,
            skills: [],
          });
        }}
      >
        Add person
      </Button>
      <p className="mt-6 text-xs text-text-muted">
        Skill picker uses ingested DDaT skills ({skills?.length ?? 0} available). Edit person records via API for full skill assignment in this MVP.
      </p>
      <Link href={`/engagements/${id}`} className="mt-4 inline-block text-sm text-brand hover:underline">
        Back to overview
      </Link>
    </AppShell>
  );
}
