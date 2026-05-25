import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { assertEngagementInOrg, protectedProcedure, router } from '@/lib/trpc/trpc';
import { assertNotCompetitorSubject } from '@/lib/tenant-firewall';

import type { PrismaClient } from '@prisma/client';

async function refreshRequestStatus(prisma: PrismaClient, reviewRequestId: string) {
  const request = await prisma.reviewRequest.findUnique({
    where: { id: reviewRequestId },
    include: { assignments: true },
  });
  if (!request || request.status !== 'open') return request;

  const rejected = request.assignments.some((a) => a.status === 'rejected');
  if (rejected) {
    return prisma.reviewRequest.update({
      where: { id: reviewRequestId },
      data: { status: 'rejected' },
      include: {
        assignments: {
          include: { reviewer: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }

  const approvedCount = request.assignments.filter((a) => a.status === 'approved').length;
  if (approvedCount >= request.minApprovals) {
    return prisma.reviewRequest.update({
      where: { id: reviewRequestId },
      data: { status: 'approved' },
      include: {
        assignments: {
          include: { reviewer: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }

  return request;
}

export const reviewRouter = router({
  list: protectedProcedure.input(z.object({ engagementId: z.string() })).query(async ({ ctx, input }) => {
    await assertEngagementInOrg(ctx, input.engagementId);
    return ctx.prisma.reviewRequest.findMany({
      where: { engagementId: input.engagementId },
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          orderBy: { stepOrder: 'asc' },
          include: { reviewer: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        title: z.string().min(1),
        subjectType: z.string(),
        subjectId: z.string(),
        minApprovals: z.number().min(1).max(10).default(2),
        reviewerUserIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      assertNotCompetitorSubject(input.subjectType);

      const members = await ctx.prisma.user.findMany({
        where: { orgId: ctx.orgId, id: { in: input.reviewerUserIds } },
      });
      if (members.length !== input.reviewerUserIds.length) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'All reviewers must belong to your organisation.' });
      }

      return ctx.prisma.reviewRequest.create({
        data: {
          engagementId: input.engagementId,
          title: input.title,
          subjectType: input.subjectType,
          subjectId: input.subjectId,
          minApprovals: Math.min(input.minApprovals, input.reviewerUserIds.length),
          createdById: ctx.userId,
          assignments: {
            create: input.reviewerUserIds.map((reviewerUserId, stepOrder) => ({
              reviewerUserId,
              stepOrder,
              status: 'pending',
            })),
          },
        },
        include: {
          assignments: {
            include: { reviewer: { select: { id: true, name: true, email: true } } },
          },
        },
      });
    }),

  respond: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        engagementId: z.string(),
        status: z.enum(['approved', 'rejected']),
        comment: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const assignment = await ctx.prisma.reviewAssignment.findUnique({
        where: { id: input.assignmentId },
        include: {
          reviewRequest: { include: { engagement: true } },
        },
      });
      if (
        !assignment ||
        assignment.reviewRequest.engagementId !== input.engagementId ||
        assignment.reviewRequest.engagement.orgId !== ctx.orgId
      ) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      if (assignment.reviewerUserId !== ctx.userId && ctx.userRole !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the assigned reviewer or an admin can respond.',
        });
      }
      if (assignment.status !== 'pending') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'This review step is already complete.' });
      }

      await ctx.prisma.reviewAssignment.update({
        where: { id: input.assignmentId },
        data: {
          status: input.status,
          comment: input.comment,
          decidedAt: new Date(),
        },
      });

      return refreshRequestStatus(ctx.prisma, assignment.reviewRequestId);
    }),
});
