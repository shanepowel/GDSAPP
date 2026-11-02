import { Card, CardHeader, CrosswalkPanel, PageHeader, Badge } from '@/components/assemble-v2';
import { engagementById, frameworks } from '@/lib/assemble-v2/demo-data';

export const metadata = { title: 'Standards' };

/** Standards library and crosswalk explorer. Mapping data comes from the crosswalk seed in production. */
export default function StandardsLibraryPage() {
  const sample = engagementById('finance-data-platform')!.standards.find((s) => s.ref === '10')!;
  return (
    <>
      <PageHeader title="Standards" subtitle="The frameworks we work to, and how they connect." />
      <p className="max-w-3xl text-[15px] leading-relaxed text-asm-ink-2">Assemble maps the GDS Service Standard to TCoP, NISTA gateway reviews, ISO 19650, the Construction Playbook and the Building Safety Act golden thread, so you can evidence once and reuse.</p>
      <div className="flex flex-wrap items-start gap-4">
        <Card aria-labelledby="fw-h" className="min-w-0 flex-[1_1_420px] overflow-hidden">
          <CardHeader id="fw-h" title="Frameworks" />
          <ul>
            {frameworks.map((f) => (
              <li key={f.name} className="flex flex-col gap-1 border-b border-asm-line-soft px-6 py-4 last:border-b-0">
                <span className="flex items-center justify-between gap-3"><span className="font-semibold text-asm-brand">{f.name}</span>{f.on ? <Badge tone="brand">In use</Badge> : null}</span>
                <span className="text-sm text-asm-ink-2">{f.summary}</span>
              </li>
            ))}
          </ul>
        </Card>
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
          <h2 className="text-lg font-bold text-asm-brand">Crosswalk explorer</h2>
          <p className="text-sm text-asm-ink-3">Pick a point in one framework and see where it maps in the others.</p>
          <CrosswalkPanel point={sample} />
        </div>
      </div>
    </>
  );
}
