import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { runAndPersistAnalysis } from '../lib/db/analysis';
import { ensureFixtureCsvs } from './seed-fixtures';
import { execSync } from 'child_process';
import { ORG_TEMPLATES } from '../lib/org-design/templates';
import { applyTemplateToLive } from '../lib/org-design/storage';
import {
  autoMatchCapabilityLinks,
  computeAndSnapshotIndex,
} from '../lib/assurance/scoring-load';

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
  try {
    execSync('npm run seed:catalog', { stdio: 'inherit' });
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

  const passwordHash = await bcrypt.hash('demo-password', 8);
  const admin = await prisma.user.upsert({
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
      reference: 'NRW-DISC-01',
      standardId: 'wales',
      clientOrg: 'Natural Resources Wales',
      sector: 'digital-service',
      serviceName: 'Regulatory permitting',
      phase: 'discovery',
      mode: 'bid',
      ownerId: admin.id,
      orgId: org.id,
      supplierTag: 'Turner & Townsend Demo',
      lotTag: 'Lot 1 Digital delivery',
    },
    update: {
      reference: 'NRW-DISC-01',
      clientOrg: 'Natural Resources Wales',
      sector: 'digital-service',
      serviceName: 'Regulatory permitting',
      phase: 'discovery',
      mode: 'bid',
      ownerId: admin.id,
      supplierTag: 'Turner & Townsend Demo',
      lotTag: 'Lot 1 Digital delivery',
    },
  });

  await prisma.engagement.upsert({
    where: { id: 'nrw-demo-2' },
    create: {
      id: 'nrw-demo-2',
      name: 'NRW biodiversity data platform (alpha)',
      reference: 'NRW-ALPHA-02',
      standardId: 'wales',
      clientOrg: 'Natural Resources Wales',
      sector: 'digital-service',
      serviceName: 'Biodiversity data platform',
      phase: 'alpha',
      mode: 'mobilise',
      ownerId: admin.id,
      orgId: org.id,
      supplierTag: 'Partner Co',
      lotTag: 'Lot 2 Data',
    },
    update: {
      reference: 'NRW-ALPHA-02',
      clientOrg: 'Natural Resources Wales',
      sector: 'digital-service',
      serviceName: 'Biodiversity data platform',
      phase: 'alpha',
      mode: 'mobilise',
      ownerId: admin.id,
      supplierTag: 'Partner Co',
      lotTag: 'Lot 2 Data',
    },
  });

  const walesVersion = await prisma.catalogStandardVersion.findFirst({
    where: { status: 'current', standard: { code: 'wales-dss' } },
  });
  if (walesVersion) {
    for (const engagementId of ['nrw-demo', 'nrw-demo-2']) {
      await prisma.engagementStandard.upsert({
        where: {
          engagementId_standardVersionId: {
            engagementId,
            standardVersionId: walesVersion.id,
          },
        },
        create: {
          engagementId,
          standardVersionId: walesVersion.id,
          isPrimary: true,
        },
        update: { isPrimary: true },
      });
    }
  }

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
          { skillId: 'strategic-ownership', level: 'practitioner' },
          { skillId: 'stakeholder-relationship-management', level: 'working' },
          { skillId: 'life-cycle-management', level: 'working' },
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
          { skillId: 'user-research', level: 'practitioner' },
          { skillId: 'user-centred-practice-and-advocacy', level: 'working' },
        ],
      },
    },
  });

  const designer = await prisma.person.create({
    data: {
      engagementId: engagement.id,
      displayName: 'Priya Shah (Interaction designer)',
      isVacancy: false,
      skills: {
        create: [
          { skillId: 'iterative-design', level: 'working' },
          { skillId: 'designing-for-everyone', level: 'awareness' },
          { skillId: 'user-centred-practice-and-advocacy', level: 'awareness' },
        ],
      },
    },
  });

  await prisma.person.create({
    data: {
      engagementId: engagement.id,
      displayName: 'Vacancy — Developer',
      isVacancy: true,
      skills: { create: [] },
    },
  });
  void designer;

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

  // Seed GDS service-team org design on the demo org
  const existingEntities = await prisma.designEntity.count({ where: { orgId: org.id } });
  if (existingEntities === 0) {
    const gdsTemplate = ORG_TEMPLATES.find((t) => t.id === 'gds-service-team');
    if (gdsTemplate) {
      const result = await applyTemplateToLive(prisma, org.id, gdsTemplate);
      console.log(
        `Seeded org design template "${gdsTemplate.name}" (${result.entitiesCreated} entities).`,
      );
    }
  }

  // Bind NRW demo engagement to live design
  await prisma.engagement.update({
    where: { id: engagement.id },
    data: { designBinding: 'live' },
  });

  await seedAssuranceDemo(prisma, {
    engagementId: engagement.id,
    adminUserId: admin.id,
    orgId: org.id,
  });

  console.log(
    `Seeded demo org, admin@demo.local / demo-password, NRW engagements, tender ${tender.id}.`,
  );
}

async function seedAssuranceDemo(
  db: PrismaClient,
  opts: { engagementId: string; adminUserId: string; orgId: string },
) {
  const listed = await db.criterion.findMany({
    where: {
      standardVersion: {
        engagements: { some: { engagementId: opts.engagementId, isPrimary: true } },
        status: 'current',
      },
      phases: { has: 'discovery' },
    },
    orderBy: { sortOrder: 'asc' },
  });

  if (listed.length === 0) {
    console.warn('No discovery criteria bound — skip assurance demo seed.');
    return;
  }

  await db.criterionJudgement.deleteMany({ where: { engagementId: opts.engagementId } });
  await db.assuranceEvidence.deleteMany({ where: { engagementId: opts.engagementId } });
  await db.capabilityLink.deleteMany({ where: { engagementId: opts.engagementId } });
  await db.indexSnapshot.deleteMany({ where: { engagementId: opts.engagementId } });

  const byRef = new Map(listed.map((c) => [c.ref, c]));
  const rationale =
    'Demo seed judgement for the NRW discovery walkthrough. Evidence and team shape support this verdict for panel rehearsal.';

  const verdictPlan: Array<{ ref: string; verdict: 'met' | 'at-risk' | 'not-met' }> = [
    { ref: '1', verdict: 'met' },
    { ref: '2', verdict: 'at-risk' },
    { ref: '3', verdict: 'met' },
    { ref: '6', verdict: 'met' },
    { ref: '7', verdict: 'at-risk' },
    { ref: '9', verdict: 'met' },
    { ref: '11', verdict: 'not-met' },
  ];

  for (const row of verdictPlan) {
    const criterion = byRef.get(row.ref);
    if (!criterion) continue;
    await db.criterionJudgement.create({
      data: {
        engagementId: opts.engagementId,
        criterionId: criterion.id,
        verdict: row.verdict,
        rationale: `${rationale} Point ${row.ref}.`,
        proposedBy: 'human',
        proposedByUserId: opts.adminUserId,
        confirmedByUserId: opts.adminUserId,
      },
    });
  }

  const evidenceDefs: Array<{
    title: string;
    kind: string;
    refs: string[];
    daysToExpiry: number | null;
  }> = [
    {
      title: 'User research plan — permitting journeys (EN/CY)',
      kind: 'research',
      refs: ['1', '3'],
      daysToExpiry: 60,
    },
    {
      title: 'Welsh language impact assessment (draft)',
      kind: 'document',
      refs: ['2'],
      daysToExpiry: 20,
    },
    {
      title: 'Service owner mandate and RACI',
      kind: 'decision',
      refs: ['6'],
      daysToExpiry: 90,
    },
    {
      title: 'Multidisciplinary team roster (current sprint)',
      kind: 'document',
      refs: ['7'],
      daysToExpiry: 14,
    },
    {
      title: 'Public roadmap published on NRW digital blog',
      kind: 'metric',
      refs: ['9'],
      daysToExpiry: 45,
    },
    {
      title: 'DPIA kickoff notes — privacy risks outstanding',
      kind: 'document',
      refs: ['11'],
      daysToExpiry: 10,
    },
  ];

  const now = Date.now();
  for (const def of evidenceDefs) {
    const criterionIds = def.refs
      .map((ref) => byRef.get(ref)?.id)
      .filter((id): id is string => Boolean(id));
    if (!criterionIds.length) continue;
    await db.assuranceEvidence.create({
      data: {
        engagementId: opts.engagementId,
        title: def.title,
        kind: def.kind,
        uri: null,
        producedAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
        expiresAt:
          def.daysToExpiry == null
            ? null
            : new Date(now + def.daysToExpiry * 24 * 60 * 60 * 1000),
        confidentiality: 'client',
        provenance: 'manual',
        createdByUserId: opts.adminUserId,
        criteria: { create: criterionIds.map((criterionId) => ({ criterionId })) },
      },
    });
  }

  const match = await autoMatchCapabilityLinks(db, opts.orgId, opts.engagementId);
  const scored = await computeAndSnapshotIndex(db, opts.engagementId, 'demo-seed');
  console.log(
    `Assurance demo: ${verdictPlan.length} judgements, ${evidenceDefs.length} evidence rows, ` +
      `${match.created} capability links, index ${scored.index ?? '—'} (${scored.confidence}).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
