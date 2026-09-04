import { encode } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { getAuthSecret, getAuthUrl } from '@/lib/auth-env';
import { ensureDemoReader } from '@/lib/demo/reader';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const secret = getAuthSecret();
  if (!secret) {
    return NextResponse.json({ error: 'Auth is not configured.' }, { status: 500 });
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

  const origin = getAuthUrl() ?? new URL(request.url).origin;
  const response = NextResponse.redirect(new URL('/squads/nrw-demo', origin));
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
