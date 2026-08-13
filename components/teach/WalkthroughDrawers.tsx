'use client';

import { FitBandCell, FitStrip } from '@/components/team-fit/FitStrip';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { type FitBand } from '@/lib/scoring/fit';
import {
  WALKTHROUGH_ROLES,
  fitsForPerson,
  rankedForRole,
  squadHealth,
  type WalkthroughAssignment,
  type WalkthroughPerson,
  type WalkthroughSignal,
} from '@/lib/teach/walkthrough';

function signalLabel(copy: ReturnType<typeof getCopy>, type: WalkthroughSignal['type']): string {
  return copy.signals[type];
}

function bandLabel(copy: ReturnType<typeof getCopy>, band: FitBand): string {
  return copy.fitBands[band];
}

export function WalkthroughPersonPanel({ person }: { person: WalkthroughPerson }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const scored = fitsForPerson(person);
  const top = scored[0];
  const unev = person.signals.length === 0;

  return (
    <>
      <p className="eyebrow">{copy.people.drawerEyebrow}</p>
      <h1 className="mb-2 font-[family-name:var(--font-cond)] text-[22px] font-bold leading-tight">
        {person.name}
      </h1>
      <p className="mb-3.5 font-data text-[10.5px] text-[color:var(--graphite)]">
        {fillCopy(copy.walkthrough.personMeta, {
          role: person.role,
          free: person.free.toFixed(1),
        })}
      </p>
      {top ? (
        <>
          <h2 className="mb-2 mt-4 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
            {fillCopy(copy.people.bestSuitedHeading, { title: top.role.title })}
          </h2>
          <FitStrip fit={top.fit} candidateName={person.name} />
          <p className="font-data text-[10.5px] text-[color:var(--graphite)]">
            {fillCopy(copy.people.overallMeta, {
              comp: top.fit.compositeScore.toFixed(2),
              skill: top.fit.skillScore.toFixed(2),
              evidence: top.fit.rigourMultiplier.toFixed(2),
            })}
          </p>
          <h2 className="mb-2 mt-5 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
            {copy.people.skillsWorking}
          </h2>
          {top.fit.breakdown.skillContributions.map((c) => (
            <div key={c.skillId} className="datum-drawer-row">
              <div>{c.skillId}</div>
              <div className="lvl">
                {fillCopy(copy.people.heldVsNeed, {
                  have: c.heldLevel ? copy.levels[c.heldLevel] : copy.people.notHeld,
                  need: copy.levels[c.requiredLevel],
                })}
              </div>
              <div className="val" style={c.heldLevel ? undefined : { color: 'var(--survey)' }}>
                {c.contribution.toFixed(2)}
              </div>
            </div>
          ))}
        </>
      ) : null}
      <h2 className="mb-2 mt-5 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.people.rigourSignals}
      </h2>
      {unev ? (
        <div className="teach-note">
          <p>{copy.empty.noSignals}</p>
        </div>
      ) : (
        person.signals.map((r) => (
          <div key={`${r.type}-${r.note}`} className="datum-drawer-row">
            <div>
              {signalLabel(copy, r.type)}
              <div className="font-data text-[10.5px] text-[color:var(--graphite)]">{r.note}</div>
            </div>
            <div className="lvl">{copy.signals[r.provenance]}</div>
            <div className="val">{r.value.toFixed(2)}</div>
          </div>
        ))
      )}
      <h2 className="mb-2 mt-5 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.people.fitAcross}
      </h2>
      {scored.map((s) => (
        <div key={s.role.rid} className="datum-drawer-row">
          <div>{s.role.title}</div>
          <div className="lvl">{bandLabel(copy, s.fit.band)}</div>
          <div className="val">{s.fit.compositeScore.toFixed(2)}</div>
        </div>
      ))}
    </>
  );
}

export function WalkthroughRolePanel({
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
  const meta = copy.roles.cards.find((c) => c.id === role.rid);
  const list = rankedForRole(role);

  return (
    <>
      <p className="eyebrow">{copy.walkthrough.roleEyebrow}</p>
      <h1 className="mb-2 font-[family-name:var(--font-cond)] text-[22px] font-bold leading-tight">
        {role.title}
      </h1>
      <p className="mb-3 font-data text-[10.5px] text-[color:var(--graphite)]">
        {fillCopy(copy.walkthrough.roleMeta, {
          fte: role.fte.toFixed(1),
          level: copy.levels[role.min],
          crit: copy.squads.criticalityLabels[role.crit],
        })}
      </p>
      {meta ? <p>{meta.what}</p> : null}
      {meta ? (
        <div className="teach-note">
          <p>
            <b>{copy.roles.withoutLabel}:</b> {meta.without}
          </p>
        </div>
      ) : null}
      <h2 className="mb-2 mt-5 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.walkthrough.roleSkillsHeading}
      </h2>
      {role.skills.map((s) => (
        <div key={s.id} className="datum-drawer-row">
          <div>{s.id}</div>
          <div className="lvl">{copy.levels[s.level]}</div>
          <div className="val">{fillCopy(copy.walkthrough.skillWeight, { weight: s.weight })}</div>
        </div>
      ))}
      <h2 className="mb-3 mt-5 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.walkthrough.rankedHeading}
      </h2>
      {list.map((c) => (
        <RankedCard
          key={c.person.name}
          candidate={c}
          assignedHere={assigned[roleIndex] === c.personIndex}
          onAssign={() => onAssign(roleIndex, c.personIndex)}
          onUnassign={() => onUnassign(roleIndex)}
        />
      ))}
    </>
  );
}

function RankedCard({
  candidate: c,
  assignedHere,
  onAssign,
  onUnassign,
}: {
  candidate: ReturnType<typeof rankedForRole>[number];
  assignedHere: boolean;
  onAssign: () => void;
  onUnassign: () => void;
}) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const unev = c.fit.breakdown.notes.includes('no_rigour_signals');
  const meta = unev
    ? fillCopy(
        c.enoughTime ? copy.walkthrough.candidateMetaUnev : copy.walkthrough.candidateMetaUnevShort,
        { skill: c.fit.skillScore.toFixed(2) },
      )
    : fillCopy(c.enoughTime ? copy.walkthrough.candidateMeta : copy.walkthrough.candidateMetaShort, {
        skill: c.fit.skillScore.toFixed(2),
        evidence: c.fit.rigourMultiplier.toFixed(2),
      });

  return (
    <div
      className="mb-2.5 border border-[color:var(--rule)] px-3.5 py-3"
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
      <button type="button" className="btn-teach pri mt-2" onClick={onAssign}>
        {copy.walkthrough.assignToRole}
      </button>
      {assignedHere ? (
        <button type="button" className="btn-teach mt-2 ml-2" onClick={onUnassign}>
          {copy.walkthrough.remove}
        </button>
      ) : null}
    </div>
  );
}

export function WalkthroughConfirmPanel({ assigned }: { assigned: WalkthroughAssignment }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const health = squadHealth(assigned);

  return (
    <>
      <p className="eyebrow">{copy.walkthrough.confirmedEyebrow}</p>
      <h1 className="mb-2 font-[family-name:var(--font-cond)] text-[22px] font-bold leading-tight">
        {copy.walkthrough.confirmedHeading}
      </h1>
      <p>
        {fillCopy(copy.walkthrough.confirmedTitle, {
          filled: health.filled,
          total: health.total,
          above: health.above,
        })}
      </p>
      <div className="teach-note">
        <p>{copy.walkthrough.confirmedBody}</p>
      </div>
      <div className="teach-note-alert mt-3">
        <p>{copy.walkthrough.confirmedOutstanding}</p>
      </div>
    </>
  );
}
