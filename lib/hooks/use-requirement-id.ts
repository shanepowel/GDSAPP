'use client';

import { useCallback, useMemo, useState } from 'react';

type RequirementLike = { id: string };

function storageKey(engagementId: string) {
  return `assemble-req-${engagementId}`;
}

function resolveRequirementId(
  engagementId: string,
  requirements: RequirementLike[] | undefined,
  overrideId: string | undefined,
): string | undefined {
  if (!requirements?.length) return undefined;
  if (overrideId && requirements.some((r) => r.id === overrideId)) return overrideId;
  if (typeof sessionStorage !== 'undefined') {
    const stored = sessionStorage.getItem(storageKey(engagementId));
    if (stored && requirements.some((r) => r.id === stored)) return stored;
  }
  return requirements[0].id;
}

export function useRequirementId(
  engagementId: string,
  requirements: RequirementLike[] | undefined,
) {
  const [overrideId, setOverrideId] = useState<string | undefined>();

  const requirementId = useMemo(
    () => resolveRequirementId(engagementId, requirements, overrideId),
    [engagementId, requirements, overrideId],
  );

  const setRequirementId = useCallback(
    (id: string) => {
      setOverrideId(id);
      sessionStorage.setItem(storageKey(engagementId), id);
    },
    [engagementId],
  );

  const activeRequirement = requirements?.find((r) => r.id === requirementId);

  return { requirementId, setRequirementId, activeRequirement };
}
