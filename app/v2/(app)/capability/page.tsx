import { Badge, Card, CardHeader, PageHeader, ProgressBar, Table, TableScroll, Td, Th } from '@/components/assemble-v2';
import { forgeModules, skillHeatmap } from '@/lib/assemble-v2/demo-data';
import { cn } from '@/lib/assemble-v2/cn';

export const metadata = { title: 'Capability' };

const LEVEL = ['', 'bg-asm-warn-wash text-asm-warn-ink', 'bg-asm-brand-wash text-asm-brand', 'bg-asm-brand-wash-2 text-asm-brand', 'bg-asm-brand-soft text-asm-brand-deep', 'bg-asm-brand text-asm-on-brand'];
const LEVEL_NAME = ['', 'Gap', 'Working', 'Practitioner', 'Senior', 'Expert'];

/** The Forge: skills, pathways and certification. */
export default function CapabilityPage() {
  return (
    <>
      <PageHeader title="Capability" subtitle="Skills, pathways and certification across your teams." />
      <div className="flex flex-wrap items-start gap-4">
        <Card aria-labelledby="mine-h" className="min-w-0 flex-[1_1_360px]">
          <CardHeader id="mine-h" title="My pathway" description="Foundation, then Delivery pathway" action={<Badge tone="ok">TFC certified, Mar 2026</Badge>} />
          <div className="flex flex-col gap-3 px-6 py-5">
            <div className="flex justify-between text-sm"><span>Foundation modules</span><span className="font-semibold tabular-nums">9 of 9</span></div>
            <ProgressBar value={100} label="9 of 9 foundation modules complete" />
            <div className="flex justify-between text-sm"><span>Delivery pathway, core</span><span className="font-semibold tabular-nums">4 of 5</span></div>
            <ProgressBar value={80} label="4 of 5 core pathway modules complete" />
            <p className="mt-2 rounded-asm bg-asm-brand-wash px-4 py-3 text-sm text-asm-brand">Next: Facilitating retrospectives that change things. Practical task due 20 Nov.</p>
          </div>
        </Card>
        <Card aria-labelledby="heat-h" className="min-w-0 flex-[2_1_560px] overflow-hidden">
          <CardHeader id="heat-h" title="Skills by squad" description="DDaT Capability Framework levels. Gaps suggest a Forge module." />
          <TableScroll minWidth={720}>
            <Table>
              <thead><tr><Th>Squad</Th>{skillHeatmap.skills.map((s) => <Th key={s}>{s}</Th>)}</tr></thead>
              <tbody>
                {skillHeatmap.squads.map((sq) => (
                  <tr key={sq.name}>
                    <Td className="font-semibold">{sq.name}</Td>
                    {sq.levels.map((l, i) => (
                      <Td key={i}><span className={cn('inline-block rounded-[6px] px-2 py-1 text-xs font-semibold', LEVEL[l])}>{LEVEL_NAME[l]}</span></Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
          <p className="border-t border-asm-line bg-asm-canvas px-6 py-3 text-[13px] text-asm-ink-2">Gap in user research on Finance data platform. Suggested: product pathway, user research basics, for Aisha Khan.</p>
        </Card>
      </div>
      <Card aria-labelledby="mods-h" className="overflow-hidden">
        <CardHeader id="mods-h" title="Foundation modules" description="Everyone completes these within three months. About two hours each." />
        <ol>
          {forgeModules.map((m) => (
            <li key={m.no} className="flex flex-wrap items-center gap-4 border-b border-asm-line-soft px-6 py-3.5 last:border-b-0">
              <span className="flex size-8 items-center justify-center rounded-full bg-asm-brand text-sm font-bold text-asm-on-brand tabular-nums">{m.no}</span>
              <span className="flex-1 basis-64 font-semibold">{m.title}</span>
              <span className="text-sm text-asm-ink-3">Task: {m.task}</span>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
