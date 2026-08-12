import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma, type PrismaClient } from '@prisma/client';
import { protectedProcedure, publicProcedure, router, assertEngagementInOrg } from '@/lib/trpc/trpc';
import {
  designAssignmentInputSchema,
  designBindingSchema,
  designEntityInputSchema,
  designEntityUpdateSchema,
  designPersonInputSchema,
  designPersonUpdateSchema,
  designRelationshipInputSchema,
} from '@/lib/org-design/types';
import { ORG_TEMPLATES } from '@/lib/org-design/templates';
import {
  applyAiPatch,
  applyTemplateToLive,
  getEntityDetail,
  getLiveGraph,
  logActivity,
  newShareToken,
  parseScenarioData,
  replaceLiveOrg,
  toGraphEntity,
} from '@/lib/org-design/storage';
import {
  applySuggestedDdatMappings,
  forkScenarioForEngagement,
  getGraphForContext,
  getStructureReadinessHints,
  resolveEngagementGraph,
  suggestDdatMappings,
  syncStructureToTeam,
} from '@/lib/org-design/bridge';
import {
  aiAvailable,
  chatWithOrg,
  findOverlaps,
  generateOrgFromPrompt,
  refinePurpose,
  suggestAccountabilities,
} from '@/lib/org-design/ai';
import { getCachedInsights, refreshInsightsOnWrite } from '@/lib/org-design/insights-cache';
import { computeInsights } from '@/lib/org-design/insights';

const AI_MAX_PROMPT_CHARS = 32_000;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function afterGraphWrite(prisma: PrismaClient, orgId: string) {
  void refreshInsightsOnWrite(prisma, orgId).catch(() => {
    /* non-blocking */
  });
}

export const orgDesignRouter = router({
  graph: protectedProcedure
    .input(
      z
        .object({
          scenarioId: z.string().optional(),
          snapshotId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return getGraphForContext(ctx.prisma, ctx.orgId, {
        scenarioId: input?.scenarioId,
        snapshotId: input?.snapshotId,
      });
    }),

  insights: protectedProcedure
    .input(
      z
        .object({
          scenarioId: z.string().optional(),
          snapshotId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const graph = await getGraphForContext(ctx.prisma, ctx.orgId, {
        scenarioId: input?.scenarioId,
        snapshotId: input?.snapshotId,
      });
      // Live org graph uses durable cache; scenario/snapshot views compute without polluting cache.
      if (input?.scenarioId || input?.snapshotId) {
        return {
          insights: computeInsights({
            entities: graph.entities,
            relationships: graph.relationships,
            people: graph.people ?? [],
            assignments: graph.assignments ?? [],
          }),
          computedAt: new Date(),
          cached: false,
        };
      }
      return getCachedInsights(ctx.prisma, ctx.orgId, graph);
    }),

  entityDetail: protectedProcedure
    .input(z.object({ entityId: z.string() }))
    .query(async ({ ctx, input }) => {
      const entity = await getEntityDetail(ctx.prisma, ctx.orgId, input.entityId);
      if (!entity) throw new TRPCError({ code: 'NOT_FOUND' });
      return entity;
    }),

  createEntity: protectedProcedure
    .input(designEntityInputSchema)
    .mutation(async ({ ctx, input }) => {
      const entity = await ctx.prisma.designEntity.create({
        data: {
          orgId: ctx.orgId,
          name: input.name,
          type: input.type,
          purpose: input.purpose ?? null,
          domain: input.domain ?? null,
          accountabilities: input.accountabilities ?? [],
          policies: input.policies ?? [],
          parentId: input.parentId ?? null,
          ddatRoleId: input.ddatRoleId ?? null,
          ddatRoleLevelId: input.ddatRoleLevelId ?? null,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
      await logActivity(ctx.prisma, ctx.orgId, 'entity.create', entity.name);
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return toGraphEntity(entity);
    }),

  updateEntity: protectedProcedure
    .input(z.object({ id: z.string(), data: designEntityUpdateSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.designEntity.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      const entity = await ctx.prisma.designEntity.update({
        where: { id: input.id },
        data: {
          ...(input.data.name !== undefined ? { name: input.data.name } : {}),
          ...(input.data.type !== undefined ? { type: input.data.type } : {}),
          ...(input.data.purpose !== undefined ? { purpose: input.data.purpose } : {}),
          ...(input.data.domain !== undefined ? { domain: input.data.domain } : {}),
          ...(input.data.accountabilities !== undefined
            ? { accountabilities: input.data.accountabilities }
            : {}),
          ...(input.data.policies !== undefined ? { policies: input.data.policies } : {}),
          ...(input.data.parentId !== undefined ? { parentId: input.data.parentId } : {}),
          ...(input.data.ddatRoleId !== undefined ? { ddatRoleId: input.data.ddatRoleId } : {}),
          ...(input.data.ddatRoleLevelId !== undefined
            ? { ddatRoleLevelId: input.data.ddatRoleLevelId }
            : {}),
          ...(input.data.metadata !== undefined
            ? { metadata: input.data.metadata as Prisma.InputJsonValue }
            : {}),
        },
      });
      await logActivity(ctx.prisma, ctx.orgId, 'entity.update', entity.name);
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return toGraphEntity(entity);
    }),

  deleteEntity: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.designEntity.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.designRelationship.deleteMany({
        where: {
          orgId: ctx.orgId,
          OR: [{ sourceId: input.id }, { targetId: input.id }],
        },
      });
      await ctx.prisma.designAssignment.deleteMany({
        where: { orgId: ctx.orgId, entityId: input.id },
      });
      await ctx.prisma.designComment.deleteMany({
        where: { orgId: ctx.orgId, entityId: input.id },
      });
      await ctx.prisma.designEntity.delete({ where: { id: input.id } });
      await logActivity(ctx.prisma, ctx.orgId, 'entity.delete', existing.name);
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return { ok: true };
    }),

  createRelationship: protectedProcedure
    .input(designRelationshipInputSchema)
    .mutation(async ({ ctx, input }) => {
      const rel = await ctx.prisma.designRelationship.create({
        data: {
          orgId: ctx.orgId,
          sourceId: input.sourceId,
          targetId: input.targetId,
          type: input.type,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
      await logActivity(ctx.prisma, ctx.orgId, 'relationship.create', input.type);
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return rel;
    }),

  deleteRelationship: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.designRelationship.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.designRelationship.delete({ where: { id: input.id } });
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return { ok: true };
    }),

  createPerson: protectedProcedure
    .input(designPersonInputSchema)
    .mutation(async ({ ctx, input }) => {
      const person = await ctx.prisma.designPerson.create({
        data: {
          orgId: ctx.orgId,
          name: input.name,
          email: input.email ?? null,
          fte: input.fte ?? 100,
          skills: input.skills ?? [],
          notes: input.notes ?? null,
        },
      });
      await logActivity(ctx.prisma, ctx.orgId, 'person.create', person.name);
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return {
        ...person,
        skills: asStringArray(person.skills),
      };
    }),

  updatePerson: protectedProcedure
    .input(z.object({ id: z.string(), data: designPersonUpdateSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.designPerson.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      const person = await ctx.prisma.designPerson.update({
        where: { id: input.id },
        data: {
          ...(input.data.name !== undefined ? { name: input.data.name } : {}),
          ...(input.data.email !== undefined ? { email: input.data.email } : {}),
          ...(input.data.fte !== undefined ? { fte: input.data.fte } : {}),
          ...(input.data.skills !== undefined ? { skills: input.data.skills } : {}),
          ...(input.data.notes !== undefined ? { notes: input.data.notes } : {}),
        },
      });
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return { ...person, skills: asStringArray(person.skills) };
    }),

  deletePerson: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.designPerson.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.designAssignment.deleteMany({
        where: { orgId: ctx.orgId, personId: input.id },
      });
      await ctx.prisma.designPerson.delete({ where: { id: input.id } });
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return { ok: true };
    }),

  createAssignment: protectedProcedure
    .input(designAssignmentInputSchema)
    .mutation(async ({ ctx, input }) => {
      const assignment = await ctx.prisma.designAssignment.create({
        data: {
          orgId: ctx.orgId,
          personId: input.personId,
          entityId: input.entityId,
          allocation: input.allocation ?? 100,
        },
      });
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return assignment;
    }),

  updateAssignment: protectedProcedure
    .input(z.object({ id: z.string(), allocation: z.number().int().min(0).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.designAssignment.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      const updated = await ctx.prisma.designAssignment.update({
        where: { id: input.id },
        data: { allocation: input.allocation },
      });
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return updated;
    }),

  deleteAssignment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.designAssignment.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.designAssignment.delete({ where: { id: input.id } });
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return { ok: true };
    }),

  listComments: protectedProcedure
    .input(z.object({ entityId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.designComment.findMany({
        where: { orgId: ctx.orgId, entityId: input.entityId },
        orderBy: { createdAt: 'asc' },
      });
    }),

  createComment: protectedProcedure
    .input(z.object({ entityId: z.string(), content: z.string().min(1), author: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.designComment.create({
        data: {
          orgId: ctx.orgId,
          entityId: input.entityId,
          content: input.content,
          author: input.author || ctx.session?.user?.name || 'User',
        },
      });
    }),

  deleteComment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.designComment.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.designComment.delete({ where: { id: input.id } });
      return { ok: true };
    }),

  listActivity: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.designActivity.findMany({
        where: { orgId: ctx.orgId },
        orderBy: { createdAt: 'desc' },
        take: input?.limit ?? 30,
      });
    }),

  listSnapshots: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.designSnapshot.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true, createdAt: true },
    });
  }),

  createSnapshot: protectedProcedure
    .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const graph = await getLiveGraph(ctx.prisma, ctx.orgId);
      const snap = await ctx.prisma.designSnapshot.create({
        data: {
          orgId: ctx.orgId,
          name: input.name,
          description: input.description,
          data: graph as unknown as Prisma.InputJsonValue,
        },
      });
      await logActivity(ctx.prisma, ctx.orgId, 'snapshot.create', snap.name);
      return snap;
    }),

  restoreSnapshot: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const snap = await ctx.prisma.designSnapshot.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!snap) throw new TRPCError({ code: 'NOT_FOUND' });
      const graph = parseScenarioData(snap.data);
      await replaceLiveOrg(ctx.prisma, ctx.orgId, {
        entities: graph.entities,
        relationships: graph.relationships,
      });
      await logActivity(ctx.prisma, ctx.orgId, 'snapshot.restore', snap.name);
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return { ok: true };
    }),

  deleteSnapshot: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const snap = await ctx.prisma.designSnapshot.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!snap) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.designSnapshot.delete({ where: { id: input.id } });
      return { ok: true };
    }),

  listScenarios: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.designScenario.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        engagementId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),

  createScenario: protectedProcedure
    .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const live = await getLiveGraph(ctx.prisma, ctx.orgId);
      const scenario = await ctx.prisma.designScenario.create({
        data: {
          orgId: ctx.orgId,
          name: input.name,
          description: input.description,
          data: {
            entities: live.entities,
            relationships: live.relationships,
          } as unknown as Prisma.InputJsonValue,
        },
      });
      await logActivity(ctx.prisma, ctx.orgId, 'scenario.create', scenario.name);
      return scenario;
    }),

  updateScenario: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().nullable().optional(),
        data: z
          .object({
            entities: z.array(z.any()),
            relationships: z.array(z.any()),
            people: z.array(z.any()).optional(),
            assignments: z.array(z.any()).optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.designScenario.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.prisma.designScenario.update({
        where: { id: input.id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.data !== undefined
            ? { data: input.data as unknown as Prisma.InputJsonValue }
            : {}),
        },
      });
    }),

  deleteScenario: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.designScenario.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.designScenario.delete({ where: { id: input.id } });
      return { ok: true };
    }),

  scenarioDiff: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const scenario = await ctx.prisma.designScenario.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!scenario) throw new TRPCError({ code: 'NOT_FOUND' });
      const live = await getLiveGraph(ctx.prisma, ctx.orgId);
      const branch = parseScenarioData(scenario.data);
      const liveNames = new Set(live.entities.map((e) => e.name.toLowerCase()));
      const branchNames = new Set(branch.entities.map((e) => e.name.toLowerCase()));
      return {
        added: branch.entities.filter((e) => !liveNames.has(e.name.toLowerCase())),
        removed: live.entities.filter((e) => !branchNames.has(e.name.toLowerCase())),
        liveCount: live.entities.length,
        scenarioCount: branch.entities.length,
      };
    }),

  promoteScenario: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const scenario = await ctx.prisma.designScenario.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!scenario) throw new TRPCError({ code: 'NOT_FOUND' });
      const graph = parseScenarioData(scenario.data);
      await replaceLiveOrg(ctx.prisma, ctx.orgId, {
        entities: graph.entities,
        relationships: graph.relationships,
      });
      await logActivity(ctx.prisma, ctx.orgId, 'scenario.promote', scenario.name);
      return { ok: true };
    }),

  listTemplates: protectedProcedure.query(() => {
    return ORG_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      size: t.size,
      entityCount: t.entities.length,
      relationshipCount: t.relationships.length,
    }));
  }),

  applyTemplate: protectedProcedure
    .input(z.object({ templateId: z.string(), replace: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const template = ORG_TEMPLATES.find((t) => t.id === input.templateId);
      if (!template) throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' });
      const result = await applyTemplateToLive(ctx.prisma, ctx.orgId, template, {
        replace: input.replace ?? false,
      });
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return result;
    }),

  exportJson: protectedProcedure.query(async ({ ctx }) => {
    return getLiveGraph(ctx.prisma, ctx.orgId, { mode: 'detail' });
  }),

  importJson: protectedProcedure
    .input(
      z.object({
        entities: z.array(z.any()),
        relationships: z.array(z.any()),
        people: z.array(z.any()).optional(),
        assignments: z.array(z.any()).optional(),
        replace: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.replace) {
        await replaceLiveOrg(ctx.prisma, ctx.orgId, {
          entities: input.entities.map((e) =>
            toGraphEntity(e as Parameters<typeof toGraphEntity>[0]),
          ),
          relationships: input.relationships,
        });
      } else {
        for (const e of input.entities) {
          await ctx.prisma.designEntity.create({
            data: {
              orgId: ctx.orgId,
              name: e.name,
              type: e.type,
              purpose: e.purpose ?? null,
              domain: e.domain ?? null,
              accountabilities: e.accountabilities ?? [],
              policies: e.policies ?? [],
              parentId: null,
              ddatRoleId: e.ddatRoleId ?? null,
              ddatRoleLevelId: e.ddatRoleLevelId ?? null,
            },
          });
        }
      }
      await logActivity(ctx.prisma, ctx.orgId, 'import.json');
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return { ok: true };
    }),

  listShareLinks: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.designShareLink.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: 'desc' },
    });
  }),

  createShareLink: protectedProcedure
    .input(z.object({ name: z.string().optional(), snapshotId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.designShareLink.create({
        data: {
          orgId: ctx.orgId,
          token: newShareToken(),
          name: input.name,
          snapshotId: input.snapshotId,
        },
      });
    }),

  deleteShareLink: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.designShareLink.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.designShareLink.delete({ where: { id: input.id } });
      return { ok: true };
    }),

  publicByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.prisma.designShareLink.findFirst({
        where: { token: input.token },
      });
      if (!link) throw new TRPCError({ code: 'NOT_FOUND' });
      if (link.snapshotId) {
        const snap = await ctx.prisma.designSnapshot.findFirst({
          where: { id: link.snapshotId, orgId: link.orgId },
        });
        if (!snap) throw new TRPCError({ code: 'NOT_FOUND' });
        return { name: link.name, graph: parseScenarioData(snap.data), readOnly: true };
      }
      const graph = await getLiveGraph(ctx.prisma, link.orgId);
      return { name: link.name, graph, readOnly: true };
    }),

  // Bridge
  bindEngagementStructure: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        designBinding: designBindingSchema,
        designScenarioId: z.string().nullable().optional(),
        designSnapshotId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: {
          designBinding: input.designBinding,
          designScenarioId: input.designScenarioId ?? null,
          designSnapshotId: input.designSnapshotId ?? null,
        },
      });
    }),

  forkScenarioForEngagement: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const engagement = await assertEngagementInOrg(ctx, input.engagementId);
      return forkScenarioForEngagement(
        ctx.prisma,
        ctx.orgId,
        engagement.id,
        engagement.name,
      );
    }),

  syncStructureToTeam: protectedProcedure
    .input(z.object({ engagementId: z.string(), requirementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const req = await ctx.prisma.requirement.findFirst({
        where: { id: input.requirementId, engagementId: input.engagementId },
      });
      if (!req) throw new TRPCError({ code: 'NOT_FOUND' });
      return syncStructureToTeam(
        ctx.prisma,
        ctx.orgId,
        input.engagementId,
        input.requirementId,
      );
    }),

  suggestDdatMappings: protectedProcedure.query(async ({ ctx }) => {
    return suggestDdatMappings(ctx.prisma, ctx.orgId);
  }),

  applyDdatMappings: protectedProcedure.mutation(async ({ ctx }) => {
    return applySuggestedDdatMappings(ctx.prisma, ctx.orgId);
  }),

  structureReadinessHints: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      return getStructureReadinessHints(ctx.prisma, ctx.orgId, input.engagementId);
    }),

  engagementStructure: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .query(async ({ ctx, input }) => {
      const engagement = await assertEngagementInOrg(ctx, input.engagementId);
      const graph = await resolveEngagementGraph(ctx.prisma, ctx.orgId, engagement);
      return {
        binding: engagement.designBinding,
        designScenarioId: engagement.designScenarioId,
        designSnapshotId: engagement.designSnapshotId,
        designSyncedAt: engagement.designSyncedAt,
        graph,
      };
    }),

  // AI
  aiStatus: protectedProcedure.query(() => ({ available: aiAvailable })),

  aiChat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
        history: z
          .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
          .optional(),
        scenarioId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!aiAvailable) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'AI not configured' });
      if (input.message.length > AI_MAX_PROMPT_CHARS) {
        throw new TRPCError({ code: 'PAYLOAD_TOO_LARGE', message: 'Prompt too large' });
      }
      const graph = await getGraphForContext(ctx.prisma, ctx.orgId, {
        scenarioId: input.scenarioId,
      });
      return chatWithOrg({
        message: input.message,
        history: input.history ?? [],
        context: graph,
      });
    }),

  aiGenerate: protectedProcedure
    .input(z.object({ prompt: z.string().min(1), apply: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!aiAvailable) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'AI not configured' });
      const patch = await generateOrgFromPrompt(input.prompt);
      if (input.apply) {
        const result = await applyAiPatch(ctx.prisma, ctx.orgId, patch);
        afterGraphWrite(ctx.prisma, ctx.orgId);
        return { patch, result };
      }
      return { patch, result: null };
    }),

  aiApplyPatch: protectedProcedure
    .input(z.object({ patch: z.any() }))
    .mutation(async ({ ctx, input }) => {
      const result = await applyAiPatch(ctx.prisma, ctx.orgId, input.patch);
      afterGraphWrite(ctx.prisma, ctx.orgId);
      return result;
    }),

  aiSuggestAccountabilities: protectedProcedure
    .input(
      z.object({
        entityName: z.string(),
        entityType: z.string(),
        purpose: z.string().nullable().optional(),
        domain: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!aiAvailable) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'AI not configured' });
      return suggestAccountabilities(input);
    }),

  aiRefinePurpose: protectedProcedure
    .input(
      z.object({
        entityName: z.string(),
        entityType: z.string(),
        purpose: z.string().nullable().optional(),
        domain: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!aiAvailable) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'AI not configured' });
      return { purpose: await refinePurpose(input) };
    }),

  aiFindOverlaps: protectedProcedure
    .input(z.object({ entityId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!aiAvailable) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'AI not configured' });
      const graph = await getLiveGraph(ctx.prisma, ctx.orgId);
      const entity = graph.entities.find((e) => e.id === input.entityId);
      if (!entity) throw new TRPCError({ code: 'NOT_FOUND' });
      return findOverlaps({
        entity: {
          id: entity.id,
          name: entity.name,
          accountabilities: entity.accountabilities,
        },
        others: graph.entities
          .filter((e) => e.id !== entity.id)
          .map((e) => ({
            id: e.id,
            name: e.name,
            accountabilities: e.accountabilities,
          })),
      });
    }),
});
