import { router, protectedProcedure } from '@/lib/trpc/trpc';
import { buildPortfolioSummary } from '@/lib/portfolio/rollup';
import { getDeploymentFeatures } from '@/lib/deployment-mode';

export const portfolioRouter = router({
  summary: protectedProcedure.query(async ({ ctx }) => {
    const summary = await buildPortfolioSummary(ctx.prisma, ctx.orgId);
    return {
      ...summary,
      deploymentMode: getDeploymentFeatures().mode,
    };
  }),
});
