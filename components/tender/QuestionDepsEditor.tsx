'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

const LEVELS = ['awareness', 'working', 'practitioner', 'expert'] as const;

export function QuestionDepsEditor({
  questionId,
  initialRoleDeps,
  initialSkillDeps,
  onSaved,
}: {
  questionId: string;
  initialRoleDeps: { roleId: string; weight: number; minSeniorityRank: number }[];
  initialSkillDeps: { skillId: string; minLevel: string; weight: number }[];
  onSaved: () => void;
}) {
  const { messages: m } = useI18n();
  const { data: roleLevels } = trpc.engagement.roleLevels.useQuery();
  const { data: skills } = trpc.engagement.skills.useQuery();
  const update = trpc.extension.tender.updateQuestionDeps.useMutation({ onSuccess: onSaved });

  const [roleIds, setRoleIds] = useState<string[]>(initialRoleDeps.map((r) => r.roleId));
  const [skillRows, setSkillRows] = useState(
    initialSkillDeps.length
      ? initialSkillDeps.map((s) => ({ skillId: s.skillId, minLevel: s.minLevel }))
      : [],
  );

  const roles = roleLevels
    ? [...new Map(roleLevels.map((rl) => [rl.role.id, rl.role])).values()]
    : [];

  return (
    <div className="mt-3 rounded border border-dashed border-border bg-surface-alt p-3 text-sm">
      <p className="font-medium text-text">{m.engagement.mapQuestionDeps}</p>
      <div className="mt-2">
        <p className="text-xs font-medium text-text-muted">{m.engagement.rolesRequired}</p>
        <div className="mt-1 max-h-28 overflow-y-auto">
          {roles.map((role) => (
            <label key={role.id} className="mb-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={roleIds.includes(role.id)}
                onChange={(e) => {
                  setRoleIds((prev) =>
                    e.target.checked ? [...prev, role.id] : prev.filter((id) => id !== role.id),
                  );
                }}
              />
              {role.name}
            </label>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium text-text-muted">{m.engagement.skillsRequired}</p>
        {skillRows.map((row, i) => (
          <div key={i} className="mt-1 flex flex-wrap gap-2">
            <select
              className="rounded border border-border px-2 py-1 text-xs"
              value={row.skillId}
              onChange={(e) => {
                const next = [...skillRows];
                next[i] = { ...next[i], skillId: e.target.value };
                setSkillRows(next);
              }}
            >
              {skills?.map((sk) => (
                <option key={sk.id} value={sk.id}>
                  {sk.name}
                </option>
              ))}
            </select>
            <select
              className="rounded border border-border px-2 py-1 text-xs"
              value={row.minLevel}
              onChange={(e) => {
                const next = [...skillRows];
                next[i] = { ...next[i], minLevel: e.target.value };
                setSkillRows(next);
              }}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-xs text-status-gap"
              onClick={() => setSkillRows(skillRows.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="mt-2"
          onClick={() =>
            setSkillRows([
              ...skillRows,
              { skillId: skills?.[0]?.id ?? '', minLevel: 'working' as (typeof LEVELS)[number] },
            ])
          }
        >
          + {m.engagement.addSkillLabel}
        </Button>
      </div>
      <Button
        className="mt-3"
        type="button"
        disabled={update.isPending}
        onClick={() =>
          update.mutate({
            questionId,
            roleDeps: roleIds.map((roleId) => ({
              roleId,
              weight: 1,
              minSeniorityRank: 0,
            })),
            skillDeps: skillRows
              .filter((s) => s.skillId)
              .map((s) => ({
                skillId: s.skillId,
                minLevel: s.minLevel,
                weight: 1,
              })),
          })
        }
      >
        {m.engagement.saveDeps}
      </Button>
    </div>
  );
}
