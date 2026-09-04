'use client';

import Link from 'next/link';
import { TeachPanel } from '@/components/teach/TeachPanel';
import {
  EmpoweredFigure,
  FigureFrame,
  LifecycleFigure,
} from '@/components/teach/figures';
import { PillarsTable } from '@/components/practice/PracticeContent';
import { DatumLineFigure } from '@/components/practice/DatumLineFigure';
import { InkButton } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';

const CLAIM_HREFS = ['/practice/pillars', '/people', '/squads', '/assurance'] as const;

export function HomeLanding() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const c = copy.home;

  return (
    <>
      <section className="border-b border-[color:var(--rule)] pb-8">
        <p className="eyebrow mb-2 text-[color:var(--graphite)]">{c.eyebrow}</p>
        <h1 className="max-w-[22ch] font-[family-name:var(--font-cond)] text-[30px] font-bold leading-[1.12]">
          {c.headline}
        </h1>
        <p className="mt-2 max-w-[64ch] text-[15px] text-[color:var(--graphite)]">{c.sub}</p>
        <p className="mt-5 flex flex-wrap gap-3">
          <InkButton href="/demo">{copy.demo.tryCta}</InkButton>
          <Link href="/practice" className="text-sm underline-offset-2 hover:underline">
            {c.secondaryCta}
          </Link>
        </p>
      </section>

      <section className="py-10">
        <TeachPanel tag={copy.teach.practiceIdea.tag} title={copy.teach.practiceIdea.title}>
          {copy.teach.practiceIdea.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </TeachPanel>

        <DatumLineFigure />

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
      </section>

      <section className="pb-10">
        <h2 className="mb-1 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
          {copy.practice.pillarsTitle}
        </h2>
        <p className="mb-4 max-w-[62ch] text-[color:var(--graphite)]">{copy.practice.pillarsLede}</p>
        <PillarsTable />
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

      <footer className="mt-8 border-t border-[color:var(--rule)] py-8 font-[family-name:var(--font-mono)] text-[10px] leading-relaxed text-[color:var(--graphite)]">
        {copy.footer.disclaimer}
      </footer>
    </>
  );
}
