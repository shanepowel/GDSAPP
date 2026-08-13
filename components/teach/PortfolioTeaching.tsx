'use client';

import { useRouter } from 'next/navigation';
import { StatStrip } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export function PortfolioTeaching({
  engagementIds = [],
}: {
  engagementIds?: string[];
}) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const router = useRouter();
  const rows = copy.portfolio.teachingRows;

  return (
    <>
      <StatStrip
        items={[
          {
            label: copy.portfolio.engagements,
            value: String(rows.length),
            note: copy.portfolio.teachingEngagementsNote,
          },
          {
            label: copy.portfolio.rolesBelowDatum,
            value: copy.portfolio.teachingBelow,
            note: copy.portfolio.teachingBelowNote,
          },
          {
            label: copy.portfolio.passFirstTime,
            value: copy.portfolio.teachingPass,
            note: copy.portfolio.passWant,
          },
          {
            label: copy.portfolio.evidenceReady,
            value: copy.portfolio.teachingEvidence,
            note: copy.portfolio.evidenceReadyNote,
          },
        ]}
      />

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.portfolio.engagements}
      </h2>
      <div className="sheet overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>{copy.context.engagement}</th>
              <th>{copy.squads.phase}</th>
              <th>{copy.portfolio.nextGate}</th>
              <th>{copy.portfolio.rolesBelowDatum}</th>
              <th>{copy.portfolio.maturity}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const href = engagementIds[i] ? `/squads/${engagementIds[i]}` : undefined;
              return (
                <tr
                  key={row.name}
                  className={href ? 'clickable' : undefined}
                  tabIndex={href ? 0 : undefined}
                  role={href ? 'link' : undefined}
                  onClick={() => {
                    if (href) router.push(href);
                  }}
                  onKeyDown={(e) => {
                    if (!href) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(href);
                    }
                  }}
                >
                  <td className="font-semibold">{row.name}</td>
                  <td>{row.phase}</td>
                  <td className="num">{row.gate}</td>
                  <td>
                    <span className={`flag${row.risk ? ' flag-risk' : ''}`}>{row.below}</span>
                  </td>
                  <td className="num">{row.maturity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
