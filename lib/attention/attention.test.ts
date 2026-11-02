import { describe, expect, it } from 'vitest';
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

describe('greeting', () => {
  it('uses the London hour', () => {
    expect(hourInLondon(new Date('2026-01-15T09:00:00Z'))).toBe(9);
    expect(dayPart(new Date('2026-01-15T09:00:00Z'))).toBe('morning');
    expect(dayPart(new Date('2026-01-15T13:00:00Z'))).toBe('afternoon');
    expect(dayPart(new Date('2026-07-15T11:00:00Z'))).toBe('afternoon');
    expect(dayPart(new Date('2026-01-15T19:00:00Z'))).toBe('evening');
  });
});
