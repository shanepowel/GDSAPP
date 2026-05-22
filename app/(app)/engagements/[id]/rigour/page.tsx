'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';
import { RIGOUR_DIMENSIONS, type RigourDimensionKey } from '@/lib/engine/rigour-config';

export default function RigourPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: engagement } = trpc.engagement.byId.useQuery({ id });
  const req = engagement?.requirements[0];
  const { data: latest, refetch } = trpc.extension.rigour.latest.useQuery(
    { requirementId: req?.id ?? '' },
    { enabled: !!req?.id },
  );
  const save = trpc.extension.rigour.save.useMutation({ onSuccess: () => refetch() });

  const initial = useMemo(() => {
    const map = new Map(latest?.dimensions.map((d) => [d.dimension, d.score]) ?? []);
    return RIGOUR_DIMENSIONS.map((d) => ({
      dimension: d.key,
      score: map.get(d.key) ?? 2,
      evidenceNote: latest?.dimensions.find((x) => x.dimension === d.key)?.evidenceNote ?? '',
    }));
  }, [latest]);

  const [scores, setScores] = useState(initial);
  const [active, setActive] = useState<RigourDimensionKey>(RIGOUR_DIMENSIONS[0].key);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setScores(initial);
  }

  const dimConfig = RIGOUR_DIMENSIONS.find((d) => d.key === active)!;
  const activeScore = scores.find((s) => s.dimension === active)?.score ?? 0;

  const chartData = scores.map((s) => {
    const label = RIGOUR_DIMENSIONS.find((d) => d.key === s.dimension)?.label ?? s.dimension;
    return { name: label.slice(0, 12), score: s.score, key: s.dimension };
  });

  return (
    <AppShell title="Agile rigour assessment">
      <p className="mb-4 text-sm text-text-muted">
        Score each dimension 0 to 4. Feeds Service Standard point 7 and bid approach questions.
      </p>
      <div className="h-64 rounded-lg border border-border bg-surface p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" domain={[0, 4]} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar
              dataKey="score"
              onClick={(d) => setActive((d as { key: RigourDimensionKey }).key)}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={entry.key === active ? 'var(--color-brand)' : 'var(--color-border)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-semibold">{dimConfig.label}</h2>
          <input
            type="range"
            min={0}
            max={4}
            value={activeScore}
            className="mt-4 w-full"
            onChange={(e) => {
              const v = Number(e.target.value);
              setScores((prev) =>
                prev.map((s) => (s.dimension === active ? { ...s, score: v } : s)),
              );
            }}
          />
          <p className="mt-3 text-sm text-text-muted">{dimConfig.descriptors[activeScore]}</p>
          <p className="mt-2 text-xs text-text-muted">
            What good looks like: {dimConfig.descriptors[4]}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {RIGOUR_DIMENSIONS.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setActive(d.key)}
                className={`rounded px-2 py-1 text-xs ${active === d.key ? 'bg-brand text-on-brand' : 'bg-bg text-text-muted'}`}
              >
                {d.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-semibold">Evidence note</h2>
          <textarea
            className="mt-2 w-full rounded border border-border p-2 text-sm"
            rows={5}
            value={scores.find((s) => s.dimension === active)?.evidenceNote ?? ''}
            onChange={(e) =>
              setScores((prev) =>
                prev.map((s) =>
                  s.dimension === active ? { ...s, evidenceNote: e.target.value } : s,
                ),
              )
            }
          />
        </section>
      </div>
      {req && (
        <Button
          className="mt-6"
          onClick={() =>
            save.mutate({
              requirementId: req.id,
              dimensions: scores.map(({ dimension, score, evidenceNote }) => ({
                dimension,
                score,
                evidenceNote: evidenceNote || undefined,
              })),
            })
          }
          disabled={save.isPending}
        >
          Save assessment
        </Button>
      )}
      <Link href={`/engagements/${id}`} className="mt-4 inline-block text-sm text-brand hover:underline">
        Back to engagement
      </Link>
    </AppShell>
  );
}
