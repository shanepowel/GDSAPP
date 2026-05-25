'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { Card } from '@/components/app/Card';
import { DeploymentBanner } from '@/components/app/DeploymentBanner';
import { Eyebrow } from '@/components/app/Eyebrow';
import { ScoreBar } from '@/components/app/ScoreBar';
import { StatusPill, type StatusKind } from '@/components/app/StatusPill';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';
import { trpc } from '@/lib/trpc/client';

function bandToKind(band: string | null | undefined): StatusKind {
  if (!band) return 'info';
  if (band === 'Strong') return 'strong';
  if (band === 'On track') return 'met';
  if (band === 'At risk') return 'partial';
  return 'gap';
}

export default function PortfolioPage() {
  const { data, isLoading } = trpc.portfolio.summary.useQuery();
  const features = getClientDeploymentFeatures();
  const title = features.clientAssuranceLabels ? 'Portfolio assurance' : 'Portfolio';

  return (
    <AppShell title={title} orgLabel="Organisation-wide">
      <DeploymentBanner />
      <AppNav />
      <p className="mb-6 text-sm text-text-muted">
        {features.clientAssuranceLabels
          ? 'Cross-service view for framework governance: readiness, rigour, evidence and call-off assurance criteria in one place.'
          : 'Roll-up across engagements for delivery directors and account leads.'}
      </p>

      {isLoading && <p className="text-text-muted">Loading…</p>}

      {data && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <Eyebrow>Services</Eyebrow>
              <p className="text-2xl font-bold tabular-nums">{data.engagementCount}</p>
              <p className="text-[13px] text-text-muted">{data.analysedCount} with analysis</p>
            </Card>
            <Card className="p-5">
              <Eyebrow>Mean readiness</Eyebrow>
              {data.averageReadiness != null ? (
                <div className="mt-2">
                  <ScoreBar value={data.averageReadiness} />
                </div>
              ) : (
                <p className="mt-2 text-sm text-text-muted">No runs yet</p>
              )}
            </Card>
            <Card className="p-5">
              <Eyebrow>Mean agile rigour</Eyebrow>
              <p className="mt-2 text-2xl font-bold tabular-nums">
                {data.averageRigour != null ? `${data.averageRigour}%` : '—'}
              </p>
            </Card>
            <Card className="p-5">
              <Eyebrow>Open gaps</Eyebrow>
              <p className="mt-2 text-2xl font-bold tabular-nums">{data.totalGapPoints}</p>
              <p className="text-[13px] text-text-muted">
                {data.totalStatutoryGaps} statutory · {data.totalPassFailRisks} pass/fail risks
              </p>
            </Card>
          </div>

          {data.topRisks.length > 0 && (
            <Card className="mb-8 p-5">
              <Eyebrow>Headline risks</Eyebrow>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {data.topRisks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Card>
          )}

          {data.supplierGroups.length > 0 && (
            <Card className="mb-8 overflow-hidden p-0">
              <div className="border-b border-border px-5 py-3">
                <Eyebrow>{m.portfolio.bySupplier}</Eyebrow>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-alt text-left text-text-muted">
                    <th className="px-5 py-3 font-medium">Supplier</th>
                    <th className="px-5 py-3 font-medium">Services</th>
                    <th className="px-5 py-3 font-medium">Mean readiness</th>
                    <th className="px-5 py-3 font-medium">Open gaps</th>
                  </tr>
                </thead>
                <tbody>
                  {data.supplierGroups.map((g) => (
                    <tr key={g.supplierTag} className="border-t border-border">
                      <td className="px-5 py-3 font-medium">{g.supplierTag}</td>
                      <td className="px-5 py-3 tabular-nums">{g.engagementCount}</td>
                      <td className="px-5 py-3 tabular-nums">
                        {g.averageReadiness != null ? `${g.averageReadiness}%` : '—'}
                      </td>
                      <td className="px-5 py-3 tabular-nums">{g.totalGapPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt text-left text-text-muted">
                  <th className="px-5 py-3 font-medium">Service / engagement</th>
                  <th className="px-5 py-3 font-medium">Standard</th>
                  <th className="px-5 py-3 font-medium">Readiness</th>
                  <th className="px-5 py-3 font-medium">Rigour</th>
                  <th className="px-5 py-3 font-medium">
                    {features.clientAssuranceLabels ? 'Criteria outlook' : 'Call-off outlook'}
                  </th>
                  <th className="px-5 py-3 font-medium">Gaps</th>
                  <th className="px-5 py-3 font-medium">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {data.engagements.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-5 py-3">
                      <Link href={`/engagements/${row.id}`} className="font-medium text-brand-hover hover:underline">
                        {row.name}
                      </Link>
                      <p className="text-xs text-text-muted">
                        {row.phase ?? '—'}
                        {row.supplierTag ? ` · ${row.supplierTag}` : ''}
                        {row.lotTag ? ` · ${row.lotTag}` : ''}
                      </p>
                    </td>
                    <td className="px-5 py-3 capitalize">{row.standardId}</td>
                    <td className="px-5 py-3">
                      {row.readinessPercent != null ? (
                        <StatusPill kind={bandToKind(row.readinessBand)}>
                          {row.readinessBand} · {Math.round(row.readinessPercent)}%
                        </StatusPill>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {row.rigourPercent != null ? `${row.rigourPercent}%` : '—'}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {row.callOffOutlook != null ? `${row.callOffOutlook}%` : '—'}
                      {row.passFailRiskCount > 0 && (
                        <span className="ml-1 text-status-gap">({row.passFailRiskCount} risk)</span>
                      )}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {row.gapPointCount}
                      {row.statutoryGapCount > 0 && (
                        <span className="block text-xs text-text-muted">
                          {row.statutoryGapCount} statutory
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 tabular-nums">{row.evidenceCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.engagements.length === 0 && (
              <p className="p-6 text-text-muted">No engagements yet. Create one under Engagements.</p>
            )}
          </Card>
        </>
      )}
    </AppShell>
  );
}
