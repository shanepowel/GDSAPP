'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { DeploymentBanner } from '@/components/app/DeploymentBanner';
import { PageIntro } from '@/components/app/PageIntro';
import { StatusPill, type StatusKind } from '@/components/app/StatusPill';
import { Button } from '@/components/ui/Button';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';
import { engagementsListTitle } from '@/lib/labels';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

function bandToKind(band: string | undefined): StatusKind {
  if (!band) return 'info';
  if (band === 'Strong') return 'strong';
  if (band === 'On track') return 'met';
  if (band === 'At risk') return 'partial';
  return 'gap';
}

export default function EngagementsPage() {
  const features = getClientDeploymentFeatures();
  const { messages: m } = useI18n();
  const listTitle = engagementsListTitle(features);
  const { data, isLoading, refetch } = trpc.engagement.list.useQuery();
  const remove = trpc.engagement.delete.useMutation({ onSuccess: () => refetch() });
  const [query, setQuery] = useState('');
  const [standardFilter, setStandardFilter] = useState<'all' | 'gds' | 'wales'>('all');
  const create = trpc.engagement.create.useMutation({
    onSuccess: (e) => {
      window.location.href = `/engagements/${e.id}`;
    },
  });
  const [name, setName] = useState('');
  const [standardId, setStandardId] = useState<'gds' | 'wales'>('wales');
  const [supplierTag, setSupplierTag] = useState('');
  const [lotTag, setLotTag] = useState('');

  const filtered =
    data?.filter((e) => {
      if (standardFilter !== 'all' && e.standardId !== standardFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        (e.supplierTag?.toLowerCase().includes(q) ?? false) ||
        (e.lotTag?.toLowerCase().includes(q) ?? false)
      );
    }) ?? [];

  return (
    <AppShell
      title={listTitle}
      actions={
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim())
              create.mutate({
                name: name.trim(),
                standardId,
                supplierTag: supplierTag.trim() || undefined,
                lotTag: lotTag.trim() || undefined,
              });
          }}
        >
          <input
            placeholder={
              features.clientAssuranceLabels
                ? m.engagements.createNamePlaceholder.replace('Call-off', 'Service')
                : m.engagements.createNamePlaceholder
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-border px-3 py-2 text-sm"
            aria-label={m.engagements.createNamePlaceholder}
          />
          <input
            placeholder={m.engagements.createSupplierPlaceholder}
            value={supplierTag}
            onChange={(e) => setSupplierTag(e.target.value)}
            className="rounded-md border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder={m.engagements.createLotPlaceholder}
            value={lotTag}
            onChange={(e) => setLotTag(e.target.value)}
            className="rounded-md border border-border px-3 py-2 text-sm"
          />
          <select
            value={standardId}
            onChange={(e) => setStandardId(e.target.value as 'gds' | 'wales')}
            className="rounded-md border border-border px-3 py-2 text-sm"
            aria-label={m.engagement.filterAllStandards}
          >
            <option value="wales">{m.engagement.filterWales}</option>
            <option value="gds">{m.engagement.filterGds}</option>
          </select>
          <Button type="submit" disabled={create.isPending}>
            {m.engagements.new}
          </Button>
        </form>
      }
    >
      <DeploymentBanner />
      <AppNav />
      <PageIntro className="mb-6" title={listTitle} description={m.engagements.listIntro} />

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder={m.engagement.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[200px] flex-1 rounded-md border border-border px-3 py-2 text-sm"
        />
        <select
          value={standardFilter}
          onChange={(e) => setStandardFilter(e.target.value as typeof standardFilter)}
          className="rounded-md border border-border px-3 py-2 text-sm"
          aria-label={m.engagement.filterAllStandards}
        >
          <option value="all">{m.engagement.filterAllStandards}</option>
          <option value="wales">{m.engagement.filterWales}</option>
          <option value="gds">{m.engagement.filterGds}</option>
        </select>
      </div>

      {isLoading && <p className="text-text-muted">{m.engagement.loading}</p>}

      {!isLoading && !data?.length && (
        <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <h2 className="font-display text-lg font-semibold text-text">{m.engagements.emptyTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">{m.engagements.emptyBody}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/sign-in?callbackUrl=%2Fengagements%2Fnrw-demo">
              <Button>{m.engagements.emptyCtaDemo}</Button>
            </Link>
          </div>
        </div>
      )}

      <ul className="grid gap-4 md:grid-cols-2">
        {filtered.map((e) => (
          <li key={e.id} className="rounded-lg border border-border bg-surface shadow-sm">
            <Link
              href={`/engagements/${e.id}`}
              className="block p-5 transition-shadow hover:shadow-md"
            >
              <h2 className="font-semibold text-text">{e.name}</h2>
              <p className="mt-1 text-sm text-text-muted">
                {e.standardId === 'wales' ? 'Wales' : 'GDS'} · {e.phase ?? '—'}
                {e.supplierTag ? ` · ${e.supplierTag}` : ''}
              </p>
              <div className="mt-3">
                {e.lastRun ? (
                  <StatusPill kind={bandToKind(e.lastRun.readinessBand)}>
                    {e.lastRun.readinessBand} · {Math.round(e.lastRun.overallReadiness)}%
                  </StatusPill>
                ) : (
                  <StatusPill kind="info">{m.engagements.noAnalysisYet}</StatusPill>
                )}
              </div>
            </Link>
            <div className="border-t border-border px-5 py-2">
              <button
                type="button"
                className="text-xs text-status-gap hover:underline"
                onClick={() => {
                  if (confirm(m.engagements.deleteConfirmShort.replace('{name}', e.name))) {
                    remove.mutate({ engagementId: e.id });
                  }
                }}
              >
                {m.engagement.deleteEngagement}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
