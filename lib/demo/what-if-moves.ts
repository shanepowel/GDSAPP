import type { PrismaClient } from '@prisma/client';

export const WHAT_IF_MOVE_IDS = ['m_welsh', 'm_so', 'm_research'] as const;
export type WhatIfMoveId = (typeof WHAT_IF_MOVE_IDS)[number];

export const WHAT_IF_MOVES: {
  id: WhatIfMoveId;
  label: string;
  note: string;
}[] = [
  {
    id: 'm_welsh',
    label: 'Add bilingual content capability',
    note: 'Contract a Welsh and English content designer to close statutory language gaps.',
  },
  {
    id: 'm_so',
    label: 'Empower and uplift the service owner',
    note: 'Confirm senior mandate and decision rights; uplift strategic ownership skills.',
  },
  {
    id: 'm_research',
    label: 'Deepen user research',
    note: 'Bring user research to practitioner level for discovery exit criteria.',
  },
];

const WELSH_PERSON_TAG = 'whatif:m_welsh';

export async function isMoveApplied(
  prisma: PrismaClient,
  engagementId: string,
  moveId: WhatIfMoveId,
): Promise<boolean> {
  if (moveId === 'm_welsh') {
    const p = await prisma.person.findFirst({
      where: { engagementId, displayName: { contains: WELSH_PERSON_TAG } },
    });
    return Boolean(p);
  }
  if (moveId === 'm_so') {
    const p = await prisma.person.findFirst({
      where: { engagementId, displayName: { contains: 'Service owner' } },
      include: { skills: true },
    });
    const so = p?.skills.find((s) => s.skillId === 'strategic-ownership');
    return (so?.level ?? '') === 'working' || so?.level === 'practitioner';
  }
  if (moveId === 'm_research') {
    const p = await prisma.person.findFirst({
      where: { engagementId, displayName: { contains: 'researcher' } },
      include: { skills: true },
    });
    const ur = p?.skills.find((s) => s.skillId === 'user-research');
    return ur?.level === 'practitioner' || ur?.level === 'expert';
  }
  return false;
}

export async function applyWhatIfMove(
  prisma: PrismaClient,
  engagementId: string,
  requirementId: string,
  moveId: WhatIfMoveId,
): Promise<void> {
  const already = await isMoveApplied(prisma, engagementId, moveId);
  if (already) return;

  if (moveId === 'm_welsh') {
    const contentLevel = await prisma.roleLevel.findFirst({
      where: { roleId: 'content-designer' },
    });
    const person = await prisma.person.create({
      data: {
        engagementId,
        displayName: `Bilingual content designer (${WELSH_PERSON_TAG})`,
        isVacancy: false,
        skills: {
          create: [
            { skillId: 'content-design', level: 'practitioner' },
            { skillId: 'welsh-language-service-capability', level: 'working' },
            { skillId: 'inclusive-design', level: 'working' },
          ],
        },
      },
    });
    if (contentLevel) {
      await prisma.assignment.create({
        data: { requirementId, personId: person.id, roleLevelId: contentLevel.id },
      });
    }
    return;
  }

  if (moveId === 'm_so') {
    const owner = await prisma.person.findFirst({
      where: { engagementId, displayName: { contains: 'Service owner' } },
      include: { skills: true },
    });
    if (!owner) return;
    await prisma.personSkill.deleteMany({ where: { personId: owner.id } });
    await prisma.personSkill.createMany({
      data: [
        { personId: owner.id, skillId: 'strategic-ownership', level: 'working' },
        { personId: owner.id, skillId: 'stakeholder-relationship-management', level: 'practitioner' },
        { personId: owner.id, skillId: 'life-cycle-management', level: 'working' },
      ],
    });
    return;
  }

  if (moveId === 'm_research') {
    const researcher = await prisma.person.findFirst({
      where: { engagementId, displayName: { contains: 'researcher' } },
      include: { skills: true },
    });
    if (!researcher) return;
    await prisma.personSkill.updateMany({
      where: { personId: researcher.id, skillId: 'user-research' },
      data: { level: 'practitioner' },
    });
    if (!researcher.skills.some((s) => s.skillId === 'user-research')) {
      await prisma.personSkill.create({
        data: { personId: researcher.id, skillId: 'user-research', level: 'practitioner' },
      });
    }
  }
}

export async function revertWhatIfMove(
  prisma: PrismaClient,
  engagementId: string,
  requirementId: string,
  moveId: WhatIfMoveId,
): Promise<void> {
  if (moveId === 'm_welsh') {
    const p = await prisma.person.findFirst({
      where: { engagementId, displayName: { contains: WELSH_PERSON_TAG } },
    });
    if (p) {
      await prisma.assignment.deleteMany({ where: { personId: p.id } });
      await prisma.person.delete({ where: { id: p.id } });
    }
    return;
  }

  if (moveId === 'm_so') {
    const owner = await prisma.person.findFirst({
      where: { engagementId, displayName: { contains: 'Service owner' } },
    });
    if (!owner) return;
    await prisma.personSkill.deleteMany({ where: { personId: owner.id } });
    await prisma.personSkill.createMany({
      data: [
        { personId: owner.id, skillId: 'strategic-ownership', level: 'awareness' },
        { personId: owner.id, skillId: 'stakeholder-relationship-management', level: 'working' },
        { personId: owner.id, skillId: 'life-cycle-management', level: 'awareness' },
      ],
    });
    return;
  }

  if (moveId === 'm_research') {
    const researcher = await prisma.person.findFirst({
      where: { engagementId, displayName: { contains: 'researcher' } },
    });
    if (!researcher) return;
    await prisma.personSkill.deleteMany({
      where: { personId: researcher.id, skillId: 'user-research' },
    });
    await prisma.personSkill.create({
      data: { personId: researcher.id, skillId: 'user-research', level: 'working' },
    });
  }
}

export async function listAppliedMoves(
  prisma: PrismaClient,
  engagementId: string,
): Promise<WhatIfMoveId[]> {
  const applied: WhatIfMoveId[] = [];
  for (const id of WHAT_IF_MOVE_IDS) {
    if (await isMoveApplied(prisma, engagementId, id)) applied.push(id);
  }
  return applied;
}
