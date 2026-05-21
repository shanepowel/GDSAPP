import { prisma } from '@/lib/db/client';
import { runAnalysis } from '@/lib/engine';
import type { AnalysisInput, AnalysisResult } from '@/lib/types/analysis';
import type { Phase, StandardId } from '@/lib/engine/standards-dependency-map';

export async function buildAnalysisInput(requirementId: string): Promise<AnalysisInput | null> {
  const requirement = await prisma.requirement.findUnique({
    where: { id: requirementId },
    include: {
      engagement: true,
      roles: true,
      assignments: true,
    },
  });
  if (!requirement) return null;

  const people = await prisma.person.findMany({
    where: { engagementId: requirement.engagementId },
    include: { skills: true },
  });

  const roleLevelIds = [
    ...requirement.roles.map((r) => r.roleLevelId),
    ...requirement.assignments.map((a) => a.roleLevelId),
  ];
  const uniqueRoleLevelIds = [...new Set(roleLevelIds)];

  const roleLevels = await prisma.roleLevel.findMany({
    where: { id: { in: uniqueRoleLevelIds } },
    include: {
      role: true,
      skills: { include: { skill: true } },
    },
  });

  const standard = await prisma.standard.findUnique({
    where: { id: requirement.engagement.standardId },
    include: {
      points: {
        include: { roleDeps: true, skillDeps: true },
        orderBy: { number: 'asc' },
      },
    },
  });
  if (!standard) return null;

  const allRoles = await prisma.role.findMany();
  const rolesById = new Map(allRoles.map((r) => [r.id, { id: r.id, name: r.name }]));

  return {
    phase: requirement.phase as Phase,
    standardId: requirement.engagement.standardId as StandardId,
    requirementRoles: requirement.roles.map((r) => ({
      roleLevelId: r.roleLevelId,
      weight: r.weight,
    })),
    people: people.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      isVacancy: p.isVacancy,
      skills: p.skills.map((s) => ({ skillId: s.skillId, level: s.level as AnalysisInput['people'][0]['skills'][0]['level'] })),
    })),
    assignments: requirement.assignments.map((a) => ({
      personId: a.personId,
      roleLevelId: a.roleLevelId,
    })),
    roleLevels: roleLevels.map((rl) => ({
      id: rl.id,
      roleId: rl.roleId,
      roleName: rl.role.name,
      levelName: rl.name,
      seniorityRank: rl.seniorityRank,
      skills: rl.skills.map((s) => ({
        skillId: s.skillId,
        skillName: s.skill.name,
        requiredLevel: s.requiredLevel as AnalysisInput['roleLevels'][0]['skills'][0]['requiredLevel'],
      })),
    })),
    standardPoints: standard.points.map((p) => ({
      id: p.id,
      number: p.number,
      title: p.title,
      category: p.category,
      compositionDriven: p.compositionDriven,
      statutoryNote: p.statutoryNote,
      evidenceTypes: p.evidenceTypes,
      phaseEmphasis: p.phaseEmphasis as Phase[],
      roleDeps: p.roleDeps.map((d) => ({
        roleId: d.roleId,
        weight: d.weight,
        minSeniorityRank: d.minSeniorityRank,
      })),
      skillDeps: p.skillDeps.map((d) => ({
        skillId: d.skillId,
        minLevel: d.minLevel as AnalysisInput['standardPoints'][0]['skillDeps'][0]['minLevel'],
        weight: d.weight,
      })),
    })),
    rolesById,
  };
}

export async function runAndPersistAnalysis(requirementId: string): Promise<AnalysisResult | null> {
  const input = await buildAnalysisInput(requirementId);
  if (!input) return null;
  const result = runAnalysis(input);
  await prisma.analysisRun.create({
    data: {
      requirementId,
      overallReadiness: result.overallReadiness,
      readinessBand: result.readinessBand,
      result: result as object,
    },
  });
  return result;
}
