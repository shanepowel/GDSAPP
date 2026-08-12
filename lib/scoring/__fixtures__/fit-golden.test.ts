import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { computeFit, type FitInput } from '../fit';

type Fixture = {
  id: string;
  input: FitInput;
  expect: {
    skillScore: number;
    rigourMultiplier: number;
    compositeScore: number;
    band: string;
  };
};

describe('computeFit golden fixtures', () => {
  const path = join(__dirname, 'fit-golden.json');
  const fixtures = JSON.parse(readFileSync(path, 'utf8')) as Fixture[];

  it('has fifteen fixtures', () => {
    expect(fixtures).toHaveLength(15);
  });

  for (const fx of fixtures) {
    it(`matches snapshot ${fx.id}`, () => {
      const result = computeFit(fx.input);
      expect(result.skillScore).toBeCloseTo(fx.expect.skillScore, 4);
      expect(result.rigourMultiplier).toBeCloseTo(fx.expect.rigourMultiplier, 4);
      expect(result.compositeScore).toBeCloseTo(fx.expect.compositeScore, 4);
      expect(result.band).toBe(fx.expect.band);
    });
  }
});

describe('computeFit purity contract', () => {
  it('fit.ts has no forbidden imports', () => {
    const src = readFileSync(join(__dirname, '..', 'fit.ts'), 'utf8');
    expect(src).not.toMatch(/@assemble\/db|@prisma|from ['"]next|node:fetch|from ['"]fs/);
    expect(src).not.toMatch(/Date\.now\(|Math\.random\(/);
  });

  it('property: composite stays within skill × [0.75, 1.15]', () => {
    const levels = ['awareness', 'working', 'practitioner', 'expert'] as const;
    for (let i = 0; i < 40; i += 1) {
      const held = levels[i % 4];
      const required = levels[(i + 1) % 4];
      const value = ((i % 21) - 10) / 10;
      const result = computeFit({
        requirement: {
          ddatRoleId: 'r',
          minLevel: required,
          criticality: 'core',
          fteRequired: 1,
          requiredSkills: [{ skillId: 's', requiredLevel: required, weight: 1 }],
        },
        candidate: {
          personId: 'p',
          availableFte: 1,
          skills: [{ skillId: 's', level: held, evidenceId: 'e' }],
        },
        rigourSignals:
          i % 5 === 0
            ? []
            : [
                {
                  type: 'sustained_assignment',
                  value,
                  provenance: 'derived',
                  observedAtDaysAgo: i * 20,
                },
              ],
      });
      expect(result.compositeScore).toBeLessThanOrEqual(result.skillScore * 1.15 + 1e-9);
      expect(result.compositeScore).toBeGreaterThanOrEqual(result.skillScore * 0.75 - 1e-9);
      expect(createHash('sha256').update(JSON.stringify(result)).digest('hex')).toHaveLength(64);
    }
  });
});
