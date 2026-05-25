import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db/client';
import { getDeploymentMode } from '@/lib/deployment-mode';

export const DEMO_ACCOUNT = {
  email: 'admin@demo.local',
  password: 'demo-password',
  orgId: 'demo-org',
  orgName: 'Turner & Townsend Demo',
  userName: 'Demo Admin',
} as const;

/** Idempotent demo org + password user (safe to call before credential authorize). */
export async function ensureDemoAccount(prisma: PrismaClient): Promise<void> {
  const deploymentMode = getDeploymentMode();
  const org = await prisma.organisation.upsert({
    where: { id: DEMO_ACCOUNT.orgId },
    create: {
      id: DEMO_ACCOUNT.orgId,
      name: DEMO_ACCOUNT.orgName,
      deploymentMode,
    },
    update: { deploymentMode },
  });

  const passwordHash = await bcrypt.hash(DEMO_ACCOUNT.password, 10);
  await prisma.user.upsert({
    where: { email: DEMO_ACCOUNT.email },
    create: {
      email: DEMO_ACCOUNT.email,
      name: DEMO_ACCOUNT.userName,
      role: 'admin',
      orgId: org.id,
      passwordHash,
    },
    update: {
      passwordHash,
      role: 'admin',
      orgId: org.id,
    },
  });
}

export async function isDemoLoginReady(client: PrismaClient = prisma): Promise<boolean> {
  const user = await client.user.findUnique({
    where: { email: DEMO_ACCOUNT.email },
    select: { passwordHash: true },
  });
  return Boolean(user?.passwordHash);
}
