import { describe, expect, it } from 'vitest';
import { copy } from '@/lib/copy';
import { copyCy } from '@/lib/copy.cy';
import {
  WALKTHROUGH_PEOPLE,
  WALKTHROUGH_ROLES,
  assignmentForTourStep,
  fitWalkthrough,
  isWalkthroughTourStep,
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
});
