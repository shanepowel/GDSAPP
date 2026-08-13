'use client';

import { PageHeader, TextLink } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';
import dynamic from 'next/dynamic';

const OrgChart = dynamic(() => import('@/components/org-design/OrgChart'), {
  ssr: false,
});

export default function PeopleGraphPage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const { data } = trpc.orgDesign.graph.useQuery();

  return (
    <>
      <PageHeader
        eyebrow={copy.people.eyebrow}
        title={copy.people.title}
        lede={copy.people.graphHint}
        actions={<TextLink href="/people">{copy.people.viewAsTable}</TextLink>}
      />
      {data ? (
        <OrgChart
          entities={data.entities}
          relationships={data.relationships}
          onEntitySelect={() => {}}
          selectedEntity={null}
          height={560}
        />
      ) : (
        <p className="text-[color:var(--graphite)]">{copy.ui.loading}</p>
      )}
    </>
  );
}
