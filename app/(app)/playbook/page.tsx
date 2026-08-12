'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { trpc } from '@/lib/trpc/client';

export default function PlaybookPage() {
  const { data } = trpc.playbook.summary.useQuery();

  return (
    <AppShell title="Delivery Playbook">
      <AppNav />
      <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink-0">
        T&amp;T Delivery Playbook
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-1">
        Public sector edition — the operating model Assemble encodes. Team Fit scores against this
        playbook. Iterate at delivery cadence; assure at governance cadence.
      </p>
      <p className="mt-2 text-[13px]">
        <Link href="/settings/archetypes" className="text-signal-ink underline-offset-2 hover:underline">
          Archetype library (Squad Blueprint)
        </Link>
      </p>

      <section className="mt-10">
        <h2 className="text-[17px] font-semibold text-ink-0">The Keel</h2>
        <p className="mt-2 max-w-2xl text-[15px] text-ink-1">
          Continuity is an assurance control. Core roles at ≥{data?.keel.coreRoleMinFte ?? 0.8} FTE
          for a complete phase. Capacity split{' '}
          {data
            ? `${data.keel.capacitySplit.committed * 100}/${data.keel.capacitySplit.discretionary * 100}/${data.keel.capacitySplit.slack * 100}`
            : '70/20/10'}
          — committed / discretionary / slack.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-[17px] font-semibold text-ink-0">Phase crosswalk</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-rule font-data text-[11px] uppercase tracking-wide text-ink-1">
                <th className="py-2 pr-3 font-medium">Phase</th>
                <th className="py-2 pr-3 font-medium">Weeks</th>
                <th className="py-2 pr-3 font-medium">Gateway</th>
                <th className="py-2 pr-3 font-medium">Business case</th>
                <th className="py-2 pr-3 font-medium">Archetype</th>
                <th className="py-2 font-medium">Sync point</th>
              </tr>
            </thead>
            <tbody>
              {(data?.phases ?? []).map((p) => (
                <tr key={p.gdsPhase} className="border-b border-rule">
                  <td className="py-2 pr-3 font-medium text-ink-0">{p.gdsPhase}</td>
                  <td className="py-2 pr-3 font-data text-ink-1">
                    {p.indicativeWeeksMin}–{p.indicativeWeeksMax}
                  </td>
                  <td className="py-2 pr-3 text-ink-1">{p.gateway}</td>
                  <td className="py-2 pr-3 text-ink-1">{p.businessCase}</td>
                  <td className="py-2 pr-3 font-data text-ink-1">{p.archetypeSlug}</td>
                  <td className="py-2 text-ink-1">{p.syncPoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[17px] font-semibold text-ink-0">Delivery Compass — rigour targets</h2>
        <ul className="mt-3 space-y-2 text-[15px] text-ink-1">
          <li>
            Evidence completeness ≥{' '}
            {Math.round((data?.compassTargets.evidenceCompleteness ?? 0.85) * 100)}%
          </li>
          <li>
            Decision traceability ≥{' '}
            {Math.round((data?.compassTargets.decisionTraceability ?? 0.9) * 100)}%
          </li>
          <li>
            Assignment stability ≥{' '}
            {Math.round((data?.compassTargets.assignmentStability ?? 0.75) * 100)}%
          </li>
          <li>NFR coverage by end of Alpha: 100%</li>
          <li>
            Assurance first-pass rate ≥{' '}
            {Math.round((data?.compassTargets.assuranceFirstPassRate ?? 0.7) * 100)}%
          </li>
        </ul>
      </section>

      <section className="mt-10 mb-8">
        <h2 className="text-[17px] font-semibold text-ink-0">Maturity levels</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] text-ink-1">
          {Object.entries(data?.maturityLabels ?? {}).map(([key, label]) => (
            <li key={key}>
              <span className="font-medium text-ink-0">{label}</span>
              {key === 'practising' && ' — ceremonies run; evidence when asked'}
              {key === 'evidenced' && ' — phase close is assembly, not authorship'}
              {key === 'assured' && ' — gates pass first time'}
              {key === 'compounding' && ' — evidence accelerates the next engagement'}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[13px] text-ink-1">
          Set on each engagement under Settings. Never folded into a person&apos;s fit score.
        </p>
      </section>
    </AppShell>
  );
}
