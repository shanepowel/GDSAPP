import type { PrismaClient } from '@prisma/client';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

export interface PortfolioEngagementRow {
  id: string;
  name: string;
  standardId: string;
  supplierTag: string | null;
  lotTag: string | null;
  phase: string | null;
  readinessPercent: number | null;
  readinessBand: string | null;
  rigourPercent: number | null;
  callOffOutlook: number | null;
  gapPointCount: number;
  statutoryGapCount: number;
  passFailRiskCount: number;
  evidenceCount: number;
  lastRunAt: Date | null;
}

export interface PortfolioSupplierGroup {
  supplierTag: string;
  engagementCount: number;
  averageReadiness: number | null;
  totalGapPoints: number;
}

export interface PortfolioSummary {
  engagementCount: number;
  analysedCount: number;
  averageReadiness: number | null;
  averageRigour: number | null;
  totalGapPoints: number;
  totalStatutoryGaps: number;
  totalPassFailRisks: number;
  engagements: PortfolioEngagementRow[];
  supplierGroups: PortfolioSupplierGroup[];
  topRisks: string[];
}

function parseRun(result: unknown): ExtendedAnalysisResult | null {
  if (!result || typeof result !== 'object') return null;
  return result as ExtendedAnalysisResult;
}

export async function buildPortfolioSummary(
  prisma: PrismaClient,
  orgId: string,
): Promise<PortfolioSummary> {
  const engagements = await prisma.engagement.findMany({
    where: { orgId },
    orderBy: { updatedAt: 'desc' },
    include: {
      requirements: {
        include: {
          runs: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      },
      tenders: { include: { questions: true } },
      _count: { select: { evidence: true } },
    },
  });

  const rows: PortfolioEngagementRow[] = [];
  const topRisks: string[] = [];
  let readinessSum = 0;
  let readinessN = 0;
  let rigourSum = 0;
  let rigourN = 0;
  let totalGapPoints = 0;
  let totalStatutoryGaps = 0;
  let totalPassFailRisks = 0;
  let analysedCount = 0;

  for (const e of engagements) {
    const req = e.requirements[0];
    const run = req?.runs[0];
    const parsed = run ? parseRun(run.result) : null;

    let gapPointCount = 0;
    let statutoryGapCount = 0;
    if (parsed?.readiness) {
      analysedCount += 1;
      for (const p of parsed.readiness.points) {
        if (p.status === 'gap' || p.status === 'partial') gapPointCount += 1;
        if (p.statutoryNote && (p.status === 'gap' || p.status === 'partial')) {
          statutoryGapCount += 1;
        }
      }
      totalGapPoints += gapPointCount;
      totalStatutoryGaps += statutoryGapCount;
      readinessSum += parsed.overallReadiness;
      readinessN += 1;
    }

    let passFailRiskCount = 0;
    let callOffOutlook: number | null = null;
    if (parsed?.bidOutlook) {
      callOffOutlook = parsed.bidOutlook.overallQualityOutlook;
      passFailRiskCount = parsed.bidOutlook.questions.filter((q) => q.passFailRisk).length;
      totalPassFailRisks += passFailRiskCount;
      const risky = parsed.bidOutlook.questions.find((q) => q.passFailRisk);
      if (risky && topRisks.length < 5) {
        topRisks.push(`${e.name}: ${risky.ref} pass/fail risk`);
      }
    }

    if (parsed?.rigour) {
      rigourSum += parsed.rigour.overallPercent;
      rigourN += 1;
    }

    rows.push({
      id: e.id,
      name: e.name,
      standardId: e.standardId,
      supplierTag: e.supplierTag,
      lotTag: e.lotTag,
      phase: req?.phase ?? null,
      readinessPercent: run?.overallReadiness ?? null,
      readinessBand: run?.readinessBand ?? null,
      rigourPercent: parsed?.rigour?.overallPercent ?? null,
      callOffOutlook,
      gapPointCount,
      statutoryGapCount,
      passFailRiskCount,
      evidenceCount: e._count.evidence,
      lastRunAt: run?.createdAt ?? null,
    });
  }

  const supplierMap = new Map<
    string,
    { count: number; readinessSum: number; readinessN: number; gaps: number }
  >();
  for (const row of rows) {
    const tag = row.supplierTag?.trim() || 'Unassigned supplier';
    const bucket = supplierMap.get(tag) ?? { count: 0, readinessSum: 0, readinessN: 0, gaps: 0 };
    bucket.count += 1;
    bucket.gaps += row.gapPointCount;
    if (row.readinessPercent != null) {
      bucket.readinessSum += row.readinessPercent;
      bucket.readinessN += 1;
    }
    supplierMap.set(tag, bucket);
  }

  const supplierGroups: PortfolioSupplierGroup[] = [...supplierMap.entries()]
    .map(([supplierTag, v]) => ({
      supplierTag,
      engagementCount: v.count,
      averageReadiness: v.readinessN ? Math.round(v.readinessSum / v.readinessN) : null,
      totalGapPoints: v.gaps,
    }))
    .sort((a, b) => b.engagementCount - a.engagementCount);

  return {
    engagementCount: engagements.length,
    analysedCount,
    averageReadiness: readinessN ? Math.round(readinessSum / readinessN) : null,
    averageRigour: rigourN ? Math.round(rigourSum / rigourN) : null,
    totalGapPoints,
    totalStatutoryGaps,
    totalPassFailRisks,
    engagements: rows,
    supplierGroups,
    topRisks,
  };
}
