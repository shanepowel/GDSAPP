import { router } from '@/lib/trpc/trpc';
import { engagementRouter } from '@/lib/trpc/routers/engagement';
import { extensionRouter } from '@/lib/trpc/routers/extension';

export const appRouter = router({
  engagement: engagementRouter,
  extension: extensionRouter,
});

export type AppRouter = typeof appRouter;
