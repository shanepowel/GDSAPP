import { router } from '@/lib/trpc/trpc';
import { engagementRouter } from '@/lib/trpc/routers/engagement';
import { extensionRouter } from '@/lib/trpc/routers/extension';
import { portfolioRouter } from '@/lib/trpc/routers/portfolio';
import { benchmarkingRouter } from '@/lib/trpc/routers/benchmarking';
import { frameworkRouter } from '@/lib/trpc/routers/framework';
import { userRouter } from '@/lib/trpc/routers/user';
import { reviewRouter } from '@/lib/trpc/routers/review';
import { orgDesignRouter } from '@/lib/trpc/routers/orgDesign';
import { standardsRouter } from '@/lib/trpc/routers/standards';
import { assuranceRouter } from '@/lib/trpc/routers/assurance';
import { crosswalkRouter } from '@/lib/trpc/routers/crosswalk';

export const appRouter = router({
  engagement: engagementRouter,
  extension: extensionRouter,
  portfolio: portfolioRouter,
  benchmarking: benchmarkingRouter,
  framework: frameworkRouter,
  user: userRouter,
  review: reviewRouter,
  orgDesign: orgDesignRouter,
  standards: standardsRouter,
  assurance: assuranceRouter,
  crosswalk: crosswalkRouter,
});

export type AppRouter = typeof appRouter;
