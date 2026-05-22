'use client';

import type { DeploymentFeatures, DeploymentMode } from '@/lib/deployment-mode';

/** Client-safe mirror of deployment mode (from NEXT_PUBLIC_DEPLOYMENT_MODE). */
export function getClientDeploymentMode(): DeploymentMode {
  const raw = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE ?? 'internal';
  return raw === 'client' ? 'client' : 'internal';
}

export function getClientDeploymentFeatures(): DeploymentFeatures {
  const mode = getClientDeploymentMode();
  const client = mode === 'client';
  return {
    mode,
    supplierWinFraming: !client,
    portfolioRollup: true,
    handoverPack: true,
    clientAssuranceLabels: client,
  };
}
