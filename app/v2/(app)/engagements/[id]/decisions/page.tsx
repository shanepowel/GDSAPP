import { Badge, Button, Card, CardHeader, Table, TableScroll, Td, Th } from '@/components/assemble-v2';
import { getEngagement } from '@/lib/assemble-v2/get-engagement';

export const metadata = { title: 'Decisions' };

const TYPE = { risk: 'Risk', assumption: 'Assumption', issue: 'Issue', dependency: 'Dependency' };
const TYPE_HELP = {
  risk: 'Something that might happen and would hurt delivery.',
  assumption: 'Something we are treating as true without proof.',
  issue: 'Something that has happened and is hurting delivery.',
  dependency: 'Something we need from someone else.',
};
const RATING = { high: 'risk', medium: 'warn', low: 'neutral' } as const;

export default async function DecisionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await getEngagement(id);
  return (
    <>
      <Card aria-labelledby="raid-h" className="overflow-hidden">
        <CardHeader id="raid-h" title="RAID log" description="Risks, assumptions, issues and dependencies. Review it weekly with the squad." action={<Button size="sm">Add item</Button>} />
        <TableScroll minWidth={900}>
          <Table>
            <thead><tr><Th>Type</Th><Th>Title</Th><Th>Owner</Th><Th>Rating</Th><Th>Action</Th><Th>Due</Th></tr></thead>
            <tbody>
              {e.raid.map((r) => (
                <tr key={r.id}>
                  <Td><abbr title={TYPE_HELP[r.type]} className="font-semibold no-underline">{TYPE[r.type]}</abbr></Td>
                  <Td className="max-w-80">{r.title}</Td>
                  <Td className="text-asm-ink-2">{r.owner}</Td>
                  <Td><Badge tone={RATING[r.rating]} className="capitalize">{r.rating}</Badge></Td>
                  <Td className="max-w-64 text-asm-ink-2">{r.action}</Td>
                  <Td>{r.due}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
        {e.raid.length === 0 ? <p className="px-6 py-5 text-sm text-asm-ink-3">Nothing logged yet. Open the RAID log in Sprint Zero.</p> : null}
      </Card>

      <div className="flex flex-wrap items-start gap-4">
        <Card aria-labelledby="sc-h" className="min-w-0 flex-[1_1_420px]">
          <CardHeader id="sc-h" title="Steering committees" description="For decisions, not updates." action={<Button size="sm">Draft pack</Button>} />
          <ul className="flex flex-col">
            <li className="flex flex-wrap items-center justify-between gap-3 border-b border-asm-line-soft px-6 py-4">
              <span className="flex flex-col"><span className="font-semibold">12 Nov</span><span className="text-[13px] text-asm-ink-3">Decisions needed: aftercare model</span></span>
              <Badge tone={e.nextSteering?.packReady ? 'ok' : 'warn'}>{e.nextSteering?.packReady ? 'Pack ready' : 'Pack not ready'}</Badge>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <span className="flex flex-col"><span className="font-semibold">8 Oct</span><span className="text-[13px] text-asm-ink-3">2 decisions recorded</span></span>
              <Badge>Held</Badge>
            </li>
          </ul>
          <p className="border-t border-asm-line bg-asm-canvas px-6 py-3 text-[13px] text-asm-ink-2">Confirm every decision in writing within one working day.</p>
        </Card>
        <Card aria-labelledby="rl-h" className="min-w-0 flex-[1_1_420px]">
          <CardHeader id="rl-h" title="Risk locks" description="Thirty minutes, one blocker, one decision." action={<Button size="sm">Call a risk lock</Button>} />
          <div className="flex flex-col gap-2 px-6 py-5">
            <span className="font-semibold">Booked: 5 Nov, 10:00</span>
            <p className="text-sm text-asm-ink-2">Blocker: firewall change for the HR source is not scheduled. Impact: Milestone 2 at risk.</p>
            <p className="text-sm text-asm-ink-3">Attendees: Tom Reid, client IT lead, supplier change manager. Keep it to six or fewer.</p>
          </div>
        </Card>
      </div>

      <Card aria-labelledby="log-h" className="overflow-hidden">
        <CardHeader id="log-h" title="Decisions log" description="Every decision from steering committees and risk locks." />
        <TableScroll minWidth={760}>
          <Table>
            <thead><tr><Th>Date</Th><Th>Forum</Th><Th>Decision</Th><Th>Owner</Th><Th>Confirmed in writing</Th></tr></thead>
            <tbody>
              {e.decisions.map((d) => (
                <tr key={d.id}>
                  <Td>{d.date}</Td>
                  <Td className="text-asm-ink-2">{d.forum === 'steering' ? 'Steering committee' : 'Risk lock'}</Td>
                  <Td className="max-w-96">{d.text}</Td>
                  <Td className="text-asm-ink-2">{d.owner}</Td>
                  <Td><Badge tone={d.confirmedInWriting ? 'ok' : 'warn'}>{d.confirmedInWriting ? 'Yes' : 'Not yet'}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Card>
    </>
  );
}
