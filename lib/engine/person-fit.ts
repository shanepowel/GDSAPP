import { compareSkillMatch } from '@/lib/engine/skill-match';
import type {
  AnalysisInput,
  EngineRoleLevel,
  PersonRoleFitResult,
  SkillMatchDetail,
} from '@/lib/types/analysis';

export function computePersonRoleFit(
  input: AnalysisInput,
  roleLevel: EngineRoleLevel,
  personId: string,
): PersonRoleFitResult | null {
  const person = input.people.find((p) => p.id === personId);
  if (!person) return null;

  const skillMap = new Map(person.skills.map((s) => [s.skillId, s.level]));
  const details: SkillMatchDetail[] = roleLevel.skills.map((req) => {
    const held = skillMap.get(req.skillId) ?? null;
    const { score, match, rationale } = compareSkillMatch(req.requiredLevel, held ?? undefined);
    return {
      skillId: req.skillId,
      skillName: req.skillName,
      required: req.requiredLevel,
      held,
      score,
      match,
      rationale,
    };
  });

  if (details.length === 0) {
    return {
      personId: person.id,
      personName: person.displayName,
      roleLevelId: roleLevel.id,
      roleName: `${roleLevel.roleName} (${roleLevel.levelName})`,
      fitPercent: 0,
      skills: details,
      rationale: ['No skills defined for this role level in reference data.'],
    };
  }

  const fitPercent = Math.round(
    (details.reduce((sum, d) => sum + d.score, 0) / details.length) * 100,
  );

  return {
    personId: person.id,
    personName: person.displayName,
    roleLevelId: roleLevel.id,
    roleName: `${roleLevel.roleName} (${roleLevel.levelName})`,
    fitPercent,
    skills: details,
    rationale: details.flatMap((d) => d.rationale),
  };
}

export function computeAllPersonFit(input: AnalysisInput): PersonRoleFitResult[] {
  const roleLevelMap = new Map(input.roleLevels.map((r) => [r.id, r]));
  const results: PersonRoleFitResult[] = [];

  for (const assignment of input.assignments) {
    const roleLevel = roleLevelMap.get(assignment.roleLevelId);
    if (!roleLevel) continue;
    const fit = computePersonRoleFit(input, roleLevel, assignment.personId);
    if (fit) results.push(fit);
  }

  return results;
}
