import { describe, expect, it } from 'vitest';
import { buildGapList, type PackItemInput } from '@/lib/crosswalk/gap-list';
import { buildPackExport } from '@/lib/crosswalk/export';

function item(
  partial: Partial<PackItemInput> & Pick<PackItemInput, 'id' | 'ref' | 'title'>,
): PackItemInput {
  return {
    question: null,
    sortOrder: 0,
    mappings: [],
    ...partial,
  };
}

describe('buildGapList', () => {
  it('splits answerable, evidence gap, and out of scope', () => {
    const result = buildGapList([
      item({
        id: 'a',
        ref: 'Q1',
        title: 'User need',
        sortOrder: 1,
        mappings: [
          {
            relation: 'satisfies',
            note: 'maps',
            criterionId: 'c1',
            criterionRef: '1',
            criterionTitle: 'Understand user needs',
            evidenceCount: 2,
          },
        ],
      }),
      item({
        id: 'b',
        ref: 'Q2',
        title: 'Team',
        sortOrder: 2,
        mappings: [
          {
            relation: 'partially',
            note: 'maps',
            criterionId: 'c2',
            criterionRef: '6',
            criterionTitle: 'Have a multidisciplinary team',
            evidenceCount: 0,
          },
        ],
      }),
      item({
        id: 'c',
        ref: 'Q3',
        title: 'Unmapped',
        sortOrder: 3,
        mappings: [],
      }),
    ]);

    expect(result.counts).toEqual({
      answerableNow: 1,
      evidenceGap: 1,
      outOfScope: 1,
      total: 3,
    });
    expect(result.coveragePercent).toBe(67);
    expect(result.readyPercent).toBe(33);
    expect(result.answerableNow[0]?.ref).toBe('Q1');
    expect(result.evidenceGap[0]?.ref).toBe('Q2');
    expect(result.outOfScope[0]?.ref).toBe('Q3');
  });
});

describe('buildPackExport', () => {
  it('cites the same evidence across pack structure with attributions', () => {
    const items: PackItemInput[] = [
      item({
        id: 'a',
        ref: 'Gate 3 / Q1.1',
        title: 'User need',
        sortOrder: 1,
        mappings: [
          {
            relation: 'satisfies',
            note: 'direct',
            criterionId: 'c1',
            criterionRef: '1',
            criterionTitle: 'User needs',
            evidenceCount: 1,
          },
        ],
      }),
    ];
    const gap = buildGapList(items);
    const doc = buildPackExport({
      packRef: 'nista-gate-3',
      packTitle: 'NISTA Gate 3',
      engagement: { id: 'e1', name: 'Demo', reference: 'DEM-1' },
      generatedAt: '2026-07-30T12:00:00.000Z',
      gap,
      items,
      evidence: [
        {
          id: 'ev1',
          title: 'User research report',
          kind: 'research',
          uri: 'https://example.com/r',
          criterionRefs: ['1'],
        },
      ],
      frameworks: [
        {
          code: 'nista-gateway',
          name: 'NISTA Gateway',
          publisher: 'IPA',
          version: '2024',
          licence: 'OGL-3.0',
          attribution: 'OGL v3.0',
        },
      ],
      crosswalkReview: {
        authoredBy: 'S Powell',
        reviewedBy: 'A Graves',
        reviewedAt: '2026-07-30',
      },
    });

    expect(doc.format).toBe('assemble-gate-pack/v1');
    expect(doc.structure[0]?.evidence[0]?.id).toBe('ev1');
    expect(doc.evidenceIndex).toHaveLength(1);
    expect(doc.attributions[0]?.code).toBe('nista-gateway');
    expect(doc.crosswalkReview?.reviewedBy).toBe('A Graves');
  });
});
