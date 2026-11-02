import { Button, Card, CardHeader, FitCandidateCard, PageHeader, ResourceLegend, ResourceTimeline, StatTile, TabNav } from '@/components/assemble-v2';
import { assignments, fitCandidates, people, personById, RESOURCE_MONTHS } from '@/lib/assemble-v2/demo-data';

export const metadata = { title: 'People' };

/** The Keel: resource plan, demand, exceptions and scenarios. */
export default function PeoplePage() {
  const staff = people.filter((p) => p.id !== 'p-shane');
  return (
    <>
      <PageHeader title="People" subtitle="Who is where, how much they carry and for how long." actions={<><Button variant="secondary">Plan a scenario</Button><Button>Prepare resourcing meeting</Button></>} />
      <div className="flex flex-wrap gap-4">
        <StatTile label="Planned utilisation" value="81%" note="Within 75% to 85%" tone="ok" />
        <StatTile label="On more than one engagement" value="6%" note="Under 10%" tone="ok" />
        <StatTile label="Open exceptions" value="2" note="1 has no end date" tone="warn" />
        <StatTile label="Unfilled roles" value="3" note="Next start 17 Nov" />
      </div>
      <TabNav label="People sections" items={[{ href: '/v2/people', label: 'Resource plan' }, { href: '/v2/people?tab=demand', label: 'Demand' }, { href: '/v2/people?tab=exceptions', label: 'Exceptions' }, { href: '/v2/people?tab=scenarios', label: 'Scenarios' }]} />
      <div className="flex flex-wrap items-start gap-4">
        <Card aria-labelledby="plan-h" className="min-w-0 flex-[2_1_560px] overflow-hidden">
          <CardHeader id="plan-h" title="Data and reporting people, next 6 months" action={<ResourceLegend />} />
          <ResourceTimeline months={RESOURCE_MONTHS} people={staff} assignments={assignments} />
          <p className="border-t border-asm-line bg-asm-canvas px-6 py-3 text-[13px] text-asm-ink-2">An exception without an end date is a new assignment. Set an end date or reassign.</p>
        </Card>
        <Card aria-labelledby="fit-h" className="min-w-0 flex-[1_1_340px] overflow-hidden">
          <CardHeader id="fit-h" title={`Find people for ${fitCandidates.role}`} description={`${fitCandidates.engagement} · starts ${fitCandidates.starts}`} />
          {fitCandidates.candidates.map((c, i) => (
            <FitCandidateCard key={c.personId} candidate={c} person={personById(c.personId)!} primary={i === 1} />
          ))}
        </Card>
      </div>
      <Card aria-labelledby="prio-h">
        <CardHeader id="prio-h" title="When demand exceeds supply" description="We prioritise in this order." />
        <ol className="flex list-decimal flex-col gap-1.5 py-5 pl-11 pr-6 text-[15px] text-asm-ink-2">
          <li>Live engagements at risk of missing a contractual milestone</li>
          <li>Aftercare commitments under a signed SLA</li>
          <li>Signed engagements due to start</li>
          <li>Bids with a high chance of winning and strategic value</li>
          <li>Internal improvement work</li>
        </ol>
      </Card>
    </>
  );
}
