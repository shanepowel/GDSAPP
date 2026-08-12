import { createHash } from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';
import { computeInsights, type OrgInsights } from '@/lib/org-design/insights';
import type { DesignGraph } from '@/lib/org-design/types';
import { getLiveGraph } from '@/lib/org-design/storage';

export function hashInsightsInputs(graph: {
  entities: Array<{ id: string; type: string; purpose: string | null; accountabilities: string[]; parentId: string | null }>;
  relationships: Array<{ id: string; sourceId: string; targetId: string; type: string }>;
  people: Array<{ id: string; fte: number }>;
  assignments: Array<{ id: string; personId: string; entityId: string; allocation: number }>;
}): string {
  const payload = JSON.stringify({
    entities: graph.entities.map((e) => ({
      id: e.id,
      type: e.type,
      purpose: e.purpose,
      accountabilities: e.accountabilities,
      parentId: e.parentId,
    })),
    relationships: graph.relationships.map((r) => ({
      id: r.id,
      sourceId: r.sourceId,
      targetId: r.targetId,
      type: r.type,
    })),
    people: graph.people.map((p) => ({ id: p.id, fte: p.fte })),
    assignments: graph.assignments.map((a) => ({
      id: a.id,
      personId: a.personId,
      entityId: a.entityId,
      allocation: a.allocation,
    })),
  });
  return createHash('sha256').update(payload).digest('hex');
}

export async function getCachedInsights(
  db: PrismaClient,
  orgId: string,
  graph: DesignGraph,
): Promise<{ insights: OrgInsights; computedAt: Date; cached: boolean }> {
  const inputsHash = hashInsightsInputs({
    entities: graph.entities,
    relationships: graph.relationships,
    people: graph.people ?? [],
    assignments: graph.assignments ?? [],
  });

  const existing = await db.orgInsightsCache.findUnique({ where: { orgId } });
  if (existing && existing.inputsHash === inputsHash) {
    return {
      insights: existing.insights as unknown as OrgInsights,
      computedAt: existing.computedAt,
      cached: true,
    };
  }

  const insights = computeInsights({
    entities: graph.entities,
    relationships: graph.relationships,
    people: graph.people ?? [],
    assignments: graph.assignments ?? [],
  });
  const computedAt = new Date();

  await db.orgInsightsCache.upsert({
    where: { orgId },
    create: {
      orgId,
      inputsHash,
      insights: insights as unknown as Prisma.InputJsonValue,
      computedAt,
    },
    update: {
      inputsHash,
      insights: insights as unknown as Prisma.InputJsonValue,
      computedAt,
    },
  });

  return { insights, computedAt, cached: false };
}

/** Drop cache and recompute from live graph (call after graph writes). */
export async function refreshInsightsOnWrite(db: PrismaClient, orgId: string): Promise<void> {
  const graph = await getLiveGraph(db, orgId, { mode: 'list' });
  await getCachedInsights(db, orgId, graph);
}
