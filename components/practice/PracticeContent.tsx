'use client';

import Link from 'next/link';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { CEREMONIES, MATURITY, PILLARS } from '@/lib/practice';

export function PracticeOverview() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const c = copy.home;

  return (
    <>
      <section className="border-b border-[color:var(--rule)] pb-12">
        <p className="mb-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[color:var(--graphite)]">
          {c.eyebrow}
        </p>
        <h1 className="max-w-[16ch] font-[family-name:var(--font-cond)] text-[clamp(38px,7vw,68px)] font-bold leading-[1.02] tracking-[-0.01em]">
          {c.headline}
        </h1>
        <p className="mt-6 max-w-[62ch] text-[16px] text-[color:var(--graphite)]">{c.sub}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/?tour=1"
            className="rounded-[var(--radius)] bg-[var(--survey)] px-5 py-2.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] text-[var(--stock)]"
          >
            {c.primaryCta}
          </Link>
          <Link
            href="/practice/pillars"
            className="rounded-[var(--radius)] border border-[color:var(--ink)] px-5 py-2.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em]"
          >
            {c.secondaryCta}
          </Link>
        </div>
      </section>

      <section className="py-12">
        <h2 className="mb-1 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
          {copy.practice.pillarsTitle}
        </h2>
        <p className="mb-4 max-w-[62ch] text-[color:var(--graphite)]">{copy.practice.pillarsLede}</p>
        <PillarsTable />
      </section>

      <section className="pb-12">
        <h2 className="mb-1 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
          {copy.practice.ceremoniesTitle}
        </h2>
        <p className="mb-4 max-w-[62ch] text-[color:var(--graphite)]">{copy.practice.ceremoniesLede}</p>
        <CeremoniesTable />
      </section>

      <section className="grid gap-px border-y border-[color:var(--rule)] bg-[var(--rule)] md:grid-cols-3">
        {c.claims.map((claim) => (
          <div key={claim.title} className="bg-[var(--raised)] p-7">
            <h3 className="mb-2 font-[family-name:var(--font-cond)] text-[15px] font-semibold">
              {claim.title}
            </h3>
            <p className="text-[color:var(--graphite)]">{claim.body}</p>
            <p className="mt-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em]">
              See it in {claim.proof}
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
    </>
  );
}

export function PillarsTable() {
  return (
    <div className="sheet overflow-hidden">
      <table>
        <thead>
          <tr>
            <th>Pillar</th>
            <th>Owns</th>
            <th>What it produces for assurance</th>
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
  return (
    <div className="sheet overflow-hidden">
      <table>
        <thead>
          <tr>
            <th>Ceremony</th>
            <th>Cadence</th>
            <th>Emits</th>
            <th>Signal</th>
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
                  you are here
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
