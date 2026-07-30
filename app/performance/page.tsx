import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';
import { getPerfSummary } from '@/lib/ops/perf-samples';

export const metadata: Metadata = {
  title: 'Performance — Assemble',
  description: 'Assemble uptime and response times — Point 10 applied to the product itself.',
};

export const dynamic = 'force-dynamic';

export default function PerformancePage() {
  const summary = getPerfSummary();

  return (
    <div className="min-h-screen bg-stock-1 text-ink-0">
      <header className="border-b border-rule bg-stock-0 px-4 py-4 md:px-8">
        <BrandMark href="/" variant="light" />
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Performance</h1>
        <p className="mt-3 text-[15px] leading-[1.55] text-ink-1">
          Point 10 of the service standard applied to Assemble itself: published availability and
          response times from dogfood health samples.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">Uptime</dt>
            <dd className="font-data mt-1 text-[24px] tabular-nums">
              {summary.uptimePercent == null ? '—' : `${summary.uptimePercent}%`}
            </dd>
          </div>
          <div>
            <dt className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">p50</dt>
            <dd className="font-data mt-1 text-[24px] tabular-nums">
              {summary.p50Ms == null ? '—' : `${summary.p50Ms}ms`}
            </dd>
          </div>
          <div>
            <dt className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">p95</dt>
            <dd className="font-data mt-1 text-[24px] tabular-nums">
              {summary.p95Ms == null ? '—' : `${summary.p95Ms}ms`}
            </dd>
          </div>
          <div>
            <dt className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">Samples</dt>
            <dd className="font-data mt-1 text-[24px] tabular-nums">{summary.sampleCount}</dd>
          </div>
        </dl>

        <section className="mt-8">
          <h2 className="text-[17px] font-semibold">Recent samples</h2>
          {summary.recent.length === 0 ? (
            <p className="mt-2 text-[15px] text-ink-1">
              No samples yet. Hitting <code className="font-data text-[12px]">/api/health</code>{' '}
              records latency.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-rule-soft border-y border-rule text-[13px]">
              {summary.recent.map((s) => (
                <li key={`${s.at}-${s.route}`} className="flex justify-between gap-3 py-2">
                  <span className="font-data text-ink-2">{s.at.slice(0, 19)}</span>
                  <span>
                    {s.route} · {s.ok ? 'ok' : 'fail'} · {s.latencyMs}ms
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-10 text-[13px] text-ink-2">
          <Link href="/accessibility" className="text-signal-ink underline-offset-2 hover:underline">
            Accessibility
          </Link>
          {' · '}
          <Link href="/ai-use" className="text-signal-ink underline-offset-2 hover:underline">
            AI use
          </Link>
        </p>
      </main>
    </div>
  );
}
