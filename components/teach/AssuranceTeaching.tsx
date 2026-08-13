'use client';

import { PageHeader, StatStrip } from '@/components/datum/PageChrome';
import { TeachPanel } from '@/components/teach/TeachPanel';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';

function statusFlag(status: string): string {
  if (status === 'at-risk') return 'flag flag-risk';
  if (status === 'on-track') return 'flag flag-ok';
  return 'flag';
}

export function AssuranceTeaching() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const points = copy.assurance.teachingPoints;
  const atRisk = points.filter((p) => p.status === 'at-risk').length;

  function statusLabel(status: string): string {
    if (status === 'at-risk') return copy.assurance.atRisk;
    if (status === 'on-track') return copy.assurance.onTrack;
    return copy.assurance.laterPhase;
  }

  return (
    <>
      <PageHeader eyebrow={copy.assurance.eyebrow} title={copy.assurance.title} lede={copy.assurance.lede} />

      <TeachPanel tag={copy.teach.assessment.tag} title={copy.teach.assessment.title}>
        {copy.teach.assessment.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </TeachPanel>

      <StatStrip
        items={[
          {
            label: copy.assurance.preparedness,
            value: copy.assurance.teachingIndex,
            note: copy.assurance.teachingIndexNote,
          },
          {
            label: copy.assurance.pointsAtRisk,
            value: String(atRisk),
            note: fillCopy(copy.assurance.ofTotal, { total: points.length }),
          },
          {
            label: copy.assurance.fixableByAssignment,
            value: copy.assurance.teachingFixable,
            note: copy.assurance.fixableNote,
          },
        ]}
      />

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.squads.standardWales}
      </h2>
      <div className="sheet overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>{copy.assurance.point}</th>
              <th>{copy.assurance.whatItAsks}</th>
              <th>{copy.assurance.status}</th>
              <th>{copy.assurance.why}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.ref}>
                <td className="num">{p.ref}</td>
                <td>{p.title}</td>
                <td>
                  <span className={statusFlag(p.status)}>{statusLabel(p.status)}</span>
                </td>
                <td className="font-data text-[10.5px] text-[color:var(--graphite)]">{p.why || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12.5px] text-[color:var(--graphite)]">{copy.assurance.teachingHint}</p>
    </>
  );
}
