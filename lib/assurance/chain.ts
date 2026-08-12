import type { PrismaClient } from '@prisma/client';

export type ChainSegmentState = 'complete' | 'unevidenced' | 'broken';

export type EvidenceChainSegment = {
  id: string;
  kind:
    | 'criterion'
    | 'capability'
    | 'accountability'
    | 'role'
    | 'evidence'
    | 'judgement';
  title: string;
  body: string;
  state: ChainSegmentState;
  href?: string;
};

export type EvidenceChain = {
  criterionId: string;
  criterionRef: string;
  segments: EvidenceChainSegment[];
  overall: ChainSegmentState;
};

export async function buildEvidenceChain(
  prisma: PrismaClient,
  engagementId: string,
  criterionId: string,
  now: Date,
): Promise<EvidenceChain> {
  const criterion = await prisma.criterion.findUniqueOrThrow({
    where: { id: criterionId },
    include: {
      capabilityRequirements: true,
      standardVersion: { include: { standard: true } },
    },
  });

  const judgement = await prisma.criterionJudgement.findFirst({
    where: { engagementId, criterionId, supersededById: null },
    orderBy: { confirmedAt: 'desc' },
  });

  const evidenceLinks = await prisma.evidenceCriterion.findMany({
    where: { criterionId, evidence: { engagementId } },
    include: { evidence: true },
  });

  const capLinks = await prisma.capabilityLink.findMany({
    where: {
      engagementId,
      capabilityRequirementId: { in: criterion.capabilityRequirements.map((c) => c.id) },
    },
  });

  const engagement = await prisma.engagement.findUniqueOrThrow({
    where: { id: engagementId },
  });

  // Resolve design roles for linked entities (best-effort against live design people)
  const entityIds = [...new Set(capLinks.map((l) => l.entityId))];
  const entities = entityIds.length
    ? await prisma.designEntity.findMany({
        where: { orgId: engagement.orgId, id: { in: entityIds } },
      })
    : [];
  const assignments = entityIds.length
    ? await prisma.designAssignment.findMany({
        where: { orgId: engagement.orgId, entityId: { in: entityIds } },
      })
    : [];
  const people =
    assignments.length > 0
      ? await prisma.designPerson.findMany({
          where: {
            orgId: engagement.orgId,
            id: { in: assignments.map((a) => a.personId) },
          },
        })
      : [];

  const segments: EvidenceChainSegment[] = [];

  segments.push({
    id: 'criterion',
    kind: 'criterion',
    title: `Criterion ${criterion.ref}`,
    body: `${criterion.title}\n${criterion.standardVersion.standard.name} v${criterion.standardVersion.version} · statutory: ${criterion.statutory ? 'yes' : 'no'}`,
    state: 'complete',
    href: `/engagements/${engagementId}/assess/${encodeURIComponent(criterion.ref)}`,
  });

  const req = criterion.capabilityRequirements[0];
  if (!req) {
    segments.push({
      id: 'capability',
      kind: 'capability',
      title: 'Capability required',
      body: 'No capability requirement seeded for this criterion yet.',
      state: 'unevidenced',
    });
  } else {
    segments.push({
      id: 'capability',
      kind: 'capability',
      title: 'Capability required',
      body: [
        req.description,
        req.roleArchetype ? `Role archetype: ${req.roleArchetype}` : null,
        req.minFte != null ? `Minimum ${(req.minFte / 100).toFixed(1)} FTE` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      state: 'complete',
    });
  }

  const link = capLinks[0];
  const entity = link ? entities.find((e) => e.id === link.entityId) : null;
  if (!link || !entity) {
    segments.push({
      id: 'accountability',
      kind: 'accountability',
      title: 'Accountability',
      body: 'No capability link to a role or circle in this engagement.',
      state: 'broken',
    });
    segments.push({
      id: 'role',
      kind: 'role',
      title: 'Role',
      body: 'Vacant — no entity linked.',
      state: 'broken',
    });
  } else {
    const accountabilities = Array.isArray(entity.accountabilities)
      ? (entity.accountabilities as string[])
      : [];
    const acc =
      link.accountabilityIndex != null
        ? accountabilities[link.accountabilityIndex]
        : accountabilities[0];
    segments.push({
      id: 'accountability',
      kind: 'accountability',
      title: 'Accountability',
      body: acc
        ? `"${acc}" — held by ${entity.name}`
        : `Held by ${entity.name}`,
      state: link.confirmed ? 'complete' : 'unevidenced',
      href: `/engagements/${engagementId}/organise`,
    });

    const holders = people.filter((p) =>
      assignments.some((a) => a.entityId === entity.id && a.personId === p.id),
    );
    const vacant = entity.type === 'role' && holders.length === 0;
    segments.push({
      id: 'role',
      kind: 'role',
      title: vacant ? 'Role — vacant' : 'Role',
      body: vacant
        ? `${entity.name}\nno person assigned`
        : `${entity.name}\n${holders.map((h) => h.name).join(', ')}`,
      state: vacant ? 'broken' : 'complete',
      href: `/engagements/${engagementId}/organise/people`,
    });
  }

  const fresh = evidenceLinks.filter(
    (l) => !l.evidence.expiresAt || l.evidence.expiresAt.getTime() >= now.getTime(),
  );
  const expired = evidenceLinks.length - fresh.length;
  if (evidenceLinks.length === 0) {
    segments.push({
      id: 'evidence',
      kind: 'evidence',
      title: 'Evidence',
      body: 'No evidence linked.',
      state: 'broken',
      href: `/engagements/${engagementId}/evidence`,
    });
  } else {
    segments.push({
      id: 'evidence',
      kind: 'evidence',
      title: `Evidence · ${evidenceLinks.length} items${expired ? ` · ${expired} expired` : ''}`,
      body: evidenceLinks
        .map((l) => {
          const exp = l.evidence.expiresAt
            ? l.evidence.expiresAt.getTime() < now.getTime()
              ? 'EXPIRED'
              : `exp. ${l.evidence.expiresAt.toLocaleDateString('en-GB')}`
            : 'no expiry';
          return `${l.evidence.title}  ${exp}`;
        })
        .join('\n'),
      state: fresh.length === 0 ? 'broken' : expired > 0 ? 'unevidenced' : 'complete',
      href: `/engagements/${engagementId}/evidence`,
    });
  }

  if (!judgement) {
    segments.push({
      id: 'judgement',
      kind: 'judgement',
      title: 'Judgement',
      body: 'Not assessed.',
      state: 'unevidenced',
      href: `/engagements/${engagementId}/assess/${encodeURIComponent(criterion.ref)}`,
    });
  } else {
    segments.push({
      id: 'judgement',
      kind: 'judgement',
      title: 'Judgement',
      body: `${judgement.verdict} — confirmed ${judgement.confirmedAt.toLocaleDateString('en-GB')}\nProposed by ${judgement.proposedBy}`,
      state: judgement.verdict === 'not-assessed' ? 'unevidenced' : 'complete',
      href: `/engagements/${engagementId}/assess/${encodeURIComponent(criterion.ref)}`,
    });
  }

  const overall: ChainSegmentState = segments.some((s) => s.state === 'broken')
    ? 'broken'
    : segments.some((s) => s.state === 'unevidenced')
      ? 'unevidenced'
      : 'complete';

  return {
    criterionId: criterion.id,
    criterionRef: criterion.ref,
    segments,
    overall,
  };
}
