import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  FIT_SCORING_VERSION,
  bandForScore,
  classifyGap,
  computeFit,
  type FitInput,
} from './fit';

function baseInput(overrides: Partial<FitInput> = {}): FitInput {
  return {
    requirement: {
      ddatRoleId: 'user-researcher',
      minLevel: 'practitioner',
      criticality: 'core',
      fteRequired: 1,
      requiredSkills: [
        { skillId: 'user-research', requiredLevel: 'practitioner', weight: 1 },
        { skillId: 'user-centred-practice-and-advocacy', requiredLevel: 'working', weight: 0.5 },
      ],
    },
    candidate: {
      personId: 'p1',
      skills: [
        { skillId: 'user-research', level: 'practitioner', evidenceId: 'e1' },
        { skillId: 'user-centred-practice-and-advocacy', level: 'working', evidenceId: 'e2' },
      ],
      availableFte: 1,
    },
    rigourSignals: [],
    ...overrides,
  };
}

describe('computeFit', () => {
  it('produces multiplier exactly 1.0 with zero rigour signals and notes it', () => {
    const result = computeFit(baseInput());
    expect(result.rigourMultiplier).toBe(1);
    expect(result.breakdown.notes).toContain('no_rigour_signals');
    expect(result.skillScore).toBeCloseTo(1, 5);
    expect(result.compositeScore).toBeCloseTo(1, 5);
    expect(result.band).toBe('strong');
  });

  it('does not raise skillScore above 1.0 for over-qualification', () => {
    const result = computeFit(
      baseInput({
        candidate: {
          personId: 'p1',
          availableFte: 1,
          skills: [
            { skillId: 'user-research', level: 'expert', evidenceId: 'e1' },
            {
              skillId: 'user-centred-practice-and-advocacy',
              level: 'expert',
              evidenceId: 'e2',
            },
          ],
        },
      }),
    );
    expect(result.skillScore).toBeLessThanOrEqual(1);
    expect(result.skillScore).toBeCloseTo(1, 5);
  });

  it('scores one level short proportionally (not zero)', () => {
    const result = computeFit(
      baseInput({
        candidate: {
          personId: 'p1',
          availableFte: 1,
          skills: [
            { skillId: 'user-research', level: 'working', evidenceId: 'e1' },
            {
              skillId: 'user-centred-practice-and-advocacy',
              level: 'working',
              evidenceId: 'e2',
            },
          ],
        },
      }),
    );
    // user-research: 2/3 ≈ 0.667, advocacy: 1.0 → (0.667*1 + 1*0.5)/1.5
    expect(result.skillScore).toBeCloseTo((2 / 3 + 0.5) / 1.5, 3);
    expect(result.band).toBe('viable');
  });

  it('keeps composite within skillScore × [0.75, 1.15]', () => {
    const signals = [
      {
        type: 'sustained_assignment' as const,
        value: 1,
        provenance: 'derived' as const,
        observedAtDaysAgo: 30,
      },
      {
        type: 'capacity_discipline' as const,
        value: -1,
        provenance: 'derived' as const,
        observedAtDaysAgo: 10,
      },
    ];
    for (const rigourSignals of [[], signals]) {
      const result = computeFit(baseInput({ rigourSignals }));
      expect(result.compositeScore).toBeLessThanOrEqual(result.skillScore * 1.15 + 1e-9);
      expect(result.compositeScore).toBeGreaterThanOrEqual(result.skillScore * 0.75 - 1e-9);
    }
  });

  it('is deterministic across many runs', () => {
    const input = baseInput({
      rigourSignals: [
        {
          type: 'assurance_participation',
          value: 0.5,
          provenance: 'asserted',
          observedAtDaysAgo: 100,
        },
      ],
    });
    const first = computeFit(input);
    for (let i = 0; i < 1000; i += 1) {
      const next = computeFit(input);
      expect(next).toEqual(first);
    }
  });

  it('records capacity shortfall without folding it into composite', () => {
    const full = computeFit(baseInput());
    const constrained = computeFit(
      baseInput({
        candidate: {
          personId: 'p1',
          availableFte: 0.2,
          skills: baseInput().candidate.skills,
        },
      }),
    );
    expect(constrained.compositeScore).toBeCloseTo(full.compositeScore, 5);
    expect(constrained.breakdown.capacityShortfall).toBeCloseTo(0.8, 5);
    expect(constrained.breakdown.notes).toContain('capacity_constrained');
  });
});

describe('bandForScore / classifyGap', () => {
  it('maps bands', () => {
    expect(bandForScore(0.8)).toBe('strong');
    expect(bandForScore(0.6)).toBe('viable');
    expect(bandForScore(0.4)).toBe('stretch');
    expect(bandForScore(0.39)).toBe('gap');
  });

  it('classifies skills vs rigour vs capacity gaps', () => {
    expect(classifyGap({ criticality: 'core', bestComposite: 0.2, bestSkill: 0.2, capacityOnly: false }).kind).toBe(
      'skills_gap',
    );
    expect(
      classifyGap({ criticality: 'core', bestComposite: 0.2, bestSkill: 0.7, capacityOnly: false }).recommendation,
    ).toBe('second');
    expect(classifyGap({ criticality: 'core', bestComposite: 0.9, bestSkill: 0.9, capacityOnly: true }).kind).toBe(
      'capacity_gap',
    );
  });
});

describe('FIT_SCORING_VERSION', () => {
  it('is stable for cache hashing', () => {
    expect(FIT_SCORING_VERSION).toBe('fit-1.0.0');
    expect(createHash('sha256').update(FIT_SCORING_VERSION).digest('hex')).toHaveLength(64);
  });
});
