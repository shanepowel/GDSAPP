/**
 * Runs on deploy. Loads the delivery spine demo data (scripts/seed-spine-demo.ts) into the two
 * NRW demo engagements, but only when they exist and have no spine data yet, so it never
 * overwrites anything a person has entered. Never fails the build.
 */
import { PrismaClient } from '@prisma/client';
import { seedSpineDemo } from './seed-spine-demo';

const DEMO_IDS = ['nrw-demo', 'nrw-demo-2'];

async function main() {
  const prisma = new PrismaClient();
  try {
    const found = await prisma.engagement.count({ where: { id: { in: DEMO_IDS } } });
    if (found !== DEMO_IDS.length) {
      console.log('[seed:spine] Demo engagements not found. Run npm run seed:demo first. Skipping.');
      return;
    }
    const [checklist, measures] = await Promise.all([
      prisma.engagementChecklistItem.count({ where: { engagementId: { in: DEMO_IDS } } }),
      prisma.engagementMeasure.count({ where: { engagementId: { in: DEMO_IDS } } }),
    ]);
    if (checklist > 0 || measures > 0) {
      console.log('[seed:spine] Demo engagements already have spine data. Skipping.');
      return;
    }
    await seedSpineDemo(prisma);
    console.log('[seed:spine] Loaded spine demo data for the NRW demo engagements.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.warn('[seed:spine] Skipped after an error:', error instanceof Error ? error.message : error);
  process.exit(0);
});
