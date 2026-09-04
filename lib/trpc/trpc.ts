import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from '@/lib/trpc/context';
import { assertOrgDeploymentMode } from '@/lib/tenant-firewall';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next, type }) => {
  if (!ctx.session?.user?.orgId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  const orgId = ctx.session.user.orgId;
  const userRole = ctx.session.user.role ?? 'member';
  if (type === 'mutation' && userRole === 'demo-reader') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Demonstration build is read-only. Nothing here is a hiring decision.',
    });
  }
  const enriched = {
    ...ctx,
    orgId,
    userId: ctx.session.user.id!,
    userRole,
  };
  await assertOrgDeploymentMode({ prisma: ctx.prisma, orgId });
  return next({ ctx: enriched });
});

async function assertEngagementInOrg(ctx: Context & { orgId: string }, engagementId: string) {
  const engagement = await ctx.prisma.engagement.findFirst({
    where: { id: engagementId, orgId: ctx.orgId },
  });
  if (!engagement) throw new TRPCError({ code: 'NOT_FOUND' });
  return engagement;
}

export { assertEngagementInOrg };
