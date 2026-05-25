import { prisma } from '@/lib/db/client';

export async function isDatabaseSchemaReady(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
    return true;
  } catch {
    return false;
  }
}
