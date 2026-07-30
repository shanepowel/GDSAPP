import type { GapListResult, PackItemInput } from '@/lib/crosswalk/gap-list';

export type FrameworkAttribution = {
  code: string;
  name: string;
  publisher: string;
  version: string | null;
  licence: string | null;
  attribution: string | null;
};

export type EvidenceCitation = {
  id: string;
  title: string;
  kind: string;
  uri: string | null;
  criterionRefs: string[];
};

export type PackExportInput = {
  packRef: string;
  packTitle: string;
  engagement: { id: string; name: string; reference: string | null };
  generatedAt: string;
  gap: GapListResult;
  items: PackItemInput[];
  evidence: EvidenceCitation[];
  frameworks: FrameworkAttribution[];
  crosswalkReview: { authoredBy: string; reviewedBy: string; reviewedAt: string } | null;
};

export type PackExportDocument = {
  format: 'assemble-gate-pack/v1';
  packRef: string;
  title: string;
  engagement: PackExportInput['engagement'];
  generatedAt: string;
  coverage: {
    coveragePercent: number;
    readyPercent: number;
    counts: GapListResult['counts'];
  };
  structure: Array<{
    ref: string;
    title: string;
    question: string | null;
    category: 'answerable-now' | 'evidence-gap' | 'out-of-scope';
    mappings: Array<{
      criterionRef: string;
      criterionTitle: string;
      relation: string;
      note: string | null;
      evidenceCount: number;
    }>;
    evidence: Array<{ id: string; title: string; kind: string; uri: string | null }>;
  }>;
  evidenceIndex: EvidenceCitation[];
  attributions: FrameworkAttribution[];
  crosswalkReview: PackExportInput['crosswalkReview'];
};

/**
 * Build a target-shaped pack from the same evidence base.
 * NISTA Gate 3 and GDS beta share citations; structure follows pack items.
 */
export function buildPackExport(input: PackExportInput): PackExportDocument {
  const evidenceByCriterion = new Map<string, EvidenceCitation[]>();
  for (const ev of input.evidence) {
    for (const ref of ev.criterionRefs) {
      const list = evidenceByCriterion.get(ref) ?? [];
      list.push(ev);
      evidenceByCriterion.set(ref, list);
    }
  }

  const categoryByItemId = new Map<string, 'answerable-now' | 'evidence-gap' | 'out-of-scope'>();
  for (const row of input.gap.answerableNow) categoryByItemId.set(row.itemId, 'answerable-now');
  for (const row of input.gap.evidenceGap) categoryByItemId.set(row.itemId, 'evidence-gap');
  for (const row of input.gap.outOfScope) categoryByItemId.set(row.itemId, 'out-of-scope');

  const structure = [...input.items]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.ref.localeCompare(b.ref))
    .map((item) => {
      const citedIds = new Set<string>();
      const evidence: EvidenceCitation[] = [];
      for (const m of item.mappings) {
        for (const ev of evidenceByCriterion.get(m.criterionRef) ?? []) {
          if (citedIds.has(ev.id)) continue;
          citedIds.add(ev.id);
          evidence.push(ev);
        }
      }
      return {
        ref: item.ref,
        title: item.title,
        question: item.question,
        category: categoryByItemId.get(item.id) ?? 'out-of-scope',
        mappings: item.mappings.map((m) => ({
          criterionRef: m.criterionRef,
          criterionTitle: m.criterionTitle,
          relation: m.relation,
          note: m.note,
          evidenceCount: m.evidenceCount,
        })),
        evidence: evidence.map((e) => ({
          id: e.id,
          title: e.title,
          kind: e.kind,
          uri: e.uri,
        })),
      };
    });

  return {
    format: 'assemble-gate-pack/v1',
    packRef: input.packRef,
    title: input.packTitle,
    engagement: input.engagement,
    generatedAt: input.generatedAt,
    coverage: {
      coveragePercent: input.gap.coveragePercent,
      readyPercent: input.gap.readyPercent,
      counts: input.gap.counts,
    },
    structure,
    evidenceIndex: input.evidence,
    attributions: input.frameworks,
    crosswalkReview: input.crosswalkReview,
  };
}
