'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { RequirementSelector } from '@/components/app/RequirementSelector';
import { Button } from '@/components/ui/Button';
import { useRequirementId } from '@/lib/hooks/use-requirement-id';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

const LEVELS = ['awareness', 'working', 'practitioner', 'expert'] as const;

const selectClass =
  'mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm';

export default function TeamPage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const { data, refetch } = trpc.engagement.byId.useQuery({ id });
  const { requirementId, setRequirementId } = useRequirementId(id, data?.requirements);
  const { data: skills } = trpc.engagement.skills.useQuery();
  const { data: roleLevels } = trpc.engagement.roleLevels.useQuery();
  const [pseudonymise, setPseudonymise] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [skillPick, setSkillPick] = useState<{ skillId: string; level: string }[]>([]);
  const [draftName, setDraftName] = useState('');
  const [draftRoleLevelId, setDraftRoleLevelId] = useState('');
  const [draftVacancy, setDraftVacancy] = useState(false);

  const upsert = trpc.engagement.upsertPerson.useMutation({
    onSuccess: (_person, variables) => {
      void refetch();
      if (!variables.personId) {
        setDraftName('');
        setDraftRoleLevelId('');
        setDraftVacancy(false);
      }
      setEditingId(null);
      setSkillPick([]);
    },
  });
  const remove = trpc.engagement.deletePerson.useMutation({ onSuccess: () => refetch() });
  const setAssignment = trpc.engagement.setAssignment.useMutation({ onSuccess: () => refetch() });

  const req = data?.requirements.find((r) => r.id === requirementId) ?? data?.requirements[0];
  const displayName = (name: string, roleLabel?: string) =>
    pseudonymise && roleLabel ? roleLabel : name;

  const roleGroups = useMemo(() => {
    const groups = new Map<string, Array<{ id: string; name: string }>>();
    for (const rl of roleLevels ?? []) {
      const list = groups.get(rl.role.name) ?? [];
      list.push({ id: rl.id, name: rl.name });
      groups.set(rl.role.name, list);
    }
    return [...groups.entries()];
  }, [roleLevels]);

  const roleSelectDisabled = !req || !roleLevels?.length;
  const assignFailed = Boolean(upsert.error || setAssignment.error);

  return (
    <AppShell title={m.teamFit.peopleTitle}>
      <p className="mb-4 text-sm">
        <Link href={`/squads/${id}`} className="text-brand underline-offset-2 hover:underline">
          ← {m.teamFit.title}
        </Link>
      </p>
      {data && data.requirements.length > 1 && (
        <RequirementSelector
          requirements={data.requirements}
          value={requirementId}
          onChange={setRequirementId}
        />
      )}
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={pseudonymise} onChange={(e) => setPseudonymise(e.target.checked)} />
        {m.engagement.pseudonymise}
      </label>

      <form
        className="mb-6 rounded-lg border border-border bg-surface p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const name = draftName.trim();
          if (!data || !name) return;
          upsert.mutate({
            engagementId: data.id,
            displayName: name,
            isVacancy: draftVacancy,
            skills: [],
            ...(req && draftRoleLevelId
              ? { requirementId: req.id, roleLevelId: draftRoleLevelId }
              : {}),
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-text-muted">{m.engagement.personName}</span>
            <input
              required
              className={selectClass}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-text-muted">{m.engagement.personRole}</span>
            <select
              className={selectClass}
              value={draftRoleLevelId}
              disabled={roleSelectDisabled || upsert.isPending}
              aria-label={m.engagement.personRole}
              onChange={(e) => setDraftRoleLevelId(e.target.value)}
            >
              <option value="">{m.engagement.assignRole}</option>
              {roleGroups.map(([roleName, levels]) => (
                <optgroup key={roleName} label={roleName}>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {roleName} ({level.name})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draftVacancy}
            onChange={(e) => setDraftVacancy(e.target.checked)}
          />
          {m.engagement.addPersonVacancy}
        </label>
        {!req ? (
          <p className="mt-2 text-sm text-text-muted">{m.engagement.noRequirementYet}</p>
        ) : roleLevels && roleLevels.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">{m.engagement.noRolesYet}</p>
        ) : null}
        {assignFailed ? (
          <p className="mt-2 text-sm text-status-gap" role="alert">
            {m.engagement.assignError}
          </p>
        ) : null}
        <Button className="mt-4" type="submit" disabled={upsert.isPending || !draftName.trim()}>
          {m.engagement.addPerson}
        </Button>
      </form>

      <ul className="space-y-4">
        {data?.people.map((p) => {
          const assignment = req?.assignments.find((a) => a.personId === p.id);
          const rl = roleLevels?.find((r) => r.id === assignment?.roleLevelId);
          const roleLabel = rl ? `${rl.role.name}` : undefined;
          return (
            <li key={p.id} className="rounded-lg border border-border bg-surface p-4">
              <p className="font-medium">{displayName(p.displayName, roleLabel)}</p>
              {p.isVacancy && <span className="text-xs text-text-muted">{m.engagement.vacancy}</span>}
              <div className="mt-2 flex flex-wrap gap-1">
                {p.skills.map((s) => (
                  <span key={s.id} className="rounded-full bg-surface-alt px-2 py-0.5 text-xs">
                    {skills?.find((sk) => sk.id === s.skillId)?.name ?? s.skillId}: {s.level}
                  </span>
                ))}
              </div>
              <label className="mt-2 block text-sm">
                <span className="text-text-muted">{m.engagement.personRole}</span>
                <select
                  className={selectClass}
                  value={assignment?.roleLevelId ?? ''}
                  disabled={roleSelectDisabled || setAssignment.isPending}
                  aria-label={m.engagement.personRole}
                  onChange={(e) => {
                    if (!req || !e.target.value) return;
                    setAssignment.mutate({
                      requirementId: req.id,
                      personId: p.id,
                      roleLevelId: e.target.value,
                    });
                  }}
                >
                  <option value="">{m.engagement.assignRole}</option>
                  {roleGroups.map(([roleName, levels]) => (
                    <optgroup key={roleName} label={roleName}>
                      {levels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {roleName} ({level.name})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(p.id);
                    setSkillPick(p.skills.map((s) => ({ skillId: s.skillId, level: s.level })));
                  }}
                >
                  {m.engagement.editSkills}
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    if (confirm(m.engagement.removeConfirm)) {
                      remove.mutate({ engagementId: id, personId: p.id });
                    }
                  }}
                >
                  {m.engagement.removePerson}
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
              {m.engagement.addSkillLabel}
            </Button>
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="submit">{m.engagement.saveSkills}</Button>
            <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
              {m.common.cancel}
            </Button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
