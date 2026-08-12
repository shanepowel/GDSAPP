import type { Prisma, PrismaClient } from '@prisma/client';
import {
  FIT_SCORING_VERSION,
  classifyGap,
  computeFit,
  type FitBand,
  type FitBreakdown,
  type RoleCriticality,
  type SkillLevel,
} from '@/lib/scoring/fit';
import { fitInputsHash } from '@/lib/team-fit/hash';
import { refreshDerivedRigourSignals } from '@/lib/team-fit/derive-rigour';

type RequiredSkill = { skillId: string; requiredLevel: SkillLevel; weight: number };

function asRequiredSkills(raw: unknown): RequiredSkill[] {
  if (!Array.isArray(raw)) return [];
  const out: RequiredSkill[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    if (typeof r.skillId !== 'string') continue;
    if (typeof r.requiredLevel !== 'string') continue;
    if (typeof r.weight !== 'number') continue;
    out.push({
      skillId: r.skillId,
      requiredLevel: r.requiredLevel as SkillLevel,
      weight: r.weight,
    });
  }
  return out;
}

function daysAgo(from: Date, observedAt: Date): number {
  return Math.max(0, Math.floor((from.getTime() - observedAt.getTime()) / (24 * 60 * 60 * 1000)));
}

/**
 * Recompute fit scores + capability gaps for an engagement + archetype.
 * Does not run on page load — call from mutations / background jobs only.
 */
export async function recomputeTeamFit(
  prisma: PrismaClient,
  args: {
    orgId: string;
    engagementId: string;
    archetypeId: string;
    asOf?: Date;
  },
): Promise<{ scoresUpserted: number; gapsWritten: number }> {
  const asOf = args.asOf ?? new Date();

  await refreshDerivedRigourSignals(prisma, {
    orgId: args.orgId,
    engagementId: args.engagementId,
    asOf,
  });

  const archetype = await prisma.roleArchetype.findFirst({
    where: { id: args.archetypeId, orgId: args.orgId, archivedAt: null },
    include: { roles: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!archetype) return { scoresUpserted: 0, gapsWritten: 0 };

  const people = await prisma.person.findMany({
    where: { engagementId: args.engagementId, isVacancy: false },
    include: { skills: true, availability: true },
  });

  const signals = await prisma.rigourSignal.findMany({
    where: {
      orgId: args.orgId,
      OR: [{ engagementId: args.engagementId }, { engagementId: null }],
      personId: { in: people.map((p) => p.id) },
    },
  });
  const signalsByPerson = new Map<string, typeof signals>();
  for (const s of signals) {
    const list = signalsByPerson.get(s.personId) ?? [];
    list.push(s);
    signalsByPerson.set(s.personId, list);
  }

  const standardRefs = Array.isArray(archetype.standardRefs)
    ? (archetype.standardRefs as string[])
    : [];

  let scoresUpserted = 0;
  const roleBest: Array<{
    roleId: string;
    criticality: RoleCriticality;
    bestComposite: number | null;
    bestSkill: number | null;
    viableWithCapacity: boolean;
    capacityOnly: boolean;
  }> = [];

  for (const role of archetype.roles) {
    let bestComposite: number | null = null;
    let bestSkill: number | null = null;
    let viableWithCapacity = false;
    let bestWithoutCapacity: number | null = null;

    for (const person of people) {
      const availableFte =
        person.availability[0] != null ? person.availability[0].daysPerWeek / 5 : 1;

      const input = {
        requirement: {
          ddatRoleId: role.ddatRoleId,
          minLevel: role.minLevel as SkillLevel,
          criticality: role.criticality as RoleCriticality,
          fteRequired: role.fteRequired,
          requiredSkills: asRequiredSkills(role.requiredSkills),
        },
        candidate: {
          personId: person.id,
          skills: person.skills.map((s) => ({
            skillId: s.skillId,
            level: s.level as SkillLevel,
          })),
          availableFte,
        },
        rigourSignals: (signalsByPerson.get(person.id) ?? []).map((s) => ({
          type: s.type as 'sustained_assignment',
          value: s.value,
          provenance: s.provenance as 'derived',
          observedAtDaysAgo: daysAgo(asOf, s.observedAt),
        })),
      };

      const result = computeFit(input);
      const hash = fitInputsHash(input);

      const existing = await prisma.fitScore.findUnique({
        where: {
          engagementId_archetypeRoleId_personId: {
            engagementId: args.engagementId,
            archetypeRoleId: role.id,
            personId: person.id,
          },
        },
      });

      if (existing && existing.inputsHash === hash && existing.scoringVersion === FIT_SCORING_VERSION) {
        // cache hit
      } else {
        const data = {
          skillScore: result.skillScore,
          rigourMultiplier: result.rigourMultiplier,
          compositeScore: result.compositeScore,
          band: result.band,
          breakdown: result.breakdown as unknown as Prisma.InputJsonValue,
          scoringVersion: FIT_SCORING_VERSION,
          inputsHash: hash,
          computedAt: asOf,
        };
        await prisma.fitScore.upsert({
          where: {
            engagementId_archetypeRoleId_personId: {
              engagementId: args.engagementId,
              archetypeRoleId: role.id,
              personId: person.id,
            },
          },
          create: {
            engagementId: args.engagementId,
            archetypeRoleId: role.id,
            personId: person.id,
            ...data,
          },
          update: data,
        });
        scoresUpserted += 1;
      }

      if (bestComposite == null || result.compositeScore > bestComposite) {
        bestComposite = result.compositeScore;
        bestSkill = result.skillScore;
      }
      if (result.breakdown.capacityShortfall == null && result.compositeScore >= 0.6) {
        viableWithCapacity = true;
      }
      if (result.compositeScore >= 0.6) {
        bestWithoutCapacity =
          bestWithoutCapacity == null
            ? result.compositeScore
            : Math.max(bestWithoutCapacity, result.compositeScore);
      }
    }

    const capacityOnly =
      !viableWithCapacity &&
      bestWithoutCapacity != null &&
      bestWithoutCapacity >= 0.6 &&
      (bestComposite == null || bestComposite >= 0.4);

    roleBest.push({
      roleId: role.id,
      criticality: role.criticality as RoleCriticality,
      bestComposite,
      bestSkill,
      viableWithCapacity,
      capacityOnly: Boolean(capacityOnly && !viableWithCapacity),
    });
  }

  await prisma.capabilityGap.deleteMany({
    where: {
      engagementId: args.engagementId,
      archetypeRoleId: { in: archetype.roles.map((r) => r.id) },
    },
  });

  let gapsWritten = 0;
  for (const row of roleBest) {
    const role = archetype.roles.find((r) => r.id === row.roleId)!;
    const needsGap =
      row.capacityOnly ||
      row.bestComposite == null ||
      row.bestComposite < 0.6;

    if (!needsGap) continue;
    if (row.bestComposite != null && row.bestComposite >= 0.6 && !row.capacityOnly) continue;

    const classified = classifyGap({
      criticality: row.criticality,
      bestComposite: row.bestComposite,
      bestSkill: row.bestSkill,
      capacityOnly: row.capacityOnly,
    });

    const bandLabel: FitBand =
      row.bestComposite == null
        ? 'gap'
        : row.bestComposite >= 0.8
          ? 'strong'
          : row.bestComposite >= 0.6
            ? 'viable'
            : row.bestComposite >= 0.4
              ? 'stretch'
              : 'gap';

    const narrative =
      classified.kind === 'capacity_gap'
        ? `${role.displayTitle}: adequate fit exists but available FTE is short.`
        : classified.kind === 'rigour_gap'
          ? `${role.displayTitle}: skills are present but delivery discipline is unevidenced or weak.`
          : `${role.displayTitle}: no candidate reaches a viable fit score (best ${bandLabel}).`;

    await prisma.capabilityGap.create({
      data: {
        engagementId: args.engagementId,
        archetypeRoleId: role.id,
        kind: classified.kind,
        severity: classified.severity,
        bestAvailableScore: row.bestComposite,
        recommendation: classified.recommendation,
        narrative,
        standardRefs: standardRefs.length ? standardRefs : ['gds-service-standard@2019.1'],
        computedAt: asOf,
      },
    });
    gapsWritten += 1;
  }

  return { scoresUpserted, gapsWritten };
}

export type { FitBreakdown };
