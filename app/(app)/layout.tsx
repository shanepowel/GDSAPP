import { AuthenticatedShell } from '@/components/shell/AuthenticatedShell';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
