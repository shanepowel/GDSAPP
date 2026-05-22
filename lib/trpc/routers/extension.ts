import { randomBytes } from 'crypto';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { assertEngagementInOrg, protectedProcedure, router } from '@/lib/trpc/trpc';
import { buildAnswerScaffold } from '@/lib/engine/draft-scaffold';
import { computeBidOutlook } from '@/lib/engine/bid';
import { buildEvidenceMapsForBid, loadEvidenceMaps } from '@/lib/db/extension';
import { buildAnalysisInput } from '@/lib/db/analysis';

const evidenceStrength = z.enum([
  'none',
  'asserted',
  'documented',
  'demonstrated',
  'independently_verified',
]);

export const extensionRouter = router({
  evidence: {
    list: protectedProcedure.input(z.object({ engagementId: z.string() })).query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.evidence.findMany({
        where: { engagementId: input.engagementId },
        include: { links: true },
        orderBy: { createdAt: 'desc' },
      });
    }),

    upsert: protectedProcedure
      .input(
        z.object({
          engagementId: z.string(),
          id: z.string().optional(),
          title: z.string(),
          type: z.string(),
          description: z.string().optional(),
          url: z.string().optional(),
          strength: evidenceStrength,
          links: z.array(
            z.object({
              pointId: z.string().optional(),
              questionId: z.string().optional(),
              roleLevelId: z.string().optional(),
            }),
          ),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await assertEngagementInOrg(ctx, input.engagementId);
        if (input.id) {
          await ctx.prisma.evidenceLink.deleteMany({ where: { evidenceId: input.id } });
          return ctx.prisma.evidence.update({
            where: { id: input.id },
            data: {
              title: input.title,
              type: input.type,
              description: input.description,
              url: input.url,
              strength: input.strength,
              links: { create: input.links },
            },
            include: { links: true },
          });
        }
        return ctx.prisma.evidence.create({
          data: {
            engagementId: input.engagementId,
            title: input.title,
            type: input.type,
            description: input.description,
            url: input.url,
            strength: input.strength,
            links: { create: input.links },
          },
          include: { links: true },
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string(), engagementId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await assertEngagementInOrg(ctx, input.engagementId);
        return ctx.prisma.evidence.delete({ where: { id: input.id } });
      }),
  },

  rigour: {
    latest: protectedProcedure
      .input(z.object({ requirementId: z.string() }))
      .query(async ({ ctx, input }) => {
        const req = await ctx.prisma.requirement.findUnique({
          where: { id: input.requirementId },
          include: { engagement: true },
        });
        if (!req || req.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });
        return ctx.prisma.rigourAssessment.findFirst({
          where: { requirementId: input.requirementId },
          orderBy: { createdAt: 'desc' },
          include: { dimensions: true },
        });
      }),

    save: protectedProcedure
      .input(
        z.object({
          requirementId: z.string(),
          assessedBy: z.string().optional(),
          dimensions: z.array(
            z.object({
              dimension: z.string(),
              score: z.number().min(0).max(4),
              evidenceNote: z.string().optional(),
            }),
          ),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const req = await ctx.prisma.requirement.findUnique({
          where: { id: input.requirementId },
          include: { engagement: true },
        });
        if (!req || req.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });
        return ctx.prisma.rigourAssessment.create({
          data: {
            requirementId: input.requirementId,
            assessedBy: input.assessedBy,
            dimensions: { create: input.dimensions },
          },
          include: { dimensions: true },
        });
      }),
  },

  tender: {
    list: protectedProcedure.input(z.object({ engagementId: z.string() })).query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.tender.findMany({
        where: { engagementId: input.engagementId },
        include: { questions: { include: { roleDeps: true, skillDeps: true, pointRefs: true } } },
      });
    }),

    upsert: protectedProcedure
      .input(
        z.object({
          engagementId: z.string(),
          id: z.string().optional(),
          title: z.string(),
          buyer: z.string(),
          route: z.string().optional(),
          qualityWeight: z.number(),
          priceWeight: z.number(),
          scoringScaleMax: z.number().default(5),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await assertEngagementInOrg(ctx, input.engagementId);
        const { id, engagementId, ...data } = input;
        if (id) {
          return ctx.prisma.tender.update({ where: { id }, data });
        }
        return ctx.prisma.tender.create({ data: { engagementId, ...data } });
      }),

    addQuestion: protectedProcedure
      .input(
        z.object({
          tenderId: z.string(),
          ref: z.string(),
          text: z.string(),
          weight: z.number(),
          passThreshold: z.number().optional(),
          isPassFail: z.boolean().optional(),
          category: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const tender = await ctx.prisma.tender.findUnique({
          where: { id: input.tenderId },
          include: { engagement: true },
        });
        if (!tender || tender.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });
        const { tenderId, ...data } = input;
        return ctx.prisma.scoredQuestion.create({ data: { tenderId, ...data } });
      }),

    updateQuestionDeps: protectedProcedure
      .input(
        z.object({
          questionId: z.string(),
          roleDeps: z.array(
            z.object({
              roleId: z.string(),
              weight: z.number().default(1),
              minSeniorityRank: z.number().default(0),
            }),
          ),
          skillDeps: z.array(
            z.object({
              skillId: z.string(),
              minLevel: z.string(),
              weight: z.number().default(1),
            }),
          ),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const q = await ctx.prisma.scoredQuestion.findUnique({
          where: { id: input.questionId },
          include: { tender: { include: { engagement: true } } },
        });
        if (!q || q.tender.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });
        await ctx.prisma.questionRoleDep.deleteMany({ where: { questionId: input.questionId } });
        await ctx.prisma.questionSkillDep.deleteMany({ where: { questionId: input.questionId } });
        return ctx.prisma.scoredQuestion.update({
          where: { id: input.questionId },
          data: {
            roleDeps: { create: input.roleDeps },
            skillDeps: { create: input.skillDeps },
          },
          include: { roleDeps: true, skillDeps: true },
        });
      }),

    bidOutlook: protectedProcedure
      .input(z.object({ tenderId: z.string(), requirementId: z.string() }))
      .query(async ({ ctx, input }) => {
        const tender = await ctx.prisma.tender.findUnique({
          where: { id: input.tenderId },
          include: {
            engagement: true,
            questions: { include: { roleDeps: true, skillDeps: true } },
          },
        });
        if (!tender || tender.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });
        const team = await buildAnalysisInput(input.requirementId);
        if (!team) throw new TRPCError({ code: 'NOT_FOUND' });
        const { items } = await loadEvidenceMaps(tender.engagementId);
        const maps = buildEvidenceMapsForBid(items);
        return computeBidOutlook({
          team,
          scoringScaleMax: tender.scoringScaleMax,
          qualityWeight: tender.qualityWeight,
          evidenceByPoint: maps.evidenceByPoint,
          evidenceByQuestion: maps.evidenceByQuestion,
          questions: tender.questions.map((q) => ({
            questionId: q.id,
            ref: q.ref,
            text: q.text,
            weight: q.weight,
            passThreshold: q.passThreshold,
            isPassFail: q.isPassFail,
            category: q.category,
            roleDeps: q.roleDeps,
            skillDeps: q.skillDeps.map((s) => ({
              skillId: s.skillId,
              minLevel: s.minLevel as 'awareness',
              weight: s.weight,
            })),
          })),
        });
      }),

    saveDraft: protectedProcedure
      .input(
        z.object({
          questionId: z.string(),
          body: z.string(),
          isScaffold: z.boolean().default(true),
          approvedBy: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const q = await ctx.prisma.scoredQuestion.findUnique({
          where: { id: input.questionId },
          include: { tender: { include: { engagement: true } } },
        });
        if (!q || q.tender.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });
        return ctx.prisma.questionDraft.create({
          data: {
            questionId: input.questionId,
            body: input.body,
            isScaffold: input.isScaffold,
            approvedBy: input.approvedBy,
          },
        });
      }),

    buildScaffold: protectedProcedure
      .input(
        z.object({
          questionId: z.string(),
          requirementId: z.string(),
          tenderId: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const q = await ctx.prisma.scoredQuestion.findUnique({
          where: { id: input.questionId },
          include: {
            tender: { include: { engagement: true, questions: { include: { roleDeps: true, skillDeps: true } } } },
          },
        });
        if (!q || q.tender.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });
        const team = await buildAnalysisInput(input.requirementId);
        if (!team) throw new TRPCError({ code: 'NOT_FOUND' });
        const { items } = await loadEvidenceMaps(q.tender.engagementId);
        const maps = buildEvidenceMapsForBid(items);
        const outlook = computeBidOutlook({
          team,
          scoringScaleMax: q.tender.scoringScaleMax,
          qualityWeight: q.tender.qualityWeight,
          evidenceByPoint: maps.evidenceByPoint,
          evidenceByQuestion: maps.evidenceByQuestion,
          questions: q.tender.questions.map((tq) => ({
            questionId: tq.id,
            ref: tq.ref,
            text: tq.text,
            weight: tq.weight,
            passThreshold: tq.passThreshold,
            isPassFail: tq.isPassFail,
            category: tq.category,
            roleDeps: tq.roleDeps,
            skillDeps: tq.skillDeps.map((s) => ({
              skillId: s.skillId,
              minLevel: s.minLevel as 'awareness',
              weight: s.weight,
            })),
          })),
        });
        const run = await ctx.prisma.analysisRun.findFirst({
          where: { requirementId: input.requirementId },
          orderBy: { createdAt: 'desc' },
        });
        const bidQ = outlook.questions.find((x) => x.questionId === input.questionId);
        const body = buildAnswerScaffold(q.text, bidQ, run?.result as never);
        return ctx.prisma.questionDraft.create({
          data: { questionId: input.questionId, body, isScaffold: true },
        });
      }),
  },

  constraint: {
    upsert: protectedProcedure
      .input(
        z.object({
          requirementId: z.string(),
          budgetCap: z.number().optional(),
          startBy: z.coerce.date().optional(),
          endBy: z.coerce.date().optional(),
          internalRatePerDay: z.number().optional(),
          partnerRatePerDay: z.number().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const req = await ctx.prisma.requirement.findUnique({
          where: { id: input.requirementId },
          include: { engagement: true },
        });
        if (!req || req.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });
        const existing = await ctx.prisma.constraint.findFirst({
          where: { requirementId: input.requirementId },
        });
        const { requirementId, ...data } = input;
        if (existing) {
          return ctx.prisma.constraint.update({ where: { id: existing.id }, data });
        }
        return ctx.prisma.constraint.create({ data: { requirementId, ...data } });
      }),
  },

  judgement: {
    record: protectedProcedure
      .input(
        z.object({
          engagementId: z.string(),
          subjectType: z.string(),
          subjectId: z.string(),
          status: z.string(),
          score: z.number().optional(),
          decidedBy: z.string(),
          overrideReason: z.string().optional(),
          frameworkVersionId: z.string().optional(),
          previousJudgementId: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await assertEngagementInOrg(ctx, input.engagementId);
        return ctx.prisma.judgement.create({ data: input });
      }),

    list: protectedProcedure.input(z.object({ engagementId: z.string() })).query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.judgement.findMany({
        where: { engagementId: input.engagementId },
        orderBy: { decidedAt: 'desc' },
      });
    }),
  },

  share: {
    create: protectedProcedure
      .input(z.object({ engagementId: z.string(), daysValid: z.number().default(14) }))
      .mutation(async ({ ctx, input }) => {
        await assertEngagementInOrg(ctx, input.engagementId);
        const token = randomBytes(24).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.daysValid);
        return ctx.prisma.shareLink.create({
          data: { engagementId: input.engagementId, token, expiresAt },
        });
      }),

    revoke: protectedProcedure
      .input(z.object({ id: z.string(), engagementId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await assertEngagementInOrg(ctx, input.engagementId);
        return ctx.prisma.shareLink.delete({ where: { id: input.id } });
      }),

    list: protectedProcedure.input(z.object({ engagementId: z.string() })).query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.shareLink.findMany({
        where: { engagementId: input.engagementId },
        orderBy: { createdAt: 'desc' },
      });
    }),
  },
});
