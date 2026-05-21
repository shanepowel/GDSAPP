import type { AdaptationPlan, ReadinessResult, CompositionResult } from '@/lib/types/analysis';

export function computeAdaptation(
  readiness: ReadinessResult,
  composition: CompositionResult,
): AdaptationPlan {
  const actions: AdaptationPlan['actions'] = [];
  let id = 0;

  for (const point of readiness.points.filter((p) => p.status === 'gap' || p.status === 'partial')) {
    actions.push({
      id: `a-${++id}`,
      title: `Close gap: ${point.title}`,
      description: `Address ${point.evidenceGaps.slice(0, 2).join('; ') || 'missing evidence'} for standard point ${point.number}.`,
      impact: point.status === 'gap' ? 'high' : 'medium',
      effort: 'medium',
      improves: [point.pointId],
      rationale: point.rationale,
    });
  }

  for (const role of composition.roles.filter((r) => !r.covered)) {
    actions.push({
      id: `a-${++id}`,
      title: `Fill role: ${role.roleName}`,
      description: 'Partner or recruit to cover this required role, or sequence delivery until the role can be filled.',
      impact: 'high',
      effort: 'high',
      improves: [role.roleLevelId],
      rationale: role.rationale,
    });
  }

  for (const role of composition.roles.filter((r) => r.thinCoverage)) {
    actions.push({
      id: `a-${++id}`,
      title: `Upskill or blend: ${role.roleName}`,
      description: 'Existing assignee is one proficiency level short on key skills; consider coaching or splitting the role across two people.',
      impact: 'medium',
      effort: 'low',
      improves: [role.roleLevelId],
      rationale: ['Thin coverage: assignee fit below 50%.'],
    });
  }

  const ranked = actions.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    const effortOrder = { low: 0, medium: 1, high: 2 };
    return (
      impactOrder[a.impact] - impactOrder[b.impact] ||
      effortOrder[a.effort] - effortOrder[b.effort]
    );
  });

  return { actions: ranked };
}
