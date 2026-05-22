import { describe, expect, it } from 'vitest';
import { computeBidOutlook } from '@/lib/engine/bid';
import { maxEvidenceStrengthForPoint } from '@/lib/engine/evidence-config';
import { computeReadiness } from '@/lib/engine/readiness';
import { computeRigour, rigourBoostForPoint7 } from '@/lib/engine/rigour';
import { enrichAdaptationWithEconomics } from '@/lib/engine/adaptation-economics';
import { computeAdaptation } from '@/lib/engine/adaptation';
import type { AnalysisInput } from '@/lib/types/analysis';

const minimalTeam: AnalysisInput = {
  phase: 'discovery',
  standardId: 'wales',
  requirementRoles: [],
  people: [
    {
      id: 'p1',
      displayName: 'Lead',
      isVacancy: false,
      skills: [{ skillId: 'user-research', level: 'practitioner' }],
    },
  ],
  assignments: [{ personId: 'p1', roleLevelId: 'ur-1' }],
  roleLevels: [
    {
      id: 'ur-1',
      roleId: 'user-researcher',
      roleName: 'User researcher',
      levelName: 'Working',
      seniorityRank: 1,
      skills: [{ skillId: 'user-research', skillName: 'User research', requiredLevel: 'working' }],
    },
  ],
  standardPoints: [
    {
      id: 'pt-7',
      number: 7,
      title: 'Use agile ways of working',
      category: 'Delivery',
      compositionDriven: false,
      statutoryNote: null,
      evidenceTypes: ['sprint notes'],
      phaseEmphasis: ['alpha'],
      roleDeps: [{ roleId: 'delivery-manager', weight: 1, minSeniorityRank: 0 }],
      skillDeps: [],
    },
  ],
  rolesById: new Map([['delivery-manager', { id: 'delivery-manager', name: 'Delivery manager' }]]),
};

describe('evidence in readiness', () => {
  it('caps strong status when evidence is only asserted', () => {
    const without = computeReadiness(minimalTeam);
    const withAsserted = computeReadiness({
      ...minimalTeam,
      evidenceByPoint: new Map([
        ['pt-7', [{ pointId: 'pt-7', strength: 'asserted', title: 'Retro notes' }]],
      ]),
    });
    expect(without.points[0].evidenceStrength).toBe(0);
    expect(withAsserted.points[0].evidenceStrength).toBe(25);
    expect(withAsserted.points[0].status).not.toBe('strong');
  });

  it('documented evidence can reach strong with capability', () => {
    const input: AnalysisInput = {
      ...minimalTeam,
      assignments: [
        {
          personId: 'p1',
          roleLevelId: 'dm-1',
        },
      ],
      roleLevels: [
        {
          id: 'dm-1',
          roleId: 'delivery-manager',
          roleName: 'Delivery manager',
          levelName: 'Working',
          seniorityRank: 2,
          skills: [],
        },
      ],
      evidenceByPoint: new Map([
        ['pt-7', [{ pointId: 'pt-7', strength: 'demonstrated', title: 'Sprint board' }]],
      ]),
      rigourPercent: 80,
    };
    const r = computeReadiness(input);
    expect(r.points[0].evidenceStrength).toBeGreaterThanOrEqual(75);
    expect(maxEvidenceStrengthForPoint([{ strength: 'demonstrated' }])).toBe(0.75);
  });
});

describe('rigour', () => {
  it('computes overall and weaknesses', () => {
    const r = computeRigour([
      { dimension: 'cadence_and_flow', score: 4 },
      { dimension: 'research_in_delivery', score: 2 },
      { dimension: 'iteration_evidence', score: 1 },
      { dimension: 'governance_fit', score: 3 },
      { dimension: 'spend_and_gates', score: 3 },
      { dimension: 'team_stability', score: 2 },
      { dimension: 'risk_management', score: 3 },
    ]);
    expect(r.overallPercent).toBeGreaterThan(0);
    expect(r.topWeaknesses.length).toBeGreaterThan(0);
    expect(rigourBoostForPoint7(80)).toBe(0.15);
  });
});

describe('bid scoring', () => {
  it('predicts bands and flags pass-fail risk', () => {
    const outlook = computeBidOutlook({
      team: minimalTeam,
      scoringScaleMax: 5,
      qualityWeight: 0.7,
      evidenceByPoint: new Map(),
      evidenceByQuestion: new Map(),
      questions: [
        {
          questionId: 'q1',
          ref: 'Q1',
          text: 'Team capability',
          weight: 1,
          passThreshold: 3,
          isPassFail: true,
          category: 'capability',
          roleDeps: [{ roleId: 'user-researcher', weight: 1, minSeniorityRank: 0 }],
          skillDeps: [{ skillId: 'user-research', minLevel: 'practitioner', weight: 1 }],
        },
      ],
    });
    expect(outlook.questions[0].predictedBand).toBeGreaterThanOrEqual(0);
    expect(outlook.overallQualityOutlook).toBeGreaterThanOrEqual(0);
    expect(outlook.topPointMovers.length).toBeGreaterThan(0);
  });
});

describe('adaptation economics', () => {
  it('ranks by impact per pound and flags infeasible', () => {
    const readiness = computeReadiness(minimalTeam);
    const plan = computeAdaptation(readiness, { overallPercent: 50, roles: [], singlePointsOfFailure: [], rationale: [] });
    const enriched = enrichAdaptationWithEconomics(plan, readiness, { overallPercent: 50, roles: [], singlePointsOfFailure: [], rationale: [] }, {
      budgetCap: 100,
    });
    expect(enriched.actions.some((a) => a.estimatedCost != null)).toBe(true);
    expect(enriched.actions[0].impactPerPound != null || enriched.actions[0].id === 'constraint-warning').toBe(true);
  });
});
