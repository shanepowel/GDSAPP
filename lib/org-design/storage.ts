import type { Prisma, PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import type { DesignGraph, AiPatch } from '@/lib/org-design/types';
import type { OrgTemplate } from '@/lib/org-design/templates';

type Db = PrismaClient;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function toGraphEntity(e: {
  id: string;
  name: string;
  type: string;
  purpose: string | null;
  domain: string | null;
  accountabilities: unknown;
  policies: unknown;
  parentId: string | null;
  ddatRoleId?: string | null;
  ddatRoleLevelId?: string | null;
  metadata?: unknown;
}) {
  return {
    id: e.id,
    name: e.name,
    type: e.type,
    purpose: e.purpose,
    domain: e.domain,
    accountabilities: asStringArray(e.accountabilities),
    policies: asStringArray(e.policies),
    parentId: e.parentId,
    ddatRoleId: e.ddatRoleId ?? null,
    ddatRoleLevelId: e.ddatRoleLevelId ?? null,
    metadata: asRecord(e.metadata),
  };
}

export async function getLiveGraph(
  db: Db,
  orgId: string,
  opts: { mode?: 'list' | 'detail' } = {},
): Promise<DesignGraph> {
  const mode = opts.mode ?? 'list';
  const [entities, relationships, people, assignments] = await Promise.all([
    db.designEntity.findMany({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
      select:
        mode === 'detail'
          ? {
              id: true,
              name: true,
              type: true,
              purpose: true,
              domain: true,
              accountabilities: true,
              policies: true,
              parentId: true,
              ddatRoleId: true,
              ddatRoleLevelId: true,
              metadata: true,
            }
          : {
              id: true,
              name: true,
              type: true,
              purpose: true,
              domain: true,
              accountabilities: true,
              parentId: true,
              ddatRoleId: true,
              ddatRoleLevelId: true,
            },
    }),
    db.designRelationship.findMany({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        sourceId: true,
        targetId: true,
        type: true,
        ...(mode === 'detail' ? { metadata: true } : {}),
      },
    }),
    db.designPerson.findMany({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
      select:
        mode === 'detail'
          ? {
              id: true,
              name: true,
              email: true,
              fte: true,
              skills: true,
              notes: true,
            }
          : {
              id: true,
              name: true,
              email: true,
              fte: true,
              skills: true,
            },
    }),
    db.designAssignment.findMany({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, personId: true, entityId: true, allocation: true },
    }),
  ]);
  return {
    entities: entities.map((e) =>
      toGraphEntity({
        ...e,
        policies: 'policies' in e ? e.policies : [],
        metadata: 'metadata' in e ? e.metadata : {},
      }),
    ),
    relationships: relationships.map((r) => ({
      id: r.id,
      sourceId: r.sourceId,
      targetId: r.targetId,
      type: r.type,
      metadata: 'metadata' in r ? asRecord(r.metadata) : {},
    })),
    people: people.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      fte: p.fte,
      skills: asStringArray(p.skills),
      notes: 'notes' in p ? (p.notes as string | null) : null,
    })),
    assignments: assignments.map((a) => ({
      id: a.id,
      personId: a.personId,
      entityId: a.entityId,
      allocation: a.allocation,
    })),
  };
}

/** Full fields for a single entity inspector — avoids shipping metadata on the list payload. */
export async function getEntityDetail(db: Db, orgId: string, entityId: string) {
  const e = await db.designEntity.findFirst({ where: { id: entityId, orgId } });
  if (!e) return null;
  return toGraphEntity(e);
}

export async function logActivity(
  db: Db,
  orgId: string,
  action: string,
  target?: string,
  details: Record<string, unknown> = {},
) {
  await db.designActivity.create({
    data: { orgId, action, target, details: details as Prisma.InputJsonValue },
  });
}

export async function applyTemplateToLive(
  db: Db,
  orgId: string,
  template: OrgTemplate,
  opts: { replace?: boolean } = {},
): Promise<{ entitiesCreated: number; relationshipsCreated: number; peopleCreated: number }> {
  if (opts.replace) {
    await db.designAssignment.deleteMany({ where: { orgId } });
    await db.designRelationship.deleteMany({ where: { orgId } });
    await db.designComment.deleteMany({ where: { orgId } });
    await db.designEntity.deleteMany({ where: { orgId } });
    await db.designPerson.deleteMany({ where: { orgId } });
  }

  const tempIdToRealId = new Map<string, string>();
  const sorted = [...template.entities].sort((a, b) => {
    if (!a.parentTempId && b.parentTempId) return -1;
    if (a.parentTempId && !b.parentTempId) return 1;
    return 0;
  });

  for (const entityDef of sorted) {
    const created = await db.designEntity.create({
      data: {
        orgId,
        name: entityDef.name,
        type: entityDef.type,
        purpose: entityDef.purpose ?? null,
        domain: entityDef.domain ?? null,
        accountabilities: entityDef.accountabilities ?? [],
        policies: entityDef.policies ?? [],
        parentId: entityDef.parentTempId
          ? (tempIdToRealId.get(entityDef.parentTempId) ?? null)
          : null,
        ddatRoleId: entityDef.ddatRoleId ?? null,
      },
    });
    tempIdToRealId.set(entityDef.tempId, created.id);
  }

  for (const rel of template.relationships) {
    const sourceId = tempIdToRealId.get(rel.sourceTempId);
    const targetId = tempIdToRealId.get(rel.targetTempId);
    if (!sourceId || !targetId) continue;
    await db.designRelationship.create({
      data: { orgId, sourceId, targetId, type: rel.type, metadata: {} },
    });
  }

  let peopleCreated = 0;
  for (const p of template.people ?? []) {
    const person = await db.designPerson.create({
      data: {
        orgId,
        name: p.name,
        email: p.email ?? null,
        fte: p.fte ?? 100,
        skills: p.skills ?? [],
      },
    });
    peopleCreated += 1;
    for (const tempId of p.assignTempIds ?? []) {
      const entityId = tempIdToRealId.get(tempId);
      if (!entityId) continue;
      await db.designAssignment.create({
        data: { orgId, personId: person.id, entityId, allocation: 100 },
      });
    }
  }

  await logActivity(db, orgId, 'template.apply', template.name, {
    entities: template.entities.length,
  });

  return {
    entitiesCreated: template.entities.length,
    relationshipsCreated: template.relationships.length,
    peopleCreated,
  };
}

export async function replaceLiveOrg(
  db: Db,
  orgId: string,
  data: { entities: DesignGraph['entities']; relationships: DesignGraph['relationships'] },
) {
  await db.$transaction(async (tx) => {
    await tx.designAssignment.deleteMany({ where: { orgId } });
    await tx.designRelationship.deleteMany({ where: { orgId } });
    await tx.designComment.deleteMany({ where: { orgId } });
    await tx.designEntity.deleteMany({ where: { orgId } });

    const idMap = new Map<string, string>();
    for (const e of data.entities) {
      const created = await tx.designEntity.create({
        data: {
          orgId,
          name: e.name,
          type: e.type,
          purpose: e.purpose,
          domain: e.domain,
          accountabilities: e.accountabilities,
          policies: e.policies,
          parentId: null,
          ddatRoleId: e.ddatRoleId ?? null,
          ddatRoleLevelId: e.ddatRoleLevelId ?? null,
          metadata: (e.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
      idMap.set(e.id, created.id);
    }
    for (const e of data.entities) {
      if (e.parentId && idMap.get(e.parentId)) {
        await tx.designEntity.update({
          where: { id: idMap.get(e.id)! },
          data: { parentId: idMap.get(e.parentId)! },
        });
      }
    }
    for (const r of data.relationships) {
      const sourceId = idMap.get(r.sourceId);
      const targetId = idMap.get(r.targetId);
      if (!sourceId || !targetId) continue;
      await tx.designRelationship.create({
        data: {
          orgId,
          sourceId,
          targetId,
          type: r.type,
          metadata: (r.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    }
  });
}

export async function applyAiPatch(
  db: Db,
  orgId: string,
  patch: AiPatch,
): Promise<{ entitiesCreated: number; relationshipsCreated: number; entitiesUpdated: number }> {
  const tempIdToRealId = new Map<string, string>();
  let entitiesCreated = 0;
  let relationshipsCreated = 0;
  let entitiesUpdated = 0;

  const sorted = [...patch.entities].sort((a, b) => {
    if (!a.parentTempId && b.parentTempId) return -1;
    if (a.parentTempId && !b.parentTempId) return 1;
    return 0;
  });

  for (const e of sorted) {
    const created = await db.designEntity.create({
      data: {
        orgId,
        name: e.name,
        type: e.type,
        purpose: e.purpose ?? null,
        domain: e.domain ?? null,
        accountabilities: e.accountabilities ?? [],
        policies: [],
        parentId: e.parentTempId ? (tempIdToRealId.get(e.parentTempId) ?? null) : null,
        ddatRoleId: e.ddatRoleId ?? null,
      },
    });
    tempIdToRealId.set(e.tempId, created.id);
    entitiesCreated += 1;
  }

  for (const r of patch.relationships) {
    const sourceId = tempIdToRealId.get(r.sourceTempId);
    const targetId = tempIdToRealId.get(r.targetTempId);
    if (!sourceId || !targetId) continue;
    await db.designRelationship.create({
      data: { orgId, sourceId, targetId, type: r.type, metadata: {} },
    });
    relationshipsCreated += 1;
  }

  for (const u of patch.updates ?? []) {
    const existing = await db.designEntity.findFirst({ where: { id: u.id, orgId } });
    if (!existing) continue;
    await db.designEntity.update({
      where: { id: u.id },
      data: {
        ...(u.name !== undefined ? { name: u.name } : {}),
        ...(u.purpose !== undefined ? { purpose: u.purpose } : {}),
        ...(u.domain !== undefined ? { domain: u.domain } : {}),
        ...(u.accountabilities !== undefined ? { accountabilities: u.accountabilities } : {}),
      },
    });
    entitiesUpdated += 1;
  }

  await logActivity(db, orgId, 'ai.apply-patch', patch.summary, {
    entitiesCreated,
    relationshipsCreated,
    entitiesUpdated,
  });

  return { entitiesCreated, relationshipsCreated, entitiesUpdated };
}

export function newShareToken(): string {
  return randomBytes(24).toString('hex');
}

export function parseScenarioData(data: unknown): DesignGraph {
  const raw = asRecord(data);
  const entities = Array.isArray(raw.entities) ? raw.entities : [];
  const relationships = Array.isArray(raw.relationships) ? raw.relationships : [];
  const people = Array.isArray(raw.people) ? raw.people : [];
  const assignments = Array.isArray(raw.assignments) ? raw.assignments : [];
  return {
    entities: entities.map((e) => toGraphEntity(e as Parameters<typeof toGraphEntity>[0])),
    relationships: (relationships as DesignGraph['relationships']).map((r) => ({
      id: r.id,
      sourceId: r.sourceId,
      targetId: r.targetId,
      type: r.type,
      metadata: asRecord(r.metadata),
    })),
    people: (people as DesignGraph['people'])?.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      fte: p.fte,
      skills: asStringArray(p.skills),
      notes: p.notes,
    })),
    assignments: (assignments as DesignGraph['assignments'])?.map((a) => ({
      id: a.id,
      personId: a.personId,
      entityId: a.entityId,
      allocation: a.allocation,
    })),
  };
}
