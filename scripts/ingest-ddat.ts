import { createHash } from 'node:crypto';
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

function fileHash(filePath: string): string {
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function col(row: Record<string, string>, ...names: string[]): string {
  for (const name of names) {
    const value = row[name];
    if (value) return value;
  }
  return '';
}

async function recordSkillAlias(skillId: string, previousName: string, note?: string) {
  const alias = slugify(previousName);
  if (!alias || alias === skillId) return;
  const current = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!current) return;
  await prisma.skillAlias.upsert({
    where: { alias },
    create: {
      alias,
      skillId,
      note: note ?? `Renamed from ${previousName}`,
    },
    update: {
      skillId,
      note: note ?? `Renamed from ${previousName}`,
    },
  });
}

async function ingestRolesCsv(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rows = parse(content, { columns: true, skip_empty_lines: true, trim: true }) as Record<
    string,
    string
  >[];

  for (const row of rows) {
    const groupName = col(row, 'role family', 'Role family');
    const roleName = col(row, 'role', 'Role');
    const roleDesc = col(row, 'role description', 'Role description');
    const levelName = col(row, 'role level', 'Role level');
    const levelDesc = col(row, 'role level description', 'Role level description');
    const skillName = col(row, 'skill name', 'Skill name');
    const skillDesc = col(row, 'skill description', 'Skill description');
    const skillLevel = (col(row, 'skill level', 'Skill level') || 'working').toLowerCase();
    const roleType = col(row, 'role type', 'Role type');

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
    const skillName = col(row, 'skill name', 'Skill name');
    if (!skillName) continue;
    const skillId = slugify(skillName);
    await prisma.skill.upsert({
      where: { id: skillId },
      create: {
        id: skillId,
        name: skillName,
        description: col(row, 'skill description', 'Skill description'),
        awareness: col(row, 'awareness', 'Awareness') || null,
        working: col(row, 'working', 'Working') || null,
        practitioner: col(row, 'practitioner', 'Practitioner') || null,
        expert: col(row, 'expert', 'Expert') || null,
      },
      update: {
        name: skillName,
        description: col(row, 'skill description', 'Skill description'),
        awareness: col(row, 'awareness', 'Awareness') || null,
        working: col(row, 'working', 'Working') || null,
        practitioner: col(row, 'practitioner', 'Practitioner') || null,
        expert: col(row, 'expert', 'Expert') || null,
      },
    });

    const previous = col(
      row,
      'previous skill name',
      'Previous skill name',
      'former name',
      'Former name',
      'old skill name',
      'Old skill name',
      'previous name',
      'Previous name',
    );
    if (previous) await recordSkillAlias(skillId, previous);
  }
}

async function ingestChangeNotes(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rows = parse(content, { columns: true, skip_empty_lines: true, trim: true }) as Record<
    string,
    string
  >[];

  for (const row of rows) {
    const previous = col(
      row,
      'previous skill name',
      'Previous skill name',
      'old skill name',
      'Old skill name',
      'former name',
      'Former name',
      'from',
      'From',
    );
    const nextName = col(
      row,
      'new skill name',
      'New skill name',
      'skill name',
      'Skill name',
      'to',
      'To',
    );
    const change = col(row, 'change type', 'Change type', 'change', 'Change').toLowerCase();
    if (!previous || !nextName) continue;
    if (change && !change.includes('renam') && !change.includes('merg') && change !== '') {
      if (!change.includes('replace')) continue;
    }
    await recordSkillAlias(slugify(nextName), previous, `Change notes: ${previous} → ${nextName}`);
  }
}

async function pinFramework(rolesPath: string, skillsPath: string | null) {
  const versionFile = path.join(sourceDir, 'VERSION');
  const sourceDate = fs.existsSync(versionFile)
    ? fs.statSync(versionFile).mtime
    : fs.existsSync(skillsPath ?? '')
      ? fs.statSync(skillsPath as string).mtime
      : fs.statSync(rolesPath).mtime;
  const versionLabel = fs.existsSync(versionFile)
    ? fs.readFileSync(versionFile, 'utf8').trim().split('\n')[0] || sourceDate.toISOString().slice(0, 10)
    : sourceDate.toISOString().slice(0, 10);

  const sourceFiles = [path.basename(rolesPath)];
  if (skillsPath) sourceFiles.push(path.basename(skillsPath));

  await prisma.capabilityFrameworkPin.create({
    data: {
      versionLabel,
      sourceDate,
      rolesCsvHash: fileHash(rolesPath),
      skillsCsvHash: skillsPath ? fileHash(skillsPath) : null,
      sourceFiles,
      notes:
        'Government Digital and Data Profession Capability Framework ingest. Historic skill ids remain via skill_aliases.',
    },
  });
  console.log(`Pinned framework version ${versionLabel} (${sourceDate.toISOString().slice(0, 10)})`);
}

async function main() {
  const rolesPath = path.join(sourceDir, 'roles.csv');
  const skillsPath = path.join(sourceDir, 'skills.csv');
  const changeNotesPath = path.join(sourceDir, 'change-notes.csv');

  if (!fs.existsSync(rolesPath)) {
    console.warn(
      'No roles.csv in data/source; skipping capability-framework ingest. Add official CSVs or use seed fixtures.',
    );
    return;
  }

  await ingestRolesCsv(rolesPath);
  console.log('Ingested roles.csv');

  if (fs.existsSync(skillsPath)) {
    await ingestSkillsCsv(skillsPath);
    console.log('Ingested skills.csv');
  }

  if (fs.existsSync(changeNotesPath)) {
    await ingestChangeNotes(changeNotesPath);
    console.log('Ingested change-notes.csv aliases');
  }

  await pinFramework(rolesPath, fs.existsSync(skillsPath) ? skillsPath : null);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
