import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractTextFromPdfBuffer, parseTenderPdfText } from '@/lib/tender/pdf-parser';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'PDF file required' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > 12 * 1024 * 1024) {
    return NextResponse.json({ error: 'PDF must be under 12MB' }, { status: 400 });
  }

  try {
    const text = await extractTextFromPdfBuffer(buffer);
    const questions = parseTenderPdfText(text);
    return NextResponse.json({
      questionCount: questions.length,
      questions,
      previewChars: text.slice(0, 500),
      advisory:
        'Imported questions are heuristic extracts. Review every ref and weight before using in a live bid.',
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Parse failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
