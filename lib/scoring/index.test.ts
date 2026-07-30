import { describe, expect, it } from 'vitest';
import { score, type FullScoringInput } from './index';
import type { Criterion, Judgement } from './types';

const now = new Date('2026-07-30T12:00:00.000Z');

function baseCriteria(n: number): Criterion[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `c${i + 1}`,
    ref: String(i + 1),
    title: `Criterion ${i + 1}`,
    statement: `Statement ${i + 1}`,
    weight: 1,
    statutory: i === 0,
    phases: ['discovery', 'alpha', 'beta', 'live'],
  }));
}

function judgement(criterionId: string, verdict: Judgement['verdict']): Judgement {
  return {
    id: `j-${criterionId}`,
    criterionId,
    verdict,
    rationale: 'Confirmed with sufficient written rationale for the panel.',
    confirmedByUserId: 'user-1',
    supersededById: null,
    createdAt: now,
  };
}

function emptyExtras(criteria: Criterion[]): Omit<FullScoringInput, 'criteria' | 'judgements' | 'now'> {
  return {
    evidence: [],
    capabilityLinks: [],
    capabilityRequirements: criteria.map((c) => ({
      id: `req-${c.id}`,
      criterionId: c.id,
      roleArchetype: 'Product manager',
    })),
    entities: [],
    assignments: [],
    people: [],
  };
}

describe('score', () => {
  it('returns index null when fewer than three confirmed judgements', () => {
    const criteria = baseCriteria(5);
    const result = score({
      ...emptyExtras(criteria),
      criteria,
      judgements: [judgement('c1', 'met'), judgement('c2', 'met')],
      now,
    });
    expect(result.index).toBeNull();
    expect(result.confidence).toBe('low');
  });

  it('computes an index from weighted verdicts when enough judgements exist', () => {
    const criteria = baseCriteria(4);
    const entities = [
      { id: 'e1', name: 'PM', type: 'role' as const, accountabilities: ['Outcomes'] },
    ];
    const result = score({
      criteria,
      judgements: [
        judgement('c1', 'met'),
        judgement('c2', 'met'),
        judgement('c3', 'met'),
        judgement('c4', 'not-met'),
      ],
      evidence: criteria.map((c) => ({
        id: `ev-${c.id}`,
        title: 'Fresh evidence',
        expiresAt: new Date('2027-01-01'),
        criterionIds: [c.id],
      })),
      capabilityRequirements: criteria.map((c) => ({
        id: `req-${c.id}`,
        criterionId: c.id,
        roleArchetype: 'Product manager',
      })),
      capabilityLinks: criteria.map((c) => ({
        id: `link-${c.id}`,
        engagementId: 'eng',
        capabilityRequirementId: `req-${c.id}`,
        entityId: 'e1',
        accountabilityIndex: 0,
        strength: 'satisfies' as const,
        confirmed: true,
      })),
      entities,
      assignments: [{ id: 'a1', entityId: 'e1', personId: 'p1', fteBasisPoints: 100 }],
      people: [{ id: 'p1', name: 'Ash', email: null }],
      now,
    });
    expect(result.index).not.toBeNull();
    expect(result.index).toBe(75);
  });

  it('caps met to at-risk when the only evidence is expired', () => {
    const criteria = baseCriteria(3);
    const entities = [
      { id: 'e1', name: 'PM', type: 'role' as const, accountabilities: ['Outcomes'] },
    ];
    const result = score({
      criteria,
      judgements: [
        judgement('c1', 'met'),
        judgement('c2', 'met'),
        judgement('c3', 'met'),
      ],
      evidence: [
        {
          id: 'ev1',
          title: 'Old research',
          expiresAt: new Date('2020-01-01'),
          criterionIds: ['c1'],
        },
      ],
      capabilityRequirements: criteria.map((c) => ({
        id: `req-${c.id}`,
        criterionId: c.id,
        roleArchetype: 'Product manager',
      })),
      capabilityLinks: criteria.map((c) => ({
        id: `link-${c.id}`,
        engagementId: 'eng',
        capabilityRequirementId: `req-${c.id}`,
        entityId: 'e1',
        accountabilityIndex: 0,
        strength: 'satisfies' as const,
        confirmed: true,
      })),
      entities,
      assignments: [{ id: 'a1', entityId: 'e1', personId: 'p1', fteBasisPoints: 100 }],
      people: [{ id: 'p1', name: 'Ash', email: null }],
      now,
    });
    const c1 = result.byCriterion.find((c) => c.criterionId === 'c1')!;
    expect(c1.verdict).toBe('at-risk');
    expect(c1.chainBreak).toBe('evidence-expired');
  });

  it('never lowers the index when fresh evidence is added (monotonicity smoke)', () => {
    const criteria = baseCriteria(3);
    const base: FullScoringInput = {
      ...emptyExtras(criteria),
      criteria,
      judgements: [
        judgement('c1', 'at-risk'),
        judgement('c2', 'at-risk'),
        judgement('c3', 'at-risk'),
      ],
      now,
    };
    const before = score(base);
    const after = score({
      ...base,
      evidence: [
        {
          id: 'ev-new',
          title: 'Fresh',
          expiresAt: new Date('2027-01-01'),
          criterionIds: ['c1', 'c2', 'c3'],
        },
      ],
    });
    expect(before.index).not.toBeNull();
    expect(after.index).not.toBeNull();
    expect(after.index!).toBeGreaterThanOrEqual(before.index!);
  });

  it('reports statutory not-met separately and sets low confidence', () => {
    const criteria = baseCriteria(3);
    criteria[0].statutory = true;
    const result = score({
      ...emptyExtras(criteria),
      criteria,
      judgements: [
        judgement('c1', 'not-met'),
        judgement('c2', 'met'),
        judgement('c3', 'met'),
      ],
      evidence: [
        {
          id: 'ev',
          title: 'E',
          expiresAt: null,
          criterionIds: ['c2', 'c3'],
        },
      ],
      now,
    });
    expect(result.confidence).toBe('low');
    expect(result.statutoryGaps.length).toBeGreaterThan(0);
  });
});
