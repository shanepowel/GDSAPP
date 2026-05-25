import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { buildBrandedReportPdf } from '@/lib/export/branded-report-pdf';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const engagementId = searchParams.get('engagementId');
  const requirementId = searchParams.get('requirementId');

  if (!engagementId) {
    return NextResponse.json({ error: 'engagementId required' }, { status: 400 });
  }

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: session.user.orgId },
    include: {
      requirements: {
        include: { runs: { orderBy: { createdAt: 'desc' }, take: 1 } },
      },
    },
  });

  if (!engagement) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const requirement =
    engagement.requirements.find((r) => r.id === requirementId) ?? engagement.requirements[0];
  const run = requirement?.runs[0];
  if (!run?.result || !requirement) {
    return NextResponse.json({ error: 'No analysis run to export' }, { status: 400 });
  }

  const result = run.result as unknown as ExtendedAnalysisResult;
  const standardLabel =
    engagement.standardId === 'wales'
      ? 'Digital Service Standard for Wales'
      : 'GDS Service Standard';

  const buffer = await buildBrandedReportPdf({
    engagementName: engagement.name,
    standardLabel,
    requirementTitle: requirement.title,
    phase: requirement.phase,
    generatedAt: new Date(),
    result,
    advisoryFooter:
      'Advisory report only. Not a hiring or procurement decision. Open Government Licence frameworks. Review by a qualified service assessor before client use.',
  });

  const filename = `${engagement.name.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)}-report.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
