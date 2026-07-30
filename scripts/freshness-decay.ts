import { PrismaClient } from '@prisma/client';
import { runFreshnessDecay } from '../lib/assurance/freshness';

const prisma = new PrismaClient();

async function main() {
  const result = await runFreshnessDecay(prisma);
  console.log('Freshness decay:', result);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
