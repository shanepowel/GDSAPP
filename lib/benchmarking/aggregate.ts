import type { PrismaClient } from '@prisma/client';

export interface OutcomeBenchmarkRow {
  id: string;
  engagementName: string;
  requirementTitle: string;
  phase: string | null;
  event: string;
  result: string;
  recordedAt: Date;
}

export interface BenchmarkSummary {
  totalOutcomes: number;
  byResult: Record<string, number>;
  byEvent: Record<string, number>;
  byPhase: Record<string, number>;
  recent: OutcomeBenchmarkRow[];
}

export async function buildBenchmarkSummary(
  prisma: PrismaClient,
  orgId: string,
): Promise<BenchmarkSummary> {
  const outcomes = await prisma.outcome.findMany({
    where: { requirement: { engagement: { orgId } } },
    include: {
      requirement: {
        include: { engagement: { select: { name: true } } },
      },
    },
    orderBy: { recordedAt: 'desc' },
    take: 200,
  });

  const byResult: Record<string, number> = {};
  const byEvent: Record<string, number> = {};
  const byPhase: Record<string, number> = {};

  for (const o of outcomes) {
    byResult[o.result] = (byResult[o.result] ?? 0) + 1;
    byEvent[o.event] = (byEvent[o.event] ?? 0) + 1;
    const phase = o.phase ?? o.requirement.phase;
    byPhase[phase] = (byPhase[phase] ?? 0) + 1;
  }

  return {
    totalOutcomes: outcomes.length,
    byResult,
    byEvent,
    byPhase,
    recent: outcomes.slice(0, 30).map((o) => ({
      id: o.id,
      engagementName: o.requirement.engagement.name,
      requirementTitle: o.requirement.title,
      phase: o.phase ?? o.requirement.phase,
      event: o.event,
      result: o.result,
      recordedAt: o.recordedAt,
    })),
  };
}
