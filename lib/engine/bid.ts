import { compareSkillMatch } from '@/lib/engine/skill-match';
import { maxEvidenceStrengthForPoint } from '@/lib/engine/evidence-config';
import type { BidScoringInput, BidOutlookResult, BidQuestionResult } from '@/lib/types/extension';

function capabilityForQuestion(
  input: BidScoringInput,
  q: BidScoringInput['questions'][0],
): { coverage: number; rationale: string[] } {
  const { team } = input;
  const peopleSkillMap = new Map(
    team.people.map((p) => [p.id, new Map(p.skills.map((s) => [s.skillId, s.level]))]),
  );
  const assignedByRole = new Map<string, { seniorityRank: number }[]>();
  for (const a of team.assignments) {
    const rl = team.roleLevels.find((r) => r.id === a.roleLevelId);
    const list = assignedByRole.get(rl?.roleId ?? '') ?? [];
    list.push({ seniorityRank: rl?.seniorityRank ?? 0 });
    assignedByRole.set(rl?.roleId ?? '', list);
  }

  const rationale: string[] = [];
  let roleSum = 0;
  let roleW = 0;
  let skillSum = 0;
  let skillW = 0;

  for (const dep of q.roleDeps) {
    const assignees = assignedByRole.get(dep.roleId) ?? [];
    const ok = assignees.some((a) => a.seniorityRank >= dep.minSeniorityRank);
    const score = ok ? 1 : assignees.length ? 0.5 : 0;
    roleSum += score * dep.weight;
    roleW += dep.weight;
    if (score < 1) rationale.push(`Role ${dep.roleId} coverage ${score}.`);
  }

  for (const dep of q.skillDeps) {
    let best = 0;
    for (const person of team.people) {
      const held = peopleSkillMap.get(person.id)?.get(dep.skillId);
      const { score } = compareSkillMatch(dep.minLevel, held);
      best = Math.max(best, score);
    }
    skillSum += best * dep.weight;
    skillW += dep.weight;
    if (best < 1) rationale.push(`Skill ${dep.skillId} best match ${best}.`);
  }

  const rolePart = roleW ? roleSum / roleW : 1;
  const skillPart = skillW ? skillSum / skillW : 1;
  const coverage = (rolePart + skillPart) / 2;
  return { coverage, rationale };
}

function predictBand(coverage: number, evidence: number, max: number): number {
  const combined = coverage * 0.6 + evidence * 0.4;
  return Math.min(max, Math.max(0, Math.round(combined * max)));
}

export function computeBidOutlook(input: BidScoringInput): BidOutlookResult {
  const questions: BidQuestionResult[] = input.questions.map((q) => {
    const { coverage, rationale } = capabilityForQuestion(input, q);
    const pointEvidence = input.evidenceByQuestion.get(q.questionId) ?? [];
    const evidenceStrength = maxEvidenceStrengthForPoint(pointEvidence);
    const combined = Math.min(1, coverage * 0.65 + evidenceStrength * 0.35);
    const predictedBand = predictBand(coverage, evidenceStrength, input.scoringScaleMax);
    const threshold = q.passThreshold ?? Math.ceil(input.scoringScaleMax * 0.6);
    const passFailRisk = q.isPassFail && predictedBand < threshold;

    const pointMovers: string[] = [];
    if (coverage < 0.85) pointMovers.push('Add or strengthen a depended role on the team.');
    if (evidenceStrength < 0.5) pointMovers.push('Link documented or demonstrated evidence to this question.');
    if (coverage < 1) pointMovers.push('Close skill gaps one level where upskilling is feasible.');

    return {
      questionId: q.questionId,
      ref: q.ref,
      capabilityCoverage: Math.round(coverage * 100),
      evidenceStrength: Math.round(evidenceStrength * 100),
      combinedScore: Math.round(combined * 100),
      predictedBand,
      confidenceNote:
        'Predicted band from team capability and evidence. The buyer scores the written answer, not the roster alone.',
      passFailRisk,
      rationale,
      pointMovers,
    };
  });

  const totalWeight = questions.reduce(
    (s, q) => s + (input.questions.find((x) => x.questionId === q.questionId)?.weight ?? 1),
    0,
  );
  let weightedBand = 0;
  for (const r of questions) {
    const w = input.questions.find((x) => x.questionId === r.questionId)?.weight ?? 1;
    weightedBand += (r.predictedBand / input.scoringScaleMax) * (w / totalWeight);
  }
  const overallQualityOutlook = Math.round(weightedBand * 100 * input.qualityWeight);

  const moverImpacts = questions.flatMap((q) =>
    q.pointMovers.map((text) => ({
      text: `${q.ref}: ${text}`,
      impact: (input.questions.find((x) => x.questionId === q.questionId)?.weight ?? 1) * (1 - q.combinedScore / 100),
    })),
  );
  const topPointMovers = moverImpacts
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 8);

  return { questions, overallQualityOutlook, topPointMovers };
}
