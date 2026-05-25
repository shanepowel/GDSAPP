import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '@/lib/trpc/trpc';
import { buildBenchmarkSummary } from '@/lib/benchmarking/aggregate';

export const benchmarkingRouter = router({
  summary: protectedProcedure.query(async ({ ctx }) => {
    return buildBenchmarkSummary(ctx.prisma, ctx.orgId);
  }),

  list: protectedProcedure
    .input(z.object({ engagementId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.outcome.findMany({
        where: {
          requirement: {
            engagement: {
              orgId: ctx.orgId,
              ...(input.engagementId ? { id: input.engagementId } : {}),
            },
          },
        },
        include: {
          requirement: {
            include: { engagement: { select: { id: true, name: true } } },
          },
        },
        orderBy: { recordedAt: 'desc' },
        take: 100,
      });
    }),

  record: protectedProcedure
    .input(
      z.object({
        requirementId: z.string(),
        event: z.string().min(1),
        result: z.string().min(1),
        phase: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const req = await ctx.prisma.requirement.findUnique({
        where: { id: input.requirementId },
        include: { engagement: true },
      });
      if (!req || req.engagement.orgId !== ctx.orgId) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return ctx.prisma.outcome.create({
        data: {
          requirementId: input.requirementId,
          event: input.event,
          result: input.result,
          phase: input.phase ?? req.phase,
          notes: input.notes,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string(), requirementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const req = await ctx.prisma.requirement.findUnique({
        where: { id: input.requirementId },
        include: { engagement: true },
      });
      if (!req || req.engagement.orgId !== ctx.orgId) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return ctx.prisma.outcome.delete({ where: { id: input.id } });
    }),
});
