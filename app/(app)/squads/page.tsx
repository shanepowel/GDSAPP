'use client';

import Link from 'next/link';
import { copy } from '@/lib/copy';
import { trpc } from '@/lib/trpc/client';

export default function SquadsIndexPage() {
  const { data, isLoading } = trpc.engagement.list.useQuery();

  return (
    <>
      <p className="eyebrow mb-2 text-[color:var(--graphite)]">{copy.squads.eyebrow}</p>
      <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold">Squads</h1>
      <p className="mt-2 mb-6 max-w-[62ch] text-[color:var(--graphite)]">
        Choose an engagement to assemble the squad and read every role against the datum.
      </p>
      {isLoading ? <p>Loading…</p> : null}
      {!isLoading && (data?.length ?? 0) === 0 ? (
        <p className="text-[color:var(--graphite)]">{copy.empty.noEngagements}</p>
      ) : (
        <div className="sheet overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Engagement</th>
                <th>Phase</th>
                <th>Standard</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((e) => (
                <tr key={e.id} className="clickable">
                  <td>
                    <Link href={`/squads/${e.id}`} className="font-semibold">
                      {e.name}
                    </Link>
                  </td>
                  <td className="num">{e.phase ?? '—'}</td>
                  <td>{e.standardId === 'wales' ? 'Wales DSS' : e.standardId === 'gds' ? 'GDS' : e.standardId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
