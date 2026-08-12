import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { protectedProcedure, router, assertEngagementInOrg } from '@/lib/trpc/trpc';
import { recomputeTeamFit } from '@/lib/team-fit/recompute';

const skillLevel = z.enum(['awareness', 'working', 'practitioner', 'expert']);
const criticality = z.enum(['core', 'supporting', 'optional']);

export const teamFitRouter = router({
  listArchetypes: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.roleArchetype.findMany({
      where: { orgId: ctx.orgId, archivedAt: null },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }, { version: 'desc' }],
      include: { roles: { orderBy: { sortOrder: 'asc' } } },
    });
  }),

  getArchetype: protectedProcedure
    .input(z.object({ slug: z.string(), version: z.number().int().optional() }))
    .query(async ({ ctx, input }) => {
      const where = {
        orgId: ctx.orgId,
        slug: input.slug,
        archivedAt: null as Date | null,
        ...(input.version != null ? { version: input.version } : {}),
      };
      const row = await ctx.prisma.roleArchetype.findFirst({
        where,
        orderBy: { version: 'desc' },
        include: { roles: { orderBy: { sortOrder: 'asc' } } },
      });
      if (!row) throw new TRPCError({ code: 'NOT_FOUND' });
      return row;
    }),

  cloneArchetype: protectedProcedure
    .input(z.object({ archetypeId: z.string(), name: z.string().min(1).max(120) }))
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.prisma.roleArchetype.findFirst({
        where: { id: input.archetypeId, orgId: ctx.orgId },
        include: { roles: true },
      });
      if (!source) throw new TRPCError({ code: 'NOT_FOUND' });

      const slugBase = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60);
      const slug = `${slugBase || 'custom'}-${Date.now().toString(36)}`;

      return ctx.prisma.roleArchetype.create({
        data: {
          orgId: ctx.orgId,
          name: input.name,
          slug,
          context: 'custom',
          description: source.description,
          standardRefs: source.standardRefs as Prisma.InputJsonValue,
          version: 1,
          isSystem: false,
          roles: {
            create: source.roles.map((r) => ({
              ddatRoleId: r.ddatRoleId,
              displayTitle: r.displayTitle,
              minLevel: r.minLevel,
              fteRequired: r.fteRequired,
              criticality: r.criticality,
              sortOrder: r.sortOrder,
              requiredSkills: r.requiredSkills as Prisma.InputJsonValue,
            })),
          },
        },
        include: { roles: true },
      });
    }),

  updateArchetype: protectedProcedure
    .input(
      z.object({
        archetypeId: z.string(),
        name: z.string().min(1).max(120).optional(),
        description: z.string().max(4000).optional(),
        standardRefs: z.array(z.string()).optional(),
        roles: z
          .array(
            z.object({
              ddatRoleId: z.string(),
              displayTitle: z.string(),
              minLevel: skillLevel,
              fteRequired: z.number().positive().max(10),
              criticality,
              sortOrder: z.number().int(),
              requiredSkills: z.array(
                z.object({
                  skillId: z.string(),
                  requiredLevel: skillLevel,
                  weight: z.number().positive(),
                }),
              ),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.prisma.roleArchetype.findFirst({
        where: { id: input.archetypeId, orgId: ctx.orgId },
        include: { roles: true },
      });
      if (!source) throw new TRPCError({ code: 'NOT_FOUND' });
      if (source.isSystem) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'System archetypes are not editable. Clone to create a workspace copy.',
        });
      }

      // Version bump: archive current, create new version
      await ctx.prisma.roleArchetype.update({
        where: { id: source.id },
        data: { archivedAt: new Date() },
      });

      return ctx.prisma.roleArchetype.create({
        data: {
          orgId: ctx.orgId,
          name: input.name ?? source.name,
          slug: source.slug,
          context: source.context,
          description: input.description ?? source.description,
          standardRefs: (input.standardRefs ?? source.standardRefs) as Prisma.InputJsonValue,
          version: source.version + 1,
          isSystem: false,
          roles: {
            create: (input.roles ?? source.roles).map((r) => ({
              ddatRoleId: r.ddatRoleId,
              displayTitle: r.displayTitle,
              minLevel: r.minLevel,
              fteRequired: r.fteRequired,
              criticality: r.criticality,
              sortOrder: r.sortOrder,
              requiredSkills: ('requiredSkills' in r
                ? r.requiredSkills
                : (r as { requiredSkills: unknown }).requiredSkills) as Prisma.InputJsonValue,
            })),
          },
        },
        include: { roles: { orderBy: { sortOrder: 'asc' } } },
      });
    }),

  overview: protectedProcedure
    .input(z.object({ engagementId: z.string(), archetypeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const archetype = await ctx.prisma.roleArchetype.findFirst({
        where: { id: input.archetypeId, orgId: ctx.orgId },
        include: { roles: { orderBy: { sortOrder: 'asc' } } },
      });
      if (!archetype) throw new TRPCError({ code: 'NOT_FOUND' });

      const people = await ctx.prisma.person.findMany({
        where: { engagementId: input.engagementId, isVacancy: false },
        select: { id: true, displayName: true },
      });
      const peopleById = new Map(people.map((p) => [p.id, p]));

      const scores = await ctx.prisma.fitScore.findMany({
        where: {
          engagementId: input.engagementId,
          archetypeRoleId: { in: archetype.roles.map((r) => r.id) },
        },
        orderBy: { compositeScore: 'desc' },
      });

      const gaps = await ctx.prisma.capabilityGap.findMany({
        where: {
          engagementId: input.engagementId,
          archetypeRoleId: { in: archetype.roles.map((r) => r.id) },
        },
      });

      const rows = archetype.roles.map((role) => {
        const roleScores = scores.filter((s) => s.archetypeRoleId === role.id);
        const best = roleScores[0] ?? null;
        const gap = gaps.find((g) => g.archetypeRoleId === role.id) ?? null;
        return {
          role,
          bestScore: best
            ? {
                ...best,
                personName: peopleById.get(best.personId)?.displayName ?? 'Unknown',
              }
            : null,
          gap,
          candidateCount: roleScores.length,
        };
      });

      return {
        archetype,
        rows,
        scoreCount: scores.length,
        computedAt: scores[0]?.computedAt ?? null,
      };
    }),

  roleCandidates: protectedProcedure
    .input(z.object({ engagementId: z.string(), archetypeRoleId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const role = await ctx.prisma.archetypeRole.findFirst({
        where: { id: input.archetypeRoleId, archetype: { orgId: ctx.orgId } },
        include: { archetype: true },
      });
      if (!role) throw new TRPCError({ code: 'NOT_FOUND' });

      const people = await ctx.prisma.person.findMany({
        where: { engagementId: input.engagementId, isVacancy: false },
      });
      const peopleById = new Map(people.map((p) => [p.id, p]));

      const scores = await ctx.prisma.fitScore.findMany({
        where: {
          engagementId: input.engagementId,
          archetypeRoleId: input.archetypeRoleId,
        },
        orderBy: { compositeScore: 'desc' },
      });

      return {
        role,
        candidates: scores.map((s) => ({
          ...s,
          personName: peopleById.get(s.personId)?.displayName ?? 'Unknown',
        })),
      };
    }),

  recompute: protectedProcedure
    .input(z.object({ engagementId: z.string(), archetypeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return recomputeTeamFit(ctx.prisma, {
        orgId: ctx.orgId,
        engagementId: input.engagementId,
        archetypeId: input.archetypeId,
      });
    }),

  getProposal: protectedProcedure
    .input(z.object({ engagementId: z.string(), archetypeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.squadProposal.findFirst({
        where: {
          engagementId: input.engagementId,
          archetypeId: input.archetypeId,
          status: { in: ['draft', 'confirmed'] },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          assignments: true,
          archetype: { include: { roles: { orderBy: { sortOrder: 'asc' } } } },
        },
      });
    }),

  saveDraftAssignment: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        archetypeId: z.string(),
        archetypeRoleId: z.string(),
        personId: z.string(),
        fteAllocated: z.number().positive().max(5),
        fitScoreId: z.string().optional(),
        rationale: z.string().max(2000).optional(),
        overrideReason: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);

      let proposal = await ctx.prisma.squadProposal.findFirst({
        where: {
          engagementId: input.engagementId,
          archetypeId: input.archetypeId,
          status: 'draft',
        },
      });
      if (!proposal) {
        proposal = await ctx.prisma.squadProposal.create({
          data: {
            engagementId: input.engagementId,
            archetypeId: input.archetypeId,
            status: 'draft',
          },
        });
      }

      if (input.fitScoreId) {
        const score = await ctx.prisma.fitScore.findUnique({ where: { id: input.fitScoreId } });
        if (score && (score.band === 'stretch' || score.band === 'gap') && !input.overrideReason?.trim()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Assigning a stretch or gap candidate requires an override reason.',
          });
        }
      }

      const existing = await ctx.prisma.squadAssignment.findFirst({
        where: { proposalId: proposal.id, archetypeRoleId: input.archetypeRoleId },
      });
      if (existing) {
        return ctx.prisma.squadAssignment.update({
          where: { id: existing.id },
          data: {
            personId: input.personId,
            fteAllocated: input.fteAllocated,
            fitScoreId: input.fitScoreId,
            rationale: input.rationale,
            overrideReason: input.overrideReason,
          },
        });
      }

      return ctx.prisma.squadAssignment.create({
        data: {
          proposalId: proposal.id,
          archetypeRoleId: input.archetypeRoleId,
          personId: input.personId,
          fteAllocated: input.fteAllocated,
          fitScoreId: input.fitScoreId,
          rationale: input.rationale,
          overrideReason: input.overrideReason,
        },
      });
    }),

  confirmProposal: protectedProcedure
    .input(z.object({ proposalId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.squadProposal.findFirst({
        where: { id: input.proposalId, engagement: { orgId: ctx.orgId } },
        include: {
          assignments: { include: { fitScore: true } },
          engagement: true,
        },
      });
      if (!proposal) throw new TRPCError({ code: 'NOT_FOUND' });
      if (proposal.status !== 'draft') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Only draft proposals can be confirmed.' });
      }

      for (const a of proposal.assignments) {
        const band = a.fitScore?.band;
        if ((band === 'stretch' || band === 'gap') && !a.overrideReason?.trim()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Every stretch or gap assignment needs an override reason before confirm.',
          });
        }
      }

      await ctx.prisma.squadProposal.updateMany({
        where: {
          engagementId: proposal.engagementId,
          archetypeId: proposal.archetypeId,
          status: 'confirmed',
          id: { not: proposal.id },
        },
        data: { status: 'superseded' },
      });

      // Record confirmed FTE into Organise availability (Keel depth) for each assignment.
      for (const a of proposal.assignments) {
        const person = await ctx.prisma.person.findFirst({
          where: { id: a.personId, engagementId: proposal.engagementId },
          include: { availability: true },
        });
        if (!person) continue;
        const daysPerWeek = Math.min(5, Math.max(0.5, a.fteAllocated * 5));
        if (person.availability[0]) {
          await ctx.prisma.personAvailability.update({
            where: { id: person.availability[0].id },
            data: { daysPerWeek },
          });
        } else {
          await ctx.prisma.personAvailability.create({
            data: { personId: person.id, daysPerWeek },
          });
        }
      }

      return ctx.prisma.squadProposal.update({
        where: { id: proposal.id },
        data: {
          status: 'confirmed',
          confirmedByUserId: ctx.userId,
          confirmedAt: new Date(),
        },
        include: { assignments: true },
      });
    }),

  listGaps: protectedProcedure
    .input(z.object({ engagementId: z.string(), archetypeId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      let roleIds: string[] | undefined;
      if (input.archetypeId) {
        const roles = await ctx.prisma.archetypeRole.findMany({
          where: { archetypeId: input.archetypeId },
          select: { id: true },
        });
        roleIds = roles.map((r) => r.id);
      }
      return ctx.prisma.capabilityGap.findMany({
        where: {
          engagementId: input.engagementId,
          ...(roleIds ? { archetypeRoleId: { in: roleIds } } : {}),
        },
        include: { archetypeRole: true },
        orderBy: { severity: 'desc' },
      });
    }),
});
