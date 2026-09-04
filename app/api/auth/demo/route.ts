import { encode, getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSecret, getAuthUrl } from '@/lib/auth-env';
import { DEMO_READER_ROLE, ensureDemoReader } from '@/lib/demo/reader';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const secret = getAuthSecret();
  if (!secret) {
    return NextResponse.json({ error: 'Auth is not configured.' }, { status: 500 });
  }

  const origin = getAuthUrl() ?? request.nextUrl.origin;
  const dest = new URL('/squads/nrw-demo', origin);

  const existing = await getToken({ req: request, secret });
  if (existing?.role && existing.role !== DEMO_READER_ROLE) {
    return NextResponse.redirect(dest);
  }

  const user = await ensureDemoReader();
  const token = await encode({
    token: {
      sub: user.id,
      email: user.email,
      name: user.name,
      orgId: user.orgId,
      role: user.role,
    },
    secret,
  });

  const response = NextResponse.redirect(dest);
  const secure = process.env.NODE_ENV === 'production';
  const cookieName = secure ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure,
    maxAge: 60 * 60 * 8,
  });
  return response;
}
