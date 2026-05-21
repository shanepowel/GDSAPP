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
import { trpc } from '@/lib/trpc/client';

export default function HistoryPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: engagement } = trpc.engagement.byId.useQuery({ id });
  const req = engagement?.requirements[0];
  const { data: runs } = trpc.engagement.analysisHistory.useQuery(
    { requirementId: req?.id ?? '' },
    { enabled: !!req?.id },
  );

  const chartData =
    runs?.map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString('en-GB'),
      readiness: Math.round(r.overallReadiness),
      band: r.readinessBand,
    })) ?? [];

  return (
    <AppShell title="History">
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
          <p className="text-sm text-text-muted">No saved runs yet.</p>
        )}
      </div>
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
