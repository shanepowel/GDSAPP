'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

export default function ArchetypeDetailPage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const slug = params.slug as string;
  const { data } = trpc.teamFit.getArchetype.useQuery({ slug });

  return (
    <AppShell title={data?.name ?? m.teamFit.archetypeLibrary}>
      <AppNav />
      <p className="mb-4">
        <Link href="/settings/archetypes" className="text-sm text-brand hover:underline">
          ← {m.teamFit.archetypeLibrary}
        </Link>
      </p>
      {data ? (
        <>
          {data.isSystem ? (
            <p className="mb-4 rounded border border-border bg-surface-alt px-3 py-2 text-sm">
              {m.teamFit.systemLocked}
            </p>
          ) : null}
          <p className="text-sm text-text-muted">{data.description}</p>
          <p className="mt-2 text-xs text-text-muted">
            {data.context} · v{data.version} · standards:{' '}
            {Array.isArray(data.standardRefs) ? (data.standardRefs as string[]).join(', ') || '—' : '—'}
          </p>
          <ul className="mt-6 space-y-2">
            {data.roles.map((r) => (
              <li key={r.id} className="rounded border border-border px-3 py-2 text-sm">
                <span className="font-medium">{r.displayTitle}</span>
                <span className="text-text-muted">
                  {' '}
                  · {r.ddatRoleId} · {r.minLevel} · {r.fteRequired} FTE · {r.criticality}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>{m.engagement.loading}</p>
      )}
    </AppShell>
  );
}
