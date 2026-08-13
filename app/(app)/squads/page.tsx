'use client';

import Link from 'next/link';
import { EmptyState, InkButton, PageHeader } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';

export default function SquadsIndexPage() {
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
      <PageHeader
        eyebrow={copy.squads.eyebrow}
        title={copy.squads.indexTitle}
        lede={copy.squads.indexLede}
        actions={<InkButton href="/engagements/new">{copy.ui.createEngagement}</InkButton>}
      />
      {isLoading ? <p className="text-[color:var(--graphite)]">{copy.ui.loading}</p> : null}
      {!isLoading && (data?.length ?? 0) === 0 ? (
        <EmptyState
          title={copy.empty.noEngagements}
          why={copy.empty.noEngagementsWhy}
          actionHref="/engagements/new"
          actionLabel={copy.ui.createEngagement}
        />
      ) : null}
      {!isLoading && (data?.length ?? 0) > 0 ? (
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
                    <Link href={`/squads/${e.id}`} className="font-semibold underline-offset-2 hover:underline">
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
      ) : null}
    </>
  );
}
