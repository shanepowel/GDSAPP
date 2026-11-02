import { Badge, Button, Card, CardBody, CardHeader, MeasureTile, ProgressBar, StatusControl } from '@/components/assemble-v2';
import { getEngagement } from '@/lib/assemble-v2/get-engagement';
import { measureTiles, trendSentence } from '@/lib/assemble-v2/measures';
import { suggestedStatus } from '@/lib/assemble-v2/next-action';

export const metadata = { title: 'Delivery Compass' };

export default async function CompassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await getEngagement(id);
  const suggested = suggestedStatus(e.measures, e.milestones.some((m) => m.status === 'late'));
  return (
    <>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-asm-brand">Delivery Compass</h2>
        <p className="text-asm-ink-3">Four measures, one status, updated monthly.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {measureTiles(e.measures).map((t) => (
          <MeasureTile key={t.key} label={t.label} value={t.value} onTarget={t.onTarget} trend={t.trend} lowerIsBetter={t.lowerIsBetter} footnote={t.footnote} trendLabel={trendSentence(t.label, t.trend, t.unit)} />
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-4">
        <Card aria-labelledby="status-h" className="min-w-0 flex-[2_1_480px]">
          <CardHeader id="status-h" title="Status" description="The Squad Lead sets the status. Assemble only suggests it." />
          <CardBody><StatusControl initial={e.status} suggested={suggested} /></CardBody>
        </Card>
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
          <Card aria-labelledby="surveys-h">
            <CardHeader id="surveys-h" title="Surveys" />
            <CardBody className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2"><span className="font-semibold">Team health check</span><Badge tone="brand">Anonymous</Badge></div>
                <p className="text-sm text-asm-ink-3">4 of 5 responses this month</p>
                <ProgressBar value={80} label="4 of 5 responses" />
                <Button size="sm" variant="secondary" className="w-fit">Send reminder</Button>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-semibold">Client pulse</span>
                <p className="text-sm text-asm-ink-3">Sent 1 Nov. Response received 2 Nov.</p>
                <Button size="sm" variant="secondary" className="w-fit">View comments</Button>
              </div>
            </CardBody>
          </Card>
          <Card aria-labelledby="report-h">
            <CardHeader id="report-h" title="Monthly report" description={`Due in ${e.monthlyReportDueInDays} days`} />
            <CardBody className="flex flex-col gap-3">
              <p className="text-sm text-asm-ink-2">One page: status, measures, progress, risks, decisions needed, commercials and one highlight.</p>
              <div className="flex flex-wrap gap-2"><Button size="sm">Draft monthly report</Button><Button size="sm" variant="secondary">Preview last month</Button></div>
            </CardBody>
          </Card>
        </div>
      </div>
      <Card aria-labelledby="hc-h">
        <CardHeader id="hc-h" title="Team health check questions" description="Scored 1 to 5. A single question averaging below 3 is flagged even when the overall score is fine." />
        <ol className="flex flex-col">
          {[
            ['I understand what we are trying to achieve and why', 4.2],
            ['Our workload is sustainable', 2.6],
            ['I can raise problems without worrying about how it will land', 3.8],
            ['I have the skills and support I need', 3.4],
            ['We work well together as a squad', 3.6],
            ['I am proud of the quality of what we deliver', 3.0],
          ].map(([q, v], i) => (
            <li key={i} className="flex flex-wrap items-center gap-4 border-b border-asm-line-soft px-6 py-3.5 last:border-b-0">
              <span className="w-6 text-sm text-asm-ink-3 tabular-nums">{i + 1}</span>
              <span className="flex-1 basis-72 text-[15px]">{q as string}</span>
              <span className="w-12 text-right font-bold text-asm-brand tabular-nums">{(v as number).toFixed(1)}</span>
              {(v as number) < 3 ? <Badge tone="warn">Below 3</Badge> : <span className="w-[70px]" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
