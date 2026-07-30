'use client';

import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { DesignWorkspace } from '@/components/org-design/DesignWorkspace';
import { useI18n } from '@/components/app/LocaleProvider';

export default function OrgDesignPage() {
  const { messages: m } = useI18n();
  return (
    <AppShell title={m.nav.orgDesign}>
      <AppNav />
      <DesignWorkspace title={m.orgDesign.title} />
    </AppShell>
  );
}
