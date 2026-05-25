/**
 * Idempotent repair for demo login and NRW benchmark data (safe on production).
 * Run: npm run ensure:demo
 */
import { PrismaClient } from '@prisma/client';
import { runAndPersistAnalysis } from '../lib/db/analysis';
import { DEMO_ACCOUNT, ensureDemoAccount } from '../lib/demo/demo-account';

const prisma = new PrismaClient();

async function main() {
  await ensureDemoAccount(prisma);

  const req = await prisma.requirement.findUnique({ where: { id: 'nrw-req-1' } });
  if (req) {
    const analysis = await runAndPersistAnalysis(req.id);
    if (analysis) {
      console.log(
        `NRW demo analysis refreshed: ${Math.round(analysis.overallReadiness)}% (${analysis.readinessBand}).`,
      );
    }
  } else {
    console.warn('nrw-req-1 not found — run npm run db:seed-all first.');
  }

  console.log(`Demo account ready: ${DEMO_ACCOUNT.email} / ${DEMO_ACCOUNT.password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
