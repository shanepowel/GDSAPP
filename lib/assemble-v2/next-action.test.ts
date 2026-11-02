import { describe, expect, it } from 'vitest';
import { engagementById, engagements } from './demo-data';
import { nextActionFor, nextActionsFor, suggestedStatus } from './next-action';
import type { Engagement } from './types';

const get = (id: string) => engagementById(id) as Engagement;

describe('nextActionFor', () => {
  it('asks for a recovery plan first on an at-risk engagement without one', () => {
    const a = nextActionFor(get('finance-data-platform'));
    expect(a.priority).toBe(2);
    expect(a.cta).toBe('Add recovery plan');
  });

  it('does not ask for a risk lock when one was held inside the window', () => {
    const actions = nextActionsFor(get('highways-reporting'));
    expect(actions.find((a) => a.priority === 1)).toBeUndefined();
  });

  it('asks for a risk lock when off track and none was held', () => {
    const e = { ...get('highways-reporting'), lastRiskLockWithinWindow: false };
    expect(nextActionFor(e).cta).toBe('Book risk lock');
  });

  it('flags a steering pack that is not ready', () => {
    expect(nextActionFor(get('customer-portal')).cta).toBe('Draft pack');
  });

  it('flags a change request waiting too long for assessment', () => {
    expect(nextActionFor(get('asset-reporting')).text).toContain('CR-007');
  });

  it('flags aftercare before go-live and the Keel exception without an end date', () => {
    const actions = nextActionsFor(get('finance-data-platform')).map((a) => a.priority);
    expect(actions).toContain(8);
    expect(actions).toContain(9);
  });

  it('falls back to an on-track message', () => {
    const a = nextActionFor(get('programme-controls'));
    expect(a.priority).toBe(13);
  });

  it('returns actions sorted by priority for every demo engagement', () => {
    for (const e of engagements) {
      const p = nextActionsFor(e).map((a) => a.priority);
      expect(p).toEqual([...p].sort((x, y) => x - y));
    }
  });
});

describe('suggestedStatus', () => {
  const m = get('programme-controls').measures;
  it('is on track when all measures meet target', () => {
    expect(suggestedStatus(m, false)).toBe('on-track');
  });
  it('is at risk with one measure below target', () => {
    expect(suggestedStatus({ ...m, teamHealth: 3.4 }, false)).toBe('at-risk');
  });
  it('is off track with two measures below target or a missed milestone', () => {
    expect(suggestedStatus({ ...m, teamHealth: 3.4, predictability: 60 }, false)).toBe('off-track');
    expect(suggestedStatus(m, true)).toBe('off-track');
  });
});
