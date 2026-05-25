'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { Card } from '@/components/app/Card';
import { DeploymentBanner } from '@/components/app/DeploymentBanner';
import { Eyebrow } from '@/components/app/Eyebrow';
import { useI18n } from '@/components/app/LocaleProvider';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';

const RESULT_OPTIONS = ['met', 'partial', 'not_met', 'exceeded', 'withdrawn'];
const EVENT_OPTIONS = [
  'assessment',
  'call_off_awarded',
  'call_off_lost',
  'phase_gate',
  'retrospective',
  'benchmark',
];

export default function BenchmarkingPage() {
  const { messages: m } = useI18n();
  const { data: summary, refetch } = trpc.benchmarking.summary.useQuery();
  const { data: engagements } = trpc.engagement.list.useQuery();
  const record = trpc.benchmarking.record.useMutation({ onSuccess: () => refetch() });

  const [requirementId, setRequirementId] = useState('');
  const [event, setEvent] = useState('assessment');
  const [result, setResult] = useState('met');
  const [notes, setNotes] = useState('');

  const firstEngagement = engagements?.[0];

  return (
    <AppShell title={m.benchmarking.title} orgLabel="Organisation-wide">
      <DeploymentBanner />
      <AppNav />
      <p className="mb-6 text-sm text-text-muted">
        Record delivery and assessment outcomes over time. Use for benchmarking across call-offs and
        phases (schema section 22).
      </p>

      {summary && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <Eyebrow>Total outcomes</Eyebrow>
              <p className="text-2xl font-bold tabular-nums">{summary.totalOutcomes}</p>
            </Card>
            <Card className="p-5">
              <Eyebrow>By result</Eyebrow>
              <ul className="mt-2 text-sm">
                {Object.entries(summary.byResult).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v}
                  </li>
                ))}
                {!Object.keys(summary.byResult).length && (
                  <li className="text-text-muted">No data yet</li>
                )}
              </ul>
            </Card>
            <Card className="p-5">
              <Eyebrow>By phase</Eyebrow>
              <ul className="mt-2 text-sm">
                {Object.entries(summary.byPhase).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="mb-8 p-5">
            <h2 className="font-semibold">{m.benchmarking.record}</h2>
            <form
              className="mt-4 grid gap-3 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!requirementId) return;
                record.mutate({ requirementId, event, result, notes: notes || undefined });
              }}
            >
              <label className="text-sm md:col-span-2">
                Requirement id
                <input
                  className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  value={requirementId}
                  onChange={(e) => setRequirementId(e.target.value)}
                  placeholder={firstEngagement ? 'Paste requirement id from engagement URL' : ''}
                />
              </label>
              <label className="text-sm">
                {m.benchmarking.event}
                <select
                  className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                >
                  {EVENT_OPTIONS.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                {m.benchmarking.result}
                <select
                  className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                >
                  {RESULT_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm md:col-span-2">
                {m.benchmarking.notes}
                <textarea
                  className="mt-1 w-full rounded-md border border-border px-3 py-2"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
              <Button type="submit" disabled={record.isPending || !requirementId}>
                {m.benchmarking.record}
              </Button>
            </form>
          </Card>

          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt text-left text-text-muted">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Event</th>
                  <th className="px-5 py-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {summary.recent.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-5 py-3">
                      {new Date(row.recordedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-5 py-3">
                      {row.engagementName}
                      <span className="block text-xs text-text-muted">{row.requirementTitle}</span>
                    </td>
                    <td className="px-5 py-3">{row.event}</td>
                    <td className="px-5 py-3">{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {summary.recent.length === 0 && (
              <p className="p-6 text-text-muted">No outcomes recorded yet.</p>
            )}
          </Card>
        </>
      )}
    </AppShell>
  );
}
