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
      phase: e.requirements[0]?.phase ?? null,
      lastRun: e.requirements[0]?.runs[0] ?? null,
    }));
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        standardId: z.enum(['gds', 'wales']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.engagement.create({
        data: {
          name: input.name,
          standardId: input.standardId,
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
      },
    });
    if (!engagement) throw new TRPCError({ code: 'NOT_FOUND' });
    return engagement;
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
