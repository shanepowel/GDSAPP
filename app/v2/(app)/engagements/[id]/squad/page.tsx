import { Avatar, Badge, Button, Card, CardBody, CardHeader, FitCandidateCard, KeelBadge, TableScroll, Td, Th } from '@/components/assemble-v2';
import { fitCandidates, personById } from '@/lib/assemble-v2/demo-data';
import { getEngagement } from '@/lib/assemble-v2/get-engagement';

export const metadata = { title: 'Squad' };

const SHAPE: Record<string, string> = { 'software-product': 'Software product squad', 'data-platform': 'Data platform squad', reporting: 'Reporting squad', automation: 'Automation squad', discovery: 'Discovery squad' };

const CEREMONIES = [
  ['Stand-up', 'Daily, 9:30', '15 minutes', 'What moved, what is next, what is blocked'],
  ['Sprint planning', 'Day 1 of each sprint', 'Up to 2 hours', 'Agree the sprint goal and the work that supports it'],
  ['Backlog refinement', 'Weekly, Friday', '1 hour', 'Get the next two sprints of stories ready'],
  ['Technical call', 'Weekly, Wednesday', '45 minutes', 'Turn technical decisions into tasks and stories'],
  ['Show and tell', 'Last day of each sprint', '30 to 45 minutes', 'Demo working software to the client'],
  ['Retrospective', 'Last day of each sprint', '1 hour', 'Improve how the squad works'],
  ['15 minutes of fame', 'Weekly, Tuesday', '15 minutes', 'One squad member shares something about themselves or their work'],
];

const CHARTER = [
  ['Purpose', 'Give finance and project managers one trusted view of actuals and forecasts within one day of month end.'],
  ['People', 'Five squad members plus Helen Price (client Product Owner, two days a week).'],
  ['Ways of working', 'Office days Tuesday and Thursday. Teams for chat; decisions logged in the wiki.'],
  ['Definitions', 'Standard Definition of Ready and Done, plus data tests at every layer.'],
  ['Decisions', 'Product Owner decides priorities; Technical Lead decides architecture; steering committee decides scope, time and cost.'],
  ['Deviations', 'None from Squad Blueprint.'],
];

export default async function SquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await getEngagement(id);
  return (
    <>
      <div className="flex flex-wrap items-start gap-4">
        <Card aria-labelledby="members" className="min-w-0 flex-[2_1_560px] overflow-hidden">
          <CardHeader id="members" title="Members" description={SHAPE[e.shape]} action={<Button size="sm" variant="secondary">Add a role</Button>} />
          {e.squad.length ? (
            <TableScroll minWidth={640}>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr><Th>Name</Th><Th>Role</Th><Th>Allocation</Th><Th>Keel status</Th></tr>
                </thead>
                <tbody>
                  {e.squad.map((s) => {
                    const p = personById(s.personId)!;
                    return (
                      <tr key={s.personId}>
                        <Td><span className="flex items-center gap-2.5"><Avatar initials={p.initials} size={30} /><span className="font-semibold">{p.name}</span>{p.tfcCertified ? <Badge tone="brand">TFC</Badge> : null}</span></Td>
                        <Td className="text-asm-ink-2">{s.role}</Td>
                        <Td>{s.allocation}%</Td>
                        <Td><KeelBadge status={s.keel} /></Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScroll>
          ) : (
            <CardBody><p className="text-sm text-asm-ink-3">No one assigned yet. Use Find people to staff each role.</p></CardBody>
          )}
        </Card>
        <Card aria-labelledby="fit" className="min-w-0 flex-[1_1_340px] overflow-hidden">
          <CardHeader id="fit" title={`Find people for ${fitCandidates.role}`} description={`${fitCandidates.engagement} · starts ${fitCandidates.starts} · ranked by skills fit, delivery rigour and availability`} />
          {fitCandidates.candidates.map((c, i) => (
            <FitCandidateCard key={c.personId} candidate={c} person={personById(c.personId)!} primary={i === 1} />
          ))}
        </Card>
      </div>

      <Card aria-labelledby="charter">
        <CardHeader id="charter" title="Squad charter" description="One page the whole squad agrees in Sprint Zero. Review it every third retrospective." action={<span className="flex flex-wrap gap-2"><Badge tone="ok">Agreed 18 Jul</Badge><Button size="sm" variant="secondary">Draft with Assemble</Button></span>} />
        <dl className="grid gap-x-8 gap-y-5 px-6 py-6 md:grid-cols-2">
          {CHARTER.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1">
              <dt className="text-sm font-semibold text-asm-brand">{k}</dt>
              <dd className="text-[15px] leading-relaxed text-asm-ink-2">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card aria-labelledby="ceremonies" className="overflow-hidden">
        <CardHeader id="ceremonies" title="Ceremonies" description="From Squad Blueprint. Two-week sprints." />
        <TableScroll minWidth={760}>
          <table className="w-full border-collapse text-sm">
            <thead><tr><Th>Ceremony</Th><Th>When</Th><Th>Length</Th><Th>Purpose</Th></tr></thead>
            <tbody>
              {CEREMONIES.map(([c, w, l, p]) => (
                <tr key={c}><Td className="font-semibold">{c}</Td><Td className="text-asm-ink-2">{w}</Td><Td className="text-asm-ink-2">{l}</Td><Td className="text-asm-ink-2">{p}</Td></tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </Card>
    </>
  );
}
