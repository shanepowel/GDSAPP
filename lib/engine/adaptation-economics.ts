import type {
  AdaptationAction,
  AdaptationPlan,
  CompositionResult,
  ReadinessResult,
} from '@/lib/types/analysis';
import type { AdaptationConstraints } from '@/lib/types/extension';

const DEFAULT_WEEKS_PER_SKILL_GAP = 4;
const DEFAULT_PARTNER_DAYS = 20;
const DEFAULT_UPSKILL_DAYS = 10;

export function enrichAdaptationWithEconomics(
  plan: AdaptationPlan,
  readiness: ReadinessResult,
  composition: CompositionResult,
  constraints?: AdaptationConstraints | null,
): AdaptationPlan {
  const rate =
    constraints?.internalRatePerDay ?? constraints?.partnerRatePerDay ?? 600;
  const budgetCap = constraints?.budgetCap ?? null;

  const actions: AdaptationAction[] = plan.actions.map((action) => {
    const isRecruit = action.title.toLowerCase().includes('fill role');
    const isUpskill = action.title.toLowerCase().includes('upskill');
    const estimatedCost = isRecruit
      ? rate * DEFAULT_PARTNER_DAYS
      : isUpskill
        ? rate * DEFAULT_UPSKILL_DAYS * 0.5
        : rate * DEFAULT_UPSKILL_DAYS * 0.3;
    const weeksToCompetence = isRecruit ? 2 : isUpskill ? DEFAULT_WEEKS_PER_SKILL_GAP : 2;
    const impactScore = action.impact === 'high' ? 3 : action.impact === 'medium' ? 2 : 1;
    const feasible = budgetCap == null || estimatedCost <= budgetCap;
    const impactPerPound = feasible && estimatedCost > 0 ? impactScore / estimatedCost : null;
    const impactPerWeek = weeksToCompetence > 0 ? impactScore / weeksToCompetence : null;

    return {
      ...action,
      estimatedCost: Math.round(estimatedCost),
      weeksToCompetence,
      feasible,
      impactPerPound: impactPerPound != null ? Math.round(impactPerPound * 1e6) / 1e6 : null,
      impactPerWeek: impactPerWeek != null ? Math.round(impactPerWeek * 100) / 100 : null,
    };
  });

  const ranked = [...actions].sort((a, b) => {
    if (a.feasible !== b.feasible) return a.feasible ? -1 : 1;
    const aScore = (a.impactPerPound ?? 0) * 0.6 + (a.impactPerWeek ?? 0) * 0.4;
    const bScore = (b.impactPerPound ?? 0) * 0.6 + (b.impactPerWeek ?? 0) * 0.4;
    return bScore - aScore;
  });

  const infeasible = ranked.filter((a) => !a.feasible);
  if (infeasible.length && budgetCap != null) {
    ranked.unshift({
      id: 'constraint-warning',
      title: 'Budget constraint',
      description: `${infeasible.length} option(s) exceed the budget cap of £${budgetCap.toLocaleString('en-GB')}. Ranked options show what fits within constraints.`,
      impact: 'low',
      effort: 'low',
      improves: [],
      rationale: ['No option fits all constraints without trade-offs.'],
      feasible: true,
    });
  }

  void readiness;
  void composition;

  return { actions: ranked };
}
