'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { RequirementSelector } from '@/components/app/RequirementSelector';
import { Button } from '@/components/ui/Button';
import { useRequirementId } from '@/lib/hooks/use-requirement-id';
import { trpc } from '@/lib/trpc/client';

const LEVELS = ['awareness', 'working', 'practitioner', 'expert'] as const;

export default function TeamPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, refetch } = trpc.engagement.byId.useQuery({ id });
  const { requirementId, setRequirementId } = useRequirementId(id, data?.requirements);
  const { data: skills } = trpc.engagement.skills.useQuery();
  const { data: roleLevels } = trpc.engagement.roleLevels.useQuery();
  const upsert = trpc.engagement.upsertPerson.useMutation({ onSuccess: () => refetch() });
  const remove = trpc.engagement.deletePerson.useMutation({ onSuccess: () => refetch() });
  const setAssignment = trpc.engagement.setAssignment.useMutation({ onSuccess: () => refetch() });
  const [pseudonymise, setPseudonymise] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [skillPick, setSkillPick] = useState<{ skillId: string; level: string }[]>([]);

  const req = data?.requirements.find((r) => r.id === requirementId) ?? data?.requirements[0];
  const displayName = (name: string, roleLabel?: string) =>
    pseudonymise && roleLabel ? roleLabel : name;

  return (
    <AppShell title="Team">
      <AppNav />
      <EngagementSubNav engagementId={id} />
      {data && data.requirements.length > 1 && (
        <RequirementSelector
          requirements={data.requirements}
          value={requirementId}
          onChange={setRequirementId}
        />
      )}
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
                    {skills?.find((sk) => sk.id === s.skillId)?.name ?? s.skillId}: {s.level}
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
                  {roleLevels.map((rlOption) => (
                    <option key={rlOption.id} value={rlOption.id}>
                      {rlOption.role.name} ({rlOption.name})
                    </option>
                  ))}
                </select>
              )}
              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(p.id);
                    setSkillPick(p.skills.map((s) => ({ skillId: s.skillId, level: s.level })));
                  }}
                >
                  Edit skills
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    if (confirm('Remove this person from the engagement?')) {
                      remove.mutate({ engagementId: id, personId: p.id });
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {editingId && (
        <form
          className="mt-6 rounded-lg border border-brand/40 bg-brand-tint p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const person = data?.people.find((p) => p.id === editingId);
            if (!person) return;
            upsert.mutate({
              engagementId: id,
              personId: editingId,
              displayName: person.displayName,
              isVacancy: person.isVacancy,
              skills: skillPick,
            });
            setEditingId(null);
            setSkillPick([]);
          }}
        >
          <p className="text-sm font-medium">Skills for {data?.people.find((p) => p.id === editingId)?.displayName}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {skillPick.map((s, i) => (
              <span key={`${s.skillId}-${i}`} className="flex items-center gap-1 rounded border border-border bg-surface px-2 py-1 text-xs">
                <select
                  value={s.skillId}
                  onChange={(e) => {
                    const next = [...skillPick];
                    next[i] = { ...next[i], skillId: e.target.value };
                    setSkillPick(next);
                  }}
                  className="max-w-[140px] text-xs"
                >
                  {skills?.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name}
                    </option>
                  ))}
                </select>
                <select
                  value={s.level}
                  onChange={(e) => {
                    const next = [...skillPick];
                    next[i] = { ...next[i], level: e.target.value };
                    setSkillPick(next);
                  }}
                  className="text-xs"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="text-status-gap"
                  onClick={() => setSkillPick(skillPick.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </span>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setSkillPick([...skillPick, { skillId: skills?.[0]?.id ?? '', level: 'working' }])
              }
            >
              Add skill
            </Button>
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="submit">Save skills</Button>
            <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

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
    </AppShell>
  );
}
