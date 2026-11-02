import { Badge, Button, Card, CardHeader, CrosswalkPanel, StatTile } from '@/components/assemble-v2';
import { frameworks } from '@/lib/assemble-v2/demo-data';
import { getEngagement } from '@/lib/assemble-v2/get-engagement';
import { LIFECYCLE } from '@/lib/assemble-v2/types';
import { cn } from '@/lib/assemble-v2/cn';

export const metadata = { title: 'Standards' };

const STATUS = { evidenced: ['ok', 'Evidenced'], 'in-progress': ['brand', 'In progress'], 'not-started': ['neutral', 'Not started'], 'not-applicable': ['neutral', 'Not applicable'] } as const;

export default async function EngagementStandardsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ point?: string }> }) {
  const { id } = await params;
  const { point } = await searchParams;
  const e = await getEngagement(id);
  const stage = LIFECYCLE.find((s) => s.key === e.stage)!;
  const due = e.standards.filter((s) => s.stage === e.stage);
  const selected = e.standards.find((s) => s.ref === point) ?? due.find((s) => s.ref === '10') ?? due[0] ?? e.standards[0];
  const evidenced = e.standards.filter((s) => s.status === 'evidenced').length;
  const reused = e.standards.reduce((n, s) => n + (s.status === 'evidenced' ? s.alsoSupports.length : 0), 0);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-asm-brand">Standards</h2>
          <p className="text-asm-ink-3">The standards that apply to this engagement, mapped to where they matter in the lifecycle.</p>
        </div>
        <Button>Prepare for assessment</Button>
      </div>
      <div role="group" aria-label="Frameworks that apply" className="flex flex-wrap gap-2">
        {frameworks.map((f) => (
          <button key={f.name} type="button" aria-pressed={f.on} className={cn('rounded-full border px-3 py-2 text-[13px] font-semibold', f.on ? 'border-asm-brand bg-asm-brand text-asm-on-brand' : 'border-asm-line-strong bg-asm-surface text-asm-ink-2')}>
            {f.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <StatTile label="Evidenced" value={`${evidenced} of ${e.standards.length}`} />
        <StatTile label={`Due at ${stage.label}`} value={`${due.length}`} note="Beta assessment on 25 Nov" />
        <StatTile label="Links reused across frameworks" value={`${reused}`} note="Recorded once, linked everywhere" />
      </div>
      <div className="flex flex-wrap items-start gap-4">
        <Card aria-labelledby="pts-h" className="min-w-0 flex-[3_1_520px] overflow-hidden">
          <CardHeader id="pts-h" title={`${stage.label}: points due`} action={<span className="text-[13px] text-asm-ink-3">{due.length} points</span>} />
          <ul>
            {due.map((s) => {
              const [tone, label] = STATUS[s.status];
              const on = selected?.ref === s.ref;
              return (
                <li key={s.ref} className="border-b border-asm-line-soft last:border-b-0">
                  <a href={`?point=${s.ref}`} aria-current={on ? 'true' : undefined} className={cn('flex items-center gap-3.5 px-6 py-4', on ? 'bg-asm-brand-wash' : 'hover:bg-asm-canvas')}>
                    <span className={cn('flex size-[34px] flex-none items-center justify-center rounded-asm text-sm font-bold tabular-nums', on ? 'bg-asm-brand text-asm-on-brand' : 'bg-asm-sunk text-asm-brand')}>{s.ref}</span>
                    <span className={cn('flex-1 text-[15px]', on && 'font-semibold text-asm-brand')}>{s.title}</span>
                    <Badge tone={tone}>{label}</Badge>
                  </a>
                </li>
              );
            })}
          </ul>
        </Card>
        <div className="min-w-0 flex-[2_1_380px]">{selected ? <CrosswalkPanel point={selected} /> : null}</div>
      </div>
    </>
  );
}
