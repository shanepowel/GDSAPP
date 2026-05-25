import { prisma } from '@/lib/db/client';
import { buildAnalysisInput } from '@/lib/db/analysis';
import { computeBidOutlook } from '@/lib/engine/bid';
import { enrichAdaptationWithEconomics } from '@/lib/engine/adaptation-economics';
import { computeAdaptation } from '@/lib/engine/adaptation';
import { computeComposition } from '@/lib/engine/composition';
import { computeAllPersonFit } from '@/lib/engine/person-fit';
import { computeReadiness } from '@/lib/engine/readiness';
import { computeRigour } from '@/lib/engine/rigour';
import { computeRequirementFlex, type FlexPriority } from '@/lib/engine/requirement-flex';
import type { AnalysisInput } from '@/lib/types/analysis';
import type {
  BidScoringInput,
  EngineEvidenceItem,
  RigourDimensionInput,
} from '@/lib/types/extension';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

export async function loadEvidenceMaps(engagementId: string): Promise<{
  evidenceByPoint: AnalysisInput['evidenceByPoint'];
  items: EngineEvidenceItem[];
}> {
  const evidence = await prisma.evidence.findMany({
    where: { engagementId },
    include: { links: true },
  });

  const items: EngineEvidenceItem[] = evidence.map((e) => ({
    id: e.id,
    title: e.title,
    strength: e.strength,
    pointIds: e.links.filter((l) => l.pointId).map((l) => l.pointId!),
    questionIds: e.links.filter((l) => l.questionId).map((l) => l.questionId!),
  }));

  const evidenceByPoint = new Map<string, { pointId: string; strength: string; title: string }[]>();
  for (const e of evidence) {
    for (const link of e.links) {
      if (!link.pointId) continue;
      const list = evidenceByPoint.get(link.pointId) ?? [];
      list.push({ pointId: link.pointId, strength: e.strength, title: e.title });
      evidenceByPoint.set(link.pointId, list);
    }
  }

  return { evidenceByPoint, items };
}

export function buildEvidenceMapsForBid(items: EngineEvidenceItem[]): {
  evidenceByPoint: Map<string, EngineEvidenceItem[]>;
  evidenceByQuestion: Map<string, EngineEvidenceItem[]>;
} {
  const evidenceByPoint = new Map<string, EngineEvidenceItem[]>();
  const evidenceByQuestion = new Map<string, EngineEvidenceItem[]>();
  for (const item of items) {
    for (const pid of item.pointIds) {
      const list = evidenceByPoint.get(pid) ?? [];
      list.push(item);
      evidenceByPoint.set(pid, list);
    }
    for (const qid of item.questionIds) {
      const list = evidenceByQuestion.get(qid) ?? [];
      list.push(item);
      evidenceByQuestion.set(qid, list);
    }
  }
  return { evidenceByPoint, evidenceByQuestion };
}

export async function loadRigourScores(requirementId: string): Promise<RigourDimensionInput[]> {
  const latest = await prisma.rigourAssessment.findFirst({
    where: { requirementId },
    orderBy: { createdAt: 'desc' },
    include: { dimensions: true },
  });
  if (!latest) return [];
  return latest.dimensions.map((d) => ({
    dimension: d.dimension,
    score: d.score,
    evidenceNote: d.evidenceNote,
  }));
}

export async function runExtendedAnalysis(requirementId: string): Promise<ExtendedAnalysisResult | null> {
  const baseInput = await buildAnalysisInput(requirementId);
  if (!baseInput) return null;

  const requirement = await prisma.requirement.findUnique({
    where: { id: requirementId },
    include: {
      engagement: { include: { tenders: { include: { questions: { include: { roleDeps: true, skillDeps: true } } } } } },
      constraints: true,
    },
  });
  if (!requirement) return null;

  const { evidenceByPoint, items } = await loadEvidenceMaps(requirement.engagementId);
  const rigourScores = await loadRigourScores(requirementId);
  const rigour = rigourScores.length ? computeRigour(rigourScores) : undefined;

  const input: AnalysisInput = {
    ...baseInput,
    evidenceByPoint,
    rigourPercent: rigour?.overallPercent,
  };

  const fit = computeAllPersonFit(input);
  const composition = computeComposition(input);
  const readiness = computeReadiness(input);
  let adaptation = computeAdaptation(readiness, composition);
  const constraint = requirement.constraints[0];
  adaptation = enrichAdaptationWithEconomics(adaptation, readiness, composition, constraint ?? null);

  const result: ExtendedAnalysisResult = {
    fit,
    composition,
    readiness,
    adaptation,
    overallReadiness: readiness.overallPercent,
    readinessBand: readiness.bandLabel,
    rigour,
    requirementFlex: computeRequirementFlex({
      phase: requirement.phase,
      outcome: requirement.outcome,
      sensitivity: requirement.sensitivity,
      flexPriority: (requirement.flexPriority ?? 'balanced') as FlexPriority,
      readiness,
      composition,
      adaptation,
      constraint: constraint
        ? {
            budgetCap: constraint.budgetCap,
            startBy: constraint.startBy,
            endBy: constraint.endBy,
            internalRatePerDay: constraint.internalRatePerDay,
            partnerRatePerDay: constraint.partnerRatePerDay,
          }
        : null,
    }),
  };

  const tender = requirement.engagement.tenders[0];
  if (tender && tender.questions.length > 0) {
    const { evidenceByQuestion } = buildEvidenceMapsForBid(items);
    const bidInput: BidScoringInput = {
      team: input,
      scoringScaleMax: tender.scoringScaleMax,
      qualityWeight: tender.qualityWeight,
      evidenceByPoint: buildEvidenceMapsForBid(items).evidenceByPoint,
      evidenceByQuestion,
      questions: tender.questions.map((q) => ({
        questionId: q.id,
        ref: q.ref,
        text: q.text,
        weight: q.weight,
        passThreshold: q.passThreshold,
        isPassFail: q.isPassFail,
        category: q.category,
        roleDeps: q.roleDeps.map((d) => ({
          roleId: d.roleId,
          weight: d.weight,
          minSeniorityRank: d.minSeniorityRank,
        })),
        skillDeps: q.skillDeps.map((d) => ({
          skillId: d.skillId,
          minLevel: d.minLevel as BidScoringInput['questions'][0]['skillDeps'][0]['minLevel'],
          weight: d.weight,
        })),
      })),
    };
    result.bidOutlook = computeBidOutlook(bidInput);
  }

  return result;
}
