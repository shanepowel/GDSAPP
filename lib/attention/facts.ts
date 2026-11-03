/**
 * Turns stored engagement facts into the next-action input.
 * `now` is injected. A missing date does not fire the rule that needs it.
 */

import type { LifecycleStage } from '@/lib/attention/lifecycle';
import {
  nextAction,
  suggestStatus,
  type DeliveryStatus,
  type NextAction,
  type NextActionInput,
} from '@/lib/attention/next-action';

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export interface DatedRef {
  ref: string;
  at: Date;
}

export interface SpineFacts {
  confirmedStatus: DeliveryStatus | null;
  riskLockAt: Date | null;
  hasRecoveryPlan: boolean;
  steeringOn: Date | null;
  packReady: boolean;
  unconfirmedDecisions: number;
  stage: LifecycleStage | null;
  sprintZeroOpen: number;
  sprintZeroBy: Date | null;
  submittedChange: DatedRef | null;
  triagedChange: DatedRef | null;
  exceptionPerson: string | null;
  goLiveOn: Date | null;
  hasAftercare: boolean;
  reportDueOn: Date | null;
  surveyDue: 'health' | 'pulse' | null;
  charterReviewOn: Date | null;
  milestoneName: string | null;
  milestoneOn: Date | null;
  milestoneWillBeMissed: boolean;
  measuresBelowTarget: number;
  overdueSprintItem: string | null;
  /** Omitted when the archetype is unknown, so a missing fact cannot invent At risk. */
  essentialRolesOpen?: number;
  squadConfirmed?: boolean;
}

export type AttentionCode =
  | 'off-track'
  | 'at-risk'
  | 'sprint-overdue'
  | 'report'
  | 'steering'
  | 'change-triage'
  | 'change-assess'
  | 'survey-health'
  | 'survey-pulse';

export interface AttentionRow {
  code: AttentionCode;
  vars: Record<string, string | number>;
}

export function formatUkDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function inFutureWindow(due: Date, now: Date, days: number): boolean {
  const diff = due.getTime() - now.getTime();
  return diff >= 0 && diff <= days * DAY_MS;
}

function inPastWindow(at: Date, now: Date, hours: number): boolean {
  const diff = now.getTime() - at.getTime();
  return diff >= 0 && diff <= hours * HOUR_MS;
}

function olderThan(at: Date, now: Date, days: number): boolean {
  return now.getTime() - at.getTime() > days * DAY_MS;
}

function wholeDaysUntil(due: Date, now: Date): number {
  return Math.max(0, Math.ceil((due.getTime() - now.getTime()) / DAY_MS));
}

export function rolesNeedFilling(facts: SpineFacts): boolean {
  return facts.squadConfirmed === false && (facts.essentialRolesOpen ?? 0) > 0;
}

export function displayStatus(facts: SpineFacts): DeliveryStatus {
  if (facts.confirmedStatus === 'off-track') return 'off-track';
  if (rolesNeedFilling(facts)) return 'at-risk';
  if (facts.confirmedStatus) return facts.confirmedStatus;
  return suggestStatus({
    measuresBelowTarget: facts.measuresBelowTarget,
    milestoneWillBeMissed: facts.milestoneWillBeMissed,
  });
}

export function buildAttentionInput(facts: SpineFacts, now: Date, riskLockHours: number): NextActionInput {
  const input: NextActionInput = {
    status: displayStatus(facts),
    riskLockWithin48Hours: facts.riskLockAt
      ? inPastWindow(facts.riskLockAt, now, riskLockHours)
      : false,
    hasRecoveryPlan: facts.hasRecoveryPlan,
    unconfirmedDecisions: facts.unconfirmedDecisions,
    stage: facts.stage,
    sprintZeroOpen: facts.sprintZeroOpen,
    sprintZeroBy: facts.sprintZeroBy ? formatUkDate(facts.sprintZeroBy) : null,
    exceptionPerson: facts.exceptionPerson,
    hasAftercare: facts.hasAftercare,
    surveyDue: facts.surveyDue,
    milestone: facts.milestoneName,
    milestoneDate: facts.milestoneOn ? formatUkDate(facts.milestoneOn) : null,
    essentialRolesOpen: facts.essentialRolesOpen,
    squadConfirmed: facts.squadConfirmed,
    statusConfirmed: Boolean(facts.confirmedStatus),
  };

  if (facts.steeringOn) {
    input.steeringWithinTwoDays = inFutureWindow(facts.steeringOn, now, 2);
    input.packReady = facts.packReady;
    input.steeringDate = formatUkDate(facts.steeringOn);
  }
  if (facts.submittedChange && olderThan(facts.submittedChange.at, now, 2)) {
    input.submittedChangeRef = facts.submittedChange.ref;
  }
  if (facts.triagedChange && olderThan(facts.triagedChange.at, now, 5)) {
    input.triagedChangeRef = facts.triagedChange.ref;
  }
  if (facts.goLiveOn) {
    input.goLiveWithin30Days = inFutureWindow(facts.goLiveOn, now, 30);
    input.goLiveDate = formatUkDate(facts.goLiveOn);
  }
  if (facts.reportDueOn && inFutureWindow(facts.reportDueOn, now, 3)) {
    input.reportDueSoon = true;
  }
  if (facts.charterReviewOn && facts.charterReviewOn.getTime() < now.getTime()) {
    input.charterReviewOverdue = true;
  }
  return input;
}

export function attentionFor(facts: SpineFacts, now: Date, riskLockHours: number): NextAction {
  return nextAction(buildAttentionInput(facts, now, riskLockHours));
}

export function attentionRows(facts: SpineFacts, now: Date, riskLockHours: number): AttentionRow[] {
  const status = displayStatus(facts);
  const rows: AttentionRow[] = [];
  if (status === 'off-track' && !(facts.riskLockAt && inPastWindow(facts.riskLockAt, now, riskLockHours))) {
    rows.push({ code: 'off-track', vars: {} });
  }
  if (status === 'at-risk' && !facts.hasRecoveryPlan && !rolesNeedFilling(facts)) {
    rows.push({ code: 'at-risk', vars: {} });
  }
  if (facts.overdueSprintItem) {
    rows.push({ code: 'sprint-overdue', vars: { item: facts.overdueSprintItem } });
  }
  if (facts.reportDueOn && inFutureWindow(facts.reportDueOn, now, 3)) {
    rows.push({ code: 'report', vars: { n: wholeDaysUntil(facts.reportDueOn, now) } });
  }
  if (facts.steeringOn && !facts.packReady && inFutureWindow(facts.steeringOn, now, 2)) {
    rows.push({ code: 'steering', vars: { date: formatUkDate(facts.steeringOn) } });
  }
  if (facts.submittedChange && olderThan(facts.submittedChange.at, now, 2)) {
    rows.push({ code: 'change-triage', vars: { ref: facts.submittedChange.ref } });
  }
  if (facts.triagedChange && olderThan(facts.triagedChange.at, now, 5)) {
    rows.push({ code: 'change-assess', vars: { ref: facts.triagedChange.ref } });
  }
  if (facts.surveyDue === 'health') rows.push({ code: 'survey-health', vars: {} });
  if (facts.surveyDue === 'pulse') rows.push({ code: 'survey-pulse', vars: {} });
  return rows;
}
