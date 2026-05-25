'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { RequirementSelector } from '@/components/app/RequirementSelector';
import { Button } from '@/components/ui/Button';
import { useRequirementId } from '@/lib/hooks/use-requirement-id';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

const PHASES = ['discovery', 'alpha', 'beta', 'live'] as const;

type RequirementData = {
  id: string;
  title: string;
  phase: string;
  outcome: string;
  channels: string[];
  sensitivity: string;
  roles: { roleLevelId: string }[];
};

type RoleLevelRow = {
  id: string;
  name: string;
  role: { name: string };
};

function RequirementForm({
  req,
  engagementId,
  roleLevels,
  onSave,
  isPending,
  labels,
}: {
  req: RequirementData;
  engagementId: string;
  roleLevels: RoleLevelRow[] | undefined;
  onSave: (input: {
    requirementId: string;
    title: string;
    phase: (typeof PHASES)[number];
    outcome: string;
    channels: string[];
    sensitivity: string;
    roleLevelIds: string[];
  }) => void;
  isPending: boolean;
  labels: {
    title: string;
    phase: string;
    outcome: string;
    roles: string;
    save: string;
    cancel: string;
  };
}) {
  const [title, setTitle] = useState(req.title);
  const [phase, setPhase] = useState<(typeof PHASES)[number]>(
    req.phase as (typeof PHASES)[number],
  );
  const [outcome, setOutcome] = useState(req.outcome);
  const [selectedRoles, setSelectedRoles] = useState(req.roles.map((r) => r.roleLevelId));

  return (
    <form
        className="max-w-2xl space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            requirementId: req.id,
            title,
            phase,
            outcome,
            channels: req.channels,
            sensitivity: req.sensitivity,
            roleLevelIds: selectedRoles,
          });
        }}
      >
        <div>
          <label className="text-sm font-medium">{labels.title}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <fieldset>
          <legend className="text-sm font-medium">{labels.phase}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PHASES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPhase(p)}
                className={`rounded-md px-4 py-2 text-sm capitalize ${
                  phase === p ? 'bg-brand text-text-inverse' : 'border border-border bg-surface'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="text-sm font-medium">{labels.outcome}</label>
          <textarea
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">{labels.roles}</label>
          <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-border p-3 text-sm">
            {roleLevels?.map((rl) => (
              <label key={rl.id} className="mb-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(rl.id)}
                  onChange={(e) => {
                    setSelectedRoles((prev) =>
                      e.target.checked ? [...prev, rl.id] : prev.filter((x) => x !== rl.id),
                    );
                  }}
                />
                {rl.role.name} ({rl.name})
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {labels.save}
          </Button>
          <Link href={`/engagements/${engagementId}`}>
            <Button variant="secondary">{labels.cancel}</Button>
          </Link>
        </div>
      </form>
  );
}

export default function RequirementPage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const { data } = trpc.engagement.byId.useQuery({ id });
  const { data: roleLevels } = trpc.engagement.roleLevels.useQuery();
  const update = trpc.engagement.updateRequirement.useMutation({
    onSuccess: () => {
      window.location.href = `/engagements/${id}`;
    },
  });

  const { requirementId, setRequirementId } = useRequirementId(id, data?.requirements);
  const req = data?.requirements.find((r) => r.id === requirementId) ?? data?.requirements[0];

  if (!req) {
    return (
      <AppShell title={m.engagement.requirementTitle}>
        {m.common.loading}
      </AppShell>
    );
  }

  return (
    <AppShell title={m.engagement.requirementTitle}>
      <AppNav />
      <EngagementSubNav engagementId={id} />
      {data && data.requirements.length > 1 && (
        <RequirementSelector
          requirements={data.requirements}
          value={requirementId}
          onChange={setRequirementId}
        />
      )}
      <RequirementForm
        key={req.id}
        req={req}
        engagementId={id}
        roleLevels={roleLevels}
        isPending={update.isPending}
        labels={{
          title: m.engagement.reqTitle,
          phase: m.engagement.reqPhase,
          outcome: m.engagement.reqOutcome,
          roles: m.engagement.rolesRequired,
          save: m.common.save,
          cancel: m.common.cancel,
        }}
        onSave={(input) => update.mutate(input)}
      />
    </AppShell>
  );
}
