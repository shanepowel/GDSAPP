import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { assertEngagementInOrg, protectedProcedure, router } from '@/lib/trpc/trpc';
import { buildEvidenceChain } from '@/lib/assurance/chain';

const verdictSchema = z.enum(['met', 'at-risk', 'not-met', 'not-assessed']);
const evidenceKindSchema = z.enum([
  'document',
  'research',
  'test',
  'decision',
  'code',
  'metric',
  'other',
]);
const provenanceSchema = z.enum(['manual', 'integration', 'import']);

export const assuranceRouter = router({
  listEvidence: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const now = new Date();
      const rows = await ctx.prisma.assuranceEvidence.findMany({
        where: { engagementId: input.engagementId },
        include: { criteria: { include: { criterion: true } } },
        orderBy: { updatedAt: 'desc' },
      });
      return rows.map((r) => {
        let freshness: 'fresh' | 'expiring' | 'expired' | 'none' = 'none';
        if (r.expiresAt) {
          const ms = r.expiresAt.getTime() - now.getTime();
          if (ms < 0) freshness = 'expired';
          else if (ms < 30 * 24 * 60 * 60 * 1000) freshness = 'expiring';
          else freshness = 'fresh';
        }
        return {
          ...r,
          freshness,
          linkedCriteriaCount: r.criteria.length,
        };
      });
    }),

  upsertEvidence: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        id: z.string().optional(),
        title: z.string().min(1),
        kind: evidenceKindSchema,
        uri: z.string().optional().nullable(),
        producedAt: z.date().optional().nullable(),
        expiresAt: z.date().optional().nullable(),
        confidentiality: z.enum(['internal', 'client', 'publishable']).optional(),
        provenance: provenanceSchema.optional(),
        criterionIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const { engagementId, id, criterionIds, ...data } = input;

      if (id) {
        const existing = await ctx.prisma.assuranceEvidence.findFirst({
          where: { id, engagementId },
        });
        if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
        await ctx.prisma.evidenceCriterion.deleteMany({ where: { evidenceId: id } });
        return ctx.prisma.assuranceEvidence.update({
          where: { id },
          data: {
            ...data,
            provenance: data.provenance ?? existing.provenance,
            confidentiality: data.confidentiality ?? existing.confidentiality,
            criteria: {
              create: criterionIds.map((criterionId) => ({ criterionId })),
            },
          },
          include: { criteria: true },
        });
      }

      return ctx.prisma.assuranceEvidence.create({
        data: {
          engagementId,
          title: data.title,
          kind: data.kind,
          uri: data.uri,
          producedAt: data.producedAt,
          expiresAt: data.expiresAt,
          confidentiality: data.confidentiality ?? 'client',
          provenance: data.provenance ?? 'manual',
          createdByUserId: ctx.userId,
          criteria: {
            create: criterionIds.map((criterionId) => ({ criterionId })),
          },
        },
        include: { criteria: true },
      });
    }),

  deleteEvidence: protectedProcedure
    .input(z.object({ engagementId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.assuranceEvidence.deleteMany({
        where: { id: input.id, engagementId: input.engagementId },
      });
      return { ok: true as const };
    }),

  currentJudgement: protectedProcedure
    .input(z.object({ engagementId: z.string(), criterionId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.criterionJudgement.findFirst({
        where: {
          engagementId: input.engagementId,
          criterionId: input.criterionId,
          supersededById: null,
        },
        orderBy: { confirmedAt: 'desc' },
      });
    }),

  judgementHistory: protectedProcedure
    .input(z.object({ engagementId: z.string(), criterionId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.criterionJudgement.findMany({
        where: { engagementId: input.engagementId, criterionId: input.criterionId },
        orderBy: { confirmedAt: 'desc' },
      });
    }),

  confirmJudgement: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        criterionId: z.string(),
        verdict: verdictSchema,
        rationale: z.string().min(40),
        proposedBy: z.enum(['human', 'ai', 'system']).default('human'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);

      return ctx.prisma.$transaction(async (tx) => {
        const previous = await tx.criterionJudgement.findFirst({
          where: {
            engagementId: input.engagementId,
            criterionId: input.criterionId,
            supersededById: null,
          },
        });

        const created = await tx.criterionJudgement.create({
          data: {
            engagementId: input.engagementId,
            criterionId: input.criterionId,
            verdict: input.verdict,
            rationale: input.rationale,
            proposedBy: input.proposedBy,
            proposedByUserId: ctx.userId,
            confirmedByUserId: ctx.userId,
          },
        });

        if (previous) {
          await tx.criterionJudgement.update({
            where: { id: previous.id },
            data: { supersededById: created.id },
          });
        }

        return created;
      });
    }),

  evidenceChain: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        criterionId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return buildEvidenceChain(ctx.prisma, input.engagementId, input.criterionId, new Date());
    }),
});
