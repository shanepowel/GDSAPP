'use client';

import Link from 'next/link';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Badge } from '@/components/library/Badge';
import { Button, ButtonLink } from '@/components/library/Button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/library/Card';
import { Checklist } from '@/components/library/Checklist';
import { DeliveryStatus } from '@/components/library/DeliveryStatus';
import { EmptyState } from '@/components/library/EmptyState';
import { Field, SelectInput, TextArea, TextInput } from '@/components/library/Field';
import { LifecycleBar } from '@/components/library/LifecycleBar';
import { MeasureTile } from '@/components/library/MeasureTile';
import { NextActionCard } from '@/components/library/NextActionCard';
import { ProgressBar } from '@/components/library/ProgressBar';
import { Table, TableScroll, Td, Th } from '@/components/library/Table';
import {
  EngagementTabs,
  actionHref,
  actionLabel,
  lifecycleLabels,
  showDate,
  stageLinks,
  statusLabel,
} from '@/components/engagement/shared';
import { useI18n } from '@/components/app/LocaleProvider';
import type { Copy } from '@/lib/copy';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { nextActionSentence } from '@/lib/attention/sentence';
import type { LifecycleStage } from '@/lib/attention/lifecycle';
import { LIFECYCLE_STAGES } from '@/lib/attention/lifecycle';
import { trpc } from '@/lib/trpc/client';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/lib/trpc/root';

type Spine = inferRouterOutputs<AppRouter>['spine']['get'];
type DeliveryStatusValue = 'on-track' | 'at-risk' | 'off-track';
type MeasureKey = 'predictability' | 'quality' | 'health' | 'satisfaction';

function storedTitle(title: string, checks: Record<string, string>, poRaid: string): string {
  if (title === 'po-days') return poRaid;
  if (title.startsWith('check:')) return checks[title.slice('check:'.length)] ?? title;
  return checks[title] ?? title;
}

function useRefresh(id: string) {
  const utils = trpc.useUtils();
  return async () => {
    await Promise.all([utils.spine.get.invalidate({ id }), utils.spine.board.invalidate()]);
  };
}

function useSpine(id: string) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const query = trpc.spine.get.useQuery({ id });
  return { copy, query, data: query.data };
}

function Loading({ copy, failed }: { copy: Copy; failed: boolean }) {
  return <p className="text-asm-ink-3">{failed ? copy.ui.loadFailed : copy.ui.loading}</p>;
}

/** A form section inside a card: fields stacked, one primary action at the bottom. */
function FormCard({
  title,
  description,
  onSubmit,
  submit,
  pending,
  children,
}: {
  title: string;
  description?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submit: string;
  pending?: boolean;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <form onSubmit={onSubmit}>
        <CardBody className="flex flex-col gap-4">{children}</CardBody>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {submit}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function measureTiles(copy: Copy, data: Spine) {
  const rows: Array<[MeasureKey, string, string, string, (v: number) => string]> = [
    ['predictability', copy.spine.predictability, copy.spine.predictabilityTip, data.targets.predictability, (v) => `${Math.round(v)}%`],
    ['quality', copy.spine.quality, copy.spine.qualityTip, data.targets.quality, (v) => `${v.toFixed(1)}%`],
    ['health', copy.spine.teamHealth, copy.spine.healthTip, data.targets.health, (v) => v.toFixed(1)],
    ['satisfaction', copy.spine.clientSatisfaction, copy.spine.satisfactionTip, data.targets.satisfaction, (v) => v.toFixed(1)],
  ];
  return rows.map(([key, label, tip, target, format]) => {
    const reading = data.measures[key];
    return (
      <MeasureTile
        key={key}
        label={label}
        value={reading.latest == null ? copy.spine.missing : format(reading.latest)}
        onTarget={reading.onTarget}
        stateLabel={reading.onTarget ? copy.spine.onTarget : copy.spine.belowTarget}
        trend={reading.trend}
        trendLabel={fillCopy(copy.spine.trendLabel, { measure: label, n: reading.trend.length })}
        footnote={reading.latest == null ? copy.spine.noMeasures : fillCopy(tip, { target })}
        lowerIsBetter={key === 'quality'}
      />
    );
  });
}

/** Report line for the Compass readings, or the "none recorded" line when there are none. */
function reportMeasures(copy: Copy, data: Spine): string {
  const m = data.measures;
  if ([m.predictability, m.quality, m.health, m.satisfaction].every((item) => item.latest == null)) {
    return copy.spine.reportMeasures;
  }
  const show = (value: number | null, format: (v: number) => string) => (value == null ? copy.spine.missing : format(value));
  return fillCopy(copy.spine.reportMeasuresLine, {
    predictability: show(m.predictability.latest, (v) => `${Math.round(v)}%`),
    quality: show(m.quality.latest, (v) => `${v.toFixed(1)}%`),
    health: show(m.health.latest, (v) => v.toFixed(1)),
    satisfaction: show(m.satisfaction.latest, (v) => v.toFixed(1)),
  });
}

/** Engagement header, lifecycle and tabs. Shared by every engagement screen. */
export function SpineFrame({ id, children }: { id: string; children: ReactNode }) {
  const { copy, data } = useSpine(id);
  return (
    <div className="asm-root flex flex-col gap-6">
      {data ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              {data.client ? <span className="text-sm font-semibold text-asm-ink-3">{data.client}</span> : null}
              <h1 className="m-0 text-[30px] font-bold leading-tight text-asm-brand">{data.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-asm-ink-3">
                <DeliveryStatus status={data.status} label={statusLabel(copy, data.status)} />
                {data.squadLead ? (
                  <span>
                    {copy.spine.squadLead}: <span className="font-semibold text-asm-ink-2">{data.squadLead}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          {data.stage ? (
            <LifecycleBar
              current={data.stage}
              labels={lifecycleLabels(copy)}
              doneLabel={copy.lifecycle.done}
              currentLabel={copy.lifecycle.current}
              ariaLabel={copy.lifecycle.label}
              links={stageLinks(id)}
            />
          ) : null}
        </div>
      ) : null}
      <EngagementTabs id={id} copy={copy} />
      {children}
    </div>
  );
}

export function OverviewScreen({ id, created }: { id: string; created: boolean }) {
  const { copy, query, data } = useSpine(id);
  const agree = trpc.spine.agreeCharter.useMutation({ onSuccess: useRefresh(id) });
  if (!data) return <Loading copy={copy} failed={!query.isLoading} />;
  const sentence = nextActionSentence(data.attention, copy.nextAction);
  const risks = data.raid.slice(0, 3);
  return (
    <div className="flex flex-col gap-6">
      {created ? (
        <p role="status" className="m-0 rounded-asm bg-asm-ok-wash px-4 py-3 font-semibold text-asm-ok-ink">
          {fillCopy(copy.spine.created, { name: data.name })}
        </p>
      ) : null}
      <NextActionCard
        label={copy.spine.nextActionLabel}
        sentence={sentence}
        action={actionLabel(copy, data.attention.code, data.attention.vars.survey)}
        href={actionHref(id, data.attention.code)}
      />
      <section aria-labelledby="compass-heading" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="compass-heading" className="m-0 text-lg font-bold text-asm-brand">
            {copy.spine.compassTitle}
          </h2>
          <Link href={`/squads/${id}/compass`} className="text-sm font-semibold text-asm-brand">
            {copy.spine.tabs.compass}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{measureTiles(copy, data)}</div>
      </section>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={copy.spine.keyDates} />
          <CardBody className="p-0">
            <dl className="m-0">
              {(
                [
                  [
                    copy.spine.nextMilestone,
                    data.milestone
                      ? data.milestoneOn
                        ? fillCopy(copy.spine.milestoneWhen, { name: data.milestone, date: showDate(data.milestoneOn) })
                        : data.milestone
                      : copy.spine.missing,
                  ],
                  [copy.spine.nextSteering, data.steeringOn ? showDate(data.steeringOn) : copy.spine.missing],
                  [copy.spine.goLive, data.goLiveOn ? showDate(data.goLiveOn) : copy.spine.missing],
                ] as const
              ).map(([term, value]) => (
                <div key={term} className="flex flex-wrap justify-between gap-2 border-b border-asm-line-soft px-6 py-3.5 last:border-b-0">
                  <dt className="text-sm text-asm-ink-3">{term}</dt>
                  <dd className="m-0 text-sm font-semibold text-asm-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title={copy.spine.topRisks}
            action={
              <Link href={`/squads/${id}/decisions`} className="text-sm font-semibold text-asm-brand">
                {copy.spine.viewDecisions}
              </Link>
            }
          />
          {risks.length === 0 ? (
            <CardBody>
              <p className="m-0 text-sm text-asm-ink-3">{copy.spine.noRisks}</p>
            </CardBody>
          ) : (
            <ul className="m-0 list-none p-0">
              {risks.map((item) => (
                <li key={item.id} className="flex flex-col gap-1 border-b border-asm-line-soft px-6 py-3.5 last:border-b-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge tone={item.type === 'issue' ? 'warn' : 'neutral'}>
                      {copy.spine.types[item.type as keyof typeof copy.spine.types] ?? item.type}
                    </Badge>
                    <span className="text-[15px] font-semibold text-asm-ink">
                      {storedTitle(item.title, copy.spine.checks, copy.spine.poRaid)}
                    </span>
                  </span>
                  {item.ownerName || item.dueOn ? (
                    <span className="text-[13px] text-asm-ink-3">
                      {[item.ownerName, item.dueOn ? showDate(item.dueOn) : null].filter(Boolean).join(' · ')}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <Card>
        <CardHeader title={copy.spine.charter} description={copy.spine.charterSub} />
        <CardFooter>
          {data.charterAgreedOn ? (
            <span className="text-asm-ink-2">
              {fillCopy(copy.spine.agreedOn, {
                date: showDate(data.charterAgreedOn),
                review: showDate(data.charterReviewOn),
              })}
            </span>
          ) : (
            <Button type="button" onClick={() => agree.mutate({ engagementId: id })} disabled={agree.isPending}>
              {copy.spine.markAgreed}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export function StageScreen({ id, stage }: { id: string; stage: LifecycleStage }) {
  const { copy, query, data } = useSpine(id);
  const refresh = useRefresh(id);
  const toggle = trpc.spine.setChecklist.useMutation({ onSuccess: refresh });
  const move = trpc.spine.moveStage.useMutation({ onSuccess: refresh });
  const [confirming, setConfirming] = useState(false);
  if (!data) return <Loading copy={copy} failed={!query.isLoading} />;
  const labels = lifecycleLabels(copy);
  const items = data.checklist.filter((item) => item.stage === stage);
  const done = items.filter((item) => item.done).length;
  const open = items.length - done;
  const next = LIFECYCLE_STAGES[LIFECYCLE_STAGES.indexOf(stage) + 1];
  const progress = fillCopy(copy.spine.stageProgress, { done, total: items.length });
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="m-0 text-2xl font-bold text-asm-brand">{labels[stage]}</h2>
        <p className="m-0 text-asm-ink-3">{copy.spine.stageIntro[stage]}</p>
      </div>
      <Card>
        <CardHeader
          title={copy.spine.stageChecklist}
          description={items.length ? progress : undefined}
          action={
            <ButtonLink href={`/engagements/${id}/evidence`} variant="secondary" size="sm">
              {copy.spine.addEvidence}
            </ButtonLink>
          }
        />
        {items.length ? <ProgressBar value={(done / items.length) * 100} label={progress} className="mx-6 mt-4" /> : null}
        {items.length === 0 ? (
          <CardBody>
            <p className="m-0 text-sm text-asm-ink-3">{copy.spine.noRisks}</p>
          </CardBody>
        ) : (
          <Checklist
            className="mt-2"
            disabled={toggle.isPending}
            items={items.map((item) => ({
              id: item.id,
              title: item.itemKey in copy.spine.checks ? storedTitle(item.itemKey, copy.spine.checks, copy.spine.poRaid) : item.title,
              done: item.done,
              meta: [item.ownerName, item.dueOn ? showDate(item.dueOn) : null].filter(Boolean).join(' · ') || undefined,
            }))}
            onToggle={(itemId, value) => toggle.mutate({ engagementId: id, itemId, done: value })}
          />
        )}
        {next && items.length > 0 ? (
          <CardFooter>
            <span className="text-asm-ink-2">
              {open > 0 ? fillCopy(copy.spine.stageLeft, { n: open }) : progress}
            </span>
            {open === 0 ? (
              <Button type="button" onClick={() => move.mutate({ engagementId: id, anyway: false })} disabled={move.isPending}>
                {fillCopy(copy.spine.stageMove, { stage: labels[next] })}
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setConfirming(true)}>
                {copy.spine.moveAnyway}
              </Button>
            )}
          </CardFooter>
        ) : null}
      </Card>
      {confirming ? (
        <section role="alertdialog" aria-labelledby="move-title" className="flex flex-col gap-3 rounded-asm-lg border border-asm-warn-line bg-asm-warn-wash-2 p-6">
          <h2 id="move-title" className="m-0 text-lg font-bold text-asm-warn-ink">
            {copy.spine.moveModalTitle}
          </h2>
          <p className="m-0 text-asm-ink-2">{copy.spine.moveModalBody}</p>
          <div className="flex flex-wrap gap-2.5">
            <Button
              type="button"
              onClick={() => {
                setConfirming(false);
                move.mutate({ engagementId: id, anyway: true });
              }}
            >
              {copy.spine.moveConfirm}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirming(false)}>
              {copy.spine.cancel}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

const MILESTONE_TONE = { 'on-time': 'ok', 'at-risk': 'warn', late: 'risk', replanned: 'neutral' } as const;

export function PlanScreen({ id }: { id: string }) {
  const { copy, query, data } = useSpine(id);
  const refresh = useRefresh(id);
  const add = trpc.spine.addMilestone.useMutation({ onSuccess: refresh });
  const setStatus = trpc.spine.setMilestoneStatus.useMutation({ onSuccess: refresh });
  const [name, setName] = useState('');
  const [dueOn, setDueOn] = useState('');
  const [proves, setProves] = useState('');
  if (!data) return <Loading copy={copy} failed={!query.isLoading} />;
  const statusKeys = Object.keys(copy.spine.milestoneStatus) as Array<keyof typeof copy.spine.milestoneStatus>;
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title={copy.spine.milestones} />
        {data.milestones.length === 0 ? (
          <CardBody>
            <EmptyState title={copy.spine.milestones} body={copy.spine.planEmpty} />
          </CardBody>
        ) : (
          <TableScroll minWidth={680}>
            <Table>
              <thead>
                <tr>
                  <Th>{copy.spine.milestoneCol}</Th>
                  <Th>{copy.spine.milestoneDate}</Th>
                  <Th>{copy.spine.provesCol}</Th>
                  <Th>{copy.spine.itemStatus}</Th>
                </tr>
              </thead>
              <tbody>
                {data.milestones.map((item) => {
                  const status = (item.status in MILESTONE_TONE ? item.status : 'on-time') as keyof typeof MILESTONE_TONE;
                  return (
                    <tr key={item.id}>
                      <Td>
                        <span className="flex flex-col gap-1">
                          <span className="font-semibold">{item.name}</span>
                          {item.paymentLinked ? <Badge tone="brand">{copy.spine.paymentLinked}</Badge> : null}
                        </span>
                      </Td>
                      <Td className="whitespace-nowrap">{item.dueOn ? showDate(item.dueOn) : copy.spine.missing}</Td>
                      <Td className="text-asm-ink-2">{item.proves || copy.spine.missing}</Td>
                      <Td>
                        <span className="flex flex-col items-start gap-2">
                          <Badge tone={MILESTONE_TONE[status]}>{copy.spine.milestoneStatus[status]}</Badge>
                          <label className="sr-only" htmlFor={`ms-${item.id}`}>
                            {copy.spine.itemStatus}: {item.name}
                          </label>
                          <SelectInput
                            id={`ms-${item.id}`}
                            className="w-auto py-1.5 text-sm"
                            value={status}
                            onChange={(event) =>
                              setStatus.mutate({
                                engagementId: id,
                                milestoneId: item.id,
                                status: event.target.value as keyof typeof MILESTONE_TONE,
                              })
                            }
                          >
                            {statusKeys.map((key) => (
                              <option key={key} value={key}>
                                {copy.spine.milestoneStatus[key]}
                              </option>
                            ))}
                          </SelectInput>
                        </span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableScroll>
        )}
      </Card>
      <FormCard
        title={copy.spine.addMilestoneTitle}
        submit={copy.spine.addMilestone}
        pending={add.isPending}
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          add.mutate({ engagementId: id, name, dueOn: dueOn || undefined, proves: proves || undefined });
          setName('');
          setDueOn('');
          setProves('');
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
          <Field id="milestone-name" label={copy.spine.milestoneName}>
            <TextInput value={name} onChange={(event) => setName(event.target.value)} required />
          </Field>
          <Field id="milestone-date" label={copy.spine.milestoneDate}>
            <TextInput type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)} />
          </Field>
        </div>
        <Field id="milestone-proves" label={copy.spine.milestoneProves}>
          <TextInput value={proves} onChange={(event) => setProves(event.target.value)} />
        </Field>
      </FormCard>
    </div>
  );
}

export function CompassScreen({ id }: { id: string }) {
  const { copy, query, data } = useSpine(id);
  const refresh = useRefresh(id);
  const setStatus = trpc.spine.setStatus.useMutation({ onSuccess: refresh });
  const setRecovery = trpc.spine.setRecovery.useMutation({ onSuccess: refresh });
  const book = trpc.spine.bookRiskLock.useMutation({ onSuccess: refresh });
  const notify = trpc.spine.notifyLead.useMutation({ onSuccess: refresh });
  const send = trpc.spine.sendSurvey.useMutation({ onSuccess: refresh });
  const markDue = trpc.spine.markSurveyDue.useMutation({ onSuccess: refresh });
  const saveReport = trpc.spine.saveReport.useMutation({ onSuccess: refresh });
  const setDue = trpc.spine.setReportDue.useMutation({ onSuccess: refresh });
  const record = trpc.spine.recordMeasures.useMutation({ onSuccess: refresh });
  const [note, setNote] = useState('');
  const [choice, setChoice] = useState<DeliveryStatusValue | null>(null);
  const [what, setWhat] = useState('');
  const [cause, setCause] = useState('');
  const [actions, setActions] = useState('');
  const [need, setNeed] = useState('');
  const [by, setBy] = useState('');
  const [draft, setDraft] = useState<string | null>(null);
  const [reportDue, setReportDue] = useState('');
  const [readings, setReadings] = useState({ predictability: '', quality: '', teamHealth: '', clientSatisfaction: '' });
  if (!data) return <Loading copy={copy} failed={!query.isLoading} />;
  const statusText = statusLabel(copy, data.status);
  const selected = choice ?? data.status;
  const num = (value: string) => (value.trim() === '' ? undefined : Number(value));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="m-0 text-2xl font-bold text-asm-brand">{copy.spine.compassTitle}</h2>
        <p className="m-0 text-asm-ink-3">{copy.spine.compassSub}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{measureTiles(copy, data)}</div>

      <FormCard
        title={copy.spine.recordTitle}
        description={copy.spine.recordSub}
        submit={copy.spine.saveReadings}
        pending={record.isPending}
        onSubmit={(event) => {
          event.preventDefault();
          record.mutate({
            engagementId: id,
            predictability: num(readings.predictability),
            quality: num(readings.quality),
            teamHealth: num(readings.teamHealth),
            clientSatisfaction: num(readings.clientSatisfaction),
          });
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(
            [
              ['predictability', copy.spine.recordPredictability, 0, 100, 1],
              ['quality', copy.spine.recordQuality, 0, 100, 0.1],
              ['teamHealth', copy.spine.recordHealth, 1, 5, 0.1],
              ['clientSatisfaction', copy.spine.recordSatisfaction, 1, 5, 0.1],
            ] as const
          ).map(([key, label, min, max, step]) => (
            <Field key={key} id={`reading-${key}`} label={label}>
              <TextInput
                type="number"
                inputMode="decimal"
                min={min}
                max={max}
                step={step}
                value={readings[key]}
                onChange={(event) => setReadings((current) => ({ ...current, [key]: event.target.value }))}
              />
            </Field>
          ))}
        </div>
      </FormCard>

      <FormCard
        title={copy.spine.statusTitle}
        submit={copy.spine.saveStatus}
        pending={setStatus.isPending}
        onSubmit={(event) => {
          event.preventDefault();
          if (!note.trim()) return;
          setStatus.mutate({ engagementId: id, status: selected, note });
        }}
      >
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="sr-only">{copy.spine.statusTitle}</legend>
          <div className="flex flex-wrap gap-2">
            {(['on-track', 'at-risk', 'off-track'] as const).map((status) => (
              <label
                key={status}
                className={
                  selected === status
                    ? 'flex cursor-pointer items-center gap-2 rounded-asm border border-asm-brand bg-asm-brand-wash px-3 py-2'
                    : 'flex cursor-pointer items-center gap-2 rounded-asm border border-asm-line-strong px-3 py-2'
                }
              >
                <input
                  type="radio"
                  name="status"
                  className="accent-asm-brand"
                  checked={selected === status}
                  onChange={() => setChoice(status)}
                />
                <DeliveryStatus status={status} label={statusLabel(copy, status)} size="sm" />
              </label>
            ))}
          </div>
        </fieldset>
        <Field id="status-why" label={copy.spine.why}>
          <TextInput value={note} onChange={(event) => setNote(event.target.value)} required />
        </Field>
        {data.deliveryStatusNote ? <p className="m-0 text-sm text-asm-ink-3">{data.deliveryStatusNote}</p> : null}
      </FormCard>

      {selected === 'off-track' ? (
        <section role="alert" className="flex flex-col gap-3 rounded-asm-lg border border-asm-risk bg-asm-risk-wash p-6">
          <p className="m-0 font-semibold text-asm-risk-ink">{copy.spine.offTrackPrompt}</p>
          <div className="flex flex-wrap gap-2.5">
            <Button type="button" onClick={() => book.mutate({ engagementId: id })} disabled={book.isPending}>
              {copy.spine.bookRiskLock}
            </Button>
            <Button type="button" variant="secondary" onClick={() => notify.mutate({ engagementId: id })} disabled={notify.isPending}>
              {copy.spine.notifyLead}
            </Button>
          </div>
          {data.leadNotifiedAt ? <p className="m-0 text-sm text-asm-ink-2">{copy.spine.notified}</p> : null}
        </section>
      ) : null}

      {selected !== 'on-track' || data.recoveryPlan ? (
        <FormCard
          title={copy.spine.recoveryTitle}
          description={copy.spine.recoveryPrompt}
          submit={copy.spine.saveRecovery}
          pending={setRecovery.isPending}
          onSubmit={(event) => {
            event.preventDefault();
            const plan = [what, cause, actions, need, by].filter(Boolean).join('\n\n');
            if (!plan.trim()) return;
            setRecovery.mutate({ engagementId: id, plan });
          }}
        >
          {data.recoveryPlan ? (
            <p className="m-0 whitespace-pre-line rounded-asm bg-asm-canvas px-4 py-3 text-sm text-asm-ink-2">{data.recoveryPlan}</p>
          ) : null}
          <Field id="recovery-what" label={copy.spine.recoveryWhat}>
            <TextArea rows={2} value={what} onChange={(event) => setWhat(event.target.value)} />
          </Field>
          <Field id="recovery-cause" label={copy.spine.recoveryCause}>
            <TextArea rows={2} value={cause} onChange={(event) => setCause(event.target.value)} />
          </Field>
          <Field id="recovery-actions" label={copy.spine.recoveryActions}>
            <TextArea rows={3} value={actions} onChange={(event) => setActions(event.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field id="recovery-need" label={copy.spine.recoveryNeed}>
              <TextInput value={need} onChange={(event) => setNeed(event.target.value)} />
            </Field>
            <Field id="recovery-by" label={copy.spine.recoveryBy}>
              <TextInput value={by} onChange={(event) => setBy(event.target.value)} />
            </Field>
          </div>
        </FormCard>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={copy.spine.surveysTitle}
            description={data.surveySentOn ? fillCopy(copy.spine.surveySent, { date: showDate(data.surveySentOn) }) : copy.spine.surveyNone}
          />
          <CardBody className="flex flex-wrap gap-2.5">
            <Button type="button" onClick={() => send.mutate({ engagementId: id })} disabled={send.isPending}>
              {copy.spine.sendHealth}
            </Button>
            <Button type="button" variant="secondary" onClick={() => send.mutate({ engagementId: id })} disabled={send.isPending}>
              {copy.spine.sendPulse}
            </Button>
          </CardBody>
          <CardFooter>
            <Button type="button" variant="tertiary" size="sm" onClick={() => markDue.mutate({ engagementId: id, kind: 'health' })}>
              {copy.spine.markHealthDue}
            </Button>
            <Button type="button" variant="tertiary" size="sm" onClick={() => markDue.mutate({ engagementId: id, kind: 'pulse' })}>
              {copy.spine.markPulseDue}
            </Button>
          </CardFooter>
        </Card>
        <FormCard
          title={copy.spine.reportDue}
          submit={copy.spine.saveReportDue}
          pending={setDue.isPending}
          onSubmit={(event) => {
            event.preventDefault();
            if (reportDue) setDue.mutate({ engagementId: id, reportDueOn: reportDue });
          }}
        >
          <Field id="report-due" label={copy.spine.reportDue}>
            <TextInput type="date" value={reportDue || data.reportDueOn || ''} onChange={(event) => setReportDue(event.target.value)} />
          </Field>
        </FormCard>
      </div>

      <Card>
        <CardHeader
          title={copy.spine.reportTitle}
          description={data.monthlyReportSubmittedAt ? copy.spine.saved : undefined}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                const lines = [
                  fillCopy(copy.spine.reportStatus, { status: statusText }),
                  reportMeasures(copy, data),
                  data.milestone ? fillCopy(copy.spine.reportProgress, { milestone: data.milestone }) : copy.spine.reportProgressNone,
                  data.raid[0]
                    ? fillCopy(copy.spine.reportRisks, { risk: storedTitle(data.raid[0].title, copy.spine.checks, copy.spine.poRaid) })
                    : copy.spine.reportRisksNone,
                  fillCopy(copy.spine.reportDecisions, { n: data.decisions.filter((item) => !item.confirmed).length }),
                ];
                setDraft(data.monthlyReportDraft || lines.join('\n\n'));
              }}
            >
              {copy.spine.draftReport}
            </Button>
          }
        />
        {draft != null ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveReport.mutate({ engagementId: id, draft, submit: true });
            }}
          >
            <CardBody>
              <Field id="report-draft" label={copy.spine.reportDraftLabel}>
                <TextArea rows={10} value={draft} onChange={(event) => setDraft(event.target.value)} />
              </Field>
            </CardBody>
            <CardFooter>
              <Button type="submit" disabled={saveReport.isPending}>
                {copy.spine.submitReport}
              </Button>
            </CardFooter>
          </form>
        ) : null}
      </Card>
    </div>
  );
}

const RAID_TONE = { risk: 'warn', issue: 'risk', assumption: 'neutral', dependency: 'brand' } as const;

export function DecisionsScreen({ id }: { id: string }) {
  const { copy, query, data } = useSpine(id);
  const refresh = useRefresh(id);
  const addRaid = trpc.spine.addRaid.useMutation({ onSuccess: refresh });
  const addDecision = trpc.spine.addDecision.useMutation({ onSuccess: refresh });
  const confirm = trpc.spine.confirmDecision.useMutation({ onSuccess: refresh });
  const setSteering = trpc.spine.setSteering.useMutation({ onSuccess: refresh });
  const [type, setType] = useState<'risk' | 'assumption' | 'issue' | 'dependency'>('risk');
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [action, setAction] = useState('');
  const [due, setDue] = useState('');
  const [forum, setForum] = useState('');
  const [decision, setDecision] = useState('');
  const [steeringOn, setSteeringOn] = useState('');
  const [packReady, setPackReady] = useState<boolean | null>(null);
  if (!data) return <Loading copy={copy} failed={!query.isLoading} />;
  const typeKeys = Object.keys(copy.spine.types) as Array<keyof typeof copy.spine.types>;
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader title={copy.spine.raidTitle} description={copy.spine.raidSub} />
          {data.raid.length === 0 ? (
            <CardBody>
              <p className="m-0 text-sm text-asm-ink-3">{copy.spine.noRisks}</p>
            </CardBody>
          ) : (
            <TableScroll minWidth={620}>
              <Table>
                <thead>
                  <tr>
                    <Th>{copy.spine.type}</Th>
                    <Th>{copy.spine.title}</Th>
                    <Th>{copy.spine.owner}</Th>
                    <Th>{copy.spine.due}</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.raid.map((item) => {
                    const key = (item.type in RAID_TONE ? item.type : 'risk') as keyof typeof RAID_TONE;
                    return (
                      <tr key={item.id}>
                        <Td>
                          <Badge tone={RAID_TONE[key]} title={copy.spine.typeHelp[key]}>
                            {copy.spine.types[key]}
                          </Badge>
                        </Td>
                        <Td>
                          <span className="flex flex-col gap-1">
                            <span className="font-semibold">{storedTitle(item.title, copy.spine.checks, copy.spine.poRaid)}</span>
                            {item.action ? <span className="text-[13px] text-asm-ink-3">{item.action}</span> : null}
                          </span>
                        </Td>
                        <Td className="text-asm-ink-2">{item.ownerName || copy.spine.missing}</Td>
                        <Td className="whitespace-nowrap text-asm-ink-2">{item.dueOn ? showDate(item.dueOn) : copy.spine.missing}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </Card>
        <FormCard
          title={copy.spine.governanceCard}
          submit={copy.spine.saveSteering}
          pending={setSteering.isPending}
          onSubmit={(event) => {
            event.preventDefault();
            setSteering.mutate({
              engagementId: id,
              steeringOn: steeringOn || undefined,
              packReady: packReady ?? data.steeringPackReady,
            });
          }}
        >
          <Field id="steering-on" label={copy.spine.steeringDate}>
            <TextInput type="date" value={steeringOn || data.steeringOn || ''} onChange={(event) => setSteeringOn(event.target.value)} />
          </Field>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-asm-ink">
            <input
              type="checkbox"
              className="size-[18px] accent-asm-brand"
              checked={packReady ?? data.steeringPackReady}
              onChange={(event) => setPackReady(event.target.checked)}
            />
            {copy.spine.packReady}
          </label>
        </FormCard>
      </div>

      <FormCard
        title={copy.spine.addRaidTitle}
        description={copy.spine.typeHelp[type]}
        submit={copy.spine.addItem}
        pending={addRaid.isPending}
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          addRaid.mutate({
            engagementId: id,
            type,
            title,
            ownerName: owner || undefined,
            action: action || undefined,
            dueOn: due || undefined,
          });
          setTitle('');
          setAction('');
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_3fr]">
          <Field id="raid-type" label={copy.spine.type}>
            <SelectInput value={type} onChange={(event) => setType(event.target.value as typeof type)}>
              {typeKeys.map((key) => (
                <option key={key} value={key}>
                  {copy.spine.types[key]}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field id="raid-title" label={copy.spine.title}>
            <TextInput value={title} onChange={(event) => setTitle(event.target.value)} required />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr_1fr]">
          <Field id="raid-owner" label={copy.spine.owner}>
            <TextInput value={owner} onChange={(event) => setOwner(event.target.value)} />
          </Field>
          <Field id="raid-action" label={copy.spine.action}>
            <TextInput value={action} onChange={(event) => setAction(event.target.value)} />
          </Field>
          <Field id="raid-due" label={copy.spine.due}>
            <TextInput type="date" value={due} onChange={(event) => setDue(event.target.value)} />
          </Field>
        </div>
      </FormCard>

      <Card>
        <CardHeader title={copy.spine.decisionsTitle} />
        {data.decisions.length === 0 ? (
          <CardBody>
            <p className="m-0 text-sm text-asm-ink-3">{copy.spine.noRisks}</p>
          </CardBody>
        ) : (
          <ul className="m-0 list-none p-0">
            {data.decisions.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-asm-line-soft px-6 py-4 last:border-b-0">
                <span className="flex min-w-0 flex-[1_1_360px] flex-col gap-1">
                  <span className="text-[15px] font-semibold text-asm-ink">{item.decision}</span>
                  <span className="text-[13px] text-asm-ink-3">
                    {[item.forum, item.ownerName, item.decidedOn ? showDate(item.decidedOn) : null].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {item.confirmed ? (
                  <Badge tone="ok">{copy.spine.confirmed}</Badge>
                ) : (
                  <Button type="button" size="sm" onClick={() => confirm.mutate({ engagementId: id, decisionId: item.id })} disabled={confirm.isPending}>
                    {copy.spine.confirm}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!decision.trim() || !forum.trim()) return;
            addDecision.mutate({ engagementId: id, forum, decision });
            setDecision('');
          }}
        >
          <CardFooter className="items-end bg-asm-canvas py-5">
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-[1fr_2fr]">
              <Field id="decision-forum" label={copy.spine.forum}>
                <TextInput value={forum} onChange={(event) => setForum(event.target.value)} required />
              </Field>
              <Field id="decision-text" label={copy.spine.decision}>
                <TextInput value={decision} onChange={(event) => setDecision(event.target.value)} required />
              </Field>
            </div>
            <Button type="submit" disabled={addDecision.isPending}>
              {copy.spine.addDecision}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

const CHANGE_TONE = { submitted: 'warn', triaged: 'brand', assessed: 'ok' } as const;

export function ChangeScreen({ id }: { id: string }) {
  const { copy, query, data } = useSpine(id);
  const refresh = useRefresh(id);
  const add = trpc.spine.addChange.useMutation({ onSuccess: refresh });
  const setStatus = trpc.spine.setChangeStatus.useMutation({ onSuccess: refresh });
  const setGoLive = trpc.spine.setGoLive.useMutation({ onSuccess: refresh });
  const setAftercare = trpc.spine.setAftercare.useMutation({ onSuccess: refresh });
  const [description, setDescription] = useState('');
  const [goLive, setGoLiveOn] = useState('');
  if (!data) return <Loading copy={copy} failed={!query.isLoading} />;
  const statusLabelFor = { submitted: copy.spine.submitted, triaged: copy.spine.triaged, assessed: copy.spine.assessed };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="m-0 text-2xl font-bold text-asm-brand">{copy.spine.changeTitle}</h2>
        <p className="m-0 text-asm-ink-3">{copy.spine.changeSub}</p>
      </div>
      <Card>
        <CardHeader title={copy.spine.changeTitle} />
        {data.changes.length === 0 ? (
          <CardBody>
            <p className="m-0 text-sm text-asm-ink-3">{copy.spine.noRisks}</p>
          </CardBody>
        ) : (
          <ul className="m-0 list-none p-0">
            {data.changes.map((item) => {
              const status = (item.status in CHANGE_TONE ? item.status : 'submitted') as keyof typeof CHANGE_TONE;
              return (
                <li key={item.id} className="flex flex-wrap items-center gap-4 border-b border-asm-line-soft px-6 py-4 last:border-b-0">
                  <span className="w-20 flex-none font-mono text-sm font-semibold text-asm-brand">{item.ref}</span>
                  <span className="min-w-0 flex-[1_1_320px] text-[15px] text-asm-ink">{item.description}</span>
                  <Badge tone={CHANGE_TONE[status]}>{statusLabelFor[status]}</Badge>
                  {status === 'submitted' ? (
                    <Button type="button" size="sm" variant="secondary" onClick={() => setStatus.mutate({ engagementId: id, changeId: item.id, status: 'triaged' })}>
                      {copy.spine.markTriaged}
                    </Button>
                  ) : null}
                  {status === 'triaged' ? (
                    <Button type="button" size="sm" variant="secondary" onClick={() => setStatus.mutate({ engagementId: id, changeId: item.id, status: 'assessed' })}>
                      {copy.spine.markAssessed}
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormCard
          title={copy.spine.addChangeTitle}
          submit={copy.spine.addChange}
          pending={add.isPending}
          onSubmit={(event) => {
            event.preventDefault();
            if (!description.trim()) return;
            add.mutate({ engagementId: id, description });
            setDescription('');
          }}
        >
          <Field id="change-description" label={copy.spine.description}>
            <TextArea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} required />
          </Field>
        </FormCard>
        <FormCard
          title={copy.spine.aftercareTitle}
          description={data.hasAftercare ? copy.spine.aftercareReady : copy.spine.aftercareMissing}
          submit={copy.spine.saveGoLive}
          pending={setGoLive.isPending}
          onSubmit={(event) => {
            event.preventDefault();
            if (goLive) setGoLive.mutate({ engagementId: id, goLiveOn: goLive });
          }}
        >
          <Field id="go-live" label={copy.spine.goLive}>
            <TextInput type="date" value={goLive || data.goLiveOn || ''} onChange={(event) => setGoLiveOn(event.target.value)} />
          </Field>
          {data.hasAftercare ? (
            <Badge tone="ok" className="self-start">
              {copy.spine.aftercareReady}
            </Badge>
          ) : (
            <Button type="button" variant="secondary" className="self-start" onClick={() => setAftercare.mutate({ engagementId: id, ready: true })}>
              {copy.spine.setAftercare}
            </Button>
          )}
        </FormCard>
      </div>
    </div>
  );
}

export function OpenEngagement({ id }: { id: string }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  return <ButtonLink href={`/squads/${id}/overview`}>{copy.attention.open}</ButtonLink>;
}
