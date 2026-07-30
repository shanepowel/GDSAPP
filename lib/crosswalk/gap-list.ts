export type CrosswalkRelation = 'satisfies' | 'partially' | 'informs';

export type GapCategory = 'answerable-now' | 'evidence-gap' | 'out-of-scope';

export type PackItemInput = {
  id: string;
  ref: string;
  title: string;
  question: string | null;
  sortOrder: number;
  mappings: Array<{
    relation: string;
    note: string | null;
    criterionId: string;
    criterionRef: string;
    criterionTitle: string;
    evidenceCount: number;
  }>;
};

export type GapListItem = {
  category: GapCategory;
  itemId: string;
  ref: string;
  title: string;
  question: string | null;
  mappings: PackItemInput['mappings'];
  reason: string;
};

export type GapListResult = {
  answerableNow: GapListItem[];
  evidenceGap: GapListItem[];
  outOfScope: GapListItem[];
  counts: {
    answerableNow: number;
    evidenceGap: number;
    outOfScope: number;
    total: number;
  };
  /** Share of pack items that have at least one mapping (0–100). */
  coveragePercent: number;
  /** Share of pack items that are answerable now (0–100). */
  readyPercent: number;
};

/**
 * Categorise gate-pack items for Flow F3:
 * - answerable now — mapped and at least one linked evidence artefact
 * - evidence gap — mapped but no evidence yet
 * - out of scope — no crosswalk mapping to engagement standards
 */
export function buildGapList(items: PackItemInput[]): GapListResult {
  const answerableNow: GapListItem[] = [];
  const evidenceGap: GapListItem[] = [];
  const outOfScope: GapListItem[] = [];

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.ref.localeCompare(b.ref));

  for (const item of sorted) {
    if (item.mappings.length === 0) {
      outOfScope.push({
        category: 'out-of-scope',
        itemId: item.id,
        ref: item.ref,
        title: item.title,
        question: item.question,
        mappings: [],
        reason: 'No mapped coverage in the engagement standards — needs original work.',
      });
      continue;
    }

    const withEvidence = item.mappings.filter((m) => m.evidenceCount > 0);
    if (withEvidence.length > 0) {
      answerableNow.push({
        category: 'answerable-now',
        itemId: item.id,
        ref: item.ref,
        title: item.title,
        question: item.question,
        mappings: item.mappings,
        reason: `${withEvidence.length} of ${item.mappings.length} mapped criteria already have evidence.`,
      });
    } else {
      evidenceGap.push({
        category: 'evidence-gap',
        itemId: item.id,
        ref: item.ref,
        title: item.title,
        question: item.question,
        mappings: item.mappings,
        reason: 'Mapped to engagement criteria, but no evidence artefacts are linked yet.',
      });
    }
  }

  const mapped = answerableNow.length + evidenceGap.length;
  const total = sorted.length;
  const coveragePercent = total === 0 ? 0 : Math.round((mapped / total) * 100);
  const readyPercent = total === 0 ? 0 : Math.round((answerableNow.length / total) * 100);

  return {
    answerableNow,
    evidenceGap,
    outOfScope,
    counts: {
      answerableNow: answerableNow.length,
      evidenceGap: evidenceGap.length,
      outOfScope: outOfScope.length,
      total,
    },
    coveragePercent,
    readyPercent,
  };
}

export function relationLabel(relation: CrosswalkRelation | string): string {
  switch (relation) {
    case 'satisfies':
      return 'Satisfies';
    case 'partially':
      return 'Partially';
    case 'informs':
      return 'Informs';
    default:
      return relation;
  }
}
