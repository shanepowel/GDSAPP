import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/client';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tenderId = searchParams.get('tenderId');
  if (!tenderId) {
    return NextResponse.json({ error: 'tenderId required' }, { status: 400 });
  }

  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: {
      engagement: true,
      questions: {
        include: {
          drafts: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      },
    },
  });

  if (!tender || tender.engagement.orgId !== session.user.orgId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const sections = tender.questions
    .map((q) => {
      const draft = q.drafts[0];
      if (!draft) return '';
      return `<h2>${q.ref}: ${escapeHtml(q.text.slice(0, 120))}</h2><pre>${escapeHtml(draft.body)}</pre>`;
    })
    .join('<hr/>');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(tender.title)} drafts</title></head><body>
<h1>${escapeHtml(tender.title)}</h1>
<p>Buyer: ${escapeHtml(tender.buyer)}. Advisory drafts only.</p>
${sections}
<footer><p>Open Government Licence. Amplified Ltd / Assemble.</p></footer>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'application/vnd.ms-word',
      'Content-Disposition': `attachment; filename="${slugify(tender.title)}-drafts.doc"`,
    },
  });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function slugify(s: string) {
  return s.replace(/[^a-z0-9]+/gi, '-').slice(0, 60);
}
