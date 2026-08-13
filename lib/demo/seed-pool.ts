import type { PrismaClient } from '@prisma/client';
import { ORG_TEMPLATES } from '@/lib/org-design/templates';
import { applyTemplateToLive } from '@/lib/org-design/storage';
import { recomputeTeamFit } from '@/lib/team-fit/recompute';
import {
  DEMO_EXTRA_ENGAGEMENTS,
  DEMO_POOL,
  DEMO_SIGNAL_NOTE,
  DEMO_VACANCY_NAME,
  demoSkillLabel,
} from '@/lib/demo/pool';

const ARCHETYPE_SLUGS = [
  'discovery-squad',
  'bilingual-service-team',
  'alpha-squad',
  'beta-live-squad',
  'capital-digital-workstream',
] as const;

async function bindCatalog(
  db: PrismaClient,
  engagementId: string,
  code: string,
) {
  const version = await db.catalogStandardVersion.findFirst({
    where: { status: 'current', standard: { code } },
  });
  if (!version) return;
  await db.engagementStandard.upsert({
    where: {
      engagementId_standardVersionId: {
        engagementId,
        standardVersionId: version.id,
      },
    },
    create: {
      engagementId,
      standardVersionId: version.id,
      isPrimary: true,
    },
    update: { isPrimary: true },
  });
}

async function ensureOrgDesign(db: PrismaClient, orgId: string) {
  const existingEntities = await db.designEntity.count({ where: { orgId } });
  if (existingEntities > 0) return;
  const gdsTemplate = ORG_TEMPLATES.find((t) => t.id === 'gds-service-team');
  if (!gdsTemplate) return;
  const result = await applyTemplateToLive(db, orgId, gdsTemplate);
  console.log(
    `Seeded org design template "${gdsTemplate.name}" (${result.entitiesCreated} entities).`,
  );
}

async function upsertDesignPool(db: PrismaClient, orgId: string) {
  const roles = await db.designEntity.findMany({
    where: { orgId, type: 'role' },
    select: { id: true, ddatRoleId: true },
  });
  const entityByRole = new Map(
    roles.filter((r) => r.ddatRoleId).map((r) => [r.ddatRoleId as string, r.id]),
  );

  const designIds = new Map<string, string>();

  for (const person of DEMO_POOL) {
    const skills = person.skills.map((s) => demoSkillLabel(s.skillId));
    const existing = await db.designPerson.findFirst({
      where: { orgId, email: person.email },
    });
    const row = existing
      ? await db.designPerson.update({
          where: { id: existing.id },
          data: { name: person.name, fte: person.fte, skills },
        })
      : await db.designPerson.create({
          data: {
            orgId,
            name: person.name,
            email: person.email,
            fte: person.fte,
            skills,
          },
        });
    designIds.set(person.email, row.id);

    await db.designAssignment.deleteMany({ where: { orgId, personId: row.id } });
    if (person.assignDdatRoleId) {
      const entityId = entityByRole.get(person.assignDdatRoleId);
      if (entityId) {
        await db.designAssignment.create({
          data: {
            orgId,
            personId: row.id,
            entityId,
            allocation: person.allocation ?? 100,
          },
        });
      }
    }
  }

  return designIds;
}

async function upsertEngagementPeople(db: PrismaClient, engagementId: string) {
  const engagementIds = new Map<string, string>();

  for (const person of DEMO_POOL) {
    let row = await db.person.findFirst({
      where: { engagementId, displayName: person.name },
    });
    if (!row) {
      row = await db.person.create({
        data: { engagementId, displayName: person.name, isVacancy: false },
      });
    }
    engagementIds.set(person.email, row.id);

    await db.personSkill.deleteMany({ where: { personId: row.id } });
    if (person.skills.length) {
      await db.personSkill.createMany({
        data: person.skills.map((s) => ({
          personId: row.id,
          skillId: s.skillId,
          level: s.level,
        })),
      });
    }

    await db.personAvailability.deleteMany({ where: { personId: row.id } });
    if (person.daysPerWeek != null) {
      await db.personAvailability.create({
        data: { personId: row.id, daysPerWeek: person.daysPerWeek },
      });
    }
  }

  const vacancy = await db.person.findFirst({
    where: { engagementId, displayName: DEMO_VACANCY_NAME },
  });
  if (!vacancy) {
    await db.person.create({
      data: { engagementId, displayName: DEMO_VACANCY_NAME, isVacancy: true },
    });
  }

  return engagementIds;
}

async function seedAssertedRigour(
  db: PrismaClient,
  opts: {
    orgId: string;
    adminUserId: string;
    designIds: Map<string, string>;
    byEngagement: Map<string, Map<string, string>>;
  },
) {
  await db.rigourSignal.deleteMany({
    where: {
      orgId: opts.orgId,
      provenance: 'asserted',
      note: { startsWith: 'Demo seed' },
    },
  });

  const observedAt = new Date('2026-07-01T00:00:00.000Z');
  const rows: Array<{
    orgId: string;
    personId: string;
    engagementId: string | null;
    type: string;
    provenance: 'asserted';
    value: number;
    note: string;
    observedAt: Date;
    confirmedByUserId: string;
  }> = [];

  for (const person of DEMO_POOL) {
    if (!person.rigour?.length) continue;
    const designId = opts.designIds.get(person.email);
    for (const signal of person.rigour) {
      const note = `${DEMO_SIGNAL_NOTE} ${signal.note}`;
      if (designId) {
        rows.push({
          orgId: opts.orgId,
          personId: designId,
          engagementId: null,
          type: signal.type,
          provenance: 'asserted',
          value: signal.value,
          note,
          observedAt,
          confirmedByUserId: opts.adminUserId,
        });
      }
      for (const [engagementId, people] of opts.byEngagement) {
        const personId = people.get(person.email);
        if (!personId) continue;
        rows.push({
          orgId: opts.orgId,
          personId,
          engagementId,
          type: signal.type,
          provenance: 'asserted',
          value: signal.value,
          note,
          observedAt,
          confirmedByUserId: opts.adminUserId,
        });
      }
    }
  }

  if (rows.length) {
    await db.rigourSignal.createMany({ data: rows });
  }
}

async function ensureExtraEngagements(
  db: PrismaClient,
  opts: { orgId: string; adminUserId: string },
) {
  const ids: string[] = [];
  for (const def of DEMO_EXTRA_ENGAGEMENTS) {
    await db.engagement.upsert({
      where: { id: def.id },
      create: {
        id: def.id,
        name: def.name,
        reference: def.reference,
        standardId: def.standardId,
        clientOrg: def.clientOrg,
        sector: def.sector,
        serviceName: def.serviceName,
        phase: def.phase,
        mode: def.mode,
        maturityLevel: def.maturityLevel,
        ownerId: opts.adminUserId,
        orgId: opts.orgId,
        supplierTag: def.supplierTag,
        lotTag: def.lotTag,
        designBinding: 'live',
      },
      update: {
        name: def.name,
        reference: def.reference,
        standardId: def.standardId,
        clientOrg: def.clientOrg,
        sector: def.sector,
        serviceName: def.serviceName,
        phase: def.phase,
        mode: def.mode,
        maturityLevel: def.maturityLevel,
        ownerId: opts.adminUserId,
        supplierTag: def.supplierTag,
        lotTag: def.lotTag,
        designBinding: 'live',
      },
    });
    await bindCatalog(db, def.id, def.catalogCode);
    await db.requirement.upsert({
      where: { id: def.requirementId },
      create: {
        id: def.requirementId,
        engagementId: def.id,
        title: def.requirementTitle,
        phase: def.phase,
        outcome: def.requirementOutcome,
        channels: ['web'],
        sensitivity: 'official',
      },
      update: {
        title: def.requirementTitle,
        phase: def.phase,
        outcome: def.requirementOutcome,
      },
    });
    ids.push(def.id);
  }
  return ids;
}

async function recomputeDemoFit(db: PrismaClient, orgId: string, engagementIds: string[]) {
  const archetypes = await db.roleArchetype.findMany({
    where: { orgId, slug: { in: [...ARCHETYPE_SLUGS] }, archivedAt: null },
    select: { id: true, slug: true },
  });
  const asOf = new Date('2026-08-13T00:00:00.000Z');
  let scores = 0;
  let gaps = 0;
  for (const engagementId of engagementIds) {
    for (const archetype of archetypes) {
      const result = await recomputeTeamFit(db, {
        orgId,
        engagementId,
        archetypeId: archetype.id,
        asOf,
      });
      scores += result.scoresUpserted;
      gaps += result.gapsWritten;
    }
  }
  console.log(`Demo fit: ${scores} scores, ${gaps} gaps across ${engagementIds.length} engagements.`);
}

export async function seedDemoPool(
  db: PrismaClient,
  opts: { orgId: string; adminUserId: string },
) {
  await ensureOrgDesign(db, opts.orgId);
  const extraIds = await ensureExtraEngagements(db, opts);
  const designIds = await upsertDesignPool(db, opts.orgId);

  const demoEngagements = await db.engagement.findMany({
    where: { orgId: opts.orgId },
    select: { id: true },
  });
  const byEngagement = new Map<string, Map<string, string>>();
  for (const engagement of demoEngagements) {
    await db.engagement.update({
      where: { id: engagement.id },
      data: { designBinding: 'live' },
    });
    const people = await upsertEngagementPeople(db, engagement.id);
    byEngagement.set(engagement.id, people);
  }

  await seedAssertedRigour(db, {
    orgId: opts.orgId,
    adminUserId: opts.adminUserId,
    designIds,
    byEngagement,
  });

  await recomputeDemoFit(
    db,
    opts.orgId,
    demoEngagements.map((e) => e.id),
  );

  return {
    people: DEMO_POOL.length,
    engagements: demoEngagements.length,
    extraEngagements: extraIds.length,
  };
}
