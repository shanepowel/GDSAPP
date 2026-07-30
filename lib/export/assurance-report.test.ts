import { describe, expect, it } from 'vitest';
import {
  highestConfidentiality,
  provenanceLabelForJudgement,
} from '@/lib/export/assurance-report';
import { assertWelshExportAllowed } from '@/lib/i18n/export-gate';

describe('highestConfidentiality', () => {
  it('picks the most restrictive marking', () => {
    expect(highestConfidentiality(['publishable', 'client'])).toBe('client');
    expect(highestConfidentiality(['client', 'internal'])).toBe('internal');
    expect(highestConfidentiality([])).toBe('publishable');
  });
});

describe('provenanceLabelForJudgement', () => {
  it('labels AI-drafted judgements with confirmer', () => {
    expect(provenanceLabelForJudgement('ai', 'A Graves')).toBe(
      'AI drafted · confirmed by A Graves',
    );
    expect(provenanceLabelForJudgement('human', 'A Graves')).toBe('Human');
  });
});

describe('assertWelshExportAllowed', () => {
  it('allows English always', () => {
    expect(
      assertWelshExportAllowed('en', [
        { locale: 'cy', reviewStatus: 'machine', criterionRef: '1' },
      ]).ok,
    ).toBe(true);
  });

  it('blocks Welsh when any machine translation is present', () => {
    const result = assertWelshExportAllowed('cy', [
      { locale: 'cy', reviewStatus: 'human', criterionRef: '1' },
      { locale: 'cy', reviewStatus: 'machine', criterionRef: '2' },
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.machineCriterionRefs).toContain('2');
    }
  });

  it('allows Welsh when all human-reviewed', () => {
    expect(
      assertWelshExportAllowed('cy', [
        { locale: 'cy', reviewStatus: 'human', criterionRef: '1' },
      ]).ok,
    ).toBe(true);
  });
});
