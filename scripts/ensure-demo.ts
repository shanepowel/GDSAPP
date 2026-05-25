/**
 * Idempotent repair for demo login and NRW benchmark data (safe on production).
 * Run: npm run ensure:demo
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { runAndPersistAnalysis } from '../lib/db/analysis';

const prisma = new PrismaClient();

async function main() {
  const deploymentMode =
    process.env.DEPLOYMENT_MODE === 'client' || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'client'
      ? 'client'
      : 'internal';

  const org = await prisma.organisation.upsert({
    where: { id: 'demo-org' },
    create: { id: 'demo-org', name: 'Turner & Townsend Demo', deploymentMode },
    update: { deploymentMode },
  });

  const passwordHash = await bcrypt.hash('demo-password', 10);
  await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    create: {
      email: 'admin@demo.local',
      name: 'Demo Admin',
      role: 'admin',
      orgId: org.id,
      passwordHash,
    },
    update: { passwordHash, role: 'admin', orgId: org.id },
  });

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

  console.log('Demo account ready: admin@demo.local / demo-password');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
