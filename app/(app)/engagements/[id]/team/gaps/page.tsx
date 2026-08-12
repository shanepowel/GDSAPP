'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { CapabilityGapCard } from '@/components/team-fit/CapabilityGapCard';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

export default function TeamFitGapsPage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const search = useSearchParams();
  const id = params.id as string;
  const archetypeId = search.get('archetype') ?? undefined;
  const { data: gaps } = trpc.teamFit.listGaps.useQuery({
    engagementId: id,
    archetypeId,
  });

  return (
    <AppShell title={m.teamFit.gapsTitle}>
      <AppNav />
      <EngagementSubNav engagementId={id} />
      <p className="mb-2">
        <Link href={`/engagements/${id}/team`} className="text-sm text-brand hover:underline">
          ← {m.teamFit.title}
        </Link>
      </p>
      <p className="mb-4 max-w-2xl text-sm text-text-muted">{m.teamFit.gapsIntro}</p>
      <div className="space-y-3">
        {(gaps ?? []).map((g) => (
          <CapabilityGapCard
            key={g.id}
            engagementId={id}
            displayTitle={g.archetypeRole.displayTitle}
            kind={g.kind}
            severity={g.severity}
            recommendation={g.recommendation}
            narrative={g.narrative}
            standardRefs={Array.isArray(g.standardRefs) ? (g.standardRefs as string[]) : []}
            bestAvailableScore={g.bestAvailableScore}
          />
        ))}
        {gaps?.length === 0 ? <p className="text-sm text-text-muted">{m.teamFit.noGaps}</p> : null}
      </div>
    </AppShell>
  );
}
