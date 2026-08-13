'use client';

import Link from 'next/link';
import { EmptyState, InkButton } from '@/components/datum/PageChrome';
import { AssuranceTeaching } from '@/components/teach/AssuranceTeaching';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';

export default function AssuranceIndexPage() {
  const { data, isLoading } = trpc.engagement.list.useQuery();
  const { locale } = useI18n();
  const copy = getCopy(locale);

  function standardLabel(id: string | null) {
    if (id === 'wales') return copy.squads.standardWales;
    if (id === 'gds') return copy.squads.standardGds;
    return id ?? '—';
  }

  return (
    <>
      <AssuranceTeaching />

      {isLoading ? <p className="mt-8 text-[color:var(--graphite)]">{copy.ui.loading}</p> : null}
      {!isLoading && (data?.length ?? 0) === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={copy.empty.noEngagements}
            why={copy.empty.noEngagementsWhy}
            actionHref="/engagements/new"
            actionLabel={copy.ui.createEngagement}
          />
        </div>
      ) : null}
      {!isLoading && (data?.length ?? 0) > 0 ? (
        <>
          <h2 className="mb-3 mt-10 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
            {copy.walkthrough.engagementsHeading}
          </h2>
          <p className="mb-4">
            <InkButton href="/engagements/new">{copy.ui.createEngagement}</InkButton>
          </p>
          <div className="sheet overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>{copy.context.engagement}</th>
                  <th>{copy.squads.phase}</th>
                  <th>{copy.squads.standard}</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link
                        href={`/assurance/${e.id}`}
                        className="font-semibold underline-offset-2 hover:underline"
                      >
                        {e.name}
                      </Link>
                    </td>
                    <td className="num">{e.phase ?? '—'}</td>
                    <td>{standardLabel(e.standardId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </>
  );
}
