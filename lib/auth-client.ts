/** Client-safe auth flags (mirrors server getPublicAuthConfig when NEXT_PUBLIC_* set). */
export function getClientAuthConfig() {
  const entraFlag = process.env.NEXT_PUBLIC_ENTRA_ENABLED === 'true';
  const allowCreds = process.env.NEXT_PUBLIC_AUTH_ALLOW_CREDENTIALS === 'true';
  const mode = entraFlag ? (allowCreds ? 'unified' : 'entra') : 'credentials';
  return {
    mode: mode as 'entra' | 'credentials' | 'unified',
    entraEnabled: entraFlag,
    allowRegister: mode === 'credentials',
    singleLoginService: mode !== 'credentials',
  };
}

/** @deprecated Use getClientAuthConfig().entraEnabled */
export function entraSignInEnabled(): boolean {
  return getClientAuthConfig().entraEnabled;
}
