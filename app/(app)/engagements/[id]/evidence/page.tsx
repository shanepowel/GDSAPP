'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';
import { EVIDENCE_STRENGTHS } from '@/lib/engine/evidence-config';

export default function EvidencePage() {
  const params = useParams();
  const id = params.id as string;
  const { data, refetch } = trpc.extension.evidence.list.useQuery({ engagementId: id });
  const upsert = trpc.extension.evidence.upsert.useMutation({ onSuccess: () => refetch() });
  const [title, setTitle] = useState('');
  const [type, setType] = useState('research report');
  const [strength, setStrength] = useState<(typeof EVIDENCE_STRENGTHS)[number]>('documented');

  return (
    <AppShell title="Evidence register">
      <p className="mb-4 text-sm text-text-muted">
        Link evidence to standard points and bid questions. Strength affects readiness and bid outlook.
      </p>
      <form
        className="mb-8 flex flex-wrap gap-3 rounded-lg border border-border bg-surface p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          upsert.mutate({ engagementId: id, title, type, strength, links: [] });
          setTitle('');
        }}
      >
        <input
          className="min-w-[200px] flex-1 rounded border border-border px-3 py-2 text-sm"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="rounded border border-border px-3 py-2 text-sm"
          placeholder="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <select
          className="rounded border border-border px-3 py-2 text-sm"
          value={strength}
          onChange={(e) => setStrength(e.target.value as (typeof EVIDENCE_STRENGTHS)[number])}
        >
          {EVIDENCE_STRENGTHS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={upsert.isPending}>
          Add evidence
        </Button>
      </form>
      <ul className="space-y-3">
        {data?.map((e) => (
          <li key={e.id} className="rounded-lg border border-border bg-surface p-4">
            <p className="font-medium">{e.title}</p>
            <p className="text-sm text-text-muted">
              {e.type} · {e.strength.replace(/_/g, ' ')} · {e.links.length} link(s)
            </p>
          </li>
        ))}
      </ul>
      <Link href={`/engagements/${id}`} className="mt-6 inline-block text-sm text-brand hover:underline">
        Back to engagement
      </Link>
    </AppShell>
  );
}
