import type { PrismaClient } from '@prisma/client';
import type { RigourSignalType, SignalProvenance } from '@/lib/scoring/fit';

export type DerivedRigourSignal = {
  personId: string;
  engagementId: string | null;
  type: RigourSignalType;
  provenance: SignalProvenance;
  value: number;
  note: string | null;
  observedAt: Date;
  confirmedByUserId: null;
};

/**
 * Derive sustained_assignment and capacity_discipline from existing allocation /
 * assignment data. No user input. Derived signals never carry confirmedByUserId.
 * A person with no history produces zero signals.
 */
export async function deriveRigourSignals(
  prisma: PrismaClient,
  args: { orgId: string; engagementId: string; asOf: Date },
): Promise<DerivedRigourSignal[]> {
  const engagement = await prisma.engagement.findFirst({
    where: { id: args.engagementId, orgId: args.orgId },
    include: {
      people: {
        where: { isVacancy: false },
        include: {
          assignments: true,
          availability: true,
        },
      },
    },
  });
  if (!engagement) return [];

  const designPeople = await prisma.designPerson.findMany({
    where: { orgId: args.orgId },
  });
  const designAssignments = await prisma.designAssignment.findMany({
    where: { orgId: args.orgId },
  });
  const allocationByPerson = new Map<string, number>();
  for (const a of designAssignments) {
    allocationByPerson.set(a.personId, (allocationByPerson.get(a.personId) ?? 0) + a.allocation);
  }

  const out: DerivedRigourSignal[] = [];

  for (const person of engagement.people) {
    if (person.assignments.length > 0) {
      const weeksProxy = Math.max(
        1,
        Math.floor((args.asOf.getTime() - engagement.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)),
      );
      const value = weeksProxy >= 8 ? 0.7 : weeksProxy >= 4 ? 0.4 : 0.2;
      out.push({
        personId: person.id,
        engagementId: args.engagementId,
        type: 'sustained_assignment',
        provenance: 'derived',
        value,
        note: `Assigned on engagement for ~${weeksProxy} weeks`,
        observedAt: args.asOf,
        confirmedByUserId: null,
      });
    }

    const days = person.availability[0]?.daysPerWeek;
    if (days != null) {
      const fte = days / 5;
      let value = 0.3;
      if (fte > 1.05) value = -0.6;
      else if (fte >= 0.8 && fte <= 1.0) value = 0.5;
      else if (fte < 0.4) value = -0.2;
      out.push({
        personId: person.id,
        engagementId: args.engagementId,
        type: 'capacity_discipline',
        provenance: 'derived',
        value,
        note: `Availability ${days} days/week`,
        observedAt: args.asOf,
        confirmedByUserId: null,
      });
    }
  }

  for (const dp of designPeople) {
    const allocated = allocationByPerson.get(dp.id);
    if (allocated == null) continue;
    const ratio = allocated / Math.max(1, dp.fte);
    let value = 0.4;
    if (ratio > 1.1) value = -0.7;
    else if (ratio >= 0.7 && ratio <= 1.0) value = 0.6;
    out.push({
      personId: dp.id,
      engagementId: args.engagementId,
      type: 'capacity_discipline',
      provenance: 'derived',
      value,
      note: `Design allocation ${allocated}% of ${dp.fte}% FTE`,
      observedAt: args.asOf,
      confirmedByUserId: null,
    });
  }

  return out;
}

/** Persist derived signals (replace prior derived of same types for engagement people). */
export async function refreshDerivedRigourSignals(
  prisma: PrismaClient,
  args: { orgId: string; engagementId: string; asOf: Date },
): Promise<number> {
  const derived = await deriveRigourSignals(prisma, args);
  const personIds = [...new Set(derived.map((d) => d.personId))];

  await prisma.rigourSignal.deleteMany({
    where: {
      orgId: args.orgId,
      engagementId: args.engagementId,
      provenance: 'derived',
      type: { in: ['sustained_assignment', 'capacity_discipline'] },
      personId: { in: personIds.length ? personIds : ['__none__'] },
    },
  });

  if (derived.length === 0) return 0;

  await prisma.rigourSignal.createMany({
    data: derived.map((d) => ({
      orgId: args.orgId,
      personId: d.personId,
      engagementId: d.engagementId,
      type: d.type,
      provenance: d.provenance,
      value: d.value,
      note: d.note,
      observedAt: d.observedAt,
      confirmedByUserId: null,
    })),
  });

  return derived.length;
}
