import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { ensureFixtureCsvs } from './seed-fixtures';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  ensureFixtureCsvs();
  try {
    execSync('npm run ingest', { stdio: 'inherit' });
  } catch {
    console.warn('Ingest had issues; continuing with any existing data.');
  }
  try {
    execSync('npm run seed:standards', { stdio: 'inherit' });
  } catch (e) {
    console.warn(e);
  }

  const org = await prisma.organisation.upsert({
    where: { id: 'demo-org' },
    create: { id: 'demo-org', name: 'Amplified Demo' },
    update: {},
  });

  const passwordHash = await bcrypt.hash('demo-password', 10);
  await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    create: {
      email: 'admin@demo.local',
      name: 'Demo Admin',
      role: 'admin',
      orgId: org.id,
      passwordHash,
    },
    update: { passwordHash, role: 'admin' },
  });

  const engagement = await prisma.engagement.upsert({
    where: { id: 'nrw-demo' },
    create: {
      id: 'nrw-demo',
      name: 'NRW regulatory permitting service (discovery)',
      standardId: 'wales',
      orgId: org.id,
    },
    update: {},
  });

  const serviceOwnerLevel = await prisma.roleLevel.findFirst({
    where: { roleId: 'service-owner' },
  });
  const userResearcherLevel = await prisma.roleLevel.findFirst({
    where: { roleId: 'user-researcher' },
  });

  const requirement = await prisma.requirement.upsert({
    where: { id: 'nrw-req-1' },
    create: {
      id: 'nrw-req-1',
      engagementId: engagement.id,
      title: 'Discovery requirement',
      phase: 'discovery',
      outcome: 'Understand user needs for regulatory permitting in Wales.',
      channels: ['web', 'phone'],
      sensitivity: 'official',
    },
    update: {},
  });

  await prisma.requirementRole.deleteMany({ where: { requirementId: requirement.id } });
  if (serviceOwnerLevel) {
    await prisma.requirementRole.create({
      data: { requirementId: requirement.id, roleLevelId: serviceOwnerLevel.id, weight: 1 },
    });
  }
  if (userResearcherLevel) {
    await prisma.requirementRole.create({
      data: { requirementId: requirement.id, roleLevelId: userResearcherLevel.id, weight: 1 },
    });
  }

  await prisma.personSkill.deleteMany({
    where: { person: { engagementId: engagement.id } },
  });
  await prisma.assignment.deleteMany({
    where: { requirementId: requirement.id },
  });
  await prisma.person.deleteMany({ where: { engagementId: engagement.id } });

  const owner = await prisma.person.create({
    data: {
      engagementId: engagement.id,
      displayName: 'Alex Morgan (Service owner)',
      isVacancy: false,
      skills: {
        create: [
          { skillId: 'strategic-ownership', level: 'awareness' },
          { skillId: 'stakeholder-relationship-management', level: 'working' },
          { skillId: 'life-cycle-management', level: 'awareness' },
        ],
      },
    },
  });

  const researcher = await prisma.person.create({
    data: {
      engagementId: engagement.id,
      displayName: 'Sam Jones (User researcher)',
      isVacancy: false,
      skills: {
        create: [
          { skillId: 'user-research', level: 'working' },
          { skillId: 'user-centred-practice-and-advocacy', level: 'awareness' },
        ],
      },
    },
  });

  if (serviceOwnerLevel) {
    await prisma.assignment.create({
      data: {
        requirementId: requirement.id,
        personId: owner.id,
        roleLevelId: serviceOwnerLevel.id,
      },
    });
  }
  if (userResearcherLevel) {
    await prisma.assignment.create({
      data: {
        requirementId: requirement.id,
        personId: researcher.id,
        roleLevelId: userResearcherLevel.id,
      },
    });
  }

  await prisma.tender.deleteMany({ where: { engagementId: engagement.id } });
  const tender = await prisma.tender.create({
    data: {
      engagementId: engagement.id,
      title: 'NRW discovery capability (quality)',
      buyer: 'Natural Resources Wales',
      route: 'Digital Outcomes',
      qualityWeight: 0.7,
      priceWeight: 0.3,
      scoringScaleMax: 5,
      questions: {
        create: [
          {
            ref: 'Q1',
            text: 'Team and capability to deliver discovery in Wales.',
            weight: 1,
            category: 'capability',
            roleDeps: {
              create: [{ roleId: 'user-researcher', weight: 1, minSeniorityRank: 0 }],
            },
            skillDeps: {
              create: [{ skillId: 'user-research', minLevel: 'practitioner', weight: 1 }],
            },
          },
        ],
      },
    },
  });

  await prisma.evidence.create({
    data: {
      engagementId: engagement.id,
      title: 'Discovery research plan (draft)',
      type: 'research plan',
      strength: 'documented',
      links: { create: [] },
    },
  });

  await prisma.constraint.upsert({
    where: { id: 'nrw-constraint' },
    create: {
      id: 'nrw-constraint',
      requirementId: requirement.id,
      budgetCap: 120000,
      internalRatePerDay: 550,
      partnerRatePerDay: 850,
    },
    update: { budgetCap: 120000 },
  });

  console.log(
    `Seeded demo org, admin@demo.local / demo-password, NRW engagement, tender ${tender.id}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
