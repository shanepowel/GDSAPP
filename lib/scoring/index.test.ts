import { describe, expect, it } from 'vitest';
import { score } from './index';
import type { ScoringInput } from './types';

const emptyInput: ScoringInput = {
  criteria: [],
  judgements: [],
  evidence: [],
  capabilityLinks: [],
  entities: [],
  assignments: [],
  people: [],
  now: new Date('2026-07-30T12:00:00.000Z'),
};

describe('score', () => {
  it('returns index null when data is insufficient (Phase 0 skeleton)', () => {
    const result = score(emptyInput);
    expect(result.index).toBeNull();
    expect(result.confidence).toBe('low');
    expect(result.byCriterion).toEqual([]);
    expect(result.gaps).toEqual([]);
    expect(result.statutoryGaps).toEqual([]);
  });
});
