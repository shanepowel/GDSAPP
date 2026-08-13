'use client';

import { PageHeader } from '@/components/datum/PageChrome';
import { TeachPanel } from '@/components/teach/TeachPanel';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { WALKTHROUGH_ROLES } from '@/lib/teach/walkthrough';

export default function RolesPage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const cards = copy.roles.cards;

  return (
    <>
      <PageHeader eyebrow={copy.roles.eyebrow} title={copy.roles.title} lede={copy.roles.lede} />

      <TeachPanel tag={copy.teach.rolesHowToRead.tag} title={copy.teach.rolesHowToRead.title}>
        {copy.teach.rolesHowToRead.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </TeachPanel>

      <div className="role-cards">
        {cards.map((r) => (
          <article key={r.id} className="role-card">
            <h3 className="font-[family-name:var(--font-cond)] text-sm font-semibold">{r.title}</h3>
            <p className="font-data text-[10.5px] text-[color:var(--graphite)]">{r.group}</p>
            <p className="mt-2">{r.what}</p>
            <p className="role-why">
              <b>{copy.roles.withoutLabel}:</b> {r.without}
            </p>
            <p className="role-why">
              <b>{copy.roles.mistakenLabel}:</b> {r.not}
            </p>
          </article>
        ))}
      </div>

      <h2 className="mb-3 mt-10 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.roles.discoveryTitle}
      </h2>
      <div className="sheet overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>{copy.roles.colRole}</th>
              <th>{copy.roles.colHowMuch}</th>
              <th>{copy.roles.colEssential}</th>
              <th>{copy.roles.colIfLeftOut}</th>
            </tr>
          </thead>
          <tbody>
            {WALKTHROUGH_ROLES.map((role) => {
              const card = cards.find((c) => c.id === role.rid);
              const essential = copy.squads.criticalityLabels[role.crit];
              return (
                <tr key={role.rid}>
                  <td className="font-semibold">{role.title}</td>
                  <td className="num">{role.fte.toFixed(1)} FTE</td>
                  <td>
                    <span className={`flag ${role.crit === 'core' ? 'flag-risk' : ''}`}>{essential}</span>
                  </td>
                  <td className="text-[color:var(--graphite)]">{card?.without ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
