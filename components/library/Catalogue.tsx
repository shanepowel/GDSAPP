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
            background: 'var(--navy)',
            color: 'var(--on-navy)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--type-label-size)',
            fontWeight: 'var(--type-label-weight)',
          }}
        >
          {copy.ui.skipToContent}
        </span>
      );
    default: {
      const exhaustive: never = id;
      return exhaustive;
    }
  }
}
