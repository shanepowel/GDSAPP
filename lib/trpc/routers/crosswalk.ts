import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import type { PrismaClient } from '@prisma/client';
import { assertEngagementInOrg, protectedProcedure, router } from '@/lib/trpc/trpc';
import { buildGapList, type PackItemInput } from '@/lib/crosswalk/gap-list';
import { buildPackExport, type EvidenceCitation } from '@/lib/crosswalk/export';

const PACK_TITLES: Record<string, string> = {
  'nista-gate-0': 'NISTA Gate 0 — Strategic assessment',
  'nista-gate-1': 'NISTA Gate 1 — Business justification',
  'nista-gate-2': 'NISTA Gate 2 — Delivery strategy',
  'nista-gate-3': 'NISTA Gate 3 — Investment decision',
  'nista-gate-4': 'NISTA Gate 4 — Readiness for service',
  'nista-gate-5': 'NISTA Gate 5 — Operations review',
  'gds-alpha': 'GDS alpha assessment',
  'gds-beta': 'GDS beta assessment',
  'gds-live': 'GDS live assessment',
  'tcop-review': 'Technology Code of Practice review',
  'iso-19650': 'ISO 19650 information requirements',
  'riba-stages': 'RIBA Plan of Work stages',
  'construction-playbook': 'Construction Playbook checkpoints',
  cgs: 'Constructing the Gold Standard',
};

async function loadPackItems(
  prisma: PrismaClient,
  engagementId: string,
  packRef: string,
): Promise<{
  items: PackItemInput[];
  frameworks: Array<{
    code: string;
    name: string;
    publisher: string;
    version: string | null;
    licence: string | null;
    attribution: string | null;
  }>;
  review: { authoredBy: string; reviewedBy: string; reviewedAt: Date } | null;
}> {
  const frameworkItems = await prisma.assuranceFrameworkItem.findMany({
    where: { packRef },
    include: {
      framework: true,
      mappings: {
        include: {
          criterion: {
            select: { id: true, ref: true, title: true },
          },
        },
      },
    },
    orderBy: [{ sortOrder: 'asc' }, { ref: 'asc' }],
  });

  if (frameworkItems.length === 0) {
    throw new TRPCError({ code: 'NOT_FOUND', message: `Unknown pack: ${packRef}` });
  }

  const evidenceLinks = await prisma.evidenceCriterion.findMany({
    where: { evidence: { engagementId } },
    select: { criterionId: true },
  });
  const evidenceCountByCriterion = new Map<string, number>();
  for (const link of evidenceLinks) {
    evidenceCountByCriterion.set(
      link.criterionId,
      (evidenceCountByCriterion.get(link.criterionId) ?? 0) + 1,
    );
  }

  const items: PackItemInput[] = frameworkItems.map((fi) => ({
    id: fi.id,
    ref: fi.ref,
    title: fi.title,
    question: fi.question,
    sortOrder: fi.sortOrder,
    mappings: fi.mappings.map((m) => ({
      relation: m.relation,
      note: m.note,
      criterionId: m.criterion.id,
      criterionRef: m.criterion.ref,
      criterionTitle: m.criterion.title,
      evidenceCount: evidenceCountByCriterion.get(m.criterion.id) ?? 0,
    })),
  }));

  const frameworkMap = new Map(
    frameworkItems.map((fi) => [
      fi.framework.code,
      {
        code: fi.framework.code,
        name: fi.framework.name,
        publisher: fi.framework.publisher,
        version: fi.framework.version,
        licence: fi.framework.licence,
        attribution: fi.framework.attribution,
      },
    ]),
  );

  let review: { authoredBy: string; reviewedBy: string; reviewedAt: Date } | null = null;
  for (const fi of frameworkItems) {
    for (const m of fi.mappings) {
      if (!review || m.reviewedAt > review.reviewedAt) {
        review = {
          authoredBy: m.authoredBy,
          reviewedBy: m.reviewedBy,
          reviewedAt: m.reviewedAt,
        };
      }
    }
  }

  return { items, frameworks: [...frameworkMap.values()], review };
}

export const crosswalkRouter = router({
  listPacks: protectedProcedure
    .input(z.object({ engagementId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);

      const items = await ctx.prisma.assuranceFrameworkItem.findMany({
        where: { packRef: { not: null } },
        include: {
          framework: { select: { code: true, name: true, publisher: true } },
          mappings: { select: { id: true } },
        },
        orderBy: [{ sortOrder: 'asc' }, { ref: 'asc' }],
      });

      const byPack = new Map<
        string,
        {
          packRef: string;
          title: string;
          frameworkCode: string;
          frameworkName: string;
          publisher: string;
          itemCount: number;
          mappedCount: number;
        }
      >();

      for (const item of items) {
        if (!item.packRef) continue;
        const existing = byPack.get(item.packRef);
        if (existing) {
          existing.itemCount += 1;
          if (item.mappings.length > 0) existing.mappedCount += 1;
        } else {
          byPack.set(item.packRef, {
            packRef: item.packRef,
            title: PACK_TITLES[item.packRef] ?? item.title,
            frameworkCode: item.framework.code,
            frameworkName: item.framework.name,
            publisher: item.framework.publisher,
            itemCount: 1,
            mappedCount: item.mappings.length > 0 ? 1 : 0,
          });
        }
      }

      return [...byPack.values()].sort((a, b) => a.packRef.localeCompare(b.packRef));
    }),

  packDetail: protectedProcedure
    .input(z.object({ engagementId: z.string(), packRef: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const { items, frameworks, review } = await loadPackItems(
        ctx.prisma,
        input.engagementId,
        input.packRef,
      );
      const gap = buildGapList(items);

      const criteria = new Map<string, { id: string; ref: string; title: string }>();
      for (const item of items) {
        for (const m of item.mappings) {
          criteria.set(m.criterionId, {
            id: m.criterionId,
            ref: m.criterionRef,
            title: m.criterionTitle,
          });
        }
      }

      return {
        packRef: input.packRef,
        title: PACK_TITLES[input.packRef] ?? input.packRef,
        frameworks,
        review: review
          ? {
              authoredBy: review.authoredBy,
              reviewedBy: review.reviewedBy,
              reviewedAt: review.reviewedAt.toISOString(),
            }
          : null,
        items,
        criteria: [...criteria.values()].sort((a, b) =>
          a.ref.localeCompare(b.ref, undefined, { numeric: true }),
        ),
        gap,
        matrix: items.map((item) => ({
          itemId: item.id,
          ref: item.ref,
          title: item.title,
          question: item.question,
          cells: Object.fromEntries(
            item.mappings.map((m) => [
              m.criterionId,
              { relation: m.relation, note: m.note, evidenceCount: m.evidenceCount },
            ]),
          ),
        })),
      };
    }),

  hintsForCriteria: protectedProcedure
    .input(z.object({ engagementId: z.string(), criterionIds: z.array(z.string()).min(1) }))
    .query(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);

      const mappings = await ctx.prisma.crosswalkMapping.findMany({
        where: { criterionId: { in: input.criterionIds } },
        include: {
          criterion: { select: { id: true, ref: true, title: true } },
          frameworkItem: {
            include: {
              framework: { select: { code: true, name: true } },
            },
          },
        },
        orderBy: { reviewedAt: 'desc' },
      });

      return mappings.map((m) => ({
        criterionId: m.criterion.id,
        criterionRef: m.criterion.ref,
        criterionTitle: m.criterion.title,
        relation: m.relation,
        note: m.note,
        frameworkCode: m.frameworkItem.framework.code,
        frameworkName: m.frameworkItem.framework.name,
        itemRef: m.frameworkItem.ref,
        itemTitle: m.frameworkItem.title,
        packRef: m.frameworkItem.packRef,
      }));
    }),

  exportPack: protectedProcedure
    .input(z.object({ engagementId: z.string(), packRef: z.string() }))
    .query(async ({ ctx, input }) => {
      const engagement = await assertEngagementInOrg(ctx, input.engagementId);
      const { items, frameworks, review } = await loadPackItems(
        ctx.prisma,
        input.engagementId,
        input.packRef,
      );
      const gap = buildGapList(items);

      const criterionIds = [
        ...new Set(items.flatMap((i) => i.mappings.map((m) => m.criterionId))),
      ];
      const evidenceRows =
        criterionIds.length === 0
          ? []
          : await ctx.prisma.assuranceEvidence.findMany({
              where: {
                engagementId: input.engagementId,
                criteria: { some: { criterionId: { in: criterionIds } } },
              },
              include: {
                criteria: { include: { criterion: { select: { ref: true } } } },
              },
              orderBy: { updatedAt: 'desc' },
            });

      const evidence: EvidenceCitation[] = evidenceRows.map((e) => ({
        id: e.id,
        title: e.title,
        kind: e.kind,
        uri: e.uri,
        criterionRefs: e.criteria.map((c) => c.criterion.ref),
      }));

      return buildPackExport({
        packRef: input.packRef,
        packTitle: PACK_TITLES[input.packRef] ?? input.packRef,
        engagement: {
          id: engagement.id,
          name: engagement.name,
          reference: engagement.reference,
        },
        generatedAt: new Date().toISOString(),
        gap,
        items,
        evidence,
        frameworks,
        crosswalkReview: review
          ? {
              authoredBy: review.authoredBy,
              reviewedBy: review.reviewedBy,
              reviewedAt: review.reviewedAt.toISOString().slice(0, 10),
            }
          : null,
      });
    }),
});
