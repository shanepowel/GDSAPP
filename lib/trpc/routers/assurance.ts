import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { assertEngagementInOrg, protectedProcedure, router } from '@/lib/trpc/trpc';
import { buildEvidenceChain } from '@/lib/assurance/chain';
import {
  autoMatchCapabilityLinks,
  computeAndSnapshotIndex,
  loadScoringInput,
} from '@/lib/assurance/scoring-load';
import { score } from '@/lib/scoring';
import { logActivity } from '@/lib/org-design/storage';
import { loadAssuranceReportPayload } from '@/lib/export/load-assurance-report';
import type { ReportSectionId } from '@/lib/export/assurance-report';

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
      }).then(async (created) => {
        await computeAndSnapshotIndex(
          ctx.prisma,
          input.engagementId,
          'judgement-confirmed',
        );
        return created;
      });
    }),

  preparednessIndex: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        /** Bypass snapshot cache and recompute. */
        force: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const now = new Date();
      const snapshots = await ctx.prisma.indexSnapshot.findMany({
        where: { engagementId: input.engagementId },
        orderBy: { computedAt: 'desc' },
        take: 12,
        select: { computedAt: true, value: true, cause: true, breakdown: true },
      });

      const latest = snapshots[0];
      const cacheFreshMs = 5 * 60 * 1000;
      const useCache =
        !input.force &&
        latest?.breakdown &&
        now.getTime() - latest.computedAt.getTime() < cacheFreshMs;

      const result = useCache
        ? (latest.breakdown as unknown as ReturnType<typeof score>)
        : score(await loadScoringInput(ctx.prisma, input.engagementId, now));

      if (!useCache) {
        await ctx.prisma.indexSnapshot.create({
          data: {
            engagementId: input.engagementId,
            computedAt: now,
            value: result.index,
            breakdown: result as unknown as object,
            cause: 'overview-load',
          },
        });
        snapshots.unshift({
          computedAt: now,
          value: result.index,
          cause: 'overview-load',
          breakdown: result as unknown as object,
        });
      }

      const expiring = await ctx.prisma.assuranceEvidence.findMany({
        where: {
          engagementId: input.engagementId,
          expiresAt: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: { id: true, title: true, expiresAt: true },
      });
      return {
        result,
        snapshots: snapshots
          .slice(0, 12)
          .reverse()
          .map(({ computedAt, value, cause }) => ({ computedAt, value, cause })),
        expiring,
        cached: Boolean(useCache),
      };
    }),

  autoMatchCapabilities: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const engagement = await assertEngagementInOrg(ctx, input.engagementId);
      return autoMatchCapabilityLinks(ctx.prisma, engagement.orgId, input.engagementId);
    }),

  setEvidenceOwner: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        criterionId: z.string(),
        personId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.criterionEvidenceOwner.upsert({
        where: {
          engagementId_criterionId: {
            engagementId: input.engagementId,
            criterionId: input.criterionId,
          },
        },
        create: {
          engagementId: input.engagementId,
          criterionId: input.criterionId,
          personId: input.personId,
        },
        update: { personId: input.personId },
      });
    }),

  getEvidenceOwner: protectedProcedure
    .input(z.object({ engagementId: z.string(), criterionId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.criterionEvidenceOwner.findUnique({
        where: {
          engagementId_criterionId: {
            engagementId: input.engagementId,
            criterionId: input.criterionId,
          },
        },
      });
    }),

  nudgeEvidenceOwner: protectedProcedure
    .input(z.object({ engagementId: z.string(), criterionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const engagement = await assertEngagementInOrg(ctx, input.engagementId);
      const owner = await ctx.prisma.criterionEvidenceOwner.findUnique({
        where: {
          engagementId_criterionId: {
            engagementId: input.engagementId,
            criterionId: input.criterionId,
          },
        },
      });
      if (!owner) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No evidence owner assigned' });
      }
      const person = await ctx.prisma.designPerson.findFirst({
        where: { id: owner.personId, orgId: engagement.orgId },
      });
      const criterion = await ctx.prisma.criterion.findUniqueOrThrow({
        where: { id: input.criterionId },
      });
      const deepLink = `/engagements/${input.engagementId}/assess/${encodeURIComponent(criterion.ref)}`;

      // Email delivery is environment-specific; record the nudge for the activity trail.
      await logActivity(ctx.prisma, engagement.orgId, 'evidence.nudge', criterion.ref, {
        personId: owner.personId,
        personName: person?.name ?? null,
        email: person?.email ?? null,
        deepLink,
      });

      return {
        ok: true as const,
        deepLink,
        emailed: Boolean(person?.email),
        recipient: person?.email ?? person?.name ?? owner.personId,
      };
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

  reportBundle: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        sections: z
          .array(z.enum(['overview', 'gaps', 'evidence', 'legacy-analysis']))
          .optional(),
        locale: z.enum(['en', 'cy']).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const preparedBy =
        ctx.session?.user?.name?.trim() || ctx.session?.user?.email || undefined;
      const result = await loadAssuranceReportPayload(ctx.prisma, {
        engagementId: input.engagementId,
        sections: input.sections as ReportSectionId[] | undefined,
        locale: input.locale,
        preparedBy,
      });
      if (!result.ok) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: result.message,
        });
      }
      return result.payload;
    }),

  judgementRegister: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const result = await loadAssuranceReportPayload(ctx.prisma, {
        engagementId: input.engagementId,
        sections: ['overview'],
        locale: 'en',
      });
      if (!result.ok) {
        throw new TRPCError({ code: 'PRECONDITION_FAILED', message: result.message });
      }
      return result.payload.judgements;
    }),
});
