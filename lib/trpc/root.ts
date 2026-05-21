import { router } from '@/lib/trpc/trpc';
import { engagementRouter } from '@/lib/trpc/routers/engagement';

export const appRouter = router({
  engagement: engagementRouter,
});

export type AppRouter = typeof appRouter;
