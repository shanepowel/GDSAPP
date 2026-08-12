import { z } from 'zod';
import { assertEngagementInOrg, protectedProcedure, router } from '@/lib/trpc/trpc';
import { syncGitHubDeliverySignals } from '@/lib/integrations/github';
import { computeAndSnapshotIndex } from '@/lib/assurance/scoring-load';

export const integrationsRouter = router({
  githubStatus: protectedProcedure.query(() => {
    const configured = Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);
    return {
      configured,
      reconnectHint: configured
        ? null
        : 'Set GITHUB_TOKEN in the environment, then sync again.',
    };
  }),

  githubSync: protectedProcedure
    .input(
      z.object({
        engagementId: z.string(),
        owner: z.string().min(1),
        repo: z.string().min(1),
        criterionIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEngagementInOrg(ctx, input.engagementId);
      const result = await syncGitHubDeliverySignals(ctx.prisma, {
        engagementId: input.engagementId,
        owner: input.owner,
        repo: input.repo,
        criterionIds: input.criterionIds ?? [],
        createdByUserId: ctx.userId,
      });
      if (result.ok) {
        await computeAndSnapshotIndex(ctx.prisma, input.engagementId, 'github-sync');
      }
      return result;
    }),
});
