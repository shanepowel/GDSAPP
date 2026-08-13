'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { copy } from '@/lib/copy';
import { trpc } from '@/lib/trpc/client';

export default function AssuranceIndexPage() {
  const router = useRouter();
  const { data } = trpc.engagement.list.useQuery();

  useEffect(() => {
    if (data?.[0]?.id) router.replace(`/assurance/${data[0].id}`);
  }, [data, router]);

  if (!data) return <p>Loading…</p>;
  if (data.length === 0) {
    return (
      <>
        <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold">{copy.assurance.title}</h1>
        <p className="mt-2 text-[color:var(--graphite)]">{copy.empty.noEngagements}</p>
      </>
    );
  }
  return <p>Loading…</p>;
}
