import { z } from 'zod';
import { protectedProcedure, router } from '@/lib/trpc/trpc';
import {
  buildDriftReport,
  hashFrameworkPoints,
  loadCurrentPointSnapshots,
  serializeBaselineSnapshot,
} from '@/lib/framework/drift';

export const frameworkRouter = router({
  driftReport: protectedProcedure.query(async ({ ctx }) => {
    return buildDriftReport(ctx.prisma);
  }),

  recordBaseline: protectedProcedure
    .input(
      z.object({
        source: z.string(),
        versionLabel: z.string(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const points = await loadCurrentPointSnapshots(ctx.prisma);
      const snapshotNotes = serializeBaselineSnapshot(points);
      return ctx.prisma.frameworkVersion.create({
        data: {
          source: input.source,
          versionLabel: input.versionLabel,
          notes: snapshotNotes,
        },
      });
    }),

  versions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.frameworkVersion.findMany({
      orderBy: { importedAt: 'desc' },
      take: 20,
    });
  }),
});
