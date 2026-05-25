'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Globe } from 'lucide-react';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import { BrandMark } from '@/components/brand/BrandMark';
import { useI18n } from '@/components/app/LocaleProvider';

export function AppShell({
  title,
  children,
  actions,
  standardId,
  orgLabel,
  hideTitle,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  standardId?: 'wales' | 'gds' | string;
  orgLabel?: string;
  hideTitle?: boolean;
}) {
  const { messages: m } = useI18n();
  const { data: session } = useSession();
  const userInitial =
    session?.user?.name?.trim()?.charAt(0) ||
    session?.user?.email?.charAt(0)?.toUpperCase() ||
    '?';
  const standardBadge =
    standardId === 'wales'
      ? 'Wales standard'
      : standardId === 'gds'
        ? 'GDS standard'
        : null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <BrandMark href="/" variant="light" />
          </div>
          <div className="flex items-center gap-3">
            {standardBadge && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1 text-[12px] font-medium text-brand-hover">
                <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {standardBadge}
              </span>
            )}
            <LanguageSwitcher />
            {actions}
            <Link
              href="/profile"
              className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-semibold text-text-inverse hover:opacity-90"
              title={session?.user?.name ?? session?.user?.email ?? m.nav.profile}
              aria-label={m.nav.profile}
            >
              {userInitial}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-container px-6 py-8">
        {!hideTitle && (
          <>
            {orgLabel && (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-hover">
                {orgLabel}
              </p>
            )}
            <h1 className="font-display text-2xl font-semibold text-text md:text-[34px] md:leading-tight">
              {title}
            </h1>
          </>
        )}
        {children}
      </main>
      <footer className="mx-auto max-w-container px-6 py-8 text-xs text-text-muted">
        {m.app.advisoryFooter}
      </footer>
    </div>
  );
}
