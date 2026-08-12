import type { PrismaClient } from '@prisma/client';
import { score } from '@/lib/scoring';
import { loadScoringInput } from '@/lib/assurance/scoring-load';
import {
  highestConfidentiality,
  provenanceLabelForJudgement,
  type AssuranceReportPayload,
  type JudgementRegisterRow,
  type ReportSectionId,
} from '@/lib/export/assurance-report';
import { assertWelshExportAllowed } from '@/lib/i18n/export-gate';
import { BRAND } from '@/lib/brand';

const PRODUCT_VERSION = process.env.npm_package_version ?? '0.1.0';

export async function loadAssuranceReportPayload(
  prisma: PrismaClient,
  opts: {
    engagementId: string;
    sections?: ReportSectionId[];
    locale?: string;
    preparedBy?: string;
  },
): Promise<
  | { ok: true; payload: AssuranceReportPayload }
  | { ok: false; status: 409; message: string; machineCriterionRefs: string[] }
> {
  const locale = opts.locale === 'cy' ? 'cy' : 'en';
  const sections: ReportSectionId[] = opts.sections?.length
    ? opts.sections
    : ['overview', 'gaps', 'evidence'];

  const engagement = await prisma.engagement.findUniqueOrThrow({
    where: { id: opts.engagementId },
  });

  const scoringInput = await loadScoringInput(prisma, opts.engagementId, new Date());
  const scoring = score(scoringInput);

  const judgements = await prisma.criterionJudgement.findMany({
    where: { engagementId: opts.engagementId, supersededById: null },
    include: {
      criterion: {
        include: {
          translations: true,
          standardVersion: { include: { standard: true } },
        },
      },
    },
    orderBy: { confirmedAt: 'desc' },
  });

  const confirmerIds = [...new Set(judgements.map((j) => j.confirmedByUserId))];
  const confirmers = await prisma.user.findMany({
    where: { id: { in: confirmerIds } },
    select: { id: true, name: true, email: true },
  });
  const confirmerById = new Map(confirmers.map((u) => [u.id, u]));

  const translationReviews = judgements.flatMap((j) =>
    j.criterion.translations.map((t) => ({
      locale: t.locale,
      reviewStatus: t.reviewStatus,
      criterionRef: j.criterion.ref,
    })),
  );
  // Also include all engagement standard criteria translations for locale gate
  const engStandards = await prisma.engagementStandard.findMany({
    where: { engagementId: opts.engagementId },
    include: {
      standardVersion: {
        include: {
          standard: true,
          criteria: { include: { translations: true } },
        },
      },
    },
  });
  for (const es of engStandards) {
    for (const c of es.standardVersion.criteria) {
      for (const t of c.translations) {
        translationReviews.push({
          locale: t.locale,
          reviewStatus: t.reviewStatus,
          criterionRef: c.ref,
        });
      }
    }
  }

  const gate = assertWelshExportAllowed(locale, translationReviews);
  if (!gate.ok) {
    return {
      ok: false,
      status: 409,
      message: gate.message,
      machineCriterionRefs: gate.machineCriterionRefs,
    };
  }

  const evidenceRows = await prisma.assuranceEvidence.findMany({
    where: { engagementId: opts.engagementId },
    include: { criteria: { include: { criterion: { select: { ref: true } } } } },
    orderBy: { updatedAt: 'desc' },
  });

  const confidentiality = highestConfidentiality(
    evidenceRows.map((e) => e.confidentiality),
  );

  const standardLabel =
    engStandards[0]?.standardVersion.standard.name ??
    (engagement.standardId === 'wales'
      ? 'Digital Service Standard for Wales'
      : 'GDS Service Standard');

  const generatedAt = new Date();
  const register: JudgementRegisterRow[] = judgements.map((j) => {
    const confirmer = confirmerById.get(j.confirmedByUserId);
    const confirmerName = confirmer?.name?.trim() || confirmer?.email || 'Unknown';
    const cy = j.criterion.translations.find((t) => t.locale === 'cy');
    const title =
      locale === 'cy' && cy?.reviewStatus === 'human'
        ? cy.title
        : j.criterion.title;
    return {
      criterionRef: j.criterion.ref,
      criterionTitle: title,
      verdict: j.verdict,
      rationale: j.rationale,
      proposedBy: j.proposedBy,
      confirmerName,
      confirmerEmail: confirmer?.email ?? null,
      confirmedAt: j.confirmedAt.toISOString(),
      aiModel: j.aiModel,
      provenanceLabel: provenanceLabelForJudgement(j.proposedBy, confirmerName),
    };
  });

  const payload: AssuranceReportPayload = {
    format: 'assemble-assurance-report/v1',
    productVersion: PRODUCT_VERSION,
    generatedAt: generatedAt.toISOString(),
    titleBlock: {
      reference: engagement.reference ?? engagement.name,
      standardLabel,
      phase: (engagement.phase ?? 'discovery').replace(/^./, (c) => c.toUpperCase()),
      revision: engagement.revision ?? 'A',
      preparedBy: opts.preparedBy ?? BRAND.product,
      dateLabel: generatedAt.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
      }),
      serviceName: engagement.serviceName ?? engagement.name,
    },
    engagement: {
      id: engagement.id,
      name: engagement.name,
      reference: engagement.reference,
    },
    confidentiality,
    scoring,
    sections,
    judgements: register,
    evidence: evidenceRows.map((e) => ({
      id: e.id,
      title: e.title,
      kind: e.kind,
      confidentiality: e.confidentiality,
      provenance: e.provenance,
      sourceSystem: e.sourceSystem,
      expiresAt: e.expiresAt?.toISOString() ?? null,
      criterionRefs: e.criteria.map((c) => c.criterion.ref),
    })),
    gaps: scoring.gaps.map((g) => ({
      criterionRef: g.criterionRef,
      title: g.title,
      reason: g.reason,
      move: g.move,
      statutory: g.statutory,
    })),
  };

  return { ok: true, payload };
}
