import type { DeploymentFeatures } from '@/lib/deployment-mode';

export function engagementEntityLabel(features: Pick<DeploymentFeatures, 'clientAssuranceLabels'>): string {
  return features.clientAssuranceLabels ? 'Service' : 'Call-off';
}

export function engagementsListTitle(features: Pick<DeploymentFeatures, 'clientAssuranceLabels'>): string {
  return features.clientAssuranceLabels ? 'Services' : 'Call-offs';
}
