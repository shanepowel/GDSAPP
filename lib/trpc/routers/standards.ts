import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { assertEngagementInOrg, protectedProcedure, router } from '@/lib/trpc/trpc';
import {
  bindPrimaryStandardVersion,
  catalogCodeToLegacyStandard,
  currentVersionIdForCode,
  ENGAGEMENT_MODES,
  ENGAGEMENT_PHASES,
  legacyStandardToCatalogCode,
  listAssessCriteria,
} from '@/lib/standards/catalog';

export const standardsRouter = router({
  listCatalog: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.catalogStandard.findMany({
      include: {
        versions: {
          where: { status: 'current' },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
          include: { _count: { select: { criteria: true } } },
        },
      },
      orderBy: { code: 'asc' },
    });
  }),

  assessList: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        locale: z.enum(['en', 'cy']).optional(),
        ignorePhaseFilter: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return listAssessCriteria(ctx.prisma, {
        engagementId: input.engagementId,
        locale: input.locale,
        ignorePhaseFilter: input.ignorePhaseFilter,
      });
    }),

  setPhase: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        phase: z.enum(ENGAGEMENT_PHASES),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: { phase: input.phase },
        select: { id: true, phase: true },
      });
    }),

  setMode: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        mode: z.enum(ENGAGEMENT_MODES),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: { mode: input.mode },
        select: { id: true, mode: true },
      });
    }),

  setStandards: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        standardVersionIds: z.array(z.string()).min(1),
        primaryVersionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      if (!input.standardVersionIds.includes(input.primaryVersionId)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Primary standard version must be included in the selection',
        });
      }

      const versions = await ctx.prisma.catalogStandardVersion.findMany({
        where: { id: { in: input.standardVersionIds } },
        include: { standard: true },
      });
      if (versions.length !== input.standardVersionIds.length) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Unknown standard version' });
      }

      const primary = versions.find((v) => v.id === input.primaryVersionId)!;
      const engineId = catalogCodeToLegacyStandard(primary.standard.code);

      await ctx.prisma.$transaction(async (tx) => {
        await tx.engagementStandard.deleteMany({ where: { engagementId: input.engagementId } });
        await tx.engagementStandard.createMany({
          data: input.standardVersionIds.map((standardVersionId) => ({
            engagementId: input.engagementId,
            standardVersionId,
            isPrimary: standardVersionId === input.primaryVersionId,
          })),
        });
        if (engineId) {
          await tx.engagement.update({
            where: { id: input.engagementId },
            data: { standardId: engineId },
          });
        }
      });

      return { ok: true as const };
    }),

  ensureBound: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const engagement = await assertEngagementInOrg(ctx, input.engagementId);
      const existing = await ctx.prisma.engagementStandard.count({
        where: { engagementId: input.engagementId },
      });
      if (existing > 0) return { bound: true as const, created: false };

      const code = legacyStandardToCatalogCode(engagement.standardId);
      const versionId = await currentVersionIdForCode(ctx.prisma, code);
      if (!versionId) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Catalog standards not seeded',
        });
      }
      await bindPrimaryStandardVersion(ctx.prisma, input.engagementId, versionId);
      return { bound: true as const, created: true };
    }),
});
