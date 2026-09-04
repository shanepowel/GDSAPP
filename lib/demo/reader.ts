import type { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db/client';
import { getDeploymentMode } from '@/lib/deployment-mode';
import { DEMO_ACCOUNT } from '@/lib/demo/demo-account';

export const DEMO_READER_ROLE = 'demo-reader';

export const DEMO_READER = {
  email: 'demo.reader@demo.local',
  name: 'Demonstration reader',
  role: DEMO_READER_ROLE,
} as const;

export function isDemoReaderRole(role: string | null | undefined): boolean {
  return role === DEMO_READER_ROLE;
}

/** Shared read-only identity. No password. Used by /demo, never shown as credentials. */
export async function ensureDemoReader(client: PrismaClient = prisma) {
  const deploymentMode = getDeploymentMode();
  const org = await client.organisation.upsert({
    where: { id: DEMO_ACCOUNT.orgId },
    create: {
      id: DEMO_ACCOUNT.orgId,
      name: DEMO_ACCOUNT.orgName,
      deploymentMode,
    },
    update: { deploymentMode },
  });

  return client.user.upsert({
    where: { email: DEMO_READER.email },
    create: {
      email: DEMO_READER.email,
      name: DEMO_READER.name,
      role: DEMO_READER.role,
      orgId: org.id,
    },
    update: {
      name: DEMO_READER.name,
      role: DEMO_READER.role,
      orgId: org.id,
    },
  });
}
