/**
 * Resolve a capability-framework skill id that may have been renamed or merged.
 * Historic fit breakdowns keep the id they were computed against; aliases map
 * that id to the current skill so the reasoning still opens.
 */

export type ResolvableSkill = {
  id: string;
  name: string;
};

export type SkillAliasRow = {
  alias: string;
  skillId: string;
};

export function resolveSkill(
  skillId: string,
  skills: ResolvableSkill[],
  aliases: SkillAliasRow[],
): { skill: ResolvableSkill | null; renamedFrom: string | null; explainable: boolean } {
  const direct = skills.find((s) => s.id === skillId);
  if (direct) return { skill: direct, renamedFrom: null, explainable: true };

  const alias = aliases.find((a) => a.alias === skillId);
  if (alias) {
    const current = skills.find((s) => s.id === alias.skillId) ?? null;
    return { skill: current, renamedFrom: skillId, explainable: current != null };
  }

  return { skill: null, renamedFrom: null, explainable: false };
}

export function skillLabel(
  skillId: string,
  skills: ResolvableSkill[],
  aliases: SkillAliasRow[] = [],
): string {
  const resolved = resolveSkill(skillId, skills, aliases);
  if (resolved.skill && resolved.renamedFrom) {
    return `${resolved.skill.name} (was ${resolved.renamedFrom})`;
  }
  if (resolved.skill) return resolved.skill.name;
  return skillId;
}
