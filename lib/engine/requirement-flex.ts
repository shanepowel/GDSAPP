import type { AdaptationPlan, CompositionResult, ReadinessResult } from '@/lib/types/analysis';
import type { AdaptationConstraints } from '@/lib/types/extension';

export type FlexPriority = 'balanced' | 'cost' | 'speed' | 'quality';

export interface RequirementFlexOption {
  id: string;
  title: string;
  description: string;
  impact: 'readiness' | 'cost' | 'timeline' | 'scope';
  confidence: 'high' | 'medium';
  tradeoffs: string[];
}

export interface RequirementFlexResult {
  summary: string;
  priority: FlexPriority;
  lockedConstraints: string[];
  options: RequirementFlexOption[];
}

export interface RequirementFlexInput {
  phase: string;
  outcome: string;
  sensitivity: string;
  flexPriority: FlexPriority;
  readiness: ReadinessResult;
  composition: CompositionResult;
  adaptation: AdaptationPlan;
  constraint?: AdaptationConstraints | null;
}

function gapCount(readiness: ReadinessResult): number {
  return readiness.points.filter((p) => p.status === 'gap' || p.status === 'partial').length;
}

function uncoveredRoles(composition: CompositionResult): number {
  return composition.roles.filter((r) => !r.covered).length;
}

export function computeRequirementFlex(input: RequirementFlexInput): RequirementFlexResult {
  const { phase, outcome, flexPriority, readiness, composition, adaptation, constraint } = input;
  const gaps = gapCount(readiness);
  const missingRoles = uncoveredRoles(composition);
  const locked: string[] = [];

  if (constraint?.budgetCap != null) {
    locked.push(`Budget cap £${constraint.budgetCap.toLocaleString('en-GB')} cannot be exceeded without re-baselining.`);
  }
  if (constraint?.startBy && constraint?.endBy) {
    locked.push(
      `Delivery window ${constraint.startBy.toLocaleDateString('en-GB')} – ${constraint.endBy.toLocaleDateString('en-GB')} is fixed for this run.`,
    );
  }
  if (input.sensitivity === 'secret' || input.sensitivity === 'official-sensitive') {
    locked.push('Sensitivity classification limits which roles and evidence types can be flexed.');
  }

  const options: RequirementFlexOption[] = [];
  let id = 0;

  if (missingRoles > 0) {
    const deferRoles = flexPriority === 'speed' || flexPriority === 'cost';
    options.push({
      id: `flex-${++id}`,
      title: deferRoles ? 'Defer non-critical roles to a later phase' : 'Partner or surge capacity for uncovered roles',
      description: deferRoles
        ? `Sequence ${missingRoles} uncovered role(s) into ${phase === 'discovery' ? 'alpha' : 'the next phase'} so discovery can continue without blocking the whole requirement.`
        : `Bring in partner day-rate capacity or backfill vacancies before ${phase} exit criteria are assessed.`,
      impact: deferRoles ? 'timeline' : 'readiness',
      confidence: 'high',
      tradeoffs: deferRoles
        ? ['Readiness score may stay partial until roles are filled.', 'Scope must be explicit in the outcome statement.']
        : ['Increases delivery cost unless budget cap allows partner rates.'],
    });
  }

  if (gaps >= 3 && (flexPriority === 'quality' || flexPriority === 'balanced')) {
    options.push({
      id: `flex-${++id}`,
      title: 'Narrow standard scope for this phase',
      description: `Focus on ${phase}-emphasis points only; park ${gaps} partial/gap points to a later phase with explicit evidence milestones in the outcome.`,
      impact: 'scope',
      confidence: 'medium',
      tradeoffs: [
        'Overall readiness percentage may improve for in-phase points but portfolio view stays honest.',
        'Requires assessor sign-off on deferred points.',
      ],
    });
  }

  if (flexPriority === 'cost' && constraint?.budgetCap != null) {
    options.push({
      id: `flex-${++id}`,
      title: 'Blend internal and partner effort within cap',
      description:
        'Re-weight assignments to lower day-rate internal capacity first; use partner rates only on statutory or pass-fail points.',
      impact: 'cost',
      confidence: adaptation.actions.length > 0 ? 'high' : 'medium',
      tradeoffs: ['May extend calendar duration if internal availability is limited.'],
    });
  }

  if (flexPriority === 'speed' && phase !== 'live') {
    options.push({
      id: `flex-${++id}`,
      title: 'Advance phase gate with documented risk',
      description: `Move from ${phase} with explicit risk register for remaining gaps; treat ${readiness.bandLabel} band as conditional go.`,
      impact: 'timeline',
      confidence: readiness.overallPercent >= 55 ? 'medium' : 'medium',
      tradeoffs: [
        'Not recommended below 55% readiness unless judgements record approved override.',
        'Bid outlook (if used) should be re-run after flex.',
      ],
    });
  }

  if (outcome.trim().length < 80) {
    options.push({
      id: `flex-${++id}`,
      title: 'Expand outcome narrative',
      description:
        'Add measurable outcomes and flex boundaries (what can slip vs what is fixed) so the reasoning engine and assessors share the same scope contract.',
      impact: 'scope',
      confidence: 'high',
      tradeoffs: ['Short outcomes produce conservative readiness scoring.'],
    });
  }

  const priorityLabel: Record<FlexPriority, string> = {
    balanced: 'balanced cost, quality, and timeline',
    cost: 'cost control',
    speed: 'delivery speed',
    quality: 'assessment readiness quality',
  };

  const summary =
    gaps === 0 && missingRoles === 0
      ? `Requirement is structurally sound for ${phase} with ${priorityLabel[flexPriority]} priority. Minor tuning only.`
      : `${gaps} standard point gap(s) and ${missingRoles} role gap(s) detected. Flex options below respect locked constraints and prioritise ${priorityLabel[flexPriority]}.`;

  return {
    summary,
    priority: flexPriority,
    lockedConstraints: locked,
    options: options.slice(0, 6),
  };
}
