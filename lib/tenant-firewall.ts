import { TRPCError } from '@trpc/server';
import type { PrismaClient } from '@prisma/client';
import { getDeploymentMode, type DeploymentMode } from '@/lib/deployment-mode';

export type TenantContext = {
  prisma: PrismaClient;
  orgId: string;
};

/** Ensure organisation tenant matches this Vercel instance (Play A vs Play B). */
export async function assertOrgDeploymentMode(ctx: TenantContext): Promise<void> {
  const instanceMode = getDeploymentMode();
  const org = await ctx.prisma.organisation.findUnique({
    where: { id: ctx.orgId },
    select: { deploymentMode: true, name: true },
  });
  if (!org) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Organisation not found.' });
  }
  const orgMode = (org.deploymentMode === 'client' ? 'client' : 'internal') as DeploymentMode;
  if (orgMode !== instanceMode) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message:
        `This instance runs in ${instanceMode} mode but your organisation "${org.name}" is registered for ${orgMode} mode. Use the correct Vercel project and database.`,
    });
  }
}

/** Play B client instances must not run supplier competitive bid tooling. */
export function assertPlayAOnly(feature: string): void {
  if (getDeploymentMode() === 'client') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `${feature} is not available on the client assurance instance (Play B). Use the internal delivery instance.`,
    });
  }
}

/** Client assurance: block storing competitor evaluation artefacts. */
export function assertNotCompetitorSubject(subjectType: string): void {
  if (getDeploymentMode() !== 'client') return;
  const blocked = ['bid_question', 'bid_outlook', 'competitor_submission'];
  if (blocked.includes(subjectType)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message:
        'Client instances cannot record judgements on competitor bid artefacts. Record assurance on your own service delivery only.',
    });
  }
}
