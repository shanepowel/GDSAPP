import type { PrismaClient } from '@prisma/client';

const SYSTEM_RATIONALE =
  'System: linked evidence expired. Verdict moved to at-risk so a panel sees the decay cause. Renew evidence and reconfirm.';

/**
 * Nightly freshness job (spec 3.6).
 * For each current `met` judgement whose only linked evidence has expired,
 * supersede with an at-risk system judgement naming the cause.
 */
export async function runFreshnessDecay(prisma: PrismaClient, now = new Date()) {
  const current = await prisma.criterionJudgement.findMany({
    where: { supersededById: null, verdict: 'met' },
  });

  let updated = 0;
  for (const j of current) {
    const links = await prisma.evidenceCriterion.findMany({
      where: { criterionId: j.criterionId, evidence: { engagementId: j.engagementId } },
      include: { evidence: true },
    });
    if (links.length === 0) continue;
    const fresh = links.filter(
      (l) => !l.evidence.expiresAt || l.evidence.expiresAt.getTime() >= now.getTime(),
    );
    if (fresh.length > 0) continue;

    const expiredTitles = links.map((l) => l.evidence.title).join('; ');
    const created = await prisma.criterionJudgement.create({
      data: {
        engagementId: j.engagementId,
        criterionId: j.criterionId,
        verdict: 'at-risk',
        rationale: `${SYSTEM_RATIONALE} Expired: ${expiredTitles}`.slice(0, 2000),
        proposedBy: 'system',
        confirmedByUserId: j.confirmedByUserId,
      },
    });
    await prisma.criterionJudgement.update({
      where: { id: j.id },
      data: { supersededById: created.id },
    });
    updated += 1;
  }

  return { scanned: current.length, updated };
}
