import { PrismaClient } from '@prisma/client';
import {
  allDependencies,
  CUSTOM_SKILLS,
  reconcileDependencies,
} from '../lib/engine/standards-dependency-map';
import { SENIORITY_RANK } from '../lib/engine/config';
import type { Seniority } from '../lib/engine/standards-dependency-map';
import {
  hashFrameworkPoints,
  loadCurrentPointSnapshots,
  serializeBaselineSnapshot,
} from '../lib/framework/drift';

const prisma = new PrismaClient();

function seniorityRank(s?: Seniority): number {
  if (!s) return 0;
  return SENIORITY_RANK[s] ?? 0;
}

async function seedCustomSkills() {
  for (const id of CUSTOM_SKILLS) {
    await prisma.skill.upsert({
      where: { id },
      create: {
        id,
        name: 'Welsh language service capability',
        description: 'Amplified custom skill: bilingual Welsh and English service design (not part of DDaT).',
        isCustom: true,
      },
      update: { isCustom: true },
    });
  }
}

async function main() {
  await seedCustomSkills();

  const roles = await prisma.role.findMany({ select: { id: true } });
  const skills = await prisma.skill.findMany({ select: { id: true } });
  const report = reconcileDependencies(new Set(roles.map((r) => r.id)), new Set(skills.map((s) => s.id)));

  if (report.missingRoles.length || report.missingSkills.length) {
    console.warn('Reconciliation report (review before client demo):');
    console.warn(JSON.stringify(report, null, 2));
  }

  for (const dep of allDependencies) {
    const standardId = dep.standardId;
    await prisma.standard.upsert({
      where: { id: standardId },
      create: {
        id: standardId,
        name: standardId === 'gds' ? 'GDS Service Standard' : 'Digital Service Standard for Wales',
        jurisdiction: standardId === 'gds' ? 'England' : 'Wales',
      },
      update: {},
    });

    await prisma.standardPoint.upsert({
      where: { id: dep.key },
      create: {
        id: dep.key,
        standardId,
        number: dep.number,
        title: dep.title,
        category: dep.category ?? null,
        description: dep.rationale,
        evidenceTypes: dep.evidenceTypes,
        phaseEmphasis: dep.phaseEmphasis,
        compositionDriven: dep.compositionDriven ?? false,
        statutoryNote: dep.statutoryNote ?? null,
      },
      update: {
        title: dep.title,
        category: dep.category ?? null,
        description: dep.rationale,
        evidenceTypes: dep.evidenceTypes,
        phaseEmphasis: dep.phaseEmphasis,
        compositionDriven: dep.compositionDriven ?? false,
        statutoryNote: dep.statutoryNote ?? null,
      },
    });

    await prisma.standardPointRoleDep.deleteMany({ where: { pointId: dep.key } });
    await prisma.standardPointSkillDep.deleteMany({ where: { pointId: dep.key } });

    for (const r of dep.roles) {
      await prisma.standardPointRoleDep.create({
        data: {
          pointId: dep.key,
          roleId: r.role,
          weight: r.weight,
          minSeniorityRank: seniorityRank(r.minSeniority),
        },
      });
    }

    for (const s of dep.skills) {
      await prisma.standardPointSkillDep.create({
        data: {
          pointId: dep.key,
          skillId: s.skill,
          minLevel: s.minLevel,
          weight: s.weight,
        },
      });
    }
  }

  const points = await loadCurrentPointSnapshots(prisma);
  const hash = hashFrameworkPoints(points);
  const existing = await prisma.frameworkVersion.findFirst({
    where: { versionLabel: 'Initial dependency map baseline' },
  });
  if (!existing) {
    await prisma.frameworkVersion.create({
      data: {
        source: 'assemble-standards-map',
        versionLabel: 'Initial dependency map baseline',
        notes: serializeBaselineSnapshot(points),
      },
    });
    console.log(`Recorded framework baseline (${points.length} points, hash ${hash.slice(0, 12)}…).`);
  }

  console.log('Seeded standards and dependency mappings.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
