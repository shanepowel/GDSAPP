'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { DeploymentBanner } from '@/components/app/DeploymentBanner';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';
import { ScoreBar } from '@/components/app/ScoreBar';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';
import { en } from '@/lib/i18n/en';

export default function EngagementOverviewPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = trpc.engagement.byId.useQuery({ id });
  const run = trpc.engagement.runAnalysis.useMutation({
    onSuccess: () => {
      window.location.href = `/engagements/${id}/analysis`;
    },
  });

  const features = getClientDeploymentFeatures();
  const req = data?.requirements[0];
  const lastRun = req?.runs[0];

  const standardLabel =
    data?.standardId === 'wales'
      ? 'Digital Service Standard for Wales'
      : 'GDS Service Standard';

  return (
    <AppShell
      title={data?.name ?? 'Engagement'}
      standardId={data?.standardId}
      orgLabel="Engagement"
    >
      {isLoading && <p className="mt-4 text-text-muted">Loading…</p>}
      {data && (
        <>
          <DeploymentBanner />
          <AppNav />
          <p className="mb-6 text-sm text-text-muted">
            {standardLabel} · {req?.phase ?? 'discovery'} phase
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="font-semibold">Requirement</h2>
              <p className="mt-2 text-sm text-text-muted">{req?.title ?? 'None'}</p>
              <p className="text-sm">Phase: {req?.phase}</p>
              <Link href={`/engagements/${id}/requirement`} className="mt-3 inline-block text-sm text-brand hover:underline">
                Edit requirement
              </Link>
            </section>
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="font-semibold">Team</h2>
              <p className="mt-2 text-sm text-text-muted">{data.people.length} people</p>
              <Link href={`/engagements/${id}/team`} className="mt-3 inline-block text-sm text-brand hover:underline">
                Edit team
              </Link>
            </section>
          </div>
          {lastRun && (
            <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h2 className="font-semibold">Latest readiness</h2>
              <div className="mt-3">
                <ScoreBar value={lastRun.overallReadiness} />
              </div>
            </div>
          )}
          <nav className="no-print mt-8 flex flex-wrap gap-3">
            {req && (
              <Button onClick={() => run.mutate({ requirementId: req.id })} disabled={run.isPending}>
                {en.common.runAnalysis}
              </Button>
            )}
            <Link href={`/engagements/${id}/analysis`}>
              <Button variant="secondary">View analysis</Button>
            </Link>
            <Link href={`/engagements/${id}/evidence`}>
              <Button variant="secondary">Evidence</Button>
            </Link>
            <Link href={`/engagements/${id}/rigour`}>
              <Button variant="secondary">Rigour</Button>
            </Link>
            <Link href={`/engagements/${id}/tender`}>
              <Button variant="secondary">
                {features.clientAssuranceLabels ? 'Assurance criteria' : 'Call-off'}
              </Button>
            </Link>
            <Link href={`/engagements/${id}/report`}>
              <Button variant="secondary">Report</Button>
            </Link>
            <Link href={`/engagements/${id}/history`}>
              <Button variant="tertiary">History</Button>
            </Link>
          </nav>
        </>
      )}
    </AppShell>
  );
}
