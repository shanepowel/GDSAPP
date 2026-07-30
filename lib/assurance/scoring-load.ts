import type { PrismaClient } from '@prisma/client';
import { listAssessCriteria } from '@/lib/standards/catalog';
import { score, type FullScoringInput } from '@/lib/scoring';
import { getLiveGraph } from '@/lib/org-design/storage';

export async function loadScoringInput(
  prisma: PrismaClient,
  engagementId: string,
  now: Date,
): Promise<FullScoringInput> {
  const engagement = await prisma.engagement.findUniqueOrThrow({
    where: { id: engagementId },
    select: { orgId: true },
  });

  const [listed, judgements, evidenceRows, capabilityLinks, graph] = await Promise.all([
    listAssessCriteria(prisma, { engagementId, ignorePhaseFilter: false }),
    prisma.criterionJudgement.findMany({
      where: { engagementId, supersededById: null },
    }),
    prisma.assuranceEvidence.findMany({
      where: { engagementId },
      include: { criteria: true },
    }),
    prisma.capabilityLink.findMany({
      where: { engagementId },
    }),
    getLiveGraph(prisma, engagement.orgId),
  ]);

  const criterionIds = listed.criteria.map((c) => c.id);
  const criterionIdSet = new Set(criterionIds);

  const capabilityRequirements =
    criterionIds.length === 0
      ? []
      : await prisma.capabilityRequirement.findMany({
          where: { criterionId: { in: criterionIds } },
        });

  return {
    criteria: listed.criteria.map((c) => ({
      id: c.id,
      ref: c.ref,
      title: c.title,
      statement: c.statement,
      weight: c.weight,
      statutory: c.statutory,
      phases: c.phases,
    })),
    judgements: judgements
      .filter((j) => criterionIdSet.has(j.criterionId))
      .map((j) => ({
        id: j.id,
        criterionId: j.criterionId,
        verdict: j.verdict as FullScoringInput['judgements'][number]['verdict'],
        rationale: j.rationale,
        confirmedByUserId: j.confirmedByUserId,
        supersededById: j.supersededById,
        createdAt: j.confirmedAt,
      })),
    evidence: evidenceRows.map((e) => ({
      id: e.id,
      title: e.title,
      expiresAt: e.expiresAt,
      criterionIds: e.criteria.map((c) => c.criterionId),
    })),
    capabilityRequirements: capabilityRequirements.map((r) => ({
      id: r.id,
      criterionId: r.criterionId,
      roleArchetype: r.roleArchetype,
    })),
    capabilityLinks: capabilityLinks.map((l) => ({
      id: l.id,
      engagementId: l.engagementId,
      capabilityRequirementId: l.capabilityRequirementId,
      entityId: l.entityId,
      accountabilityIndex: l.accountabilityIndex,
      strength: l.strength as 'satisfies' | 'partially' | 'informs',
      confirmed: l.confirmed,
    })),
    entities: graph.entities.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type as 'circle' | 'role' | 'product',
      accountabilities: e.accountabilities ?? [],
    })),
    assignments: (graph.assignments ?? []).map((a) => ({
      id: a.id,
      entityId: a.entityId,
      personId: a.personId,
      fteBasisPoints: a.allocation ?? null,
    })),
    people: (graph.people ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
    })),
    now,
  };
}

export async function computeAndSnapshotIndex(
  prisma: PrismaClient,
  engagementId: string,
  cause: string,
  now = new Date(),
) {
  const input = await loadScoringInput(prisma, engagementId, now);
  const result = score(input);
  await prisma.indexSnapshot.create({
    data: {
      engagementId,
      computedAt: now,
      value: result.index,
      breakdown: result as unknown as object,
      cause,
    },
  });
  return result;
}

/** Auto-match capability requirements to design roles by archetype name. */
export async function autoMatchCapabilityLinks(
  prisma: PrismaClient,
  orgId: string,
  engagementId: string,
) {
  const [listed, graph] = await Promise.all([
    listAssessCriteria(prisma, { engagementId, ignorePhaseFilter: true }),
    getLiveGraph(prisma, orgId),
  ]);
  const reqs = await prisma.capabilityRequirement.findMany({
    where: { criterionId: { in: listed.criteria.map((c) => c.id) } },
  });
  let created = 0;

  for (const req of reqs) {
    if (!req.roleArchetype) continue;
    const existing = await prisma.capabilityLink.count({
      where: { engagementId, capabilityRequirementId: req.id },
    });
    if (existing > 0) continue;

    const archetype = req.roleArchetype.toLowerCase();
    const role = graph.entities.find(
      (e) => e.type === 'role' && e.name.toLowerCase().includes(archetype.split(' ')[0]!),
    );
    if (!role) continue;

    await prisma.capabilityLink.create({
      data: {
        engagementId,
        capabilityRequirementId: req.id,
        entityId: role.id,
        strength: 'satisfies',
        provenance: 'auto',
        confirmed: false,
      },
    });
    created += 1;
  }

  return { created };
}
