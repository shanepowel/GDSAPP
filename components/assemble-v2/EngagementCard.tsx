import Link from 'next/link';
import type { Engagement } from '@/lib/assemble-v2/types';
import { nextActionFor } from '@/lib/assemble-v2/next-action';
import { StatusPill } from './StatusPill';
import { LifecycleBar } from './LifecycleBar';
import { NextActionCard } from './NextActionCard';

/** Engagement summary card for Home and lists. */
export function EngagementCard({ engagement: e }: { engagement: Engagement }) {
  return (
    <article className="flex min-w-0 flex-1 basis-[300px] flex-col gap-4 rounded-asm-lg border border-asm-line bg-asm-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-bold text-asm-brand">{e.name}</h3>
          <span className="text-[13px] text-asm-ink-3">{e.client}</span>
        </div>
        <StatusPill status={e.status} size="sm" />
      </div>
      <LifecycleBar stage={e.stage} progressLabel={e.stageProgressLabel} variant="compact" />
      <NextActionCard action={nextActionFor(e)} emphasis="soft" />
      <Link href={`/v2/engagements/${e.id}`} className="w-fit text-sm font-semibold text-asm-brand underline-offset-4 hover:underline">
        Open engagement<span className="sr-only">: {e.name}</span>
      </Link>
    </article>
  );
}
