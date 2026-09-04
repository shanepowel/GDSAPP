'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { EmptyState, PageHeader, StatStrip, TextLink } from '@/components/datum/PageChrome';
import { AddPersonForm, PersonRoleSelect } from '@/components/org-design/PersonRoleControls';
import { TeachPanel } from '@/components/teach/TeachPanel';
import { ContinuityFigure, FigureFrame } from '@/components/teach/figures';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';
import { SIGNAL_BRIDGE } from '@/lib/bridge/gds';
import { GdsBridgeLabel } from '@/components/bridge/GdsBridgeLabel';
import type { RigourSignalType } from '@/lib/scoring/fit';

export default function PeoplePage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const { data, isError, isLoading } = trpc.orgDesign.graph.useQuery();
  const { data: signals } = trpc.teamFit.orgRigour.useQuery();
  const { data: engagements } = trpc.engagement.list.useQuery();
  const [openId, setOpenId] = useState<string | null>(null);
  const people = data?.people ?? [];
  const assignments = data?.assignments ?? [];
  const roleEntities = (data?.entities ?? [])
    .filter((e) => e.type === 'role')
    .map((e) => ({ id: e.id, name: e.name }));
  const signalCount = new Map<string, number>();
  const signalsByPerson = new Map<string, NonNullable<typeof signals>>();
  for (const s of signals ?? []) {
    signalCount.set(s.personId, (signalCount.get(s.personId) ?? 0) + 1);
    const list = signalsByPerson.get(s.personId) ?? [];
    list.push(s);
    signalsByPerson.set(s.personId, list);
  }

  const unev = people.filter((p) => (signalCount.get(p.id) ?? 0) === 0).length;
  const unallocated = people.reduce((a, p) => {
    const used = assignments.filter((x) => x.personId === p.id).reduce((s, x) => s + x.allocation, 0);
    return a + Math.max(0, (p.fte - used) / 100);
  }, 0);
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
            <TextLink href="#add-person">{copy.people.addPersonAction}</TextLink>
            <TextLink href="#pool">{copy.people.pool}</TextLink>
            <TextLink href="/people/graph">{copy.people.viewAsGraph}</TextLink>
            <TextLink href={manageHref}>{copy.ui.managePeople}</TextLink>
          </>
        }
      />

      <TeachPanel tag={copy.teach.peopleLookingAt.tag} title={copy.teach.peopleLookingAt.title}>
        {copy.teach.peopleLookingAt.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </TeachPanel>

      <FigureFrame
        id="figure-keel"
        caption={
          <>
            <b>{fillCopy(copy.figures.label, { n: 4 })}</b> {copy.figures.continuity}
          </>
        }
      >
        <ContinuityFigure label={copy.figures.continuityAria} />
      </FigureFrame>

      <StatStrip
        items={[
          {
            label: copy.people.peopleAvailable,
            value: isLoading ? copy.ui.loading : String(people.length),
            note: copy.people.acrossDisciplines,
          },
          {
            label: copy.people.unallocated,
            value: unallocated.toFixed(1),
            note: copy.people.unallocatedNote,
          },
          {
            label: copy.people.unevidencedCount,
            value: String(unev),
            note: copy.people.dataGap,
          },
        ]}
      />

      <h2
        id="pool"
        className="mb-3 mt-10 scroll-mt-6 font-[family-name:var(--font-cond)] text-[17px] font-semibold"
      >
        {copy.people.pool}
      </h2>
      <AddPersonForm roleEntities={roleEntities} />
      {roleEntities.length === 0 ? (
        <p className="mb-3 text-sm text-[color:var(--graphite)]">{copy.people.noRolesYet}</p>
      ) : null}
      {isLoading ? (
        <p className="text-[color:var(--graphite)]">{copy.ui.loading}</p>
      ) : isError ? (
        <EmptyState title={copy.ui.loadFailed} why={copy.ui.loadFailedWhy} />
      ) : people.length === 0 ? (
        <EmptyState title={copy.empty.noPeople} why={copy.empty.noPeopleWhy} />
      ) : (
        <div className="sheet overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{copy.people.person}</th>
                <th>{copy.people.role}</th>
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
                const currentRoleId =
                  assignments.find((a) => a.personId === p.id)?.entityId ?? '';
                return (
                  <Fragment key={p.id}>
                    <tr
                      className={`clickable${open ? ' is-open' : ''}`}
                      onClick={() => setOpenId(open ? null : p.id)}
                    >
                      <td>
                        <button
                          type="button"
                          className="row-toggle"
                          aria-expanded={open}
                          aria-label={open ? copy.ui.hideWorking : copy.ui.showWorking}
                        >
                          <span className="font-semibold">{p.name}</span>
                        </button>
                      </td>
                      <td
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <PersonRoleSelect
                          personId={p.id}
                          personName={p.name}
                          value={currentRoleId}
                          roleEntities={roleEntities}
                          hideLabel
                        />
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
                        <td colSpan={5}>
                          {rigour === 0 ? (
                            <p className="mb-3 max-w-[62ch] border-l-2 border-[color:var(--graphite)] pl-3 text-sm">
                              {copy.empty.noSignals}
                            </p>
                          ) : (
                            <ul className="mb-3 space-y-1 text-sm">
                              {(signalsByPerson.get(p.id) ?? []).map((s) => {
                                const type = s.type as RigourSignalType;
                                const label = type in copy.signals ? copy.signals[type] : s.type;
                                const mapping = SIGNAL_BRIDGE[type];
                                return (
                                  <li key={`${s.type}-${s.observedAt}`} className="flex flex-wrap gap-2">
                                    <span>{label}</span>
                                    {s.ceremony ? (
                                      <span className="text-[color:var(--graphite)]">
                                        {copy.ui.ceremony}: {s.ceremony}
                                      </span>
                                    ) : null}
                                    <GdsBridgeLabel mapping={mapping} />
                                  </li>
                                );
                              })}
                            </ul>
                          )}
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
