'use client';

import { useState, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';
import { DeliveryStatus } from '@/components/library/DeliveryStatus';
import { Button, ButtonLink } from '@/components/library/Button';
import { LifecycleBar } from '@/components/library/LifecycleBar';
import { NextActionCard } from '@/components/library/NextActionCard';
import { Cluster, Stack } from '@/components/library/layout';
import { Panel } from '@/components/library/Panel';
import { Heading, Text } from '@/components/library/type';
import { lifecycleLabels, rowHref, stageLinks, statusLabel } from '@/components/engagement/shared';
import { useI18n } from '@/components/app/LocaleProvider';
import { dayPart } from '@/lib/attention/greeting';
import { nextActionSentence } from '@/lib/attention/sentence';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';

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
    return <Text role="body">{copy.ui.loading}</Text>;
  }

  if (!welcomeDone) {
    const card = copy.spine.welcome[welcomeStep];
    const last = welcomeStep === copy.spine.welcome.length - 1;
    return (
      <Panel padding={4}>
        <Stack gap={3}>
          <Heading level={1}>{card?.title}</Heading>
          <Text>{card?.body}</Text>
          {last ? (
            <Cluster gap={3}>
              <ButtonLink href="/engagements/new" onClick={finishWelcome}>
                {copy.spine.welcomeCreate}
              </ButtonLink>
              <ButtonLink href="/demo" variant="secondary" onClick={finishWelcome}>
                {copy.spine.welcomeDemo}
              </ButtonLink>
            </Cluster>
          ) : (
            <div>
              <Button type="button" onClick={() => setWelcomeStep((step) => step + 1)}>
                {copy.spine.welcomeNext}
              </Button>
            </div>
          )}
        </Stack>
      </Panel>
    );
  }

  return (
    <Stack gap={6} as="section">
      <Stack gap={2}>
        <Heading level={1}>{greeting}</Heading>
        <Text role="body">{subline}</Text>
      </Stack>

      <Stack gap={3} as="section">
        <Heading level={2}>{copy.attention.needsTitle}</Heading>
        {!attentionReady ? <Text role="body">{copy.ui.loading}</Text> : null}
        {attentionReady && rows.length === 0 ? <Text role="body">{copy.attention.clear}</Text> : null}
        {rows.map((row) => (
          <Panel key={row.id} padding={3}>
            <Cluster gap={3}>
              <Text>
                {fillCopy(copy.spine.rows[row.code], {
                  ...row.vars,
                  engagement: row.engagement.name,
                  item: copy.spine.checks[String(row.vars.item) as keyof typeof copy.spine.checks] ?? row.vars.item ?? '',
                })}
              </Text>
              <ButtonLink href={rowHref(row.engagement.id, row.code)} size="sm">
                {copy.spine.rowAction[row.code]}
              </ButtonLink>
            </Cluster>
          </Panel>
        ))}
      </Stack>

      <Stack gap={3} as="section">
        <Heading level={2}>{copy.attention.mineTitle}</Heading>
        {board.isLoading ? <Text role="body">{copy.ui.loading}</Text> : null}
        {board.isError ? <Text role="body">{copy.ui.loadFailed}</Text> : null}
        {board.data && engagements.length === 0 ? (
          <Panel padding={4}>
            <Stack gap={3}>
              <Heading level={3}>{copy.attention.emptyTitle}</Heading>
              <Text role="body">{copy.attention.emptyBody}</Text>
              <Cluster gap={3}>
                <ButtonLink href="/engagements/new">{copy.attention.newEngagement}</ButtonLink>
                <ButtonLink href="/demo" variant="secondary">
                  {copy.attention.exploreDemo}
                </ButtonLink>
              </Cluster>
            </Stack>
          </Panel>
        ) : null}
        {engagements.map((engagement) => (
          <Panel key={engagement.id} padding={4}>
            <Stack gap={3}>
              <Heading level={3}>{engagement.name}</Heading>
              {engagement.client ? <Text role="meta">{engagement.client}</Text> : null}
              {engagement.stage ? (
                <LifecycleBar
                  current={engagement.stage}
                  labels={labels}
                  doneLabel={copy.lifecycle.done}
                  currentLabel={copy.lifecycle.current}
                  ariaLabel={copy.lifecycle.label}
                  links={stageLinks(engagement.id)}
                />
              ) : null}
              <DeliveryStatus status={engagement.status} label={statusLabel(copy, engagement.status)} />
              <NextActionCard
                sentence={nextActionSentence(engagement.attention, copy.nextAction)}
                action={copy.attention.open}
                href={`/squads/${engagement.id}/overview`}
              />
            </Stack>
          </Panel>
        ))}
      </Stack>
    </Stack>
  );
}
