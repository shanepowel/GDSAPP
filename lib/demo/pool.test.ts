import { describe, expect, it } from 'vitest';
import { DEMO_POOL, demoSkillLabel } from '@/lib/demo/pool';

describe('demo pool', () => {
  it('has distinct people and mixed skillsets', () => {
    const emails = DEMO_POOL.map((p) => p.email);
    expect(new Set(emails).size).toBe(emails.length);
    expect(DEMO_POOL.length).toBeGreaterThanOrEqual(12);

    const primarySkills = new Set(DEMO_POOL.map((p) => p.skills[0]?.skillId).filter(Boolean));
    expect(primarySkills.size).toBeGreaterThanOrEqual(6);
  });

  it('includes bilingual, unevidenced, stretch, and capacity-constrained profiles', () => {
    expect(
      DEMO_POOL.some((p) => p.skills.some((s) => s.skillId === 'welsh-language-service-capability')),
    ).toBe(true);
    expect(DEMO_POOL.some((p) => !p.rigour?.length)).toBe(true);
    expect(DEMO_POOL.some((p) => p.skills.some((s) => s.level === 'awareness'))).toBe(true);
    expect(DEMO_POOL.some((p) => p.skills.some((s) => s.level === 'expert'))).toBe(true);
    expect(DEMO_POOL.some((p) => p.daysPerWeek != null && p.daysPerWeek < 5)).toBe(true);
    expect(DEMO_POOL.some((p) => p.fte < 100 && (p.allocation ?? 0) > p.fte)).toBe(true);
  });

  it('labels skills in sentence case without concatenation', () => {
    expect(demoSkillLabel('user-research')).toBe('User research');
    expect(demoSkillLabel('welsh-language-service-capability')).toBe(
      'Welsh language service capability',
    );
  });
});
