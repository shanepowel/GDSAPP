'use client';

import { useMemo, useState } from 'react';
import { Drawer } from '@/components/datum/Drawer';
import { FigureFrame, SquadShapeFigure } from '@/components/teach/figures';
import {
  WalkthroughConfirmPanel,
  WalkthroughRolePanel,
} from '@/components/teach/WalkthroughDrawers';
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
  const [drawerRole, setDrawerRole] = useState<number | null>(null);
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
    setDrawerRole(null);
    setConfirmed(false);
  }

  function unassign(roleIndex: number) {
    setAssigned((current) => {
      const next = { ...current };
      delete next[roleIndex];
      return next;
    });
    setDrawerRole(null);
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
              <th>{copy.walkthrough.assigned}</th>
              <th>{copy.walkthrough.fitAgainstDatum}</th>
              <th className="text-right">{copy.walkthrough.score}</th>
            </tr>
          </thead>
          <tbody>
            {WALKTHROUGH_ROLES.map((role, roleIndex) => {
              const personIndex = assigned[roleIndex];
              const ranked = rankedForRole(role);
              const top = ranked.find((c) => c.enoughTime) ?? ranked[0];
              const meta = fillCopy(copy.walkthrough.roleLine, {
                fte: role.fte.toFixed(1),
                crit: essentialLabel(role.crit),
              });

              if (personIndex === undefined) {
                return (
                  <tr key={role.rid}>
                    <td>
                      <div className="font-semibold">{role.title}</div>
                      <div className="font-data text-[10.5px] text-[color:var(--graphite)]">{meta}</div>
                    </td>
                    <td colSpan={2}>
                      <span className="flag flag-risk">{copy.walkthrough.notFilled}</span>
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
                    <td className="text-right">
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
                        onClick={() => setDrawerRole(roleIndex)}
                      >
                        {copy.walkthrough.seeAll}
                      </button>
                    </td>
                  </tr>
                );
              }

              const person = WALKTHROUGH_PEOPLE[personIndex];
              const fit = fitWalkthrough(role, person);
              return (
                <tr key={role.rid}>
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
                  <td className="text-right">
                    <div className="inline-block text-right">
                      <FitBandCell fit={fit} />
                    </div>
                    <div>
                      <button
                        type="button"
                        className="btn-teach mt-2"
                        onClick={() => setDrawerRole(roleIndex)}
                      >
                        {copy.walkthrough.change}
                      </button>
                    </div>
                  </td>
                </tr>
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
          onClick={() => {
            setDrawerRole(null);
            setConfirmed(true);
          }}
        >
          {copy.walkthrough.confirm}
        </button>
        <button
          type="button"
          className="btn-teach"
          onClick={() => {
            setAssigned({});
            setConfirmed(false);
            setDrawerRole(null);
          }}
        >
          {copy.walkthrough.startAgain}
        </button>
        <p className="m-0 text-[12.5px] text-[color:var(--graphite)]">
          {health.coreGaps > 0 ? copy.walkthrough.coverEssential : copy.walkthrough.confirmHint}
        </p>
      </div>

      <Drawer
        open={drawerRole !== null || confirmed}
        onClose={() => {
          setDrawerRole(null);
          setConfirmed(false);
        }}
      >
        {drawerRole !== null ? (
          <WalkthroughRolePanel
            roleIndex={drawerRole}
            assigned={assigned}
            onAssign={assign}
            onUnassign={unassign}
          />
        ) : null}
        {confirmed ? <WalkthroughConfirmPanel assigned={assigned} /> : null}
      </Drawer>
    </div>
  );
}
