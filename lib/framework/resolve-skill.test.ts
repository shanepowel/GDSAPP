import { describe, expect, it } from 'vitest';
import { resolveSkill, skillLabel } from './resolve-skill';

const skills = [
  { id: 'user-research-methods', name: 'User research methods' },
  { id: 'agile-and-lean-practices', name: 'Agile and Lean practices' },
];

const aliases = [{ alias: 'user-research', skillId: 'user-research-methods' }];

describe('resolveSkill', () => {
  it('resolves a current skill id', () => {
    const result = resolveSkill('user-research-methods', skills, aliases);
    expect(result.skill?.name).toBe('User research methods');
    expect(result.renamedFrom).toBeNull();
    expect(result.explainable).toBe(true);
  });

  it('resolves a renamed skill through an alias', () => {
    const result = resolveSkill('user-research', skills, aliases);
    expect(result.skill?.id).toBe('user-research-methods');
    expect(result.renamedFrom).toBe('user-research');
    expect(result.explainable).toBe(true);
    expect(skillLabel('user-research', skills, aliases)).toBe(
      'User research methods (was user-research)',
    );
  });

  it('keeps an unknown historic id explainable as the stored id', () => {
    const result = resolveSkill('retired-skill-gone', skills, aliases);
    expect(result.skill).toBeNull();
    expect(result.explainable).toBe(false);
    expect(skillLabel('retired-skill-gone', skills, aliases)).toBe('retired-skill-gone');
  });
});
