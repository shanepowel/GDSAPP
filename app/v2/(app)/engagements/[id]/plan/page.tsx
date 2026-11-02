import { PoundSterling } from 'lucide-react';
import { Badge, Button, Card, CardHeader, EmptyState } from '@/components/assemble-v2';
import { getEngagement } from '@/lib/assemble-v2/get-engagement';

export const metadata = { title: 'Plan' };

const MS = { 'on-time': ['ok', 'On time'], 'at-risk': ['warn', 'At risk'], late: ['risk', 'Late'], 're-planned': ['brand', 'Re-planned'] } as const;

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await getEngagement(id);
  return (
    <>
      <Card aria-labelledby="plan-h">
        <CardHeader id="plan-h" title="Delivery Plan" description={`${e.startDate} to ${e.endDate} · re-forecast every sprint from velocity`} action={<Button size="sm" variant="secondary">Export plan</Button>} />
        {e.milestones.length ? (
          <ol className="flex flex-col">
            {e.milestones.map((m) => {
              const [tone, label] = MS[m.status];
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-4 border-b border-asm-line-soft px-6 py-4 last:border-b-0">
                  <span className="w-20 text-sm font-semibold text-asm-brand tabular-nums">{m.due}</span>
                  <span className="flex flex-1 basis-60 items-center gap-2 text-[15px] font-semibold">
                    {m.name}
                    {m.paymentLinked ? <span className="inline-flex items-center gap-1 text-xs font-normal text-asm-ink-3"><PoundSterling size={13} aria-hidden="true" />Payment linked</span> : null}
                  </span>
                  <Badge tone={tone}>{label}</Badge>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="p-6"><EmptyState title="No milestones yet" body="Add the milestones from your contract or statement of work, so the plan and payment dates line up." action={<Button size="sm">Add milestone</Button>} /></div>
        )}
      </Card>
      <Card aria-labelledby="thirty">
        <CardHeader id="thirty" title="30-day plan" description="Shared with the client every sprint." action={<Button size="sm">Share 30-day plan</Button>} />
        <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
          {[
            ['Next two sprint goals', ['Sprint 13: finance managers can drill from region to cost centre.', 'Sprint 14: HR source loads nightly and passes data tests.']],
            ['Milestones in the next 30 days', ['Milestone 2: public beta, 28 Nov. Confidence: medium.']],
            ['Dependencies', ['Firewall change from the client IT supplier, needed by 10 Nov.', 'Anonymised HR test data from the council, needed by 9 Nov.']],
            ['Decisions needed', ['Aftercare model, at the 12 Nov steering committee.']],
          ].map(([h, list]) => (
            <div key={h as string} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-asm-brand">{h as string}</h3>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] text-asm-ink-2">
                {(list as string[]).map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Card>
      <Card aria-labelledby="spikes">
        <CardHeader id="spikes" title="Spikes" description="Short, time-boxed questions answered before we commit to building." action={<Button size="sm" variant="secondary">New spike</Button>} />
        <ul className="flex flex-col">
          {[
            ['Can we read the finance system API at nightly volumes?', 'Closed · 2 days · Redesigned to incremental load'],
            ['Is the project tracker data good enough for forecasting?', 'Closed · 1 day · Two cleansing rules added'],
            ['Can row-level security follow the council cost-centre hierarchy?', 'Open · 2 days · Owner: Daniel Okafor'],
          ].map(([q, s]) => (
            <li key={q} className="flex flex-col gap-0.5 border-b border-asm-line-soft px-6 py-3.5 last:border-b-0">
              <span className="text-[15px] font-semibold">{q}</span>
              <span className="text-[13px] text-asm-ink-3">{s}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
