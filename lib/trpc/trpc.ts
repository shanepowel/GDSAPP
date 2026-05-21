import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from '@/lib/trpc/context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user?.orgId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      orgId: ctx.session.user.orgId,
      userId: ctx.session.user.id!,
      userRole: ctx.session.user.role ?? 'member',
    },
  });
});

async function assertEngagementInOrg(ctx: Context & { orgId: string }, engagementId: string) {
  const engagement = await ctx.prisma.engagement.findFirst({
    where: { id: engagementId, orgId: ctx.orgId },
  });
  if (!engagement) throw new TRPCError({ code: 'NOT_FOUND' });
  return engagement;
}

export { assertEngagementInOrg };
