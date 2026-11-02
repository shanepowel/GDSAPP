import { describe, expect, it } from 'vitest';
import { attentionFor, attentionRows, type SpineFacts } from '@/lib/attention/facts';
import { dayPart, hourInLondon } from '@/lib/attention/greeting';
import { lifecycleStageForPhase } from '@/lib/attention/lifecycle';
import { nextAction, suggestStatus } from '@/lib/attention/next-action';
import { nextActionSentence } from '@/lib/attention/sentence';
import { copy } from '@/lib/copy';

describe('next action', () => {
  it('picks the first matching rule', () => {
    const action = nextAction({
      status: 'off-track',
      riskLockWithin48Hours: false,
      hasRecoveryPlan: false,
      stage: 'sprint-zero',
      sprintZeroOpen: 3,
    });
    expect(action).toMatchObject({ code: 'risk-lock', priority: 1 });
  });

  it('asks for a recovery plan when the engagement is at risk', () => {
    expect(nextAction({ status: 'at-risk', hasRecoveryPlan: false }).code).toBe('recovery');
    expect(nextAction({ status: 'at-risk', hasRecoveryPlan: true }).code).not.toBe('recovery');
  });

  it('does not fire a rule when the fact is missing', () => {
    expect(nextAction({ status: 'at-risk' }).code).toBe('on-track');
    expect(nextAction({ status: 'off-track' }).code).toBe('on-track');
    expect(nextAction({ steeringWithinTwoDays: true }).code).toBe('on-track');
    expect(nextAction({ goLiveWithin30Days: true }).code).toBe('on-track');
  });

  it('does not invent a sprint zero task outside that stage', () => {
    expect(nextAction({ stage: 'beta', sprintZeroOpen: 4 }).code).toBe('on-track');
    expect(
      nextAction({ stage: 'sprint-zero', sprintZeroOpen: 2, sprintZeroBy: '12 Nov 2026' }).vars,
    ).toMatchObject({ n: 2, date: '12 Nov 2026' });
  });

  it('falls through to on track when nothing else matches', () => {
    expect(nextAction({ milestone: 'Payment 2', milestoneDate: '30 Nov 2026' })).toEqual({
      code: 'on-track',
      priority: 13,
      vars: { milestone: 'Payment 2', date: '30 Nov 2026' },
    });
  });

  it('suggests status from measures and milestones', () => {
    expect(suggestStatus({ measuresBelowTarget: 2, milestoneWillBeMissed: false })).toBe('off-track');
    expect(suggestStatus({ measuresBelowTarget: 0, milestoneWillBeMissed: true })).toBe('off-track');
    expect(suggestStatus({ measuresBelowTarget: 1, milestoneWillBeMissed: false })).toBe('at-risk');
    expect(suggestStatus({ measuresBelowTarget: 0, milestoneWillBeMissed: false })).toBe('on-track');
  });
});

describe('lifecycle mapping', () => {
  it('maps stored phases onto the spine', () => {
    expect(lifecycleStageForPhase('discovery')).toBe('discovery');
    expect(lifecycleStageForPhase('BETA')).toBe('beta');
    expect(lifecycleStageForPhase('gate')).toBe('live');
    expect(lifecycleStageForPhase('unknown')).toBeNull();
    expect(lifecycleStageForPhase(null)).toBeNull();
  });
});

describe('next action sentence', () => {
  it('uses the milestone sentence only when both facts exist', () => {
    expect(nextActionSentence(nextAction({}), copy.nextAction)).toBe('You are on track.');
    expect(
      nextActionSentence(
        nextAction({ milestone: 'Payment 2', milestoneDate: '30 Nov 2026' }),
        copy.nextAction,
      ),
    ).toBe('You are on track. Next milestone: Payment 2 on 30 Nov 2026.');
  });

  it('names the survey in a complete sentence', () => {
    expect(
      nextActionSentence(nextAction({ surveyDue: 'health' }), copy.nextAction),
    ).toBe("Send this month's team health check.");
    expect(
      nextActionSentence(nextAction({ surveyDue: 'pulse' }), copy.nextAction),
    ).toBe("Send this month's pulse.");
  });
});

function facts(partial: Partial<SpineFacts> = {}): SpineFacts {
  return {
    confirmedStatus: null,
    riskLockAt: null,
    hasRecoveryPlan: false,
    steeringOn: null,
    packReady: false,
    unconfirmedDecisions: 0,
    stage: null,
    sprintZeroOpen: 0,
    sprintZeroBy: null,
    submittedChange: null,
    triagedChange: null,
    exceptionPerson: null,
    goLiveOn: null,
    hasAftercare: false,
    reportDueOn: null,
    surveyDue: null,
    charterReviewOn: null,
    milestoneName: null,
    milestoneOn: null,
    milestoneWillBeMissed: false,
    measuresBelowTarget: 0,
    overdueSprintItem: null,
    ...partial,
  };
}

describe('engagement facts', () => {
  const now = new Date('2026-11-02T12:00:00.000Z');

  it('asks to finish Sprint Zero when that stage is open', () => {
    const action = attentionFor(facts({ stage: 'sprint-zero', sprintZeroOpen: 11 }), now, 48);
    expect(action).toMatchObject({ code: 'sprint-zero', priority: 5, vars: { n: 11, date: '' } });
  });

  it('books a risk lock when a late milestone has no recent lock', () => {
    const action = attentionFor(
      facts({ milestoneWillBeMissed: true, stage: 'sprint-zero', sprintZeroOpen: 2 }),
      now,
      48,
    );
    expect(action.code).toBe('risk-lock');
  });

  it('stays quiet when a risk lock was booked inside the window', () => {
    const action = attentionFor(
      facts({
        confirmedStatus: 'off-track',
        riskLockAt: new Date('2026-11-02T00:00:00.000Z'),
      }),
      now,
      48,
    );
    expect(action.code).not.toBe('risk-lock');
  });

  it('does not invent a steering or go-live task without a date', () => {
    expect(attentionFor(facts({ packReady: false, hasAftercare: false }), now, 48).code).toBe('on-track');
  });

  it('raises the dated rules in priority order', () => {
    const action = attentionFor(
      facts({
        steeringOn: new Date('2026-11-03T00:00:00.000Z'),
        packReady: false,
        goLiveOn: new Date('2026-11-20T00:00:00.000Z'),
        hasAftercare: false,
        reportDueOn: new Date('2026-11-04T00:00:00.000Z'),
      }),
      now,
      48,
    );
    expect(action.code).toBe('steering-pack');
    expect(action.vars.date).toBe('3 Nov 2026');
  });

  it('waits two days before asking to triage a change', () => {
    const fresh = attentionFor(
      facts({ submittedChange: { ref: 'CR-001', at: new Date('2026-11-02T10:00:00.000Z') } }),
      now,
      48,
    );
    const stale = attentionFor(
      facts({ submittedChange: { ref: 'CR-001', at: new Date('2026-10-28T00:00:00.000Z') } }),
      now,
      48,
    );
    expect(fresh.code).toBe('on-track');
    expect(stale).toMatchObject({ code: 'triage-change', vars: { ref: 'CR-001' } });
  });

  it('lists attention rows only for facts that are present', () => {
    const rows = attentionRows(
      facts({
        confirmedStatus: 'at-risk',
        overdueSprintItem: 'Squad charter signed off',
        surveyDue: 'health',
      }),
      now,
      48,
    );
    expect(rows.map((row) => row.code)).toEqual(['at-risk', 'sprint-overdue', 'survey-health']);
  });
});

describe('greeting', () => {
  it('uses the London hour', () => {
    expect(hourInLondon(new Date('2026-01-15T09:00:00Z'))).toBe(9);
    expect(dayPart(new Date('2026-01-15T09:00:00Z'))).toBe('morning');
    expect(dayPart(new Date('2026-01-15T13:00:00Z'))).toBe('afternoon');
    expect(dayPart(new Date('2026-07-15T11:00:00Z'))).toBe('afternoon');
    expect(dayPart(new Date('2026-01-15T19:00:00Z'))).toBe('evening');
  });
});
