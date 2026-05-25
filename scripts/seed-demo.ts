import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { runAndPersistAnalysis } from '../lib/db/analysis';
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

  const deploymentMode =
    process.env.DEPLOYMENT_MODE === 'client' || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'client'
      ? 'client'
      : 'internal';
  const org = await prisma.organisation.upsert({
    where: { id: 'demo-org' },
    create: { id: 'demo-org', name: 'Turner & Townsend Demo', deploymentMode },
    update: { deploymentMode },
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
      supplierTag: 'Turner & Townsend Demo',
      lotTag: 'Lot 1 Digital delivery',
    },
    update: {
      supplierTag: 'Turner & Townsend Demo',
      lotTag: 'Lot 1 Digital delivery',
    },
  });

  await prisma.engagement.upsert({
    where: { id: 'nrw-demo-2' },
    create: {
      id: 'nrw-demo-2',
      name: 'NRW biodiversity data platform (alpha)',
      standardId: 'wales',
      orgId: org.id,
      supplierTag: 'Partner Co',
      lotTag: 'Lot 2 Data',
    },
    update: {
      supplierTag: 'Partner Co',
      lotTag: 'Lot 2 Data',
    },
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
      title: 'Call-off: regulatory permitting discovery (mini-competition)',
      buyer: 'Natural Resources Wales',
      route: 'NRW DDaT Framework call-off',
      qualityWeight: 0.5,
      priceWeight: 0.5,
      scoringScaleMax: 5,
      questions: {
        create: [
          {
            ref: 'C1',
            text: 'Team and capability to deliver this discovery service against the Wales standard.',
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

  await prisma.outcome.upsert({
    where: { id: 'nrw-outcome-1' },
    create: {
      id: 'nrw-outcome-1',
      requirementId: requirement.id,
      event: 'assessment',
      result: 'partial',
      phase: 'discovery',
      notes: 'Demo benchmark: statutory Welsh language gaps remain.',
    },
    update: {},
  });

  const engagement2 = await prisma.engagement.findUnique({ where: { id: 'nrw-demo-2' } });
  if (engagement2) {
    await prisma.requirement.upsert({
      where: { id: 'nrw-req-2' },
      create: {
        id: 'nrw-req-2',
        engagementId: engagement2.id,
        title: 'Alpha requirement',
        phase: 'alpha',
        outcome: 'Prototype biodiversity reporting APIs.',
        channels: ['web'],
        sensitivity: 'official',
      },
      update: {},
    });
  }

  const analysis = await runAndPersistAnalysis(requirement.id);
  if (analysis) {
    console.log(
      `Initial analysis: preparedness ${Math.round(analysis.overallReadiness)}% (${analysis.readinessBand}).`,
    );
  }

  console.log(
    `Seeded demo org, admin@demo.local / demo-password, NRW engagements, tender ${tender.id}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
