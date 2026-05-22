import '@/lib/auth-env';
import { getAuthSecret } from '@/lib/auth-env';
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  secret: getAuthSecret(),
  pages: { signIn: '/sign-in' },
});

export const config = {
  matcher: ['/engagements/:path*'],
};
