import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { attentionFor, attentionRows, displayStatus, type SpineFacts } from '@/lib/attention/facts';
import { lifecycleIndex, lifecycleStageForPhase, LIFECYCLE_STAGES } from '@/lib/attention/lifecycle';
import {
  COMMERCIAL_MODELS,
  MARKET_SECTORS,
  MILESTONE_STATUSES,
  RAID_TYPES,
  SQUAD_SHAPES,
  STEERING_FREQUENCIES,
} from '@/lib/handbook/choices';
import {
  bindPrimaryStandardVersion,
  currentVersionIdForCode,
  legacyStandardToCatalogCode,
  nextEngagementReference,
} from '@/lib/standards/catalog';
import { assertEngagementInOrg, protectedProcedure, router } from '@/lib/trpc/trpc';
import type { Prisma, PrismaClient } from '@prisma/client';

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const spineInclude = {
  owner: { select: { name: true, email: true } },
  milestones: true,
  checklistItems: { orderBy: { sortOrder: 'asc' as const } },
  raidItems: { orderBy: { createdAt: 'desc' as const } },
  changeRequests: { orderBy: { createdAt: 'desc' as const } },
  decisionRecords: { orderBy: { decidedOn: 'desc' as const } },
  measures: { orderBy: { period: 'asc' as const }, take: 12 },
} satisfies Prisma.EngagementInclude;

type SpineRecord = Prisma.EngagementGetPayload<{ include: typeof spineInclude }>;

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function isoDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

async function loadConfig(prisma: PrismaClient) {
  const rows = await prisma.handbookConfig.findMany();
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const hours = Number(map['riskLock.hours']);
  const minDays = Number(map['productOwner.minDays']);
  return {
    hours: Number.isFinite(hours) && hours > 0 ? hours : 48,
    productOwnerMinDays: Number.isFinite(minDays) ? minDays : 2,
    targets: {
      predictability: map['compass.predictability.target'] ?? '80',
      quality: map['compass.quality.target'] ?? '1',
      health: map['compass.health.target'] ?? '4',
      satisfaction: map['compass.satisfaction.target'] ?? '4',
    },
  };
}


type Targets = { predictability: string; quality: string; health: string; satisfaction: string };
type MeasureKey = 'predictability' | 'quality' | 'health' | 'satisfaction';

/** Latest reading and trend for each Compass measure, judged against the configured target. */
function measureSummary(engagement: SpineRecord, targets: Targets) {
  const rows = engagement.measures;
  const pick = (key: MeasureKey) =>
    rows
      .map((row) =>
        key === 'predictability'
          ? row.predictability
          : key === 'quality'
            ? row.quality
            : key === 'health'
              ? row.teamHealth
              : row.clientSatisfaction,
      )
      .filter((value): value is number => value != null);
  const judge = (key: MeasureKey) => {
    const trend = pick(key);
    const latest = trend.length ? trend[trend.length - 1] : null;
    const target = Number(targets[key]);
    const onTarget =
      latest == null || !Number.isFinite(target) ? null : key === 'quality' ? latest <= target : latest >= target;
    return { latest, trend, onTarget };
  };
  return {
    predictability: judge('predictability'),
    quality: judge('quality'),
    health: judge('health'),
    satisfaction: judge('satisfaction'),
  };
}

function belowTarget(summary: ReturnType<typeof measureSummary>): number {
  return Object.values(summary).filter((item) => item.onTarget === false).length;
}

function toFacts(engagement: SpineRecord, now: Date, below = 0): SpineFacts {
  const sprint = engagement.checklistItems.filter((item) => item.stage === 'sprint-zero');
  const overdue = sprint
    .filter((item) => !item.done && item.dueOn && item.dueOn.getTime() < now.getTime())
    .sort((a, b) => a.dueOn!.getTime() - b.dueOn!.getTime())[0];
  const dated = engagement.milestones
    .filter((item) => item.dueOn)
    .sort((a, b) => a.dueOn!.getTime() - b.dueOn!.getTime());
  const nextMilestone = dated.find((item) => item.dueOn!.getTime() >= now.getTime()) ?? dated[0];
  const submitted = engagement.changeRequests
    .filter((item) => item.status === 'submitted')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
  const triaged = engagement.changeRequests
    .filter((item) => item.status === 'triaged')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
  const confirmed =
    engagement.deliveryStatus === 'on-track' ||
    engagement.deliveryStatus === 'at-risk' ||
    engagement.deliveryStatus === 'off-track'
      ? engagement.deliveryStatus
      : null;
  return {
    confirmedStatus: confirmed,
    riskLockAt: engagement.riskLockAt,
    hasRecoveryPlan: Boolean(engagement.recoveryPlan),
    steeringOn: engagement.steeringOn,
    packReady: engagement.steeringPackReady,
    unconfirmedDecisions: engagement.decisionRecords.filter((item) => !item.confirmedAt).length,
    stage: lifecycleStageForPhase(engagement.phase),
    sprintZeroOpen: sprint.filter((item) => !item.done).length,
    sprintZeroBy: null,
    submittedChange: submitted ? { ref: submitted.ref, at: submitted.createdAt } : null,
    triagedChange: triaged ? { ref: triaged.ref, at: triaged.createdAt } : null,
    exceptionPerson: null,
    goLiveOn: engagement.goLiveOn,
    hasAftercare: engagement.hasAftercare,
    reportDueOn: engagement.reportDueOn,
    surveyDue: engagement.surveyDue === 'health' || engagement.surveyDue === 'pulse' ? engagement.surveyDue : null,
    charterReviewOn: engagement.charterReviewOn,
    milestoneName: nextMilestone?.name ?? null,
    milestoneOn: nextMilestone?.dueOn ?? null,
    milestoneWillBeMissed: engagement.milestones.some((item) => item.status === 'late'),
    measuresBelowTarget: below,
    overdueSprintItem: overdue?.itemKey ?? null,
  };
}

function present(engagement: SpineRecord, now: Date, hours: number, targets: Targets) {
  const measures = measureSummary(engagement, targets);
  const facts = toFacts(engagement, now, belowTarget(measures));
  return {
    id: engagement.id,
    name: engagement.name,
    client: engagement.clientOrg,
    sector: engagement.marketSector,
    squadLead: engagement.owner?.name || engagement.owner?.email || null,
    stage: facts.stage,
    status: displayStatus(facts),
    attention: attentionFor(facts, now, hours),
    rows: attentionRows(facts, now, hours),
    milestone: facts.milestoneName,
    milestoneOn: facts.milestoneOn ? isoDate(facts.milestoneOn) : null,
    measures,
  };
}

async function loadOne(prisma: PrismaClient, orgId: string, id: string) {
  const engagement = await prisma.engagement.findFirst({
    where: { id, orgId },
    include: spineInclude,
  });
  if (!engagement) throw new TRPCError({ code: 'NOT_FOUND' });
  return engagement;
}

export const spineRouter = router({
  board: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const config = await loadConfig(ctx.prisma);
    const engagements = await ctx.prisma.engagement.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { updatedAt: 'desc' },
      include: spineInclude,
    });
    return {
      targets: config.targets,
      engagements: engagements.map((engagement) => present(engagement, now, config.hours, config.targets)),
    };
  }),

  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const now = new Date();
    const config = await loadConfig(ctx.prisma);
    const engagement = await loadOne(ctx.prisma, ctx.orgId, input.id);
    const card = present(engagement, now, config.hours, config.targets);
    return {
      ...card,
      targets: config.targets,
      outcomes: engagement.outcomes,
      squadShape: engagement.squadShape,
      commercialModel: engagement.commercialModel,
      scopeClear: engagement.scopeClear,
      startsOn: isoDate(engagement.startsOn),
      endsOn: isoDate(engagement.endsOn),
      steeringChair: engagement.steeringChair,
      steeringFrequency: engagement.steeringFrequency,
      steeringOn: isoDate(engagement.steeringOn),
      steeringPackReady: engagement.steeringPackReady,
      clientProductOwner: engagement.clientProductOwner,
      productOwnerDays: engagement.productOwnerDays,
      accountManagerName: engagement.accountManagerName,
      changeThresholdGbp: engagement.changeThresholdGbp,
      deliveryStatusNote: engagement.deliveryStatusNote,
      recoveryPlan: engagement.recoveryPlan,
      goLiveOn: isoDate(engagement.goLiveOn),
      hasAftercare: engagement.hasAftercare,
      reportDueOn: isoDate(engagement.reportDueOn),
      surveyDue: engagement.surveyDue,
      surveySentOn: isoDate(engagement.surveySentOn),
      charterReviewOn: isoDate(engagement.charterReviewOn),
      charterAgreedOn: isoDate(engagement.charterAgreedOn),
      monthlyReportDraft: engagement.monthlyReportDraft,
      monthlyReportSubmittedAt: engagement.monthlyReportSubmittedAt?.toISOString() ?? null,
      leadNotifiedAt: isoDate(engagement.leadNotifiedAt),
      checklist: engagement.checklistItems.map((item) => ({
        id: item.id,
        stage: item.stage,
        itemKey: item.itemKey,
        title: item.title,
        done: item.done,
        ownerName: item.ownerName,
        dueOn: isoDate(item.dueOn),
      })),
      milestones: engagement.milestones.map((item) => ({
        id: item.id,
        name: item.name,
        dueOn: isoDate(item.dueOn),
        proves: item.proves,
        paymentLinked: item.paymentLinked,
        status: item.status,
      })),
      raid: engagement.raidItems.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        ownerName: item.ownerName,
        action: item.action,
        dueOn: isoDate(item.dueOn),
        status: item.status,
      })),
      changes: engagement.changeRequests.map((item) => ({
        id: item.id,
        ref: item.ref,
        description: item.description,
        status: item.status,
      })),
      decisions: engagement.decisionRecords.map((item) => ({
        id: item.id,
        forum: item.forum,
        decision: item.decision,
        ownerName: item.ownerName,
        decidedOn: isoDate(item.decidedOn),
        confirmed: Boolean(item.confirmedAt),
      })),
    };
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        clientOrg: z.string().min(1),
        marketSector: z.enum(MARKET_SECTORS),
        startsOn: dateField.optional(),
        endsOn: dateField.optional(),
        outcomes: z.string().optional(),
        commercialModel: z.enum(COMMERCIAL_MODELS),
        scopeClear: z.boolean(),
        milestones: z
          .array(z.object({ name: z.string().min(1), dueOn: dateField.optional(), proves: z.string().optional() }))
          .default([]),
        squadShape: z.enum(SQUAD_SHAPES),
        steeringChair: z.string().optional(),
        steeringFrequency: z.enum(STEERING_FREQUENCIES).optional(),
        clientProductOwner: z.string().optional(),
        productOwnerDays: z.number().min(0).max(5).optional(),
        accountManagerName: z.string().optional(),
        changeThresholdGbp: z.number().int().nonnegative().optional(),
        standardId: z.enum(['gds', 'wales']).default('gds'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = await loadConfig(ctx.prisma);
      const reference = await nextEngagementReference(ctx.prisma, ctx.orgId, input.clientOrg, input.name);
      const versionId = await currentVersionIdForCode(
        ctx.prisma,
        legacyStandardToCatalogCode(input.standardId),
      );
      const handbook = await ctx.prisma.handbookChecklistItem.findMany({
        where: { stage: 'sprint-zero' },
        orderBy: { sortOrder: 'asc' },
      });

      const engagement = await ctx.prisma.engagement.create({
        data: {
          name: input.name.trim(),
          reference,
          standardId: input.standardId,
          clientOrg: input.clientOrg.trim(),
          sector: 'digital-service',
          marketSector: input.marketSector,
          serviceName: input.name.trim(),
          serviceDescription: input.outcomes,
          outcomes: input.outcomes,
          phase: 'sprint-zero',
          mode: 'mobilise',
          ownerId: ctx.userId,
          orgId: ctx.orgId,
          startsOn: input.startsOn ? parseDate(input.startsOn) : null,
          endsOn: input.endsOn ? parseDate(input.endsOn) : null,
          commercialModel: input.commercialModel,
          scopeClear: input.scopeClear,
          squadShape: input.squadShape,
          steeringChair: input.steeringChair,
          steeringFrequency: input.steeringFrequency,
          clientProductOwner: input.clientProductOwner,
          productOwnerDays: input.productOwnerDays,
          accountManagerName: input.accountManagerName,
          changeThresholdGbp: input.changeThresholdGbp,
          requirements: {
            create: {
              title: 'Initial requirement',
              phase: 'discovery',
              outcome: input.outcomes ?? '',
              channels: ['web'],
              sensitivity: 'official',
            },
          },
          milestones: {
            create: input.milestones.map((item) => ({
              name: item.name.trim(),
              dueOn: item.dueOn ? parseDate(item.dueOn) : null,
              proves: item.proves,
              paymentLinked: true,
            })),
          },
          checklistItems: {
            create: handbook.map((item) => ({
              stage: item.stage,
              itemKey: item.itemKey,
              title: item.title,
              sortOrder: item.sortOrder,
            })),
          },
          raidItems:
            input.productOwnerDays != null && input.productOwnerDays < config.productOwnerMinDays
              ? {
                  create: {
                    type: 'risk',
                    title: 'po-days',
                    ownerName: input.accountManagerName,
                    status: 'open',
                  },
                }
              : undefined,
        },
      });

      if (versionId) {
        await bindPrimaryStandardVersion(ctx.prisma, engagement.id, versionId);
      }
      return { id: engagement.id };
    }),

  setChecklist: protectedProcedure
    .input(z.object({ engagementId: z.string(), itemId: z.string(), done: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const item = await ctx.prisma.engagementChecklistItem.findFirst({
        where: { id: input.itemId, engagementId: input.engagementId },
      });
      if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.engagementChecklistItem.update({
        where: { id: item.id },
        data: input.done
          ? { done: true, doneAt: new Date(), doneByUserId: ctx.userId }
          : { done: false, doneAt: null, doneByUserId: null },
      });
      return { ok: true };
    }),

  moveStage: protectedProcedure
    .input(z.object({ engagementId: z.string(), anyway: z.boolean().default(false) }))
    .mutation(async ({ ctx, input }) => {
      const engagement = await loadOne(ctx.prisma, ctx.orgId, input.engagementId);
      const stage = lifecycleStageForPhase(engagement.phase);
      if (!stage) throw new TRPCError({ code: 'BAD_REQUEST' });
      const next = LIFECYCLE_STAGES[lifecycleIndex(stage) + 1];
      if (!next) throw new TRPCError({ code: 'BAD_REQUEST' });
      const open = engagement.checklistItems.filter((item) => item.stage === stage && !item.done);
      if (open.length > 0 && !input.anyway) {
        return { ok: false as const, open: open.length };
      }
      if (input.anyway) {
        await ctx.prisma.raidItem.createMany({
          data: open.map((item) => ({
            engagementId: engagement.id,
            type: 'risk',
            title: `check:${item.itemKey}`,
            status: 'open',
          })),
        });
      }
      await ctx.prisma.engagement.update({
        where: { id: engagement.id },
        data: { phase: next },
      });
      if (next === 'discovery' || next === 'alpha' || next === 'beta' || next === 'live') {
        await ctx.prisma.requirement.updateMany({
          where: { engagementId: engagement.id },
          data: { phase: next },
        });
      }
      return { ok: true as const, stage: next };
    }),

  addMilestone: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        name: z.string().min(1),
        dueOn: dateField.optional(),
        proves: z.string().optional(),
        paymentLinked: z.boolean().default(false),
        status: z.enum(MILESTONE_STATUSES).default('on-time'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagementMilestone.create({
        data: {
          engagementId: input.engagementId,
          name: input.name.trim(),
          dueOn: input.dueOn ? parseDate(input.dueOn) : null,
          proves: input.proves,
          paymentLinked: input.paymentLinked,
          status: input.status,
        },
      });
      return { ok: true };
    }),

  setMilestoneStatus: protectedProcedure
    .input(z.object({ engagementId: z.string(), milestoneId: z.string(), status: z.enum(MILESTONE_STATUSES) }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const milestone = await ctx.prisma.engagementMilestone.findFirst({
        where: { id: input.milestoneId, engagementId: input.engagementId },
      });
      if (!milestone) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.engagementMilestone.update({
        where: { id: milestone.id },
        data: { status: input.status },
      });
      return { ok: true };
    }),

  setStatus: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        status: z.enum(['on-track', 'at-risk', 'off-track']),
        note: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: {
          deliveryStatus: input.status,
          deliveryStatusNote: input.note.trim(),
          deliveryStatusById: ctx.userId,
        },
      });
      return { ok: true };
    }),

  setRecovery: protectedProcedure
    .input(z.object({ engagementId: z.string(), plan: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: { recoveryPlan: input.plan.trim() },
      });
      return { ok: true };
    }),

  bookRiskLock: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: { riskLockAt: new Date() },
      });
      return { ok: true };
    }),

  notifyLead: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: { leadNotifiedAt: new Date() },
      });
      return { ok: true };
    }),

  setSteering: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        steeringOn: dateField.optional(),
        packReady: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: {
          steeringOn: input.steeringOn ? parseDate(input.steeringOn) : null,
          steeringPackReady: input.packReady,
        },
      });
      return { ok: true };
    }),

  addRaid: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        type: z.enum(RAID_TYPES),
        title: z.string().min(1),
        ownerName: z.string().optional(),
        action: z.string().optional(),
        dueOn: dateField.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.raidItem.create({
        data: {
          engagementId: input.engagementId,
          type: input.type,
          title: input.title.trim(),
          ownerName: input.ownerName,
          action: input.action,
          dueOn: input.dueOn ? parseDate(input.dueOn) : null,
        },
      });
      return { ok: true };
    }),

  addDecision: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        forum: z.string().min(1),
        decision: z.string().min(1),
        ownerName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.decisionRecord.create({
        data: {
          engagementId: input.engagementId,
          forum: input.forum.trim(),
          decision: input.decision.trim(),
          ownerName: input.ownerName,
        },
      });
      return { ok: true };
    }),

  confirmDecision: protectedProcedure
    .input(z.object({ engagementId: z.string(), decisionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const decision = await ctx.prisma.decisionRecord.findFirst({
        where: { id: input.decisionId, engagementId: input.engagementId },
      });
      if (!decision) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.decisionRecord.update({
        where: { id: decision.id },
        data: { confirmedAt: new Date(), confirmedById: ctx.userId },
      });
      return { ok: true };
    }),

  addChange: protectedProcedure
    .input(z.object({ engagementId: z.string(), description: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const count = await ctx.prisma.changeRequest.count({ where: { engagementId: input.engagementId } });
      const ref = `CR-${String(count + 1).padStart(3, '0')}`;
      await ctx.prisma.changeRequest.create({
        data: { engagementId: input.engagementId, ref, description: input.description.trim() },
      });
      return { ref };
    }),

  setChangeStatus: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        changeId: z.string(),
        status: z.enum(['triaged', 'assessed']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const change = await ctx.prisma.changeRequest.findFirst({
        where: { id: input.changeId, engagementId: input.engagementId },
      });
      if (!change) throw new TRPCError({ code: 'NOT_FOUND' });
      await ctx.prisma.changeRequest.update({
        where: { id: change.id },
        data: { status: input.status },
      });
      return { ok: true };
    }),

  setGoLive: protectedProcedure
    .input(z.object({ engagementId: z.string(), goLiveOn: dateField }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: { goLiveOn: parseDate(input.goLiveOn) },
      });
      return { ok: true };
    }),

  setAftercare: protectedProcedure
    .input(z.object({ engagementId: z.string(), ready: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: { hasAftercare: input.ready },
      });
      return { ok: true };
    }),

  setReportDue: protectedProcedure
    .input(z.object({ engagementId: z.string(), reportDueOn: dateField }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: { reportDueOn: parseDate(input.reportDueOn) },
      });
      return { ok: true };
    }),

  saveReport: protectedProcedure
    .input(z.object({ engagementId: z.string(), draft: z.string().min(1), submit: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: {
          monthlyReportDraft: input.draft.trim(),
          monthlyReportSubmittedAt: input.submit ? new Date() : null,
        },
      });
      return { ok: true };
    }),

  sendSurvey: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: { surveyDue: null, surveySentOn: new Date() },
      });
      return { ok: true };
    }),

  markSurveyDue: protectedProcedure
    .input(z.object({ engagementId: z.string(), kind: z.enum(['health', 'pulse']) }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: { surveyDue: input.kind, surveySentOn: null },
      });
      return { ok: true };
    }),

  agreeCharter: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const agreed = new Date();
      const review = new Date(agreed);
      review.setUTCDate(review.getUTCDate() + 42);
      await ctx.prisma.engagement.update({
        where: { id: input.engagementId },
        data: { charterAgreedOn: agreed, charterReviewOn: review },
      });
      return { ok: true };
    }),
  /** Records this month's Compass readings. One row per engagement per month; later saves overwrite. */
  recordMeasures: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        predictability: z.number().min(0).max(100).optional(),
        quality: z.number().min(0).max(100).optional(),
        teamHealth: z.number().min(1).max(5).optional(),
        clientSatisfaction: z.number().min(1).max(5).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const now = new Date();
      const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const { engagementId, ...values } = input;
      await ctx.prisma.engagementMeasure.upsert({
        where: { engagementId_period: { engagementId, period } },
        create: { engagementId, period, ...values },
        update: values,
      });
      return { ok: true };
    }),
});
