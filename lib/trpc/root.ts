import { router } from '@/lib/trpc/trpc';
import { engagementRouter } from '@/lib/trpc/routers/engagement';
import { extensionRouter } from '@/lib/trpc/routers/extension';
import { portfolioRouter } from '@/lib/trpc/routers/portfolio';

export const appRouter = router({
  engagement: engagementRouter,
  extension: extensionRouter,
  portfolio: portfolioRouter,
});

export type AppRouter = typeof appRouter;
