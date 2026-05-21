import { readinessBandForScore } from '@/lib/engine/config';
import { compareSkillMatch } from '@/lib/engine/skill-match';
import type {
  AnalysisInput,
  ReadinessPointResult,
  ReadinessResult,
  ReadinessStatus,
} from '@/lib/types/analysis';

function phaseWeight(pointPhases: string[], phase: string): number {
  return pointPhases.includes(phase) ? 1.25 : 1;
}

function scoreToStatus(score: number): ReadinessStatus {
  if (score >= 0.85) return 'strong';
  if (score >= 0.65) return 'met';
  if (score >= 0.4) return 'partial';
  return 'gap';
}

export function computeReadiness(input: AnalysisInput): ReadinessResult {
  const peopleSkillMap = new Map(
    input.people.map((p) => [p.id, new Map(p.skills.map((s) => [s.skillId, s.level]))]),
  );

  const assignedByRole = new Map<string, { personId: string; seniorityRank: number }[]>();
  for (const a of input.assignments) {
    const rl = input.roleLevels.find((r) => r.id === a.roleLevelId);
    const list = assignedByRole.get(rl?.roleId ?? '') ?? [];
    list.push({ personId: a.personId, seniorityRank: rl?.seniorityRank ?? 0 });
    assignedByRole.set(rl?.roleId ?? '', list);
  }

  const points: ReadinessPointResult[] = input.standardPoints.map((point) => {
    const weight = phaseWeight(point.phaseEmphasis, input.phase);
    const evidenceGaps: string[] = [];
    const rationale: string[] = [];
    let roleScoreSum = 0;
    let roleWeightSum = 0;
    let skillScoreSum = 0;
    let skillWeightSum = 0;

    if (point.compositionDriven) {
      const roleIds = point.roleDeps.map((d) => d.roleId);
      const present = roleIds.filter((rid) => (assignedByRole.get(rid)?.length ?? 0) > 0);
      const compScore = roleIds.length ? present.length / roleIds.length : 0;
      roleScoreSum = compScore;
      roleWeightSum = 1;
      rationale.push(
        `Composition-driven: ${present.length} of ${roleIds.length} depended roles present on team.`,
      );
      if (compScore < 1) {
        evidenceGaps.push(...point.evidenceTypes.slice(0, 2));
      }
    } else {
      for (const dep of point.roleDeps) {
        const assignees = assignedByRole.get(dep.roleId) ?? [];
        const minRank = dep.minSeniorityRank;
        const satisfied = assignees.some((a) => a.seniorityRank >= minRank);
        const score = satisfied ? 1 : assignees.length > 0 ? 0.5 : 0;
        roleScoreSum += score * dep.weight;
        roleWeightSum += dep.weight;
        const roleName = input.rolesById.get(dep.roleId)?.name ?? dep.roleId;
        if (!satisfied) {
          evidenceGaps.push(`Role needed: ${roleName}`);
          rationale.push(
            assignees.length
              ? `${roleName} present but below required seniority (need rank >= ${minRank}).`
              : `${roleName} not represented on team.`,
          );
        }
      }

      for (const dep of point.skillDeps) {
        let best = 0;
        for (const person of input.people) {
          const held = peopleSkillMap.get(person.id)?.get(dep.skillId);
          const { score } = compareSkillMatch(dep.minLevel, held);
          best = Math.max(best, score);
        }
        skillScoreSum += best * dep.weight;
        skillWeightSum += dep.weight;
        if (best < 1) {
          evidenceGaps.push(`Skill gap: ${dep.skillId} (min ${dep.minLevel})`);
          rationale.push(`Best team match for ${dep.skillId} scores ${best}.`);
        }
      }
    }

    const rolePart = roleWeightSum ? roleScoreSum / roleWeightSum : 1;
    const skillPart = skillWeightSum ? skillScoreSum / skillWeightSum : null;
    const raw =
      point.compositionDriven && skillWeightSum === 0
        ? rolePart
        : skillPart === null
          ? rolePart
          : (rolePart + skillPart) / 2;
    const score = Math.min(1, raw);

    return {
      pointId: point.id,
      number: point.number,
      title: point.title,
      category: point.category,
      statutoryNote: point.statutoryNote,
      status: scoreToStatus(score),
      score: Math.round(score * 100),
      phaseWeight: weight,
      evidenceGaps,
      rationale,
    };
  });

  const weightedTotal = points.reduce((s, p) => s + p.score * p.phaseWeight, 0);
  const weightSum = points.reduce((s, p) => s + p.phaseWeight, 0);
  const overallPercent = weightSum ? Math.round(weightedTotal / weightSum) : 0;
  const band = readinessBandForScore(overallPercent);

  return {
    points,
    overallPercent,
    bandLabel: band.label,
    bandKey: band.key,
  };
}
