'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { BrandMark } from '@/components/brand/BrandMark';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import { useI18n } from '@/components/app/LocaleProvider';
import { EngagementPlateProvider, TitleBlock } from '@/components/product/TitleBlock';
import { EngagementRail } from '@/components/product/EngagementRail';
import { EvidenceChainProvider } from '@/components/chain/EvidenceChainRail';
import { trpc } from '@/lib/trpc/client';

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

export function EngagementPlate({
  engagementId,
  children,
}: {
  engagementId: string;
  children: React.ReactNode;
}) {
  const { messages: m } = useI18n();
  const { data: session } = useSession();
  const { data } = trpc.engagement.byId.useQuery({ id: engagementId });
  const { data: assess } = trpc.standards.assessList.useQuery(
    { engagementId },
    { enabled: !!data },
  );

  const userInitial =
    session?.user?.name?.trim()?.charAt(0) ||
    session?.user?.email?.charAt(0)?.toUpperCase() ||
    '?';

  const primary = assess?.criteria[0];
  const standardLabel = primary
    ? `${primary.standardName} v${primary.standardVersion}`
    : data?.standardId === 'wales'
      ? 'Wales DSS'
      : data?.standardId === 'gds'
        ? 'GDS Service Standard'
        : '—';

  const titleData = {
    reference: data?.reference ?? '—',
    standardLabel,
    phase: (data?.phase ?? assess?.phase ?? 'discovery').replace(/^./, (c: string) =>
      c.toUpperCase(),
    ),
    revision: data?.revision ?? 'A',
    preparedBy: session?.user?.name?.trim() || session?.user?.email || '—',
    dateLabel: formatDate(new Date()),
    serviceName: data?.serviceName ?? data?.name,
  };

  return (
    <EngagementPlateProvider engagementId={engagementId}>
      <EvidenceChainProvider>
      <div className="min-h-screen bg-stock-1 text-ink-0">
        <header className="flex h-14 items-center justify-between gap-4 border-b border-rule bg-stock-0 px-4 md:px-6">
          <div className="flex items-center gap-6">
            <BrandMark href="/" variant="light" />
            <Link
              href="/engagements"
              className="hidden text-[13px] font-medium text-ink-1 hover:text-ink-0 sm:inline"
            >
              {m.nav.engagements}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/profile"
              className="grid h-9 w-9 place-items-center text-sm font-semibold text-text-inverse"
              style={{ background: 'var(--brand)', borderRadius: 'var(--radius)' }}
              title={session?.user?.name ?? session?.user?.email ?? m.nav.profile}
              aria-label={m.nav.profile}
            >
              {userInitial}
            </Link>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1440px] flex-col md:flex-row">
          <EngagementRail engagementId={engagementId} />
          <div className="min-w-0 flex-1 px-4 py-6 md:px-8">
            <div className="mb-4">
              <TitleBlock data={titleData} />
            </div>
            <div
              className="mb-6 h-[2px] bg-ink-0"
              style={{ height: 'var(--plate-w)' }}
              aria-hidden
            />
            <div className="max-w-[1200px]">{children}</div>
          </div>
        </div>

        <footer className="mx-auto max-w-[1440px] px-4 py-8 text-xs text-ink-2 md:px-8">
          {m.app.advisoryFooter}
        </footer>
      </div>
      </EvidenceChainProvider>
    </EngagementPlateProvider>
  );
}
