'use client';

import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { Card } from '@/components/app/Card';
import { DeploymentBanner } from '@/components/app/DeploymentBanner';
import { Eyebrow } from '@/components/app/Eyebrow';
import { useI18n } from '@/components/app/LocaleProvider';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';

export default function FrameworkPage() {
  const { messages: m } = useI18n();
  const { data, refetch } = trpc.framework.driftReport.useQuery();
  const recordBaseline = trpc.framework.recordBaseline.useMutation({ onSuccess: () => refetch() });

  return (
    <AppShell title={m.framework.title} orgLabel="Standards IP">
      <DeploymentBanner />
      <AppNav />
      <p className="mb-6 text-sm text-text-muted">
        Compares the live dependency map in the database with the last recorded baseline snapshot.
        Run after updating standards or DDaT ingest.
      </p>

      <div className="mb-6">
        <Button
          onClick={() =>
            recordBaseline.mutate({
              source: 'assemble-standards-map',
              versionLabel: `Baseline ${new Date().toISOString().slice(0, 10)}`,
            })
          }
          disabled={recordBaseline.isPending}
        >
          {m.framework.recordBaseline}
        </Button>
      </div>

      {data && (
        <>
          <Card className="mb-6 p-5">
            <Eyebrow>Status</Eyebrow>
            <p className="mt-2 text-lg font-semibold">
              {data.hasDrift ? m.framework.hasDrift : m.framework.noDrift}
            </p>
            <p className="mt-2 text-sm text-text-muted">
              {data.pointCount} standard points in database
            </p>
            {data.baselineLabel && (
              <p className="text-sm text-text-muted">
                Baseline: {data.baselineLabel}
                {data.baselineAt &&
                  ` (${new Date(data.baselineAt).toLocaleDateString('en-GB')})`}
              </p>
            )}
            <p className="mt-2 font-mono text-xs text-text-muted break-all">
              Current hash: {data.currentHash.slice(0, 16)}…
            </p>
          </Card>

          {data.changes.length > 0 && (
            <Card className="overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-alt text-left text-text-muted">
                    <th className="px-5 py-3">Change</th>
                    <th className="px-5 py-3">Standard</th>
                    <th className="px-5 py-3">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {data.changes.map((c) => (
                    <tr key={`${c.kind}-${c.pointId}`} className="border-t border-border">
                      <td className="px-5 py-3 capitalize">{c.kind}</td>
                      <td className="px-5 py-3">{c.standardId}</td>
                      <td className="px-5 py-3">{c.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </AppShell>
  );
}
