'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { EmptyState, PageHeader, StatStrip, TextLink } from '@/components/datum/PageChrome';
import { DesignWorkspace } from '@/components/org-design/DesignWorkspace';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';

export default function PeoplePage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const { data } = trpc.orgDesign.graph.useQuery();
  const { data: signals } = trpc.teamFit.orgRigour.useQuery();
  const { data: engagements } = trpc.engagement.list.useQuery();
  const [openId, setOpenId] = useState<string | null>(null);
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
  const manageHref = engagements?.[0]
    ? `/engagements/${engagements[0].id}/team/people`
    : '/engagements/new';

  return (
    <>
      <PageHeader
        eyebrow={copy.people.eyebrow}
        title={copy.people.title}
        lede={copy.people.lede}
        actions={
          <>
            <TextLink href="#pool">{copy.people.pool}</TextLink>
            <TextLink href="/people/graph">{copy.people.viewAsGraph}</TextLink>
            <TextLink href={manageHref}>{copy.ui.managePeople}</TextLink>
          </>
        }
      />

      <DesignWorkspace hideHeading initialViewMode="chart" title={copy.people.title} />

      <StatStrip
        items={[
          { label: copy.people.peopleInPool, value: String(people.length) },
          { label: copy.people.unallocated, value: unallocated.toFixed(1) },
          { label: copy.people.unevidencedCount, value: String(unev), note: copy.people.dataGap },
        ]}
      />

      <h2
        id="pool"
        className="mb-3 mt-10 scroll-mt-6 font-[family-name:var(--font-cond)] text-[17px] font-semibold"
      >
        {copy.people.pool}
      </h2>
      {people.length === 0 ? (
        <EmptyState
          title={copy.empty.noPeople}
          why={copy.empty.noPeopleWhy}
          actionHref={manageHref}
          actionLabel={copy.ui.managePeople}
        />
      ) : (
        <div className="sheet overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{copy.people.person}</th>
                <th>{copy.people.free}</th>
                <th>{copy.people.rigour}</th>
                <th>{copy.people.skills}</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => {
                const used = assignments
                  .filter((a) => a.personId === p.id)
                  .reduce((s, a) => s + a.allocation, 0);
                const free = Math.max(0, (p.fte - used) / 100);
                const rigour = signalCount.get(p.id) ?? 0;
                const open = openId === p.id;
                return (
                  <Fragment key={p.id}>
                    <tr className={open ? 'is-open' : undefined}>
                      <td>
                        <button
                          type="button"
                          className="row-toggle"
                          aria-expanded={open}
                          aria-label={open ? copy.ui.hideWorking : copy.ui.showWorking}
                          onClick={() => setOpenId(open ? null : p.id)}
                        >
                          <span className="font-semibold">{p.name}</span>
                        </button>
                      </td>
                      <td className="num">
                        {free.toFixed(1)}
                        <div className="text-[10px] uppercase tracking-wide text-[color:var(--graphite)]">
                          {copy.people.available}
                        </div>
                      </td>
                      <td>
                        {rigour > 0 ? (
                          <span className="font-data tabular-nums">{rigour}</span>
                        ) : (
                          <span className="flag">{copy.people.unevidenced}</span>
                        )}
                      </td>
                      <td className="num">{p.skills.length || '—'}</td>
                    </tr>
                    {open ? (
                      <tr className="sheet-detail">
                        <td colSpan={4}>
                          {rigour === 0 ? (
                            <p className="mb-3 max-w-[62ch] border-l-2 border-[color:var(--graphite)] pl-3 text-sm">
                              {copy.empty.noSignals}
                            </p>
                          ) : null}
                          {p.skills.length ? (
                            <ul className="flex flex-wrap gap-2">
                              {p.skills.map((s) => (
                                <li key={s} className="flag">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-[color:var(--graphite)]">{copy.people.noSkills}</p>
                          )}
                          <p className="mt-3">
                            <Link href={`/people/${p.id}`} className="text-sm underline-offset-2 hover:underline">
                              {copy.people.openPerson}
                            </Link>
                          </p>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
