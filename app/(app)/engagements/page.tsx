'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { StatusPill, type StatusKind } from '@/components/app/StatusPill';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';
import { en } from '@/lib/i18n/en';

function bandToKind(band: string | undefined): StatusKind {
  if (!band) return 'info';
  if (band === 'Strong') return 'strong';
  if (band === 'On track') return 'met';
  if (band === 'At risk') return 'partial';
  return 'gap';
}

export default function EngagementsPage() {
  const { data, isLoading } = trpc.engagement.list.useQuery();
  const create = trpc.engagement.create.useMutation({
    onSuccess: (e) => {
      window.location.href = `/engagements/${e.id}`;
    },
  });
  const [name, setName] = useState('');
  const [standardId, setStandardId] = useState<'gds' | 'wales'>('wales');

  return (
    <AppShell
      title={en.engagements.title}
      actions={
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) create.mutate({ name: name.trim(), standardId });
          }}
        >
          <input
            placeholder="Engagement name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-border px-3 py-2 text-sm"
          />
          <select
            value={standardId}
            onChange={(e) => setStandardId(e.target.value as 'gds' | 'wales')}
            className="rounded-md border border-border px-3 py-2 text-sm"
          >
            <option value="wales">Wales standard</option>
            <option value="gds">GDS standard</option>
          </select>
          <Button type="submit" disabled={create.isPending}>
            {en.engagements.new}
          </Button>
        </form>
      }
    >
      {isLoading && <p className="text-text-muted">Loading…</p>}
      {!isLoading && !data?.length && (
        <p className="rounded-lg border border-border bg-surface p-6 text-text-muted">{en.engagements.empty}</p>
      )}
      <ul className="grid gap-4 md:grid-cols-2">
        {data?.map((e) => (
          <li key={e.id}>
            <Link
              href={`/engagements/${e.id}`}
              className="block rounded-lg border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <h2 className="font-semibold text-text">{e.name}</h2>
              <p className="mt-1 text-sm text-text-muted">
                {e.standardId === 'wales' ? 'Wales' : 'GDS'} · {e.phase ?? 'No phase'}
              </p>
              <div className="mt-3">
                {e.lastRun ? (
                  <StatusPill kind={bandToKind(e.lastRun.readinessBand)}>
                    {e.lastRun.readinessBand} · {Math.round(e.lastRun.overallReadiness)}%
                  </StatusPill>
                ) : (
                  <StatusPill kind="info">No analysis yet</StatusPill>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
