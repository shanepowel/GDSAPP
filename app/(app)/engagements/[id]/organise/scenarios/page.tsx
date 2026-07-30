'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

export default function OrganiseScenariosPage() {
  const params = useParams();
  const id = params.id as string;
  const { messages: m } = useI18n();
  const utils = trpc.useUtils();
  const [name, setName] = useState('');
  const scenarios = trpc.orgDesign.listScenarios.useQuery();
  const structure = trpc.orgDesign.engagementStructure.useQuery({ engagementId: id });
  const fork = trpc.orgDesign.forkScenarioForEngagement.useMutation({
    onSuccess: () => {
      void utils.orgDesign.engagementStructure.invalidate({ engagementId: id });
      void utils.orgDesign.listScenarios.invalidate();
    },
  });
  const promote = trpc.orgDesign.promoteScenario.useMutation({
    onSuccess: () => {
      void utils.orgDesign.listScenarios.invalidate();
      void utils.orgDesign.engagementStructure.invalidate({ engagementId: id });
    },
  });

  const engagementScenarios =
    scenarios.data?.filter((s) => !s.engagementId || s.engagementId === id) ?? [];

  return (
    <AppShell title={m.engagement.organiseScenariosTitle} hideTitle>
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href={`/engagements/${id}/organise`} className="text-ink-1 hover:text-ink-0">
          Graph
        </Link>
        <Link href={`/engagements/${id}/organise/people`} className="text-ink-1 hover:text-ink-0">
          People
        </Link>
        <Link href={`/engagements/${id}/organise/scenarios`} className="font-medium text-signal-ink">
          Scenarios
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink-0">
          {m.engagement.organiseScenariosTitle}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-ink-1">
          {m.engagement.organiseScenariosIntro}
        </p>
        <p className="mt-2 font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
          Binding: {structure.data?.binding ?? '—'}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => fork.mutate({ engagementId: id })}
          disabled={fork.isPending}
        >
          Branch live team
        </Button>
      </div>

      {engagementScenarios.length === 0 ? (
        <p className="rounded-[2px] border border-rule bg-stock-0 px-4 py-6 text-[15px] text-ink-1">
          No scenarios. Branch the live team to model a fix without touching it.
        </p>
      ) : (
        <ul className="divide-y divide-rule-soft border-y border-rule">
          {engagementScenarios.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium text-ink-0">{s.name}</p>
                <p className="font-data text-[11px] text-ink-2">
                  {new Date(s.updatedAt).toLocaleString('en-GB')}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={promote.isPending}
                onClick={() => promote.mutate({ id: s.id })}
              >
                Promote to live
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-8 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          fork.mutate({ engagementId: id });
          setName('');
        }}
      >
        <label className="sr-only" htmlFor="scenario-name">
          Scenario name
        </label>
        <input
          id="scenario-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Optional label after fork"
          className="rounded-[2px] border border-rule bg-stock-0 px-3 py-2 text-sm"
        />
      </form>
    </AppShell>
  );
}
