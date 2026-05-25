/** Client-safe Entra button visibility (set NEXT_PUBLIC_ENTRA_ENABLED=true when SSO is configured). */
export function entraSignInEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENTRA_ENABLED === 'true';
}
