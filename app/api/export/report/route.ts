import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { buildAssuranceReportPdf } from '@/lib/export/assurance-report-pdf';
import { buildReportFilename, type ReportSectionId } from '@/lib/export/assurance-report';
import { loadAssuranceReportPayload } from '@/lib/export/load-assurance-report';

export const runtime = 'nodejs';

const SECTION_SET = new Set<ReportSectionId>(['overview', 'gaps', 'evidence', 'legacy-analysis']);

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const engagementId = searchParams.get('engagementId');
  const locale = searchParams.get('locale') === 'cy' ? 'cy' : 'en';
  const sectionsParam = searchParams.get('sections');

  if (!engagementId) {
    return NextResponse.json({ error: 'engagementId required' }, { status: 400 });
  }

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: session.user.orgId },
    select: { id: true, name: true },
  });
  if (!engagement) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const sections = sectionsParam
    ? (sectionsParam
        .split(',')
        .filter((s): s is ReportSectionId => SECTION_SET.has(s as ReportSectionId)) as ReportSectionId[])
    : undefined;

  const preparedBy = session.user.name?.trim() || session.user.email || undefined;
  const loaded = await loadAssuranceReportPayload(prisma, {
    engagementId,
    sections,
    locale,
    preparedBy,
  });

  if (!loaded.ok) {
    return NextResponse.json(
      {
        error: loaded.message,
        reason: 'machine-welsh',
        machineCriterionRefs: loaded.machineCriterionRefs,
      },
      { status: 409 },
    );
  }

  const buffer = await buildAssuranceReportPdf(loaded.payload);
  const filename = buildReportFilename(engagement.name, new Date(loaded.payload.generatedAt));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
