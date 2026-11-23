import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, LOCALE_COOKIE } from '@/lib/i18n';

/**
 * Switch language from a link, for example /lang/cy?next=/squads.
 * Sets the language cookie and returns to the page, so it renders in that language from the server.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const asked = request.nextUrl.searchParams.get('next') ?? '/';
  // Only same-site paths, never another host.
  const next = asked.startsWith('/') && !asked.startsWith('//') ? asked : '/';
  const response = NextResponse.redirect(new URL(next, request.url));
  if (isLocale(locale)) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 31_536_000, sameSite: 'lax' });
  }
  return response;
}
