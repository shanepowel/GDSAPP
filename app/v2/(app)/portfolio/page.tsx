import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button, Card, CardHeader, PageHeader, ProgressBar, StatusPill, Table, TableScroll, Td, Th } from '@/components/assemble-v2';
import { engagements } from '@/lib/assemble-v2/demo-data';
import { TARGETS } from '@/lib/assemble-v2/measures';
import { LIFECYCLE } from '@/lib/assemble-v2/types';
import { cn } from '@/lib/assemble-v2/cn';

export const metadata = { title: 'Portfolio' };

const ORDER = { 'off-track': 0, 'at-risk': 1, 'on-track': 2 };

/** Delivery Compass across every engagement. */
export default function PortfolioPage() {
  const list = [...engagements].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const count = (s: string) => engagements.filter((e) => e.status === s).length;
  const miss = (ok: boolean) => cn('tabular-nums', !ok && 'font-semibold text-asm-warn-ink');
  return (
    <>
      <PageHeader title="Portfolio" subtitle="Every engagement's health at a glance. October 2026." actions={<><Button variant="secondary">Draft quarterly report</Button><Button>Prepare monthly review</Button></>} />
      <div className="flex flex-wrap gap-4">
        {[
          ['on-track', 'All four measures on target'],
          ['at-risk', 'Recovery plans due this week'],
          ['off-track', 'Risk lock booked'],
        ].map(([s, note]) => (
          <div key={s} className="flex min-w-0 flex-1 basis-[220px] items-center gap-4 rounded-asm-lg border border-asm-line bg-asm-surface p-5">
            <span className="text-3xl font-bold text-asm-brand tabular-nums">{count(s)}</span>
            <span className="flex flex-col gap-1"><StatusPill status={s as 'on-track'} size="sm" /><span className="text-[13px] text-asm-ink-3">{note}</span></span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-4">
        <Card aria-labelledby="eng-h" className="min-w-0 flex-[3_1_640px] overflow-hidden">
          <CardHeader id="eng-h" title="Engagements" />
          <TableScroll minWidth={760}>
            <Table>
              <thead><tr><Th>Engagement</Th><Th>Stage</Th><Th>Status</Th><Th>Predictability</Th><Th>Quality</Th><Th>Health</Th><Th>Client</Th></tr></thead>
              <tbody>
                {list.map((e) => {
                  const m = e.measures;
                  return (
                    <tr key={e.id}>
                      <Td><Link href={`/v2/engagements/${e.id}`} className="font-semibold text-asm-brand hover:underline">{e.name}</Link><div className="text-xs text-asm-ink-3">{e.client}</div></Td>
                      <Td className="text-asm-ink-2">{LIFECYCLE.find((s) => s.key === e.stage)?.label}</Td>
                      <Td><StatusPill status={e.status} size="sm" /></Td>
                      <Td className={miss(m.predictability >= TARGETS.predictability)}>{m.predictability}%</Td>
                      <Td className={miss(m.quality === null || m.quality < TARGETS.quality)}>{m.quality === null ? 'n/a' : `${m.quality}%`}</Td>
                      <Td className={miss(m.teamHealth >= TARGETS.teamHealth)}>{m.teamHealth.toFixed(1)}</Td>
                      <Td className={miss(m.clientSatisfaction >= TARGETS.clientSatisfaction)}>{m.clientSatisfaction.toFixed(1)}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableScroll>
          <p className="border-t border-asm-line bg-asm-canvas px-6 py-3 text-[13px] text-asm-ink-2">Figures below target are shown in bold amber text.</p>
        </Card>
        <section aria-labelledby="pat-h" className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-asm-lg bg-asm-brand-deep p-5">
            <h2 id="pat-h" className="flex items-center gap-2.5 text-[17px] font-bold text-asm-on-brand"><Sparkles size={20} className="text-asm-brand-tint" aria-hidden="true" />Patterns across squads</h2>
            {[
              ['Two squads have team health below 4 this month. Both have a Keel exception without an end date.', "Suggested: set end dates at Thursday's resourcing meeting"],
              ['Bug escape rate on Highways scheme reporting has doubled since data tests were skipped in sprint 9.', 'Suggested: data tests back in the Definition of Done'],
              ['Changes absorbed without agreement: 0 across all engagements for three months.', 'Worth sharing at the monthly review'],
            ].map(([t, s]) => (
              <div key={t} className="flex flex-col gap-2 rounded-asm bg-asm-brand p-3.5">
                <p className="text-sm leading-relaxed text-asm-on-brand">{t}</p>
                <span className="text-[13px] font-semibold text-asm-brand-tint">{s}</span>
              </div>
            ))}
          </div>
          <Card className="flex flex-col gap-3 px-5 py-5">
            <h2 className="text-[17px] font-bold text-asm-brand">Reports this month</h2>
            <div className="flex justify-between text-sm"><span className="text-asm-ink-2">Submitted</span><span className="font-semibold tabular-nums">5 of 6</span></div>
            <ProgressBar value={83} label="5 of 6 reports submitted" />
            <span className="text-[13px] text-asm-ink-3">Planning portal automation is due Wednesday</span>
          </Card>
        </section>
      </div>
    </>
  );
}
