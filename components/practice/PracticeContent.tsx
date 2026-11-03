'use client';

import Link from 'next/link';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { fillCopy } from '@/lib/copy';
import { CEREMONIES, DONE_ITEMS, MATURITY, PILLARS, READY_ITEMS } from '@/lib/practice';
import { maturityIndex } from '@/lib/labels';
import { trpc } from '@/lib/trpc/client';
import { TeachPanel } from '@/components/teach/TeachPanel';
import { CapacityFigure, FigureFrame } from '@/components/teach/figures';
import { GdsBridgeLabel } from '@/components/bridge/GdsBridgeLabel';
import { PILLAR_BRIDGE, SIGNAL_BRIDGE } from '@/lib/bridge/gds';

export function PracticeChapters() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const c = copy.home;

  return (
    <>
      <section className="border-b border-[color:var(--rule)] pb-8">
        <p className="eyebrow mb-2 text-asm-ink-3">{copy.practice.eyebrow}</p>
        <h1 className="max-w-[22ch] text-[30px] font-bold text-asm-brand leading-[1.12]">
          {copy.practice.looksLikeTitle}
        </h1>
        <p className="mt-2 max-w-[64ch] text-[15px] text-asm-ink-3">{copy.practice.looksLikeLede}</p>
        <p className="mt-4">
          <Link href="/practice/components" className="text-sm underline-offset-2 hover:underline">
            {copy.journey.components}
          </Link>
        </p>
      </section>

      <section className="py-10">
        <h2 className="mb-3 text-lg font-bold text-asm-brand">
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
        <h2 className="mb-1 text-lg font-bold text-asm-brand">
          {copy.practice.ceremoniesTitle}
        </h2>
        <p className="mb-4 max-w-[62ch] text-asm-ink-3">{copy.practice.ceremoniesLede}</p>
        <p className="mb-4">
          <Link href="/practice/ceremonies" className="text-sm underline-offset-2 hover:underline">
            {copy.journey.ceremonies}
          </Link>
        </p>
        <CeremoniesTable />
      </section>

      <section className="py-14">
        <div className="max-w-[62ch] border-l-2 border-[color:var(--blue)] pl-6">
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
        <h2 className="mb-4 text-lg font-bold text-asm-brand">
          {copy.practice.maturityTitle}
        </h2>
        <MaturityLadder />
      </section>

      <section className="pb-8">
        <h2 className="mb-3 text-lg font-bold text-asm-brand">{copy.practice.readyTitle}</h2>
        <ul className="m-0 list-none divide-y divide-asm-line p-0">
          {READY_ITEMS.map((item) => (
            <li key={item} className="py-3">{item}</li>
          ))}
        </ul>
        <h2 className="mb-3 mt-8 text-lg font-bold text-asm-brand">{copy.practice.doneTitle}</h2>
        <ul className="m-0 list-none divide-y divide-asm-line p-0">
          {DONE_ITEMS.map((item) => (
            <li key={item} className="py-3">{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
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
              <td className="font-semibold">
                {p.name} <GdsBridgeLabel mapping={PILLAR_BRIDGE[p.name]} />
              </td>
              <td>{p.owns}</td>
              <td className="text-asm-ink-3">{p.produces}</td>
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
              <td>
                {x.signal ? (
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span className="flag">{copy.signals[x.signal]}</span>
                    <GdsBridgeLabel mapping={SIGNAL_BRIDGE[x.signal]} />
                  </span>
                ) : (
                  copy.spine.missing
                )}
              </td>
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
  const { data: engagements } = trpc.engagement.list.useQuery(undefined, { retry: false });
  const fromEngagement = maturityIndex(engagements?.[0]?.maturityLevel);
  const here = current ?? fromEngagement ?? undefined;
  return (
    <div className="sheet">
      {MATURITY.map((m) => (
        <div
          key={m.level}
          className="grid grid-cols-[52px_1fr] border-b border-[color:var(--rule-soft)] last:border-b-0"
          style={m.level === here ? { background: 'var(--sunk)' } : undefined}
        >
          <div
            className="flex items-center justify-center border-r border-[color:var(--rule-soft)] font-[family-name:var(--font-mono)] text-[18px]"
            style={{ color: m.level === here ? 'var(--blue)' : 'var(--graphite)' }}
          >
            {m.level}
          </div>
          <div className="px-4 py-3.5">
            <h3 className="mb-1 font-[family-name:var(--font-cond)] text-sm font-semibold">
              {copy.maturityLevels[m.key]}
              {m.level === here ? (
                <span className="ml-2.5 text-[12px] font-semibold text-[color:var(--blue)]">
                  {copy.practice.youAreHere}
                </span>
              ) : null}
            </h3>
            <p className="text-asm-ink-3">{m.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
