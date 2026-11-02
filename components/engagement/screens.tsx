'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Button, ButtonLink } from '@/components/library/Button';
import { DeliveryStatus } from '@/components/library/DeliveryStatus';
import { Field, TextInput } from '@/components/library/Field';
import { LifecycleBar } from '@/components/library/LifecycleBar';
import { NextActionCard } from '@/components/library/NextActionCard';
import { Cluster, Grid, Stack } from '@/components/library/layout';
import { Panel } from '@/components/library/Panel';
import { Heading, Text } from '@/components/library/type';
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
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { nextActionSentence } from '@/lib/attention/sentence';
import type { LifecycleStage } from '@/lib/attention/lifecycle';
import { LIFECYCLE_STAGES } from '@/lib/attention/lifecycle';
import { trpc } from '@/lib/trpc/client';

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

export function SpineFrame({ id, children }: { id: string; children: ReactNode }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  return (
    <Stack gap={4}>
      <EngagementTabs id={id} copy={copy} />
      {children}
    </Stack>
  );
}

export function OverviewScreen({ id, created }: { id: string; created: boolean }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const query = trpc.spine.get.useQuery({ id });
  const agree = trpc.spine.agreeCharter.useMutation({ onSuccess: useRefresh(id) });
  const data = query.data;
  if (query.isLoading) return <Text>{copy.ui.loading}</Text>;
  if (!data) return <Text>{copy.ui.loadFailed}</Text>;
  const labels = lifecycleLabels(copy);
  const sentence = nextActionSentence(data.attention, copy.nextAction);
  const risks = data.raid.slice(0, 3);
  return (
    <Stack gap={5}>
      {created ? <Text>{fillCopy(copy.spine.created, { name: data.name })}</Text> : null}
      <Stack gap={2}>
        <Heading level={1}>{data.name}</Heading>
        <Cluster gap={3}>
          {data.client ? <Text role="label">{data.client}</Text> : null}
          <DeliveryStatus status={data.status} label={statusLabel(copy, data.status)} />
          {data.squadLead ? (
            <Text role="meta">
              {copy.spine.squadLead}: {data.squadLead}
            </Text>
          ) : null}
        </Cluster>
      </Stack>
      {data.stage ? (
        <LifecycleBar
          current={data.stage}
          labels={labels}
          doneLabel={copy.lifecycle.done}
          currentLabel={copy.lifecycle.current}
          ariaLabel={copy.lifecycle.label}
          links={stageLinks(id)}
        />
      ) : null}
      <Stack gap={2}>
        <Heading level={2}>{copy.spine.nextActionLabel}</Heading>
        <NextActionCard
          sentence={sentence}
          action={actionLabel(copy, data.attention.code, data.attention.vars.survey)}
          href={actionHref(id, data.attention.code)}
        />
      </Stack>
      <Grid columns={4} gap={3}>
        {(
          [
            ['predictability', copy.spine.predictability, copy.spine.predictabilityTip, data.targets.predictability],
            ['quality', copy.spine.quality, copy.spine.qualityTip, data.targets.quality],
            ['health', copy.spine.teamHealth, copy.spine.healthTip, data.targets.health],
            ['satisfaction', copy.spine.clientSatisfaction, copy.spine.satisfactionTip, data.targets.satisfaction],
          ] as const
        ).map(([key, title, tip, target]) => (
          <Panel key={key} padding={3}>
            <Stack gap={1}>
              <Heading level={3}>{title}</Heading>
              <Text>{copy.spine.missing}</Text>
              <Text role="meta">{fillCopy(tip, { target })}</Text>
            </Stack>
          </Panel>
        ))}
      </Grid>
      <Panel padding={4}>
        <Stack gap={2}>
          <Heading level={2}>{copy.spine.keyDates}</Heading>
          <Text>
            {copy.spine.nextMilestone}:{' '}
            {data.milestone
              ? data.milestoneOn
                ? fillCopy(copy.spine.milestoneWhen, { name: data.milestone, date: showDate(data.milestoneOn) })
                : data.milestone
              : copy.spine.missing}
          </Text>
          <Text>
            {copy.spine.nextSteering}: {data.steeringOn ? showDate(data.steeringOn) : copy.spine.missing}
          </Text>
        </Stack>
      </Panel>
      <Stack gap={2}>
        <Heading level={2}>{copy.spine.topRisks}</Heading>
        {risks.length === 0 ? <Text>{copy.spine.noRisks}</Text> : null}
        {risks.map((item) => (
            <Text key={item.id}>
            {storedTitle(item.title, copy.spine.checks, copy.spine.poRaid)}
            {item.ownerName ? ` · ${item.ownerName}` : ''}
          </Text>
        ))}
        <Link href={`/squads/${id}/decisions`}>{copy.spine.viewDecisions}</Link>
      </Stack>
      <Panel padding={4}>
        <Stack gap={2}>
          <Heading level={2}>{copy.spine.charter}</Heading>
          <Text>{copy.spine.charterSub}</Text>
          {data.charterAgreedOn ? (
            <Text>
              {fillCopy(copy.spine.agreedOn, {
                date: showDate(data.charterAgreedOn),
                review: showDate(data.charterReviewOn),
              })}
            </Text>
          ) : (
            <div>
              <Button type="button" onClick={() => agree.mutate({ engagementId: id })} disabled={agree.isPending}>
                {copy.spine.markAgreed}
              </Button>
            </div>
          )}
        </Stack>
      </Panel>
    </Stack>
  );
}

export function StageScreen({ id, stage }: { id: string; stage: LifecycleStage }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const query = trpc.spine.get.useQuery({ id });
  const refresh = useRefresh(id);
  const toggle = trpc.spine.setChecklist.useMutation({ onSuccess: refresh });
  const move = trpc.spine.moveStage.useMutation({ onSuccess: refresh });
  const [openModal, setOpenModal] = useState(false);
  const data = query.data;
  if (query.isLoading) return <Text>{copy.ui.loading}</Text>;
  if (!data) return <Text>{copy.ui.loadFailed}</Text>;
  const labels = lifecycleLabels(copy);
  const items = data.checklist.filter((item) => item.stage === stage);
  const open = items.filter((item) => !item.done).length;
  const next = LIFECYCLE_STAGES[LIFECYCLE_STAGES.indexOf(stage) + 1];
  return (
    <Stack gap={4}>
      <Heading level={1}>{labels[stage]}</Heading>
      <Text>{copy.spine.stageIntro[stage]}</Text>
      {items.length === 0 ? <Text>{copy.spine.noRisks}</Text> : null}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {items.map((item) => (
          <li key={item.id}>
            <Panel padding={3}>
              <Cluster gap={3}>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(event) =>
                      toggle.mutate({ engagementId: id, itemId: item.id, done: event.target.checked })
                    }
                  />
                  <span>{storedTitle(item.itemKey, copy.spine.checks, copy.spine.poRaid)}</span>
                </label>
                <Link href={`/engagements/${id}/evidence`}>{copy.spine.addEvidence}</Link>
              </Cluster>
            </Panel>
          </li>
        ))}
      </ul>
      {next && items.length > 0 && open === 0 ? (
        <div>
          <Button type="button" onClick={() => move.mutate({ engagementId: id, anyway: false })}>
            {fillCopy(copy.spine.stageMove, { stage: labels[next] })}
          </Button>
        </div>
      ) : null}
      {next && items.length > 0 && open > 0 ? (
        <Stack gap={2}>
          <Text>{fillCopy(copy.spine.stageLeft, { n: open })}</Text>
          <div>
            <Button type="button" variant="secondary" onClick={() => setOpenModal(true)}>
              {copy.spine.moveAnyway}
            </Button>
          </div>
        </Stack>
      ) : null}
      {openModal ? (
        <Panel padding={4}>
          <Stack gap={3}>
            <Heading level={2}>{copy.spine.moveModalTitle}</Heading>
            <Text>{copy.spine.moveModalBody}</Text>
            <Cluster gap={3}>
              <Button
                type="button"
                onClick={() => {
                  setOpenModal(false);
                  move.mutate({ engagementId: id, anyway: true });
                }}
              >
                {copy.spine.moveConfirm}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
                {copy.spine.cancel}
              </Button>
            </Cluster>
          </Stack>
        </Panel>
      ) : null}
    </Stack>
  );
}

export function PlanScreen({ id }: { id: string }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const query = trpc.spine.get.useQuery({ id });
  const refresh = useRefresh(id);
  const add = trpc.spine.addMilestone.useMutation({ onSuccess: refresh });
  const setStatus = trpc.spine.setMilestoneStatus.useMutation({ onSuccess: refresh });
  const [name, setName] = useState('');
  const [dueOn, setDueOn] = useState('');
  const [proves, setProves] = useState('');
  const data = query.data;
  if (query.isLoading) return <Text>{copy.ui.loading}</Text>;
  if (!data) return <Text>{copy.ui.loadFailed}</Text>;
  return (
    <Stack gap={4}>
      <Heading level={1}>{copy.spine.tabs.plan}</Heading>
      {data.milestones.length === 0 ? <Text>{copy.spine.planEmpty}</Text> : null}
      {data.milestones.map((item) => (
        <Panel key={item.id} padding={3}>
          <Stack gap={2}>
            <Heading level={3}>{item.name}</Heading>
            <Text role="meta">
              {item.dueOn ? showDate(item.dueOn) : copy.spine.missing}
              {item.paymentLinked ? ` · ${copy.spine.paymentLinked}` : ''}
            </Text>
            {item.proves ? <Text>{item.proves}</Text> : null}
            <label>
              <span className="sr-only">{copy.spine.itemStatus}</span>
              <select
                value={item.status}
                onChange={(event) =>
                  setStatus.mutate({
                    engagementId: id,
                    milestoneId: item.id,
                    status: event.target.value as 'on-time' | 'at-risk' | 'late' | 'replanned',
                  })
                }
              >
                {(Object.keys(copy.spine.milestoneStatus) as Array<keyof typeof copy.spine.milestoneStatus>).map(
                  (key) => (
                    <option key={key} value={key}>
                      {copy.spine.milestoneStatus[key]}
                    </option>
                  ),
                )}
              </select>
            </label>
          </Stack>
        </Panel>
      ))}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          add.mutate({ engagementId: id, name, dueOn: dueOn || undefined, proves: proves || undefined });
          setName('');
          setDueOn('');
          setProves('');
        }}
      >
        <Stack gap={3}>
          <Field id="milestone-name" label={copy.spine.milestoneName}>
            <TextInput value={name} onChange={(event) => setName(event.target.value)} required />
          </Field>
          <Field id="milestone-date" label={copy.spine.milestoneDate}>
            <TextInput type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)} />
          </Field>
          <Field id="milestone-proves" label={copy.spine.milestoneProves}>
            <TextInput value={proves} onChange={(event) => setProves(event.target.value)} />
          </Field>
          <div>
            <Button type="submit">{copy.spine.addMilestone}</Button>
          </div>
        </Stack>
      </form>
    </Stack>
  );
}

export function CompassScreen({ id }: { id: string }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const query = trpc.spine.get.useQuery({ id });
  const refresh = useRefresh(id);
  const setStatus = trpc.spine.setStatus.useMutation({ onSuccess: refresh });
  const setRecovery = trpc.spine.setRecovery.useMutation({ onSuccess: refresh });
  const book = trpc.spine.bookRiskLock.useMutation({ onSuccess: refresh });
  const notify = trpc.spine.notifyLead.useMutation({ onSuccess: refresh });
  const send = trpc.spine.sendSurvey.useMutation({ onSuccess: refresh });
  const markDue = trpc.spine.markSurveyDue.useMutation({ onSuccess: refresh });
  const saveReport = trpc.spine.saveReport.useMutation({ onSuccess: refresh });
  const setDue = trpc.spine.setReportDue.useMutation({ onSuccess: refresh });
  const [note, setNote] = useState('');
  const [choice, setChoice] = useState<'on-track' | 'at-risk' | 'off-track'>('on-track');
  const [what, setWhat] = useState('');
  const [cause, setCause] = useState('');
  const [actions, setActions] = useState('');
  const [need, setNeed] = useState('');
  const [by, setBy] = useState('');
  const [draft, setDraft] = useState<string | null>(null);
  const [reportDue, setReportDue] = useState('');
  const data = query.data;
  if (query.isLoading) return <Text>{copy.ui.loading}</Text>;
  if (!data) return <Text>{copy.ui.loadFailed}</Text>;
  const statusText = statusLabel(copy, data.status);
  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Heading level={1}>{copy.spine.compassTitle}</Heading>
        <Text>{copy.spine.compassSub}</Text>
        <DeliveryStatus status={data.status} label={statusText} />
      </Stack>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!note.trim()) return;
          setStatus.mutate({ engagementId: id, status: choice, note });
        }}
      >
        <Stack gap={3}>
          {(['on-track', 'at-risk', 'off-track'] as const).map((status) => (
            <label key={status} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="status"
                checked={choice === status}
                onChange={() => setChoice(status)}
              />
              <DeliveryStatus status={status} label={statusLabel(copy, status)} />
            </label>
          ))}
          <Field id="status-why" label={copy.spine.why}>
            <TextInput value={note} onChange={(event) => setNote(event.target.value)} required />
          </Field>
          <div>
            <Button type="submit">{copy.spine.saveStatus}</Button>
          </div>
        </Stack>
      </form>
      {choice === 'at-risk' || data.status === 'at-risk' ? <Text>{copy.spine.recoveryPrompt}</Text> : null}
      {choice === 'off-track' || data.status === 'off-track' ? (
        <Stack gap={2}>
          <Text>{copy.spine.offTrackPrompt}</Text>
          <Cluster gap={3}>
            <Button type="button" onClick={() => book.mutate({ engagementId: id })}>
              {copy.spine.bookRiskLock}
            </Button>
            <Button type="button" variant="secondary" onClick={() => notify.mutate({ engagementId: id })}>
              {copy.spine.notifyLead}
            </Button>
          </Cluster>
          {data.leadNotifiedAt ? <Text>{copy.spine.notified}</Text> : null}
        </Stack>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const plan = [what, cause, actions, need, by].filter(Boolean).join('\n\n');
          if (!plan.trim()) return;
          setRecovery.mutate({ engagementId: id, plan });
        }}
      >
        <Stack gap={3}>
          <Field id="recovery-what" label={copy.spine.recoveryWhat}>
            <TextInput value={what} onChange={(event) => setWhat(event.target.value)} />
          </Field>
          <Field id="recovery-cause" label={copy.spine.recoveryCause}>
            <TextInput value={cause} onChange={(event) => setCause(event.target.value)} />
          </Field>
          <Field id="recovery-actions" label={copy.spine.recoveryActions}>
            <TextInput value={actions} onChange={(event) => setActions(event.target.value)} />
          </Field>
          <Field id="recovery-need" label={copy.spine.recoveryNeed}>
            <TextInput value={need} onChange={(event) => setNeed(event.target.value)} />
          </Field>
          <Field id="recovery-by" label={copy.spine.recoveryBy}>
            <TextInput value={by} onChange={(event) => setBy(event.target.value)} />
          </Field>
          <div>
            <Button type="submit">{copy.spine.saveRecovery}</Button>
          </div>
          {data.recoveryPlan ? <Text>{data.recoveryPlan}</Text> : null}
        </Stack>
      </form>
      <Stack gap={2}>
        <Heading level={2}>{copy.spine.teamHealth}</Heading>
        <Text>{data.surveySentOn ? fillCopy(copy.spine.surveySent, { date: showDate(data.surveySentOn) }) : copy.spine.surveyNone}</Text>
        <Cluster gap={3}>
          <Button type="button" onClick={() => send.mutate({ engagementId: id })}>
            {copy.spine.sendHealth}
          </Button>
          <Button type="button" variant="secondary" onClick={() => markDue.mutate({ engagementId: id, kind: 'health' })}>
            {copy.spine.markHealthDue}
          </Button>
          <Button type="button" variant="secondary" onClick={() => markDue.mutate({ engagementId: id, kind: 'pulse' })}>
            {copy.spine.markPulseDue}
          </Button>
          <Button type="button" variant="secondary" onClick={() => send.mutate({ engagementId: id })}>
            {copy.spine.sendPulse}
          </Button>
        </Cluster>
      </Stack>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (reportDue) setDue.mutate({ engagementId: id, reportDueOn: reportDue });
        }}
      >
        <Stack gap={2}>
          <Field id="report-due" label={copy.spine.reportDue}>
            <TextInput type="date" value={reportDue || data.reportDueOn || ''} onChange={(event) => setReportDue(event.target.value)} />
          </Field>
          <div>
            <Button type="submit">{copy.spine.saveReportDue}</Button>
          </div>
        </Stack>
      </form>
      <Stack gap={2}>
        <Heading level={2}>{copy.spine.reportDraftLabel}</Heading>
        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const lines = [
                fillCopy(copy.spine.reportStatus, { status: statusText }),
                copy.spine.reportMeasures,
                data.milestone
                  ? fillCopy(copy.spine.reportProgress, { milestone: data.milestone })
                  : copy.spine.reportProgressNone,
                data.raid[0]
                  ? fillCopy(copy.spine.reportRisks, {
                      risk: storedTitle(data.raid[0].title, copy.spine.checks, copy.spine.poRaid),
                    })
                  : copy.spine.reportRisksNone,
                fillCopy(copy.spine.reportDecisions, {
                  n: data.decisions.filter((item) => !item.confirmed).length,
                }),
              ];
              setDraft(data.monthlyReportDraft || lines.join('\n\n'));
            }}
          >
            {copy.spine.draftReport}
          </Button>
        </div>
        {draft != null ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveReport.mutate({ engagementId: id, draft, submit: true });
            }}
          >
            <Stack gap={2}>
              <label htmlFor="report-draft">{copy.spine.reportDraftLabel}</label>
              <textarea
                id="report-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={10}
                style={{ width: '100%', border: 'var(--rule-w) solid var(--rule)', borderRadius: 'var(--radius)', padding: 'var(--space-3)' }}
              />
              <div>
                <Button type="submit">{copy.spine.submitReport}</Button>
              </div>
            </Stack>
          </form>
        ) : null}
        {data.monthlyReportSubmittedAt ? <Text>{copy.spine.saved}</Text> : null}
      </Stack>
    </Stack>
  );
}

export function DecisionsScreen({ id }: { id: string }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const query = trpc.spine.get.useQuery({ id });
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
  const [packReady, setPackReady] = useState(false);
  const data = query.data;
  if (query.isLoading) return <Text>{copy.ui.loading}</Text>;
  if (!data) return <Text>{copy.ui.loadFailed}</Text>;
  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Heading level={1}>{copy.spine.raidTitle}</Heading>
        <Text>{copy.spine.raidSub}</Text>
      </Stack>
      {data.raid.map((item) => (
        <Panel key={item.id} padding={3}>
          <Stack gap={1}>
            <Heading level={3}>{storedTitle(item.title, copy.spine.checks, copy.spine.poRaid)}</Heading>
            <Text role="meta">
              {copy.spine.types[item.type as keyof typeof copy.spine.types] ?? item.type}
              {item.ownerName ? ` · ${item.ownerName}` : ''}
              {item.dueOn ? ` · ${showDate(item.dueOn)}` : ''}
            </Text>
            <Text role="meta">{copy.spine.typeHelp[item.type as keyof typeof copy.spine.typeHelp]}</Text>
            {item.action ? <Text>{item.action}</Text> : null}
          </Stack>
        </Panel>
      ))}
      <form
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
        <Stack gap={3}>
          <Field id="raid-type" label={copy.spine.type}>
            <select id="raid-type" value={type} onChange={(event) => setType(event.target.value as typeof type)}>
              {(Object.keys(copy.spine.types) as Array<keyof typeof copy.spine.types>).map((key) => (
                <option key={key} value={key}>
                  {copy.spine.types[key]}
                </option>
              ))}
            </select>
          </Field>
          <Text role="meta">{copy.spine.typeHelp[type]}</Text>
          <Field id="raid-title" label={copy.spine.title}>
            <TextInput value={title} onChange={(event) => setTitle(event.target.value)} required />
          </Field>
          <Field id="raid-owner" label={copy.spine.owner}>
            <TextInput value={owner} onChange={(event) => setOwner(event.target.value)} />
          </Field>
          <Field id="raid-action" label={copy.spine.action}>
            <TextInput value={action} onChange={(event) => setAction(event.target.value)} />
          </Field>
          <Field id="raid-due" label={copy.spine.due}>
            <TextInput type="date" value={due} onChange={(event) => setDue(event.target.value)} />
          </Field>
          <div>
            <Button type="submit">{copy.spine.addItem}</Button>
          </div>
        </Stack>
      </form>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSteering.mutate({ engagementId: id, steeringOn: steeringOn || undefined, packReady });
        }}
      >
        <Stack gap={3}>
          <Heading level={2}>{copy.spine.nextSteering}</Heading>
          <Field id="steering-on" label={copy.spine.steeringDate}>
            <TextInput type="date" value={steeringOn || data.steeringOn || ''} onChange={(event) => setSteeringOn(event.target.value)} />
          </Field>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={packReady} onChange={(event) => setPackReady(event.target.checked)} />
            {copy.spine.packReady}
          </label>
          <div>
            <Button type="submit">{copy.spine.saveSteering}</Button>
          </div>
        </Stack>
      </form>
      <Stack gap={3}>
        <Heading level={2}>{copy.spine.decisionsTitle}</Heading>
        {data.decisions.map((item) => (
          <Panel key={item.id} padding={3}>
            <Stack gap={2}>
              <Heading level={3}>{item.decision}</Heading>
              <Text role="meta">{item.forum}</Text>
              {item.confirmed ? (
                <Text>{copy.spine.confirmed}</Text>
              ) : (
                <div>
                  <Button type="button" onClick={() => confirm.mutate({ engagementId: id, decisionId: item.id })}>
                    {copy.spine.confirm}
                  </Button>
                </div>
              )}
            </Stack>
          </Panel>
        ))}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!decision.trim() || !forum.trim()) return;
            addDecision.mutate({ engagementId: id, forum, decision });
            setDecision('');
          }}
        >
          <Stack gap={3}>
            <Field id="decision-forum" label={copy.spine.forum}>
              <TextInput value={forum} onChange={(event) => setForum(event.target.value)} required />
            </Field>
            <Field id="decision-text" label={copy.spine.decision}>
              <TextInput value={decision} onChange={(event) => setDecision(event.target.value)} required />
            </Field>
            <div>
              <Button type="submit">{copy.spine.addDecision}</Button>
            </div>
          </Stack>
        </form>
      </Stack>
    </Stack>
  );
}

export function ChangeScreen({ id }: { id: string }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const query = trpc.spine.get.useQuery({ id });
  const refresh = useRefresh(id);
  const add = trpc.spine.addChange.useMutation({ onSuccess: refresh });
  const setStatus = trpc.spine.setChangeStatus.useMutation({ onSuccess: refresh });
  const setGoLive = trpc.spine.setGoLive.useMutation({ onSuccess: refresh });
  const setAftercare = trpc.spine.setAftercare.useMutation({ onSuccess: refresh });
  const [description, setDescription] = useState('');
  const [goLive, setGoLiveOn] = useState('');
  const data = query.data;
  if (query.isLoading) return <Text>{copy.ui.loading}</Text>;
  if (!data) return <Text>{copy.ui.loadFailed}</Text>;
  const statusLabelFor = { submitted: copy.spine.submitted, triaged: copy.spine.triaged, assessed: copy.spine.assessed };
  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Heading level={1}>{copy.spine.changeTitle}</Heading>
        <Text>{copy.spine.changeSub}</Text>
      </Stack>
      {data.changes.map((item) => (
        <Panel key={item.id} padding={3}>
          <Stack gap={2}>
            <Heading level={3}>
              {item.ref}
            </Heading>
            <Text>{item.description}</Text>
            <Text role="meta">{statusLabelFor[item.status as keyof typeof statusLabelFor] ?? item.status}</Text>
            <Cluster gap={2}>
              {item.status === 'submitted' ? (
                <Button type="button" size="sm" onClick={() => setStatus.mutate({ engagementId: id, changeId: item.id, status: 'triaged' })}>
                  {copy.spine.markTriaged}
                </Button>
              ) : null}
              {item.status === 'triaged' ? (
                <Button type="button" size="sm" onClick={() => setStatus.mutate({ engagementId: id, changeId: item.id, status: 'assessed' })}>
                  {copy.spine.markAssessed}
                </Button>
              ) : null}
            </Cluster>
          </Stack>
        </Panel>
      ))}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!description.trim()) return;
          add.mutate({ engagementId: id, description });
          setDescription('');
        }}
      >
        <Stack gap={3}>
          <Field id="change-description" label={copy.spine.description}>
            <TextInput value={description} onChange={(event) => setDescription(event.target.value)} required />
          </Field>
          <div>
            <Button type="submit">{copy.spine.addChange}</Button>
          </div>
        </Stack>
      </form>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (goLive) setGoLive.mutate({ engagementId: id, goLiveOn: goLive });
        }}
      >
        <Stack gap={3}>
          <Field id="go-live" label={copy.spine.goLive}>
            <TextInput type="date" value={goLive || data.goLiveOn || ''} onChange={(event) => setGoLiveOn(event.target.value)} />
          </Field>
          <div>
            <Button type="submit">{copy.spine.saveGoLive}</Button>
          </div>
        </Stack>
      </form>
      <Stack gap={2}>
        <Text>{data.hasAftercare ? copy.spine.aftercareReady : copy.spine.aftercareMissing}</Text>
        {data.hasAftercare ? null : (
          <div>
            <Button type="button" onClick={() => setAftercare.mutate({ engagementId: id, ready: true })}>
              {copy.spine.setAftercare}
            </Button>
          </div>
        )}
      </Stack>
    </Stack>
  );
}

export function OpenEngagement({ id }: { id: string }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  return <ButtonLink href={`/squads/${id}/overview`}>{copy.attention.open}</ButtonLink>;
}
