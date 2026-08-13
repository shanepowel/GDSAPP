/**
 * Team Fit scoring — pure function.
 * No I/O, no clock, no randomness, no imports from Prisma, next, or the network.
 * Anything time-dependent is passed in already computed by the caller.
 */

export const FIT_SCORING_VERSION = 'fit-1.0.0';

/** The datum. Read by the UI so the rule and the maths cannot drift apart. */
export const VIABILITY_THRESHOLD = 0.6;

export const BANDS = { strong: 0.8, viable: 0.6, stretch: 0.4 } as const;

/** Rigour multiplier is bounded. Capability alone can never be overwhelmed by rigour. */
export const RIGOUR_BOUNDS = { min: 0.75, max: 1.15 } as const;
const RIGOUR_SENSITIVITY = 0.15;

/** Two year decay, floored so old evidence still counts for something. */
const RECENCY_HALF_LIFE_DAYS = 730;
const RECENCY_FLOOR = 0.3;
const STALE_AFTER_DAYS = 730;

export type SkillLevel = 'awareness' | 'working' | 'practitioner' | 'expert';
export type RoleCriticality = 'core' | 'supporting' | 'optional';
export type FitBand = 'strong' | 'viable' | 'stretch' | 'gap';
export type SignalProvenance = 'derived' | 'asserted';

export type RigourSignalType =
  | 'sustained_assignment'
  | 'capacity_discipline'
  | 'nfr_planning'
  | 'spike_discipline'
  | 'assurance_participation'
  | 'handover_quality';

export type FitNote =
  | 'no_rigour_signals'
  | 'stale_signals_only'
  | 'capacity_constrained'
  | 'unevidenced_skills'
  | 'derived_evidence_only';

export const LEVEL_ORDINAL: Record<SkillLevel, number> = {
  awareness: 1,
  working: 2,
  practitioner: 3,
  expert: 4,
};

export const LEVEL_LABEL: Record<SkillLevel, string> = {
  awareness: 'Awareness',
  working: 'Working',
  practitioner: 'Practitioner',
  expert: 'Expert',
};

export interface FitInput {
  requirement: {
    ddatRoleId: string;
    minLevel: SkillLevel;
    criticality: RoleCriticality;
    fteRequired: number;
    requiredSkills: Array<{ skillId: string; requiredLevel: SkillLevel; weight: number }>;
  };
  candidate: {
    personId: string;
    skills: Array<{ skillId: string; level: SkillLevel; evidenceId?: string }>;
    availableFte: number;
  };
  rigourSignals: Array<{
    type: RigourSignalType;
    value: number;
    provenance: SignalProvenance;
    observedAtDaysAgo: number;
  }>;
}

export interface SkillContribution {
  skillId: string;
  requiredLevel: SkillLevel;
  heldLevel: SkillLevel | null;
  weight: number;
  contribution: number;
  evidenced: boolean;
}

export interface RigourContribution {
  type: RigourSignalType;
  rawValue: number;
  recencyWeight: number;
  contribution: number;
  provenance: SignalProvenance;
}

export interface FitBreakdown {
  skillContributions: SkillContribution[];
  rigourContributions: RigourContribution[];
  unevidencedSkillCount: number;
  rigourSignalCount: number;
  capacityShortfall: number | null;
  notes: FitNote[];
}

export interface FitResult {
  skillScore: number;
  rigourMultiplier: number;
  compositeScore: number;
  band: FitBand;
  breakdown: FitBreakdown;
  scoringVersion: string;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function levelOrdinal(level: SkillLevel): number {
  return LEVEL_ORDINAL[level];
}

/** Ordinal to label, for rendering a breakdown without a second lookup table. */
export function levelFromOrdinal(n: number): SkillLevel | null {
  const found = (Object.keys(LEVEL_ORDINAL) as SkillLevel[]).find((k) => LEVEL_ORDINAL[k] === n);
  return found ?? null;
}

export function bandFor(composite: number): FitBand {
  if (composite >= BANDS.strong) return 'strong';
  if (composite >= BANDS.viable) return 'viable';
  if (composite >= BANDS.stretch) return 'stretch';
  return 'gap';
}

/** @deprecated Use bandFor. Kept so existing tests and call sites compile. */
export function bandForScore(composite: number): FitBand {
  return bandFor(composite);
}

export function computeFit(input: FitInput): FitResult {
  const { requirement, candidate, rigourSignals } = input;
  const notes: FitNote[] = [];

  const required =
    requirement.requiredSkills.length > 0
      ? requirement.requiredSkills
      : [
          {
            skillId: requirement.ddatRoleId,
            requiredLevel: requirement.minLevel,
            weight: 1,
          },
        ];

  const held = new Map(candidate.skills.map((s) => [s.skillId, s]));
  const skillContributions: SkillContribution[] = required.map((req) => {
    const match = held.get(req.skillId);
    const need = LEVEL_ORDINAL[req.requiredLevel];
    const have = match ? LEVEL_ORDINAL[match.level] : 0;
    return {
      skillId: req.skillId,
      requiredLevel: req.requiredLevel,
      heldLevel: match ? match.level : null,
      weight: req.weight,
      contribution: need === 0 ? 0 : clamp(have / need, 0, 1),
      evidenced: Boolean(match?.evidenceId),
    };
  });

  const weightTotal = skillContributions.reduce((a, c) => a + c.weight, 0);
  const skillScore =
    weightTotal > 0
      ? skillContributions.reduce((a, c) => a + c.contribution * c.weight, 0) / weightTotal
      : 0;

  const unevidencedSkillCount = skillContributions.filter((c) => c.heldLevel && !c.evidenced).length;
  if (unevidencedSkillCount > 0) notes.push('unevidenced_skills');

  let rigourMultiplier = 1.0;
  const rigourContributions: RigourContribution[] = [];

  if (rigourSignals.length > 0) {
    let weighted = 0;
    let weightSum = 0;

    for (const signal of rigourSignals) {
      const recencyWeight = Math.max(
        RECENCY_FLOOR,
        1 - signal.observedAtDaysAgo / RECENCY_HALF_LIFE_DAYS,
      );
      const value = clamp(signal.value, -1, 1);
      weighted += value * recencyWeight;
      weightSum += recencyWeight;
      rigourContributions.push({
        type: signal.type,
        rawValue: value,
        recencyWeight,
        contribution: value * recencyWeight,
        provenance: signal.provenance,
      });
    }

    const mean = weightSum > 0 ? weighted / weightSum : 0;
    rigourMultiplier = clamp(1 + mean * RIGOUR_SENSITIVITY, RIGOUR_BOUNDS.min, RIGOUR_BOUNDS.max);

    if (rigourSignals.every((s) => s.observedAtDaysAgo > STALE_AFTER_DAYS)) {
      notes.push('stale_signals_only');
    }
    if (rigourSignals.every((s) => s.provenance === 'derived')) {
      notes.push('derived_evidence_only');
    }
  } else {
    notes.push('no_rigour_signals');
  }

  const shortfall = requirement.fteRequired - candidate.availableFte;
  const capacityShortfall = shortfall > 1e-9 ? Number(shortfall.toFixed(2)) : null;
  if (capacityShortfall !== null) notes.push('capacity_constrained');

  const compositeScore = clamp(skillScore * rigourMultiplier, 0, 1);

  return {
    skillScore: round3(skillScore),
    rigourMultiplier: round3(rigourMultiplier),
    compositeScore: round3(compositeScore),
    band: bandFor(compositeScore),
    breakdown: {
      skillContributions,
      rigourContributions,
      unevidencedSkillCount,
      rigourSignalCount: rigourSignals.length,
      capacityShortfall,
      notes,
    },
    scoringVersion: FIT_SCORING_VERSION,
  };
}

/** Rebuild a FitResult from a stored row so the strip never invents numbers. */
export function fitFromStored(row: {
  skillScore: number;
  rigourMultiplier: number;
  compositeScore: number;
  band: string;
  breakdown: unknown;
  scoringVersion?: string | null;
}): FitResult {
  const breakdown = (row.breakdown ?? {
    skillContributions: [],
    rigourContributions: [],
    unevidencedSkillCount: 0,
    rigourSignalCount: 0,
    capacityShortfall: null,
    notes: [],
  }) as FitBreakdown;
  return {
    skillScore: row.skillScore,
    rigourMultiplier: row.rigourMultiplier,
    compositeScore: row.compositeScore,
    band: bandFor(row.compositeScore),
    breakdown,
    scoringVersion: row.scoringVersion ?? FIT_SCORING_VERSION,
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export type GapKind = 'skills_gap' | 'rigour_gap' | 'capacity_gap';
export type GapRecommendation = 'upskill' | 'second' | 'recruit' | 'rescope';

export function classifyGap(
  best: FitResult | null,
  criticality: RoleCriticality,
): { kind: GapKind; recommendation: GapRecommendation; severity: number } | null {
  if (!best) {
    return { kind: 'skills_gap', recommendation: 'recruit', severity: severityFor(criticality, 2) };
  }
  const { compositeScore, skillScore, breakdown } = best;

  if (compositeScore >= BANDS.viable && breakdown.capacityShortfall !== null) {
    return { kind: 'capacity_gap', recommendation: 'rescope', severity: severityFor(criticality, 1) };
  }
  if (compositeScore >= BANDS.viable) return null;

  const shortfallBand = compositeScore < BANDS.stretch ? 2 : 1;

  if (skillScore >= BANDS.viable) {
    return { kind: 'rigour_gap', recommendation: 'second', severity: severityFor(criticality, shortfallBand) };
  }
  return {
    kind: 'skills_gap',
    recommendation: criticality === 'core' ? 'recruit' : 'upskill',
    severity: severityFor(criticality, shortfallBand),
  };
}

function severityFor(criticality: RoleCriticality, shortfallBand: number): number {
  const weight = criticality === 'core' ? 3 : criticality === 'supporting' ? 2 : 1;
  return clamp(weight * shortfallBand, 1, 5);
}
