import { describe, expect, it } from 'vitest';
import { computeInsights } from './insights';
import { hashInsightsInputs } from './insights-cache';

const sample = {
  entities: [
    {
      id: 'e1',
      name: 'Delivery',
      type: 'circle',
      purpose: 'Deliver',
      domain: null,
      accountabilities: ['own roadmap'],
      policies: [],
      parentId: null,
    },
    {
      id: 'e2',
      name: 'PM',
      type: 'role',
      purpose: null,
      domain: null,
      accountabilities: [],
      policies: [],
      parentId: 'e1',
    },
  ],
  relationships: [
    { id: 'r1', sourceId: 'e2', targetId: 'e1', type: 'reports-to', metadata: {} },
  ],
  people: [{ id: 'p1', name: 'Ada', email: null, fte: 100, skills: [], notes: null }],
  assignments: [{ id: 'a1', personId: 'p1', entityId: 'e2', allocation: 100 }],
};

describe('insights inputs hash', () => {
  it('is stable for the same graph shape', () => {
    const a = hashInsightsInputs(sample);
    const b = hashInsightsInputs(sample);
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it('changes when topology changes', () => {
    const before = hashInsightsInputs(sample);
    const after = hashInsightsInputs({
      ...sample,
      relationships: [],
    });
    expect(after).not.toBe(before);
  });

  it('matches computeInsights determinism for caching', () => {
    const first = computeInsights(sample);
    const second = computeInsights(sample);
    expect(second).toEqual(first);
  });
});
