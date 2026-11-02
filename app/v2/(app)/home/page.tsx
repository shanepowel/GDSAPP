import Link from 'next/link';
import { AttentionRow, ButtonLink, Card, CardHeader, EngagementCard, Input, PageHeader } from '@/components/assemble-v2';
import { engagements, myEngagementIds } from '@/lib/assemble-v2/demo-data';
import { nextActionsFor } from '@/lib/assemble-v2/next-action';
import type { NextAction } from '@/lib/assemble-v2/types';

export const metadata = { title: 'Home' };

const iconFor = (a: NextAction) =>
  a.cta.includes('pack') || a.cta.includes('report') ? 'calendar' : a.cta.includes('end date') ? 'people' : a.cta.includes('Assess') || a.cta.includes('Triage') ? 'change' : 'warning';

/** Home answers one question: what needs my attention today? */
export default function HomePage() {
  const mine = engagements.filter((e) => myEngagementIds.includes(e.id));
  const attention = mine
    .flatMap((e) => nextActionsFor(e).filter((a) => a.tone !== 'calm').map((a) => ({ e, a })))
    .sort((x, y) => x.a.priority - y.a.priority)
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Good evening, Shane"
        subtitle={attention.length ? `${attention.length} things need your attention.` : 'Nothing needs your attention right now.'}
        actions={
          <>
            <form role="search" action="/v2/engagements">
              <label htmlFor="q" className="sr-only">Search engagements</label>
              <Input id="q" name="q" type="search" placeholder="Search engagements" className="w-64 max-w-full" />
            </form>
            <ButtonLink href="/v2/engagements/new">New engagement</ButtonLink>
          </>
        }
      />

      <Card aria-labelledby="attention">
        <CardHeader id="attention" title="Needs attention" action={<span className="text-[13px] text-asm-ink-3">Most urgent first</span>} />
        <ul>
          {attention.map(({ e, a }, i) => (
            <AttentionRow key={i} icon={iconFor(a)} tone={a.tone === 'urgent' ? 'urgent' : 'normal'} text={a.text} context={e.name} cta={a.cta} href={a.href} />
          ))}
        </ul>
      </Card>

      <section aria-labelledby="mine" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 id="mine" className="text-lg font-bold text-asm-brand">My engagements</h2>
          <Link href="/v2/engagements" className="text-sm font-semibold text-asm-brand underline-offset-4 hover:underline">View all</Link>
        </div>
        <div className="flex flex-wrap gap-4">
          {mine.map((e) => (
            <EngagementCard key={e.id} engagement={e} />
          ))}
        </div>
      </section>
    </>
  );
}
