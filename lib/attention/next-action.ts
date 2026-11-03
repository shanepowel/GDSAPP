/**
 * Next action and delivery status.
 * Pure. The first matching rule wins. Missing facts do not fire a rule.
 */

import type { LifecycleStage } from '@/lib/attention/lifecycle';

export type DeliveryStatus = 'on-track' | 'at-risk' | 'off-track';

export type NextActionCode =
  | 'risk-lock'
  | 'recovery'
  | 'steering-pack'
  | 'confirm-decisions'
  | 'sprint-zero'
  | 'triage-change'
  | 'assess-change'
  | 'keel-end'
  | 'aftercare'
  | 'monthly-report'
  | 'survey'
  | 'charter-review'
  | 'fill-roles'
  | 'on-track';

export interface NextActionInput {
  status?: DeliveryStatus | null;
  riskLockWithin48Hours?: boolean;
  hasRecoveryPlan?: boolean;
  steeringWithinTwoDays?: boolean;
  packReady?: boolean;
  steeringDate?: string | null;
  unconfirmedDecisions?: number;
  stage?: LifecycleStage | null;
  sprintZeroOpen?: number;
  sprintZeroBy?: string | null;
  submittedChangeRef?: string | null;
  triagedChangeRef?: string | null;
  exceptionPerson?: string | null;
  goLiveWithin30Days?: boolean;
  hasAftercare?: boolean;
  goLiveDate?: string | null;
  reportDueSoon?: boolean;
  surveyDue?: 'health' | 'pulse' | null;
  charterReviewOverdue?: boolean;
  milestone?: string | null;
  milestoneDate?: string | null;
  /** Set only when the archetype's essential roles are known. */
  essentialRolesOpen?: number;
  /** False only when we know the squad has not been confirmed. */
  squadConfirmed?: boolean;
  /** True when a person has confirmed the delivery status. */
  statusConfirmed?: boolean;
}

export interface NextAction {
  code: NextActionCode;
  priority: number;
  vars: Record<string, string | number>;
}

const RULES: ReadonlyArray<{
  priority: number;
  code: NextActionCode;
  when: (input: NextActionInput) => boolean;
  vars: (input: NextActionInput) => Record<string, string | number>;
}> = [
  {
    priority: 1,
    code: 'risk-lock',
    when: (input) => input.status === 'off-track' && input.riskLockWithin48Hours === false,
    vars: () => ({}),
  },
  {
    priority: 2,
    code: 'fill-roles',
    when: (input) => input.squadConfirmed === false && (input.essentialRolesOpen ?? 0) > 0,
    vars: (input) => ({ n: input.essentialRolesOpen ?? 0 }),
  },
  {
    priority: 3,
    code: 'recovery',
    when: (input) => input.status === 'at-risk' && input.hasRecoveryPlan === false,
    vars: () => ({}),
  },
  {
    priority: 3,
    code: 'steering-pack',
    when: (input) => input.steeringWithinTwoDays === true && input.packReady === false,
    vars: (input) => ({ date: input.steeringDate ?? '' }),
  },
  {
    priority: 4,
    code: 'confirm-decisions',
    when: (input) => (input.unconfirmedDecisions ?? 0) > 0,
    vars: (input) => ({ n: input.unconfirmedDecisions ?? 0 }),
  },
  {
    priority: 5,
    code: 'sprint-zero',
    when: (input) => input.stage === 'sprint-zero' && (input.sprintZeroOpen ?? 0) > 0,
    vars: (input) => ({ n: input.sprintZeroOpen ?? 0, date: input.sprintZeroBy ?? '' }),
  },
  {
    priority: 6,
    code: 'triage-change',
    when: (input) => Boolean(input.submittedChangeRef),
    vars: (input) => ({ ref: input.submittedChangeRef ?? '' }),
  },
  {
    priority: 7,
    code: 'assess-change',
    when: (input) => Boolean(input.triagedChangeRef),
    vars: (input) => ({ ref: input.triagedChangeRef ?? '' }),
  },
  {
    priority: 8,
    code: 'keel-end',
    when: (input) => Boolean(input.exceptionPerson),
    vars: (input) => ({ person: input.exceptionPerson ?? '' }),
  },
  {
    priority: 9,
    code: 'aftercare',
    when: (input) => input.goLiveWithin30Days === true && input.hasAftercare === false,
    vars: (input) => ({ date: input.goLiveDate ?? '' }),
  },
  {
    priority: 10,
    code: 'monthly-report',
    when: (input) => Boolean(input.reportDueSoon),
    vars: () => ({}),
  },
  {
    priority: 11,
    code: 'survey',
    when: (input) => input.surveyDue === 'health' || input.surveyDue === 'pulse',
    vars: (input) => ({ survey: input.surveyDue ?? '' }),
  },
  {
    priority: 12,
    code: 'charter-review',
    when: (input) => Boolean(input.charterReviewOverdue),
    vars: () => ({}),
  },
];

export function nextAction(input: NextActionInput): NextAction {
  for (const rule of RULES) {
    if (rule.when(input)) {
      return { code: rule.code, priority: rule.priority, vars: rule.vars(input) };
    }
  }
  return {
    code: 'on-track',
    priority: 13,
    vars: {
      milestone: input.milestone ?? '',
      date: input.milestoneDate ?? '',
    },
  };
}

export function suggestStatus(input: {
  measuresBelowTarget: number;
  milestoneWillBeMissed: boolean;
}): DeliveryStatus {
  if (input.milestoneWillBeMissed || input.measuresBelowTarget >= 2) return 'off-track';
  if (input.measuresBelowTarget >= 1) return 'at-risk';
  return 'on-track';
}
