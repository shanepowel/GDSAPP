import { Badge, Button, Card, CardBody, CardHeader, Table, TableScroll, Td, Th } from '@/components/assemble-v2';
import { getEngagement } from '@/lib/assemble-v2/get-engagement';
import type { ChangeRequest } from '@/lib/assemble-v2/types';

export const metadata = { title: 'Change' };

const COLUMNS: { key: ChangeRequest['stage']; label: string }[] = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'triaged', label: 'Triaged' },
  { key: 'assessed', label: 'Assessed' },
  { key: 'decided', label: 'Decided' },
];

export default async function ChangePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await getEngagement(id);
  return (
    <>
      <section aria-labelledby="cr-h" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="cr-h" className="text-xl font-bold text-asm-brand">Change requests</h2>
            <p className="text-asm-ink-3">Change is welcome. It is traded or agreed, never absorbed.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="ok">Changes absorbed without agreement: 0</Badge>
            <Button>New change request</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const items = e.changeRequests.filter((c) => c.stage === col.key);
            return (
              <div key={col.key} className="flex flex-col gap-3 rounded-asm-lg bg-asm-sunk p-3">
                <h3 className="flex items-center justify-between px-1 text-sm font-semibold text-asm-ink-2">{col.label}<span className="tabular-nums">{items.length}</span></h3>
                {items.map((c) => (
                  <article key={c.ref} className="flex flex-col gap-2 rounded-asm border border-asm-line bg-asm-surface p-3.5">
                    <span className="text-xs font-bold text-asm-brand">{c.ref}</span>
                    <span className="text-sm font-semibold">{c.title}</span>
                    <span className="flex flex-wrap gap-1.5">
                      {c.triage ? <Badge tone={c.triage === 'change' ? 'brand' : 'neutral'} className="capitalize">{c.triage}</Badge> : null}
                      {c.estimateDays ? <Badge>{c.estimateDays} days</Badge> : null}
                      {c.decision ? <Badge tone={c.decision === 'approved' ? 'ok' : 'neutral'} className="capitalize">{c.decision}</Badge> : null}
                    </span>
                  </article>
                ))}
                {items.length === 0 ? <p className="px-1 text-[13px] text-asm-ink-3">None</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <Card aria-labelledby="triage-h">
        <CardHeader id="triage-h" title="Is it a change, a defect or support?" description="Use these definitions in every SLA and statement of work." />
        <dl className="grid gap-5 px-6 py-5 md:grid-cols-3">
          {[
            ['Change', 'Adds, alters or removes how the product behaves, its structure or what it produces.'],
            ['Defect', 'Does not match what was agreed. Fixed under warranty or aftercare.'],
            ['Support', 'Routine operation within agreed tolerances.'],
          ].map(([t, d]) => (
            <div key={t} className="flex flex-col gap-1"><dt className="font-semibold text-asm-brand">{t}</dt><dd className="text-sm text-asm-ink-2">{d}</dd></div>
          ))}
        </dl>
      </Card>

      <Card aria-labelledby="after-h" className="overflow-hidden">
        <CardHeader id="after-h" title="Aftercare" description="Agree it before go-live, not at go-live." action={e.aftercareAgreed ? <Badge tone="ok">SLA agreed</Badge> : <Button size="sm">Set up aftercare</Button>} />
        {!e.aftercareAgreed ? (
          <CardBody className="flex flex-col gap-4">
            <p className="rounded-asm bg-asm-warn-wash px-4 py-3 text-sm text-asm-warn-ink">No aftercare agreed yet. Go-live is on {e.goLiveDate ?? 'a date to be set'}.</p>
            <h3 className="text-sm font-semibold text-asm-ink-2">Standard service levels (adjust per client)</h3>
            <TableScroll minWidth={640}>
              <Table>
                <thead><tr><Th>Priority</Th><Th>Example</Th><Th>Response</Th><Th>Target resolution</Th></tr></thead>
                <tbody>
                  {[
                    ['P1 Critical', 'Service down or data not loading for all users', '1 working hour', '1 working day'],
                    ['P2 High', 'Major feature broken, workaround available', '4 working hours', '3 working days'],
                    ['P3 Medium', 'Minor fault, limited impact', '1 working day', 'Next planned release'],
                    ['P4 Low', 'Cosmetic issue or question', '2 working days', 'As agreed'],
                  ].map((r) => (
                    <tr key={r[0]}>{r.map((c, i) => <Td key={i} className={i === 0 ? 'font-semibold' : 'text-asm-ink-2'}>{c}</Td>)}</tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
            <p className="text-[13px] text-asm-ink-3">You are committing to a 1-hour P1 response. Make sure the aftercare team can staff it under The Keel.</p>
          </CardBody>
        ) : (
          <CardBody><p className="text-sm text-asm-ink-2">Retained support, 10 change hours a month, reviewed every six months.</p></CardBody>
        )}
      </Card>
    </>
  );
}
