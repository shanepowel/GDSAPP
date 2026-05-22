/**
 * NextAuth v4 reads NEXTAUTH_SECRET and NEXTAUTH_URL.
 * Vercel often uses AUTH_SECRET and AUTH_URL — map them here so either works.
 */

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function setIfUnset(key: string, value: string | undefined): void {
  if (!value || process.env[key]) return;
  process.env[key] = stripQuotes(value);
}

function ensureAuthEnv(): void {
  setIfUnset('NEXTAUTH_SECRET', process.env.AUTH_SECRET);
  setIfUnset('NEXTAUTH_URL', process.env.AUTH_URL);

  if (!process.env.NEXTAUTH_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  }
}

ensureAuthEnv();

export function getAuthSecret(): string | undefined {
  return process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
}

export function getAuthUrl(): string | undefined {
  return process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;
}

export function authEnvStatus(): {
  hasSecret: boolean;
  hasUrl: boolean;
  hasDatabase: boolean;
} {
  return {
    hasSecret: Boolean(getAuthSecret()),
    hasUrl: Boolean(getAuthUrl()),
    hasDatabase: Boolean(process.env.DATABASE_URL),
  };
}
