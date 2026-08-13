'use client';

import { usePathname } from 'next/navigation';
import { DatumAppShell, ENGAGEMENT_COOKIE, type EngagementContext } from '@/components/shell/AppShell';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';
import type { MaturityLevel } from '@/lib/playbook/keel';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1] ?? null;
}

function toContext(e: {
  id: string;
  name: string;
  phase: string | null;
  maturityLevel?: string | null;
  standardId?: string | null;
  catalogName?: string | null;
}): EngagementContext {
  const standards = [e.catalogName, e.standardId === 'wales' ? 'Wales DSS' : e.standardId === 'gds' ? 'GDS' : null]
    .filter((v, i, a): v is string => Boolean(v) && a.indexOf(v) === i);
  return {
    id: e.id,
    name: e.name,
    phase: e.phase ?? 'discovery',
    standards: standards.length ? standards : ['—'],
    maturityLevel: (e.maturityLevel as MaturityLevel) ?? 'practising',
  };
}

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { messages } = useI18n();
  const { data } = trpc.engagement.list.useQuery();

  const fromPath = pathname.match(/^\/(?:squads|assurance|engagements)\/([^/]+)/)?.[1];
  const cookieId = readCookie(ENGAGEMENT_COOKIE);
  const selectedId = fromPath ?? cookieId ?? data?.[0]?.id;

  const contexts = (data ?? []).map((e) =>
    toContext({
      id: e.id,
      name: e.name,
      phase: e.phase,
      maturityLevel: (e as { maturityLevel?: string }).maturityLevel,
      standardId: e.standardId,
    }),
  );
  const engagement = contexts.find((e) => e.id === selectedId) ?? contexts[0];

  return (
    <DatumAppShell
      engagement={engagement}
      engagements={contexts}
      accountHref="/profile"
      accountLabel={messages.nav.profile}
    >
      {children}
    </DatumAppShell>
  );
}
