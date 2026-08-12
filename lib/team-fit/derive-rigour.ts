import type { PrismaClient } from '@prisma/client';
import type { RigourSignalType, SignalProvenance } from '@/lib/scoring/fit';
import {
  CORE_ROLE_MIN_FTE,
  scoreCapacityDiscipline,
  scoreSustainedAssignment,
} from '@/lib/playbook/keel';

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
 * assignment data per Delivery Playbook §5 (The Keel). No user input.
 * Derived signals never carry confirmedByUserId.
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

  const weeksOnEngagement = Math.max(
    0,
    Math.floor((args.asOf.getTime() - engagement.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)),
  );

  const designPeople = await prisma.designPerson.findMany({
    where: { orgId: args.orgId },
  });
  const designAssignments = await prisma.designAssignment.findMany({
    where: { orgId: args.orgId },
  });

  const allocationByPerson = new Map<string, number>();
  const engagementCountByPerson = new Map<string, number>();
  for (const a of designAssignments) {
    allocationByPerson.set(a.personId, (allocationByPerson.get(a.personId) ?? 0) + a.allocation);
  }
  // Engagement Person rows are scoped to one engagement; design people may appear on multiple
  // entities. Count distinct entity assignments as a proxy for concurrent load breadth.
  for (const a of designAssignments) {
    engagementCountByPerson.set(a.personId, (engagementCountByPerson.get(a.personId) ?? 0) + 1);
  }

  const out: DerivedRigourSignal[] = [];

  for (const person of engagement.people) {
    const days = person.availability[0]?.daysPerWeek;
    const fteOnEngagement =
      days != null ? days / 5 : person.assignments.length > 0 ? CORE_ROLE_MIN_FTE : 0;

    if (person.assignments.length > 0 || fteOnEngagement > 0) {
      const sustained = scoreSustainedAssignment({
        weeksOnEngagement: person.assignments.length > 0 ? Math.max(weeksOnEngagement, 1) : 0,
        fteOnEngagement,
        phase: engagement.phase,
      });
      if (sustained) {
        out.push({
          personId: person.id,
          engagementId: args.engagementId,
          type: 'sustained_assignment',
          provenance: 'derived',
          value: sustained.value,
          note: sustained.note,
          observedAt: args.asOf,
          confirmedByUserId: null,
        });
      }
    }

    if (days != null || person.assignments.length > 0) {
      const committedFraction = fteOnEngagement; // engagement-scoped: days/week as committed share of a 1.0 FTE week
      const capacity = scoreCapacityDiscipline({
        committedFraction: Math.min(1.2, committedFraction),
        engagementCount: 1,
      });
      if (capacity) {
        out.push({
          personId: person.id,
          engagementId: args.engagementId,
          type: 'capacity_discipline',
          provenance: 'derived',
          value: capacity.value,
          note: capacity.note,
          observedAt: args.asOf,
          confirmedByUserId: null,
        });
      }
    }
  }

  for (const dp of designPeople) {
    const allocatedPct = allocationByPerson.get(dp.id);
    if (allocatedPct == null) continue;
    const personalFte = Math.max(1, dp.fte) / 100;
    const committedFraction = allocatedPct / 100 / Math.max(personalFte, 0.01);
    // entity assignment count as concurrent-load proxy (capped interpretation in scorer)
    const entityLoad = engagementCountByPerson.get(dp.id) ?? 1;
    const engagementCountApprox = entityLoad > 4 ? 3 : entityLoad > 2 ? 2 : 1;

    const capacity = scoreCapacityDiscipline({
      committedFraction,
      engagementCount: engagementCountApprox,
    });
    if (capacity) {
      out.push({
        personId: dp.id,
        engagementId: args.engagementId,
        type: 'capacity_discipline',
        provenance: 'derived',
        value: capacity.value,
        note: `${capacity.note} (design allocation ${allocatedPct}% of ${dp.fte}% FTE)`,
        observedAt: args.asOf,
        confirmedByUserId: null,
      });
    }

    const sustained = scoreSustainedAssignment({
      weeksOnEngagement,
      fteOnEngagement: Math.min(1, committedFraction),
      phase: engagement.phase,
    });
    if (sustained && weeksOnEngagement > 0) {
      out.push({
        personId: dp.id,
        engagementId: args.engagementId,
        type: 'sustained_assignment',
        provenance: 'derived',
        value: sustained.value,
        note: sustained.note,
        observedAt: args.asOf,
        confirmedByUserId: null,
      });
    }
  }

  return out;
}

/** Persist derived signals (replace prior derived of same types for engagement). */
export async function refreshDerivedRigourSignals(
  prisma: PrismaClient,
  args: { orgId: string; engagementId: string; asOf: Date },
): Promise<number> {
  const derived = await deriveRigourSignals(prisma, args);

  await prisma.rigourSignal.deleteMany({
    where: {
      orgId: args.orgId,
      engagementId: args.engagementId,
      provenance: 'derived',
      type: { in: ['sustained_assignment', 'capacity_discipline'] },
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
