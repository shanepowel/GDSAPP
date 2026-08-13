'use client';

import { useMemo, useState } from 'react';
import { FigureFrame, SquadShapeFigure } from '@/components/teach/figures';
import { FitBandCell, FitStrip } from '@/components/team-fit/FitStrip';
import { StatStrip } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { VIABILITY_THRESHOLD } from '@/lib/scoring/fit';
import {
  WALKTHROUGH_PEOPLE,
  WALKTHROUGH_ROLES,
  assignmentForTourStep,
  fitWalkthrough,
  rankedForRole,
  squadHealth,
  type WalkthroughAssignment,
} from '@/lib/teach/walkthrough';

export function SquadWalkthrough({ tourStep }: { tourStep: number }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const seeded = useMemo(() => assignmentForTourStep(tourStep), [tourStep]);
  const [assigned, setAssigned] = useState<WalkthroughAssignment>(seeded);
  const [openRole, setOpenRole] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const health = squadHealth(assigned);
  const nodes = WALKTHROUGH_ROLES.map((role, i) => {
    const personIndex = assigned[i];
    if (personIndex === undefined) {
      return {
        title: role.title,
        fte: role.fte,
        label: copy.walkthrough.openSeat,
        state: 'open' as const,
      };
    }
    const person = WALKTHROUGH_PEOPLE[personIndex];
    const fit = fitWalkthrough(role, person);
    return {
      title: role.title,
      fte: role.fte,
      label: person.name.split(' ')[0] ?? person.name,
      state: fit.compositeScore >= VIABILITY_THRESHOLD ? ('ok' as const) : ('weak' as const),
    };
  });

  function assign(roleIndex: number, personIndex: number) {
    setAssigned((current) => ({ ...current, [roleIndex]: personIndex }));
    setOpenRole(null);
    setConfirmed(false);
  }

  function unassign(roleIndex: number) {
    setAssigned((current) => {
      const next = { ...current };
      delete next[roleIndex];
      return next;
    });
    setOpenRole(null);
    setConfirmed(false);
  }

  function essentialLabel(crit: 'core' | 'supporting' | 'optional') {
    return copy.squads.criticalityLabels[crit];
  }

  return (
    <div className="mb-10">
      <p className="mb-4 text-[12.5px] text-[color:var(--graphite)]">{copy.walkthrough.liveHint}</p>

      <FigureFrame
        id="figure-squad"
        caption={
          <>
            <b>{fillCopy(copy.figures.label, { n: 5 })}</b> {copy.figures.squadShape}
          </>
        }
      >
        <SquadShapeFigure label={copy.figures.squadShapeAria} nodes={nodes} />
      </FigureFrame>

      <StatStrip
        items={[
          {
            label: copy.walkthrough.rolesFilled,
            value: `${health.filled}/${health.total}`,
            note: fillCopy(copy.walkthrough.aboveDatum, { count: health.above }),
          },
          {
            label: copy.walkthrough.essentialAtRisk,
            value: String(health.coreGaps),
            note: copy.walkthrough.essentialAtRiskNote,
          },
          {
            label: copy.walkthrough.stayingPower,
            value: `${(health.stability * 100).toFixed(0)}%`,
            note: copy.walkthrough.stayingPowerNote,
          },
          {
            label: copy.walkthrough.readyToConfirm,
            value: health.coreGaps === 0 ? copy.walkthrough.yes : copy.walkthrough.no,
            note: health.coreGaps === 0 ? copy.walkthrough.readyYes : copy.walkthrough.readyNo,
          },
        ]}
      />

      <h2 className="mb-3 mt-8 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.walkthrough.rolesHeading}
      </h2>

      <div className="sheet overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>{copy.squads.role}</th>
              <th>{copy.squads.bestCandidate}</th>
              <th>{copy.squads.fitAgainstDatum}</th>
              <th>{copy.walkthrough.action}</th>
            </tr>
          </thead>
          <tbody>
            {WALKTHROUGH_ROLES.map((role, roleIndex) => {
              const personIndex = assigned[roleIndex];
              const ranked = rankedForRole(role);
              const top = ranked.find((c) => c.enoughTime) ?? ranked[0];
              const open = openRole === roleIndex;
              const meta = `${role.fte.toFixed(1)} FTE · ${essentialLabel(role.crit)}`;

              const detail = open ? (
                <tr key={`${role.rid}-detail`} className="sheet-detail">
                  <td colSpan={4}>
                    <RankedList
                      roleIndex={roleIndex}
                      assigned={assigned}
                      onAssign={assign}
                      onUnassign={unassign}
                    />
                  </td>
                </tr>
              ) : null;

              if (personIndex === undefined) {
                return (
                  <FragmentRow key={role.rid}>
                    <tr className={open ? 'is-open' : undefined}>
                      <td>
                        <div className="font-semibold">{role.title}</div>
                        <div className="font-data text-[10.5px] text-[color:var(--graphite)]">{meta}</div>
                      </td>
                      <td colSpan={2}>
                        <span className="flag flag-risk">{copy.squads.unfilled}</span>
                        {top ? (
                          <div className="mt-1 font-data text-[10.5px] text-[color:var(--graphite)]">
                            {top.enoughTime
                              ? fillCopy(copy.walkthrough.bestAvailableNamed, {
                                  name: top.person.name,
                                  score: top.fit.compositeScore.toFixed(2),
                                })
                              : fillCopy(copy.walkthrough.bestAvailableNamedShort, {
                                  name: top.person.name,
                                  score: top.fit.compositeScore.toFixed(2),
                                })}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        {top ? (
                          <button
                            type="button"
                            className="btn-teach pri"
                            onClick={() => assign(roleIndex, top.personIndex)}
                          >
                            {fillCopy(copy.walkthrough.assignName, {
                              name: top.person.name.split(' ')[0] ?? top.person.name,
                            })}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="btn-teach ml-2"
                          onClick={() => setOpenRole(open ? null : roleIndex)}
                        >
                          {copy.walkthrough.seeAll}
                        </button>
                      </td>
                    </tr>
                    {detail}
                  </FragmentRow>
                );
              }

              const person = WALKTHROUGH_PEOPLE[personIndex];
              const fit = fitWalkthrough(role, person);
              return (
                <FragmentRow key={role.rid}>
                  <tr className={open ? 'is-open' : undefined}>
                    <td>
                      <div className="font-semibold">{role.title}</div>
                      <div className="font-data text-[10.5px] text-[color:var(--graphite)]">{meta}</div>
                    </td>
                    <td>
                      <div className="font-semibold">{person.name}</div>
                      <div className="font-data text-[10.5px] text-[color:var(--graphite)]">{person.role}</div>
                    </td>
                    <td>
                      <FitStrip fit={fit} candidateName={person.name} />
                    </td>
                    <td>
                      <FitBandCell fit={fit} />
                      <button
                        type="button"
                        className="btn-teach mt-2"
                        onClick={() => setOpenRole(open ? null : roleIndex)}
                      >
                        {copy.walkthrough.change}
                      </button>
                    </td>
                  </tr>
                  {detail}
                </FragmentRow>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="mb-4 mt-3 flex flex-wrap gap-x-5 gap-y-2 font-data text-[10px] text-[color:var(--graphite)]">
        <li className="flex items-center gap-2">
          <span className="legend-swatch is-held" aria-hidden />
          {copy.legend.held}
        </li>
        <li className="flex items-center gap-2">
          <span className="legend-swatch is-partial" aria-hidden />
          {copy.legend.partial}
        </li>
        <li className="flex items-center gap-2">
          <span className="legend-swatch is-datum" aria-hidden />
          {copy.legend.datum}
        </li>
        <li className="flex items-center gap-2">
          <span className="legend-swatch is-bracket" aria-hidden />
          {copy.legend.bracket}
        </li>
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-teach pri"
          disabled={health.coreGaps > 0}
          onClick={() => setConfirmed(true)}
        >
          {copy.walkthrough.confirm}
        </button>
        <button
          type="button"
          className="btn-teach"
          onClick={() => {
            setAssigned({});
            setConfirmed(false);
            setOpenRole(null);
          }}
        >
          {copy.walkthrough.startAgain}
        </button>
        <p className="m-0 text-[12.5px] text-[color:var(--graphite)]">
          {health.coreGaps > 0 ? copy.walkthrough.coverEssential : copy.walkthrough.confirmHint}
        </p>
      </div>

      {confirmed ? (
        <div className="teach-note mt-6">
          <p className="font-[family-name:var(--font-cond)] text-[15px] font-semibold">
            {fillCopy(copy.walkthrough.confirmedTitle, {
              filled: health.filled,
              total: health.total,
              above: health.above,
            })}
          </p>
          <p>{copy.walkthrough.confirmedBody}</p>
          <p className="teach-note-alert">{copy.walkthrough.confirmedOutstanding}</p>
        </div>
      ) : null}
    </div>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function RankedList({
  roleIndex,
  assigned,
  onAssign,
  onUnassign,
}: {
  roleIndex: number;
  assigned: WalkthroughAssignment;
  onAssign: (roleIndex: number, personIndex: number) => void;
  onUnassign: (roleIndex: number) => void;
}) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const role = WALKTHROUGH_ROLES[roleIndex];
  const list = rankedForRole(role);

  return (
    <div className="space-y-3 pt-1">
      <p className="font-data text-[10px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
        {copy.squads.rankedCandidates}
      </p>
      {list.map((c) => {
        const unev = c.fit.breakdown.notes.includes('no_rigour_signals');
        const meta = unev
          ? fillCopy(
              c.enoughTime ? copy.walkthrough.candidateMetaUnev : copy.walkthrough.candidateMetaUnevShort,
              { skill: c.fit.skillScore.toFixed(2) },
            )
          : fillCopy(
              c.enoughTime ? copy.walkthrough.candidateMeta : copy.walkthrough.candidateMetaShort,
              {
                skill: c.fit.skillScore.toFixed(2),
                evidence: c.fit.rigourMultiplier.toFixed(2),
              },
            );
        return (
          <div
            key={c.person.name}
            className="border border-[color:var(--rule)] bg-[var(--raised)] px-3.5 py-3"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <b>{c.person.name}</b>
                <div className="font-data text-[10.5px] text-[color:var(--graphite)]">
                  {fillCopy(copy.walkthrough.personMeta, {
                    role: c.person.role,
                    free: c.person.free.toFixed(1),
                  })}
                </div>
              </div>
              <FitBandCell fit={c.fit} />
            </div>
            <FitStrip fit={c.fit} candidateName={c.person.name} />
            <div className="font-data text-[10.5px] text-[color:var(--graphite)]">{meta}</div>
            <button
              type="button"
              className="btn-teach pri mt-2"
              onClick={() => onAssign(roleIndex, c.personIndex)}
            >
              {copy.walkthrough.assignToRole}
            </button>
            {assigned[roleIndex] === c.personIndex ? (
              <button
                type="button"
                className="btn-teach mt-2 ml-2"
                onClick={() => onUnassign(roleIndex)}
              >
                {copy.walkthrough.remove}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
