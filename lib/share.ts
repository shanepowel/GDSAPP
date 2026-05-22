import { prisma } from '@/lib/db/client';

export async function getSharePayload(token: string) {
  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      engagement: {
        include: {
          requirements: {
            include: { runs: { orderBy: { createdAt: 'desc' }, take: 1 } },
          },
        },
      },
    },
  });
  if (!link || link.expiresAt < new Date()) return null;
  return {
    engagementName: link.engagement.name,
    standardId: link.engagement.standardId,
    lastRun: link.engagement.requirements[0]?.runs[0] ?? null,
  };
}
