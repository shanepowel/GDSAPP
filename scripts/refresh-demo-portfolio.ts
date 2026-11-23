/**
 * Gives the demo organisation a believable portfolio: engagements at different stages,
 * each with its own method, squad shape, status and story, and confirmed squads where a
 * real engagement would have one.
 *
 * Runs once per DEMO_PORTFOLIO_VERSION from the deploy seed, so edits made in the demo
 * after that are kept. Bump the version to reload.
 */
import type { PrismaClient } from '@prisma/client';
import { DEMO_ACCOUNT } from '../lib/demo/demo-account';
import { archetypeSlugForPhase } from '../lib/labels';
import { DATUM_LINE } from '../lib/product.config';

export const DEMO_PORTFOLIO_VERSION = '2';
const CONFIG_KEY = 'demo.portfolioVersion';
const DAY = 86_400_000;

function day(offset: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + offset * DAY);
}

function monthsAgo(n: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n, 1));
}

const SPRINT_ZERO = ['charter', 'governance', 'environments', 'pipeline', 'wiki', 'outcomes', 'backlog', 'spikes', 'plan', 'raid', 'change'];
const DATA_PACK = [
  'dap-requirements', 'dap-wireframe', 'dap-quality', 'dap-normalisation', 'dap-model',
  'dap-access', 'dap-environments', 'dap-testing', 'dap-versioning', 'dap-dictionary',
];

type Measures = Array<[number, number, number, number]>;

async function resetSpine(prisma: PrismaClient, engagementId: string) {
  await prisma.$transaction([
    prisma.engagementChecklistItem.deleteMany({ where: { engagementId } }),
    prisma.engagementMilestone.deleteMany({ where: { engagementId } }),
    prisma.raidItem.deleteMany({ where: { engagementId } }),
    prisma.changeRequest.deleteMany({ where: { engagementId } }),
    prisma.decisionRecord.deleteMany({ where: { engagementId } }),
    prisma.engagementMeasure.deleteMany({ where: { engagementId } }),
  ]);
}

async function checklist(prisma: PrismaClient, engagementId: string, stage: string, keys: string[], doneCount: number, start: number) {
  for (const [index, key] of keys.entries()) {
    const done = index < doneCount;
    await prisma.engagementChecklistItem.create({
      data: {
        engagementId,
        stage,
        itemKey: key,
        title: key,
        sortOrder: index + 1,
        done,
        doneAt: done ? day(start + index * 3) : null,
        dueOn: done ? null : day(start + index * 3),
      },
    });
  }
}

async function measures(prisma: PrismaClient, engagementId: string, rows: Measures) {
  for (const [index, [predictability, quality, teamHealth, clientSatisfaction]] of rows.entries()) {
    await prisma.engagementMeasure.create({
      data: { engagementId, period: monthsAgo(rows.length - 1 - index), predictability, quality, teamHealth, clientSatisfaction },
    });
  }
}

/**
 * Confirms a squad from the best people above the fit line for each core role, using the
 * archetype the engagement's stage calls for. Each person fills one role at most.
 */
async function confirmSquad(prisma: PrismaClient, engagementId: string, phase: string, adminUserId: string) {
  const slug = archetypeSlugForPhase(phase);
  if (!slug) return 0;
  const archetype = await prisma.roleArchetype.findFirst({
    where: { orgId: DEMO_ACCOUNT.orgId, slug, archivedAt: null },
    orderBy: { version: 'desc' },
    include: { roles: true },
  });
  if (!archetype) return 0;
  await prisma.squadProposal.updateMany({
    where: { engagementId, status: 'confirmed' },
    data: { status: 'superseded' },
  });
  const used = new Set<string>();
  const assignments: Array<{ archetypeRoleId: string; personId: string; fitScoreId: string; fteAllocated: number }> = [];
  for (const role of archetype.roles) {
    const best = await prisma.fitScore.findFirst({
      where: { engagementId, archetypeRoleId: role.id, compositeScore: { gte: DATUM_LINE }, personId: { notIn: [...used] } },
      orderBy: { compositeScore: 'desc' },
    });
    if (!best) continue;
    used.add(best.personId);
    assignments.push({ archetypeRoleId: role.id, personId: best.personId, fitScoreId: best.id, fteAllocated: role.criticality === 'core' ? 1 : 0.5 });
  }
  await prisma.squadProposal.create({
    data: {
      engagementId,
      archetypeId: archetype.id,
      status: 'confirmed',
      confirmedByUserId: adminUserId,
      confirmedAt: day(-30),
      assignments: { create: assignments },
    },
  });
  return assignments.length;
}

async function dvla(prisma: PrismaClient, adminUserId: string) {
  const id = 'gds-demo';
  if (!(await prisma.engagement.findUnique({ where: { id } }))) return;
  await resetSpine(prisma, id);
  await prisma.engagement.update({
    where: { id },
    data: {
      name: 'DVLA driving licence renewal',
      phase: 'beta',
      deliveryMethod: 'agile',
      squadShape: 'software',
      marketSector: 'public',
      commercialModel: 'time-materials',
      scopeClear: true,
      maturityLevel: 'assured',
      outcomes: 'Drivers renew a photocard licence online in under 10 minutes.\n90% of renewals complete without a call to the contact centre.',
      startsOn: day(-240),
      endsOn: day(120),
      steeringChair: 'Priya Shah, Service Owner',
      steeringFrequency: 'monthly',
      steeringOn: day(12),
      steeringPackReady: true,
      clientProductOwner: 'Tom Griffiths',
      productOwnerDays: 4,
      deliveryStatus: null,
      deliveryStatusNote: null,
      recoveryPlan: null,
      goLiveOn: day(45),
      hasAftercare: true,
      reportDueOn: day(9),
      charterAgreedOn: day(-220),
      charterReviewOn: day(24),
    },
  });
  await checklist(prisma, id, 'sprint-zero', SPRINT_ZERO, SPRINT_ZERO.length, -230);
  await prisma.engagementMilestone.createMany({
    data: [
      { engagementId: id, name: 'Alpha assessment passed', dueOn: day(-120), proves: 'GDS alpha assessment met on all 14 points', paymentLinked: true, status: 'on-time' },
      { engagementId: id, name: 'Private beta with 500 drivers', dueOn: day(-20), proves: 'Completion rate above 85%', paymentLinked: true, status: 'on-time' },
      { engagementId: id, name: 'Public beta', dueOn: day(45), proves: 'Beta assessment passed and service live on GOV.UK', paymentLinked: true, status: 'on-time' },
    ],
  });
  await prisma.raidItem.createMany({
    data: [
      { engagementId: id, type: 'dependency', title: 'GOV.UK One Login integration for returning users', ownerName: 'Tom Griffiths', dueOn: day(20), status: 'open' },
      { engagementId: id, type: 'risk', title: 'Photo checking supplier contract ends before public beta', ownerName: 'Priya Shah', action: 'Extension requested', dueOn: day(30), status: 'open' },
    ],
  });
  await prisma.decisionRecord.createMany({
    data: [
      { engagementId: id, forum: 'Steering committee', decision: 'Proceed to public beta subject to the beta assessment', ownerName: 'Priya Shah', decidedOn: day(-18), confirmedAt: day(-17), confirmedById: adminUserId },
    ],
  });
  await prisma.changeRequest.createMany({
    data: [{ engagementId: id, ref: 'CR-004', description: 'Add Welsh language version of the renewal journey', status: 'assessed', createdAt: day(-60) }],
  });
  await measures(prisma, id, [
    [84, 0.6, 4.1, 4.2], [86, 0.5, 4.2, 4.3], [88, 0.4, 4.3, 4.4], [85, 0.5, 4.2, 4.4], [90, 0.3, 4.4, 4.5], [89, 0.4, 4.3, 4.6],
  ]);
  await confirmSquad(prisma, id, 'beta', adminUserId);
}

async function hs2(prisma: PrismaClient, adminUserId: string) {
  const id = 'hs2-demo';
  if (!(await prisma.engagement.findUnique({ where: { id } }))) return;
  await resetSpine(prisma, id);
  await prisma.engagement.update({
    where: { id },
    data: {
      name: 'HS2 station information management',
      phase: 'live',
      deliveryMethod: 'waterfall',
      squadShape: 'data',
      marketSector: 'infrastructure',
      commercialModel: 'fixed-price',
      scopeClear: true,
      maturityLevel: 'practising',
      outcomes: 'Asset information for four stations meets the ISO 19650 exchange requirements at each stage gate.\nThe golden thread is complete and accepted by the client at handover.',
      startsOn: day(-400),
      endsOn: day(200),
      steeringChair: 'Mark Ellis, Head of Information Management',
      steeringFrequency: 'monthly',
      steeringOn: day(6),
      steeringPackReady: false,
      clientProductOwner: 'Grace Adeyemi',
      productOwnerDays: 2,
      deliveryStatus: null,
      deliveryStatusNote: null,
      recoveryPlan:
        'The Old Oak Common model exchange is three weeks late because the design partner changed its classification codes.\n\nActions: agree a mapping table with the design partner (Grace Adeyemi, this week). Re-run validation and resubmit (squad, within two weeks).\n\nBack on plan by the next stage gate.',
      goLiveOn: day(-90),
      hasAftercare: true,
      reportDueOn: day(3),
      charterAgreedOn: day(-380),
      charterReviewOn: day(-5),
    },
  });
  await checklist(prisma, id, 'sprint-zero', SPRINT_ZERO, SPRINT_ZERO.length, -390);
  await checklist(prisma, id, 'data-pack', DATA_PACK, 9, -300);
  await prisma.engagementMilestone.createMany({
    data: [
      { engagementId: id, name: 'Curzon Street model exchange', dueOn: day(-60), proves: 'Model validates against the exchange information requirements', paymentLinked: true, status: 'on-time' },
      { engagementId: id, name: 'Old Oak Common model exchange', dueOn: day(-10), proves: 'Model validates against the exchange information requirements', paymentLinked: true, status: 'late' },
      { engagementId: id, name: 'Stage gate 4 information review', dueOn: day(35), proves: 'Gateway reviewer accepts the information pack', paymentLinked: true, status: 'at-risk' },
    ],
  });
  await prisma.raidItem.createMany({
    data: [
      { engagementId: id, type: 'issue', title: 'Design partner changed classification codes without notice', ownerName: 'Grace Adeyemi', action: 'Agree a mapping table', dueOn: day(4), status: 'open' },
      { engagementId: id, type: 'risk', title: 'Gate 4 review date may move if the exchange slips again', ownerName: 'Mark Ellis', dueOn: day(20), status: 'open' },
    ],
  });
  await prisma.decisionRecord.createMany({
    data: [
      { engagementId: id, forum: 'Steering committee', decision: 'Accept a three-week slip on the Old Oak Common exchange with a recovery plan', ownerName: 'Mark Ellis', decidedOn: day(-8) },
    ],
  });
  await prisma.changeRequest.createMany({
    data: [{ engagementId: id, ref: 'CR-011', description: 'Validate classification codes automatically on upload', status: 'submitted', createdAt: day(-3) }],
  });
  await measures(prisma, id, [
    [82, 0.7, 4.0, 4.1], [80, 0.8, 3.9, 4.0], [76, 1.1, 3.8, 3.8], [72, 1.3, 3.7, 3.6], [70, 1.4, 3.6, 3.5], [68, 1.5, 3.5, 3.4],
  ]);
  await confirmSquad(prisma, id, 'live', adminUserId);
}

async function networkRail(prisma: PrismaClient, adminUserId: string) {
  // The placeholder engagement that earlier deploys renamed to a second "NRW Discovery".
  const placeholder = await prisma.engagement.findFirst({
    where: { orgId: DEMO_ACCOUNT.orgId, id: { notIn: ['nrw-demo', 'nrw-demo-2', 'gds-demo', 'hs2-demo'] }, name: { in: ['NRW Discovery', 'test', 'Test'] } },
  });
  if (!placeholder) return;
  const id = placeholder.id;
  await resetSpine(prisma, id);
  await prisma.squadProposal.updateMany({ where: { engagementId: id, status: 'confirmed' }, data: { status: 'superseded' } });
  await prisma.engagement.update({
    where: { id },
    data: {
      name: 'Network Rail asset reporting',
      reference: 'NR-SZ-01',
      clientOrg: 'Network Rail',
      serviceName: 'Asset condition reporting',
      phase: 'sprint-zero',
      mode: 'mobilise',
      deliveryMethod: 'hybrid',
      squadShape: 'reporting',
      marketSector: 'infrastructure',
      commercialModel: 'fixed-price',
      scopeClear: true,
      maturityLevel: 'practising',
      ownerId: adminUserId,
      outcomes: 'Route asset managers see track condition within one day of inspection.\nMonthly condition reports take one hour to produce, not three days.',
      startsOn: day(-12),
      endsOn: day(160),
      steeringChair: 'Helen Moss, Route Asset Manager',
      steeringFrequency: 'fortnightly',
      steeringOn: day(8),
      steeringPackReady: false,
      clientProductOwner: 'Dan Price',
      productOwnerDays: 1.5,
      deliveryStatus: null,
      deliveryStatusNote: null,
      recoveryPlan: null,
      goLiveOn: null,
      hasAftercare: false,
      charterAgreedOn: null,
    },
  });
  await checklist(prisma, id, 'sprint-zero', SPRINT_ZERO, 5, -20);
  await checklist(prisma, id, 'data-pack', DATA_PACK, 1, -6);
  await prisma.engagementMilestone.createMany({
    data: [
      { engagementId: id, name: 'Sprint Zero complete', dueOn: day(4), proves: 'Backlog ready for two sprints and the pipeline running', paymentLinked: false, status: 'at-risk' },
      { engagementId: id, name: 'First condition dashboard live', dueOn: day(60), proves: 'Route asset managers use it in their weekly review', paymentLinked: true, status: 'on-time' },
    ],
  });
  await prisma.raidItem.createMany({
    data: [
      { engagementId: id, type: 'risk', title: 'po-days', ownerName: 'Demo Admin', status: 'open' },
      { engagementId: id, type: 'assumption', title: 'Inspection data is available from the asset system API', ownerName: 'Dan Price', dueOn: day(5), status: 'open' },
    ],
  });
}

/** Statuses and squads for the two NRW engagements, keeping the stories their seed tells. */
async function nrw(prisma: PrismaClient, adminUserId: string) {
  const discovery = await prisma.engagement.findUnique({ where: { id: 'nrw-demo' } });
  if (discovery) {
    await prisma.engagement.update({ where: { id: 'nrw-demo' }, data: { name: 'NRW permitting service', deliveryMethod: discovery.deliveryMethod ?? 'hybrid' } });
    await confirmSquad(prisma, 'nrw-demo', 'discovery', adminUserId);
  }
  const alpha = await prisma.engagement.findUnique({ where: { id: 'nrw-demo-2' } });
  if (alpha) {
    await prisma.engagement.update({ where: { id: 'nrw-demo-2' }, data: { name: 'NRW biodiversity data platform', deliveryMethod: alpha.deliveryMethod ?? 'agile' } });
    await confirmSquad(prisma, 'nrw-demo-2', 'alpha', adminUserId);
  }
}

export async function refreshDemoPortfolio(prisma: PrismaClient, adminUserId: string, force = false) {
  const current = await prisma.handbookConfig.findUnique({ where: { key: CONFIG_KEY } });
  if (!force && current?.value === DEMO_PORTFOLIO_VERSION) return false;
  await nrw(prisma, adminUserId);
  await dvla(prisma, adminUserId);
  await hs2(prisma, adminUserId);
  await networkRail(prisma, adminUserId);
  await prisma.handbookConfig.upsert({
    where: { key: CONFIG_KEY },
    create: { key: CONFIG_KEY, value: DEMO_PORTFOLIO_VERSION },
    update: { value: DEMO_PORTFOLIO_VERSION },
  });
  return true;
}
