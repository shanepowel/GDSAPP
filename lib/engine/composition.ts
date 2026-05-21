import { computePersonRoleFit } from '@/lib/engine/person-fit';
import type { AnalysisInput, CompositionResult } from '@/lib/types/analysis';

export function computeComposition(input: AnalysisInput): CompositionResult {
  const roleLevelMap = new Map(input.roleLevels.map((r) => [r.id, r]));
  const assignmentsByRole = new Map<string, string[]>();

  for (const a of input.assignments) {
    const list = assignmentsByRole.get(a.roleLevelId) ?? [];
    list.push(a.personId);
    assignmentsByRole.set(a.roleLevelId, list);
  }

  const roles = input.requirementRoles.map((req) => {
    const roleLevel = roleLevelMap.get(req.roleLevelId);
    const assigned = assignmentsByRole.get(req.roleLevelId) ?? [];
    const fits = assigned
      .map((pid) => (roleLevel ? computePersonRoleFit(input, roleLevel, pid) : null))
      .filter((f): f is NonNullable<typeof f> => f !== null);
    const bestFit = fits.length ? Math.max(...fits.map((f) => f.fitPercent)) : null;
    const covered = assigned.length > 0;
    const thinCoverage = covered && (bestFit ?? 0) < 50;

    return {
      roleLevelId: req.roleLevelId,
      roleName: roleLevel ? `${roleLevel.roleName} (${roleLevel.levelName})` : req.roleLevelId,
      covered,
      assignedPersonIds: assigned,
      bestFitPercent: bestFit,
      thinCoverage,
      rationale: covered
        ? [`${assigned.length} person(s) assigned; best fit ${bestFit ?? 0}%.`]
        : ['No one assigned to this required role.'],
    };
  });

  const coveredCount = roles.filter((r) => r.covered).length;
  const overallPercent = roles.length
    ? Math.round((coveredCount / roles.length) * 100)
    : 0;

  const personRoleCounts = new Map<string, number>();
  for (const a of input.assignments) {
    personRoleCounts.set(a.personId, (personRoleCounts.get(a.personId) ?? 0) + 1);
  }
  const singlePointsOfFailure = [...personRoleCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([personId]) => {
      const person = input.people.find((p) => p.id === personId);
      return person?.displayName ?? personId;
    });

  return {
    overallPercent,
    roles,
    singlePointsOfFailure,
    rationale: [
      `${coveredCount} of ${roles.length} required roles have at least one assignee.`,
      ...(singlePointsOfFailure.length
        ? [`Single points of failure: ${singlePointsOfFailure.join(', ')}.`]
        : []),
    ],
  };
}
