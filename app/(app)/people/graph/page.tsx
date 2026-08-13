'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { copy } from '@/lib/copy';
import { trpc } from '@/lib/trpc/client';

const OrgChart = dynamic(() => import('@/components/org-design/OrgChart'), {
  ssr: false,
});

export default function PeopleGraphPage() {
  const { data } = trpc.orgDesign.graph.useQuery();

  return (
    <>
      <p className="mb-4">
        <Link href="/people" className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em]">
          {copy.people.viewAsTable}
        </Link>
      </p>
      <p className="eyebrow mb-2 text-[color:var(--graphite)]">{copy.people.eyebrow}</p>
      <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold">{copy.people.title}</h1>
      <p className="mt-2 mb-6 max-w-[62ch] text-[color:var(--graphite)]">{copy.people.graphHint}</p>
      {data ? (
        <OrgChart
          entities={data.entities}
          relationships={data.relationships}
          onEntitySelect={() => {}}
          selectedEntity={null}
          height={560}
        />
      ) : (
        <p>Loading…</p>
      )}
    </>
  );
}
