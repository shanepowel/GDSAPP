'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { trpc } from '@/lib/trpc/client';
import OrgChart from '@/components/org-design/OrgChart';
import type { DesignGraphEntity } from '@/lib/org-design/types';

export default function DesignSharePage() {
  const params = useParams();
  const token = params.token as string;
  const { data, isLoading, error } = trpc.orgDesign.publicByToken.useQuery({ token });
  const [selected, setSelected] = useState<DesignGraphEntity | null>(null);

  if (isLoading) {
    return (
      <AppShell title="Shared org design">
        <p className="text-sm text-text-muted">Loading…</p>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell title="Shared org design">
        <p className="text-sm text-status-gap">This share link is invalid or has been removed.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={data.name || 'Shared org design'}>
      <p className="mb-4 text-sm text-text-muted">Read-only shared view</p>
      <OrgChart
        entities={data.graph.entities}
        relationships={data.graph.relationships}
        selectedEntity={selected}
        onEntitySelect={setSelected}
        layout="tree"
        readOnly
        height={560}
      />
    </AppShell>
  );
}
