import '@/lib/auth-env';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/client';
import { getAuthSecret } from '@/lib/auth-env';

export const authOptions: NextAuthOptions = {
  secret: getAuthSecret(),
  session: { strategy: 'jwt' },
  pages: { signIn: '/sign-in' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          orgId: user.orgId,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.orgId = (user as { orgId?: string }).orgId;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
        (session.user as { orgId?: string }).orgId = token.orgId as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
