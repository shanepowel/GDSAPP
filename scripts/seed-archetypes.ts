/**
 * Seed system role archetypes for every organisation (idempotent).
 * Usage: npm run seed:archetypes
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type SeedRole = {
  ddatRoleId: string;
  displayTitle: string;
  minLevel: string;
  fteRequired: number;
  criticality: string;
  sortOrder: number;
  requiredSkills: Array<{ skillId: string; requiredLevel: string; weight: number }>;
};

type SeedArchetype = {
  slug: string;
  name: string;
  context: string;
  description: string;
  standardRefs: string[];
  roles: SeedRole[];
};

export async function seedSystemArchetypes(client: PrismaClient, orgIds?: string[]) {
  const path = join(process.cwd(), 'data/archetypes/seed/system-archetypes.json');
  const archetypes = JSON.parse(readFileSync(path, 'utf8')) as SeedArchetype[];
  if (archetypes.length !== 7) {
    throw new Error(`Expected 7 system archetypes, found ${archetypes.length}`);
  }
  const orgs = orgIds
    ? orgIds.map((id) => ({ id, name: id }))
    : await client.organisation.findMany({ select: { id: true, name: true } });
  if (orgs.length === 0) {
    console.log('No organisations yet. Archetypes will seed with the first organisation.');
    return;
  }
  for (const org of orgs) {
    await seedOrg(client, org.id, archetypes);
    console.log(`Archetypes seeded for ${org.name} (${org.id}).`);
  }
}

async function seedOrg(client: PrismaClient, orgId: string, archetypes: SeedArchetype[]) {
  for (const a of archetypes) {
    const existing = await client.roleArchetype.findFirst({
      where: { orgId, slug: a.slug, isSystem: true, archivedAt: null },
      orderBy: { version: 'desc' },
      include: { roles: true },
    });

    if (existing) {
      // Idempotent: keep latest system version; refresh roles if empty custom blank only
      continue;
    }

    await client.roleArchetype.create({
      data: {
        orgId,
        name: a.name,
        slug: a.slug,
        context: a.context,
        description: a.description,
        standardRefs: a.standardRefs,
        version: 1,
        isSystem: true,
        roles: {
          create: a.roles.map((r) => ({
            ddatRoleId: r.ddatRoleId,
            displayTitle: r.displayTitle,
            minLevel: r.minLevel,
            fteRequired: r.fteRequired,
            criticality: r.criticality,
            sortOrder: r.sortOrder,
            requiredSkills: r.requiredSkills as unknown as Prisma.InputJsonValue,
          })),
        },
      },
    });
  }
}

async function main() {
  await seedSystemArchetypes(prisma);
}

const entry = process.argv[1] ?? '';
if (entry.endsWith('seed-archetypes.ts') || entry.endsWith('seed-archetypes.js')) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
