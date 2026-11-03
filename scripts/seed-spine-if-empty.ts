/**
 * Runs on deploy. Ensures the NRW demo engagements, archetypes, people pool and spine
 * exist, and never overwrites spine rows a person has already entered.
 * Never fails the build.
 */
import { PrismaClient } from '@prisma/client';
import { DEMO_ACCOUNT, ensureDemoAccount } from '../lib/demo/demo-account';
import { seedDemoPool } from '../lib/demo/seed-pool';
import { ensureDemoReader } from '../lib/demo/reader';
import { seedSystemArchetypes } from './seed-archetypes';
import { seedSpineDemo } from './seed-spine-demo';
import { WALKTHROUGH_PEOPLE } from '../lib/teach/walkthrough';

const DEMO_IDS = ['nrw-demo', 'nrw-demo-2'] as const;

const DAY = 86_400_000;

function day(offset: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + offset * DAY);
}

async function ensureEngagements(prisma: PrismaClient, ownerId: string) {
  const shared = {
    clientOrg: 'Natural Resources Wales',
    sector: 'digital-service',
    ownerId,
    orgId: DEMO_ACCOUNT.orgId,
    supplierTag: 'Turner & Townsend Demo',
  };
  await prisma.engagement.upsert({
    where: { id: 'nrw-demo' },
    create: {
      id: 'nrw-demo',
      name: 'NRW Discovery',
      reference: 'NRW-DISC-01',
      standardId: 'wales',
      serviceName: 'Regulatory permitting',
      phase: 'discovery',
      mode: 'bid',
      maturityLevel: 'evidenced',
      lotTag: 'Lot 1 Digital delivery',
      ...shared,
    },
    update: {
      standardId: 'wales',
      maturityLevel: 'evidenced',
      clientOrg: 'Natural Resources Wales',
      ownerId,
    },
  });
  await prisma.engagement.upsert({
    where: { id: 'nrw-demo-2' },
    create: {
      id: 'nrw-demo-2',
      name: 'NRW biodiversity data platform',
      reference: 'NRW-ALPHA-02',
      standardId: 'wales',
      serviceName: 'Biodiversity data platform',
      phase: 'alpha',
      mode: 'mobilise',
      lotTag: 'Lot 2 Data',
      ...shared,
    },
    update: {
      standardId: 'wales',
      clientOrg: 'Natural Resources Wales',
      ownerId,
    },
  });

  const placeholder = await prisma.engagement.findFirst({
    where: { orgId: DEMO_ACCOUNT.orgId, name: { in: ['test', 'Test'] } },
  });
  if (placeholder && placeholder.id !== 'nrw-demo') {
    await prisma.engagement.update({
      where: { id: placeholder.id },
      data: {
        name: 'NRW Discovery',
        clientOrg: 'Natural Resources Wales',
        phase: 'discovery',
        standardId: 'wales',
        ownerId,
      },
    });
  }

  await prisma.engagement.updateMany({
    where: { id: 'nrw-demo', name: { in: ['test', 'Test', ''] } },
    data: { name: 'NRW Discovery' },
  });
}

function walkthroughEmail(name: string): string {
  const local = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, '.')
    .replace(/^\.|\.$/g, '');
  return `${local}@demo.local`;
}

/** The eight people named in the review, with the FTE the teaching chart uses. */
async function ensureWalkthroughPeople(prisma: PrismaClient) {
  const orgId = DEMO_ACCOUNT.orgId;
  for (const person of WALKTHROUGH_PEOPLE) {
    const email = walkthroughEmail(person.name);
    const data = {
      name: person.name,
      fte: Math.round(person.free * 100),
      skills: Object.keys(person.skills),
    };
    const existing = await prisma.designPerson.findFirst({ where: { orgId, email } });
    if (existing) {
      await prisma.designPerson.update({ where: { id: existing.id }, data });
    } else {
      await prisma.designPerson.create({ data: { orgId, email, ...data } });
    }
  }
  console.log(`[seed:spine] Ensured ${WALKTHROUGH_PEOPLE.length} named people in the demo pool.`);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await ensureDemoAccount(prisma);
    await ensureDemoReader(prisma);
    const admin = await prisma.user.findUnique({ where: { email: DEMO_ACCOUNT.email } });
    if (!admin) {
      console.log('[seed:spine] Demo admin is missing. Skipping.');
      return;
    }
    await ensureEngagements(prisma, admin.id);
    await seedSystemArchetypes(prisma, [DEMO_ACCOUNT.orgId]);
    await ensureWalkthroughPeople(prisma);

    const pool = await prisma.designPerson.count({ where: { orgId: DEMO_ACCOUNT.orgId } });
    if (pool === 0) {
      const seeded = await seedDemoPool(prisma, { orgId: DEMO_ACCOUNT.orgId, adminUserId: admin.id });
      console.log(`[seed:spine] Seeded ${seeded.people} people across ${seeded.engagements} engagements.`);
    }

    const where = { engagementId: { in: [...DEMO_IDS] } };
    const counts = await Promise.all([
      prisma.engagementChecklistItem.count({ where }),
      prisma.engagementMilestone.count({ where }),
      prisma.raidItem.count({ where }),
      prisma.changeRequest.count({ where }),
      prisma.decisionRecord.count({ where }),
      prisma.engagementMeasure.count({ where }),
    ]);
    if (counts.every((n) => n === 0)) {
      await seedSpineDemo(prisma);
      console.log('[seed:spine] Loaded spine demo data for the NRW demo engagements.');
      return;
    }
    const milestones = await prisma.engagementMilestone.count({ where: { engagementId: 'nrw-demo' } });
    if (milestones === 0) {
      await prisma.engagementMilestone.create({
        data: {
          engagementId: 'nrw-demo',
          name: 'Show and tell',
          dueOn: day(14),
          proves: 'The squad can explain the discovery so far.',
          status: 'on-time',
        },
      });
    }
    console.log('[seed:spine] Demo engagements already have spine data. Skipping the spine reload.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.warn('[seed:spine] Skipped after an error:', error instanceof Error ? error.message : error);
  process.exit(0);
});
