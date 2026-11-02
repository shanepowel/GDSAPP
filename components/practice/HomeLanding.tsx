'use client';

import { useSession } from 'next-auth/react';
import { AttentionHome } from '@/components/home/AttentionHome';
import { ButtonLink } from '@/components/library/Button';
import { Cluster, Grid, Measure, Stack } from '@/components/library/layout';
import { Panel } from '@/components/library/Panel';
import { Heading, Text } from '@/components/library/type';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export function HomeLanding() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const { status } = useSession();

  if (status === 'loading') {
    return <Text role="body">{copy.ui.loading}</Text>;
  }
  if (status === 'authenticated') {
    return <AttentionHome />;
  }
  return <MarketingHome />;
}

function MarketingHome() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const c = copy.home;

  return (
    <Stack gap={8}>
      <Stack gap={4} as="section">
        <p className="eyebrow" style={{ color: 'var(--graphite)' }}>
          {c.eyebrow}
        </p>
        <Measure width="reading">
          <Stack gap={3}>
            <Heading level={1}>{c.headline}</Heading>
            <Text role="body">{c.sub}</Text>
          </Stack>
        </Measure>
        <Cluster gap={3}>
          <ButtonLink href="/demo">{c.primaryCta}</ButtonLink>
          <ButtonLink href="/sign-in" variant="secondary">
            {c.secondaryCta}
          </ButtonLink>
        </Cluster>
      </Stack>

      <Grid columns={3} gap={4}>
        {c.claims.map((claim) => (
          <Panel key={claim.title} padding={4}>
            <Stack gap={2}>
              <Heading level={3}>{claim.title}</Heading>
              <Text role="body">{claim.body}</Text>
            </Stack>
          </Panel>
        ))}
      </Grid>

      <Stack gap={4} as="section">
        <Heading level={2}>{c.how.title}</Heading>
        <ol
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
        >
          {c.how.steps.map((step) => (
            <li key={step.title}>
              <Panel padding={4}>
                <Stack gap={1}>
                  <Heading level={3}>{step.title}</Heading>
                  <Text role="body">{step.body}</Text>
                </Stack>
              </Panel>
            </li>
          ))}
        </ol>
      </Stack>

      <Panel padding={4}>
        <Measure width="reading">
          <Stack gap={2}>
            <Heading level={2}>{c.standards.title}</Heading>
            <Text role="body">{c.standards.body}</Text>
          </Stack>
        </Measure>
      </Panel>

      <Panel padding={4}>
        <Measure width="reading">
          <Stack gap={2}>
            <Heading level={2}>{c.builtOn.title}</Heading>
            <Text role="body">{c.builtOn.body}</Text>
          </Stack>
        </Measure>
      </Panel>

      <Stack gap={3} as="section">
        <Heading level={2}>{c.close.title}</Heading>
        <div>
          <ButtonLink href="/demo">{c.close.cta}</ButtonLink>
        </div>
      </Stack>

      <footer>
        <Text role="meta">{copy.footer.disclaimer}</Text>
      </footer>
    </Stack>
  );
}
