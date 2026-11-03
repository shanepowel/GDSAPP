import { describe, expect, it } from 'vitest';
import { copy } from '@/lib/copy';
import { copyCy } from '@/lib/copy.cy';
import {
  WALKTHROUGH_PEOPLE,
  WALKTHROUGH_ROLES,
  assignmentForTourStep,
  bestAvailable,
  fitWalkthrough,
  fullPhaseShare,
  isWalkthroughTourStep,
  stayBand,
} from '@/lib/teach/walkthrough';

describe('spec 12 walkthrough', () => {
  it('has nine role cards in both languages', () => {
    expect(copy.roles.cards).toHaveLength(9);
    expect(copyCy.roles.cards).toHaveLength(9);
  });

  it('keeps the multiplier at 1.00 when nothing is recorded', () => {
    const carys = WALKTHROUGH_PEOPLE.find((p) => p.name === 'Carys Hughes');
    const content = WALKTHROUGH_ROLES.find((r) => r.rid === 'cd');
    expect(carys?.signals).toEqual([]);
    const fit = fitWalkthrough(content!, carys!);
    expect(fit.rigourMultiplier).toBe(1);
    expect(fit.breakdown.notes).toContain('no_rigour_signals');
  });

  it('seeds the live squad on tour steps 5 to 7', () => {
    expect(isWalkthroughTourStep(5)).toBe(true);
    expect(assignmentForTourStep(5)).toEqual({});
    expect(assignmentForTourStep(6)).toEqual({ 0: 0, 2: 2, 4: 4 });
    expect(assignmentForTourStep(7)[5]).toBe(5);
  });

  it('does not offer a person below the datum or without remaining time', () => {
    const open = bestAvailable({});
    const names = open.map((pick) => (pick ? WALKTHROUGH_PEOPLE[pick.personIndex]?.name : null));
    expect(open.every((pick) => pick == null || pick.score >= 0.6)).toBe(true);
    const content = WALKTHROUGH_ROLES.findIndex((role) => role.rid === 'cd');
    const contentPick = open[content];
    if (contentPick) expect(contentPick.score).toBeGreaterThanOrEqual(0.6);
    const used = new Map<number, number>();
    open.forEach((pick, index) => {
      if (!pick) return;
      const next = (used.get(pick.personIndex) ?? 0) + WALKTHROUGH_ROLES[index]!.fte;
      expect(next).toBeLessThanOrEqual(WALKTHROUGH_PEOPLE[pick.personIndex]!.free + 1e-9);
      used.set(pick.personIndex, next);
    });

    const dafydd = WALKTHROUGH_PEOPLE.findIndex((person) => person.name === 'Dafydd Jones');
    const analyst = WALKTHROUGH_ROLES.findIndex((role) => role.rid === 'dm');
    const after = bestAvailable({ [analyst]: dafydd });
    expect(after.some((pick, index) => index !== analyst && pick?.personIndex === dafydd)).toBe(false);
  });

  it('treats a two-phase run as staying a full phase', () => {
    expect(fullPhaseShare(WALKTHROUGH_PEOPLE)).toBeCloseTo(0.625);
    expect(stayBand([1, 1, 1, 1])).toBe('stable');
    expect(stayBand([0, 1, 0, 1])).toBe('fragmented');
  });

  it('exposes teaching assurance points without hardcoding a count', () => {
    expect(copy.assurance.teachingPoints.length).toBeGreaterThan(0);
    expect(copyCy.assurance.teachingPoints).toHaveLength(copy.assurance.teachingPoints.length);
    expect(copy.assurance.teachingPoints.some((p) => p.status === 'at-risk')).toBe(true);
  });
});
