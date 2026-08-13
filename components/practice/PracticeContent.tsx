'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { fillCopy } from '@/lib/copy';
import { CEREMONIES, MATURITY, PILLARS } from '@/lib/practice';
import { TeachPanel } from '@/components/teach/TeachPanel';
import {
  CapacityFigure,
  EmpoweredFigure,
  FigureFrame,
  LifecycleFigure,
} from '@/components/teach/figures';

const CLAIM_HREFS = ['/practice/pillars', '/people', '/squads', '/assurance'] as const;

export function PracticeOverview() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const c = copy.home;

  return (
    <>
      <Suspense fallback={null}>
        <PracticeTourScroll />
      </Suspense>

      <section className="border-b border-[color:var(--rule)] pb-8">
        <p className="eyebrow mb-2 text-[color:var(--graphite)]">{copy.practice.eyebrow}</p>
        <h1 className="max-w-[22ch] font-[family-name:var(--font-cond)] text-[30px] font-bold leading-[1.12]">
          {copy.practice.looksLikeTitle}
        </h1>
        <p className="mt-2 max-w-[64ch] text-[15px] text-[color:var(--graphite)]">{copy.practice.looksLikeLede}</p>
      </section>

      <section className="py-10">
        <TeachPanel tag={copy.teach.practiceIdea.tag} title={copy.teach.practiceIdea.title}>
          {copy.teach.practiceIdea.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </TeachPanel>

        <FigureFrame
          id="figure-empowered"
          caption={
            <>
              <b>{fillCopy(copy.figures.label, { n: 1 })}</b> {copy.figures.empowered}
            </>
          }
        >
          <EmpoweredFigure label={copy.figures.empoweredAria} />
        </FigureFrame>

        <FigureFrame
          id="figure-clocks"
          caption={
            <>
              <b>{fillCopy(copy.figures.label, { n: 2 })}</b> {copy.figures.clocks}
            </>
          }
        >
          <LifecycleFigure label={copy.figures.clocksAria} />
        </FigureFrame>

        <TeachPanel tag={copy.teach.twoClocks.tag} title={copy.teach.twoClocks.title}>
          {copy.teach.twoClocks.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </TeachPanel>
      </section>

      <section className="pb-10">
        <h2 className="mb-1 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
          {copy.practice.pillarsTitle}
        </h2>
        <p className="mb-4 max-w-[62ch] text-[color:var(--graphite)]">{copy.practice.pillarsLede}</p>
        <PillarsTable />
      </section>

      <section className="pb-10">
        <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
          {copy.practice.capacityTitle}
        </h2>
        <FigureFrame
          id="figure-capacity"
          caption={
            <>
              <b>{fillCopy(copy.figures.label, { n: 3 })}</b> {copy.figures.capacity}
            </>
          }
        >
          <CapacityFigure label={copy.figures.capacityAria} />
        </FigureFrame>
        <TeachPanel tag={copy.teach.capacityCaution.tag} title={copy.teach.capacityCaution.title}>
          {copy.teach.capacityCaution.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </TeachPanel>
      </section>

      <section className="pb-12">
        <h2 className="mb-1 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
          {copy.practice.ceremoniesTitle}
        </h2>
        <p className="mb-4 max-w-[62ch] text-[color:var(--graphite)]">{copy.practice.ceremoniesLede}</p>
        <CeremoniesTable />
      </section>

      <section className="grid gap-px border-y border-[color:var(--rule)] bg-[var(--rule)] md:grid-cols-2">
        {c.claims.map((claim, i) => (
          <div key={claim.title} className="bg-[var(--raised)] p-7">
            <h3 className="mb-2 font-[family-name:var(--font-cond)] text-[15px] font-semibold">
              {claim.title}
            </h3>
            <p className="text-[color:var(--graphite)]">{claim.body}</p>
            <p className="mt-3">
              <Link
                href={CLAIM_HREFS[i] ?? '/practice/pillars'}
                className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] underline-offset-2 hover:underline"
              >
                {claim.seeIn}
              </Link>
            </p>
          </div>
        ))}
      </section>

      <section className="py-14">
        <div className="max-w-[62ch] border-l-2 border-[color:var(--survey)] pl-6">
          <h2 className="mb-2 mt-0 font-[family-name:var(--font-cond)] text-[19px] font-semibold">
            {c.credibility.title}
          </h2>
          <p className="text-[15px]">{c.credibility.body}</p>
        </div>
        <div className="mt-10 max-w-[62ch] border-l-2 border-[color:var(--graphite)] pl-6">
          <h2 className="mb-2 mt-0 font-[family-name:var(--font-cond)] text-[19px] font-semibold">
            {c.reasoning.title}
          </h2>
          <p className="text-[15px]">{c.reasoning.body}</p>
        </div>
      </section>

      <section className="pb-8">
        <h2 className="mb-4 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
          {copy.practice.maturityTitle}
        </h2>
        <MaturityLadder />
      </section>

      <footer className="mt-8 border-t border-[color:var(--rule)] py-8 font-[family-name:var(--font-mono)] text-[10px] leading-relaxed text-[color:var(--graphite)]">
        {copy.footer.disclaimer}
      </footer>
    </>
  );
}

function PracticeTourScroll() {
  const search = useSearchParams();
  const tour = search.get('tour');

  useEffect(() => {
    const id = tour === '2' ? 'figure-clocks' : tour === '1' ? 'figure-empowered' : null;
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, [tour]);

  return null;
}

export function PillarsTable() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  return (
    <div className="sheet overflow-hidden">
      <table>
        <thead>
          <tr>
            <th>{copy.practice.pillar}</th>
            <th>{copy.practice.owns}</th>
            <th>{copy.practice.produces}</th>
          </tr>
        </thead>
        <tbody>
          {PILLARS.map((p) => (
            <tr key={p.name}>
              <td className="font-semibold">{p.name}</td>
              <td>{p.owns}</td>
              <td className="text-[color:var(--graphite)]">{p.produces}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CeremoniesTable() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  return (
    <div className="sheet overflow-hidden">
      <table>
        <thead>
          <tr>
            <th>{copy.practice.ceremony}</th>
            <th>{copy.practice.cadence}</th>
            <th>{copy.practice.emits}</th>
            <th>{copy.practice.signal}</th>
          </tr>
        </thead>
        <tbody>
          {CEREMONIES.map((x) => (
            <tr key={x.name}>
              <td>{x.name}</td>
              <td className="num">{x.cadence}</td>
              <td>{x.emits}</td>
              <td>{x.signal ? <span className="flag">{x.signal}</span> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MaturityLadder({ current }: { current?: number }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  return (
    <div className="sheet">
      {MATURITY.map((m) => (
        <div
          key={m.level}
          className="grid grid-cols-[52px_1fr] border-b border-[color:var(--rule-soft)] last:border-b-0"
          style={m.level === current ? { background: 'var(--sunk)' } : undefined}
        >
          <div
            className="flex items-center justify-center border-r border-[color:var(--rule-soft)] font-[family-name:var(--font-mono)] text-[18px]"
            style={{ color: m.level === current ? 'var(--survey)' : 'var(--graphite)' }}
          >
            {m.level}
          </div>
          <div className="px-4 py-3.5">
            <h3 className="mb-1 font-[family-name:var(--font-cond)] text-sm font-semibold">
              {m.name}
              {m.level === current ? (
                <span className="ml-2.5 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.1em] text-[color:var(--survey)]">
                  {copy.practice.youAreHere}
                </span>
              ) : null}
            </h3>
            <p className="text-[color:var(--graphite)]">{m.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
