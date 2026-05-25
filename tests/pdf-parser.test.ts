import { describe, expect, it } from 'vitest';
import { parseTenderPdfText } from '@/lib/tender/pdf-parser';

describe('parseTenderPdfText', () => {
  it('extracts numbered questions', () => {
    const text = `
Question 1: Describe your approach to user research for this discovery.
Include references to Wales standard point 1.

Q2. Explain how you will meet Welsh language requirements on this service.
This is a pass/fail criterion for bilingual capability.
`;
    const questions = parseTenderPdfText(text);
    expect(questions.length).toBeGreaterThanOrEqual(2);
    expect(questions[0].ref).toMatch(/1|Q1/i);
    expect(questions.some((q) => q.isPassFail)).toBe(true);
  });

  it('falls back to paragraph chunks when no headings', () => {
    const text = 'A'.repeat(120) + '\n\n' + 'B'.repeat(120);
    const questions = parseTenderPdfText(text);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].confidence).toBe('low');
  });
});
