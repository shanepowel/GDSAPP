import type { ScoringResult } from '@/lib/scoring/types';

export type TitleBlockData = {
  reference: string;
  standardLabel: string;
  phase: string;
  revision: string;
  preparedBy: string;
  dateLabel: string;
  serviceName?: string | null;
};

export type ReportSectionId = 'overview' | 'gaps' | 'evidence' | 'legacy-analysis';

/** Always included — not configurable off (spec 6.2). */
export const JUDGEMENT_APPENDIX_SECTION = 'judgements' as const;

export type Confidentiality = 'publishable' | 'client' | 'internal';

const CONF_RANK: Record<Confidentiality, number> = {
  publishable: 0,
  client: 1,
  internal: 2,
};

export function highestConfidentiality(values: string[]): Confidentiality {
  let max: Confidentiality = 'publishable';
  for (const v of values) {
    const key = (v === 'internal' || v === 'client' || v === 'publishable'
      ? v
      : 'client') as Confidentiality;
    if (CONF_RANK[key] > CONF_RANK[max]) max = key;
  }
  return max;
}

export type JudgementRegisterRow = {
  criterionRef: string;
  criterionTitle: string;
  verdict: string;
  rationale: string;
  proposedBy: string;
  confirmerName: string;
  confirmerEmail: string | null;
  confirmedAt: string;
  aiModel: string | null;
  provenanceLabel: string;
};

export type EvidenceSummaryRow = {
  id: string;
  title: string;
  kind: string;
  confidentiality: string;
  provenance: string;
  sourceSystem: string | null;
  expiresAt: string | null;
  criterionRefs: string[];
};

export type AssuranceReportPayload = {
  format: 'assemble-assurance-report/v1';
  productVersion: string;
  generatedAt: string;
  titleBlock: TitleBlockData;
  engagement: { id: string; name: string; reference: string | null };
  confidentiality: Confidentiality;
  scoring: ScoringResult;
  sections: ReportSectionId[];
  judgements: JudgementRegisterRow[];
  evidence: EvidenceSummaryRow[];
  gaps: Array<{
    criterionRef: string;
    title: string;
    reason: string;
    move: string;
    statutory: boolean;
  }>;
};

export function provenanceLabelForJudgement(
  proposedBy: string,
  confirmerName: string,
): string {
  if (proposedBy === 'ai') {
    return `AI drafted · confirmed by ${confirmerName}`;
  }
  if (proposedBy === 'system') {
    return 'System · confirmed';
  }
  return 'Human';
}

export function buildReportFilename(engagementName: string, generatedAt: Date): string {
  const slug = engagementName.replace(/[^a-z0-9]+/gi, '-').slice(0, 40);
  const stamp = generatedAt.toISOString().slice(0, 10);
  return `${slug}-assurance-${stamp}.pdf`;
}
