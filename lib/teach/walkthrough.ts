/**
 * Walkthrough pool for the eight-step tour (spec 12).
 * Teaching data only — never written to judgements, entities, or evidence.
 * Fit is scored through lib/scoring so the demo cannot drift from the instrument.
 */

import {
  computeFit,
  levelFromOrdinal,
  VIABILITY_THRESHOLD,
  type FitResult,
  type RoleCriticality,
  type SignalProvenance,
  type SkillLevel,
} from '@/lib/scoring/fit';

export type WalkthroughSkill = {
  id: string;
  level: SkillLevel;
  weight: number;
};

export type WalkthroughRole = {
  rid: string;
  title: string;
  min: SkillLevel;
  fte: number;
  crit: RoleCriticality;
  skills: WalkthroughSkill[];
};

export type WalkthroughSignal = {
  type:
    | 'sustained_assignment'
    | 'capacity_discipline'
    | 'nfr_planning'
    | 'assurance_participation'
    | 'handover_quality';
  provenance: SignalProvenance;
  value: number;
  note: string;
};

export type WalkthroughPerson = {
  name: string;
  role: string;
  free: number;
  /** Four phases: 1 stayed with one engagement, 0 did not. */
  phases: [number, number, number, number];
  skills: Record<string, number>;
  signals: WalkthroughSignal[];
};

export const WALKTHROUGH_ARCHETYPE = 'Discovery squad';

export const WALKTHROUGH_ROLES: WalkthroughRole[] = [
  {
    rid: 'ur',
    title: 'Lead user researcher',
    min: 'practitioner',
    fte: 1.0,
    crit: 'core',
    skills: [
      { id: 'User research methods', level: 'practitioner', weight: 3 },
      { id: 'Agile research practices', level: 'practitioner', weight: 2 },
      { id: 'User-centred practice and advocacy', level: 'working', weight: 2 },
    ],
  },
  {
    rid: 'sd',
    title: 'Service designer',
    min: 'practitioner',
    fte: 1.0,
    crit: 'core',
    skills: [
      { id: 'Evidence-based design', level: 'practitioner', weight: 3 },
      { id: 'Designing for everyone', level: 'practitioner', weight: 3 },
      { id: 'Designing strategically', level: 'working', weight: 2 },
    ],
  },
  {
    rid: 'dm',
    title: 'Delivery manager',
    min: 'working',
    fte: 1.0,
    crit: 'core',
    skills: [
      { id: 'Agile and Lean practices', level: 'practitioner', weight: 3 },
      { id: 'Maintaining delivery momentum', level: 'practitioner', weight: 2 },
      { id: 'Life cycle management', level: 'working', weight: 2 },
    ],
  },
  {
    rid: 'pm',
    title: 'Product manager',
    min: 'practitioner',
    fte: 0.8,
    crit: 'core',
    skills: [
      { id: 'Product management', level: 'practitioner', weight: 3 },
      { id: 'Applying user-centred insights', level: 'practitioner', weight: 2 },
      { id: 'Creating value for money', level: 'working', weight: 2 },
    ],
  },
  {
    rid: 'ta',
    title: 'Technical architect',
    min: 'working',
    fte: 0.5,
    crit: 'supporting',
    skills: [
      { id: 'Making architectural decisions', level: 'working', weight: 3 },
      { id: 'Communicating between the technical and non-technical', level: 'practitioner', weight: 2 },
    ],
  },
  {
    rid: 'cd',
    title: 'Content designer',
    min: 'working',
    fte: 0.5,
    crit: 'supporting',
    skills: [
      { id: 'Content management and architecture', level: 'working', weight: 3 },
      { id: 'Designing for everyone', level: 'working', weight: 2 },
    ],
  },
  {
    rid: 'pa',
    title: 'Performance analyst',
    min: 'awareness',
    fte: 0.2,
    crit: 'optional',
    skills: [
      { id: 'Product and service monitoring', level: 'awareness', weight: 2 },
      { id: 'Data visualisation', level: 'awareness', weight: 1 },
    ],
  },
];

export const WALKTHROUGH_PEOPLE: WalkthroughPerson[] = [
  {
    name: 'Bethan Morris',
    role: 'Senior user researcher',
    free: 0.8,
    phases: [1, 1, 1, 1],
    skills: {
      'User research methods': 4,
      'Agile research practices': 3,
      'User-centred practice and advocacy': 3,
    },
    signals: [
      {
        type: 'sustained_assignment',
        provenance: 'derived',
        value: 0.8,
        note: 'Full phase at 1.0 FTE on Cyfoeth alpha',
      },
      {
        type: 'assurance_participation',
        provenance: 'asserted',
        value: 0.9,
        note: 'Wales DSS alpha assessment passed, no conditions',
      },
    ],
  },
  {
    name: 'Rhys Davies',
    role: 'Service designer',
    free: 0.0,
    phases: [0, 1, 1, 1],
    skills: {
      'Evidence-based design': 3,
      'Designing for everyone': 3,
      'Designing strategically': 2,
    },
    signals: [
      {
        type: 'sustained_assignment',
        provenance: 'derived',
        value: 0.5,
        note: 'One full phase at 0.9 FTE',
      },
    ],
  },
  {
    name: 'Owain Pritchard',
    role: 'Delivery manager',
    free: 0.4,
    phases: [1, 1, 1, 1],
    skills: {
      'Agile and Lean practices': 3,
      'Maintaining delivery momentum': 3,
      'Life cycle management': 3,
    },
    signals: [
      {
        type: 'sustained_assignment',
        provenance: 'derived',
        value: 0.9,
        note: 'Two consecutive full phases',
      },
      {
        type: 'capacity_discipline',
        provenance: 'derived',
        value: 0.8,
        note: 'Within the split, 14 of 14 sprints',
      },
      {
        type: 'nfr_planning',
        provenance: 'asserted',
        value: 0.7,
        note: '11 targets set before build',
      },
    ],
  },
  {
    name: 'Siân Llewellyn',
    role: 'Product manager',
    free: 0.6,
    phases: [0, 0, 1, 1],
    skills: {
      'Product management': 3,
      'Applying user-centred insights': 2,
      'Creating value for money': 2,
    },
    signals: [
      {
        type: 'assurance_participation',
        provenance: 'asserted',
        value: 0.5,
        note: 'Gate 1, passed with two conditions',
      },
    ],
  },
  {
    name: 'Tomos Edwards',
    role: 'Technical architect',
    free: 0.5,
    phases: [1, 1, 1, 1],
    skills: {
      'Making architectural decisions': 3,
      'Communicating between the technical and non-technical': 2,
    },
    signals: [
      {
        type: 'handover_quality',
        provenance: 'derived',
        value: 0.85,
        note: 'Decision record coverage 96%',
      },
    ],
  },
  {
    name: 'Carys Hughes',
    role: 'Content designer',
    free: 0.2,
    phases: [0, 1, 0, 1],
    skills: {
      'Content management and architecture': 2,
      'Designing for everyone': 2,
    },
    signals: [],
  },
  {
    name: 'Elin Roberts',
    role: 'Performance analyst',
    free: 0.8,
    phases: [1, 0, 1, 0],
    skills: {
      'Product and service monitoring': 2,
      'Data visualisation': 3,
    },
    signals: [
      {
        type: 'capacity_discipline',
        provenance: 'derived',
        value: 0.3,
        note: 'Spread across four engagements',
      },
    ],
  },
  {
    name: 'Dafydd Jones',
    role: 'Business analyst',
    free: 1.0,
    phases: [0, 0, 0, 1],
    skills: {
      'Agile and Lean practices': 2,
      'Life cycle management': 2,
      'User research methods': 1,
    },
    signals: [],
  },
];

export const WALKTHROUGH_DEMAND: Array<{ role: string; need: number; hold: number }> = [
  { role: 'Accessibility specialist', need: 2.4, hold: 0 },
  { role: 'Lead user researcher', need: 3.0, hold: 1.2 },
  { role: 'Content designer, Welsh', need: 1.5, hold: 0.8 },
  { role: 'Performance analyst', need: 1.4, hold: 0.8 },
];

/** roleIndex → personIndex */
export type WalkthroughAssignment = Record<number, number>;

/** Tour steps 5–7 seed the live squad. 1-based tour index. */
export function assignmentForTourStep(step: number): WalkthroughAssignment {
  if (step >= 7) return { 0: 0, 2: 2, 4: 4, 5: 5 };
  if (step >= 6) return { 0: 0, 2: 2, 4: 4 };
  return {};
}

export function isWalkthroughTourStep(step: number): boolean {
  return step === 5 || step === 6 || step === 7;
}

export function longestRun(phases: number[]): number {
  return Math.max(0, ...phases.join('').split('0').map((s) => s.length));
}

export function fitWalkthrough(role: WalkthroughRole, person: WalkthroughPerson): FitResult {
  return computeFit({
    requirement: {
      ddatRoleId: role.rid,
      minLevel: role.min,
      criticality: role.crit,
      fteRequired: role.fte,
      requiredSkills: role.skills.map((s) => ({
        skillId: s.id,
        requiredLevel: s.level,
        weight: s.weight,
      })),
    },
    candidate: {
      personId: person.name,
      skills: Object.entries(person.skills).flatMap(([skillId, ordinal]) => {
        const level = levelFromOrdinal(ordinal);
        return level ? [{ skillId, level }] : [];
      }),
      availableFte: person.free,
    },
    rigourSignals: person.signals.map((s) => ({
      type: s.type,
      value: s.value,
      provenance: s.provenance,
      observedAtDaysAgo: 30,
    })),
  });
}

export function rankedForRole(role: WalkthroughRole) {
  return WALKTHROUGH_PEOPLE.map((person, personIndex) => ({
    person,
    personIndex,
    fit: fitWalkthrough(role, person),
    enoughTime: person.free >= role.fte,
  })).sort((a, b) => b.fit.compositeScore - a.fit.compositeScore);
}

export function squadHealth(assigned: WalkthroughAssignment) {
  let filled = 0;
  let above = 0;
  let stab = 0;
  let coreGaps = 0;

  WALKTHROUGH_ROLES.forEach((role, roleIndex) => {
    const personIndex = assigned[roleIndex];
    if (personIndex === undefined) {
      if (role.crit === 'core') coreGaps += 1;
      return;
    }
    filled += 1;
    const person = WALKTHROUGH_PEOPLE[personIndex];
    const fit = fitWalkthrough(role, person);
    if (fit.compositeScore >= VIABILITY_THRESHOLD) above += 1;
    else if (role.crit === 'core') coreGaps += 1;
    stab += person.phases.filter(Boolean).length / 4;
  });

  return {
    filled,
    total: WALKTHROUGH_ROLES.length,
    above,
    coreGaps,
    stability: filled ? stab / filled : 0,
  };
}
