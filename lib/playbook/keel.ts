/**
 * The Keel — assignment rules from the T&T Delivery Playbook (doc 09 §5).
 * Pure helpers only: no I/O. Callers supply pre-computed weeks / FTE.
 */

/** Core roles must be ≥ 0.8 FTE on a single engagement. */
export const CORE_ROLE_MIN_FTE = 0.8;

/** Default capacity split: committed / discretionary / slack. */
export const CAPACITY_SPLIT = {
  committed: 0.7,
  discretionary: 0.2,
  slack: 0.1,
} as const;

/** Soft upper band for committed work before overload (playbook: do not maximise utilisation). */
export const COMMITTED_OVERLOAD_THRESHOLD = 0.85;

/** Maximum concurrent engagements for any person. */
export const MAX_ENGAGEMENTS_PER_PERSON = 2;

export type MaturityLevel = 'practising' | 'evidenced' | 'assured' | 'compounding';

export const MATURITY_LEVELS: MaturityLevel[] = [
  'practising',
  'evidenced',
  'assured',
  'compounding',
];

export const MATURITY_LABELS: Record<MaturityLevel, string> = {
  practising: 'Practising',
  evidenced: 'Evidenced',
  assured: 'Assured',
  compounding: 'Compounding',
};

/** Indicative minimum weeks for a “complete phase” (doc 09 §4). */
export const PHASE_MIN_WEEKS: Record<string, number> = {
  discovery: 6,
  alpha: 8,
  beta: 12,
  live: 12,
  gate: 2,
};

export function phaseCompleteWeeks(phase: string): number {
  return PHASE_MIN_WEEKS[phase] ?? 6;
}

/**
 * sustained_assignment value (−1..1).
 * Positive only when tenure covers a complete phase AND depth ≥ 0.8 FTE.
 */
export function scoreSustainedAssignment(input: {
  weeksOnEngagement: number;
  fteOnEngagement: number;
  phase: string;
}): { value: number; note: string } | null {
  if (input.weeksOnEngagement <= 0 && input.fteOnEngagement <= 0) {
    return null; // no history → no signal
  }

  const needWeeks = phaseCompleteWeeks(input.phase);
  const depthOk = input.fteOnEngagement + 1e-9 >= CORE_ROLE_MIN_FTE;
  const tenureOk = input.weeksOnEngagement >= needWeeks;

  if (tenureOk && depthOk) {
    const over = Math.min(1, (input.weeksOnEngagement - needWeeks) / needWeeks);
    return {
      value: 0.55 + over * 0.35,
      note: `Phase-complete tenure (~${input.weeksOnEngagement} weeks) at ${input.fteOnEngagement.toFixed(2)} FTE (≥ ${CORE_ROLE_MIN_FTE})`,
    };
  }

  if (tenureOk && !depthOk) {
    return {
      value: 0.15,
      note: `Present for phase length but below core depth (${input.fteOnEngagement.toFixed(2)} < ${CORE_ROLE_MIN_FTE} FTE) — specialist consult, not core assignment`,
    };
  }

  if (!tenureOk && depthOk) {
    return {
      value: 0.2,
      note: `Depth met but tenure short of one phase (${input.weeksOnEngagement}/${needWeeks} weeks)`,
    };
  }

  // Present but neither tenure nor depth — weak positive only if some assignment exists
  if (input.fteOnEngagement > 0 || input.weeksOnEngagement > 0) {
    return {
      value: 0.05,
      note: `Partial assignment: ${input.weeksOnEngagement} weeks at ${input.fteOnEngagement.toFixed(2)} FTE`,
    };
  }

  return null;
}

/**
 * capacity_discipline value (−1..1) against the 70/20/10 split.
 * `committedFraction` = fraction of the person's FTE on committed delivery (0..1+).
 */
export function scoreCapacityDiscipline(input: {
  committedFraction: number;
  engagementCount: number;
}): { value: number; note: string } | null {
  if (input.committedFraction <= 0 && input.engagementCount <= 0) {
    return null;
  }

  let value = 0;
  const notes: string[] = [];

  const target = CAPACITY_SPLIT.committed;
  const delta = input.committedFraction - target;

  if (input.committedFraction > COMMITTED_OVERLOAD_THRESHOLD) {
    value -= Math.min(0.9, (input.committedFraction - COMMITTED_OVERLOAD_THRESHOLD) * 2);
    notes.push(
      `Committed load ${(input.committedFraction * 100).toFixed(0)}% exceeds ${COMMITTED_OVERLOAD_THRESHOLD * 100}% overload band`,
    );
  } else if (Math.abs(delta) <= 0.08) {
    value += 0.55;
    notes.push(`Committed load near 70% target (${(input.committedFraction * 100).toFixed(0)}%)`);
  } else if (input.committedFraction < target - 0.2) {
    value += 0.15;
    notes.push(`Committed load low (${(input.committedFraction * 100).toFixed(0)}%) — unallocated capacity available`);
  } else {
    value += 0.3;
    notes.push(`Committed load ${(input.committedFraction * 100).toFixed(0)}% vs 70% target`);
  }

  if (input.engagementCount > MAX_ENGAGEMENTS_PER_PERSON) {
    value -= 0.4;
    notes.push(
      `On ${input.engagementCount} engagements (max ${MAX_ENGAGEMENTS_PER_PERSON})`,
    );
  }

  value = Math.max(-1, Math.min(1, value));
  return { value, note: notes.join('; ') };
}

/** Delivery Compass rigour metric targets (doc 09 §9). */
export const RIGOUR_METRIC_TARGETS = {
  evidenceCompleteness: 0.85,
  decisionTraceability: 0.9,
  assignmentStability: 0.75,
  nfrCoverageByAlphaEnd: 1,
  assuranceFirstPassRate: 0.7,
} as const;
