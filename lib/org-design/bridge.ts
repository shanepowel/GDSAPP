import type { Prisma, PrismaClient } from '@prisma/client';
import { computeInsights, structureReadinessHints } from '@/lib/org-design/insights';
import { suggestDdatRoleId } from '@/lib/org-design/templates';
import {
  getLiveGraph,
  logActivity,
  parseScenarioData,
  toGraphEntity,
} from '@/lib/org-design/storage';
import type { DesignGraph } from '@/lib/org-design/types';

type Db = PrismaClient;

export async function resolveEngagementGraph(
  db: Db,
  orgId: string,
  engagement: {
    designBinding: string;
    designScenarioId: string | null;
    designSnapshotId: string | null;
  },
): Promise<DesignGraph> {
  if (engagement.designBinding === 'scenario' && engagement.designScenarioId) {
    const scenario = await db.designScenario.findFirst({
      where: { id: engagement.designScenarioId, orgId },
    });
    if (scenario) return parseScenarioData(scenario.data);
  }
  if (engagement.designBinding === 'snapshot' && engagement.designSnapshotId) {
    const snapshot = await db.designSnapshot.findFirst({
      where: { id: engagement.designSnapshotId, orgId },
    });
    if (snapshot) return parseScenarioData(snapshot.data);
  }
  return getLiveGraph(db, orgId);
}

export async function forkScenarioForEngagement(
  db: Db,
  orgId: string,
  engagementId: string,
  engagementName: string,
) {
  const live = await getLiveGraph(db, orgId);
  const scenario = await db.designScenario.create({
    data: {
      orgId,
      name: `${engagementName} — structure`,
      description: `Forked from live org design for engagement ${engagementName}`,
      engagementId,
      data: {
        entities: live.entities,
        relationships: live.relationships,
        people: live.people,
        assignments: live.assignments,
      } as unknown as Prisma.InputJsonValue,
    },
  });
  await db.engagement.update({
    where: { id: engagementId },
    data: {
      designBinding: 'scenario',
      designScenarioId: scenario.id,
      designSnapshotId: null,
    },
  });
  await logActivity(db, orgId, 'scenario.fork-engagement', scenario.name, { engagementId });
  return scenario;
}

export async function suggestDdatMappings(db: Db, orgId: string) {
  const entities = await db.designEntity.findMany({
    where: { orgId, type: 'role' },
  });
  const roles = await db.role.findMany({ select: { id: true, name: true } });
  const roleById = new Map(roles.map((r) => [r.id, r]));

  return entities.map((e) => {
    const suggested = e.ddatRoleId ?? suggestDdatRoleId(e.name);
    return {
      entityId: e.id,
      entityName: e.name,
      currentDdatRoleId: e.ddatRoleId,
      suggestedDdatRoleId: suggested,
      suggestedDdatRoleName: suggested ? (roleById.get(suggested)?.name ?? suggested) : null,
    };
  });
}

export async function applySuggestedDdatMappings(db: Db, orgId: string) {
  const suggestions = await suggestDdatMappings(db, orgId);
  let updated = 0;
  for (const s of suggestions) {
    if (!s.suggestedDdatRoleId) continue;
    if (s.currentDdatRoleId === s.suggestedDdatRoleId) continue;
    const level = await db.roleLevel.findFirst({
      where: { roleId: s.suggestedDdatRoleId },
      orderBy: { seniorityRank: 'desc' },
    });
    await db.designEntity.update({
      where: { id: s.entityId },
      data: {
        ddatRoleId: s.suggestedDdatRoleId,
        ddatRoleLevelId: level?.id ?? null,
      },
    });
    updated += 1;
  }
  return { updated };
}

export async function syncStructureToTeam(
  db: Db,
  orgId: string,
  engagementId: string,
  requirementId: string,
) {
  const engagement = await db.engagement.findFirst({
    where: { id: engagementId, orgId },
  });
  if (!engagement) throw new Error('Engagement not found');

  const graph = await resolveEngagementGraph(db, orgId, engagement);
  const roleEntities = graph.entities.filter((e) => e.type === 'role');

  // Ensure DDaT level ids
  const roleLevels = await db.roleLevel.findMany({
    include: { role: true },
  });
  const levelByRoleId = new Map<string, (typeof roleLevels)[0]>();
  for (const rl of roleLevels) {
    const existing = levelByRoleId.get(rl.roleId);
    if (!existing || rl.seniorityRank > existing.seniorityRank) {
      levelByRoleId.set(rl.roleId, rl);
    }
  }

  let rolesUpserted = 0;
  const entityToLevel = new Map<string, string>();

  for (const role of roleEntities) {
    const roleId = role.ddatRoleId ?? suggestDdatRoleId(role.name);
    let levelId = role.ddatRoleLevelId ?? null;
    if (roleId && !levelId) {
      levelId = levelByRoleId.get(roleId)?.id ?? null;
    }
    if (!levelId) continue;
    entityToLevel.set(role.id, levelId);

    const existingReqRole = await db.requirementRole.findFirst({
      where: { requirementId, roleLevelId: levelId },
    });
    if (!existingReqRole) {
      await db.requirementRole.create({
        data: { requirementId, roleLevelId: levelId, weight: 1 },
      });
      rolesUpserted += 1;
    }
  }

  // Sync people
  const people = graph.people ?? [];
  const assignments = graph.assignments ?? [];
  let peopleUpserted = 0;
  let assignmentsUpserted = 0;
  const designPersonToEngagement = new Map<string, string>();

  for (const p of people) {
    let person = await db.person.findFirst({
      where: {
        engagementId,
        displayName: p.name,
      },
    });
    if (!person) {
      person = await db.person.create({
        data: {
          engagementId,
          displayName: p.name,
          isVacancy: false,
        },
      });
      peopleUpserted += 1;
    }
    designPersonToEngagement.set(p.id, person.id);
  }

  // Vacancies for unstaffed roles with DDaT mapping
  for (const role of roleEntities) {
    const levelId = entityToLevel.get(role.id);
    if (!levelId) continue;
    const staffed = assignments.some((a) => a.entityId === role.id);
    if (staffed) continue;
    const vacancyName = `${role.name} (vacancy)`;
    let vacancy = await db.person.findFirst({
      where: { engagementId, displayName: vacancyName },
    });
    if (!vacancy) {
      vacancy = await db.person.create({
        data: {
          engagementId,
          displayName: vacancyName,
          isVacancy: true,
        },
      });
      peopleUpserted += 1;
    }
    const existing = await db.assignment.findFirst({
      where: { requirementId, personId: vacancy.id, roleLevelId: levelId },
    });
    if (!existing) {
      await db.assignment.create({
        data: { requirementId, personId: vacancy.id, roleLevelId: levelId },
      });
      assignmentsUpserted += 1;
    }
  }

  for (const a of assignments) {
    const personId = designPersonToEngagement.get(a.personId);
    const levelId = entityToLevel.get(a.entityId);
    if (!personId || !levelId) continue;
    const existing = await db.assignment.findFirst({
      where: { requirementId, personId },
    });
    if (existing) {
      await db.assignment.update({
        where: { id: existing.id },
        data: { roleLevelId: levelId },
      });
    } else {
      await db.assignment.create({
        data: { requirementId, personId, roleLevelId: levelId },
      });
    }
    assignmentsUpserted += 1;
  }

  await db.engagement.update({
    where: { id: engagementId },
    data: { designSyncedAt: new Date() },
  });
  await logActivity(db, orgId, 'bridge.sync-to-team', engagementId, {
    rolesUpserted,
    peopleUpserted,
    assignmentsUpserted,
  });

  return { rolesUpserted, peopleUpserted, assignmentsUpserted };
}

export async function getStructureReadinessHints(
  db: Db,
  orgId: string,
  engagementId: string,
) {
  const engagement = await db.engagement.findFirst({
    where: { id: engagementId, orgId },
  });
  if (!engagement) throw new Error('Engagement not found');
  const graph = await resolveEngagementGraph(db, orgId, engagement);
  const insights = computeInsights({
    entities: graph.entities,
    relationships: graph.relationships,
    people: graph.people ?? [],
    assignments: graph.assignments ?? [],
  });
  return {
    healthScore: insights.healthScore,
    vacancies: insights.totals.vacancies,
    hints: structureReadinessHints(insights),
    issues: insights.issues.slice(0, 20),
  };
}

export async function getGraphForContext(
  db: Db,
  orgId: string,
  opts: { scenarioId?: string | null; snapshotId?: string | null } = {},
): Promise<DesignGraph> {
  if (opts.scenarioId) {
    const scenario = await db.designScenario.findFirst({
      where: { id: opts.scenarioId, orgId },
    });
    if (scenario) return parseScenarioData(scenario.data);
  }
  if (opts.snapshotId) {
    const snapshot = await db.designSnapshot.findFirst({
      where: { id: opts.snapshotId, orgId },
    });
    if (snapshot) return parseScenarioData(snapshot.data);
  }
  return getLiveGraph(db, orgId);
}

export { toGraphEntity };
