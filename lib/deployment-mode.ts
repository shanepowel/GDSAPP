/**
 * Separate deployment instances: internal (Play A) vs client-owned (Play B).
 * Set DEPLOYMENT_MODE and NEXT_PUBLIC_DEPLOYMENT_MODE to the same value per Vercel project.
 */

export type DeploymentMode = 'internal' | 'client';

export function getDeploymentMode(): DeploymentMode {
  const raw =
    process.env.NEXT_PUBLIC_DEPLOYMENT_MODE ??
    process.env.DEPLOYMENT_MODE ??
    'internal';
  return raw === 'client' ? 'client' : 'internal';
}

export function isInternalDeployment(): boolean {
  return getDeploymentMode() === 'internal';
}

export function isClientDeployment(): boolean {
  return getDeploymentMode() === 'client';
}

export interface DeploymentFeatures {
  mode: DeploymentMode;
  /** Competitive win framing (point-movers, winning bids). Off on client instance. */
  supplierWinFraming: boolean;
  /** Play B: cross-engagement assurance dashboard */
  portfolioRollup: boolean;
  /** Play B: handover and training pack (emphasised on client instance) */
  handoverPack: boolean;
  /** Client instance banner and assurance-oriented labels */
  clientAssuranceLabels: boolean;
}

export function getDeploymentFeatures(): DeploymentFeatures {
  const mode = getDeploymentMode();
  const client = mode === 'client';
  return {
    mode,
    supplierWinFraming: !client,
    portfolioRollup: true,
    handoverPack: client,
    clientAssuranceLabels: client,
  };
}

export const DEPLOYMENT_MODE_LABELS: Record<DeploymentMode, { title: string; description: string }> =
  {
    internal: {
      title: 'Internal delivery instance (Play A)',
      description:
        'Call-off accelerator for your teams. Do not use to evaluate competitor submissions.',
    },
    client: {
      title: 'Client assurance instance (Play B)',
      description:
        'Owned and operated by the contracting authority. No supplier competitive data.',
    },
  };
