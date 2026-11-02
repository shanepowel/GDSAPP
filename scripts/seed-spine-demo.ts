/**
 * Delivery spine demo data for the two NRW demo engagements: checklist, milestones, RAID,
 * decisions, change, status and six months of Compass readings. Dates are relative to the
 * day the seed runs so the demo always looks current. Safe to re-run: it replaces spine rows
 * for these engagements only.
 */
import type { PrismaClient } from '@prisma/client';

const DAY = 86_400_000;

function day(offset: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + offset * DAY);
}

function monthsAgo(n: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n, 1));
}

const SPRINT_ZERO = [
  'charter',
  'governance',
  'environments',
  'pipeline',
  'wiki',
  'outcomes',
  'backlog',
  'spikes',
  'plan',
  'raid',
  'change',
] as const;

const DISCOVERY = [
  ['discovery-research', 'Research plan agreed with the Product Owner', 'Aled Morgan'],
  ['discovery-users', 'Interviews with 12 permit applicants complete', 'Ffion Hughes'],
  ['discovery-journeys', 'As-is journey maps for the three permit types', 'Ffion Hughes'],
  ['discovery-tech', 'Legacy permitting system and integrations mapped', 'Rhys Jenkins'],
  ['discovery-welsh', 'Welsh language needs captured with the Welsh Language team', 'Aled Morgan'],
  ['discovery-options', 'Options and recommendation for alpha written up', 'Shane Powell'],
  ['discovery-show', 'Show and tell with the steering committee', 'Shane Powell'],
] as const;

async function reset(prisma: PrismaClient, engagementId: string) {
  await prisma.$transaction([
    prisma.engagementChecklistItem.deleteMany({ where: { engagementId } }),
    prisma.engagementMilestone.deleteMany({ where: { engagementId } }),
    prisma.raidItem.deleteMany({ where: { engagementId } }),
    prisma.changeRequest.deleteMany({ where: { engagementId } }),
    prisma.decisionRecord.deleteMany({ where: { engagementId } }),
    prisma.engagementMeasure.deleteMany({ where: { engagementId } }),
  ]);
}

async function measures(
  prisma: PrismaClient,
  engagementId: string,
  rows: Array<[number, number, number, number]>,
) {
  for (const [index, [predictability, quality, teamHealth, clientSatisfaction]] of rows.entries()) {
    await prisma.engagementMeasure.create({
      data: {
        engagementId,
        period: monthsAgo(rows.length - 1 - index),
        predictability,
        quality,
        teamHealth,
        clientSatisfaction,
      },
    });
  }
}

export async function seedSpineDemo(prisma: PrismaClient) {
  // NRW Permitting Service: discovery, at risk because team health has dropped.
  const a = 'nrw-demo';
  await reset(prisma, a);
  await prisma.engagement.update({
    where: { id: a },
    data: {
      marketSector: 'public',
      commercialModel: 'fixed-price',
      squadShape: 'discovery',
      scopeClear: false,
      outcomes:
        'Applicants can apply for a water abstraction permit online in Welsh or English.\nPermit officers decide 80% of standard applications within 20 working days.',
      startsOn: day(-120),
      endsOn: day(150),
      steeringChair: 'Catrin Evans, Head of Permitting',
      steeringFrequency: 'monthly',
      steeringOn: day(6),
      steeringPackReady: false,
      clientProductOwner: 'Owain Price',
      productOwnerDays: 1.5,
      accountManagerName: 'Sian Lloyd',
      changeThresholdGbp: 10000,
      deliveryStatus: 'at-risk',
      deliveryStatusNote: 'Team health fell to 3.4 after a bid support exception with no end date.',
      recoveryPlan:
        'Team health 3.4 against a target of 4.0.\n\nCause: one squad member is supporting a bid with no end date set.\n\nActions: set an end date for the exception (Shane Powell, this week). Backfill two days a week from the bench (Resourcing, next week).\n\nBack to green by the end of next month.',
      goLiveOn: null,
      hasAftercare: false,
      reportDueOn: day(4),
      surveyDue: null,
      surveySentOn: day(-24),
      charterAgreedOn: day(-100),
      charterReviewOn: day(-58),
    },
  });
  for (const [index, key] of SPRINT_ZERO.entries()) {
    await prisma.engagementChecklistItem.create({
      data: {
        engagementId: a,
        stage: 'sprint-zero',
        itemKey: key,
        title: key,
        sortOrder: index,
        done: true,
        doneAt: day(-105 + index),
      },
    });
  }
  for (const [index, [key, title, owner]] of DISCOVERY.entries()) {
    const done = index < 4;
    await prisma.engagementChecklistItem.create({
      data: {
        engagementId: a,
        stage: 'discovery',
        itemKey: key,
        title,
        sortOrder: index,
        done,
        doneAt: done ? day(-60 + index * 10) : null,
        ownerName: owner,
        dueOn: done ? null : day(5 + index * 4),
      },
    });
  }
  await prisma.engagementMilestone.createMany({
    data: [
      { engagementId: a, name: 'Discovery mobilised', dueOn: day(-110), proves: 'Squad charter signed and backlog ready', paymentLinked: true, status: 'on-time' },
      { engagementId: a, name: 'User research complete', dueOn: day(-20), proves: 'Findings played back to the Product Owner', paymentLinked: false, status: 'on-time' },
      { engagementId: a, name: 'Discovery report and alpha plan', dueOn: day(18), proves: 'Steering committee accepts the recommendation', paymentLinked: true, status: 'at-risk' },
      { engagementId: a, name: 'Alpha start', dueOn: day(45), proves: 'Alpha squad named and onboarded', paymentLinked: false, status: 'on-time' },
    ],
  });
  await prisma.raidItem.createMany({
    data: [
      { engagementId: a, type: 'issue', title: 'Team health below target for two months', ownerName: 'Shane Powell', action: 'Set an end date for the bid support exception', dueOn: day(3), createdAt: day(-2) },
      { engagementId: a, type: 'risk', title: 'po-days', ownerName: 'Catrin Evans', action: 'Raise at the next steering committee', dueOn: day(6), createdAt: day(-30) },
      { engagementId: a, type: 'dependency', title: 'Access to the legacy permitting database extract', ownerName: 'Rhys Jenkins', action: 'Data sharing agreement with NRW IT', dueOn: day(10), createdAt: day(-40) },
      { engagementId: a, type: 'assumption', title: 'Alpha can reuse the GOV.UK Pay integration from the licensing service', ownerName: 'Rhys Jenkins', createdAt: day(-50) },
    ],
  });
  await prisma.decisionRecord.createMany({
    data: [
      { engagementId: a, forum: 'Steering committee', decision: 'Prioritise water abstraction permits for alpha', ownerName: 'Catrin Evans', decidedOn: day(-35), confirmedAt: day(-34) },
      { engagementId: a, forum: 'Sprint review', decision: 'Bilingual content is designed side by side, not translated after', ownerName: 'Owain Price', decidedOn: day(-12) },
    ],
  });
  await prisma.changeRequest.createMany({
    data: [
      { engagementId: a, ref: 'CR-003', description: 'Add marine licensing journeys to discovery scope (about 3 weeks)', status: 'submitted', createdAt: day(-3) },
      { engagementId: a, ref: 'CR-002', description: 'Extra round of research with agents who apply on behalf of farmers', status: 'assessed', createdAt: day(-45) },
    ],
  });
  await measures(prisma, a, [
    [82, 0.6, 4.2, 4.3],
    [85, 0.5, 4.1, 4.4],
    [80, 0.8, 4.0, 4.2],
    [78, 0.7, 3.8, 4.1],
    [81, 0.6, 3.5, 4.2],
    [83, 0.5, 3.4, 4.3],
  ]);

  // NRW biodiversity data platform: alpha, on track.
  const b = 'nrw-demo-2';
  await reset(prisma, b);
  await prisma.engagement.update({
    where: { id: b },
    data: {
      marketSector: 'public',
      commercialModel: 'time-materials',
      squadShape: 'data',
      scopeClear: true,
      startsOn: day(-200),
      endsOn: day(90),
      steeringChair: 'Dr Gareth Rees',
      steeringFrequency: 'monthly',
      steeringOn: day(20),
      steeringPackReady: false,
      clientProductOwner: 'Lowri Thomas',
      productOwnerDays: 3,
      deliveryStatus: 'on-track',
      deliveryStatusNote: 'All four measures on target. Alpha assessment booked.',
      recoveryPlan: null,
      reportDueOn: day(25),
      surveyDue: null,
      surveySentOn: day(-10),
      charterAgreedOn: day(-190),
      charterReviewOn: day(30),
    },
  });
  for (const [index, key] of SPRINT_ZERO.entries()) {
    await prisma.engagementChecklistItem.create({
      data: { engagementId: b, stage: 'sprint-zero', itemKey: key, title: key, sortOrder: index, done: true, doneAt: day(-185) },
    });
  }
  await prisma.engagementMilestone.createMany({
    data: [
      { engagementId: b, name: 'Ingest pipeline for species records', dueOn: day(-30), proves: 'Nightly load from three sources', paymentLinked: true, status: 'on-time' },
      { engagementId: b, name: 'Alpha assessment', dueOn: day(28), proves: 'Passes the Welsh Digital Service Standard alpha assessment', paymentLinked: true, status: 'on-time' },
    ],
  });
  await prisma.raidItem.createMany({
    data: [
      { engagementId: b, type: 'risk', title: 'Licensing terms for third-party survey data are unclear', ownerName: 'Lowri Thomas', action: 'Legal review', dueOn: day(14) },
    ],
  });
  await prisma.decisionRecord.createMany({
    data: [{ engagementId: b, forum: 'Steering committee', decision: 'Use Microsoft Fabric for the alpha', ownerName: 'Dr Gareth Rees', decidedOn: day(-90), confirmedAt: day(-89) }],
  });
  await measures(prisma, b, [
    [76, 1.2, 4.0, 3.9],
    [80, 0.9, 4.1, 4.0],
    [84, 0.8, 4.2, 4.1],
    [86, 0.6, 4.3, 4.2],
    [88, 0.5, 4.3, 4.4],
    [90, 0.4, 4.4, 4.5],
  ]);
}
