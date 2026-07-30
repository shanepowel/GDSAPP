import type { PrismaClient } from '@prisma/client';

export const ENGAGEMENT_PHASES = ['discovery', 'alpha', 'beta', 'live', 'gate'] as const;
export type EngagementPhase = (typeof ENGAGEMENT_PHASES)[number];

export const ENGAGEMENT_MODES = ['bid', 'mobilise', 'assure'] as const;
export type EngagementMode = (typeof ENGAGEMENT_MODES)[number];

/** Map legacy engine standardId → catalog standard code. */
export function legacyStandardToCatalogCode(standardId: string): string {
  switch (standardId) {
    case 'gds':
      return 'gds-service-standard';
    case 'wales':
      return 'wales-dss';
    default:
      return standardId;
  }
}

export function catalogCodeToLegacyStandard(code: string): 'gds' | 'wales' | null {
  switch (code) {
    case 'gds-service-standard':
      return 'gds';
    case 'wales-dss':
      return 'wales';
    default:
      return null;
  }
}

export function slugClientPrefix(clientOrg: string | null | undefined, fallbackName: string): string {
  const raw = (clientOrg?.trim() || fallbackName).toUpperCase().replace(/[^A-Z0-9]+/g, '-');
  const trimmed = raw.replace(/^-+|-+$/g, '').slice(0, 12);
  return trimmed || 'ENG';
}

export async function nextEngagementReference(
  prisma: PrismaClient,
  orgId: string,
  clientOrg: string | null | undefined,
  name: string,
): Promise<string> {
  const prefix = slugClientPrefix(clientOrg, name);
  const existing = await prisma.engagement.count({ where: { orgId } });
  const seq = String(existing + 1).padStart(2, '0');
  return `${prefix}-${seq}`;
}

export async function currentVersionIdForCode(
  prisma: PrismaClient,
  code: string,
): Promise<string | null> {
  const version = await prisma.catalogStandardVersion.findFirst({
    where: { status: 'current', standard: { code } },
    orderBy: { effectiveFrom: 'desc' },
    select: { id: true },
  });
  return version?.id ?? null;
}

export async function bindPrimaryStandardVersion(
  prisma: PrismaClient,
  engagementId: string,
  standardVersionId: string,
) {
  await prisma.engagementStandard.deleteMany({
    where: { engagementId, isPrimary: true, NOT: { standardVersionId } },
  });
  await prisma.engagementStandard.upsert({
    where: {
      engagementId_standardVersionId: { engagementId, standardVersionId },
    },
    create: { engagementId, standardVersionId, isPrimary: true },
    update: { isPrimary: true },
  });
}

export type ListedCriterion = {
  id: string;
  ref: string;
  title: string;
  statement: string;
  phases: string[];
  statutory: boolean;
  weight: number;
  sortOrder: number;
  standardCode: string;
  standardName: string;
  standardVersion: string;
  attribution: string;
  locale: string;
  translationReviewStatus: 'human' | 'machine' | null;
};

/**
 * Criteria for an engagement's selected standard versions, filtered to the
 * engagement phase. Changing phase changes the list; it does not touch judgements.
 */
export async function listAssessCriteria(
  prisma: PrismaClient,
  opts: {
    engagementId: string;
    locale?: string;
    /** Override phase filter; defaults to engagement.phase */
    phase?: string | null;
    /** When true, return all criteria for bound versions (detail pages). */
    ignorePhaseFilter?: boolean;
  },
): Promise<{
  phase: string;
  mode: string;
  reference: string | null;
  criteria: ListedCriterion[];
}> {
  const engagement = await prisma.engagement.findUniqueOrThrow({
    where: { id: opts.engagementId },
    include: {
      catalogStandards: {
        include: {
          standardVersion: {
            include: {
              standard: true,
              criteria: {
                include: { translations: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  const phase = opts.phase ?? engagement.phase;
  const locale = opts.locale ?? engagement.locale ?? 'en';

  let versionRows = engagement.catalogStandards;
  if (!versionRows.length) {
    const code = legacyStandardToCatalogCode(engagement.standardId);
    const versionId = await currentVersionIdForCode(prisma, code);
    if (versionId) {
      await bindPrimaryStandardVersion(prisma, engagement.id, versionId);
      return listAssessCriteria(prisma, opts);
    }
  }

  const criteria: ListedCriterion[] = [];
  for (const link of versionRows) {
    const sv = link.standardVersion;
    for (const c of sv.criteria) {
      if (
        !opts.ignorePhaseFilter &&
        phase &&
        c.phases.length > 0 &&
        !c.phases.includes(phase)
      ) {
        continue;
      }
      const translation =
        c.translations.find((t) => t.locale === locale) ??
        c.translations.find((t) => t.locale === 'en');
      criteria.push({
        id: c.id,
        ref: c.ref,
        title: translation?.title ?? c.title,
        statement: translation?.statement ?? c.statement,
        phases: c.phases,
        statutory: c.statutory,
        weight: c.weight,
        sortOrder: c.sortOrder,
        standardCode: sv.standard.code,
        standardName: sv.standard.name,
        standardVersion: sv.version,
        attribution: sv.standard.attribution,
        locale: translation?.locale ?? 'en',
        translationReviewStatus: (translation?.reviewStatus as 'human' | 'machine') ?? null,
      });
    }
  }

  criteria.sort((a, b) => {
    if (a.standardCode !== b.standardCode) return a.standardCode.localeCompare(b.standardCode);
    return a.sortOrder - b.sortOrder;
  });

  return {
    phase,
    mode: engagement.mode,
    reference: engagement.reference,
    criteria,
  };
}
