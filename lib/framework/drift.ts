import { createHash } from 'crypto';
import type { PrismaClient } from '@prisma/client';

export interface FrameworkPointSnapshot {
  id: string;
  standardId: string;
  number: number;
  title: string;
  description: string;
}

export interface DriftChange {
  kind: 'added' | 'removed' | 'modified';
  pointId: string;
  standardId: string;
  detail: string;
}

export interface DriftReport {
  currentHash: string;
  baselineHash: string | null;
  baselineLabel: string | null;
  baselineAt: Date | null;
  hasDrift: boolean;
  changes: DriftChange[];
  pointCount: number;
}

export function hashFrameworkPoints(points: FrameworkPointSnapshot[]): string {
  const payload = points
    .map((p) => `${p.standardId}|${p.id}|${p.number}|${p.title}|${p.description}`)
    .sort()
    .join('\n');
  return createHash('sha256').update(payload).digest('hex');
}

export async function loadCurrentPointSnapshots(prisma: PrismaClient): Promise<FrameworkPointSnapshot[]> {
  const rows = await prisma.standardPoint.findMany({
    orderBy: [{ standardId: 'asc' }, { number: 'asc' }],
    select: {
      id: true,
      standardId: true,
      number: true,
      title: true,
      description: true,
    },
  });
  return rows;
}

export function compareFrameworkSnapshots(
  current: FrameworkPointSnapshot[],
  baseline: FrameworkPointSnapshot[],
): DriftChange[] {
  const changes: DriftChange[] = [];
  const baseMap = new Map(baseline.map((p) => [p.id, p]));
  const curMap = new Map(current.map((p) => [p.id, p]));

  for (const p of current) {
    const b = baseMap.get(p.id);
    if (!b) {
      changes.push({
        kind: 'added',
        pointId: p.id,
        standardId: p.standardId,
        detail: `New point ${p.number}: ${p.title}`,
      });
    } else if (b.title !== p.title || b.description !== p.description || b.number !== p.number) {
      changes.push({
        kind: 'modified',
        pointId: p.id,
        standardId: p.standardId,
        detail: `Updated point ${p.number}: ${p.title}`,
      });
    }
  }

  for (const p of baseline) {
    if (!curMap.has(p.id)) {
      changes.push({
        kind: 'removed',
        pointId: p.id,
        standardId: p.standardId,
        detail: `Removed point ${p.number}: ${p.title}`,
      });
    }
  }

  return changes;
}

export function parseBaselineSnapshot(notes: string | null | undefined): FrameworkPointSnapshot[] | null {
  if (!notes?.trim()) return null;
  try {
    const parsed = JSON.parse(notes) as { points?: FrameworkPointSnapshot[] };
    return parsed.points ?? null;
  } catch {
    return null;
  }
}

export function serializeBaselineSnapshot(points: FrameworkPointSnapshot[]): string {
  return JSON.stringify({ points });
}

export async function buildDriftReport(prisma: PrismaClient): Promise<DriftReport> {
  const current = await loadCurrentPointSnapshots(prisma);
  const currentHash = hashFrameworkPoints(current);

  const baseline = await prisma.frameworkVersion.findFirst({
    orderBy: { importedAt: 'desc' },
  });

  const baselinePoints = parseBaselineSnapshot(baseline?.notes ?? null);
  const baselineHash = baselinePoints ? hashFrameworkPoints(baselinePoints) : null;

  const changes =
    baselinePoints && baselineHash !== currentHash
      ? compareFrameworkSnapshots(current, baselinePoints)
      : [];

  return {
    currentHash,
    baselineHash,
    baselineLabel: baseline?.versionLabel ?? null,
    baselineAt: baseline?.importedAt ?? null,
    hasDrift: baselineHash != null && baselineHash !== currentHash,
    changes,
    pointCount: current.length,
  };
}
