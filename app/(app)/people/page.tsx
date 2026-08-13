'use client';

import Link from 'next/link';
import { copy } from '@/lib/copy';
import { trpc } from '@/lib/trpc/client';

export default function PeoplePage() {
  const { data } = trpc.orgDesign.graph.useQuery();
  const { data: signals } = trpc.teamFit.orgRigour.useQuery();
  const people = data?.people ?? [];
  const assignments = data?.assignments ?? [];
  const signalCount = new Map<string, number>();
  for (const s of signals ?? []) {
    signalCount.set(s.personId, (signalCount.get(s.personId) ?? 0) + 1);
  }

  const unev = people.filter((p) => (signalCount.get(p.id) ?? 0) === 0).length;
  const unallocated =
    people.reduce((sum, p) => {
      const used = assignments.filter((a) => a.personId === p.id).reduce((s, a) => s + a.allocation, 0);
      return sum + Math.max(0, (p.fte - used) / 100);
    }, 0) || 0;

  return (
    <>
      <p className="eyebrow mb-2 text-[color:var(--graphite)]">{copy.people.eyebrow}</p>
      <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold">{copy.people.title}</h1>
      <p className="mt-2 mb-6 max-w-[62ch] text-[color:var(--graphite)]">{copy.people.lede}</p>

      <p className="mb-4">
        <Link href="/people/graph" className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em]">
          {copy.people.viewAsGraph}
        </Link>
      </p>

      <div className="mb-6 grid grid-cols-1 gap-px bg-[var(--rule)] sm:grid-cols-3">
        <div className="bg-[var(--raised)] p-4">
          <div className="font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
            {copy.people.peopleInPool}
          </div>
          <div className="mt-1 font-data text-[26px] tabular-nums">{people.length}</div>
        </div>
        <div className="bg-[var(--raised)] p-4">
          <div className="font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
            {copy.people.unallocated}
          </div>
          <div className="mt-1 font-data text-[26px] tabular-nums">{unallocated.toFixed(1)}</div>
        </div>
        <div className="bg-[var(--raised)] p-4">
          <div className="font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
            {copy.people.unevidencedCount}
          </div>
          <div className="mt-1 font-data text-[26px] tabular-nums">{unev}</div>
          <div className="text-[12px] text-[color:var(--graphite)]">a data gap, not a judgement</div>
        </div>
      </div>

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">{copy.people.pool}</h2>
      {people.length === 0 ? (
        <p className="text-[color:var(--graphite)]">{copy.empty.noPeople}</p>
      ) : (
        <div className="sheet overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Person</th>
                <th>{copy.people.free}</th>
                <th>{copy.people.rigour}</th>
                <th>Skills</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => {
                const used = assignments
                  .filter((a) => a.personId === p.id)
                  .reduce((s, a) => s + a.allocation, 0);
                const free = Math.max(0, (p.fte - used) / 100);
                const rigour = signalCount.get(p.id) ?? 0;
                return (
                  <tr key={p.id} className="clickable">
                    <td>
                      <Link href={`/people/${p.id}`} className="font-semibold">
                        {p.name}
                      </Link>
                    </td>
                    <td className="num">
                      {free.toFixed(1)}
                      <div className="text-[10px] uppercase tracking-wide text-[color:var(--graphite)]">available</div>
                    </td>
                    <td>
                      {rigour > 0 ? (
                        `${rigour} signals`
                      ) : (
                        <span className="flag">{copy.people.unevidenced}</span>
                      )}
                    </td>
                    <td className="text-[color:var(--graphite)]">{p.skills.length || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
