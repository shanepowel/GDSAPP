import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { slugify } from '../lib/utils/slug';

const prisma = new PrismaClient();
const sourceDir = path.join(process.cwd(), 'data', 'source');

function seniorityFromLevelName(name: string): number {
  const n = name.toLowerCase();
  if (n.includes('lead') || n.includes('principal') || n.includes('head')) return 3;
  if (n.includes('senior') || n.includes('scs')) return 2;
  if (n.includes('associate') || n.includes('junior')) return 1;
  return 1;
}

async function ingestRolesCsv(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rows = parse(content, { columns: true, skip_empty_lines: true, trim: true }) as Record<
    string,
    string
  >[];

  for (const row of rows) {
    const groupName = row['role family'] ?? row['Role family'];
    const roleName = row['role'] ?? row['Role'];
    const roleDesc = row['role description'] ?? row['Role description'] ?? '';
    const levelName = row['role level'] ?? row['Role level'];
    const levelDesc = row['role level description'] ?? row['Role level description'] ?? '';
    const skillName = row['skill name'] ?? row['Skill name'];
    const skillDesc = row['skill description'] ?? row['Skill description'] ?? '';
    const skillLevel = (row['skill level'] ?? row['Skill level'] ?? 'working').toLowerCase();
    const roleType = row['role type'] ?? row['Role type'];

    if (!groupName || !roleName || !levelName || !skillName) continue;

    const groupId = slugify(groupName);
    const roleId = slugify(roleName);
    const levelId = `${roleId}-${slugify(levelName)}`;
    const skillId = slugify(skillName);

    await prisma.roleGroup.upsert({
      where: { id: groupId },
      create: { id: groupId, name: groupName },
      update: { name: groupName },
    });

    await prisma.role.upsert({
      where: { id: roleId },
      create: { id: roleId, name: roleName, description: roleDesc, groupId },
      update: { name: roleName, description: roleDesc },
    });

    await prisma.roleLevel.upsert({
      where: { id: levelId },
      create: {
        id: levelId,
        name: levelName,
        description: levelDesc,
        roleId,
        roleType: roleType || null,
        seniorityRank: seniorityFromLevelName(levelName),
      },
      update: {
        name: levelName,
        description: levelDesc,
        roleType: roleType || null,
        seniorityRank: seniorityFromLevelName(levelName),
      },
    });

    await prisma.skill.upsert({
      where: { id: skillId },
      create: { id: skillId, name: skillName, description: skillDesc },
      update: { name: skillName, description: skillDesc },
    });

    await prisma.roleLevelSkill.upsert({
      where: { roleLevelId_skillId: { roleLevelId: levelId, skillId } },
      create: { roleLevelId: levelId, skillId, requiredLevel: skillLevel },
      update: { requiredLevel: skillLevel },
    });
  }
}

async function ingestSkillsCsv(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rows = parse(content, { columns: true, skip_empty_lines: true, trim: true }) as Record<
    string,
    string
  >[];

  for (const row of rows) {
    const skillName = row['skill name'] ?? row['Skill name'];
    if (!skillName) continue;
    const skillId = slugify(skillName);
    await prisma.skill.upsert({
      where: { id: skillId },
      create: {
        id: skillId,
        name: skillName,
        description: row['skill description'] ?? row['Skill description'] ?? '',
        awareness: row['awareness'] ?? row['Awareness'],
        working: row['working'] ?? row['Working'],
        practitioner: row['practitioner'] ?? row['Practitioner'],
        expert: row['expert'] ?? row['Expert'],
      },
      update: {
        name: skillName,
        description: row['skill description'] ?? row['Skill description'] ?? '',
        awareness: row['awareness'] ?? row['Awareness'],
        working: row['working'] ?? row['Working'],
        practitioner: row['practitioner'] ?? row['Practitioner'],
        expert: row['expert'] ?? row['Expert'],
      },
    });
  }
}

async function main() {
  const rolesPath = path.join(sourceDir, 'roles.csv');
  const skillsPath = path.join(sourceDir, 'skills.csv');

  if (!fs.existsSync(rolesPath)) {
    console.warn('No roles.csv in data/source; skipping DDaT ingest. Add official CSVs or use seed fixtures.');
    return;
  }

  await ingestRolesCsv(rolesPath);
  console.log('Ingested roles.csv');

  if (fs.existsSync(skillsPath)) {
    await ingestSkillsCsv(skillsPath);
    console.log('Ingested skills.csv');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
