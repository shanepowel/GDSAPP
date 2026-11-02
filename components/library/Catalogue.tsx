'use client';

import type { ReactNode } from 'react';
import type { Copy } from '@/lib/copy';
import { fillCopy } from '@/lib/copy';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { Button } from '@/components/library/Button';
import { Field, TextInput } from '@/components/library/Field';
import {
  BUILD_STEPS,
  COMPONENT_GUIDES,
  GDS_PRINCIPLES,
  buildStepsFor,
  principleById,
  type LibraryComponentId,
} from '@/components/library/guides';
import { Cluster, Grid, Inset, Measure, Stack } from '@/components/library/layout';
import { Panel } from '@/components/library/Panel';
import { SPACE_PX, SPACE_STEPS, TYPE_PX, TYPE_ROLES, space, type TypeRole } from '@/components/library/sizing';
import { Heading, Text, roleStyle } from '@/components/library/type';
import { AttentionRow } from '@/components/library/AttentionRow';
import { Badge } from '@/components/library/Badge';
import { Card, CardBody, CardHeader } from '@/components/library/Card';
import { Checklist } from '@/components/library/Checklist';
import { DeliveryStatus } from '@/components/library/DeliveryStatus';
import { EmptyState } from '@/components/library/EmptyState';
import { LifecycleBar } from '@/components/library/LifecycleBar';
import { MeasureTile } from '@/components/library/MeasureTile';
import { NextActionCard } from '@/components/library/NextActionCard';
import { PageHeader } from '@/components/library/PageHeader';
import { Stepper } from '@/components/library/Stepper';
import { Table, TableScroll, Td, Th } from '@/components/library/Table';
import { lifecycleLabels } from '@/components/engagement/shared';

export function Catalogue() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const lib = copy.library;
  const guideLang = locale === 'cy' ? 'en' : undefined;

  return (
    <Stack gap={8}>
      <header>
        <Stack gap={2}>
          <Text role="meta">{copy.practice.eyebrow}</Text>
          <Heading level={1}>{lib.title}</Heading>
          <Measure>
            <Text>{lib.lede}</Text>
          </Measure>
          {locale === 'cy' ? <Text role="label">{lib.englishNote}</Text> : null}
        </Stack>
      </header>

      <section aria-labelledby="design-principles">
        <Stack gap={4}>
          <Stack gap={2}>
            <Heading level={2} id="design-principles">
              {lib.principlesTitle}
            </Heading>
            <Measure>
              <Text>{lib.principlesLede}</Text>
            </Measure>
          </Stack>
          <Stack gap={4}>
            {GDS_PRINCIPLES.map((principle) => (
              <Panel key={principle.id} padding={4}>
                <Stack gap={2}>
                  <Heading level={3}>{locale === 'cy' ? principle.nameCy : principle.name}</Heading>
                  <Stack gap={2} lang={guideLang}>
                    <Text>{principle.statement}</Text>
                    <Text role="label">{lib.applies}</Text>
                    <Text>{principle.assemble}</Text>
                  </Stack>
                  <Text role="meta">{formatPoints(copy, principle.serviceStandard)}</Text>
                </Stack>
              </Panel>
            ))}
          </Stack>
        </Stack>
      </section>

      <section aria-labelledby="sizing-scale">
        <Stack gap={4}>
          <Stack gap={2}>
            <Heading level={2} id="sizing-scale">
              {lib.scaleTitle}
            </Heading>
            <Measure>
              <Text>{lib.scaleLede}</Text>
            </Measure>
          </Stack>
          <Cluster gap={4} align="end">
            {SPACE_STEPS.map((step) => (
              <Stack key={step} gap={2}>
                <div
                  aria-hidden
                  style={{
                    width: space(step),
                    height: 'var(--space-6)',
                    background: 'var(--navy)',
                  }}
                />
                <Text role="meta">{fillCopy(lib.spaceLabel, { px: SPACE_PX[step] })}</Text>
              </Stack>
            ))}
          </Cluster>
        </Stack>
      </section>

      <section aria-labelledby="type-roles">
        <Stack gap={4}>
          <Stack gap={2}>
            <Heading level={2} id="type-roles">
              {lib.typeTitle}
            </Heading>
            <Measure>
              <Text>{lib.typeLede}</Text>
            </Measure>
          </Stack>
          <Stack gap={4}>
            {TYPE_ROLES.map((role) => (
              <Stack key={role} gap={1}>
                <Text role="meta">
                  {fillCopy(lib.typeRole, { role, px: TYPE_PX[role].size })}
                </Text>
                <Text role={role}>{specimen(role, lib)}</Text>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </section>

      <section aria-labelledby="component-guides">
        <Stack gap={6}>
          <Stack gap={2}>
            <Heading level={2} id="component-guides">
              {lib.componentsTitle}
            </Heading>
            <Measure>
              <Text>{lib.componentsLede}</Text>
            </Measure>
          </Stack>
          {COMPONENT_GUIDES.map((guide) => {
            const steps = buildStepsFor(guide.id);
            return (
              <article key={guide.id} aria-labelledby={`component-${guide.id}`}>
                <Stack gap={4}>
                  <Stack gap={1}>
                  <Heading level={3} id={`component-${guide.id}`}>
                    {guide.name}
                  </Heading>
                    <Text role="meta">{formatPoints(copy, guide.serviceStandard)}</Text>
                  </Stack>
                  <Panel padding={4}>
                    <Stack gap={3}>
                      <Text role="label">{lib.example}</Text>
                      <Example id={guide.id} copy={copy} />
                    </Stack>
                  </Panel>
                  <dl style={{ display: 'grid', gap: 'var(--space-3)' }}>
                    <GuideRow term={lib.userNeed} detail={guide.userNeed} lang={guideLang} />
                    <GuideRow term={lib.whenToUse} detail={guide.whenToUse} lang={guideLang} />
                    <GuideRow term={lib.whenNotToUse} detail={guide.whenNotToUse} lang={guideLang} />
                    <GuideRow term={lib.howItWorks} detail={guide.howItWorks} lang={guideLang} />
                    <GuideRow term={lib.sizing} detail={guide.sizing} lang={guideLang} />
                    <GuideRow term={lib.accessibility} detail={guide.accessibility} lang={guideLang} />
                    <GuideRow
                      term={lib.principleLabel}
                      detail={guide.principleIds.map((principleId) => principleById(principleId).name).join(' · ')}
                      lang={guideLang}
                    />
                    <GuideRow term={lib.buildStep} detail="" lang={guideLang}>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {steps.map((step) => (
                          <li key={step.id}>
                            <StepLabel step={step} copy={copy} />
                          </li>
                        ))}
                      </ul>
                    </GuideRow>
                  </dl>
                </Stack>
              </article>
            );
          })}
        </Stack>
      </section>

      <section aria-labelledby="build-order">
        <Stack gap={4}>
          <Stack gap={2}>
            <Heading level={2} id="build-order">
              {lib.buildTitle}
            </Heading>
            <Measure>
              <Text>{lib.buildLede}</Text>
            </Measure>
          </Stack>
          <div className="sheet overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th scope="col">{lib.stepHeading}</th>
                  <th scope="col">{lib.dependsOn}</th>
                  <th scope="col">{lib.principleLabel}</th>
                  <th scope="col">{lib.doneWhen}</th>
                </tr>
              </thead>
              <tbody>
                {BUILD_STEPS.map((step) => (
                  <tr key={step.id}>
                    <th scope="row">
                      <StepLabel step={step} copy={copy} />
                    </th>
                    <td>
                      {step.componentIds.length ? (
                        <span lang="en">
                          {step.componentIds
                            .map((id) => COMPONENT_GUIDES.find((guide) => guide.id === id)?.name)
                            .filter((name): name is string => Boolean(name))
                            .join(', ')}
                        </span>
                      ) : (
                        lib.none
                      )}
                    </td>
                    <td>
                      {step.principleIds
                        .map((id) => {
                          const principle = principleById(id);
                          return locale === 'cy' ? principle.nameCy : principle.name;
                        })
                        .join(' · ')}
                    </td>
                    <td lang={guideLang}>{step.doneWhen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Stack>
      </section>
    </Stack>
  );
}

function GuideRow({
  term,
  detail,
  lang,
  children,
}: {
  term: string;
  detail?: string;
  lang?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <dt style={roleStyle('label', 'var(--ink)')}>{term}</dt>
      <dd lang={children ? undefined : lang} style={roleStyle('body', 'var(--ink)')}>
        {children ?? detail}
      </dd>
    </div>
  );
}

function StepLabel({ step, copy }: { step: { order: number; title: string }; copy: Copy }) {
  return (
    <>
      {fillCopy(copy.library.step, { order: step.order })}{' '}
      <span lang="en">{step.title}</span>
    </>
  );
}

function formatPoints(copy: Copy, points: readonly number[]): string {
  const list = points.join(', ');
  const template = points.length === 1 ? copy.library.standardPoint : copy.library.standardPoints;
  return fillCopy(template, { points: list });
}

function specimen(role: TypeRole, lib: Copy['library']): string {
  switch (role) {
    case 'plate':
    case 'section':
    case 'body':
      return lib.samplePrimary;
    case 'label':
      return lib.sampleSecondary;
    case 'meta':
    case 'ref':
      return lib.sampleMeta;
    case 'index':
      return '—';
    default: {
      const exhaustive: never = role;
      return exhaustive;
    }
  }
}

function Example({ id, copy }: { id: LibraryComponentId; copy: Copy }) {
  const lib = copy.library;
  switch (id) {
    case 'stack':
      return (
        <Stack gap={2}>
          <Text>{lib.samplePrimary}</Text>
          <Text role="label">{lib.sampleSecondary}</Text>
          <Text role="meta">{lib.sampleMeta}</Text>
        </Stack>
      );
    case 'cluster':
      return (
        <Cluster gap={2}>
          <Button>{lib.sampleAction}</Button>
          <Button variant="secondary">{lib.sampleSecondaryAction}</Button>
        </Cluster>
      );
    case 'grid':
      return (
        <Grid columns={2} gap={4}>
          <Panel padding={4}>
            <Text>{lib.samplePrimary}</Text>
          </Panel>
          <Panel padding={4}>
            <Text>{lib.sampleSecondary}</Text>
          </Panel>
        </Grid>
      );
    case 'inset':
      return (
        <div style={{ border: 'var(--rule-w) solid var(--rule)' }}>
          <Inset padding={4}>
            <Text>{lib.samplePrimary}</Text>
          </Inset>
        </div>
      );
    case 'measure':
      return (
        <Measure>
          <Text>{lib.samplePrimary}</Text>
        </Measure>
      );
    case 'heading':
      return <Text role="section">{lib.sampleHeading}</Text>;
    case 'text':
      return (
        <Stack gap={2}>
          <Text>{lib.samplePrimary}</Text>
          <Text role="index">—</Text>
        </Stack>
      );
    case 'button':
      return (
        <Cluster gap={2}>
          <Button>{lib.sampleAction}</Button>
          <Button variant="secondary" size="sm">
            {lib.sampleSecondaryAction}
          </Button>
        </Cluster>
      );
    case 'field':
      return (
        <Stack gap={4}>
          <Field id="catalogue-role" label={lib.exampleLabel} hint={lib.exampleHint}>
            <TextInput name="role" />
          </Field>
          <details>
            <summary style={{ ...roleStyle('label', 'var(--ink)'), cursor: 'pointer', minHeight: 'var(--target-min)' }}>
              {lib.showError}
            </summary>
            <div style={{ paddingTop: 'var(--space-3)' }}>
              <Field id="catalogue-role-error" label={lib.exampleLabel} error={lib.exampleError}>
                <TextInput name="role-error" />
              </Field>
            </div>
          </details>
        </Stack>
      );
    case 'panel':
      return (
        <Panel padding={4}>
          <Stack gap={2}>
            <Text role="section">{lib.sampleHeading}</Text>
            <Text>{lib.samplePrimary}</Text>
          </Stack>
        </Panel>
      );
    case 'skip-link':
      return (
        <span
          style={{
            display: 'inline-block',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--asm-brand)',
            color: 'var(--asm-on-brand)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--type-label-size)',
            fontWeight: 'var(--type-label-weight)',
          }}
        >
          {copy.ui.skipToContent}
        </span>
      );
    case 'card':
      return (
        <Card>
          <CardHeader title={lib.sampleHeading} description={lib.sampleSecondary} />
          <CardBody>
            <Text>{lib.samplePrimary}</Text>
          </CardBody>
        </Card>
      );
    case 'badge':
      return (
        <Cluster gap={2}>
          <Badge tone="warn">{copy.spine.types.risk}</Badge>
          <Badge tone="risk">{copy.spine.types.issue}</Badge>
          <Badge tone="brand">{copy.spine.paymentLinked}</Badge>
        </Cluster>
      );
    case 'delivery-status':
      return (
        <Cluster gap={2}>
          <DeliveryStatus status="on-track" label={copy.status.onTrack} />
          <DeliveryStatus status="at-risk" label={copy.status.atRisk} />
          <DeliveryStatus status="off-track" label={copy.status.offTrack} />
        </Cluster>
      );
    case 'lifecycle-bar':
      return (
        <LifecycleBar
          current="discovery"
          labels={lifecycleLabels(copy)}
          doneLabel={copy.lifecycle.done}
          currentLabel={copy.lifecycle.current}
          ariaLabel={copy.lifecycle.label}
        />
      );
    case 'next-action':
      return <NextActionCard label={copy.spine.nextActionLabel} sentence={lib.samplePrimary} action={lib.sampleAction} href="#" />;
    case 'measure-tile':
      return (
        <Grid columns={2} gap={4}>
          <MeasureTile label={copy.spine.predictability} value="83%" onTarget stateLabel={copy.spine.onTarget} trend={[82, 85, 80, 78, 81, 83]} trendLabel={copy.spine.predictability} />
          <MeasureTile label={copy.spine.teamHealth} value="3.4" onTarget={false} stateLabel={copy.spine.belowTarget} trend={[4.2, 4.1, 4, 3.8, 3.5, 3.4]} trendLabel={copy.spine.teamHealth} />
        </Grid>
      );
    case 'attention-row':
      return (
        <ul className="m-0 list-none rounded-asm-lg border border-asm-line bg-asm-surface p-0">
          <AttentionRow icon="warning" tone="urgent" text={lib.samplePrimary} context={lib.sampleSecondary} cta={lib.sampleAction} href="#" />
        </ul>
      );
    case 'table':
      return (
        <Card>
          <TableScroll minWidth={360}>
            <Table>
              <thead>
                <tr>
                  <Th>{copy.spine.colEngagement}</Th>
                  <Th>{copy.spine.colStatus}</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td>{lib.sampleHeading}</Td>
                  <Td>
                    <DeliveryStatus status="on-track" label={copy.status.onTrack} size="sm" />
                  </Td>
                </tr>
              </tbody>
            </Table>
          </TableScroll>
        </Card>
      );
    case 'tab-nav':
      return (
        <nav aria-label={copy.spine.tabs.label}>
          <ul className="m-0 flex list-none gap-1 border-b border-asm-line-strong p-0">
            {(['overview', 'plan', 'compass'] as const).map((key, index) => (
              <li key={key}>
                <span
                  aria-current={index === 0 ? 'page' : undefined}
                  className={index === 0 ? '-mb-px inline-flex min-h-11 items-center border-b-2 border-asm-brand px-4 font-semibold text-asm-brand' : '-mb-px inline-flex min-h-11 items-center px-4 text-asm-ink-2'}
                >
                  {copy.spine.tabs[key]}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      );
    case 'stepper':
      return <Stepper steps={copy.spine.steps} current={1} label={copy.spine.steps.join(' · ')} />;
    case 'checklist':
      return (
        <Card>
          <Checklist
            items={[
              { id: 'a', title: copy.spine.checks.charter, done: true },
              { id: 'b', title: copy.spine.checks.backlog, done: false, meta: lib.sampleSecondary },
            ]}
          />
        </Card>
      );
    case 'empty-state':
      return <EmptyState title={copy.attention.emptyTitle} body={copy.attention.emptyBody} action={<Button>{lib.sampleAction}</Button>} />;
    case 'page-header':
      return <PageHeader title={lib.sampleHeading} subtitle={lib.samplePrimary} actions={<Button>{lib.sampleAction}</Button>} />;
    default: {
      const exhaustive: never = id;
      return exhaustive;
    }
  }
}
