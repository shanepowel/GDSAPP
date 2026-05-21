import { getServerSession } from 'next-auth';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/client';

export async function createContext(_opts?: FetchCreateContextFnOptions) {
  const session = await getServerSession(authOptions);
  return {
    prisma,
    session,
    orgId: session?.user?.orgId ?? null,
    userId: session?.user?.id ?? null,
    userRole: session?.user?.role ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
