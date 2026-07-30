/**
 * GitHub delivery-signal sync (Phase 6.3 — compressed to one integration).
 * Creates evidence tagged "Pulled from GitHub" with 30-day expiry.
 */
import type { PrismaClient } from '@prisma/client';

export type GitHubSyncResult =
  | {
      ok: true;
      evidenceId: string;
      summary: string;
      metrics: {
        openA11yIssues: number;
        repoPrivate: boolean | null;
        defaultBranch: string | null;
      };
    }
  | { ok: false; reason: 'not-configured' | 'upstream-error'; message: string };

export async function syncGitHubDeliverySignals(
  prisma: PrismaClient,
  opts: {
    engagementId: string;
    criterionIds: string[];
    owner: string;
    repo: string;
    token?: string | null;
    createdByUserId: string;
  },
): Promise<GitHubSyncResult> {
  const token = opts.token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!token) {
    return {
      ok: false,
      reason: 'not-configured',
      message: 'GitHub token missing. Set GITHUB_TOKEN and reconnect.',
    };
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'assemble-gdsapp',
  };

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${opts.owner}/${opts.repo}`, {
      headers,
    });
    if (!repoRes.ok) {
      return {
        ok: false,
        reason: 'upstream-error',
        message: `GitHub repo lookup failed (${repoRes.status}). Reconnect or check repository access.`,
      };
    }
    const repoJson = (await repoRes.json()) as {
      private?: boolean;
      default_branch?: string;
      full_name?: string;
    };

    const issuesRes = await fetch(
      `https://api.github.com/repos/${opts.owner}/${opts.repo}/issues?state=open&per_page=100&labels=accessibility,a11y`,
      { headers },
    );
    const issues = issuesRes.ok
      ? ((await issuesRes.json()) as Array<{ pull_request?: unknown }>)
      : [];
    const openA11yIssues = issues.filter((i) => !i.pull_request).length;

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const title = `Pulled from GitHub — ${opts.owner}/${opts.repo}`;
    const summary = `Open a11y issues: ${openA11yIssues}; visibility: ${
      repoJson.private ? 'private' : 'public'
    }; default branch: ${repoJson.default_branch ?? '—'}`;

    const criterionIds =
      opts.criterionIds.length > 0
        ? opts.criterionIds
        : (
            await prisma.engagementStandard.findMany({
              where: { engagementId: opts.engagementId },
              include: { standardVersion: { include: { criteria: { take: 1 } } } },
            })
          ).flatMap((es) => es.standardVersion.criteria.map((c) => c.id));

    if (criterionIds.length === 0) {
      return {
        ok: false,
        reason: 'upstream-error',
        message: 'No criteria linked to this engagement to attach delivery evidence.',
      };
    }

    const existing = await prisma.assuranceEvidence.findFirst({
      where: {
        engagementId: opts.engagementId,
        sourceSystem: 'github',
        externalId: `${opts.owner}/${opts.repo}`,
      },
    });

    const data = {
      title,
      kind: 'metric' as const,
      uri: `https://github.com/${opts.owner}/${opts.repo}`,
      producedAt: new Date(),
      expiresAt,
      confidentiality: 'client',
      provenance: 'integration',
      sourceSystem: 'github',
      externalId: `${opts.owner}/${opts.repo}`,
    };

    let evidenceId: string;
    if (existing) {
      await prisma.evidenceCriterion.deleteMany({ where: { evidenceId: existing.id } });
      const updated = await prisma.assuranceEvidence.update({
        where: { id: existing.id },
        data: {
          ...data,
          criteria: { create: criterionIds.slice(0, 3).map((criterionId) => ({ criterionId })) },
        },
      });
      evidenceId = updated.id;
    } else {
      const created = await prisma.assuranceEvidence.create({
        data: {
          engagementId: opts.engagementId,
          createdByUserId: opts.createdByUserId,
          ...data,
          criteria: { create: criterionIds.slice(0, 3).map((criterionId) => ({ criterionId })) },
        },
      });
      evidenceId = created.id;
    }

    return {
      ok: true,
      evidenceId,
      summary,
      metrics: {
        openA11yIssues,
        repoPrivate: repoJson.private ?? null,
        defaultBranch: repoJson.default_branch ?? null,
      },
    };
  } catch (e) {
    return {
      ok: false,
      reason: 'upstream-error',
      message: e instanceof Error ? e.message : 'GitHub sync failed. Reconnect and retry.',
    };
  }
}
