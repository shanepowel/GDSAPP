import Link from 'next/link';
import { ButtonLink, Card, Field, Input, PageHeader, Select, StatusPill, Table, TableScroll, Td, Th } from '@/components/assemble-v2';
import { engagements } from '@/lib/assemble-v2/demo-data';
import { nextActionFor } from '@/lib/assemble-v2/next-action';
import { LIFECYCLE } from '@/lib/assemble-v2/types';

export const metadata = { title: 'Engagements' };

export default async function EngagementsPage({ searchParams }: { searchParams: Promise<{ q?: string; stage?: string; status?: string }> }) {
  const { q = '', stage = '', status = '' } = await searchParams;
  const list = engagements.filter(
    (e) =>
      (!q || `${e.name} ${e.client}`.toLowerCase().includes(q.toLowerCase())) &&
      (!stage || e.stage === stage) &&
      (!status || e.status === status),
  );
  return (
    <>
      <PageHeader title="Engagements" subtitle="Every engagement you can see, with its stage and status." actions={<ButtonLink href="/v2/engagements/new">New engagement</ButtonLink>} />
      <form className="flex flex-wrap items-end gap-4" action="/v2/engagements">
        <Field id="q" label="Search" className="w-72">
          <Input id="q" name="q" defaultValue={q} placeholder="Name or client" />
        </Field>
        <Field id="stage" label="Stage" className="w-48">
          <Select id="stage" name="stage" defaultValue={stage}>
            <option value="">All stages</option>
            {LIFECYCLE.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </Select>
        </Field>
        <Field id="status" label="Status" className="w-48">
          <Select id="status" name="status" defaultValue={status}>
            <option value="">All statuses</option>
            <option value="on-track">On track</option>
            <option value="at-risk">At risk</option>
            <option value="off-track">Off track</option>
          </Select>
        </Field>
        <button type="submit" className="h-11 rounded-asm border border-asm-line-strong bg-asm-surface px-4 text-sm font-semibold text-asm-brand">Apply filters</button>
      </form>
      <Card>
        <TableScroll minWidth={900}>
          <Table>
            <thead>
              <tr>
                <Th>Engagement</Th>
                <Th>Stage</Th>
                <Th>Status</Th>
                <Th>Squad Lead</Th>
                <Th>Next milestone</Th>
                <Th>Next action</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id}>
                  <Td>
                    <Link href={`/v2/engagements/${e.id}`} className="font-semibold text-asm-brand hover:underline">{e.name}</Link>
                    <div className="text-xs text-asm-ink-3">{e.client}</div>
                  </Td>
                  <Td className="text-asm-ink-2">{LIFECYCLE.find((s) => s.key === e.stage)?.label}</Td>
                  <Td><StatusPill status={e.status} size="sm" /></Td>
                  <Td>{e.squadLead}</Td>
                  <Td className="text-asm-ink-2">{e.nextMilestone ? `${e.nextMilestone.name}, ${e.nextMilestone.date}` : 'None set'}</Td>
                  <Td className="max-w-72 text-asm-ink-2">{nextActionFor(e).text}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
        {list.length === 0 ? <p className="px-6 py-6 text-sm text-asm-ink-3">No results for “{q}”. Try a different word or clear the filters.</p> : null}
      </Card>
    </>
  );
}
