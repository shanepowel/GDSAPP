'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

export default function ArchetypeLibraryPage() {
  const { messages: m } = useI18n();
  const { data: archetypes, refetch } = trpc.teamFit.listArchetypes.useQuery();
  const clone = trpc.teamFit.cloneArchetype.useMutation({ onSuccess: () => refetch() });
  const [cloneName, setCloneName] = useState('');

  return (
    <AppShell title={m.teamFit.archetypeLibrary}>
      <AppNav />
      <p className="mb-4 max-w-2xl text-sm text-text-muted">{m.teamFit.archetypeLibraryIntro}</p>
      <p className="mb-4">
        <Link href="/settings" className="text-sm text-brand hover:underline">
          ← {m.settings.title}
        </Link>
      </p>
      <ul className="space-y-3">
        {(archetypes ?? []).map((a) => (
          <li key={a.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {a.name}{' '}
                  <span className="text-xs text-text-muted">
                    v{a.version}
                    {a.isSystem ? ' · system' : ''}
                  </span>
                </p>
                <p className="text-sm text-text-muted">{a.description}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {a.roles.length} roles · {a.context}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/settings/archetypes/${a.slug}`}
                  className="text-sm text-brand hover:underline"
                >
                  {m.teamFit.viewArchetype}
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={clone.isPending}
                  onClick={() =>
                    clone.mutate({
                      archetypeId: a.id,
                      name: cloneName.trim() || `${a.name} copy`,
                    })
                  }
                >
                  {m.teamFit.cloneArchetype}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <label className="mt-6 block max-w-md text-sm">
        <span className="text-text-muted">{m.teamFit.cloneName}</span>
        <input
          className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
          value={cloneName}
          onChange={(e) => setCloneName(e.target.value)}
        />
      </label>
    </AppShell>
  );
}
