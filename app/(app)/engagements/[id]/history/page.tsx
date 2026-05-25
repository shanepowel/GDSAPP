'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { RequirementSelector } from '@/components/app/RequirementSelector';
import { useRequirementId } from '@/lib/hooks/use-requirement-id';
import { useI18n } from '@/components/app/LocaleProvider';
import { diffAnalysisRuns } from '@/lib/analysis-run-diff';
import { trpc } from '@/lib/trpc/client';

export default function HistoryPage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const { data: engagement } = trpc.engagement.byId.useQuery({ id });
  const { requirementId, setRequirementId } = useRequirementId(id, engagement?.requirements);
  const { data: runs } = trpc.engagement.analysisHistory.useQuery(
    { requirementId: requirementId ?? '' },
    { enabled: !!requirementId },
  );

  const chartData =
    runs?.map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString('en-GB'),
      readiness: Math.round(r.overallReadiness),
      band: r.readinessBand,
    })) ?? [];

  const latest = runs?.[runs.length - 1];
  const previous = runs && runs.length > 1 ? runs[runs.length - 2] : undefined;
  const diff = latest ? diffAnalysisRuns(previous, latest) : [];

  return (
    <AppShell title={m.engagement.historyTitle}>
      <AppNav />
      <EngagementSubNav engagementId={id} />
      {engagement?.requirements && (
        <RequirementSelector
          requirements={engagement.requirements}
          value={requirementId}
          onChange={setRequirementId}
        />
      )}
      <div className="h-64 rounded-lg border border-border bg-surface p-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="var(--grey-200)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="readiness"
                name="Readiness %"
                stroke="var(--color-brand)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-text-muted">{m.engagement.historyNoRuns}</p>
        )}
      </div>

      {diff.length > 0 && previous && (
        <section className="mt-6 rounded-lg border border-border bg-surface p-4">
          <h2 className="font-semibold">{m.engagement.historyChangeSince}</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted">
                <th className="py-1">Metric</th>
                <th className="py-1">Before</th>
                <th className="py-1">After</th>
                <th className="py-1">Delta</th>
              </tr>
            </thead>
            <tbody>
              {diff.map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="py-2">{row.label}</td>
                  <td className="py-2 tabular-nums">{row.before}</td>
                  <td className="py-2 tabular-nums">{row.after}</td>
                  <td
                    className={`py-2 tabular-nums ${
                      row.label === 'Open readiness points'
                        ? row.delta < 0
                          ? 'text-status-strong'
                          : row.delta > 0
                            ? 'text-status-gap'
                            : ''
                        : row.delta > 0
                          ? 'text-status-strong'
                          : row.delta < 0
                            ? 'text-status-gap'
                            : ''
                    }`}
                  >
                    {row.delta > 0 ? '+' : ''}
                    {row.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="text-left text-text-muted">
            <th className="py-2">Date</th>
            <th className="py-2">Readiness</th>
            <th className="py-2">Band</th>
          </tr>
        </thead>
        <tbody>
          {runs?.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="py-2">{new Date(r.createdAt).toLocaleString('en-GB')}</td>
              <td className="py-2 tabular-nums">{Math.round(r.overallReadiness)}%</td>
              <td className="py-2">{r.readinessBand}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href={`/engagements/${id}`} className="mt-6 inline-block text-sm text-brand hover:underline">
        Back to overview
      </Link>
    </AppShell>
  );
}
