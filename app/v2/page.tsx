import Link from 'next/link';
import { Compass, FileText, Users } from 'lucide-react';
import { AssembleLockup, ButtonLink, StatusPill, TurnerTownsendLogo, Badge } from '@/components/assemble-v2';
import { engagementById } from '@/lib/assemble-v2/demo-data';
import { nextActionFor } from '@/lib/assemble-v2/next-action';
import { LIFECYCLE } from '@/lib/assemble-v2/types';

export const metadata = { title: 'Assemble great delivery teams' };

const MODULES = [
  ['Team', 'Assignments, capacity and tenure rules, with exceptions that always have an end date.'],
  ['Squad', 'Proven squad shapes, a one-page charter and a ready-made ceremony rhythm.'],
  ['Capability', 'Skills mapped to the DDaT Capability Framework, with learning pathways for every gap.'],
  ['Playbook', 'Templates, checklists and Definitions of Ready and Done, ready to use in any engagement.'],
  ['Compass', 'Four health measures, monthly surveys and a one-page report drafted for you.'],
  ['Decisions', 'RAID log, steering committee packs and risk locks, with every decision confirmed in writing.'],
  ['Change', 'Change requests, aftercare SLAs and support, so change is traded or agreed, never absorbed.'],
  ['Standards', 'The standards that apply, shown at the stage they matter, with evidence reused across frameworks.'],
];

const STEPS = [
  ['Shape', 'Check you can staff the work and set up governance before you sign.'],
  ['Set up', 'Pick a squad shape. Assemble drafts the charter, plan and Sprint Zero checklist.'],
  ['Deliver', 'Track predictability, quality, team health and client satisfaction every month.'],
  ['Decide', 'Run steering committees and risk locks that end in decisions, not updates.'],
  ['Support', 'Agree aftercare before go-live and handle change without absorbing it.'],
];

export default function LandingPage() {
  const demo = engagementById('finance-data-platform')!;
  const action = nextActionFor(demo);
  const current = LIFECYCLE.findIndex((s) => s.key === demo.stage);
  return (
    <div className="bg-asm-white">
      <header className="bg-asm-brand px-6">
        <nav aria-label="Main" className="mx-auto flex min-h-[76px] max-w-[1200px] flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex flex-1 items-center gap-3.5">
            <Link href="/v2" className="rounded-asm">
              <AssembleLockup />
            </Link>
            <span aria-hidden="true" className="h-7 w-px bg-asm-on-brand-line" />
            <TurnerTownsendLogo height={26} />
          </div>
          <div className="flex flex-wrap items-center gap-7">
            <a href="#how" className="text-[15px] text-asm-on-brand-2 hover:text-asm-on-brand">How it works</a>
            <a href="#modules" className="text-[15px] text-asm-on-brand-2 hover:text-asm-on-brand">Modules</a>
            <a href="#standards" className="text-[15px] text-asm-on-brand-2 hover:text-asm-on-brand">Standards</a>
            <ButtonLink href="/v2/sign-in" variant="inverse" size="sm">Sign in</ButtonLink>
          </div>
        </nav>
      </header>

      <section className="bg-asm-brand px-6 pb-24 pt-16">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-14">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-asm-brand-tint">Delivery assurance for teams that need rigour</p>
            <h1 className="text-[56px] font-bold leading-[1.05] text-asm-on-brand">Assemble great delivery teams, then keep them great.</h1>
            <p className="max-w-[540px] text-[19px] leading-relaxed text-asm-on-brand-2">Staff, set up and assure delivery teams from bid to aftercare, with public sector and construction standards built in at every stage.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <ButtonLink href="/v2/home" variant="accent" size="lg">See the demo</ButtonLink>
              <ButtonLink href="#how" variant="inverse-outline" size="lg">How it works</ButtonLink>
            </div>
          </div>
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-4 rounded-asm-lg bg-asm-surface p-6 shadow-asm-pop">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-[17px] font-bold text-asm-brand">{demo.name}</span>
                <span className="text-[13px] text-asm-ink-3">{demo.client} (demo)</span>
              </div>
              <StatusPill status={demo.status} />
            </div>
            <div className="grid grid-cols-7 gap-1" aria-hidden="true">
              {LIFECYCLE.map((s, i) => (
                <div key={s.key} className={i < current ? 'h-1.5 rounded-full bg-asm-brand' : i === current ? 'h-1.5 rounded-full bg-asm-brand-soft' : 'h-1.5 rounded-full bg-asm-line'} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-asm-ink-3">
              {LIFECYCLE.map((s, i) => (
                <span key={s.key} className={i === current ? 'font-semibold text-asm-brand' : undefined}>{s.label}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-asm bg-asm-brand-wash p-4">
              <div className="flex flex-[1_1_260px] flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.06em] text-asm-brand">Next action</span>
                <span className="text-[15px] font-medium text-asm-brand">{action.text}</span>
              </div>
              <span className="rounded-asm bg-asm-brand px-3.5 py-2.5 text-sm font-semibold text-asm-on-brand">{action.cta}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Predictability', `${demo.measures.predictability}%`, 'Target 80%', true],
                ['Quality', `${demo.measures.quality}%`, 'Target under 1%', true],
                ['Team health', `${demo.measures.teamHealth}`, 'Target 4.0', false],
                ['Client satisfaction', `${demo.measures.clientSatisfaction}`, 'Target 4.0', true],
              ].map(([l, v, t, ok]) => (
                <div key={l as string} className={ok ? 'flex flex-col gap-1 rounded-asm border border-asm-line p-3.5' : 'flex flex-col gap-1 rounded-asm border border-asm-warn-line bg-asm-warn-wash-2 p-3.5'}>
                  <span className="text-[13px] text-asm-ink-3">{l}</span>
                  <span className="text-[26px] font-bold text-asm-brand tabular-nums">{v}</span>
                  <span className={ok ? 'text-xs text-asm-ok-ink' : 'text-xs text-asm-warn-ink'}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto flex max-w-[1200px] flex-wrap gap-6 py-20">
          {[
            [Users, 'Build the right team', 'Match people to roles on skills, delivery rigour and availability, without spreading anyone too thin.'],
            [FileText, 'Start every engagement well', 'Squad shapes, charters and a Sprint Zero checklist replace slow, messy starts with a ready team in two weeks.'],
            [Compass, 'See trouble early', 'Four measures, one status and a clear next action on every engagement, so problems surface in week two, not week ten.'],
          ].map(([Icon, t, b]) => {
            const I = Icon as typeof Users;
            return (
              <div key={t as string} className="flex min-w-0 flex-[1_1_320px] flex-col gap-3.5 rounded-asm-lg border border-asm-line p-8">
                <I size={40} strokeWidth={1.6} className="text-asm-brand" aria-hidden="true" />
                <h2 className="text-[22px] font-bold text-asm-brand">{t as string}</h2>
                <p className="text-base leading-relaxed text-asm-ink-2">{b as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="how" className="bg-asm-canvas px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 py-20">
          <div className="flex max-w-[680px] flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-asm-brand">How it works</p>
            <h2 className="text-[40px] font-bold leading-tight text-asm-brand">One lifecycle, from bid to aftercare</h2>
            <p className="text-[17px] leading-relaxed text-asm-ink-2">Every engagement follows the same path. Assemble shows what needs doing at each stage and what stands between you and the next one.</p>
          </div>
          <ol className="flex flex-wrap gap-4">
            {STEPS.map(([t, b], i) => (
              <li key={t} className="flex min-w-0 flex-[1_1_200px] flex-col gap-2.5 rounded-asm-lg bg-asm-surface p-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-asm-brand font-bold text-asm-on-brand">{i + 1}</span>
                <h3 className="text-lg font-bold text-asm-brand">{t}</h3>
                <p className="text-[15px] leading-relaxed text-asm-ink-2">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="modules" className="px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 py-20">
          <div className="flex max-w-[680px] flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-asm-brand">Modules</p>
            <h2 className="text-[40px] font-bold leading-tight text-asm-brand">Everything a delivery team needs, connected</h2>
            <p className="text-[17px] leading-relaxed text-asm-ink-2">Each module does one job well. Together they catch what falls between the gaps: a skills gap that becomes a learning plan, a health dip that becomes a recovery plan, a change that updates the plan.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {MODULES.map(([t, b]) => (
              <div key={t} className="flex min-w-0 flex-[1_1_260px] flex-col gap-2 rounded-asm-lg border border-asm-line p-5">
                <h3 className="text-[17px] font-bold text-asm-brand">{t}</h3>
                <p className="text-[15px] leading-relaxed text-asm-ink-2">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="standards" className="bg-asm-brand-deep px-6">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-14 py-20">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-asm-brand-tint">Standards</p>
            <h2 className="text-[40px] font-bold leading-tight text-asm-on-brand">Evidence once, satisfy every framework</h2>
            <p className="text-[17px] leading-relaxed text-asm-on-brand-2">Assemble maps the GDS Service Standard to the Technology Code of Practice, NISTA gateway reviews, ISO 19650, the Construction Playbook and the Building Safety Act golden thread. Record evidence where the work happens and reuse it wherever it is needed.</p>
          </div>
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-asm-lg bg-asm-surface px-5 py-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.06em] text-asm-brand">GDS Service Standard, point 10</span>
                <span className="text-base font-semibold text-asm-brand">Define what success looks like and publish performance data</span>
              </div>
              <Badge tone="ok">Evidenced</Badge>
            </div>
            <p className="ml-1 text-sm text-asm-on-brand-3">The same evidence also supports:</p>
            <div className="flex flex-wrap gap-2.5">
              {['Technology Code of Practice', 'NISTA gateway review', 'ISO 19650', 'Construction Playbook', 'Golden thread'].map((f) => (
                <span key={f} className="rounded-asm border border-asm-on-brand-line px-3.5 py-2.5 text-sm text-asm-on-brand">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-12 py-20">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-asm-brand">Built on real practice</p>
            <h2 className="text-4xl font-bold leading-tight text-asm-brand">Built on how we actually deliver</h2>
            <p className="text-[17px] leading-relaxed text-asm-ink-2">Assemble encodes Agile WOW, Turner &amp; Townsend&apos;s delivery playbook for teams that need agility and rigour at the same time. The rules, templates and checklists come from live engagements, not theory.</p>
          </div>
          <div className="grid min-w-0 flex-[1_1_420px] grid-cols-2 gap-3">
            {[
              ['The Forge', 'Learning and certification'],
              ['Squad Blueprint', 'How teams are shaped and run'],
              ['DevOps Spec', 'Templates and standards'],
              ['Delivery Compass', 'Measures and governance'],
            ].map(([t, b]) => (
              <div key={t} className="rounded-asm-lg bg-asm-canvas p-5">
                <p className="mb-1.5 text-base font-bold text-asm-brand">{t}</p>
                <p className="text-sm text-asm-ink-2">{b}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-asm-lg bg-asm-canvas p-5">
              <p className="mb-1.5 text-base font-bold text-asm-brand">The Keel</p>
              <p className="text-sm text-asm-ink-2">Assignment, capacity and tenure, so squads stay steady</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-asm-brand-wash px-6">
        <div className="mx-auto flex max-w-[820px] flex-col items-center gap-5 py-24 text-center">
          <h2 className="text-[40px] font-bold leading-tight text-asm-brand">See an engagement from bid to aftercare in ten minutes</h2>
          <p className="text-lg leading-relaxed text-asm-ink-2">Walk through a live demo engagement and see how Assemble would fit your delivery teams.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/v2/home" size="lg">See the demo</ButtonLink>
            <ButtonLink href="/v2/sign-in" variant="secondary" size="lg">Sign in</ButtonLink>
          </div>
        </div>
      </section>

      <footer className="bg-asm-black px-6 py-8">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-3.5">
            <TurnerTownsendLogo height={24} />
            <span className="text-sm text-asm-on-brand-3">Assemble is a Turner &amp; Townsend product</span>
          </span>
          <div className="flex flex-wrap gap-6">
            <Link href="/accessibility" className="text-sm text-asm-on-brand-2 hover:text-asm-on-brand">Accessibility</Link>
            <Link href="/ai-use" className="text-sm text-asm-on-brand-2 hover:text-asm-on-brand">How we use AI</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
