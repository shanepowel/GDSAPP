'use client';

import Link from 'next/link';
import { StatutoryFlag } from '@/components/product/StatutoryFlag';

export function GapCard({
  engagementId,
  criterionRef,
  title,
  reason,
  move,
  statutory,
}: {
  engagementId: string;
  criterionRef: string;
  title: string;
  reason: string;
  move: string;
  statutory: boolean;
}) {
  return (
    <article
      className="border border-rule bg-stock-0 px-4 py-3"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <Link
          href={`/engagements/${engagementId}/assess/${encodeURIComponent(criterionRef)}`}
          className="font-data text-[12px] font-medium text-signal-ink underline-offset-2 hover:underline"
        >
          {criterionRef}
        </Link>
        <h3 className="text-[15px] font-medium text-ink-0">{title}</h3>
        {statutory && <StatutoryFlag />}
      </div>
      <p className="mt-2 text-[15px] leading-[1.55] text-ink-1">{reason}</p>
      <p className="mt-2 text-[15px] text-ink-0">
        <span className="font-medium">Move: </span>
        {move}
      </p>
      <p className="mt-3">
        <Link
          href={`/engagements/${engagementId}/organise/scenarios`}
          className="text-[13px] font-medium text-signal-ink underline-offset-2 hover:underline"
        >
          Model a fix
        </Link>
      </p>
    </article>
  );
}
