/**
 * NextAuth v4 reads NEXTAUTH_SECRET and NEXTAUTH_URL.
 * Vercel/docs use AUTH_SECRET and AUTH_URL — map them here so either works.
 */
function ensureAuthEnv(): void {
  if (!process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;
  }
  if (!process.env.NEXTAUTH_URL && process.env.AUTH_URL) {
    process.env.NEXTAUTH_URL = process.env.AUTH_URL;
  }
  if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  }
}

ensureAuthEnv();

export function getAuthSecret(): string | undefined {
  return process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
}

export function assertAuthConfigured(): void {
  if (!getAuthSecret()) {
    throw new Error(
      'Missing auth secret: set NEXTAUTH_SECRET or AUTH_SECRET (e.g. openssl rand -base64 32).',
    );
  }
}
