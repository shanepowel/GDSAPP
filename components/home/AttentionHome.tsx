'use client';

import { useSession } from 'next-auth/react';
import { DeliveryStatus } from '@/components/library/DeliveryStatus';
import { ButtonLink } from '@/components/library/Button';
import { LifecycleBar } from '@/components/library/LifecycleBar';
import { NextActionCard } from '@/components/library/NextActionCard';
import { Cluster, Stack } from '@/components/library/layout';
import { Panel } from '@/components/library/Panel';
import { Heading, Text } from '@/components/library/type';
import { useI18n } from '@/components/app/LocaleProvider';
import { dayPart } from '@/lib/attention/greeting';
import { lifecycleStageForPhase, type LifecycleStage } from '@/lib/attention/lifecycle';
import { nextAction, suggestStatus, type DeliveryStatus as Status } from '@/lib/attention/next-action';
import { nextActionSentence } from '@/lib/attention/sentence';
import { fillCopy, type Copy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';

function lifecycleLabels(copy: Copy): Record<LifecycleStage, string> {
  return {
    shape: copy.lifecycle.shape,
    'sprint-zero': copy.lifecycle.sprintZero,
    discovery: copy.lifecycle.discovery,
    alpha: copy.lifecycle.alpha,
    beta: copy.lifecycle.beta,
    live: copy.lifecycle.live,
    operate: copy.lifecycle.operate,
  };
}

function statusLabel(copy: Copy, status: Status): string {
  if (status === 'at-risk') return copy.status.atRisk;
  if (status === 'off-track') return copy.status.offTrack;
  return copy.status.onTrack;
}

export function AttentionHome() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const { data: session } = useSession();
  const list = trpc.engagement.list.useQuery();
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

  return (
    <Stack gap={6} as="section">
      <Stack gap={2}>
        <Heading level={1}>{greeting}</Heading>
        <Text role="body">{copy.attention.clear}</Text>
      </Stack>

      <Stack gap={3} as="section">
        <Heading level={2}>{copy.attention.needsTitle}</Heading>
        <Text role="body">{copy.attention.clear}</Text>
      </Stack>

      <Stack gap={3} as="section">
        <Heading level={2}>{copy.attention.mineTitle}</Heading>
        {list.isLoading ? <Text role="body">{copy.ui.loading}</Text> : null}
        {list.isError ? (
          <Text role="body">{copy.ui.loadFailed}</Text>
        ) : null}
        {list.data && list.data.length === 0 ? (
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
        {list.data && list.data.length > 0 ? (
          <Stack gap={4}>
            {list.data.map((engagement) => {
              const stage = lifecycleStageForPhase(engagement.phase);
              const status = suggestStatus({
                measuresBelowTarget: 0,
                milestoneWillBeMissed: false,
              });
              const sentence = nextActionSentence(nextAction({}), copy.nextAction);
              return (
                <Panel key={engagement.id} padding={4}>
                  <Stack gap={3}>
                    <Heading level={3}>{engagement.name}</Heading>
                    {stage ? (
                      <LifecycleBar
                        current={stage}
                        labels={labels}
                        doneLabel={copy.lifecycle.done}
                        currentLabel={copy.lifecycle.current}
                        ariaLabel={copy.lifecycle.label}
                      />
                    ) : null}
                    <DeliveryStatus status={status} label={statusLabel(copy, status)} />
                    <NextActionCard
                      sentence={sentence}
                      action={copy.attention.open}
                      href={`/squads/${engagement.id}`}
                    />
                  </Stack>
                </Panel>
              );
            })}
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  );
}
