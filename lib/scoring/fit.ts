/** Team Fit scoring — pure function. No I/O, Date.now, network, or DB. */

export const FIT_SCORING_VERSION = 'fit-1.0.0';

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
  | 'unevidenced_skills';

export type GapKind = 'skills_gap' | 'rigour_gap' | 'capacity_gap';
export type GapRecommendation = 'upskill' | 'second' | 'recruit' | 'rescope';

export interface FitInput {
  requirement: {
    ddatRoleId: string;
    minLevel: SkillLevel;
    criticality: RoleCriticality;
    requiredSkills: Array<{ skillId: string; requiredLevel: SkillLevel; weight: number }>;
    fteRequired: number;
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

export interface FitBreakdown {
  skillContributions: Array<{
    skillId: string;
    requiredLevel: SkillLevel;
    heldLevel: SkillLevel | null;
    weight: number;
    contribution: number;
    evidenced: boolean;
  }>;
  rigourContributions: Array<{
    type: RigourSignalType;
    rawValue: number;
    recencyWeight: number;
    contribution: number;
    provenance: SignalProvenance;
  }>;
  unevidencedSkillCount: number;
  rigourSignalCount: number;
  capacityShortfall: number | null;
  notes: FitNote[];
}

const LEVEL_ORDINAL: Record<SkillLevel, number> = {
  awareness: 1,
  working: 2,
  practitioner: 3,
  expert: 4,
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function levelOrdinal(level: SkillLevel): number {
  return LEVEL_ORDINAL[level];
}

export function bandForScore(composite: number): FitBand {
  if (composite >= 0.8) return 'strong';
  if (composite >= 0.6) return 'viable';
  if (composite >= 0.4) return 'stretch';
  return 'gap';
}

export function computeFit(input: FitInput): {
  skillScore: number;
  rigourMultiplier: number;
  compositeScore: number;
  band: FitBand;
  breakdown: FitBreakdown;
} {
  const notes: FitNote[] = [];
  const skillContributions: FitBreakdown['skillContributions'] = [];

  let weightSum = 0;
  let weightedSkill = 0;
  let unevidencedSkillCount = 0;

  const required =
    input.requirement.requiredSkills.length > 0
      ? input.requirement.requiredSkills
      : [
          {
            skillId: input.requirement.ddatRoleId,
            requiredLevel: input.requirement.minLevel,
            weight: 1,
          },
        ];

  for (const req of required) {
    const held = input.candidate.skills.find((s) => s.skillId === req.skillId);
    const heldLevel = held?.level ?? null;
    const evidenced = Boolean(held?.evidenceId);
    if (held && !evidenced) unevidencedSkillCount += 1;

    const requiredOrdinal = levelOrdinal(req.requiredLevel);
    const heldOrdinal = heldLevel ? levelOrdinal(heldLevel) : 0;
    const perSkill =
      requiredOrdinal === 0 ? 0 : clamp(heldOrdinal / requiredOrdinal, 0, 1);

    skillContributions.push({
      skillId: req.skillId,
      requiredLevel: req.requiredLevel,
      heldLevel,
      weight: req.weight,
      contribution: perSkill,
      evidenced: Boolean(held) && evidenced,
    });

    weightSum += req.weight;
    weightedSkill += perSkill * req.weight;
  }

  const skillScore = weightSum === 0 ? 0 : weightedSkill / weightSum;
  if (unevidencedSkillCount > 0) notes.push('unevidenced_skills');

  const rigourContributions: FitBreakdown['rigourContributions'] = [];
  let rigourMultiplier = 1.0;

  if (input.rigourSignals.length === 0) {
    notes.push('no_rigour_signals');
  } else {
    let recencySum = 0;
    let weighted = 0;
    let allStale = true;
    for (const signal of input.rigourSignals) {
      const recencyWeight = Math.max(0.3, 1 - signal.observedAtDaysAgo / 730);
      if (signal.observedAtDaysAgo < 730) allStale = false;
      const contribution = signal.value * recencyWeight;
      rigourContributions.push({
        type: signal.type,
        rawValue: signal.value,
        recencyWeight,
        contribution,
        provenance: signal.provenance,
      });
      recencySum += recencyWeight;
      weighted += contribution;
    }
    const avg = recencySum === 0 ? 0 : weighted / recencySum;
    rigourMultiplier = clamp(1 + avg * 0.15, 0.75, 1.15);
    if (allStale) notes.push('stale_signals_only');
  }

  const compositeScore = clamp(skillScore * rigourMultiplier, 0, 1);
  const band = bandForScore(compositeScore);

  const capacityShortfall =
    input.candidate.availableFte + 1e-9 < input.requirement.fteRequired
      ? input.requirement.fteRequired - input.candidate.availableFte
      : null;
  if (capacityShortfall != null) notes.push('capacity_constrained');

  return {
    skillScore,
    rigourMultiplier,
    compositeScore,
    band,
    breakdown: {
      skillContributions,
      rigourContributions,
      unevidencedSkillCount,
      rigourSignalCount: input.rigourSignals.length,
      capacityShortfall,
      notes,
    },
  };
}

export function classifyGap(args: {
  criticality: RoleCriticality;
  bestComposite: number | null;
  bestSkill: number | null;
  capacityOnly: boolean;
}): {
  kind: GapKind;
  recommendation: GapRecommendation;
  severity: number;
} {
  const criticalityWeight =
    args.criticality === 'core' ? 3 : args.criticality === 'supporting' ? 2 : 1;

  if (args.capacityOnly) {
    return {
      kind: 'capacity_gap',
      recommendation: args.criticality === 'core' ? 'recruit' : 'rescope',
      severity: clamp(criticalityWeight * 2, 1, 5),
    };
  }

  const composite = args.bestComposite ?? 0;
  const skill = args.bestSkill ?? 0;
  const shortfallBand = composite < 0.4 ? 2 : 1;

  if (composite < 0.4 && skill < 0.4) {
    return {
      kind: 'skills_gap',
      recommendation: args.criticality === 'core' ? 'recruit' : 'upskill',
      severity: clamp(criticalityWeight * shortfallBand, 1, 5),
    };
  }

  if (composite < 0.4 && skill >= 0.6) {
    return {
      kind: 'rigour_gap',
      recommendation: 'second',
      severity: clamp(criticalityWeight * shortfallBand, 1, 5),
    };
  }

  return {
    kind: 'skills_gap',
    recommendation: 'upskill',
    severity: clamp(criticalityWeight * shortfallBand, 1, 5),
  };
}
