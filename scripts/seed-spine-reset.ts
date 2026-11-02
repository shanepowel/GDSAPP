/** Reloads the spine demo data for the NRW demo engagements, replacing what is there. Dates roll forward to today. */
import { PrismaClient } from '@prisma/client';
import { seedSpineDemo } from './seed-spine-demo';

const prisma = new PrismaClient();
seedSpineDemo(prisma)
  .then(() => console.log('[seed:spine:reset] Reloaded spine demo data.'))
  .finally(() => prisma.$disconnect());
