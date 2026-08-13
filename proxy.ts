import '@/lib/auth-env';
import { getAuthSecret } from '@/lib/auth-env';
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  secret: getAuthSecret(),
  pages: { signIn: '/sign-in' },
});

export const config = {
  matcher: [
    '/engagements/:path*',
    '/people',
    '/people/:path*',
    '/squads',
    '/squads/:path*',
    '/assurance',
    '/assurance/:path*',
    '/org-design',
    '/org-design/:path*',
    '/portfolio',
    '/handover',
    '/benchmarking',
    '/framework',
    '/profile',
    '/settings',
    '/settings/:path*',
  ],
};
