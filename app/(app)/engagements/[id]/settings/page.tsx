'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { useI18n } from '@/components/app/LocaleProvider';
import { ENGAGEMENT_MODES, ENGAGEMENT_PHASES } from '@/lib/standards/catalog';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/Button';

function GitHubSyncPanel({ engagementId }: { engagementId: string }) {
  const status = trpc.integrations.githubStatus.useQuery();
  const sync = trpc.integrations.githubSync.useMutation();
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');

  return (
    <section className="mt-10 max-w-lg space-y-3 border-t border-rule pt-8">
      <h2 className="text-[17px] font-semibold text-ink-0">Delivery signals — GitHub</h2>
      <p className="text-[15px] text-ink-1">
        Pulls open accessibility issues and repo visibility into the evidence ledger (30-day expiry).
        Connection failure surfaces here — never a silent stale value.
      </p>
      {!status.data?.configured && (
        <p className="rounded-[2px] border border-verdict-at-risk bg-verdict-at-risk-wash px-3 py-2 text-[13px]">
          {status.data?.reconnectHint ?? 'Reconnect required: set GITHUB_TOKEN.'}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <input
          className="rounded-[2px] border border-rule px-3 py-2 font-data text-sm"
          placeholder="owner"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
        <input
          className="rounded-[2px] border border-rule px-3 py-2 font-data text-sm"
          placeholder="repo"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
        />
        <Button
          type="button"
          disabled={sync.isPending || !owner || !repo}
          onClick={() => sync.mutate({ engagementId, owner, repo })}
        >
          Sync now
        </Button>
      </div>
      {sync.data && !sync.data.ok && (
        <p className="text-[13px] text-ink-0">
          {sync.data.message}{' '}
          <button
            type="button"
            className="text-signal-ink underline"
            onClick={() => sync.reset()}
          >
            Dismiss
          </button>
        </p>
      )}
      {sync.data && sync.data.ok && (
        <p className="text-[13px] text-ink-1">{sync.data.summary}</p>
      )}
    </section>
  );
}

export default function EngagementSettingsPage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const utils = trpc.useUtils();
  const { data } = trpc.engagement.byId.useQuery({ id });
  const { data: catalog } = trpc.standards.listCatalog.useQuery();
  const updateMeta = trpc.engagement.updateMeta.useMutation({
    onSuccess: () => {
      void utils.engagement.byId.invalidate({ id });
      void utils.standards.assessList.invalidate({ engagementId: id });
    },
  });
  const setStandards = trpc.standards.setStandards.useMutation({
    onSuccess: () => {
      void utils.standards.assessList.invalidate({ engagementId: id });
      void utils.engagement.byId.invalidate({ id });
    },
  });

  const currentVersions =
    catalog?.flatMap((s) =>
      s.versions.map((v) => ({
        id: v.id,
        label: `${s.name} v${v.version}`,
        code: s.code,
        count: v._count.criteria,
      })),
    ) ?? [];

  return (
    <AppShell title={m.engagement.engagementSettingsTitle}>
      <h1 className="mb-2 text-[24px] font-semibold tracking-[-0.02em] text-ink-0">
        {m.engagement.engagementSettingsTitle}
      </h1>
      <p className="mb-6 max-w-2xl text-[15px] text-ink-1">{m.engagement.engagementSettingsIntro}</p>

      <form
        className="max-w-lg space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          updateMeta.mutate({
            engagementId: id,
            phase: fd.get('phase') as (typeof ENGAGEMENT_PHASES)[number],
            mode: fd.get('mode') as (typeof ENGAGEMENT_MODES)[number],
            clientOrg: String(fd.get('clientOrg') || '') || null,
            serviceName: String(fd.get('serviceName') || '') || null,
            revision: String(fd.get('revision') || 'A'),
            maturityLevel: fd.get('maturityLevel') as
              | 'practising'
              | 'evidenced'
              | 'assured'
              | 'compounding',
          });
        }}
      >
        <label className="block text-[13px] font-medium text-ink-1">
          {m.engagement.phaseLabel}
          <select
            name="phase"
            defaultValue={data?.phase ?? 'discovery'}
            className="mt-1 block w-full rounded-[2px] border border-rule bg-stock-0 px-3 py-2 text-sm"
          >
            {ENGAGEMENT_PHASES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[13px] font-medium text-ink-1">
          Playbook maturity
          <select
            name="maturityLevel"
            defaultValue={data?.maturityLevel ?? 'practising'}
            className="mt-1 block w-full rounded-[2px] border border-rule bg-stock-0 px-3 py-2 text-sm"
          >
            <option value="practising">Practising</option>
            <option value="evidenced">Evidenced</option>
            <option value="assured">Assured</option>
            <option value="compounding">Compounding</option>
          </select>
          <span className="mt-1 block text-[12px] font-normal text-ink-1">
            Engagement attribute only — contextualises readiness; never enters Team Fit scores.
          </span>
        </label>
        <label className="block text-[13px] font-medium text-ink-1">
          Mode
          <select
            name="mode"
            defaultValue={data?.mode ?? 'bid'}
            className="mt-1 block w-full rounded-[2px] border border-rule bg-stock-0 px-3 py-2 text-sm"
          >
            {ENGAGEMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[13px] font-medium text-ink-1">
          Client organisation
          <input
            name="clientOrg"
            defaultValue={data?.clientOrg ?? ''}
            className="mt-1 block w-full rounded-[2px] border border-rule bg-stock-0 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-[13px] font-medium text-ink-1">
          Service name
          <input
            name="serviceName"
            defaultValue={data?.serviceName ?? ''}
            className="mt-1 block w-full rounded-[2px] border border-rule bg-stock-0 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-[13px] font-medium text-ink-1">
          Revision
          <input
            name="revision"
            defaultValue={data?.revision ?? 'A'}
            className="mt-1 block w-full rounded-[2px] border border-rule bg-stock-0 px-3 py-2 font-data text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={updateMeta.isPending}
          className="rounded-[2px] bg-brand px-4 py-2 text-sm font-medium text-text-inverse"
        >
          {m.common.save}
        </button>
      </form>

      <GitHubSyncPanel engagementId={id} />

      <section className="mt-10 max-w-lg">
        <h2 className="text-[17px] font-semibold text-ink-0">{m.engagement.standardsSettingsTitle}</h2>
        <p className="mt-1 text-[15px] text-ink-1">{m.engagement.standardsSettingsIntro}</p>
        <ul className="mt-4 space-y-2">
          {currentVersions.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                className="w-full rounded-[2px] border border-rule bg-stock-0 px-3 py-2 text-left text-sm hover:bg-stock-1"
                onClick={() =>
                  setStandards.mutate({
                    engagementId: id,
                    standardVersionIds: [v.id],
                    primaryVersionId: v.id,
                  })
                }
              >
                <span className="font-medium text-ink-0">{v.label}</span>
                <span className="ml-2 font-data text-[11px] text-ink-2">
                  {v.count} criteria · {v.code}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
