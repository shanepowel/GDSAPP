'use client';

import { useState, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AttentionRow } from '@/components/library/AttentionRow';
import { Button, ButtonLink } from '@/components/library/Button';
import { Card, CardHeader } from '@/components/library/Card';
import { DeliveryStatus } from '@/components/library/DeliveryStatus';
import { EmptyState } from '@/components/library/EmptyState';
import { LifecycleBar } from '@/components/library/LifecycleBar';
import { NextActionCard } from '@/components/library/NextActionCard';
import { StatTile } from '@/components/library/StatTile';
import { lifecycleLabels, rowHref, statusLabel } from '@/components/engagement/shared';
import type { AttentionCode } from '@/lib/attention/facts';
import { useI18n } from '@/components/app/LocaleProvider';
import { dayPart } from '@/lib/attention/greeting';
import { nextActionSentence } from '@/lib/attention/sentence';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';

const ROW_ICON: Record<AttentionCode, 'warning' | 'calendar' | 'change' | 'people'> = {
  'off-track': 'warning',
  'at-risk': 'warning',
  'sprint-overdue': 'calendar',
  steering: 'calendar',
  report: 'calendar',
  'survey-health': 'people',
  'survey-pulse': 'people',
  'change-triage': 'change',
  'change-assess': 'change',
};
const URGENT = new Set<AttentionCode>(['off-track', 'at-risk', 'sprint-overdue']);

const WELCOME_KEY = 'assemble-welcome-seen';

function subscribeToNothing() {
  return () => {};
}

function useClientReady() {
  return useSyncExternalStore(subscribeToNothing, () => true, () => false);
}

export function AttentionHome() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const { data: session } = useSession();
  const board = trpc.spine.board.useQuery();
  const clientReady = useClientReady();
  const [welcomeStep, setWelcomeStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const welcomeDone =
    clientReady && (dismissed || window.localStorage.getItem(WELCOME_KEY) === '1');
  const part = dayPart(new Date());
  const firstName = session?.user?.name?.trim().split(/\s+/)[0];
  const named = {
    morning: copy.attention.morningNamed,
    afternoon: copy.attention.afternoonNamed,
    evening: copy.attention.eveningNamed,
  }[part];
  const plain = {
    morning: copy.attention.morning,
    afternoon: copy.attention.afternoon,
    evening: copy.attention.evening,
  }[part];
  const greeting = firstName ? fillCopy(named, { name: firstName }) : plain;
  const labels = lifecycleLabels(copy);
  const engagements = board.data?.engagements ?? [];
  const rows = engagements.flatMap((engagement) =>
    engagement.rows.map((row, index) => ({ ...row, id: `${engagement.id}-${row.code}-${index}`, engagement })),
  );
  const attentionReady = board.isFetched;
  const subline = !attentionReady
    ? copy.ui.loading
    : rows.length === 0
      ? copy.attention.clear
      : rows.length === 1
        ? copy.attention.needsAttentionOne
        : fillCopy(copy.attention.needsAttention, { count: rows.length });

  function finishWelcome() {
    window.localStorage.setItem(WELCOME_KEY, '1');
    setDismissed(true);
  }

  if (!clientReady) {
    return <p className="text-asm-ink-3">{copy.ui.loading}</p>;
  }

  if (!welcomeDone) {
    const card = copy.spine.welcome[welcomeStep];
    const last = welcomeStep === copy.spine.welcome.length - 1;
    return (
      <section className="asm-root mx-auto flex max-w-2xl flex-col gap-5 rounded-asm-lg border border-asm-line bg-asm-surface p-8">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-asm-brand-mid">
          {welcomeStep + 1} / {copy.spine.welcome.length}
        </span>
        <h1 className="m-0 text-[28px] font-bold leading-tight text-asm-brand">{card?.title}</h1>
        <p className="m-0 text-lg text-asm-ink-2">{card?.body}</p>
        {last ? (
          <div className="flex flex-wrap gap-2.5">
            <ButtonLink href="/engagements/new" onClick={finishWelcome}>
              {copy.spine.welcomeCreate}
            </ButtonLink>
            <ButtonLink href="/demo" variant="secondary" onClick={finishWelcome}>
              {copy.spine.welcomeDemo}
            </ButtonLink>
          </div>
        ) : (
          <div>
            <Button type="button" onClick={() => setWelcomeStep((step) => step + 1)}>
              {copy.spine.welcomeNext}
            </Button>
          </div>
        )}
      </section>
    );
  }

  const count = (status: 'on-track' | 'at-risk' | 'off-track') => engagements.filter((item) => item.status === status).length;

  return (
    <section className="asm-root flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[30px] font-bold leading-tight text-asm-brand">{greeting}</h1>
          <p className="m-0 text-base text-asm-ink-3">{subline}</p>
        </div>
        <ButtonLink href="/engagements/new">{copy.attention.newEngagement}</ButtonLink>
      </div>

      {engagements.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label={copy.attention.mineTitle} value={String(engagements.length)} />
          <StatTile label={copy.status.onTrack} value={String(count('on-track'))} />
          <StatTile label={copy.status.atRisk} value={String(count('at-risk'))} tone={count('at-risk') ? 'warn' : 'neutral'} />
          <StatTile label={copy.status.offTrack} value={String(count('off-track'))} tone={count('off-track') ? 'warn' : 'neutral'} />
        </div>
      ) : null}

      <Card aria-labelledby="needs-title">
        <CardHeader id="needs-title" title={copy.attention.needsTitle} description={attentionReady && rows.length ? subline : undefined} />
        {!attentionReady ? <p className="m-0 px-6 py-5 text-asm-ink-3">{copy.ui.loading}</p> : null}
        {attentionReady && rows.length === 0 ? <p className="m-0 px-6 py-5 text-asm-ink-3">{copy.attention.clear}</p> : null}
        {rows.length > 0 ? (
          <ul className="m-0 list-none p-0">
            {rows.map((row) => (
              <AttentionRow
                key={row.id}
                icon={ROW_ICON[row.code]}
                tone={URGENT.has(row.code) ? 'urgent' : 'normal'}
                text={fillCopy(copy.spine.rows[row.code], {
                  ...row.vars,
                  engagement: row.engagement.name,
                  item: copy.spine.checks[String(row.vars.item) as keyof typeof copy.spine.checks] ?? row.vars.item ?? '',
                })}
                context={[row.engagement.name, row.engagement.client].filter(Boolean).join(' · ')}
                cta={copy.spine.rowAction[row.code]}
                href={rowHref(row.engagement.id, row.code)}
              />
            ))}
          </ul>
        ) : null}
      </Card>

      <section aria-labelledby="mine-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="mine-title" className="m-0 text-lg font-bold text-asm-brand">
            {copy.attention.mineTitle}
          </h2>
          <Link href="/squads" className="text-sm font-semibold text-asm-brand">
            {copy.spine.listTitle}
          </Link>
        </div>
        {board.isLoading ? <p className="m-0 text-asm-ink-3">{copy.ui.loading}</p> : null}
        {board.isError ? <p className="m-0 text-asm-ink-3">{copy.ui.loadFailed}</p> : null}
        {board.data && engagements.length === 0 ? (
          <EmptyState
            title={copy.attention.emptyTitle}
            body={copy.attention.emptyBody}
            action={
              <div className="flex flex-wrap gap-2.5">
                <ButtonLink href="/engagements/new">{copy.attention.newEngagement}</ButtonLink>
                <ButtonLink href="/demo" variant="secondary">
                  {copy.attention.exploreDemo}
                </ButtonLink>
              </div>
            }
          />
        ) : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {engagements.map((engagement) => (
            <Link
              key={engagement.id}
              href={`/squads/${engagement.id}/overview`}
              className="group flex flex-col gap-4 rounded-asm-lg border border-asm-line bg-asm-surface p-5 no-underline transition-shadow hover:border-asm-brand-soft hover:shadow-asm-pop"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-base font-bold text-asm-brand group-hover:underline">{engagement.name}</span>
                  {engagement.client ? <span className="text-[13px] text-asm-ink-3">{engagement.client}</span> : null}
                </span>
                <DeliveryStatus status={engagement.status} label={statusLabel(copy, engagement.status)} size="sm" />
              </span>
              {engagement.stage ? (
                <LifecycleBar
                  variant="compact"
                  current={engagement.stage}
                  labels={labels}
                  doneLabel={copy.lifecycle.done}
                  currentLabel={copy.lifecycle.current}
                  ariaLabel={copy.lifecycle.label}
                />
              ) : null}
              <NextActionCard
                emphasis="soft"
                label={copy.spine.nextActionLabel}
                sentence={nextActionSentence(engagement.attention, copy.nextAction)}
                action={copy.attention.open}
                href={`/squads/${engagement.id}/overview`}
              />
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
