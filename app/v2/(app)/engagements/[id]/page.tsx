import Link from 'next/link';
import { Badge, Button, Card, CardFooter, CardHeader, Checklist, MeasureTile, NextActionCard } from '@/components/assemble-v2';
import { getEngagement } from '@/lib/assemble-v2/get-engagement';
import { measureTiles, trendSentence } from '@/lib/assemble-v2/measures';
import { nextActionFor } from '@/lib/assemble-v2/next-action';
import { LIFECYCLE } from '@/lib/assemble-v2/types';

export const metadata = { title: 'Engagement overview' };

const RATING = { high: 'risk', medium: 'warn', low: 'neutral' } as const;

export default async function OverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await getEngagement(id);
  const stage = LIFECYCLE.find((s) => s.key === e.stage)!;
  const items = e.checklist.filter((c) => c.stage === e.stage);
  const done = items.filter((c) => c.done).length;
  const standardsHere = e.standards.filter((s) => s.stage === e.stage).length;
  const risks = e.raid.filter((r) => r.status === 'open').slice(0, 3);

  return (
    <>
      <NextActionCard action={nextActionFor(e)} secondary={<Button variant="inverse-outline">Draft with Assemble</Button>} />

      <section aria-labelledby="compass-h" className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 id="compass-h" className="text-lg font-bold text-asm-brand">Delivery Compass</h2>
          <Link href={`/v2/engagements/${e.id}/compass`} className="text-sm font-semibold text-asm-brand hover:underline">Open Compass</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {measureTiles(e.measures).map((t) => (
            <MeasureTile key={t.key} label={t.label} value={t.value} onTarget={t.onTarget} trend={t.trend} lowerIsBetter={t.lowerIsBetter} footnote={t.footnote} trendLabel={trendSentence(t.label, t.trend, t.unit)} />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-start gap-4">
        <Card aria-labelledby="stage-h" className="min-w-0 flex-[2_1_480px] overflow-hidden">
          <CardHeader id="stage-h" title={`${stage.label} checklist`} description={stage.summary} action={<span className="text-[13px] font-semibold text-asm-brand">{done} of {items.length} complete</span>} />
          {items.length ? <Checklist items={items} /> : <p className="px-6 py-5 text-sm text-asm-ink-3">No checklist items for this stage yet.</p>}
          <CardFooter>
            <span className="text-asm-ink-2">Standards that apply at this stage ({standardsHere})</span>
            <Link href={`/v2/engagements/${e.id}/standards`} className="font-semibold text-asm-brand hover:underline">View standards</Link>
          </CardFooter>
        </Card>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <Card aria-labelledby="dates-h" className="flex flex-col gap-3.5 px-6 py-5">
            <h2 id="dates-h" className="text-lg font-bold text-asm-brand">Key dates</h2>
            <dl className="flex flex-col gap-3 text-sm">
              {e.nextSteering ? (
                <div className="flex justify-between gap-3"><dt className="text-asm-ink-2">Next steering committee</dt><dd className="font-semibold text-asm-brand">{e.nextSteering.date}</dd></div>
              ) : null}
              {e.nextMilestone ? (
                <div className="flex justify-between gap-3"><dt className="text-asm-ink-2">{e.nextMilestone.name}</dt><dd className="font-semibold text-asm-brand">{e.nextMilestone.date}</dd></div>
              ) : null}
              {e.goLiveDate ? (
                <div className="flex justify-between gap-3"><dt className="text-asm-ink-2">Go-live</dt><dd className="font-semibold text-asm-brand">{e.goLiveDate}</dd></div>
              ) : null}
            </dl>
          </Card>
          <Card aria-labelledby="risks-h" className="flex flex-col gap-3.5 px-6 py-5">
            <h2 id="risks-h" className="text-lg font-bold text-asm-brand">Top risks</h2>
            {risks.length ? (
              <ul className="flex flex-col gap-3">
                {risks.map((r) => (
                  <li key={r.id} className="flex items-start gap-2.5">
                    <Badge tone={RATING[r.rating]} className="rounded-[6px] px-1.5 py-0.5 capitalize">{r.rating}</Badge>
                    <span className="text-sm leading-snug">{r.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-asm-ink-3">No open risks.</p>
            )}
            <Link href={`/v2/engagements/${e.id}/decisions`} className="text-sm font-semibold text-asm-brand hover:underline">View RAID log</Link>
          </Card>
        </div>
      </div>
    </>
  );
}
