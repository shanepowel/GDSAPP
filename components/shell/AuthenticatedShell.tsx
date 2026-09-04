'use client';

import { DatumAppShell } from '@/components/shell/AppShell';
import { useI18n } from '@/components/app/LocaleProvider';

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { messages } = useI18n();
  return (
    <DatumAppShell accountHref="/profile" accountLabel={messages.nav.profile}>
      {children}
    </DatumAppShell>
  );
}
