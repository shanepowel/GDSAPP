import type {
  ChainBreak,
  Confidence,
  CriterionScore,
  Gap,
  ScoringInput,
  ScoringResult,
  Verdict,
} from './types';

export type {
  Assignment,
  CapabilityLink,
  ChainBreak,
  Confidence,
  Criterion,
  CriterionScore,
  Entity,
  EvidenceWithLinks,
  Gap,
  Judgement,
  Person,
  ScoringInput,
  ScoringResult,
  Verdict,
} from './types';

export interface CapabilityRequirementInput {
  id: string;
  criterionId: string;
  roleArchetype: string | null;
}

export type FullScoringInput = ScoringInput & {
  capabilityRequirements: CapabilityRequirementInput[];
};

function isFresh(expiresAt: Date | null, now: Date): boolean {
  return !expiresAt || expiresAt.getTime() >= now.getTime();
}

function verdictContribution(verdict: Verdict, weight: number): number {
  switch (verdict) {
    case 'met':
      return weight;
    case 'at-risk':
      return weight * 0.5;
    case 'not-met':
    case 'not-assessed':
      return 0;
    default: {
      const _exhaustive: never = verdict;
      return _exhaustive;
    }
  }
}

function moveForBreak(breakKind: ChainBreak | undefined, title: string): string {
  switch (breakKind) {
    case 'no-capability-link':
      return `Link a role that owns “${title}” in Organise, then confirm the capability link.`;
    case 'vacant-role':
      return `Assign a person to the vacant role that answers “${title}”.`;
    case 'no-evidence':
      return `Add fresh evidence linked to “${title}”.`;
    case 'evidence-expired':
      return `Replace or renew the expired evidence for “${title}”.`;
    case undefined:
      return `Confirm a judgement for “${title}” with supporting evidence.`;
    default: {
      const _exhaustive: never = breakKind;
      return _exhaustive;
    }
  }
}

function detectChainBreak(
  input: FullScoringInput,
  criterionId: string,
  evidenceCount: number,
  freshEvidenceCount: number,
): ChainBreak | undefined {
  const reqs = input.capabilityRequirements.filter((r) => r.criterionId === criterionId);
  const reqIds = new Set(reqs.map((r) => r.id));
  const links = input.capabilityLinks.filter((l) => reqIds.has(l.capabilityRequirementId));

  if (reqs.length > 0 && links.length === 0) {
    return 'no-capability-link';
  }

  if (links.length > 0) {
    const linkedEntityIds = new Set(links.map((l) => l.entityId));
    const roleEntities = input.entities.filter(
      (e) => linkedEntityIds.has(e.id) && e.type === 'role',
    );
    if (roleEntities.length > 0) {
      const staffed = roleEntities.some((role) =>
        input.assignments.some((a) => a.entityId === role.id && a.personId),
      );
      if (!staffed) return 'vacant-role';
    }
  }

  if (evidenceCount === 0) return 'no-evidence';
  if (freshEvidenceCount === 0) return 'evidence-expired';
  return undefined;
}

function capVerdict(
  recorded: Verdict,
  chainBreak: ChainBreak | undefined,
  freshEvidenceCount: number,
): Verdict {
  if (recorded !== 'met') return recorded;
  if (freshEvidenceCount === 0) return 'at-risk';
  if (chainBreak === 'vacant-role' || chainBreak === 'no-capability-link') return 'at-risk';
  return recorded;
}

/**
 * Pure preparedness index. Synchronous, no I/O. Inject `now`.
 */
export function score(input: FullScoringInput): ScoringResult {
  const byCriterion: CriterionScore[] = [];
  const gaps: Gap[] = [];

  for (const criterion of input.criteria) {
    const judgement = input.judgements.find(
      (j) => j.criterionId === criterion.id && j.supersededById === null,
    );
    const recordedVerdict: Verdict = judgement?.verdict ?? 'not-assessed';

    const linkedEvidence = input.evidence.filter((e) =>
      e.criterionIds.includes(criterion.id),
    );
    const evidenceCount = linkedEvidence.length;
    const freshEvidenceCount = linkedEvidence.filter((e) =>
      isFresh(e.expiresAt, input.now),
    ).length;

    const chainBreak = detectChainBreak(
      input,
      criterion.id,
      evidenceCount,
      freshEvidenceCount,
    );
    const verdict = capVerdict(recordedVerdict, chainBreak, freshEvidenceCount);
    const chainComplete = !chainBreak;
    const contribution = verdictContribution(verdict, criterion.weight);

    byCriterion.push({
      criterionId: criterion.id,
      verdict,
      evidenceCount,
      freshEvidenceCount,
      chainComplete,
      chainBreak,
      contribution,
    });

    if (verdict === 'met') continue;

    const reasonParts = [
      `Recorded ${recordedVerdict}`,
      verdict !== recordedVerdict ? `capped to ${verdict}` : null,
      chainBreak ? `chain break: ${chainBreak}` : null,
      freshEvidenceCount === 0 && evidenceCount > 0 ? 'only expired evidence' : null,
    ].filter(Boolean);

    gaps.push({
      criterionId: criterion.id,
      criterionRef: criterion.ref,
      title: criterion.title,
      reason: reasonParts.join(' · '),
      move: moveForBreak(chainBreak, criterion.title),
      statutory: criterion.statutory,
    });
  }

  const confirmedCount = input.judgements.filter(
    (j) => j.supersededById === null && j.verdict !== 'not-assessed',
  ).length;

  const totalWeight = input.criteria.reduce((sum, c) => sum + c.weight, 0);
  const totalContribution = byCriterion.reduce((sum, c) => sum + c.contribution, 0);

  const index =
    confirmedCount < 3 || totalWeight === 0
      ? null
      : Math.round((100 * totalContribution) / totalWeight);

  const statutoryNotMet = byCriterion.some((c) => {
    const crit = input.criteria.find((x) => x.id === c.criterionId);
    return crit?.statutory && c.verdict === 'not-met';
  });

  let confidence: Confidence = 'high';
  if (index === null || statutoryNotMet) confidence = 'low';
  else if (gaps.length > input.criteria.length / 2) confidence = 'medium';

  gaps.sort((a, b) => Number(b.statutory) - Number(a.statutory));

  return {
    index,
    confidence,
    byCriterion,
    gaps,
    statutoryGaps: gaps.filter((g) => {
      const c = byCriterion.find((x) => x.criterionId === g.criterionId);
      const crit = input.criteria.find((x) => x.id === g.criterionId);
      return Boolean(crit?.statutory && c?.verdict === 'not-met');
    }),
  };
}
