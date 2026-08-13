'use client';

import { useDatumShell } from '@/components/shell/datum-shell-context';

export function AppNav() {
  const datum = useDatumShell();
  if (datum) return null;
  return null;
}
