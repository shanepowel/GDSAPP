import '@/lib/auth-env';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import AzureADProvider from 'next-auth/providers/azure-ad';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/client';
import { getAuthSecret } from '@/lib/auth-env';
import { getDeploymentMode } from '@/lib/deployment-mode';
import { entraConfigured, getAuthMode } from '@/lib/auth-config';
import { DEMO_ACCOUNT, ensureDemoAccount } from '@/lib/demo/demo-account';
import { isDatabaseSchemaReady } from '@/lib/db/schema-ready';

async function upsertUserFromProfile(profile: {
  email: string;
  name?: string | null;
}) {
  const email = profile.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, include: { org: true } });
  if (existing) return existing;

  const org = await prisma.organisation.create({
    data: {
      name: `${profile.name ?? email.split('@')[0]} organisation`,
      deploymentMode: getDeploymentMode(),
    },
  });
  return prisma.user.create({
    data: {
      email,
      name: profile.name,
      role: 'admin',
      orgId: org.id,
    },
    include: { org: true },
  });
}

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const email = credentials.email.trim().toLowerCase();
      const password = credentials.password;

      if (!(await isDatabaseSchemaReady())) {
        console.error(
          '[auth] Database schema missing: run npm run db:deploy (or redeploy after migrate in build).',
        );
        return null;
      }

      if (email === DEMO_ACCOUNT.email) {
        await ensureDemoAccount(prisma);
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) {
        // Account exists for SSO only: same email, one login service (Microsoft).
        return null;
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
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
];

const authMode = getAuthMode();
if (entraConfigured() && authMode !== 'credentials') {
  providers.push(
    AzureADProvider({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  secret: getAuthSecret(),
  session: { strategy: 'jwt' },
  pages: { signIn: '/sign-in' },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'azure-ad' && user.email) {
        await upsertUserFromProfile({ email: user.email, name: user.name });
      }
      return true;
    },
    async jwt({ token, user, account }) {
      const email = (user?.email ?? token.email)?.toString().trim().toLowerCase();
      if (user) {
        token.orgId = (user as { orgId?: string }).orgId;
        token.role = (user as { role?: string }).role;
      }
      if (email) {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (dbUser) {
          token.sub = dbUser.id;
          token.orgId = dbUser.orgId;
          token.role = dbUser.role;
        }
      }
      if (account?.provider === 'credentials' && user?.email) {
        token.email = user.email;
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
