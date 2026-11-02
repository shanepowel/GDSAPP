import {
  AttentionRow,
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checklist,
  CrosswalkPanel,
  EmptyState,
  EngagementCard,
  Field,
  FitCandidateCard,
  Input,
  KeelBadge,
  LifecycleBar,
  MeasureTile,
  NextActionCard,
  PageHeader,
  ProgressBar,
  Select,
  StatTile,
  StatusPill,
  Stepper,
  Table,
  TableScroll,
  Td,
  Textarea,
  Th,
  TurnerTownsendLogo,
} from '@/components/assemble-v2';
import { engagementById, fitCandidates, personById } from '@/lib/assemble-v2/demo-data';
import { nextActionFor } from '@/lib/assemble-v2/next-action';

export const metadata = { title: 'Component library' };

const SWATCHES = [
  ['bg-asm-brand', 'brand', '#1E4479'],
  ['bg-asm-brand-hover', 'brand-hover', '#16335C'],
  ['bg-asm-brand-deep', 'brand-deep', '#0F2647'],
  ['bg-asm-brand-mid', 'brand-mid', '#3D6AA8'],
  ['bg-asm-brand-soft', 'brand-soft', '#8FAAD1'],
  ['bg-asm-brand-tint', 'brand-tint', '#B7CBE8'],
  ['bg-asm-brand-wash', 'brand-wash', '#EEF3F9'],
  ['bg-asm-black', 'black', '#000006'],
  ['bg-asm-canvas', 'canvas', '#F6F8FA'],
  ['bg-asm-line', 'line', '#E3E8EE'],
  ['bg-asm-ink', 'ink', '#1B1F24'],
  ['bg-asm-ink-3', 'ink-3', '#5B6570'],
  ['bg-asm-ok', 'ok (status only)', '#1E7B4C'],
  ['bg-asm-warn', 'warn (status only)', '#B26B00'],
  ['bg-asm-risk', 'risk (status only)', '#B42318'],
];

function Section({ id, title, usage, children }: { id: string; title: string; usage: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="flex flex-col gap-4 border-t border-asm-line pt-8">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-h`} className="text-xl font-bold text-asm-brand">{title}</h2>
        <code className="w-fit rounded-[6px] bg-asm-sunk px-2 py-1 text-[13px] text-asm-ink-2">{usage}</code>
      </div>
      {children}
    </section>
  );
}

/** Live catalogue of every v2 component, rendered with demo data. Keep in step with docs/redesign/COMPONENTS.md. */
export default function ComponentsPage() {
  const e = engagementById('finance-data-platform')!;
  const p10 = e.standards.find((s) => s.ref === '10')!;
  return (
    <>
      <PageHeader title="Component library" subtitle="Assemble v2 components with live examples. Import from @/components/assemble-v2." />

      <Section id="tokens" title="Colour tokens" usage="bg-asm-brand · text-asm-ink · border-asm-line (styles/assemble-v2.css)">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SWATCHES.map(([cls, name, hex]) => (
            <div key={name} className="overflow-hidden rounded-asm border border-asm-line bg-asm-surface">
              <div className={`h-14 ${cls}`} />
              <div className="flex flex-col px-3 py-2 text-xs"><span className="font-semibold">{name}</span><span className="text-asm-ink-3">{hex}</span></div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="buttons" title="Buttons" usage="<Button variant='primary' size='md' /> · <ButtonLink href='…' />">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-asm-lg bg-asm-brand p-5">
          <Button variant="inverse">Inverse</Button>
          <Button variant="inverse-outline">Inverse outline</Button>
          <Button variant="accent">Accent</Button>
          <ButtonLink href="/v2/home" variant="inverse">Button link</ButtonLink>
        </div>
      </Section>

      <Section id="status" title="Status, badges and Keel" usage="<StatusPill status='at-risk' /> · <Badge tone='brand' /> · <KeelBadge status={…} />">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status="on-track" />
          <StatusPill status="at-risk" />
          <StatusPill status="off-track" />
          <StatusPill status="at-risk" size="sm" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="brand">Brand</Badge>
          <Badge tone="ok">Evidenced</Badge>
          <Badge tone="warn">Below 3</Badge>
          <Badge tone="risk">High</Badge>
          <KeelBadge status={{ kind: 'ok' }} />
          <KeelBadge status={{ kind: 'exception', until: '15 Nov' }} />
          <KeelBadge status={{ kind: 'exception-no-end' }} />
          <KeelBadge status={{ kind: 'over-capacity', allocation: 95 }} />
        </div>
      </Section>

      <Section id="lifecycle" title="Lifecycle bar" usage="<LifecycleBar stage='beta' progressLabel='week 12' variant='full | compact' />">
        <LifecycleBar stage="beta" progressLabel="week 12" />
        <div className="max-w-sm"><LifecycleBar stage="discovery" progressLabel="Discovery, week 3 of 6" variant="compact" /></div>
      </Section>

      <Section id="next" title="Next action" usage="<NextActionCard action={nextActionFor(engagement)} emphasis='hero | soft' />">
        <NextActionCard action={nextActionFor(e)} />
        <div className="max-w-sm"><NextActionCard action={nextActionFor(e)} emphasis="soft" /></div>
      </Section>

      <Section id="measures" title="Measure and stat tiles" usage="<MeasureTile … /> · <StatTile label value note tone />">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MeasureTile label="Predictability" value="83%" onTarget trend={[76, 80, 83]} trendLabel="Predictability rising from 76% to 83%" footnote="Sprint goals met · Target 80%" />
          <MeasureTile label="Team health" value="3.4" onTarget={false} trend={[4.2, 4.0, 3.4]} trendLabel="Team health falling from 4.2 to 3.4" footnote="Monthly health check · Target 4.0" />
        </div>
        <div className="flex flex-wrap gap-4">
          <StatTile label="Planned utilisation" value="81%" note="Within 75% to 85%" tone="ok" />
          <StatTile label="Open exceptions" value="2" note="1 has no end date" tone="warn" />
        </div>
        <div className="max-w-sm"><ProgressBar value={64} label="9 of 14 evidenced" /></div>
      </Section>

      <Section id="cards" title="Cards, attention rows and engagement cards" usage="<Card><CardHeader title description action /><CardBody /><CardFooter /></Card>">
        <Card>
          <CardHeader title="Needs attention" description="Most urgent first" />
          <ul>
            <AttentionRow icon="warning" tone="urgent" text="Finance and projects data platform is at risk. Add a recovery plan this week." context="Team health fell to 3.4" cta="Add recovery plan" href="#" />
            <AttentionRow icon="calendar" text="Steering committee is on Thursday. The pack is not ready." cta="Draft pack" href="#" />
          </ul>
          <CardFooter><span>Card footer</span><a href="#" className="font-semibold text-asm-brand">Link</a></CardFooter>
        </Card>
        <div className="flex flex-wrap gap-4"><EngagementCard engagement={e} /><div className="flex-1 basis-[300px]"><EmptyState title="No engagements yet" body="Create one to start staffing your squad and setting up Sprint Zero." action={<Button size="sm">New engagement</Button>} /></div></div>
      </Section>

      <Section id="forms" title="Forms" usage="<Field id label hint><Input id /></Field> · Select · Textarea · Stepper">
        <Stepper steps={['About', 'Commercials', 'Squad', 'Governance']} current={1} />
        <div className="grid max-w-3xl gap-4 md:grid-cols-2">
          <Field id="c-name" label="Engagement name" hint="For example, Finance data platform"><Input id="c-name" aria-describedby="c-name-hint" /></Field>
          <Field id="c-model" label="Commercial model"><Select id="c-model"><option>Fixed price</option><option>Time and materials</option></Select></Field>
          <Field id="c-out" label="Outcomes" className="md:col-span-2"><Textarea id="c-out" /></Field>
        </div>
      </Section>

      <Section id="data" title="Checklist and table" usage="<Checklist items={…} /> · <TableScroll><Table><thead><tr><Th/></tr></thead>…">
        <Card className="overflow-hidden"><Checklist items={e.checklist.filter((c) => c.stage === 'beta')} /></Card>
        <Card className="overflow-hidden">
          <TableScroll minWidth={560}>
            <Table>
              <thead><tr><Th>Person</Th><Th>Role</Th><Th>Allocation</Th></tr></thead>
              <tbody>
                <tr><Td><span className="flex items-center gap-2"><Avatar initials="TR" size={28} />Tom Reid</span></Td><Td>Squad Lead</Td><Td>80%</Td></tr>
                <tr><Td><span className="flex items-center gap-2"><Avatar initials="AK" size={28} />Aisha Khan</span></Td><Td>Product Lead</Td><Td>80%</Td></tr>
              </tbody>
            </Table>
          </TableScroll>
        </Card>
      </Section>

      <Section id="domain" title="Team Fit and crosswalk" usage="<FitCandidateCard candidate person /> · <CrosswalkPanel point />">
        <div className="flex flex-wrap items-start gap-4">
          <Card className="min-w-0 flex-1 basis-[340px] overflow-hidden">
            {fitCandidates.candidates.slice(0, 2).map((c) => <FitCandidateCard key={c.personId} candidate={c} person={personById(c.personId)!} />)}
          </Card>
          <div className="min-w-0 flex-1 basis-[340px]"><CrosswalkPanel point={p10} /></div>
        </div>
      </Section>

      <Section id="brand" title="Brand" usage="<AssembleLockup /> · <TurnerTownsendLogo height={24} />">
        <div className="flex flex-wrap items-center gap-6 rounded-asm-lg border border-asm-line bg-asm-surface p-5">
          <TurnerTownsendLogo height={28} />
        </div>
      </Section>

      <Card><CardBody className="text-sm text-asm-ink-2">Shell components (AppShell, SidebarNav, TabNav, AskAssemble) are live around this page.</CardBody></Card>
    </>
  );
}
