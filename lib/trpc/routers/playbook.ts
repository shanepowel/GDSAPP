import { z } from 'zod';
import { protectedProcedure, router } from '@/lib/trpc/trpc';
import { playbookSummary } from '@/lib/playbook';

export const playbookRouter = router({
  summary: protectedProcedure.query(() => playbookSummary()),

  phaseForEngagement: protectedProcedure
    .input(z.object({ phase: z.string() }))
    .query(({ input }) => {
      const summary = playbookSummary();
      const row =
        summary.phases.find((p) => p.gdsPhase === input.phase) ??
        summary.phases.find((p) => p.gdsPhase === 'discovery');
      return row ?? null;
    }),
});
