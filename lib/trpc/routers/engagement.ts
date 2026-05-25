import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { assertEngagementInOrg, protectedProcedure, router } from '@/lib/trpc/trpc';
import { runAndPersistAnalysis } from '@/lib/db/analysis';

export const engagementRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const engagements = await ctx.prisma.engagement.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { updatedAt: 'desc' },
      include: {
        requirements: {
          include: {
            runs: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });
    return engagements.map((e) => ({
      id: e.id,
      name: e.name,
      standardId: e.standardId,
      supplierTag: e.supplierTag,
      lotTag: e.lotTag,
      phase: e.requirements[0]?.phase ?? null,
      lastRun: e.requirements[0]?.runs[0] ?? null,
    }));
  }),

  delete: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.delete({ where: { id: input.engagementId } });
      return { ok: true };
    }),

  standardPoints: protectedProcedure
    .input(z.object({ standardId: z.enum(['gds', 'wales']) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.standardPoint.findMany({
        where: { standardId: input.standardId },
        orderBy: { number: 'asc' },
        select: { id: true, number: true, title: true },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        standardId: z.enum(['gds', 'wales']),
        supplierTag: z.string().optional(),
        lotTag: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.engagement.create({
        data: {
          name: input.name,
          standardId: input.standardId,
          supplierTag: input.supplierTag,
          lotTag: input.lotTag,
          orgId: ctx.orgId,
          requirements: {
            create: {
              title: 'Initial requirement',
              phase: 'discovery',
              outcome: '',
              channels: ['web'],
              sensitivity: 'official',
            },
          },
        },
      });
    }),

  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const engagement = await ctx.prisma.engagement.findFirst({
      where: { id: input.id, orgId: ctx.orgId },
      include: {
        requirements: {
          include: {
            roles: true,
            runs: { orderBy: { createdAt: 'desc' }, take: 5 },
            assignments: { include: { person: true } },
          },
        },
        people: { include: { skills: true, assignments: true } },
        _count: { select: { evidence: true, judgements: true } },
      },
    });
    if (!engagement) throw new TRPCError({ code: 'NOT_FOUND' });
    return engagement;
  }),

  updateMeta: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        name: z.string().min(1).optional(),
        supplierTag: z.string().nullable().optional(),
        lotTag: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const { engagementId, ...data } = input;
      return ctx.prisma.engagement.update({
        where: { id: engagementId },
        data,
      });
    }),

  addRequirement: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        title: z.string().min(1),
        phase: z.enum(['discovery', 'alpha', 'beta', 'live']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.requirement.create({
        data: {
          engagementId: input.engagementId,
          title: input.title,
          phase: input.phase,
          outcome: '',
          channels: ['web'],
          sensitivity: 'official',
        },
      });
    }),

  updateRequirement: protectedProcedure
    .input(
      z.object({
        requirementId: z.string(),
        title: z.string(),
        phase: z.enum(['discovery', 'alpha', 'beta', 'live']),
        outcome: z.string(),
        channels: z.array(z.string()),
        sensitivity: z.string(),
        flexPriority: z.enum(['balanced', 'cost', 'speed', 'quality']).optional(),
        roleLevelIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const req = await ctx.prisma.requirement.findUnique({
        where: { id: input.requirementId },
        include: { engagement: true },
      });
      if (!req || req.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });

      await ctx.prisma.requirementRole.deleteMany({ where: { requirementId: input.requirementId } });
      await ctx.prisma.requirement.update({
        where: { id: input.requirementId },
        data: {
          title: input.title,
          phase: input.phase,
          outcome: input.outcome,
          channels: input.channels,
          sensitivity: input.sensitivity,
          ...(input.flexPriority ? { flexPriority: input.flexPriority } : {}),
          roles: {
            create: input.roleLevelIds.map((roleLevelId) => ({ roleLevelId, weight: 1 })),
          },
        },
      });
      return { ok: true };
    }),

  upsertPerson: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        personId: z.string().optional(),
        displayName: z.string(),
        isVacancy: z.boolean(),
        skills: z.array(z.object({ skillId: z.string(), level: z.string() })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      if (input.personId) {
        await ctx.prisma.personSkill.deleteMany({ where: { personId: input.personId } });
        return ctx.prisma.person.update({
          where: { id: input.personId },
          data: {
            displayName: input.displayName,
            isVacancy: input.isVacancy,
            skills: { create: input.skills },
          },
        });
      }
      return ctx.prisma.person.create({
        data: {
          engagementId: input.engagementId,
          displayName: input.displayName,
          isVacancy: input.isVacancy,
          skills: { create: input.skills },
        },
      });
    }),

  deletePerson: protectedProcedure
    .input(z.object({ engagementId: z.string(), personId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const person = await ctx.prisma.person.findFirst({
        where: { id: input.personId, engagementId: input.engagementId },
      });
      if (!person) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.person.delete({ where: { id: input.personId } });
      return { ok: true };
    }),

  setAssignment: protectedProcedure
    .input(
      z.object({
        requirementId: z.string(),
        personId: z.string(),
        roleLevelId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const req = await ctx.prisma.requirement.findUnique({
        where: { id: input.requirementId },
        include: { engagement: true },
      });
      if (!req || req.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });

      const existing = await ctx.prisma.assignment.findFirst({
        where: { requirementId: input.requirementId, personId: input.personId },
      });
      if (existing) {
        return ctx.prisma.assignment.update({
          where: { id: existing.id },
          data: { roleLevelId: input.roleLevelId },
        });
      }
      return ctx.prisma.assignment.create({ data: input });
    }),

  runAnalysis: protectedProcedure
    .input(z.object({ requirementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const req = await ctx.prisma.requirement.findUnique({
        where: { id: input.requirementId },
        include: { engagement: true },
      });
      if (!req || req.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });
      const result = await runAndPersistAnalysis(input.requirementId);
      if (!result) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      return result;
    }),

  skills: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.skill.findMany({ orderBy: { name: 'asc' } });
  }),

  roleLevels: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.roleLevel.findMany({
      include: { role: true },
      orderBy: { role: { name: 'asc' } },
    });
  }),

  analysisHistory: protectedProcedure
    .input(z.object({ requirementId: z.string() }))
    .query(async ({ ctx, input }) => {
      const req = await ctx.prisma.requirement.findUnique({
        where: { id: input.requirementId },
        include: { engagement: true },
      });
      if (!req || req.engagement.orgId !== ctx.orgId) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.prisma.analysisRun.findMany({
        where: { requirementId: input.requirementId },
        orderBy: { createdAt: 'asc' },
      });
    }),
});
