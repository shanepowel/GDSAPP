import { prisma } from '@/lib/db/client';

let cachedReady: boolean | null = null;
let cachedAt = 0;
const TTL_MS = 60_000;

export async function isDatabaseSchemaReady(): Promise<boolean> {
  const now = Date.now();
  if (cachedReady !== null && now - cachedAt < TTL_MS) {
    return cachedReady;
  }
  try {
    await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
    cachedReady = true;
    cachedAt = now;
    return true;
  } catch {
    cachedReady = false;
    cachedAt = now;
    return false;
  }
}
