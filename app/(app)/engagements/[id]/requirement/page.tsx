'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';

const PHASES = ['discovery', 'alpha', 'beta', 'live'] as const;

export default function RequirementPage() {
  const params = useParams();
  const id = params.id as string;
  const { data } = trpc.engagement.byId.useQuery({ id });
  const { data: roleLevels } = trpc.engagement.roleLevels.useQuery();
  const update = trpc.engagement.updateRequirement.useMutation({
    onSuccess: () => {
      window.location.href = `/engagements/${id}`;
    },
  });

  const req = data?.requirements[0];
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState<(typeof PHASES)[number]>('discovery');
  const [outcome, setOutcome] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [prevReq, setPrevReq] = useState(req);
  if (req !== prevReq) {
    setPrevReq(req);
    if (req) {
      setTitle(req.title);
      setPhase(req.phase as (typeof PHASES)[number]);
      setOutcome(req.outcome);
      setSelectedRoles(req.roles.map((r) => r.roleLevelId));
    }
  }

  if (!req) return <AppShell title="Requirement">Loading…</AppShell>;

  return (
    <AppShell title="Requirement">
      <form
        className="max-w-2xl space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate({
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
          <label className="text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Phase</legend>
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
          <label className="text-sm font-medium">Outcome</label>
          <textarea
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Required roles</label>
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
          <Button type="submit" disabled={update.isPending}>
            Save
          </Button>
          <Link href={`/engagements/${id}`}>
            <Button variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </AppShell>
  );
}
