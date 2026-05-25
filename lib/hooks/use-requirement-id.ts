'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type RequirementLike = { id: string };

function storageKey(engagementId: string) {
  return `assemble-req-${engagementId}`;
}

export function useRequirementId(
  engagementId: string,
  requirements: RequirementLike[] | undefined,
) {
  const [selectedId, setSelectedId] = useState<string | undefined>();

  useEffect(() => {
    if (!requirements?.length) return;
    const stored = sessionStorage.getItem(storageKey(engagementId));
    if (stored && requirements.some((r) => r.id === stored)) {
      setSelectedId(stored);
      return;
    }
    setSelectedId(requirements[0].id);
  }, [engagementId, requirements]);

  const requirementId = useMemo(() => {
    if (selectedId && requirements?.some((r) => r.id === selectedId)) return selectedId;
    return requirements?.[0]?.id;
  }, [selectedId, requirements]);

  const setRequirementId = useCallback(
    (id: string) => {
      setSelectedId(id);
      sessionStorage.setItem(storageKey(engagementId), id);
    },
    [engagementId],
  );

  const activeRequirement = requirements?.find((r) => r.id === requirementId);

  return { requirementId, setRequirementId, activeRequirement };
}
