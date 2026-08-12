import { describe, expect, it } from 'vitest';
import {
  CORE_ROLE_MIN_FTE,
  scoreCapacityDiscipline,
  scoreSustainedAssignment,
} from './keel';

describe('scoreSustainedAssignment (Keel tenure)', () => {
  it('returns null with no history', () => {
    expect(scoreSustainedAssignment({ weeksOnEngagement: 0, fteOnEngagement: 0, phase: 'discovery' })).toBeNull();
  });

  it('scores strongly when phase-complete at ≥0.8 FTE', () => {
    const r = scoreSustainedAssignment({
      weeksOnEngagement: 8,
      fteOnEngagement: CORE_ROLE_MIN_FTE,
      phase: 'discovery',
    });
    expect(r).not.toBeNull();
    expect(r!.value).toBeGreaterThanOrEqual(0.55);
  });

  it('does not treat sub-0.8 FTE as core even with long tenure', () => {
    const r = scoreSustainedAssignment({
      weeksOnEngagement: 12,
      fteOnEngagement: 0.4,
      phase: 'discovery',
    });
    expect(r!.value).toBeLessThan(0.4);
    expect(r!.note.toLowerCase()).toContain('specialist');
  });
});

describe('scoreCapacityDiscipline (70/20/10)', () => {
  it('rewards committed load near 70%', () => {
    const r = scoreCapacityDiscipline({ committedFraction: 0.7, engagementCount: 1 });
    expect(r!.value).toBeGreaterThanOrEqual(0.5);
  });

  it('penalises overload and too many engagements', () => {
    const r = scoreCapacityDiscipline({ committedFraction: 0.95, engagementCount: 3 });
    expect(r!.value).toBeLessThan(0);
  });
});
