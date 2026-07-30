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

/** Cached hash so login does not re-hash on every authorize. */
let cachedDemoHash: string | null = null;

async function demoPasswordHash(): Promise<string> {
  if (!cachedDemoHash) {
    cachedDemoHash = await bcrypt.hash(DEMO_ACCOUNT.password, 8);
  }
  return cachedDemoHash;
}

/** Idempotent demo org + password user (safe to call before credential authorize). */
export async function ensureDemoAccount(client: PrismaClient): Promise<void> {
  const deploymentMode = getDeploymentMode();
  const existing = await client.user.findUnique({
    where: { email: DEMO_ACCOUNT.email },
    select: { id: true, passwordHash: true, orgId: true },
  });

  if (existing?.passwordHash) {
    // Fast path: account already seeded — only ensure org mode stays in sync.
    await client.organisation.update({
      where: { id: DEMO_ACCOUNT.orgId },
      data: { deploymentMode },
    }).catch(async () => {
      await client.organisation.upsert({
        where: { id: DEMO_ACCOUNT.orgId },
        create: {
          id: DEMO_ACCOUNT.orgId,
          name: DEMO_ACCOUNT.orgName,
          deploymentMode,
        },
        update: { deploymentMode },
      });
    });
    return;
  }

  const org = await client.organisation.upsert({
    where: { id: DEMO_ACCOUNT.orgId },
    create: {
      id: DEMO_ACCOUNT.orgId,
      name: DEMO_ACCOUNT.orgName,
      deploymentMode,
    },
    update: { deploymentMode },
  });

  const passwordHash = await demoPasswordHash();
  await client.user.upsert({
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
