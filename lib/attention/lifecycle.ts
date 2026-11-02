/**
 * Lifecycle stages from the redesign brief.
 * Existing engagement phases map onto this spine. Unknown phases stay unset.
 */

export const LIFECYCLE_STAGES = [
  'shape',
  'sprint-zero',
  'discovery',
  'alpha',
  'beta',
  'live',
  'operate',
] as const;

export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

const PHASE_TO_STAGE: Record<string, LifecycleStage> = {
  shape: 'shape',
  'sprint-zero': 'sprint-zero',
  sprintzero: 'sprint-zero',
  discovery: 'discovery',
  alpha: 'alpha',
  beta: 'beta',
  live: 'live',
  operate: 'operate',
  gate: 'live',
};

export function lifecycleStageForPhase(phase: string | null | undefined): LifecycleStage | null {
  if (!phase) return null;
  return PHASE_TO_STAGE[phase.trim().toLowerCase()] ?? null;
}

export function lifecycleIndex(stage: LifecycleStage): number {
  return LIFECYCLE_STAGES.indexOf(stage);
}
