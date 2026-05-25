/**
 * Single login surface: Microsoft Entra when configured, else email/password.
 * Set AUTH_ALLOW_CREDENTIALS=true to allow both (same email links to one user record).
 */

export type AuthMode = 'entra' | 'credentials' | 'unified';

export function entraConfigured(): boolean {
  return Boolean(
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
      process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET &&
      (process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID ||
        process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER),
  );
}

export function getAuthMode(): AuthMode {
  if (!entraConfigured()) return 'credentials';
  if (process.env.AUTH_ALLOW_CREDENTIALS === 'true') return 'unified';
  return 'entra';
}

export function allowSelfRegistration(): boolean {
  return getAuthMode() === 'credentials';
}

/** Client-visible auth flags (safe to expose). */
export function getPublicAuthConfig() {
  const mode = getAuthMode();
  return {
    mode,
    entraEnabled: entraConfigured(),
    allowRegister: allowSelfRegistration(),
    singleLoginService: mode !== 'credentials',
  };
}
