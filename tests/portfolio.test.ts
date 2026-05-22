import { describe, expect, it } from 'vitest';
import type { PortfolioEngagementRow } from '@/lib/portfolio/rollup';

describe('portfolio row shape', () => {
  it('aggregates gap counts for dashboard', () => {
    const rows: PortfolioEngagementRow[] = [
      {
        id: '1',
        name: 'A',
        standardId: 'wales',
        phase: 'discovery',
        readinessPercent: 41,
        readinessBand: 'At risk',
        rigourPercent: 50,
        callOffOutlook: 30,
        gapPointCount: 5,
        statutoryGapCount: 2,
        passFailRiskCount: 1,
        evidenceCount: 1,
        lastRunAt: new Date(),
      },
    ];
    const totalGaps = rows.reduce((s, r) => s + r.gapPointCount, 0);
    expect(totalGaps).toBe(5);
    expect(rows[0].statutoryGapCount).toBe(2);
  });
});
