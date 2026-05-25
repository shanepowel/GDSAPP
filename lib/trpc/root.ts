import { router } from '@/lib/trpc/trpc';
import { engagementRouter } from '@/lib/trpc/routers/engagement';
import { extensionRouter } from '@/lib/trpc/routers/extension';
import { portfolioRouter } from '@/lib/trpc/routers/portfolio';
import { benchmarkingRouter } from '@/lib/trpc/routers/benchmarking';
import { frameworkRouter } from '@/lib/trpc/routers/framework';

export const appRouter = router({
  engagement: engagementRouter,
  extension: extensionRouter,
  portfolio: portfolioRouter,
  benchmarking: benchmarkingRouter,
  framework: frameworkRouter,
});

export type AppRouter = typeof appRouter;
