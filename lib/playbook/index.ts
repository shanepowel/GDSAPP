import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CAPACITY_SPLIT,
  CORE_ROLE_MIN_FTE,
  MATURITY_LABELS,
  RIGOUR_METRIC_TARGETS,
  type MaturityLevel,
} from '@/lib/playbook/keel';

export type PhaseCrosswalkRow = {
  gdsPhase: string;
  indicativeWeeksMin: number;
  indicativeWeeksMax: number;
  gateway: string;
  businessCase: string;
  archetypeSlug: string;
  syncPoint: string;
};

let cached: PhaseCrosswalkRow[] | null = null;

export function loadPhaseCrosswalk(): PhaseCrosswalkRow[] {
  if (cached) return cached;
  const path = join(process.cwd(), 'data/playbook/phase-crosswalk.json');
  const raw = JSON.parse(readFileSync(path, 'utf8')) as { phases: PhaseCrosswalkRow[] };
  cached = raw.phases;
  return cached;
}

export function playbookSummary() {
  return {
    keel: {
      coreRoleMinFte: CORE_ROLE_MIN_FTE,
      capacitySplit: CAPACITY_SPLIT,
    },
    compassTargets: RIGOUR_METRIC_TARGETS,
    maturityLabels: MATURITY_LABELS,
    phases: loadPhaseCrosswalk(),
  };
}

export function isMaturityLevel(v: string): v is MaturityLevel {
  return v in MATURITY_LABELS;
}
