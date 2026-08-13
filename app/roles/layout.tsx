import { DatumAppShell } from '@/components/shell/AppShell';

export default function RolesLayout({ children }: { children: React.ReactNode }) {
  return <DatumAppShell showDemoContext>{children}</DatumAppShell>;
}
