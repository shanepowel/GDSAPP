import { AppShell } from '@/components/assemble-v2';

/** Every signed-in v2 screen sits inside the AppShell (sidebar, Ask Assemble, user). */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
